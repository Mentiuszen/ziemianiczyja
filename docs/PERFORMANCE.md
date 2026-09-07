# Wydajność 0.4.5

## Co zostało zmierzone

Node.js 22.16.0, trzy przebiegi tego samego scenariusza: seed 112017, Rekrut,
900 kroków po 1/60 s, takie same wejścia bota. To **czasy kroku symulacji na CPU**,
nie czas renderowanej klatki, nie pomiar GPU i nie dowód działania 165 Hz.
Harmonogram wykonywania ścieżek różni się między wersjami, więc nie zakładamy
bitowej identyczności wszystkich pośrednich stanów AI ani przedstawianych klatek.

| Próba | Wersja | Średnia ms | p95 ms | p99 ms | Maksimum ms |
|---:|---|---:|---:|---:|---:|
| 1 | baza 0.4.4 | 1.708 | 2.760 | 5.369 | 46.743 |
| 1 | 0.4.5 | 1.634 | 2.752 | 4.191 | 21.138 |
| 2 | baza 0.4.4 | 1.488 | 2.060 | 2.972 | 42.537 |
| 2 | 0.4.5 | 1.465 | 2.501 | 3.634 | 11.216 |
| 3 | baza 0.4.4 | 1.485 | 2.088 | 3.280 | 37.945 |
| 3 | 0.4.5 | 1.349 | 1.997 | 2.686 | 3.343 |

Najdłuższe skoki są mniejsze; średnie są podobne lub niższe. **p95 i p99 nie poprawiły
się w każdej próbie**. Krótkie okno, JIT, GC i harmonogram systemu wpływają na wynik.
Nie obiecywać na tej podstawie spadku p99 renderu na fizycznym GPU.

Źródła pomiaru: `validation/v045/cpu-base.json`, `cpu-v045.json`.
Narzędzie: `node tools/benchmark_v045.mjs <katalog źródeł> <wynik.json>`.
Pomiar dodatkowych synchronicznych ścieżek w raporcie dotyczy API narzędziowego;
runtime używa `processBudget`, a nie `path()` wykonywanego w całości.

## Zmienione mechanizmy

A* ma kopiec i tablice robocze wielokrotnego użytku. Runtime ma budżet 32 jednostek
pracy na tick; rozwinięcie węzła z niewyliczonymi krawędziami kosztuje 8, z cache 1.
To limit pracy, nie twarda gwarancja czasu w milisekundach. Zachowano sprawdzanie
przeszkód i anulowanie generacji. Otwarcie drutu unieważnia jedynie pobliskie krawędzie.

Prezentacja interpoluje transformacje, symulacja pozostaje 60 Hz. Ruch myszy jest
podglądany bez zużycia delty przed kolejnym tickiem; tick korzysta z tej samej walidacji
obrotu. Wygładzanie oka/FOV używa czasu prezentacji. Krytyczne dane walki pozostają
wyłącznie w symulacji. HUD nie mierzy całej geometrii przy każdym renderze.

## Jak czytać F3

Podstawą są p95/p99 **czasu klatki**. `1000/frameP99` jest odpowiednikiem FPS dla tego
percentyla, nie średnią „1% low”. Literalne FPS p95/p99 opisują szybki ogon i są pokazane
oddzielnie. Próbki CPU zawierają mierzoną pracę aplikacji między renderami; RAF ma osobny
szereg. Koszt profilera jest dopisywany do próbki CPU po zakończeniu obliczeń.

GPU pochodzi wyłącznie z ważnych wyników zapytania WebGL2, asynchronicznie i z ID klatki.
Nie obejmuje CSS/DOM/kompozytora. `—` oznacza brak danych. Nie dodawać CPU + GPU do klatki.
Okno metryk to do 10 s, publikacja co 250 ms. p99 wymaga 100 próbek, <1000 wywołuje
informację o małej próbie. Wykres pokazuje ostatnie maksymalnie 240 renderów.

