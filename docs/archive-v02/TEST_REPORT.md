# Raport testów — Ziemia Niczyja v0.2.0

Raport dotyczy poprawki pięciu zgłoszonych obszarów na bazie dostarczonego archiwum v0.1.
Nie oznacza ukończenia całego master promptu. Oryginalnej paczki nie zmieniano; nie
utworzono branchy ani worktree, nie wykonywano push/deploy ani publikacji.

## Środowisko i ograniczenia metody

Node.js v22.16.0, Python, Playwright
1.57.0, Linux, Chromium **144.0.7559.96**,
WebGL2 przez **ANGLE SwiftShader — renderer programowy**, Xvfb.

Polityka przeglądarki w środowisku roboczym blokowała normalną nawigację URL. Testy graficzne
wczytują rzeczywisty index.html, moduły, modele i tekstury przez routing Playwright do
lokalnego base URL. To prawdziwy renderer Babylon i prawdziwe zdarzenia myszy/klawiatury,
nie mock renderera. Dokument ma jednak **opaque origin**, zatem test nie potwierdza
trwałego IndexedDB po zamknięciu karty ani działania na normalnym publicznym hostingu.
Osobne testy serwera HTTP sprawdzają prawdziwe odpowiedzi dokumentu, JS i GLB.

**Firefox nie został wykonany.** Próba instalacji zakończyła się błędem DNS/sieci
(`v0.2-tests/firefox-install.log`). Brak osobnego testu Edge/Safari i fizycznego RTX/Intel/AMD.
Nie deklarujemy 60 FPS ani identycznej poprawy na komputerze użytkownika.

## Wyniki automatyczne

| Obszar | Wykonanie | Wynik |
|---|---|---|
| Instalacja | `npm ci`, brak zewnętrznych zależności npm | Exit 0 |
| Testy jednostkowe/integracyjne | `npm test` | **63/63, 0 błędów, 0 pominiętych** |
| Składnia i zasoby | `npm run check` | 41 JS/MJS, względne importy i 8 poprawnych kontenerów GLB |
| Logika pełnej misji | `node tools/autoplay.mjs` | Faza 6, dwa checkpointy, brak duplikacji NPC, drugi czołg unieruchomiony |
| Regresje źródeł | `browser_v02_regression.py` | PASS; brak nieobsłużonych błędów JS i brakujących zasobów |
| Regresje produkcyjnego dist | `browser_v02_regression.py --dist --prefix=test-repo` | PASS pod podkatalogiem; te same wejścia, layout, modele, niebo i diagnostyka |
| Cykl życia źródeł | `browser_smoke.py --cycles 10` | 10/10 wejść i wyjść; 0 silników, scen i aktywnych źródeł dźwięku po każdym wyjściu |
| Cykl życia dist pod /test-repo/ | `browser_smoke.py --dist --prefix=test-repo --cycles 2` | 2/2, 0 aktywnych silników/scen/audio po wyjściu; celowe 404 ma obsługę |
| Build statyczny | `npm run build` | Zbudowane lokalne moduły, zasoby i dokumentacja; wersja manifestu 0.2.0 |

Surowe pliki: `unit-final.txt`, `check-final.txt`, `npm-ci.txt`, `autoplay-final.txt`,
`regression-source.json`, `regression-dist.json`, `lifecycle/source.json` i logi
w `docs/v0.2-tests/`. Wyniki v0.1 zachowano osobno w `docs/test-results/`.

## 1. Wejście myszy

W v0.1 **nie odtworzono braku strzału w Chromium**: prawy przycisk ustawił ADS, lewy
zmniejszył magazynek do 9. Odtworzono natomiast zdarzenia chorded: wciśnięcie LPM przy
trzymanym PPM przychodzi jako pointermove z maską buttons=3. Oryginalny input opierał się
na compatibility Mouse Events i konkurował z obsługą Babylon, która anulowała zdarzenia.
To ryzyko naprawiono; nie jest to dowód konkretnej przyczyny na Firefox użytkownika.

Nowe testy obejmują brak compatibility mousedown, oba przyciski naraz, brak podwójnego
strzału po Mouse Events, kliknięcie pomiędzy krokami, pause/blur/pointercancel, brak blokady
kursora oraz API Pointer Lock zwracające Promise lub void. Rzeczywista przeglądarka sprawdziła:

- PPM → LPM: ADS aktywne, strzał zużywa nabój, zwolnienie LPM nie wyłącza ADS.
- LPM → PPM: strzał działa, dołączenie PPM włącza ADS.
- Escape przy trzymanym PPM: pauza zatrzymuje czas i czyści wejście; po wznowieniu brak
  odziedziczonego celowania albo samoczynnego strzału.
- Odtworzenie checkpointu: 28 NPC bez duplikacji; PPM + LPM działa ponownie.
- Utrata fokusu: pauza i wyzerowanie wciśnięć; odmowa/timeout blokady mają jawny błąd.

To potwierdza działanie w przebadanym Chromium, nie zakończony odbiór Firefox.

## 2. Menu

Bazowy ekran `.screen` miał w viewport 1280×720 rozmiar scroll 1417×783. W v0.2
scrollWidth/scrollHeight są równe clientWidth/clientHeight we wszystkich ośmiu próbach:
**320×568, 390×844, 800×400, 1024×600, 1280×720, 1366×768, 1920×1080, 2560×1440**.
Sprawdzono położenie i hit-test każdego przycisku menu, przewijanie kółkiem i dostęp do
przycisku powrotu z ustawień. Panel długich ustawień przewija się wewnętrznie — to zamierzone.
Nie oznacza to implementacji dotykowego sterowania grą.

