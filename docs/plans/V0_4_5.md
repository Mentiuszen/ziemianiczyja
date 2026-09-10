# Ziemia Niczyja — v0.4.5: HUD, informacje o walce i płynność

> **Dla agenta wykonującego:** realizuj zadania kolejno, z testem regresyjnym przed zmianą i weryfikacją po niej. Do wykonania można użyć `superpowers:executing-plans` lub `superpowers:subagent-driven-development`. Ten dokument jest projektem i planem, nie raportem wykonanej implementacji.

**Cel:** zamknąć serię 0.4 poprawą czytelności HUD-u, informacji o trafieniach i zagrożeniach oraz ograniczeniem mikroprzycięć, bez przebudowy zawartości gry.

**Architektura:** symulacja nadal rozstrzyga obrażenia, zgony, postawę i kolizje. HUD otrzymuje dane i zdarzenia, ale nie podejmuje decyzji o rozgrywce. Skalowanie i rozmieszczenie korzystają ze wspólnego modelu układu. Diagnostyka przechowuje surowe próbki, a interpolacja zmienia tylko prezentację.

**Technologie:** istniejące moduły JavaScript ESM, Babylon/WebGL2, DOM/CSS/SVG, Canvas 2D, testy `node:test`. Bez wymiany silnika, bundlera ani frameworka UI.

**Specyfikacja:** rozdziały 2–7 tego dokumentu. Rozdział 8 jest planem wykonania, rozdział 9 — odbiorem.

**Baza audytu:** `Mentiuszen/ziemianiczyja`, branch `main`, commit `7c9260fc2c563532387bc3984d370ee51a01cda5` (`v0.4.4`), `package.json` 0.4.4, `uiRevision` 3. Stan odczytany 7 września 2026.

**Zakres weryfikacji autora planu:** odczyt kodu i dokumentacji przez GitHub oraz porównanie kontraktów z dokumentacją techniczną. Nie uruchomiono gry, testów repozytorium ani benchmarku na sprzęcie użytkownika. Hipotezy wydajnościowe poniżej nie są wynikami pomiarów.

## Ograniczenia globalne

- v0.4.5 jest ostatnim wydaniem serii 0.4. Nie przenosić tutaj nowych map, modeli, przebudowy kampanii ani modernizacji grafiki z przyszłego 0.5.
- Nie tworzyć branchy. Worktree wyłącznie po zgodzie użytkownika; sprzątnąć wyłącznie własne, zatwierdzone worktree. Nie usuwać cudzych zmian ani nie wykonywać `reset --hard` / `clean -fd`.
- W tym zadaniu powstaje plan. Dokument nie stanowi zgody na samodzielny push implementacji ani publikację gry.
- Nie obniżać liczby NPC, jakości presetów, zasięgu logiki, kolizji, trafień ani skuteczności AI w celu poprawienia wykresów.
- Zachować obsługę PL/EN, istniejących ustawień, checkpointów, Pointer Lock oraz oddzielenie menu od aktywnej symulacji.
- Maksymalna **efektywna** skala modułu HUD wynosi 200%. Menu, opcje i panel F3 nie podlegają skalowaniu HUD-u.
- Nie mylić czasu klatki z czasem CPU ani GPU. Brak pomiaru GPU to brak danych, nigdy 0 ms.
- Nie obiecywać stałego 165 FPS na dowolnym sprzęcie. Wyniki porównywać na tej samej konfiguracji i w powtarzalnych scenach.

## 1. Ustalenia z kodu

| ID | Ustalenie | Miejsce w bazie 0.4.4 | Znaczenie dla 0.4.5 |
|---|---|---|---|
| F01 | Celownik i hitmarker są jednym elementem; trafienie dodaje klasę `hit`. | `src/ui/hud/hud.js`, `updateHUD`, `hudMarkup` | Rozdzielić warstwy zamiast dopisywać kolejne klasy do starego celownika. |
| F02 | `.crosshair.hit` jest za `.crosshair.ads` i nadpisuje jej krycie. | `src/ui/styles/hud.css` | Nie twierdzić, że sam zapis `opacity:0` wyjaśnia błąd ADS. Potrzebny test rzeczywiście renderowanego celowania. |
| F03 | `fireBullet` ustawia `player.hitMarker=.16`; wspólny punkt obrażeń nie emituje potwierdzenia hit/kill. | `src/combat/ballistics.js`, `src/core/simulation.js` | Jeden kontrakt potwierdzeń dla pocisku, granatu i melee; kolor śmierci z rzeczywistego przejścia HP do zera. |
| F04 | Winieta i wskaźnik kierunku obrażeń już istnieją. Krytyczny tekst włącza się poniżej 30 HP i jest ukrywany przy `damageEffects=0`. | `src/ui/damage-feedback.js`, `src/ui/hud/hud.js` | Ulepszyć istniejącą ścieżkę; zmienić próg na poniżej 20%, oddzielić informację od efektów wizualnych. |
| F05 | Postawa jest już znana jako `stand/crouch/prone`, a HUD wyświetla jej tekst. | `src/core/player.js`, `src/ui/hud/hud.js` | Ikona ma odzwierciedlać zatwierdzoną postawę, nie samo naciśnięcie klawisza. |
| F06 | Alert granatu to `.some(...)` z odległością XZ <8 m i testem widoczności. Nie ma kierunku ani selekcji frakcji. | `src/ui/hud/hud.js` | Zbudować model rzeczywistych zagrożeń i projekcję kierunkową. |
| F07 | Granaty mają `id`, `owner`, `faction`, `pos`, `fuse`; wybuch korzysta z promienia 7 m, odległości 3D i zasłaniania. | `src/core/player.js`, `src/combat/ballistics.js` | Użyć istniejących danych; nie tworzyć drugiej symulacji granatów w HUD-zie. |
| F08 | Obecne dopasowanie układu sprawdza kolumnę taktyczną względem amunicji i zmniejsza minimapę. | `src/ui/ui.js`, `fitTacticalColumn` | To nie jest ogólna ochrona przed kolizjami dowolnie skalowanych modułów. |
| F09 | `reservedHudRects` odpytuje DOM przy każdym renderze. Projekcja flag ponownie odczytuje viewport. Minimapę poprzedza odczyt `clientWidth` nawet przed sprawdzeniem jej limitu odświeżania. | `src/ui/ui.js`, `src/ui/hud/friendly-markers.js`, `src/ui/hud/minimap.js`, `src/render/view.js` | Potwierdzony wzorzec pracy, ale jego koszt wymaga śladu przeglądarki. Wspólny cache układu i viewportu jest kandydatem do poprawy. |
| F10 | Monitor przechowuje 180 próbek, publikuje co 250 ms, oblicza tylko p95 odstępu klatek; CPU ma średnie. | `src/performance/monitor.js` | Przy 165 renderach/s historia obejmuje około 1,09 s. Potrzebne dłuższe okno i niezależne szeregi statystyczne. |
| F11 | GPU jest próbkowane co czwarty render, z maksymalnie czterema oczekującymi zapytaniami; eksponowana jest średnia z ostatnich 20 wyników. | `src/performance/gpu-timer.js` | Do percentyli przechowywać pojedyncze wyniki, nie wielokrotnie powieloną ostatnią średnią. |
| F12 | Symulacja ma krok 1/60 s, a `GameView.sync` ustawia pozycje bez interpolacji; delta renderera pochodzi z czasu symulacji. | `src/core/clock.js`, `src/app.js`, `src/render/view.js` | Bardzo ważny trop skokowego ruchu przy wysokim FPS; osobny problem od długich klatek. |
| F13 | Wygładzanie wysokości oka i FOV używa `Math.max(dt,.016)`, również gdy między renderami nie było kroku symulacji. | `src/render/view.js`, `sync` | Zbadać zależność przejść od częstotliwości renderowania; oddzielić czas prezentacji od czasu symulacji. |
| F14 | A* przetwarza do dwóch kompletnych ścieżek co około 0,12 s; pojedyncze wyszukiwanie może wykonać do 12000 iteracji i alokuje trzy tablice typowane. | `src/core/simulation.js`, `src/ai/navigation.js` | Limit liczby zleceń nie jest limitem czasu jednego skoku CPU. Profilować czas i liczbę rozwinięć. |
| F15 | Lista cieni i szczegóły statyczne są odświeżane w rytmie około 0,2 s; statystyki renderera również wykonują pracę w każdej klatce. | `src/render/view.js` | Sprawdzić, czy koszty okresowe zbiegają się w tych samych klatkach. Nie przebudowywać całego systemu cieni. |

