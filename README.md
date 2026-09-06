# Ziemia Niczyja / No Man’s Land — v0.4.4, rewizja 3

Jednoosobowy FPS przeglądarkowy z I wojny światowej. Nadal dostępna jest **jedna misja:
04, „Pęknięta linia” — Cambrai, 20 listopada 1917**. Pozostałe rozdziały są kontekstem
kampanii, nie nowymi grywalnymi poziomami.

## Rewizja 3 — poprawki funkcjonalne, tła nadal R2

Wydanie ma numer **0.4.4**; `ZiemiaNiczyja.uiRevision === 3`.
English otrzymuje nazwę **No Man’s Land**, osobne logo oraz tytuł karty i opis projektu.
Trudność nie występuje w Opcjach: wybiera się ją na ekranie Nowej kampanii lub zmienia
w Kontynuacji kampanii. Zmiana w kontynuacji zapisuje nowy profil razem z checkpointem,
bez resetu stanu misji. Front i strzałki przechodzą płynnie między datami rozdziałów.

**Regeneracja teł wysokiej rozdzielczości nie jest ukończona.** Nadal używane są
niskorozdzielcze źródła R2; tej paczki nie traktować jako pełnego odbioru R3.

Instrukcja: `INSTALL_0_4_4_R3.md`. Raport: `docs/V0_4_4_R3_IMPLEMENTATION.md`.
Przeglądarkowy odbiór na rzeczywistym HTTP:

```sh
python tools/browser_v044_r3.py --url http://127.0.0.1:5173/ --headed --game
```

## Menu i kampania 0.4.4

Przy pierwszym uruchomieniu wybierz **English** (USA/UK) lub **Polski**. Flagi są bez
ramek, wybór zostaje zapamiętany. Język można później zmienić w Opcjach, także z pauzy.

Menu główne: **Kontynuuj kampanię, Nowa kampania, Opcje, O projekcie i zasobach**.
Nie zawiera już dossier misji ani górnego/dolnego paska. Continue otwiera mapę i pozwala
wznowić istniejący checkpoint. New otwiera podgląd z animowanym przejściem Ypres→Cambrai;
przycisk Pomiń jest dostępny od początku. Sam podgląd nie usuwa wcześniejszego zapisu.
Potwierdzenie zastąpienia pojawia się dopiero po wyborze rozpoczęcia nowej misji.

Mapa kampanii łączy rzeczywistą geografię z autorskimi **datowanymi schematami frontu**,
nie digitalizacją dokładnej dziennej linii okopów. Somma, Flers, Ypres i Amiens pozostają niegrywalne. Po ukończeniu
demo można wrócić do tej mapy; nie ma pozornego rozpoczęcia niedostępnego następnego rozdziału.

Opcje mają cztery zakładki: **Rozgrywka, Sterowanie, Dźwięk i Grafika**. Ustawienia działają
na bieżąco. Przywracanie domyślnych wartości dotyczy tylko kategorii, z potwierdzeniem;
język i checkpoint są zachowane. Trudność wybierasz lub zmieniasz wyłącznie
na ekranie kampanii. Kontynuacja zapisuje wybór dla wznawianej misji; Nowa kampania
nie modyfikuje dotychczasowego checkpointu.

## HUD 0.4.4

Prawa górna minimapa pokazuje rzeczywisty teren ±60 m, gracza, sojuszników i aktualny cel.
Lokacja/data są częścią jej modułu; opis celu znajduje się pod mapą. Wrogowie są oznaczani
wyłącznie po wystrzale w zasięgu: **3/2/1 s** dla Rekruta/Żołnierza/Weterana. To ostatnie
miejsce strzału, nie śledzenie poruszającego się przeciwnika. Pauza zatrzymuje timer.

Sojusznicza piechota ma niewielkie, półprzezroczyste flagi UK z kontrolą zasłonięcia.
Nazwę broni przy amunicji zastępuje sylwetka, nie zmieniając stanu broni ani liczb.
Minimapę, flagi i animacje menu można wyłączyć osobno w Rozgrywce. Statystyki są na lewej
górze, a checkpoint pod kompasem. Nie dodano drugiej kamery WebGL ani nowego renderera.

