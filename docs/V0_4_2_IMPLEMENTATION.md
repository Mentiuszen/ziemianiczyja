# Ziemia Niczyja 0.4.2 — wykonane zmiany i lokalny odbiór

**Data: 6 września 2026. Status: kod przygotowany do lokalnych testów, bez publikacji.**

Baza paczki: `Mentiuszen/ziemianiczyja`, commit
`6dc59b8fd70cbfe08e307074db2d46b684eca6e3` na odczytanym `main`.
Podstawą prac jest zaakceptowany `V0_4_2.md`, wraz z uzupełnieniem `CAM-01`.
Nie wykonano commit/push, nie utworzono gałęzi ani worktree, nie zmieniono GitHub Pages.

## 1. Co znajduje się w paczce

ZIP jest **nakładką na istniejące repozytorium**, nie kompletnym projektem do uruchomienia
w pustym katalogu. Zawiera zmienione źródła, metadane 0.4.2, nowe testy i dokumentację.
Nie zawiera `dist/`, `.git`, `node_modules`, modeli, tekstur ani kopii całego Babylon.
Scalić katalogi i podmienić wyłącznie dołączone pliki. Nie zastępować całych katalogów
`src/`, `tests/` lub `tools/` ich niepełną zawartością z nakładki.

Alternatywnie zastosować osobny patch po `git apply --check`. Nie stosować równocześnie
kopiowania ZIP i patcha. Manifest SHA-256 wskazuje treść bazową i wynikową każdego pliku;
chroni przed przypadkowym nadpisaniem późniejszych lokalnych zmian.

## 2. Realizacja zakresu

„Wdrożone” oznacza zmianę kodu i wskazane regresje, **nie podpisanie ręcznego odbioru**.
Tam, gdzie plan wskazywał hipotezę, rozróżniono potwierdzony mechanizm i nadal wymaganą
próbę użytkową. Nie przebudowano mapy ani nie wyłączono kolizji dla ułatwienia testów.