Dokumenty `docs/PERFORMANCE.md` i `docs/IMPLEMENTATION_PLAN.md` nadal opisują głównie 0.4.0. `docs/V0_4_4_R3_IMPLEMENTATION.md` jest historycznym raportem rewizji. Nie traktować ich starych wyników ani statusów jako nowego benchmarku lub jako zgody na rozszerzenie zakresu 0.4.5.

## 2. Skalowanie i układ HUD-u

### 2.1. Kontrakt ustawień

Proponowany zakres suwaków: 50–200%, domyślnie 100%, krok 5 punktów procentowych. Minimum 50% jest decyzją projektową tego planu; wymaganiem użytkownika jest maksimum 200%.

`hudScale` oznacza skalę ogólną. Każdy moduł ma dodatkowy mnożnik lokalny, domyślnie 1.0:

```js
// Kontrakt modelu, nie istniejąca jeszcze implementacja.
effectiveScale = clamp(hudScale * elementScale, 0.5, 2.0);
// 150% × 100% = 150%; 150% × 150% = 200%, nie 225%.
// 200% × 200% = 200%, nigdy 400%.
```

Opcje muszą pokazywać wynik efektywny i informację o osiągnięciu limitu. Wspólna skala wpływa na każdy moduł aż do jego limitu; lokalne ustawienie nie zastępuje globalnego po cichu. Reset HUD-u przywraca wszystkie mnożniki do 1.0, ale nie rusza trudności kampanii ani innych kategorii.

Nowe preferencje utrzymać w istniejącym płaskim `SETTINGS_SCHEMA` — bez drugiego systemu walidacji. Klucze modułów:

| Moduł | Klucz lokalnej skali | Zakres zawartości |
|---|---|---|
| Minimapa | `hudMinimapScale` | Tarcza, oznaczenia i podpis minimapy |
| Cel misji | `hudObjectiveScale` | Tytuł, podpowiedź, pasek obrony |
| Zdrowie | `hudHealthScale` | Liczba HP, ikona zdrowia, pasek HP |
| Wytrzymałość | `hudStaminaScale` | Pasek wytrzymałości |
| Postawa | `hudStanceScale` | Nowa ikona postawy |
| Broń i amunicja | `hudAmmoScale` | Sylwetka broni, magazynek i zapas |
| Liczba granatów | `hudGrenadeCountScale` | Ikona wyposażenia i licznik |
| Przeładowanie | `hudReloadScale` | Stan przeładowania, pustej broni, zamka |
| Interakcja | `hudInteractionScale` | Podpowiedź przycisku i opis |
| Napisy | `hudSubtitleScale` | Dialogi i komunikaty w ich module |
| Krytyczne HP | `hudCriticalScale` | Ostrzeżenie zdrowia |
| Checkpoint / toast w grze | `hudNotificationScale` | Powiadomienia podczas rozgrywki, nie menu |
| Celownik | `hudCrosshairScale` | Geometria wybranego celownika |
| Hitmarker | `hudHitMarkerScale` | Potwierdzenie hit/kill |
| Zagrożenie granatem | `hudGrenadeWarningScale` | Ikona, strzałka i etykieta odległości |
| Flagi sojuszników | `hudAllyMarkerScale` | Rozmiar znaczników, bez zmiany projekcji punktu |
| Znacznik celu w świecie | `hudObjectiveMarkerScale` | Symbol i odległość, bez zmiany projekcji punktu |
| Prosty FPS | `hudFpsScale` | Tylko zwykły licznik FPS |

Nie dodawać oddzielnych suwaków dla każdej cyfry, litery czy fragmentu SVG. Jednostką jest widoczny, funkcjonalny moduł. Ekranowa winieta zachowuje pełne pokrycie viewportu; jej intensywność reguluje `damageEffects`, a nie skala HUD-u. F3 zachowuje osobny układ diagnostyczny.

### 2.2. Rejestr modułów i rozmieszczenie

Nowy `src/ui/hud/layout.js` odpowiada za rozmiary, kotwice, odstępy i obszary zajęte. Nie podejmuje decyzji o postawie, obrażeniach ani wykrywaniu granatów.

Układ bazowy: HP/postawa/wytrzymałość po lewej na dole; amunicja/wyposażenie po prawej na dole; minimapa i cele w prawej górnej części; teksty sytuacyjne w centralnym, zarezerwowanym pasie; celownik i hitmarker w środku. Dopuszczalny jest kontrolowany reflow celu misji do sąsiedniej strefy, jeżeli pionowa kolumna przestaje mieścić się nad amunicją.

Nie skalować całego `#hud` jednym `transform`. Transform nie zapewnia miejsca w układzie. Zewnętrzny wrapper modułu ma rezerwować jego wynikową szerokość i wysokość; wewnętrzna zawartość może być skalowana. Tekst musi zawijać się w ograniczonej szerokości. Zmiana liczby amunicji lub krótkiej etykiety nie powinna przesuwać sąsiednich modułów co klatkę.

Kolejność rozwiązywania kolizji:

1. Obliczyć wynikowe rozmiary i marginesy, uwzględniając tekst PL/EN.
2. Rozmieścić moduły w strefach z odstępem bazowym 12 CSS px przy skali 100%.
3. Zawijać tekst, przenosić moduły do alternatywnych stref i ograniczać puste odstępy, zanim nastąpi ograniczenie treści.
4. Gdy fizycznie brakuje miejsca, zachować HP, amunicję, kierunek granatu i środek celowania; ograniczać najpierw treści pomocnicze.
5. Jawnie oznaczyć tryb kompaktowy w opcjach. Nie zmieniać zapisanych skal i nie obiecywać pełnego układu 200% na dowolnie małym ekranie.

Wygenerowany `LayoutSnapshot` zawiera viewport w CSS px, wynikowe prostokąty modułów i obszar chroniony celownika/hitmarkera. Flagi, granaty i znaczniki świata używają tego samego snapshotu. Nie tworzyć osobnych, rozjeżdżających się list zakazanych obszarów.

Odczyty geometrii grupować przed zapisami DOM. Cache unieważniać po resize, zmianie skali, języka, widoczności modułu, treści zmieniającej rozmiar i zakończeniu ładowania fontu/ikony. Zdarzenia z `ResizeObserver` scalać; bez pętli obserwator → pomiar → zapis → obserwator. Ruch świata nie jest powodem do ponownego mierzenia stałego HUD-u.

### 2.3. Ostrość minimapy

Model układu przekazuje minimapie końcowy rozmiar w CSS px. Rozmiar bufora Canvas wynika z tego rozmiaru oraz istniejącego limitu DPR. Skalowanie samego transformu nie może pozostawić starego, zbyt małego bufora. Rozmiar bufora zmieniać wyłącznie po zmianie rozmiaru/DPR, nie w każdej klatce. Zachować istniejące cache tła i ograniczenie częstotliwości rysowania.

