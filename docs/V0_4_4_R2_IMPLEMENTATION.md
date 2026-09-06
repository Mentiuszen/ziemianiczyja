# Ziemia Niczyja 0.4.4 — rewizja 2

**Kod i pliki przygotowane do lokalnego odbioru. Nie wykonano publikacji.**
Numer wersji pozostaje `0.4.4`; `UI_REVISION`, `package.json.uiRevision` i
`ZiemiaNiczyja.uiRevision` wynoszą `2`.

## Baza

Wyłącznie aktualny `ZiemiaNiczyja.zip` przesłany przez użytkownika, nie powtórzona nakładka
z 0.4.3 ani wcześniejszy niezatwierdzony ZIP z rozmowy. SHA-256 archiwum:
`fcedf385b02a784dedbf1cb271b648afedc5c9e5f8d6b547b300a4b27019d795`.
W odizolowanej kopii rozpakowano 840 źródłowych plików. Nie kopiowano `.git`, `.local`
ani starego `dist`. Nie utworzono/przełączono branchy, nie wykonano commita, pusha ani
zmian konfiguracji GitHub Pages. Oryginalny ZIP pozostał niezmieniony.

## Wdrożony zakres

| Obszar | Rewizja 2 |
|---|---|
| Wybór języka | Własne tło wydzielone z wybranego konceptu, mniejsze flagi bez ramek, nowe odstępy i typografia. Logika pierwszego startu zachowana |
| Main | Tło wybranej sceny z piechurem po prawej, nowy ostry logotyp ze sylwetką i drutem, cienkie separatory i oszczędny hover. Nadal 4 pozycje |
| Opcje | Tło stanowiska dowodzenia, prosty tab bar, równe wiersze, listy ze strzałkami i natywne przełączniki. Reset kategorii, capture i istniejące ustawienia pozostają |
| Kampania | Duża mapa u góry, 5 uporządkowanych kart niżej, opis i akcja pod nimi. Wybór zmienia datę, front, strzałki i kadr |
| Geografia | Rzeczywiste wybrzeże, jeziora i rzeki z GSHHG 2.3.6 oraz regionalny relief. Edytowalne dane i osobne licencje dołączone |
| Fronty | 5 oddzielnych datowanych uogólnień, w tym Ypres z precyzją miesięczną. Nie są digitalizacją dziennej mapy okopów |
| HUD | Okrągła minimapa, lokacja/data pod tarczą, cel poniżej. Zwarty biały wiersz zdrowia oraz broni/amunicji/granatów; brak Wstecz w rozgrywce |
| Kontakty | Promień koła 60 m zamiast narożników kwadratu. Nadal 3/2/1 s, pozycja w chwili strzału, brak śledzenia cichego przeciwnika |
| PL/EN | 482 klucze w każdym katalogu, nowe etykiety kontrolek, frontów i map. Zmiana języka zachowuje wybór oraz datę |
| Utrzymanie | Changelog, README, UI_ART, noty zasobów PL/EN, znane ograniczenia, narzędzia eksportu, nowe regresje i instrukcja instalacji |

Nie dodano fikcyjnych funkcji widocznych jako tekst na mockupie (dron celownika, gamepad,
nowe tryby autosave). Wersje snapshotu i misji pozostają takie jak w bazie. Tylko Cambrai
jest grywalne; wybór wcześniejszej/późniejszej mapy nie nadaje ukończeń i nie nadpisuje zapisu.

## Weryfikacja wykonana

- **Baza przed zmianami: 331/331 testów PASS.**
- **Pełny zestaw po zmianach: 343/343 PASS, 0 FAIL i 0 pominiętych.** Dodano 12 regresji.
- Ten sam pełny wynik **343/343 PASS** oraz check uzyskano na czystej kopii źródeł
  odtworzonej przez zastosowanie dostarczonego patcha. Zweryfikowano zgodność wszystkich
  868 plików po odtworzeniu; ostatnie uzupełnienie dokumentacji nie zmienia kodu ani testów.
- Przed właściwą implementacją 7 testów nowego kontraktu nie przechodziło; osobno test
  kołowego zasięgu również wykazywał dawną akceptację narożników. Po zmianach przechodzą.
- Jedyną adaptacją starej próby logiki jest punkt graniczny w `v044-contacts`: dawne
  `(60,20)` w kwadracie zastąpiono `(60,0)` na granicy koła. Nowa próba jawnie odrzuca
  `(59,59)`. Nie usunięto testu zakresu ani timera.
- `npm ci`, `npm run check`: PASS. Sprawdzono składnię/importy, 15 GLB, komplet
  482/482 tłumaczeń, statyczne odwołania, style i 19 hashy eksportowanych aktywów UI.