| ID planu | Wykonana zmiana | Regresje / odbiór |
|---|---|---|
| COL-01, COL-02 | Sweep pionowy pełnej sylwetki, podkroki ruchu, ograniczona korekta początkowej penetracji i rejestrowany powrót do zweryfikowanej pozycji | `v042-collision`, zachowane `v04-collision`; płoty w grze sprawdzić lokalnie |
| COL-03 | Walidacja obrotu prone, końców sylwetki względem aktorów i granic; headroom przy skoku; pełny kontakt obracanego czołgu | `v042-collision`, `v042-combat`, `v042-tank`; ciasne przejścia i ruch pojazdu do ręcznego odbioru |
| CAM-01 | `TargetCamera.updateUpVectorFromRotation = true`; istniejące małe wstrząsy pozostają | Dwa testy prawdziwej matematyki kamery; pełny `GameView` przez `browser_v042_camera.py` lokalnie |
| DIF-01 | Wspólne rozstrzygnięcie obrażeń z typem/partią/origin; profile kul, wybuchów, głowy i regeneracji; zgodna trudność po loadzie | `v042-difficulty`, `v042-ui`, `v042-save`; balans jest iteracją startową |
| AI-01 | Serie i przerwy przeciw graczowi, pamięć tożsamości celu przez krótkie zasłonięcie, widoczny tułów/głowa, ograniczona korekta yaw/pitch i fizyczny wylot | `v042-ai`; sprawdzić presję kilku przeciwników i odsłoniętą głowę |
| AI-02 | Generacja zamiaru, jedno zlecenie na aktora, zastępowanie starego celu, priorytet uniku, anulowanie i odbudowa po zapisie | `v042-navigation`, `v042-contracts` |
| AI-03 | Jedno wywołanie ruchu/grawitacji na aktualizację, ustępowanie niezależnie od wcześniejszych wyjść logiki ognia; wspólny owner/coverId | `v042-ai`, `v042-navigation`, `v042-contracts`; istniejący test wyjścia oddziału z odprawy |
| AI-04 | Rotacyjny budżet percepcji zamiast wiecznego badania tych samych pięciu zasłoniętych kandydatów | `v042-ai` |
| COM-01 | Test objętości na odcinku od oka do startu granatu; brak zużycia zapasu przy niedozwolonym starcie | `v042-combat` |
| COM-02 | Suppression od rzeczywistego odcinka strzału, kończącego się na trafionej przeszkodzie; wybuch wskazuje origin wybuchu | `v042-combat`, `v042-difficulty` |
| MIS-01 | Chwilowy brak obsługi nie oznacza trwałej neutralizacji; wspólny predykat celu/zdolności działania; zgodna migracja starej flagi | `v042-mission`, `v042-save` |
| MIS-02 | Martwy gracz nie kończy misji; odbiorca zdarzeń rozstrzyga śmierć przed sukcesem, niezależnie od kolejności zdarzeń | `v042-mission`, `v042-lifecycle` |
| MIS-03 | Prompty i interakcje używają jednego warunku; zasięg XYZ i LOS; własny collider działa jest świadomie pomijany | `v042-mission`; nie zmieniono strefy contest finału ani nie usuwa się wroga timerem. Nieosiągalny pobliski wróg wymaga osobnej reprodukcji lokalnej |
| SAV-01 | Pełne HP, podparcie, brak penetracji/pocisków/bezpośredniej linii ognia i możliwość małego zwykłego kroku przed autosave; niebezpieczny spawn/load odrzucany | `v042-save`, `v042-contracts`; trwałość IndexedDB po restarcie przeglądarki lokalnie |
| SAV-02 | Walidacja indeksów, enumów, timerów, ID i danych konsumowanych po restore; wartości domyślne dla historycznie opcjonalnych nowych pól | `v042-save`; fixture pochodzi z rzeczywistego `Simulation.snapshot()` kodu 0.4.1 |
| LIF-01 | Aktualność po każdym await, włącznie z początkowym zapisem; deadline całego przygotowania; uporządkowane/anulowane zapisy, zwalnianie późnych modeli | `v042-lifecycle`, `v042-storage`; pełny cykl scen i pamięci w przeglądarce lokalnie |
| AUD-01 | Generacja wznowienia audio; brak ponownego włączenia po anulowaniu; identyfikacja faz reloadu i anulowanie ich po przerwaniu; odłączenie źródeł | `v042-audio`; odsłuch i rzeczywisty AudioContext lokalnie |
| PERF-01 | `chooseCover` nie wykonuje dodatkowych synchronicznych A*; reachability przechodzi przez ograniczoną kolejkę. Dodano liczniki liczby/czasu A*, odwiedzonych węzłów i szczytu kolejki | `v042-navigation`; pomiar p95/p99 na sprzęcie gracza nadal wymagany |
| DOC-01 | Bieżące ograniczenia oddzielone od historycznej notatki; changelog opisuje patch, a nie nowe modele | Ten dokument i `KNOWN_ISSUES.md`; historyczny `TEST_REPORT.md` nie został przepisany ani przedstawiony jako nowy wynik |

### Szczegóły, które mają znaczenie przy odbiorze

**Czołg:** sam sweep pełnej starej AABB zatrzymywał prawidłowy skręt przy północnych
ruinach. Odtworzono ten przypadek na istniejącej trasie. Dodano prostokątny collider
obrócony z yaw, wspólny dla ruchu, promienia, nawigacji i kontaktu aktorów. AABB pozostała
wstępnym filtrem. Nie przesunięto ściany, trasy ani modelu. Oryginalny test obu tras znów
przechodzi i oba czołgi osiągają koniec, gdy scenariusz usuwa żywą piechotę z korytarza.

**Pozycje:** źródłowe 0.4.1 ma także początkowo nakładające się pozycje NPC. Korekty
przy spawn/historycznym loadzie mają limit 1,25 m, normalny odzysk 0,65 m. Każda korekta
sprawdza cały odcinek i nie otwiera drogi przez przeciwległą ścianę. Brak bezpiecznego
rozwiązania oznacza czytelne odrzucenie stanu, a nie noclip. Liczniki korekt są dostępne
w `ZiemiaNiczyja.inspect().contacts`.