## 3. Postawa i obrażenia

### 3.1. Ikony postawy

Dodać trzy czytelne, spójne sylwetki SVG: stojący, kucający, leżący/czołgający się. Umieścić ikonę bezpośrednio obok grupy zdrowia, najlepiej przed HP; nie dokładać nowego pływającego panelu w centrum.

Źródłem jest `world.player.stance`. Gdy niskie przejście blokuje wstanie, ikona nadal pokazuje przyjętą postawę. Skok nie jest nową postawą. Zachować lokalizowaną etykietę dostępną dla technologii asystujących; nie opierać rozróżnienia wyłącznie na kolorze. Aktualizacja po faktycznej zmianie stanu, również po wczytaniu checkpointu.

### 3.2. Efekt otrzymania obrażeń

Zachować jedną ścieżkę `damageFeedback` i zdarzenie `hurt`; nie nakładać drugiej niezależnej winiety. Odświeżyć efekt w stronę czerwonych narożników/krawędzi z wolnym środkiem ekranu, krótkim wejściem i łagodnym zanikiem. Bazowy czas zaniku można zachować w okolicy istniejących 0,65 s.

Zdarzenie ma być wyzwalane przez rzeczywistą utratę HP. Kolejne obrażenia odświeżają jeden stan animacji, bez tworzenia nowych elementów DOM i bez kumulowania nieprzejrzystej czerwieni. Kierunek obrażeń pozostaje osobną informacją. Żaden efekt nie zmienia orientacji świata ani bazowego `camera.upVector`.

`damageEffects=0` wyłącza winietę/pulsowanie, ale nie komunikat krytycznego HP. Ograniczenie animacji lub `prefers-reduced-motion` usuwa pulsowanie i nagłe błyski, zachowując statyczną informację. Pełnoekranowy CSS `filter` istniejący na canvasie ująć w próbie A/B — jego koszt nie jest objęty samym timerem renderu WebGL.

### 3.3. Krytyczne zdrowie

Warunek widoczności: gracz żyje i `hp / maxHp < 0.20`. W bazie zdrowie ma zakres do 100; wspólną wartość maksymalną utrzymać zgodną z `Health`, nie dodawać niezależnego limitu w HUD-zie. Przy dokładnie 20% ostrzeżenie nie jest aktywne.

EN: **“You’re hurt! Get to cover!”**

PL: **„Jesteś ranny! Znajdź osłonę!”**

Tekst pozostaje widoczny przez czas zagrożenia, nie jest dopisywany do kolejki co klatkę. Ogłoszenie dostępności lub dodatkowe jednorazowe powiadomienie ma blokadę ponownego wyzwalania; ponowne uzbrojenie po odzyskaniu co najmniej 25% HP. Ta histereza dotyczy powiadomienia, nie przedłuża widoczności tekstu powyżej 20%. Śmierć, nowa misja i zamknięcie świata czyszczą stan.

## 4. Nowe celowniki i hitmarker

### 4.1. Celowniki

Nowe ustawienie `crosshairStyle`: `dot`, `cross`, `cross-dot`, `none`. Domyślnie `cross`: cztery oddzielne ramiona i przejrzysty środek, w stylu klasycznego celownika FPS. `cross-dot` to ten sam układ z małą kropką; `none` wyłącza tylko celownik, nie potwierdzenia trafień.

Stary krzyż obracany w hitmarker zostaje usunięty z aktywnej implementacji — bez opcji „legacy”. Nie zmieniać rozrzutu ani celności broni zależnie od kosmetycznego wyboru. Podgląd w opcjach nie wymaga tworzenia świata ani WebGL. Menu samo pozostaje w dotychczasowej skali.

### 4.2. Niezależna warstwa trafień

Nowy element `#hit-marker` jest rodzeństwem celownika. Nie dziedziczy ukrycia ADS ani `crosshairStyle=none`. Trafienie: biały marker; zabójstwo: czerwony. Proponowane czasy: 160 ms dla hit i 260 ms dla kill; dopuszczalna korekta po odbiorze wizualnym bez zmiany kontraktów stanu.

Marker ma cztery ukośne kreski wokół środka, a nie dwie linie przechodzące przez cel. Punkt startowy przy 100%: promień wewnętrzny 18 CSS px, długość kreski 6 px, grubość 2 px. Model geometrii zwiększa odstęp, gdy duży celownik zajmuje więcej miejsca: promień hitmarkera musi przekraczać zewnętrzny promień celownika z marginesem. Zmiana skali zmienia geometrię, a nie położenie środka.

Na potrzeby testów ADS oddzielić trzy możliwe przyczyny: brak zdarzenia, zbyt krótki stan oraz niewłaściwą prezentację przy przyrządach broni. W obecnym CSS `hit` już nadpisuje `ads`; nowa implementacja nie może uznawać dopisania `opacity:1` za wystarczającą naprawę.

### 4.3. Źródło prawdy dla hit/kill

W `Simulation.damage` po zatwierdzeniu obrażeń wyemitować zdarzenie `combat-feedback` tylko wtedy, gdy właścicielem obrażeń jest gracz, cel jest przeciwnikiem i HP faktycznie spadło.

```js
// Docelowy kontrakt zdarzenia emitowanego przez symulację:
{
  type: 'combat-feedback',
  feedbackId: 123,       // monotoniczny numer w obrębie instancji świata
  time: 42.5,
  sourceId: 'player',
  targetId: 'de-4',
  damage: 34,            // rzeczywista różnica HP, nie nadmiarowe obrażenia
  kind: 'bullet',        // bullet | explosion | melee
  killed: false,         // wyłącznie przejście żywy -> martwy
  hitPart: 'torso'       // opcjonalne; nie wymyślać go dla eksplozji
}
```

UI traktuje to jako prezentację. Nie liczy zgonów ze zmiany licznika `kills`, nie zgaduje ich na podstawie animacji i nie przyznaje graczowi zabójstwa wykonanego przez NPC. Właściciel granatu musi być zachowany również wtedy, gdy obiekt źródłowy nie jest już dostępny.

W jednej paczce zdarzeń `kill` ma priorytet nad `hit`. Kolejny zwykły hit nie zmienia aktywnego czerwonego markera na biały. Kolejny kill może przedłużyć czerwony stan. Usunąć stary zapis `player.hitMarker=.16` i zależną klasę dopiero po przełączeniu całego przepływu, tak aby nie uzyskać dwóch potwierdzeń jednego trafienia. Zachować dotychczasowe znaczenie statystyk celności — ta zmiana nie powinna niejawnie wliczyć obrażeń granatu do liczby trafień pocisków.

## 5. Kierunkowe ostrzeżenia o granatach

Nowy `src/ui/hud/grenade-warning.js` buduje model z istniejących granatów. Nie pokazuje ostrzeżenia dla granatu własnego/sojuszniczego, jeśli według obecnych zasad nie może on uszkodzić gracza. To wynika z kontraktu `Simulation.damage`, a nie z założenia, że każdy granat jest zawsze groźny.

Do kwalifikowania zagrożenia używać dystansu 3D, czasu zapalnika i zasad zasłaniania spójnych z wybuchem. Można zachować pas wczesnego ostrzegania około 8 m wobec promienia wybuchu 7 m. Nie używać wyłącznie widoczności z oka gracza: granat niewidoczny w okopie nadal może być groźny dla części ciała, do której dotrze wybuch. Całkowicie odizolowany, nieszkodliwy granat nie powinien generować identycznego alarmu jak granat przy nogach.