F3/F4/F6/F7: panel/reset/rejestracja-stop/JSON. Bufory rejestracji: 65536 klatek,
65536 RAF, 32768 GPU; przy przekroczeniu zachowywany jest najnowszy zakres, a eksport
ma `truncated:true`. Rejestracja jest jawna; nie uruchamia się przez samo pokazanie FPS.
Domyślny budżet jest szacowany z mediany RAF i limitu; znaną częstotliwość celu można
zadeklarować `ZiemiaNiczyja.diagnostics.setTargetHz(165)`.

## Odbiór sprzętowy

Na tej samej maszynie i wersji przeglądarki porównać bazę i aktualizację, te same
ustawienia, rozdzielczość, trasę i stan misji. Oddzielić 30 s rozgrzania; następnie
rejestrować 60–120 s w odprawie, walce, przy wybuchu, otwieraniu drutu i obronie telefonu.
Sprawdzić 60/120/144/165/240 Hz, dostępne fizycznie tryby, cap 0 i cap zgodny z monitorem.
Powtórzyć przy F3 wyłączonym i włączonym. Zmiany ustawień, pauzy i ładowania to granice
sesji, nie próbki gry. Eksport ujawnia brak GPU, małą próbę i obcięcie bufora.

---
## Historyczny raport 0.4.0 (nie wyniki 0.4.5)

# Wydajność i limiter — v0.4.0

## Zakres wykonanych pomiarów

**Nie wykonano sprzętowego benchmarku v0.4 ani porównania A/B v0.3/v0.4.** Relacja
użytkownika o 165 FPS na Ultra dotyczy v0.3. Nie jest podstawą do obietnicy utrzymania
165 FPS w v0.4. Historyczne wyniki v0.3/v0.2 pozostają w `archive-v03/PERFORMANCE.md`;
nie należy przypisywać ich nowej wersji.

Nowa wersja ma 38 żołnierzy na mapie (12 UK + 26 DE): dotychczasową obsadę 28,
dwuosobową obsługę działa i osiem jednostek rezerwy istniejących od początku. Dowódca
i grupa odprawy korzystają z części dotychczasowej obsady. Dodatkowe systemy to artyleria,
przeloty, napisy i ruch czołgów. Nie formułujemy ogólnego wniosku o wzroście/spadku
wydajności bez kontrolowanego pomiaru tych samych scen.

Testy wykonane na Chromium 144.0.7559.96 / SwiftShader miały przede wszystkim wykrywać
błędy renderera, wejścia, limitera i sprzątania. Oprogramowanie udające GPU zużywa CPU;
nie jest reprezentatywne dla RTX/AMD/Intel. Nie powtarzano pomiaru na Firefoxie.

## Jak działa limit

Ustawienie `maxFps`: 0 oznacza brak ograniczenia aplikacji, wartości 1–360 oznaczają
maksymalną częstotliwość renderowania. Interfejs podpowiada 30/60/90/120/144/165/240;
można wpisać wartość własną. Ustawienie nie wyłącza synchronizacji przeglądarki.
Nie dodano pozornego przełącznika VSync OFF.

Symulacja i audio aktualizują się w każdym wywołaniu requestAnimationFrame, a nie tylko
przy renderze. Render zostaje pominięty do kolejnego terminu. Limiter zachowuje ułamkowe
terminy, zamiast obcinać 60 do 55 FPS przy 165 Hz. Nie generuje serii zaległych renderów
po powrocie do karty; pauza i zmiana capu zerują termin. Limit powyżej rytmu przeglądarki
nie tworzy dodatkowych widocznych klatek. Przy wartości niebędącej dzielnikiem odświeżania
odstępy klatek mogą być nierówne — średni cap nie jest gwarancją idealnego frame pacingu.

FixedClock ma krok 1/60 s i maksymalnie pięć zaległych kroków w jednej klatce RAF.
To zabezpieczenie przed spiralą przeciążenia, **nie gwarancja nadrobienia czasu przy
bardzo niskiej wydajności**. Rozdzielenie renderu od symulacji nie usuwa blokowania CPU
przez sterownik/przeglądarkę. Przy dobrym sprzęcie cap nie spowalnia samej gry, ale przy
przeciążeniu czas symulacji może odstawać od zegara, co widać w próbie programowej.

