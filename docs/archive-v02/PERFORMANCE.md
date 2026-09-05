# Wydajność v0.2 — pomiar i ograniczenia

## Co mierzą wskaźniki

FPS = 1000 / średni odstęp rzeczywistych klatek requestAnimationFrame. Czas klatki uwzględnia
oczekiwanie, harmonogram przeglądarki i ograniczenia GPU. Nie jest czystym czasem CPU.
Pierwsze próbki po wejściu/wznowieniu są okresem rozgrzewki; do oceny obserwuj stabilny odcinek.

CPU w overlay = zmierzona praca pętli aplikacji na głównym wątku. To nie użycie wszystkich
rdzeni, nie cały koszt procesu Chromium i nie czas pracy przeglądarkowych workerów GPU.
Osobno pokazywane są symulacja/audio i CPU wywołań renderera. Pomiary obejmują koszty JS
oraz ewentualne synchroniczne opóźnienia API. CPU i GPU mogą się nakładać, nie należy ich sumować.

GPU = opcjonalne EXT_disjoint_timer_query_webgl2 obejmujące scene.render. Wynik nanosekund
jest przeliczany na ms, pobierany asynchronicznie po udostępnieniu przez przeglądarkę.
Próbkowanie co 4 render, maksymalnie 4 oczekujące query i średnia ostatnich 20 wyników.
Disjoint, utrata kontekstu i stara próbka usuwają wynik; brak extension wyświetla brak timera.
Nie ma gl.finish ani zastępowania GPU czasem CPU/FPS. Gdy overlay GPU i F3 są wyłączone,
query nie są wysyłane. Pauza i dispose czyszczą kolejkę.

CPU/klatka: bufor do 180 próbek, średnia i p95 publikowane do 4 Hz. GPU ma własne okno
próbek — obie liczby nie muszą opisywać dokładnie tych samych klatek.

## Scenariusz A/B

**To test programowego renderera, NIE fizycznego GPU i NIE deklaracja docelowego FPS.**
Chromium 144.0.7559.96 / ANGLE SwiftShader, Linux, Xvfb. Widok 1280×720, Medium, skala 1.
Procesy A/B uruchamiano kolejno, bez równoległych innych testów przeglądarkowych.
Podstawą jest niezmienione archiwum v0.1 oraz źródła v0.2. Ten sam seed, pozycja kamery,
wejścia i liczba jednostek. Każdy przebieg: 10 klatek rozgrzewki, 45 próbek, krok symulacji
1/60 s na mierzoną klatkę. FPS jest realnym tempem renderowania, lecz nie jest to test
upływu czasu normalnej gry przy bardzo niskim FPS.

Scena pierwsza: pozycja startowa (1,3), spojrzenie naprzód. Scena druga: odebranie rozkazu,
25 s identycznej symulacji, pozycja widoku (-8,29), aktywna walka. Test bez HUD mierzy
CPU tick + render submission. Nie jest identyczny z szerszym CPU overlay aplikacji.

| Scena | Wersja | Śr. klatka ms | p95 klatki ms | FPS | Śr. CPU ms | p95 CPU ms | Draw calls | Trójkąty / klatkę |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| Start w okopie | v0.1 | 479.24 | 516.60 | 2.09 | 3.67 | 4.60 | 93.0 | 393,518 |
| Start w okopie | v0.2 | 365.54 | 416.60 | 2.74 | 5.64 | 20.90 | 142.0 | 293,324 |
| Walka po 25 s | v0.1 | 380.72 | 766.60 | 2.63 | 24.28 | 9.50 | 84.7 | 357,147 |
| Walka po 25 s | v0.2 | 284.43 | 533.30 | 3.52 | 5.62 | 7.80 | 129.8 | 238,440 |

Licznik trójkątów obejmuje aktywne indeksy renderera, także ponowne rysowanie do cieni;
nie jest liczbą unikatowych trójkątów całej mapy. Draw calls są różnicą liczników przed i po
jednym renderze, a nie skumulowanym licznikiem od uruchomienia gry.

## Wniosek i koszt kompromisu

W tym konkretnym teście średni czas klatki spadł o 23.7% i 25.3%,
a liczba renderowanych trójkątów o 25.5% i 33.2%.
Nie przenosimy tych procentów na RTX/Intel/AMD ani Firefox.

**CPU nie poprawiło się w każdym scenariuszu.** Na starcie średnia wzrosła z 3,67 do 5,64 ms,
a liczba draw calls z 93 do 142. Podział przestrzenny daje lepszy culling, lecz kosztuje
więcej wywołań. W próbie walki średnia CPU v0.1 jest silnie podbita pojedynczą długą próbką:
p95 wynosi 9,5 ms przy średniej 24,28 ms. Nie przedstawiamy różnicy tych średnich jako
wiarygodnej obietnicy kilkukrotnego przyspieszenia CPU. Surowe próbki zachowano bez odrzucania
odstających wyników w `v0.2-tests/benchmark-ab.json`.

Próba rozmiaru regionu 24 m miała 236 draw calls na starcie; końcowe 48 m zmniejsza ten
narzut do 142, kosztem nieco większej liczby trójkątów. Dane eksperymentu 24 m zachowano
w `benchmark-24m.json` i nie mieszano ich z końcową tabelą. Następny etap to profil
fizycznego sprzętu i sprawdzenie tego kompromisu, a nie automatyczne zmniejszanie regionów.

## Co zmieniono

- Autentyczne LOD postaci: detale blisko, około 1,5 tys. trójkątów daleko; bez redukcji NPC.
- Statyczna geometria i teren w regionach 48 m; macierze/bounds statycznych meshów nie są
  liczone co klatkę. Teren nadal ma te same wysokości i kolizje.
- Lokalne cienie: Medium 30 m/1024, High 48 m/2048, Low bez cieni. Trawa i cienki drut nie
  są kosztownymi casterami. Jest to świadoma różnica jakości ustawień, nie darmowa optymalizacja.
- Jeden aktywny klip na postać, odległe animacje próbkowane rzadziej. v0.1 w benchmarku
  walki miała średnio 1014,6 aktywnego celu animacji, v0.2 utrzymuje 532 (28 × 19 kości).
- Pooling efektów i ograniczone aktualizacje HUD; geometryczne źdźbła trawy to dwa trójkąty.
- Brak nowej destrukcji, nowych misji lub usuwania kolizji/AI jako sposobu zawyżenia wyniku.

## Odtworzenie

```bash
xvfb-run -a python tools/benchmark_v02.py --baseline /path/to/v0.1.0 --samples 45
```

Skrypt wymaga opcjonalnych narzędzi opisanych w README. Domyślnie używa SwiftShader,
by odtworzyć przedstawione pomiary. Do realnego odbioru na własnym GPU uruchom normalnie grę,
włącz wskaźniki i zanotuj GPU, CPU, przeglądarkę, rozdzielczość, skalę, preset oraz scenariusz.
Nie porównuj FPS menu z walką ani F3 z wyłączoną diagnostyką bez uwzględnienia jej kosztu.