Gdy granat jest na ekranie: znacznik przy jego rzeczywistej projekcji, strzałka jednoznacznie wskazująca pozycję. Gdy jest poza ekranem: znacznik na bezpiecznej krawędzi viewportu, obliczony z kierunku w przestrzeni kamery. Granatu za plecami nie wolno zwyczajnie przepuścić przez clamp współrzędnych projekcji przed kamerą. Przy różnicy wysokości dodać małą wskazówkę góra/dół.

Wyświetlać maksymalnie trzy najbardziej pilne zagrożenia, sortowane stabilnie według pilności i odległości, z dodatkowym licznikiem pozostałych. Zachować ID między klatkami, aby znacznik nie przeskakiwał pomiędzy prawie równymi kandydatami. Wygaszenie następuje przy wybuchu, usunięciu, utracie zagrożenia i zamknięciu świata.

Projekcja korzysta z końcowej kamery i `LayoutSnapshot` w CSS px, nie z rozdzielczości bufora renderującego. Kotwica pozostaje prawidłowa przy renderScale 50%, 100% i 150%, DPR 1/2, ADS oraz zmianie skali HUD. Rozmiar i pozycja są oddzielnymi danymi.

W przypadku kolizji ikony z HUD-em jej przesunięcie musi zachować kierunek/łącznik do rzeczywistego punktu. Nie przesuwać „pozycji granatu” w dowolne wolne miejsce. Nie tworzyć elementów DOM co klatkę: mała pula węzłów i ograniczona liczba testów zasłaniania.

## 6. F3 i poprawne pomiary

### 6.1. Zakres opcji i migracja

Usunąć `showCpu` i `showGpu` z widocznych opcji oraz aktywnego schematu ustawień. Ich stare zapisane wartości ignorować. Nie resetować reszty ustawień ani checkpointów. `showFps` pozostaje prostym wyborem użytkownika.

Usunąć CPU/GPU ze zwykłego `updatePerformance`. Warunek w `Application.loop` nie może już włączać timerów przez `settings.showGpu`; źródłem jest otwarta diagnostyka F3 lub świadomie rozpoczęta sesja pomiarowa. Po zamknięciu diagnostyki nie wykonywać formatowania rozbudowanego panelu. Aktywna, jawna rejestracja może działać bez widocznego panelu, aby zmierzyć jego koszt.

### 6.2. Słownik metryk

| Metryka | Definicja |
|---|---|
| FPS avg | 1000 / średni odstęp pomiędzy renderami; nie średnia arytmetyczna chwilowych FPS |
| Frame avg / p50 / p95 / p99 / max | Odstępy czasu pomiędzy renderami aplikacji, w ms |
| RAF interval | Rytm callbacków przeglądarki; osobno od renderów pomijanych przez limiter |
| CPU avg / p95 / p99 / max | Zmierzona praca JS aplikacji; nie obciążenie całego procesora i nie cała praca przeglądarki |
| CPU per RAF / per render | Rozróżnienie pracy pojedynczego callbacku i pracy zsumowanej między renderami przy aktywnym limicie |
| GPU avg / p95 / p99 / max | Pojedyncze ważne wyniki asynchronicznych zapytań WebGL2, w ms |
| FPS @ frame p95 / p99 | 1000 / odpowiedni percentyl czasu klatki; użyteczna prezentacja wolnego ogona w FPS |
| FPS p95 / p99 | Literalne percentyle próbek 1000/frameMs; pokazują szybki ogon, nie mikroprzycięcia. Dostępne w szczegółach, z jednoznaczną etykietą. |
| Przekroczenia budżetu | Liczba i łączny nadmiar czasu ponad 1,5× oraz 2× budżet, a także >16,67 i >33,33 ms |

Nie podpisywać automatycznie `1000/frameP99` jako średniej „1% low”. Jeżeli zostanie dodana średnia najwolniejszego 1% próbek, musi mieć oddzielną definicję i nazwę. Domyślnie wystarczą opisane wyżej pola.

CPU rozbić na symulację, audio, obsługę zdarzeń, synchronizację sceny, wywołanie renderera, HUD i koszt profilera. Nawigacja/kolizje/AI mogą być zakresami wewnątrz symulacji — ich wartości nie mogą zostać drugi raz dodane do CPU total. CPU nie obejmuje automatycznie późniejszego layoutu, paint/compositingu ani całej pracy sterownika.

CPU i GPU nie sumują się wprost do czasu klatki. Nie wyświetlać fikcyjnego `VSync wait = frame - CPU - GPU`. Timer WebGL nie obejmuje całego składania DOM/CSS przez przeglądarkę. Rozpoznanie „CPU/GPU/scheduling” jest wskazówką z ograniczeniami, a nie nieomylnym automatem.

### 6.3. Surowe dane i okno

Domyślne okno: ostatnie 10 s aktywnej gry, publikacja statystyk co 250 ms. Użyć prealokowanego bufora pierścieniowego; 8192 rekordy pokrywają 10 s przy istniejącym limicie aplikacji do 360 FPS z zapasem. Gdy osiągnięty zostanie limit pojemności, ujawnić rzeczywisty zakres czasu danych zamiast twierdzić, że nadal obejmuje pełne 10 s.

Próbka ma `frameId`, identyfikator sesji, timestamp, odstęp renderu, zmierzone zakresy CPU, liczbę kroków symulacji, informację o limiterze i flagi zdarzeń. Nie sortować danych ani budować dużych obiektów przy każdym renderze. Używać ponownie buforów roboczych przy publikacji.

Percentyl: metoda nearest-rank, po odrzuceniu wartości nieprawidłowych dla danej metryki. Dla uporządkowanych próbek `x`: `Q(p)=x[ceil(p*n)-1]`. Nieprawidłowy wynik nie zmienia się w zero. Dopuszczalne zera CPU/GPU rozpatrywać zgodnie z danymi; zerowy lub ujemny odstęp klatki jest nieważny.

Wyświetlać `n` i długość okna. Proponowana reguła prezentacji: p99 przy mniej niż 100 ważnych próbkach oznaczać jako brak wystarczających danych; przy mniej niż 1000 dodać ostrzeżenie o małej próbie. To szczególnie ważne dla GPU próbkowanego rzadziej niż CPU. Są to progi ostrzegania przyjęte dla tego projektu, nie uniwersalna gwarancja statystyczna. Nawet 1000+ próbek nie dowodzi reprezentatywności ogona.

Nie usuwać prawdziwych stallów jako „outliers”. Pauza, ukryta karta, wczytanie świata i zmiana konfiguracji tworzą nowy segment pomiarowy. Nie mieszać menu i aktywnej walki. Odstęp klatki rejestrować przed clampem czasu dla symulacji.

### 6.4. GPU bez blokowania

Zachować `EXT_disjoint_timer_query_webgl2`, ograniczoną kolejkę i asynchroniczny odczyt. Do wyniku dopiąć `frameId`, `sessionId` i czas wysłania zapytania. Wynik konsumować tylko raz. Nie kopiować ostatniej średniej GPU do każdej próbki CPU.

Używać `QUERY_RESULT_AVAILABLE`; bez `gl.finish`, wymuszonego readbacku i pętli czekającej. `disjoint`, utrata kontekstu, stara generacja świata i wynik zbyt stary powodują odrzucenie odpowiednich danych. Nie przypisywać opóźnionego wyniku GPU aktualnej klatce CPU.

Pokazywać statusy: wyłączony, oczekiwanie, gotowy, brak rozszerzenia, disjoint, utrata kontekstu. Ujawniać częstość próbkowania i liczbę wyników. W trybie rejestracji można zwiększyć częstość do każdej klatki, ale pomiar bazowy i końcowy muszą mieć te same ustawienia. Sprawdzić, czy regularne próbkowanie co N klatek nie pomija regularnych skoków; przesuwanie fazy próbkowania nie może używać RNG rozgrywki.

### 6.5. Panel i zapis pomiaru