## Wyniki funkcjonalne limitera

Test `v04-framerate.test.mjs` użył 24 kombinacji: RAF 60/165/240 Hz, limity
0/30/60/90/120/144/165/240, po 6 s. Wszystkie przeszły z tolerancją <1 FPS oraz prawidłowym
clampem do częstotliwości źródłowej. Osobno sprawdzono zmianę capu i powrót po 10 s przerwy.

| Próba Chromium / SwiftShader | Żądany cap | Zmierzony FPS | Czas zegara | Postęp symulacji |
|---|---:|---:|---:|---:|
| źródła | 1 | 1,127 | 6,209 s | 4,167 s |
| dist pod `/test-repo/` | 1 | 0,966 | 6,209 s | 4,033 s |

To krótkie okna funkcjonalne, nie długookresowa precyzja limitera. Na ich wynik wpływa
faza pomiaru i obciążenie renderera. Test używa 1 FPS, ponieważ SwiftShader nie zapewnia
w tej scenie płynnego renderowania nawet przy Low. Ważny warunek: liczba kroków symulacji
jest znacznie większa niż maksymalna wynikająca z aktualizacji wyłącznie przy renderze.
Nie stosowano `setTimeout` do udawania większej liczby rzeczywistych klatek.

## Co pokazują wskaźniki

FPS/czas klatki: faktycznie wykonane rendery. CPU: praca aplikacji na głównym wątku,
obejmująca pominięte rendery między wyświetlanymi klatkami, nie procent zajęcia całego CPU.
F3 rozdziela pracę symulacji/audio oraz wysłanie renderu. GPU: opcjonalny asynchroniczny
timer WebGL2; brak/disjoint/oczekiwanie nie są zamieniane na 0 ms. CPU i GPU nakładają się
w czasie, więc nie należy dodawać ich mechanicznie do długości klatki.

Próba dist zwróciła timer gotowy z wynikiem około 491,95 ms, a overlay w innym krótkim
oknie pokazywał 2 FPS i 31,37 ms CPU. Są to telemetrie testu programowego, **nie wyniki
referencyjnego komputera**; różne okna metryk nie są zsynchronizowaną próbą benchmarkową.
Surowe dane: `v0.4-tests/regression-source.json` i `regression-dist.json`.

## Zachowane ograniczenia kosztu i presety

Wspólne materiały, grupowanie statycznej geometrii, indeks kolizji, bufor tras i jego
unieważnianie po zniszczeniu drutu, trzy LOD postaci, rzadsze odległe animacje, ograniczone
pule efektów i skończone lotnictwo. Culling/quality nie wyłączają przeciwników ani kolizji.
To mechanizmy ograniczania kosztów, nie dowód niezmienionej wydajności całej gry.

| Preset | Cienie | Promień | Normal mapy | Anizotropia | LOD m | Dekoracje m | Efekty |
|---|---|---|---|---|---|---|---|
| Low | brak | 0 | nie | 2 | 12 / 36 | 38 | 72 |
| Medium | 1024² | 32 | tak | 4 | 20 / 54 | 64 | 128 |
| High | 2048² | 48 | tak | 8 | 30 / 78 | 92 | 208 |
| Ultra | 4096² | 64 | tak | 16 | 42 / 105 | 130 | 320 |

Skala renderowania pozostaje osobna. Nie dodano ray tracingu ani obiecanych, lecz
niezaimplementowanych efektów post-process. Modeli i systemów wymaganych do rozgrywki
nie usuwa się po przejściu na Low.

## Kolejny pomiar na normalnym komputerze

Uruchomić nową misję na tej samej rozdzielczości i skali, włączyć FPS/CPU/GPU oraz F3,
porównać odprawę, otwieranie drutu, starcie z działem i obronę telefonu. Rejestrować średnią,
p95 i dłuższe przycięcia, nie tylko maksymalny FPS. Powtórzyć z capem 0,60,120,165.
GPU niedostępne traktować jako brak danych. Przed przypisaniem regresji zmianom uruchomić
wersję v0.3 w osobnym folderze z identyczną przeglądarką i ustawieniami.