## Aktualizacja z 0.4.3

Nakładkę scalić z głównym katalogiem istniejącego repo, nie zastępować całych folderów
niepełną zawartością ZIP. Usunąć wycofany **`src/ui/map.js`** zgodnie z `REMOVE_FILES.txt`;
patch Git robi to sam. Użyć ZIP **albo** patcha. Nie kopiować starego `dist/`: wykonać
nowy build. Wersja nie wymaga kasowania preferencji ani prawidłowych checkpointów
0.4.1/0.4.2/0.4.3 (`SAVE_VERSION=1`, `MISSION_VERSION=3`).

```sh
npm ci
npm run check
npm test
npm run build
npm run dev
```

Test przeglądarkowy na lokalnym originie, w oddzielnym kontekście bez naruszania zwykłego
profilu gracza:

```sh
python -m pip install playwright
python -m playwright install chromium
python tools/browser_v044_ui.py --url http://127.0.0.1:5173/ --scenario all --headed --game
```

`--browser firefox` i `--executable` wybierają przeglądarkę. Bez `--game` test obejmuje
menu/kampanię, nie właściwą scenę 3D. Raport i zrzuty trafiają do `.local/v0.4.4-tests/`.

Wyniki i jawne braki odbioru: [raport 0.4.4](docs/V0_4_4_IMPLEMENTATION.md).
[Źródła grafiki UI](docs/UI_ART.md) · [lokalizacja](docs/LOCALIZATION.md).
Nie przebudowano modeli, geometrii poziomu, AI, balansu ani biblioteki audio.

## Podstawa rozgrywki 0.4–0.4.2

Odprawa zaczyna się w zadaszonym stanowisku dowodzenia, przy mapie, z oficerem i trzema
żołnierzami. Siedem krótkich wypowiedzi w wybranym języku trwa łącznie 42 sekundy. Można się
rozglądać i poruszać; **E pomija pozostałą odprawę i rozpoczyna natarcie**. Nie ma dubbingu
ani syntezy mowy. Bez pominięcia atak rozpoczyna się po ostatniej wypowiedzi.

Wysunięte posterunki obu stron prowadzą ograniczony, rzeczywisty ostrzał przed sygnałem.
Przeciwnik już wtedy widzi i atakuje gracza; naruszenie linii lub zaatakowanie przeciwnika
wywołuje alarm. Nie ma globalnego wyłącznika AI czekającego na kliknięcie skrzyni.
NPC celujący w NPC strzelają częściej w tułów, mają większy rozrzut i przerwy między seriami.
Nie są nieśmiertelni; broń gracza nie została osłabiona tym profilem.

Dwa Mark IV przemieszczają się po trasach z zakrętami i punktami wsparcia. Działają działa
w sponsonach i przednie karabiny maszynowe. Otwarcie dwóch zaprojektowanych odcinków drutu
zmienia geometrię, kolizję i graf nawigacji. Niemieckie działo polowe 7,7 cm z dwuosobową
obsługą rzeczywiście strzela do czołgów. Trafienia mogą unieruchomić czołg, uszkodzić
uzbrojenie lub go zniszczyć. Karabin piechoty nie odejmuje mu punktów pancerza.

Nowy etap wymaga uciszenia działa. Można wyeliminować obsługę lub podejść do zamka od tyłu
i użyć E. Liczy się wynik, nie tożsamość autora ostatniego trafienia. Zniszczenie czołgów
nie blokuje bocznego podejścia piechoty. W końcowej obronie wrogowie blisko telefonu
wstrzymują postęp; odległy zagubiony NPC nie blokuje ukończenia misji.

