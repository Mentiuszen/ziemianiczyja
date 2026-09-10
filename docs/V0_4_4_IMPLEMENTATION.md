# Ziemia Niczyja 0.4.4 — implementacja i lokalny odbiór

**6 września 2026. Kod przygotowany do lokalnych testów. Nie wykonano publikacji.**

Baza: `Mentiuszen/ziemianiczyja`, commit
`a3398c211292e1cd677478ad6c4d456b6d210193` (0.4.3). Wykonanie zatwierdzonego
`V0_4_4.md`. Roboczy kod przerwanej sesji nie był dostępny w bieżącym środowisku:
zmiany odtworzono na zweryfikowanych źródłach 0.4.3, z zachowaną grafiką i podglądami.
Nie przedstawiamy dawnego zrzutu jako testu obecnego kodu.

Pracowano na kopii plików, bez `.git`, tworzenia/przełączania gałęzi, worktree,
commita, pusha ani zmiany GitHub Pages. Baza src/tests/tools/public/vendor odtwarza
odczytane Git tree SHA. Nie pobierano ani nie nadpisywano danych z komputera użytkownika.

## 1. Dostarczony zakres

| Pakiet planu | Wykonanie w kodzie | Granica odbioru |
|---|---|---|
| P0 | Weryfikacja bazy i pełne 274 testy starego kodu; kontrola skrótów | Historyczna digitalizacja całego frontu nie była wykonywana |
| P1 | Fasada UI, osobne ekrany, ograniczony kontekst powrotu i priorytety Escape | Integracja realnego inputu do potwierdzenia lokalnie |
| P2 | Main z logo/artem, 4 działaniami i wersją; picker bez ramek; brak pasków | Zachowany kadr ma tylko 426×352; nie jest nowym dużym masterem |
| P3 | 4 zakładki, wspólny schemat settings, cały remap, reset kategorii i capture | Rzeczywisty odsłuch/grafika urządzenia do lokalnego odbioru |
| P4 | Model kampanii, migracja metadanych, jedna kolejka i para rekordów w jednej transakcji | Regresje kontrolowane; natywna trwałość IndexedDB nie została odtworzona tutaj |
| P5 | Własny front-schemat, 5 punktów, Ypres→Cambrai, ruch/route/zoom/skip i reduced motion | To jawna generalizacja rysunkowa, nie precyzyjna mapa historyczna |
| P6 | Rzeczywiste shot/cannon, kopie miejsc, 3/2/1 s, granice, sesje, limit 128 | Timer i filtrowanie przetestowane bez zależności od GPU |
| P7 | Canvas z terenu/layoutu, cache/przełamania, sojusznicy/cel; prawa kolumna HUD | DOM/Canvas sprawdzone; pełna gra 3D pozostaje do odbioru |
| P8 | Kotwice głowy, prawdziwa projekcja, LOS/pool/wyciszanie, pięć sylwetek broni | Test matematyki przypiętego Babylon, nie test pełnej sceny |
| P9 | Pełne PL/EN, nowe stany i odświeżanie, dostosowane istniejące regresje | Nie podpisano ręcznego odbioru tekstu i wyglądu za użytkownika |
| P10 | 0.4.4, changelog, README, źródła/licencje UI, testy, build i pliki dostawy | Publikacja, fizyczny benchmark i przeglądarki użytkownika osobno |

## 2. Zachowanie i zgodność

Main ma tylko Kontynuuj kampanię / Nowa kampania / Opcje / O projekcie i zasobach.
Nowa kampania otwiera podgląd, nie kasuje danych; faktyczny start potwierdza zastąpienie.
Kontynuacja otwiera mapę z właściwym checkpointem i jego trudnością. Tylko Cambrai
można rozpocząć. Ukończenie otwiera tę samą mapę, nie fikcyjny kolejny poziom.