F3 powinno mieć czytelny blok czasu klatki/CPU/GPU, mały wykres historii oraz blok symulacji: liczba kroków, porzucony czas, kolejka A*, rozwinięcia, liczba raycastów i istniejące dane sceny. Na małej wysokości nie ukrywać najważniejszych percentyli za obecnym `overflow:hidden`.

Dodać reset segmentu oraz kontrolowaną rejestrację/eksport surowych danych przez interfejs diagnostyczny lub narzędzie testowe. Eksport wykonywać na żądanie, poza gorącą ścieżką. Raport zapisuje commit, przeglądarkę, urządzenie/GPU zadeklarowane przez operatora, rozdzielczość CSS/bufora, DPR, preset, renderScale, cap, docelowe Hz i ustawienia diagnostyki. Nie dopisywać niezmierzonych danych sprzętu.

## 7. Płynność: dwa oddzielne problemy

### 7.1. Skokowy ruch mimo regularnych klatek

Zachować symulację 60 Hz. Nie podnosić jej do 165 Hz jako obejścia. Dodać bufor poprzednich/bieżących **transformacji prezentacji**, nie pełnych checkpointów świata. Alfa pochodzi z akumulatora zegara:

```js
alpha = clamp(clock.accumulator / clock.step, 0, 1);
renderPosition = previousPosition * (1 - alpha) + currentPosition * alpha;
```

Przed każdym faktycznym tickiem zachować poprzednie transformacje; po ticku bieżące. Dotyczy to również sytuacji z kilkoma krokami w jednym RAF. Nie wywoływać `world.snapshot()` co klatkę i nie interpolować HP, amunicji, decyzji AI ani zdarzeń.

Interpolować ruch aktorów, pojazdów i istotnych obiektów świata oraz pozycję kamery gracza. Obrót lokalnego gracza wymaga oddzielnej ścieżki bez dodatkowego opóźnienia wygładzającego: nie interpolować wstecz aimu jak ruchu odległego NPC. Proponowana prezentacja bierze zatwierdzony yaw/pitch i niewykonsumowaną deltę myszy z niezużywającego odczytu `Input.peekLook()`. Następny tick nadal konsumuje tę deltę dokładnie raz. Współdzielić clamp pitch i zasady blokady obrotu prone z logiką gracza; nie tworzyć odmiennego „wizualnego celowania”.

Test musi potwierdzić zgodność kierunku strzału z zatwierdzonym wejściem, brak podwójnej delty, brak nagłego cofnięcia po ticku, brak przenoszenia bufora przez pauzę i brak regresji ADS/PPM. Przesunięcie pozycji przez standardową interpolację niesie opóźnienie do jednego kroku symulacji; odczucie sterowania musi zostać odebrane świadomie. Nie dokładać następnego filtra pozycji.

Wygładzanie FOV, wysokości oka i czysto wizualne przejścia korzystają z aktywnej delty prezentacji, bez sztucznego minimum 16 ms przy każdym renderze. Nie integrować po raz drugi efektów, które już są sterowane czasem symulacji. Po pauzie, wczytaniu, korekcie pozycji, teleportacji technicznej i zmianie świata zsynchronizować oba bufory, aby nie interpolować przez ścianę. Ponownie przetestować znaną regresję przechylenia kamery po eksplozji.

Znaczniki świata muszą używać tej samej końcowej kamery i tych samych pozycji prezentacyjnych co obiekty, które oznaczają. W przeciwnym razie flaga/granat może drgać względem płynnego modelu.

### 7.2. Rzeczywiste długie klatki

Wprowadzać optymalizacje w kolejności wskazanej przez pomiar, a nie przez rozmiar pliku. Dla każdej zmiany zapisać: wskazaną gorącą ścieżkę, ślad przed, zmianę, wynik po i test poprawności.

| Kandydat | Co sprawdzić | Dopuszczalna zmiana po potwierdzeniu |
|---|---|---|
| DOM HUD i projekcje | Liczba pomiarów geometrii, wymuszone layouty, czas aktualizacji HUD | Cache węzłów/prostokątów/viewportu, wspólny batch odczytów, aktualizacje zależne od zmian |
| Minimapa | Budowa przy pierwszym pokazaniu i po zniszczeniu drutu, alokacje i resize bufora | Przygotowanie tła podczas ładowania; aktualizacja tylko brudnej części lub etapami, z zachowaniem poprzedniego poprawnego obrazu |
| A* | Czas pojedynczego joba, rozwinięcia, alokacje tablic, wielkość kolejki | Ponowne wykorzystanie pamięci; przy konieczności wyszukiwanie w ograniczonych porcjach z zachowaniem priorytetów/generacji |
| Aktualizacje kolizji dynamicznych | Wiele `refreshDynamic` w jednym ticku, liczba nowych obiektów | Aktualizacje w miejscu i poprawne wersjonowanie po ruchu konkretnego pojazdu; bez nieaktualnych colliderów |
| Detale/cienie | Zbieganie pełnych przeglądów w tych samych klatkach, zmiany LOD | Rozłożenie niezależnych prac, brudne listy, ponowne użycie tablic, pomijanie niezmienionych operacji |
| Animacje | Grupowanie próbkowania NPC, alokacje quaternionów, przełączanie stanów | Rozproszenie terminów i buforowanie; bez obniżenia aktualnie obowiązującej jakości |
| Efekty/audio | Szczyty podczas salw i wybuchów, GC, tworzenie zasobów | Naprawa faktycznych alokacji/pul w gorącej ścieżce; nie globalna redukcja efektów lub strzałów |
| F3/profiler | Narzut formatowania, sortowania, rysowania i zapytań GPU | Ograniczona publikacja, prealokacja, brak pracy panelu gdy jest niewidoczny |
| Pierwsze użycie | Kompilacja/upload podczas pierwszego efektu lub broni | Celowany warm-up podczas ładowania, tylko dla rzeczywiście potwierdzonego zasobu |

Dwa joby A* mogą nadal zablokować klatkę. Jeżeli potrzebne jest dzielenie wyszukiwania, jednostką budżetu są rozwinięcia/porcje pracy, a nie samo rozpoczęcie joba. Zachować `actor.pathGeneration`, anulowanie martwego aktora, priorytety evade/retreat i unieważnianie po zmianie przeszkód. Testować maksymalne oczekiwanie w kolejce oraz zachowanie nawigacji. Nie przenosić całej symulacji do workera w tym wydaniu bez osobnego, zatwierdzonego projektu.

Limiter testować osobno. `maxFps=0` wyłącza limit aplikacji, nie gwarantuje wyłączenia synchronizacji przeglądarki. Nierówne odstępy capu niebędącego dzielnikiem Hz nie są automatycznie błędem A*. Nie naprawiać tego przez aktywne oczekiwanie albo `setTimeout` udający dodatkowe rendery.

Przy 165 Hz budżet odświeżania wynosi około 6,06 ms. API Long Tasks/Long Animation Frames z progiem około 50 ms nie wystarczy do wykrycia wszystkich istotnych mikroprzycięć. Korzystać z surowych odstępów RAF/render i śladów przeglądarki.

## 8. Plan wykonania dla agenta

Nowe pliki poniżej są proponowane, nie istniejące. Ograniczyć zmiany w `app.js`, `ui.js` i `view.js` do integracji wyspecjalizowanych modułów. Nie rozbijać całego projektu przy okazji.

### T00 — baza i reprodukcja

**Pliki:** `docs/PERFORMANCE.md`, `docs/TEST_REPORT.md`; nowy `docs/V0_4_5_VALIDATION.md`.