Lotnictwo to **ograniczone, zaprojektowane przeloty DH.5 i DFW**: pięć możliwych wylotów,
w tym dwa ataki pojedynczą bombą, liczone od rozpoczęcia natarcia. Zanim spadnie bomba,
pojawia się widoczny samolot i ostrzeżenie. Pocisk leci fizycznie i respektuje osłony.
To nie symulator walk powietrznych: brak autonomicznych pojedynków i zestrzeliwania samolotów.
Szybkie ukończenie misji może wyprzedzić ostatni przelot.

Poprawione wejście na przeszkody: wąska belka płotu nie jest stopniem. Przebudowane worki
mają spłaszczony kształt, mijankę rzędów i zamknięte wypełnienie, bez prześwitów starego stosu.
Nowe modele artylerii i samolotów, mapa odprawy, detale wnętrza i efekty pracy/uszkodzenia
pojazdów są autorską, proceduralną oprawą retro.

## Firefox: celowanie i obrót kamery — informacje z wcześniejszych wersji

Przy dostępnych Pointer Events ruch kamery, LPM i PPM korzystają teraz z jednego strumienia.
Poprzedni kod anulował `pointerdown`, ale czekał na kompatybilny `mousemove`; taki strumień
może zostać wstrzymany podczas trzymania przycisku. Fallback myszy działa tylko wtedy,
gdy Pointer Events nie ma. Nie sumujemy obu strumieni, żeby nie podwajać czułości.

Regresje sprawdzają ruch przy PPM, przy obu przyciskach i po pauzie/checkpoincie. **Firefox
nie został uruchomiony w środowisku autora**: próby pobrania nie powiodły się. Test
symulujący brak kompatybilnych zdarzeń nie zastępuje testu realnego Firefoksa.
Rzeczywiste zdarzenia myszy sprawdzano w Chromium; pełny zakres w historycznym raporcie.
Bieżący zakres sprawdzenia 0.4.3 i ograniczenia środowiska opisuje osobny raport 0.4.3.

## Aktualizacja do 0.4.3

Nałóż pliki 0.4.3 na repozytorium z 0.4.2, scalając katalogi i zastępując tylko dołączone
pliki. Nakładka nie jest kompletnym projektem: nie usuwaj pozostałej zawartości `src/`,
`tests/` i `tools/`. Po lokalnych testach odtwórz `dist/` przez `npm run build`.
Używaj tej samej wersji JS, CSS i flag SVG. Nie musisz kasować checkpointu ani danych strony. Angielski wariant napisu na mapie odprawy
nie zmienia układu terenu ani oryginalnych modeli.
Starsze ustawienia po raz pierwszy pokażą wybór języka. Pełne instrukcje i baza SHA są
w raporcie 0.4.3. Ta paczka nie publikuje automatycznie żadnych zmian.

**Checkpointy v0.3 i wcześniejsze nie są zgodne z nowym przebiegiem misji.** Walidator
odmawia ich wczytania z komunikatem; nie teleportuje obiektów z dawnych zapisów. Rozpocznij
nową misję. Ustawienia są pod tym samym kluczem, więc pozostają zachowane przy tym samym
originie/porcie. Nie ma potrzeby kasowania danych strony.

## Uruchomienie i publikacja

Źródła są wersjonowane w głównym katalogu repozytorium. Wszystkie polecenia poniżej
uruchamiaj z tego katalogu.

| Ścieżka | Zawartość |
|---|---|
| `src/`, `index.html` | Kod gry, interfejs i punkt wejścia |
| `public/` | Modele, tekstury i pozostałe zasoby runtime |
| `vendor/` | Przypięty lokalny Babylon.js i jego licencje |
| `tools/`, `tests/`, `docs/` | Narzędzia, testy i dokumentacja projektu |
| `.github/workflows/pages.yml` | Testy, build i publikacja GitHub Pages |
| `dist/` | Generowany release; ignorowany przez Git |
| `.local/` | Lokalne kopie i wyniki pracy; ignorowane przez Git |