Wprowadzenie trwa 7 s, przedstawia Ypres oraz przejście do Cambrai; można je pominąć.
Menu nie buduje świata ani dodatkowej sceny Babylon. Powrót z opcji i zmiana języka
zachowują stan mapy. Animacje nie używają RNG ani czasu gry.

Opcje używają jednego schematu zakresów i kategorii. Skala 0,5–1,5 nie obcina dawnego
1,4; zmiany grafiki są scalane na klatkę. Reset nie dotyka innych kategorii ani języka.
Capture kończy się przy zmianie kategorii/języka; Escape nie wykonuje dwóch działań.

Minimapa ma północ +Z, zakres ±60 m i odrysowanie do 30 Hz. Tło powstaje z prawdziwych
danych poziomu, nie z ilustracji kampanii. Strzelec ujawnia skopiowane miejsce wystrzału,
nie swoją późniejszą pozycję. 3/2/1 s pochodzą z rzeczywistego `world.difficultyId`,
nie z trudności wybranej w opcjach dla przyszłego startu. Pauza nie zużywa terminu;
wyłączenie obrazu i zmiana języka nie kasują kontaktów. Nowy świat tworzy nową sesję.

Flagi UK oznaczają własną żywą piechotę. Projekcja używa macierzy kamery i CSS px,
uwzględnia postawy/ADS. LOS ma budżet 4 na klatkę, cache do 0,15 s. Brak wiedzy oznacza
ukryty znacznik. Flagi nachodzące na HUD lub siebie są ukrywane, nigdy przenoszone nad
innego NPC. Zdrowie i amunicja są zachowane; nazwa broni jest dostępna, ale wizualnie
zastąpiona ikoną. Brak drugiej kamery 3D, nowych raycastów AI i wywołań nawigacji dla HUD.

Zapis zachowuje `SAVE_VERSION=1`, `MISSION_VERSION=3`, klucz settings i object store
`saves`. Metadane `campaign-progress-v1` oraz checkpoint czytają/zapisują się w jednej
transakcji. Stara flaga ukończenia nie oznacza nowego przebiegu jako zakończonego.
Niepoprawne metadane są naprawiane względem poprawnego checkpointu. Błąd drugiego put
anuluje pierwszy; zatwierdzenie jest granicą zastąpienia, sesyjna odmowa zachowuje spójną
parę w pamięci. Opóźniona kontynuacja starego autosave synchronizuje zaakceptowaną parę,
nie przywraca własnego starszego kandydata.

## 3. Faktycznie wykonana weryfikacja

Środowisko: Node 22.16.0, Python 3.13.5, Pillow 12.3.0, Chromium 144.0.7559.96.

| Sprawdzenie | Wynik |
|---|---|
| `npm ci --ignore-scripts --no-audit --no-fund` | PASS; bez nowych zależności npm |
| Pełny `npm test` | **331/331 PASS**, 0 fail/cancel/skip; baza miała 274 |
| Składnia/importy/GLB | PASS; 85 JS/MJS i 15 modeli |
| Lokalizacja | PASS; 463/463 klucze PL/EN, 73 moduły, 246 statycznych odwołań |
| UI assets | PASS; 11 skrótów i ścieżki CSS; brak dystrybucji plików fontu |
| Autoplay standardowy | PASS; faza 7, 2 checkpointy, 161,73 s czasu symulacji |
| Autoplay od początku bez czołgów | PASS; faza 7, 2 checkpointy, 158,32 s czasu symulacji |
| Build | PASS; dwa kolejne manifesty identyczne; runtime 0.4.4 |
| HTTP | PASS; 96 odpowiedzi 200 w 3 konfiguracjach (source /, dist /, dist /test-repo/), 3 oczekiwane 404, poprawne MIME w tym WebP |
| Testy DOM Chromium | PASS w ograniczonej konfiguracji opisanej poniżej |
| Pełna przeglądarka HTTP + GameView | **BLOCKED** przez politykę nawigacji przed testami gry |