- [ ] Sprawdzić aktualny commit oraz lokalne zmiany; zweryfikować, czy baza nadal odpowiada temu planowi.
- [ ] Uruchomić bazowe polecenia poniżej. Zapisać rzeczywiste wyniki, nie kopiować liczby PASS z dokumentu R3.
- [ ] Zarejestrować ADS z potwierdzonym trafieniem oraz ruch kamery/NPC przy 60, 120 i 165 Hz, gdy dostępne.
- [ ] Wskazać scenę mikroprzycięcia, konfigurację i powtarzalny przebieg. Osobno oznaczyć brak dostępnego urządzenia/testu.

```sh
npm ci
npm run check
npm test
npm run build
```

**Odbiór:** powtarzalna baza i lista faktycznie istniejących błędów, bez zmian gameplayu.

### T01 — statystyki czasu klatki i CPU

**Nowe:** `src/performance/statistics.js`, `tests/v045-performance.test.mjs`.
**Zmiany:** `src/performance/monitor.js`, `src/app.js`.
**Interfejsy:** `summarizeSamples(values) -> {count, mean, p50, p95, p99, max}`; `PerformanceMonitor.record(sample, now)` zachowuje dotychczasową rolę i dostaje rozszerzone dane.

- [ ] Dodać test nearest-rank, pustych danych, nieprawidłowych wartości, ring-wrap oraz usuwania tylko danych starszych niż okno.
- [ ] Potwierdzić FAIL przed dodaniem modułu, wdrożyć prealokowany kolektor i potwierdzić PASS.
- [ ] Rozdzielić próbki RAF, render interval i zakresy CPU; sumować pominięte callbacki tylko w wariancie CPU per render.
- [ ] Dodać liczbę kroków zegara, porzucony czas i oznaczenia segmentu. Nie ścinać zarejestrowanej długości prawdziwej klatki.
- [ ] Zmierzyć koszt publikacji statystyk i nie wykonywać sortowania w każdej klatce.

```js
// Wymagany test nowego summarizeSamples (node:test / node:assert/strict):
const values = Array.from({length: 100}, (_, i) => i + 1);
const s = summarizeSamples(values);
assert.equal(s.mean, 50.5);
assert.equal(s.p95, 95);
assert.equal(s.p99, 99);
assert.equal(summarizeSamples([]).p99, null);
```

```sh
node --test tests/v045-performance.test.mjs
```

**Odbiór:** znane szeregi dają dokładne wyniki, a jeden stall pozostaje w danych do naturalnego wyjścia z okna.

### T02 — surowe GPU i nowe F3

**Nowe:** `src/ui/hud/diagnostics.js`, `tests/v045-gpu-timer.test.mjs`.
**Zmiany:** `src/performance/gpu-timer.js`, `src/ui/hud/hud.js`, `src/ui/styles/hud.css`, `src/app.js`, `src/i18n/pl.js`, `src/i18n/en.js`.
**Interfejs:** `GpuTimer.drainSamples()` oddaje nowe rekordy `{frameId, sessionId, submittedAt, milliseconds}` dokładnie raz.

- [ ] Dodać test atrapy GL: wynik niedostępny przez kilka odczytów, potem dostępny, disjoint, context loss i stary identyfikator sesji.
- [ ] Wdrożyć zachowanie surowych wyników i osobne statystyki GPU zgodne z rozdziałem 6.
- [ ] Wydzielić render panelu F3; dodać percentyle, n, okno, wykres i statusy.
- [ ] Zachować prosty FPS poza F3; bez CPU/GPU w zwykłym overlayu.
- [ ] Dodać rejestrację/eksport diagnostyczny i porównać narzut otwartego/zamkniętego F3 w tej samej sesji pomiarowej.

**Odbiór:** brak blokującego odczytu, brak powielania średniej i brak fałszywego GPU=0.

### T03 — ustawienia HUD i usunięcie CPU/GPU z opcji

**Nowe:** `src/ui/hud/settings.js`, `tests/v045-hud-settings.test.mjs`.
**Zmiany:** `src/save/settings-schema.js`, `src/ui/screens/settings.js`, `src/app.js`, katalogi PL/EN.
**Interfejs:** `getHudScale(settings, moduleId)` zwraca efektywną skalę zgodną z rozdziałem 2.

- [ ] Dodać testy ustawień 0.4.4 z `showCpu/showGpu=true`, brakujących nowych pól, NaN/Infinity i wartości spoza zakresu.
- [ ] Dodać skalę globalną, wszystkie skale modułów i wybór celownika w istniejących opcjach rozgrywki.
- [ ] Dodać wspólny reset HUD i prezentację wyniku efektywnego; zachować trudność kampanii.
- [ ] Usunąć stare przełączniki i zależności runtime, a nie jedynie ukryć wiersze CSS-em.
- [ ] Zweryfikować trwałość ustawień po przeładowaniu strony oraz fallback istniejącego Store przy niedostępnej pamięci.

```js
assert.equal(getHudScale({hudScale: 1.5, hudMinimapScale: 1}, 'minimap'), 1.5);
assert.equal(getHudScale({hudScale: 1.5, hudMinimapScale: 1.5}, 'minimap'), 2);
assert.equal(getHudScale({hudScale: 2, hudMinimapScale: 2}, 'minimap'), 2);
```

**Odbiór:** żaden moduł nie osiąga 400%; menu i F3 nie zmieniają wymiarów od suwaka HUD.

### T04 — wspólny layout i skalowanie modułów

**Nowe:** `src/ui/hud/layout.js`, `tests/v045-hud-layout.test.mjs`.
**Zmiany:** `src/ui/ui.js`, `src/ui/hud/hud.js`, `src/ui/hud/minimap.js`, `src/ui/hud/friendly-markers.js`, `src/render/view.js`, `src/ui/styles/hud.css`.
**Interfejsy:** `HudLayout.invalidate(reason)`, `HudLayout.update()` i `HudLayout.snapshot()`; snapshot udostępnia viewport/rects/obszar środka bez nowych pomiarów DOM.

- [ ] Testować rejestr modułów, rozmiary efektywne, marginesy, alternatywne strefy i tryb fizycznego braku miejsca.
- [ ] Zastąpić `fitTacticalColumn` oraz wielokrotne `reservedHudRects` jednym modelem.
- [ ] Wprowadzić wrappery rezerwujące wynikowe wymiary. Zachować wszystkie widoczne moduły z rozdziału 2.
- [ ] Przekazać rzeczywisty rozmiar do minimapy i raz na potrzebę przygotować viewport dla projekcji.
- [ ] W teście przeglądarkowym porównać prostokąty po transformacjach; celowe nakładanie warstw ekranowych oddzielić od przypadkowych kolizji paneli.

**Odbiór:** brak kolizji na macierzy wspieranych rozmiarów; brak pomiarów statycznego układu zależnych od samego ruchu świata.

### T05 — ikony postawy

**Nowe:** `src/ui/hud/stance.js`, `public/assets/ui/stance-stand.svg`, `public/assets/ui/stance-crouch.svg`, `public/assets/ui/stance-prone.svg`, `tests/v045-stance.test.mjs`.
**Zmiany:** `src/ui/hud/hud.js`, style HUD, katalogi językowe i rejestr licencji zasobów, jeżeli wymagany.

- [ ] Testy stanów stand/crouch/prone i odrzuconej próby wstania.
- [ ] Dodać i podpiąć trzy oryginalne ikony wektorowe; nie ładować zewnętrznego fontu ikon.
- [ ] Umieścić postawę obok HP we wspólnym layoutcie; zachować etykietę dostępną.
- [ ] Sprawdzić restore, skok, pauzę i skale 50/100/200%.

**Odbiór:** ikona zawsze odpowiada zatwierdzonej postawie, również pod niskim stropem.

### T06 — obrażenia i próg 20%