## 3. Niebo i presety

Usunięto cylinder z płaskim, zdegenerowanym UV deklem. Test jednostkowy sprawdza pełną
sferę, prawidłowe położenia/normalne/UV, a renderer pokazuje nowe niebo bez pasów ze zgłoszenia.
Zapisano cztery kierunki, w tym zenit i obroty o 90/180/270 stopni; jasność próbek odrzuca
błąd białej emisji. Zrzuty były także oglądane wizualnie.

Po wczytaniu misji przełączono **Medium → High → Low**, wykonując prawdziwe rendery.
Rozmiar mapy cieni wynosi odpowiednio 1024, 2048 i brak mapy; liczba jednostek nadal 28,
a suma aktywnych LOD także 28. Brak nieobsłużonych błędów JS; wygląd renderów sprawdzono na zrzutach. Zrzuty
`quality-*.png` pokazują wynik; nie są benchmarkiem kosztu tych presetów.

## 4. Modele i animacje

Nowe `british.glb` oraz `german.glb` mają trzy odrębne skinned LOD, materiały albedo/normal/ORM,
19 kości i 13 klipów. Testy sprawdzają poprawność GLB, atrybuty, budżety, normalne,
normalizację kwaternionów, zakresy wierzchołków i sumy wag skinningu. Przy imporcie
naprawiono również zerowe normalne generowane przez nakładające się przeciwne powierzchnie.

W scenie każdy NPC ma dokładnie jeden widoczny LOD. Próbkowanie animacji respektuje FPS
klipu. 20 wymuszonych zmian działania utrzymało liczbę aktywnych celów animacji **532**,
zamiast akumulować kolejne grupy. Są to 28 postaci × 19 animowanych celów, nie liczba NPC.
Przegląd modeli wykonano w neutralnej galerii i na polu bitwy; obrazy pochodzą z rzeczywistych
GLB, nie z osobnej ilustracji. Szczegóły, źródła mundurów i ograniczenia: CHARACTER_ART.md.

## 5. Pomiary, pooling i wydajność

W prawdziwym Chromium timer GPU zwrócił wynik `ready`, dodatnią wartość ms i ograniczoną
liczbę oczekujących query. Nie wyliczano GPU z FPS. Testy jednostkowe sprawdzają brak
extension, opóźnioną dostępność wyniku, konwersję ns→ms, disjoint i usuwanie query.
Wyłączenie wszystkich opcji chowa mały overlay i zatrzymuje GPU query; F3 działa niezależnie.
CPU jest rzeczywistym pomiarem pracy aplikacji, nie całym czasem klatki.

250 zdarzeń wybuchu nie przekroczyło limitów wizualnych pul: 48 obiektów pyłu i 20 błysków.
Po upływie czasu obiekty wróciły do puli. Kolejne użycie ponownie wykorzystuje istniejącą
geometrię. Nie usunięto logiki obrażeń, nawet gdy pula efektów jest pełna.

A/B przy 1280×720 / Medium / scale 1, po 10 klatkach rozgrzewki i 45 próbkach, wykazało
**23,7% krótszy średni czas klatki na starcie i 25,3% w walce** na SwiftShader.
Renderowane trójkąty zmniejszyły się o 25,5% i 33,2%. Pełne liczby w PERFORMANCE.md.
**Koszt CPU na starcie wzrósł**, podobnie jak draw calls. Nie ukryto tego kompromisu ani
pojedynczej długiej próbki CPU bazowego testu walki. Nie jest to pomiar sprzętowego GPU.

## 6. Misja, cykl życia i przypadki błędne

Bot przeszedł lokalne zadanie w 121,88 s czasu symulacji, używając normalnych wejść ruchu,
strzału, przeładowania i interakcji. Jest wszechwiedzącym botem testowym na Rekrucie, nie
człowiekiem i nie pomiarem projektowanej długości misji. MG może zostać wyeliminowane przez
sojuszników przed dojściem gracza; wtedy etap przeskakuje zgodnie z warunkiem zadania.
Nie jest to błąd pominiętego celu. Odtworzono checkpointy „Punkt sanitarny” i „Przed kontratakiem”.

W 10 cyklach wejście → gra → pauza → menu po każdym wyjściu pozostało 0 Engine.Instances,
0 scen oraz 0 aktywnych źródeł dźwięku. Po kontrolowanym GC heap JS wynosił od
9.14 do 12.66 MiB, w ostatnim cyklu 9.65 MiB.
Brak monotonicznego narastania w tej próbie nie dowodzi braku wszystkich wycieków VRAM
lub problemów po wielogodzinnej grze.

Celowo zwrócone 404 dla british.glb pokazało czytelny błąd z możliwością powrotu do menu.
Nie było innych brakujących zasobów, nieobsłużonych błędów JS ani zewnętrznych żądań runtime.
Zmiana przypisania klawisza, reset przypisań i pauza po blur zostały wykonane w przeglądarce.

## Czego nie zaliczono

Fizyczne GPU i docelowy FPS; Firefox/Edge/Safari; prawdziwy hosting i trwały zapis między
sesjami na normalnym originie; zdalny GitHub Pages workflow; kompletna pięciomisyjna kampania;
końcowa jakość modeli, animacji, dźwięku i balans 12–20 minut. Kod był przeglądany lokalnie,
bez niezależnego zewnętrznego recenzenta. Stan ograniczeń jest częścią dostawy, nie ukrytym
założeniem, że testy jednostkowe oznaczają ukończenie całej gry.