Archiwalne zrzuty i logi `docs/*-tests/` oraz `docs/test-results/` pozostają lokalne.
`dist/` zawiera grę, zasoby, licencje, changelog, manifest plików oraz notatki
dostępne z menu gry: `HISTORY.md`, `KNOWN_ISSUES.md` i ich angielskie odpowiedniki.
Także `ASSET_LICENSES.md` ma wariant `.en.md`; język linku wynika z ustawień gry.
Edytuj źródła, a release odtwarzaj przez `npm run build`.

Node.js 20 lub nowszy do pracy deweloperskiej. Lokalny Babylon.js 8.46.2 i statyczny build
Node; `dependencies` jest puste. **Vite nadal nie jest wdrożone.**

```bash
npm ci
npm run dev
```

W PowerShell z zablokowanym `npm.ps1` użyj `npm.cmd` zamiast `npm`; nie trzeba zmieniać
polityki wykonywania skryptów.

Otwórz adres wypisany w terminalu, zwykle `http://localhost:5173/`. Przy pierwszym starcie
wybierz język, następnie misję, wczytaj
zasoby i kliknij wejście do gry. Ten świadomy klik uruchamia Pointer Lock i audio.
Wymagane są WebGL2, mysz i klawiatura. Nie otwieraj `index.html` przez dwuklik / `file://`.

```bash
npm run build
npm run preview
```

Preview zwykle działa pod `http://localhost:4173/`. Zawartość `dist` można umieścić na
statycznym hostingu HTTP/HTTPS, również pod podkatalogiem. Gracz nie potrzebuje Node,
backendu, konta ani połączeń z CDN. Build powstaje lokalnie albo w GitHub Actions.