Testów oryginalnych nie zastąpiono wyłącznie nowym wycinkiem. Zmieniono fixture tam,
gdzie kontrakt został świadomie zmieniony: paired store, reset kategorii, wejście kampanii,
usunięte brief/controls. Zachowano ich sprawdzenia anulowania, wejścia, języka, trudności
oraz stanu świata. Przybyło **57 przypadków netto**. Czerwone reprodukcje obejmowały
między innymi stare API/flow, kontakty, kampanię, znaczniki, błąd drugiego put oraz
spóźniony autosave (stary wynik przywracał czas 0 zamiast zaakceptowanego 1).

Przeszło porównanie bajtowe **54 istniejących plików public/** i **337 vendor/**.
Dodatkowo 410 chronionych ścieżek obejmujących te rodziny, logikę symulacji, AI, walkę,
teren/dane i audio nie uległo zmianie. Te liczby częściowo się pokrywają — nie sumować.
Jedyna zmiana w plikach pojazdów to dopisanie frakcji do `cannon`. Adapter w `GameView`
dodaje projekcję HUD i nie zmienia naprawy `updateUpVectorFromRotation`.

### Co naprawdę sprawdzono w przeglądarce

Rzeczywiste moduły Application/UI i Simulation działały w `about:blank`; zmienione
zostały adresy importów na Blob oraz ścieżki aktywów na dokładne bajty data URI.
Pamięć i interfejs/projekcja GameView były fixture. Nie jest to rzeczywisty HTTP origin,
trwały IndexedDB ani renderowanie sceny 3D. Źródłowe CSS i obrazy są z bieżącej dostawy.

Sprawdzono picker, cztery zakładki, PL→EN bez zmiany zakładki, potwierdzenie resetu
z fokusem na Anuluj, powrót kampania→opcje→kampania bez replay, main w obu językach,
statusy pause/ready/dead/complete/error, cel i aktywny kontakt, niezmieniony snapshot
Simulation i terminy komunikatów po zmianie języka. Brak pageerror.

Picker mieścił się w 390×844, 844×390 i 2560×1080; computed border/outline wynosiły 0.
Dla HUD 1280×720, 844×390 i 1920×1080 prawa kolumna kończyła się nad amunicją. W niskim
oknie mapa zmniejsza się, a ostrzeżenia/napisy korzystają ze wspólnego stosu, bez dawnego
nakładania interakcji na napis. Zrzuty dotyczą bieżącego kodu, nie szkiców użytkownika.

Osobny test Node porównuje projekcję z prawdziwymi macierzami dołączonego Babylon przy
różnym pitch/yaw/roll oraz FOV 78° i 56°. To potwierdza matematykę, nie montaż pełnej sceny.

`browser_v044_ui.py --scenario all --game --executable /usr/bin/chromium` przeciw
lokalnemu serwerowi zakończył się **BLOCKED / exit 2: ERR_BLOCKED_BY_ADMINISTRATOR**.
Nie usuwano polityki i nie wpisano fikcyjnego PASS. Firefox, Edge, trwałość po restarcie,
10 pełnych cykli gry i pomiary GPU/p95/p99 **nie były wykonane**.

## 4. Nałożenie plików

ZIP jest nakładką na istniejące 0.4.3, nie samodzielnym checkoutem. Scalić katalogi,
podmienić dołączone pliki i usunąć **wyłącznie `src/ui/map.js`** zgodnie z REMOVE_FILES.txt.
Nie usuwać reszty src/tests/tools/public. Zabezpieczyć własne późniejsze lokalne zmiany.
Manifest zewnętrzny wymienia każde dodanie, zmianę i usunięcie ze skrótami bazy/wyniku.

Alternatywnie, z katalogu repo:

```sh
git apply --check ZiemiaNiczyja_0.4.4.patch
git apply ZiemiaNiczyja_0.4.4.patch
```

Użyć ZIP-a albo patcha. Przy konflikcie bazy nie wymuszać nadpisania. `dist/`, `.git`,
node_modules, logi scratch i pliki fontów nie należą do nakładki. Authoring UI zawiera
edytowalne SVG i zachowany kadr, lecz nie trafia do buildu.

```sh
npm ci
npm run check
npm test
node tools/autoplay.mjs
node tools/autoplay.mjs --destroyed-tanks
npm run build
npm run dev
```

W PowerShell można użyć `npm.cmd`. Dodatkowo `npm run preview -- --base=ZiemiaNiczyja`.
Nie publikować starego dist po podmianie samych źródeł.

## 5. Lokalny odbiór przed pushem

- [ ] Pierwszy start w osobnym profilu: brak ramek na hover/Tab, język pamiętany,
  dokładnie cztery przyciski main, logo/grafika/wersja poprawnie rozmieszczone.
- [ ] Nowa kampania→Pomiń→Wróć nie zmienia starego zapisu. Kontynuacja wznawia właściwy
  poziom trudności; cztery niedostępne rozdziały nie mają Start. Anulowanie ładowania
  i świadome zastąpienie rozdziału działają; ukończenie wraca do mapy.
- [ ] Każda kategoria opcji, capture/Escape, konflikt klawiszy, reset, PL/EN, powroty
  z main/kampanii/pauzy, realny odsłuch i wpływ ustawień grafiki.
- [ ] Minimapę porównać z poziomem, przełamaniem drutu i narożnikami świata. Strzelcy
  pozostawiają punkt 3/2/1 s, nie są śledzeni po ruchu; pauza/off-on/język nie odnawiają TTL.
- [ ] Flagi przy staniu/kucaniu/prone/ADS, za ścianą i ruchomym czołgiem, za kamerą,
  po śmierci i loadzie; nie zasłaniają celownika. Wszystkie ikony przy zmianie broni.
- [ ] Długi cel, checkpoint, napisy, granat i FPS/GPU równocześnie; 720p i ultrawide,
  renderScale/DPR/resize, PPM+LPM bez przejęcia inputu.
- [ ] Native IndexedDB i localStorage po restarcie przeglądarki, odmowa zapisu, starszy
  checkpoint, częściowy błąd transakcji. 10 pełnych cykli gry i koszt HUD na fizycznym GPU.
- [ ] Ocena grafiki menu: obecny kadr ma ograniczoną rozdzielczość; potwierdzić jego
  źródło przed publikacją lub zastąpić zatwierdzonym masterem (szczegóły UI_ART.md).

Nowe narzędzie do odtworzenia części prób, na zwykłym lokalnym serwerze:

```sh
python -m pip install playwright
python -m playwright install chromium
python tools/browser_v044_ui.py --url http://127.0.0.1:5173/ --scenario all --headed --game
```

Bez `--game` nie testuje sceny 3D. Dostępne scenariusze: menus, campaign, hud, markers,
all. `--browser firefox` wybiera Firefoksa po jego instalacji, `--executable` lokalną
przeglądarkę. Własna polityka blokująca URL albo brak WebGL2 daje BLOCKED, a nie PASS.
Scenariusz flag automatyzuje projekcję i budżet; zasłanianie konkretną geometrią wymaga
również oceny wzrokowej. Narzędzie nie używa zwykłego profilu zapisów gracza.

Aktualne narzędzia v04/v043 mają wejścia dostosowane do kampanii i zakładek. Starsze
v02/v03 pozostają historyczne. Ich pełnych testów przeglądarkowych nie uruchomiono tutaj.

## 6. Granica ukończenia

Dostarczono kod, testy, lokalne aktywa, źródła UI, changelog i dokumentację. Nie podpisano
ręcznych checkboxów, nie zmieniono planu 0.5, nie opublikowano strony. Ocena wyglądu,
pochodzenia zachowanego kadru, działania całej gry i wydajności na sprzęcie użytkownika
pozostaje jawnym etapem lokalnym, nie ukrytym za liczbą testów.