**Nowy test:** `tests/v045-damage-feedback.test.mjs`.
**Zmiany:** `src/ui/damage-feedback.js`, `src/ui/hud/hud.js`, style HUD, PL/EN.

- [ ] Testy HP: 100, 20, 19, 1, 0; ponowne wejście po uleczeniu; intensywność 0; reduced motion.
- [ ] Ulepszyć istniejącą winietę do czytelnych narożników, bez dublowania warstw.
- [ ] Dodać tekst i blokadę powtarzanych ogłoszeń zgodnie z rozdziałem 3.
- [ ] Sprawdzić serię obrażeń, eksplozję, śmierć, checkpoint i brak ruchu efektów za menu.

**Odbiór:** dokładnie 20% nie uruchamia komunikatu; 19% uruchamia go także przy wyłączonych efektach.

### T07 — wspólne hit/kill i nowe celowniki

**Nowe:** `src/ui/hud/crosshair.js`, `src/ui/hud/hit-feedback.js`, `tests/v045-combat-feedback.test.mjs`, `tests/v045-crosshair.test.mjs`.
**Zmiany:** `src/core/simulation.js`, `src/combat/ballistics.js`, `src/core/player.js`, `src/ui/ui.js`, `src/ui/hud/hud.js`, style HUD, opcje i PL/EN.
**Interfejsy:** `HitFeedback.accept(event, sessionId)`, `HitFeedback.sample(simulationTime)`, `HitFeedback.reset(sessionId)`; stany `none/hit/kill`.

- [ ] Testy: dodatnie obrażenie, brak obrażenia, przyjaciel, corpse, kill gracza, kill NPC, grenade/melee gracza i wiele trafień w jednym ticku.
- [ ] Przenieść emisję potwierdzenia do jedynego miejsca zatwierdzającego HP. Zachować liczniki celności.
- [ ] Wprowadzić oddzielne DOM-y i nową geometrię, następnie usunąć stary timer i klasę.
- [ ] Testować priorytet kill nad następującym po nim hit oraz wyczyszczenie świata/pauzy.
- [ ] Sprawdzić każdą dostępną broń w ADS, przełączanie ADS w czasie efektu, przeładowanie i celownik `none`.

**Odbiór:** biały hit i czerwony kill są czytelne poza środkiem celowania w ADS i bez ADS.

### T08 — kierunek granatu

**Nowe:** `src/ui/hud/grenade-warning.js`, `tests/v045-grenade-warning.test.mjs`.
**Zmiany:** `src/ui/hud/projection.js`, `src/ui/hud/hud.js`, layout, style, PL/EN.

- [ ] Testy czterech kierunków, za plecami, przy nogach, nad/pod graczem, za osłoną i po odbiciu.
- [ ] Uzgodnić model zagrożenia z rzeczywistym wybuchem i filtrem frakcji.
- [ ] Dodać projekcję onscreen/offscreen i stabilny wybór maksymalnie trzech zagrożeń.
- [ ] Dodać pulę znaczników i odbiór skali HUD, DPR, renderScale i ADS.
- [ ] Testować jednoczesny wybuch/usunięcie, wiele granatów i zmianę świata.

**Odbiór:** strzałka wskazuje faktyczny kierunek; nie pozostaje po wybuchu i nie podaje fałszywej pozycji przy konflikcie z panelem.

### T09 — interpolacja i czas prezentacji

**Nowe:** `src/render/presentation-state.js`, `tests/v045-presentation.test.mjs`.
**Zmiany:** `src/core/clock.js`, `src/app.js`, `src/render/view.js`, `src/input/input.js`; integracja prezentacji pojazdów/granatów i znaczników.
**Interfejsy:** `PresentationState.beforeTick(world)`, `afterTick(world)`, `reset(world)`, `sample(alpha)`; `Input.peekLook()` nie zmienia bufora wejścia.

- [ ] Zbudować test syntetycznego ruchu 60 Hz oglądanego przy 60/120/144/165/240 Hz; najpierw wykazać schodkowanie bazy.
- [ ] Wdrożyć bufor transformacji i interpolację, nie modyfikując autorytatywnego świata.
- [ ] Dodać niezużywający podgląd myszy i wspólne ograniczenia obrotu; przetestować jednokrotne zużycie delty w następnym ticku.
- [ ] Usunąć zależność wygładzania FOV/oka od wymuszonego minimum 16 ms na render.
- [ ] Testować kilka ticków na RAF, brak ticku, śmierć, spawn, restore, korektę kolizji, utratę fokusu i znany przechył po eksplozji.

**Odbiór:** ruch prezentacji jest płynniejszy bez zmiany wyników symulacji; brak regresji responsywności i zgodności celowania.

### T10 — optymalizacje potwierdzonych gorących ścieżek

**Pliki:** tylko pliki wskazane przez pomiary; kandydaci w rozdziale 7.2.

- [ ] Uporządkować najdroższe powtarzalne skoki według śladu i korelacji z metrykami, nie według intuicji.
- [ ] Dla każdej optymalizacji dodać test zachowania i porównać wariant A/B na identycznych danych.
- [ ] Najpierw usunąć zbędne pomiary DOM i alokacje potwierdzone w aktywnej ścieżce.
- [ ] Jeżeli A* jest istotnym źródłem skoków, wdrożyć ograniczone porcje i ponowne użycie pamięci z testami anulowania i priorytetów.
- [ ] Jeżeli okresowe prace renderera są istotne, rozłożyć je bez obniżenia jakości i bez nieaktualnych colliderów/list.
- [ ] Kandydat niepotwierdzony pomiarem kończy się wpisem „nie potwierdzono; kod bez zmiany”, a nie fikcyjnym usprawnieniem.

**Odbiór:** mierzalny spadek zidentyfikowanego kosztu lub liczby/długości przycięć, bez zmiany rozgrywki. Nie zamykać zadania ogólnym „wydaje się płynniej”.

### T11 — regresje, benchmark i wydanie

**Nowe:** `tools/browser_v045.py`, pliki surowych pomiarów w uzgodnionym katalogu testowym.
**Zmiany:** `docs/V0_4_5_VALIDATION.md` utworzony w T00, `package.json`, `package-lock.json`, `src/version.js`, `README.md`, `CHANGELOG.md`, `docs/IMPLEMENTATION_PLAN.md`, `docs/PERFORMANCE.md`, `docs/TEST_REPORT.md`; sprawdzić też `tools/check-ui.mjs` i `tools/check-localization.mjs`.

- [ ] Uruchomić całą macierz z rozdziału 9 na źródłach i zbudowanym `dist`.
- [ ] Powtórzyć kontrolowane przebiegi sprzętowe, wraz z narzutem F3 i zachowaniem przy braku GPU timer.
- [ ] Testować start, pauzę, restart i powrót do menu w wielu cyklach: stała liczba listenerów, brak rosnących pul i brak oczekujących query po dispose.
- [ ] Wykonać check/test/build, test ścieżki względnej publikacji i obsługi nowych SVG.
- [ ] Zaktualizować wersję zgodnie z istniejącą konwencją; nie wymyślać nowego schematu checkpointów dla czysto prezentacyjnych danych.
- [ ] Zapisać PASS/FAIL/BLOCKED i dokładny zakres faktycznie uruchomionych prób. Aktualizacja hashy nowych zasobów nie może maskować usunięcia testów.

```sh
npm run check
npm test
npm run build
npm run dev
# Po sprawdzeniu źródeł zakończyć serwer i oddzielnie sprawdzić:
npm run preview
```

**Odbiór:** wszystkie obowiązkowe funkcje wdrożone, brak regresji, a wnioski o mikroprzycięciach oparte na zapisanych danych.

## 9. Macierz odbioru

