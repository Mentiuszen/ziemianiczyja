# Ziemia Niczyja 0.4.3 — języki PL/EN

**6 września 2026. Kod przygotowany do lokalnego odbioru. Nie wykonano publikacji.**

Baza: `Mentiuszen/ziemianiczyja`, commit
`d4f0b6a2ed59b7e3e53d7adb113a3fc639c6bb9d` (`v0.4.2`).
Pracowano na odizolowanej kopii plików. Bez tworzenia/przełączania gałęzi, worktree,
commita, pusha ani zmiany GitHub Pages. Nie zmieniano planów `V0_4_2.md` i `V0_5.md`.

## 1. Co zostało wdrożone

### Wybór języka

Pierwszy ekran pokazuje dwa duże kafle zgodnie ze szkicem: English z flagą USA/UK
po lewej i Polski z polską flagą po prawej. W angielskiej fladze USA zajmuje górny
lewy trójkąt, UK dolny prawy; przekątna biegnie od lewego dolnego do prawego górnego rogu.
Ekran zachowuje ciemną stylistykę gry, ma widoczny fokus i układ dla mniejszych okien.

Wybór jest wymagany przed menu głównym. Nie ma wcześniejszej klatki polskiego menu,
automatycznego doboru języka z przeglądarki ani dodatkowego potwierdzenia. Kliknięcie,
Enter lub Spacja na kaflu zapisuje preferencję i otwiera właściwe menu. Escape nie
omija ekranu. Nie uruchamia się wtedy scena, Pointer Lock ani AudioContext.

Przy kolejnym uruchomieniu poprawnie zapisany język pomija picker. Ustawienia sprzed
0.4.3 oraz niepoprawny język pokazują wybór, ale nie kasują pozostałych preferencji
ani checkpointu. Przy odmowie zapisu ustawień wybór działa w bieżącej sesji;
przeładowanie/zamknięcie strony może wymagać ponownego wyboru.

### Teksty gry i zmiana podczas pauzy

Przeniesiono pełną własną warstwę tekstową do dwóch katalogów po **387 kluczy**:
menu, misje, opcje, sterowanie, HUD, wszystkie cele, interakcje, ostrzeżenia, pickupy,
meldunki, siedem wypowiedzi odprawy, loading, checkpointy, błędy i diagnostykę.
Nazwy własne postaci, miejsc, broni i tytuł Ziemia Niczyja pozostają nazwami własnymi.
Tłumaczenie nie jest dubbingiem. Oryginalne prawne teksty licencji nie są zmieniane.

Język można zmienić od razu w opcjach, także otwartych z pauzy. Odświeża się bieżący
cel, HUD, aktywne napisy i powiadomienia, bez ponownego wywołania zdarzeń, zmiany ich
timerów, resetu świata czy amunicji. Podpowiedzi uwzględniają przypisane klawisze.
Język dokumentu, etykiety dostępności i formaty liczb także podążają za wyborem.

Stan symulacji i zdarzenia przechowują klucze/parametry, nie tłumaczenie wybrane przy
ich powstaniu. Język jest preferencją aplikacji, a nie własnością snapshotu misji.
`SAVE_VERSION=1` i `MISSION_VERSION=3` pozostają. Starsze etykiety checkpointów i nazwy
funkcyjne NPC mają jawną normalizację przy odtworzeniu. Reset opcji zachowuje język.

### Tekst w świecie, dokumenty i metadane

Zlokalizowano także podpis w teksturze mapy na stole odprawy. Wariant
`briefing-map-en.png` zmienia tylko prostokąt podpisu; oryginalny JPEG i mapa gry
pozostają. Przełączenie podmienia teksturę istniejącego materiału, bez nowej sceny.
Generator, tekst katalogu i manifest SHA-256 umożliwiają sprawdzenie jego pochodzenia.