W GitHub ustaw jednorazowo **Settings → Pages → Build and deployment → Source → GitHub Actions**.
Workflow uruchamia testy i build dla push/PR do `main`; publikuje tylko push do `main`
lub ręczne uruchomienie na `main`. PR nie publikuje strony. Do Pages trafia wyłącznie `dist/`.
Opis mechanizmu: [dokumentacja GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

Podgląd ścieżki projektu Pages: `npm run preview -- --base=ZiemiaNiczyja`.
Otwórz wtedy `http://localhost:4173/ZiemiaNiczyja/`.

## Limit FPS i synchronizacja

W ustawieniach **Limit FPS** można wpisać liczbę całkowitą 1–360; sugestie obejmują
30, 60, 90, 120, 144, 165 i 240. **0 oznacza brak dodatkowego limitu aplikacji** i jest
domyślne. Zmiana nie wymaga przeładowania misji.

Nie ma fałszywego przycisku „VSync OFF”. Przeglądarka zarządza prezentacją obrazu, a
`requestAnimationFrame` zwykle jest związane z odświeżaniem monitora. „0” nie gwarantuje
przekroczenia 165 FPS na ekranie 165 Hz. Przy limicie, który nie dzieli częstotliwości
odświeżania, odstępy renderowanych klatek mogą być nierówne.

Limiter pomija render, nie kroki symulacji. FPS i czas klatki opisują **rzeczywiście
renderowane klatki**, nie liczbę wywołań rAF. CPU mierzy pracę głównego wątku aplikacji;
GPU korzysta z opcjonalnych asynchronicznych timer queries. Brak wyniku jest oznaczony.
CPU nie jest użyciem wszystkich rdzeni i nie jest obliczane z `1000/FPS`. Przy przeciążeniu
nadrabianie symulacji pozostaje ograniczone do pięciu kroków — celowo nie odgrywamy zaległych
sekund naraz. Wskaźniki są niezależne od F3.

## Jakość i sterowanie

Low / Medium / High / Ultra zachowują budżety v0.3: cienie odpowiednio wyłączone / 1024² /
2048² / 4096², różne odległości LOD i dekoracji oraz limity efektów. Skala renderowania
jest osobną opcją. Jakość nie zmienia liczby NPC, uczciwości AI, obrażeń ani celów.

| Działanie | Sterowanie |
|---|---|
| Ruch / sprint | WASD / lewy Shift |
| Celowanie / ogień | PPM / LPM, również jednocześnie |
| Przeładowanie / wybór broni | R / 1, 2 albo kółko myszy |
| Interakcja / pominięcie odprawy | E |
| Kucanie / leżenie / skok | C / Z / spacja |
| Granat / walka wręcz | G / V |
| Pauza / diagnostyka | Esc / F3 |

W menu można zmienić klawisze i intensywność kołysania/obrażeń. Ukrycie karty i utrata
fokusu pauzują grę; powrót wymaga kliknięcia wznowienia.

## Testy i odtwarzanie zasobów

```bash
npm test
npm run check
node tools/check-localization.mjs
python tools/test_asset_geometry.py
node tools/autoplay.mjs
node tools/autoplay.mjs --destroyed-tanks
```

Bot zna układ mapy i pozycje przeciwników, lecz porusza się normalnym wejściem. Nie jest
benchmarkiem ludzkiej trudności ani deklaracją docelowych 12–20 minut rozgrywki.

Opcjonalnie: Python, Playwright, Pillow, Chromium i Xvfb na bezekranowym Linuxie:

```bash
xvfb-run -a python tools/browser_v04_regression.py
xvfb-run -a python tools/browser_v04_regression.py --dist --prefix=test-repo
xvfb-run -a python tools/browser_v04_lifecycle.py --dist --prefix=test-repo --cycles 10
xvfb-run -a python tools/showcase_v04.py
python tools/http_smoke.py
```

Testy graficzne korzystają ze SwiftShader, nie fizycznego GPU. Routowane dokumenty mają
origin opaque, więc nie potwierdzają trwałego IndexedDB po restarcie przeglądarki.
Starsze narzędzia v02/v03 pozostawiono jako historyczne; mogą mieć dawne liczby NPC i etapy.

Do odtworzenia zasobów offline potrzebne są Python 3, numpy, scipy i Pillow:

```bash
python tools/regenerate_assets.py
npm test
npm run check
npm run build
```

Zasoby są wersjonowane. `regenerate_assets.py` odtwarza otoczenie, uzbrojenie i wsparcie,
zachowując sześć modeli piechoty importowanych z Blendera. Samodzielne uruchomienie
historycznych `generate_characters.py` albo `generate_assets.py` bez `--keep-infantry`
nadpisuje piechotę starszą geometrią; nie służy do aktualizacji obecnego zestawu.
Aktualizacja sześciu GLB i czterech atlasów: [CHARACTER_ART.md](docs/CHARACTER_ART.md).
Atlasy obok GLB są wymagane. Pochodzenie: [ASSET_LICENSES.md](ASSET_LICENSES.md).

## Odbiór języków

```bash
python -m pip install playwright
python -m playwright install chromium
python tools/browser_v043_language.py --url http://127.0.0.1:5173/ --headed --game
```

Bez `--game` skrypt sprawdza start i menu bez ładowania WebGL. Z `--game` sprawdza również
zmianę języka z istniejącym `GameView`. Używa osobnych kontekstów, nie danych gracza.
Brak przeglądarki lub WebGL jest ograniczeniem odbioru, nie wynikiem PASS. Dalsze scenariusze,
podkatalog hostingu i Firefox/Edge opisano w raporcie 0.4.3.

## Ograniczenia

Jedna misja, proceduralne modele i animacje, uproszczona artyleria i pancerz, skończone
scenariusze lotnicze, syntetyczny dźwięk. Brak symulacji penetracji pancerza, załogi wnętrza
czołgu, ogólnej destrukcji i rozbudowanej fizyki lotu. Nie potwierdzono aktualnej wersji na
realnym Firefoxie. Start v0.4.1 sprawdzono w Chromium na RTX 3060; nie wykonano
porównawczego pomiaru wydajności i nie obiecujemy 165 FPS na każdej maszynie.

[Raport testów](docs/TEST_REPORT.md) · [Znane problemy](docs/KNOWN_ISSUES.md) ·
[Historia i fikcja](docs/HISTORY.md) · [Architektura](docs/ARCHITECTURE.md)