**Trudność:** Rekrut/Żołnierz/Weteran: kule ×0,25/0,35/0,65; wybuchy ×0,55/0,75/1;
regeneracja po 3/4/5 s, 25/20/16 HP/s. Zwykły hitscan w głowę gracza ×1,25, NPC nadal
×1,6; kończyny ×0,57. Dotychczasowy wynik melee i ochrona własnej frakcji pozostają.
Samodzielna klasa `Health` zachowuje swój bazowy kontrakt 6 s / 12 HP/s dla dotychczasowych
konsumentów; każda prawdziwa misja ustawia właściwy profil w konstruktorze i po restore.
Nie istnieje drugi alternatywny system obrażeń ani ukryte pozostawianie gracza na 1 HP.

**Zapis:** pozostawiono `MISSION_VERSION=3` i `SAVE_VERSION=1`. Nowe pola mają jawne
wartości domyślne przy starym checkpointcie. Legalne stare `health.delay=6` nie zostaje
odrzucone. UI pokazuje profil wczytanej misji, a wybór w menu określa kolejną nową misję.
Kolejka z referencjami runtime nie jest zapisywana; odtwarzany jest ostatni ważny zamiar.

## 3. Wykonana weryfikacja

Środowisko: Node **22.16.0**. Testowano źródła z tej nakładki na kopii runtime,
której drzewa `src`, `public` i `vendor` zweryfikowano względem bazy GitHub.

- **152/152 testy PASS:** 100 nowych przypadków w 14 plikach `v042-*.test.mjs`
  oraz 52 istniejące przypadki w sześciu plikach: `core`, `integration`, `v03-world`,
  `v04-collision`, `v04-mission`, `v04-state`. Istniejące pliki nie zostały zmienione;
  ich blob SHA sprawdzono względem repozytorium. Pozostałych testów oryginalnego repo
  nie uruchomiono w tym środowisku; pełny lokalny `npm test` jest nadal konieczny.
- Przed zmianami odtworzono porażki odpowiednich regresji: opadanie/penetracja,
  nieaktualna trasa, profile obrażeń, rzucanie przez ścianę, AI, walidacja, późny zapis,
  audio, kontakt czołgu i granice prone. Testy potwierdzające dotychczasowy prawidłowy
  kontrakt nie są nazywane nowo naprawionymi błędami.
- Oryginalny `tools/autoplay.mjs` zakończył misję i utworzył dwa checkpointy.
  Również wariant `--destroyed-tanks` zakończył misję i utworzył dwa checkpointy.
  Bot sterował normalnymi wejściami; nie dodano mu HP, amunicji ani teleportacji.
- `npm ci --ignore-scripts --no-audit --no-fund` oraz dostępny `npm run check` PASS:
  sprawdzono składnię 57 plików JS/MJS, względne importy i 15 modeli GLB.
  To kontrola źródeł oraz czterech odczytanych narzędzi, nie audyt wszystkich historycznych
  skryptów authoringu w pełnym repo.
- `npm run build` PASS: czysty statyczny `dist`, wersja 0.4.2; dwa kolejne buildy
  dały identyczny manifest. HTTP 200 i właściwe MIME potwierdzono dla wejścia gry,
  nowych modułów i modelu zarówno ze źródeł pod `/`, jak i z `dist` pod
  `/ZiemiaNiczyja/`. Modeli ani vendor nie przepakowywano. Nie opublikowano buildu.
- **CAM-01:** prawdziwa metoda dołączonego `TargetCamera` odtwarza około 12° przechyłu
  w negatywnej kontroli z zerowym `rotation.z`. Aktualizowany wektor usuwa przechył,
  zachowując zamierzone wstrząsy. To test matematyki kamery bez GPU, nie dowód pełnego
  `GameView` ani zachowania konkretnej przeglądarki użytkownika.
- **Pełna próba przeglądarkowa BLOCKED:** lokalny URL został zablokowany przez politykę
  Chromium (`ERR_BLOCKED_BY_ADMINISTRATOR`); osobna próba nie uzyskała WebGL2.
  Nie wpisano wyniku „kamera w grze PASS”, „Firefox PASS” ani fikcyjnego pomiaru FPS.