Ekran informacji w English otwiera odpowiedniki `.en.md` historii, znanych ograniczeń
i pochodzenia zasobów. Builder dostarcza oba warianty. README, changelog, raport testów
i dokumentacja `LOCALIZATION.md` opisują nową wersję. `package.json`, lockfile,
menu/HUD i API wskazują 0.4.3 — baza 0.4.2 miała jeszcze 0.4.1 w metadanych pakietu.

**Nie przebudowano rozgrywki, modeli, układu mapy, kolizji, AI, balansu ani audio.**
Wprowadzono nowe teksty/zasoby językowe, nie nowe zasoby jakościowe planowane dla 0.5.

## 2. Wykonana weryfikacja

Środowisko: **Node 22.16.0**, Python 3.13, Pillow **12.3.0**, Chromium
**144.0.7559.96**. Źródła i komplet istniejących narzędzi/testów pozyskano z artefaktów
GitHub Actions przypisanych do wskazanego SHA. Drzewa `src`, `tests` i `tools`
zweryfikowano przez odtworzenie ich Git tree SHA; modele i vendor także zweryfikowano.
Nie zastąpiono oryginalnych testów wyłącznie nowym, wybiórczym zestawem.

| Sprawdzenie | Faktyczny wynik |
|---|---|
| `npm ci --ignore-scripts --no-audit --no-fund` | PASS; nie dodano zależności npm |
| `npm run check` | PASS; składnia 65 JS/MJS, względne importy, 15 GLB oraz kontrola lokalizacji |
| Kontrola katalogów | PASS; 387/387 kluczy, niepuste wartości, zgodne parametry, 54 źródłowe moduły i 265 odwołań statycznych |
| **Pełny `npm test`** | **274/274 PASS, 0 pominiętych**: 234 wcześniejsze przypadki (test buildu rozszerzony o EN) i 40 nowych |
| `node tools/autoplay.mjs` | PASS; ukończenie w 161,73 s czasu symulacji, 2 checkpointy |
| `node tools/autoplay.mjs --destroyed-tanks` | PASS; ukończenie w 158,32 s czasu symulacji, 2 checkpointy |
| PL/EN i gameplay | PASS; identyczne stany dwóch symulacji po 600 krokach dla każdego z 3 poziomów, ten sam seed |
| Porównanie danych z bazą | PASS; niezmienione definicje okopów/ramp/tras/przedmiotów, konfiguracja broni, liczby balansu, działa i naloty; pola tekstowe porównano oddzielnie |
| Zasoby dotychczasowe | PASS; wszystkie **50 plików public/** i **337 plików vendor/** bajtowo niezmienione |
| Podpis mapy EN | PASS; zmienione piksele wyłącznie w obszarze napisu; bbox różnic `(31,703)-(208,721)` w obrazie 1024×768; powtórzenie generatora dało identyczny PNG i manifest |
| `npm run build` | PASS; 461 plików manifestu, 49,29 MiB, wersja 0.4.3; dwa buildy dały identyczny manifest |
| HTTP źródła `/` i release `/ZiemiaNiczyja/` | PASS; 24 odpowiedzi 200, poprawne typy zasobów/importów, flagi, mapa EN i 3 dokumenty EN |
| Składnia narzędzi Python | PASS; nowy test przeglądarkowy/generator i dostosowane aktywne narzędzia |

Nowe przypadki Node: `v043-language` (16), `v043-catalogue` (10), `v043-flow` (8),
`v043-world-text` (3), `v043-parity` (3). Obejmują brak i błędny język, stare preferencje,
odmowę pamięci, pierwszy start, spóźniony odczyt zapisu, zmianę w opcjach i reset,
kompletność danych, brakujące klucze, parametry, escaping, błędy, teksturę świata,
zgodność stanu i regresje 0.4.2. Przed implementacją odpowiednich mechanizmów
uruchomiono czerwone testy wyboru/pamięci, brakującego deskryptora, tekstury i buildu.

Czas bota nie jest czasem przejścia człowieka. Nie wykonywano nowego strojenia trudności,
pomiaru fizycznego GPU, FPS ani sesji oceniającej balans.

### Rzeczywisty DOM Chromium — PASS, ograniczony zakres

Wykonano test właściwego konstruktora `Application` i rzeczywistych zdarzeń DOM:
wybór klawiaturą i myszą, brak main przed wyborem, zmiana w opcjach, zachowanie języka
po resecie, poprawne/niepoprawne ustawienia oraz odmowa pamięci. Sprawdzono kolejno
EN → PL → EN, **36 prezentacji ekranów** (12 stanów × 3), HUD, klawisz F zamiast E,
**21 próbek napisów odprawy** (7 × 3), aktywne powiadomienie/checkpoint, błędy i loading.
Rzeczywisty `Simulation.snapshot()` oraz tożsamość świata pozostawały niezmienione.

Obejrzano i sprawdzono mieszczące się kafle przy **1280×720, 390×844 i 844×390**.
Podgląd wyboru języka pochodzi z tego DOM, nie z generowanego mockupu.

**Ograniczenie:** test odbył się w `about:blank`, z modułami źródłowymi osadzonymi jako
Blob (zmieniono tylko adresy importów), źródłowym CSS i dokładnymi bajtami SVG.
`localStorage` był kontrolowaną pamięciową atrapą. HUD korzystał z prawdziwej symulacji,
lecz zastępczego interfejsu widoku, bez GPU. To dowód działania UI/tekstów, **nie**
odbioru pełnego `GameView`, trwałego zapisu na HTTP ani WebGL2.

### Pełna próba HTTP/WebGL2 — BLOCKED

Nowy `tools/browser_v043_language.py --game` uruchomiono przeciw lokalnemu HTTP.
Chromium zatrzymało nawigację błędem **`ERR_BLOCKED_BY_ADMINISTRATOR`**, zanim
wykonały się kontrole tej próby. Nie usuwano polityki środowiska. Osobny test HTTP
przez klienta Python potwierdza pliki i MIME, ale nie wykonuje JavaScriptu gry.

**Nie oznaczono jako wykonanych:** pełnego renderu gry na normalnym originie,
trwałości localStorage/IndexedDB po restarcie przeglądarki, Firefoksa, Edge ani
lokalnego odbioru użytkownika. Dostarczony skrypt ma jawny status BLOCKED/FAIL;
nie zamienia nieuruchomionej próby w PASS.

## 3. Instalacja nakładki

ZIP zawiera **64 pliki: 40 zmienionych i 24 nowych** względem wskazanej bazy 0.4.2.
To nakładka, nie kompletny projekt. Rozpakuj ją w głównym katalogu repo, **scalając
katalogi i podmieniając tylko dołączone pliki**. Nie usuwaj pozostałej zawartości
`src/`, `tests/`, `tools/`, `public/` ani `vendor/`. Zabezpiecz własne późniejsze zmiany.

Alternatywnie zastosuj dołączony Git patch z obsługą nowego PNG:

```sh
git apply --check ZiemiaNiczyja_0.4.3.patch
git apply ZiemiaNiczyja_0.4.3.patch
```

Użyj ZIP-a **albo** patcha, nie obu metod naraz. Manifest wskazuje skróty SHA-256
bazowego i wynikowego pliku; brak bazowego skrótu oznacza nowy plik. Patch może
odmówić zastosowania do później zmienionego pliku — nie wymuszaj wtedy nadpisania.
W paczce nie ma `.git`, `node_modules`, `dist/`, scratchy, cudzych fontów ani nowych modeli.

W głównym katalogu pełnego checkoutu:

```sh
npm ci
npm run check
npm test
node tools/autoplay.mjs
node tools/autoplay.mjs --destroyed-tanks
npm run build
npm run dev
```

W PowerShell z blokadą `npm.ps1` można użyć `npm.cmd`. Źródła zwykle działają pod
`http://localhost:5173/`. `dist` generujesz lokalnie; nie korzystaj ze starego buildu
0.4.2 po podmianie samych źródeł. Podkatalog wydania sprawdzisz przez:

```sh
npm run preview -- --base=ZiemiaNiczyja
```

## 4. Lokalny odbiór przed pushem

Nie kasuj własnych zapisów tylko dla sprawdzenia pierwszego startu. Użyj osobnego
profilu lub prywatnego okna. Preferencje i checkpointy są związane z originem/portem.

- [ ] Czysty profil: przed menu tylko dwa kafle. Sprawdź oba języki, Tab/Enter/Spację,
  Escape, brak ładowania mapy i przejęcia kursora. Po odświeżeniu zapisany wybór pomija picker.
- [ ] Przejdź wszystkie ekrany w obu językach; sprawdź małe okno, fokus i brak uciętych
  etykiet. Zmień język w opcjach, zresetuj pozostałe opcje, wróć do menu.
- [ ] Rozpocznij misję, przeczytaj wszystkie wypowiedzi odprawy i napis na mapie na stole.
  Zapauzuj, przełącz język i wróć; nie mogą zmienić się postęp, pozycja, HP ani amunicja.
- [ ] Sprawdź cele, meldunki, przeładowanie, pickupy, granaty, działo, nalot, śmierć i finał.
  Przypisz F do interakcji i potwierdź F w odpowiednich podpowiedziach w obu językach.
- [ ] Zmień język przy aktywnym napisie/powiadomieniu; nie ma ponownego dźwięku ani
  dodatkowych sekund komunikatu. Sprawdź zmianę i odrysowanie tekstury mapy podczas pauzy.
- [ ] Wczytaj poprawny checkpoint 0.4.1/0.4.2, zmień język i wczytaj ponownie. Preferencja
  nie może być narzucona przez zapis. Sprawdź trwałość po zamknięciu przeglądarki.
- [ ] Sprawdź odmowę pamięci, błąd ładowania i nieudany Pointer Lock: objaśnienia mają
  wybrany język; niepowodzenie zapisu preferencji nie blokuje menu ani uruchomienia gry.
- [ ] Sprawdź źródła i `dist` pod podkatalogiem, linki EN do historii/ograniczeń/zasobów,
  Firefox oraz Edge/Chromium. Potwierdź, że nie wrócił przechył kamery i inne regresje 0.4.2.

Opcjonalna automatyzacja lokalnego odbioru (Playwright nie jest zależnością gry):

```sh
python -m pip install playwright
python -m playwright install chromium
python tools/browser_v043_language.py --url http://127.0.0.1:5173/ --headed --game
```

Skrypt używa izolowanych kontekstów. Bez `--game` testuje wybór/menu/ustawienia;
z `--game` uruchamia prawdziwy `GameView` i pełne kontrole prezentacji. Dla Firefoksa
zainstaluj go przez Playwright i podaj `--browser firefox`; `--executable` pozwala
wskazać lokalny plik przeglądarki. Wynik domyślnie trafia do
`.local/v0.4.3-tests/browser/result.json`. Nie wymusza się w nim flagi lokalizacji:
korzysta z rzeczywistych kafli i kodu aplikacji.

Aktywne skrypty v0.4/v0.4.2 dostały obsługę kafla Polski na świeżym profilu, aby ich
istniejące scenariusze mogły dalej działać. Ich pełnych prób graficznych nie wykonano
w tym środowisku. Historyczne skrypty v0.2/v0.3 nie są testem zgodności nowego UI.

## 5. Granica ukończenia

Dostarczono implementację, lokalne zasoby, komplet słowników, changelog, dokumentację
i regresje. Kontrola katalogów potwierdza pełne pokrycie zinwentaryzowanych tekstów,
a nie nieomylność językową dowolnej przyszłej zmiany. Lokalny przegląd pełnej gry,
przeglądarki, trwałość zapisu i publikacja pozostają po stronie odbioru użytkownika.
Wyniki maszynowe są także w `V0_4_3_VALIDATION.json`; historia wcześniejszych raportów
nie została przerobiona na rzekome wyniki 0.4.3.