- Oba niezmienione autoplay zakończyły misję: standardowy i z czołgami zniszczonymi
  od początku. To regresja przechodniości, nie ocena wyglądu UI ani ludzkiego balansu.
- Dla wszystkich 3 trudności, tego samego seeda i 600 kroków po 1/60 s porównano
  `Simulation.snapshot()` oraz batch zdarzeń z bazowym ZIP-em: **identyczne**.
- Bajtowo potwierdzono niezmienność **434 chronionych plików**: vendor, modele,
  tekstury świata, AI, kolizje, walka, pojazdy, misje, renderer, audio, input, core,
  save oraz bazowe dane świata/broni. App zmienia poza UI tylko metadane rewizji.
- Dwa finalne buildy dały identyczny manifest. Nie dołączono starego `dist`.
- Sprawdzono 28 odpowiedzi HTTP 200 dla źródeł i release pod `/ZiemiaNiczyja/`, w tym
  nowe tła, SVG, źródła mapy, licencję i moduły. To klient HTTP, nie test wykonania JS.

## Rzeczywisty DOM — wykonany zakres

W Chromium 144 wykonano właściwe moduły aplikacji/UI i CSS. Sprawdzono pierwszy
wybór, brak ramek, 4 działania main, zakładki, strzałki wyboru, przełączniki, zachowanie
fokusu przy zmianie języka, 5 różnych ścieżek frontu i dat, umieszczenie kart pod mapą
oraz zachowanie rozdziału po wyjściu do opcji i przełączeniu PL/EN.

Obejrzano zrzuty interfejsu przy 1280×720, 1920×1080, 3440×1440, 390×844 i 844×390.
Sprawdzono bounding boxy main/pickera i układ mapy. HUD otrzymał dane prawdziwej
symulacji, ale widok 3D był zastępczy. W tej próbie nie odnotowano błędów strony.

**Granica próby:** `about:blank`, przepisane wyłącznie adresy importów/aktywa na Blob/data
URL, CSS inline, kontrolowana pamięć i zastępczy widok. Podglądy menu pochodzą z właściwego
DOM, nie z image generation. Nie są dowodem działania natywnego IndexedDB ani pełnej sceny.

## Pełny HTTP / WebGL2 — BLOCKED

Uruchomiono próbę na lokalnym serwerze, w tym dostarczony `browser_v044_r2.py`.
Chromium blokuje nawigację przez **ERR_BLOCKED_BY_ADMINISTRATOR**. Nie obchodzono
polityki środowiska i nie wpisano nieuruchomionych asercji jako PASS.

Do Twojego lokalnego odbioru pozostają: pełny GameView na zwykłym originie, natywny
zapis po restarcie przeglądarki, Firefox/Edge, flagi przy ruchu i zasłanianiu, gra z HUD-em,
obsługa pauzy/myszy oraz pomiar kosztu CPU/GPU. Nie wykonywano nowego benchmarku FPS.

## Ważne granice wizualne i historyczne

Tła to adaptacje właściwych paneli wybranego mockupu: native 764×352 i 764×374, bez
nadrukowanego UI. Na dużym ekranie mogą być miękkie — nie są nowymi 4K masterami.
Logo, kontrolki i znaczniki są niezależnie renderowane. Rzeczywista grafika misji,
modele i oświetlenie nie są zastępowane fotorealistyczną sceną z konceptu.

Podkład jest geograficzny; linie wojskowe są jawnie uogólnione. Materiały historyczne
potwierdzają ramy chronologii, nie każdy punkt polilinii. Nie odtworzono dokumentacyjnie
każdej dziennej pozycji. Szczegóły oraz licencje: `UI_ART.md` i `ASSET_LICENSES.md`.

## Instalacja i odbiór

Właściwa instrukcja: `INSTALL_0_4_4_R2.md`. Nakładka dotyczy dostarczonego 0.4.4.
Nie usuwa żadnych plików i nie wymaga czyszczenia poprzedniej wersji. Alternatywny patch
zawiera również grafiki. Nie nakładaj ZIP-a i patcha jednocześnie.

Przed pushem sprawdź przede wszystkim: oba języki, 4 zakładki, pięć dat mapy,
Nowa/Continue bez utraty zapisu, uruchomienie Cambrai, kołowy radar (także przy wyłączeniu
widoku), HP/amunicję/reload, flagi sojuszników, pauzę i długie cele w niskim oknie.

```sh
npm ci
npm run check
npm test
npm run build
npm run dev
python tools/browser_v044_r2.py --url http://127.0.0.1:5173/ --headed --game
```

**Ta dostawa nie podpisuje za użytkownika odbioru wyglądu ani publikacji.**