Potwierdzono bajtową niezmienność **50 plików `public/` i 337 plików `vendor/`**,
mapy `world-map.js`/`cambrai.js`, terenu, layoutu, renderowanej geometrii, profili jakości
oraz adaptera Babylon. W szczególności nie zmieniono modeli, atlasów ani układu okopów.

## 4. Lokalny odbiór przed pushem

Z katalogu pełnego repo po nałożeniu plików:

```sh
npm ci
npm run check
npm test
node tools/autoplay.mjs
node tools/autoplay.mjs --destroyed-tanks
npm run build
npm run dev
```

W PowerShell można użyć `npm.cmd`. Następnie sprawdzić również build:

```sh
npm run preview -- --base=ZiemiaNiczyja
```

**Ruch i AI:** zacząć od odprawy, przejść przez drzwi razem z oddziałem, wejść ukośnie
w płot, skoczyć/opaść na jego belkę i wycofać się. Powtórzyć przy workach, skrzyniach,
ruinach, niskim suficie i obracającym się czołgu. Obrócić leżącą postać przy ścianie/NPC.
Nie powinno być penetracji, przejścia przez przeszkodę ani pętli awaryjnych korekt.

**Walka:** sprawdzić trzy poziomy, pojedynczy karabin, MG i kilka kierunków ostrzału.
Ocenić przerwy serii, wykrywanie po krótkim/długim zasłonięciu, regenerację i granat
rzucany tuż przy ścianie. Trudność wymaga normalnego przejścia, nie tylko zielonych
asercji kwot. Serie 30 seedów na profil i sesje ludzkie z planu pozostają do odbioru.

**Kamera:** po pobliskim wybuchu patrzeć w górę/dół, zaczekać na koniec efektu i obrócić
się o 90°/180°. Horyzont nie może pozostać przekrzywiony. Powtórzyć z ADS, motion 0/0,45/1,
pauzą, zmianą jakości i wczytaniem. Automatyczna regresja na prawdziwym `GameView`:

```sh
python -m pip install playwright
python -m playwright install chromium
python tools/browser_v042_camera.py --url http://127.0.0.1:5173/ --headed
```

To opcjonalne narzędzie odbioru, nie nowa zależność gry lub `npm test`. Używa izolowanego
kontekstu i nie dotyka bieżącej sesji gracza. Dla Firefoksa zainstalować przeglądarkę
Playwright i podać `--browser firefox`. `--executable` pozwala wskazać lokalny plik
przeglądarki. Skrypt nie włącza flagi naprawczej; bierze ją ze zwykłego konstruktora.
Macierz obejmuje 48 kombinacji jakości/motion/syntetycznego kroku 30/60/120/144 Hz
oraz rzeczywisty reload checkpointu. Nie jest benchmarkiem tych FPS.

**Misja i trwałość:** oddalić obsługę działa i dopuścić powrót, następnie trwale je
uciszyć. Sprawdzić prompty telefonu/meldunku z właściwej i niewłaściwej strony osłony,
finał, śmierć oraz stare checkpointy 0.4.1. Zmiana trudności w menu nie zmienia profilu
zapisu. Zrestartować przeglądarkę i sprawdzić trwały IndexedDB oraz odmowę zapisu.

**Cykl życia i koszt:** co najmniej 10 cykli start–gra–menu, anulowanie ładowania,
PPM+LPM, blur/zmiana karty, nieudany Pointer Lock, przerwanie reloadu i powrót z menu.
Odsłuchać fazy audio. Sprawdzić Firefox/Edge i p95/p99 czasu klatki na tym samym sprzęcie,
seedzie i ustawieniach co baza. Obejrzeć `ZiemiaNiczyja.inspect().navigation` i `contacts`.

## 5. Granica ukończenia

Kod patcha jest dostarczony; ręczne checkboxy odbioru nie zostały automatycznie zamknięte.
Nie wykonywano przeglądu jakości nowych modeli, przebudowy mapy, audio 0.5, sesji ludzkich
ani publikacji. `V0_5.md` i zaakceptowany plan 0.4.2 pozostają dokumentami użytkownika;
ten raport nie zastępuje ich arbitralnie krótszym zakresem. Wyniki lokalne dopisać przed
uznaniem 0.4.2 za odebraną bazę do 0.5.