### 9.1. Funkcjonalność i obraz

| Obszar | Obowiązkowe przypadki |
|---|---|
| Rozmiar viewportu | 1280×720, 1366×768, 1920×1080, 2560×1440, 3440×1440; dodatkowo 960×540 jako kontrolowany przypadek ograniczonego miejsca |
| Skalowanie | 50/100/125/150/200% globalnie; pojedynczy moduł 200%; mieszane wartości; globalne 200% i lokalne 200%; minimum z maksimum |
| Języki | PL/EN, długi cel misji, zawinięte napisy, zmiana języka po wczytaniu |
| Rozdzielczość renderu | renderScale 0.5/1/1.5 oraz DPR 1/2; projekcja HUD nadal w CSS px |
| Postawa | stand/crouch/prone, próba wstania pod przeszkodą, skok, restore |
| Obrażenia | HP 20/19/1/0, wiele hitów, wybuch, leczenie, reduced motion, damageEffects=0 |
| Celowanie | Każdy nowy celownik i `none`, każda dostępna broń, ADS/hip-fire, przełączanie ADS podczas hit/kill |
| Potwierdzenia | Hit, kill, kolejny hit po kill, kilka kill w eksplozji, melee, friendly fire odrzucony, brak potwierdzenia kill NPC |
| Granaty | Przód/tył/lewo/prawo, nad/pod, bardzo blisko, na granicy zasięgu, odbicie, osłona, wiele zagrożeń, wybuch i despawn |
| Diagnostyka | F3 włączone/wyłączone, FPS osobno, brak starego CPU/GPU w opcjach, brak GPU rozszerzenia, disjoint, n zbyt małe |
| Zegar i input | RAF 60/120/144/165/240, cap 0/60/120/165, kilka ticków/RAF, zero ticków/RAF, brak podwójnej delty myszy |
| Cykl życia | Nowa gra, checkpoint, pauza, ukryta karta, utrata Pointer Lock, śmierć, wyjście i ponowny start |

Test geometrii sprawdza przecinanie wynikowych prostokątów widocznych modułów i granice viewportu. Dopuszczenia: pełnoekranowa winieta, celowy układ celownik/hitmarker i inne jawnie współdzielone warstwy. Niedopuszczalne: usprawiedliwianie każdej kolizji ogólnym wyjątkiem „mały ekran”. W trybie kompaktowym wynik testu ma wskazać konkretny brak miejsca i zastosowaną regułę.

### 9.2. Próby wydajności

Podstawowa próba: ta sama rozdzielczość, ta sama przeglądarka i jej profil, ta sama wersja sterownika, seed/checkpoint, trasa wejścia i ustawienia. Minimum trzy, preferowane pięć powtórzeń; rozgrzewka około 30 s, następnie porównywalny segment aktywnej gry około 120 s. Segment kończący się wcześniej przez śmierć lub koniec misji oznaczyć i nie dopełniać pomiarem menu.

W przebiegu oznaczyć osobno: odprawę, intensywną walkę, granaty/wybuchy, niszczenie drutu, ruch przez obszary zmiany LOD i obronę telefonu. Krótsze podsegmenty z małą liczbą próbek nie otrzymują pozornie miarodajnego p99. Pierwsze użycie zasobów sprawdzić oddzielnie od rozgrzanego przebiegu.

Porównania obowiązkowe: baza 0.4.4 vs 0.4.5; diagnostyka z panelem vs ta sama diagnostyka bez panelu; normalna rozgrywka bez rozbudowanego profilera; skala HUD 100% vs 200%. Główna konfiguracja użytkownika to około 165 FPS/Hz, ale nie zgadywać jego aktualnej karty, rozdzielczości ani ustawień.

Raport zawiera FPS avg; frame p50/p95/p99/max; CPU/GPU p95/p99; n i długość okien; przekroczenia budżetu; najdłuższe zdarzenia; narzut profilera. Dla capu niższego niż Hz raportować oczekiwany budżet renderu oddzielnie od budżetu callbacków RAF.

Nie wymagać sztucznej poprawy p99 poniżej granicy narzuconej przez synchronizację. Gdy oba p99 stoją przy 6,06 ms, nadal porównać liczbę i długość rzadszych stallów oraz ślad ruchu. Sukces optymalizacji musi przewyższać rozrzut powtarzanych prób; pogorszenie zdrowych scen wymaga wyjaśnienia. Proponowany cel roboczy, gdy baza ma powtarzalne przycięcia: co najmniej 30% mniej przekroczeń 2× budżetu, bez regresji p95/p99 pozostałych scen większej niż zmienność A/B. Nie przedstawiać tego jako osiągniętego wyniku ani gwarancji sprzętowej.

SwiftShader/headless służy do funkcjonalności i cyklu życia, nie do potwierdzenia płynności na fizycznym GPU. Brak dostępu do sprzętu kończy się statusem BLOCKED dla benchmarku, nie fikcyjnym PASS.

### 9.3. Pokrycie listy użytkownika

| Wymaganie | Zadania |
|---|---|
| 1. Skala ogólna i każdego elementu, do 200%, bez kolizji | T03, T04, T11 |
| 2. Ikona postawy obok HP | T05 |
| 3. Animacja obrażeń i ostrzeżenie poniżej 20% | T06 |
| 4. Hitmarker w ADS | T07 |
| 5. Nowy wybór celowników, usunięcie starego | T03, T07 |
| 6. Hitmarker odsunięty od celownika | T07, T04 |
| 7. Czerwony marker zabójstwa | T07 |
| 8. Kierunek granatu przeciwnika | T08 |
| 9. CPU/GPU tylko w diagnostyce F3 | T02, T03 |
| 10. F3: FPS/CPU/GPU i percentyle | T01, T02 |
| 11. Ograniczenie mikroprzycięć/p95/p99 | T00, T01, T02, T09, T10, T11 |

## 10. Źródła i punkty odniesienia

### Kod

Wszystkie ustalenia F01–F15 odnoszą się do plików i symboli wskazanych w tabeli, w commicie `7c9260fc2c563532387bc3984d370ee51a01cda5`. Weryfikację wersji wykonano także przez `branches/main` i `package.json`. Odczytano również `src/input/input.js` dla własności wejścia oraz historyczne dokumenty wymienione w rozdziale 1. Nie twierdzimy, że wykonano audyt każdego pliku repozytorium.

### Dokumentacja techniczna

- MDN, „Using CSS transforms”: transformacja nie rezerwuje automatycznie nowego miejsca w normalnym przepływie. `https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Transforms/Using`
- Khronos, „EXT_disjoint_timer_query_webgl2”: wyniki asynchroniczne, `QUERY_RESULT_AVAILABLE`, `GPU_DISJOINT_EXT`. `https://registry.khronos.org/webgl/extensions/EXT_disjoint_timer_query_webgl2/`
- MDN, „Window.requestAnimationFrame”: rytm callbacków i zachowanie kart w tle. `https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame`
- Glenn Fiedler, „Fix Your Timestep!”: stały krok, akumulator i interpolacja prezentacji. `https://gafferongames.com/post/fix_your_timestep/`
- Chrome for Developers, „Forced reflow”: odczyty geometrii po unieważnieniu stylów mogą wymuszać layout. `https://developer.chrome.com/docs/performance/insights/forced-reflow`
- MDN, „PerformanceLongAnimationFrameTiming”: próg długiej klatki 50 ms i ograniczona dostępność API. `https://developer.mozilla.org/en-US/docs/Web/API/PerformanceLongAnimationFrameTiming`

**Stan końcowy dokumentu:** wszystkie 11 wymagań ma przypisane zadania i warunki odbioru. Realizacja oraz pomiary pozostają niewykonane w ramach przygotowania tego planu.
