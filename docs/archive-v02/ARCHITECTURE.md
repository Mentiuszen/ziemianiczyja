# Architektura v0.2

## Przepływ i właściciele

`Application` (`src/app.js`) jest właścicielem stanu aplikacji i jednego aktywnego `Simulation` oraz `GameView`. Stany: main, brief/missions/settings/controls/credits, loading, ready, playing, paused, dead, complete, error. Menu nie importuje renderera ani nie buduje świata. Świat powstaje dopiero po potwierdzeniu odprawy.

`Simulation` jest wyłącznym właścicielem logicznych pozycji, zdrowia, broni, granatów, pocisków czołgowych, jednostek, przedmiotów i reżysera. `GameView` kopiuje te dane do Babylon.js; nie steruje trafieniami ani AI. Obiekty sceny nigdy nie trafiają do snapshotu.

| Moduł | Odpowiedzialność |
|---|---|
| core/clock, math | Stały krok 1/60 s, maksymalnie pięć kroków nadrabiania; geometria, RNG |
| core/player | Ruch, postawy, stamina, obsługa dwóch broni i akcji |
| combat/health, weapon, ballistics | Zdrowie, atomowe przeładowanie, pociski, wybuchy i osłony |
| world/terrain, layout, collision | Wspólna wysokość trójkątów i bryły przeszkód; kolizje i LOS |
| ai/navigation, soldier | Graf, kolejka dróg, rezerwacje osłon, percepcja i zachowania |
| vehicles/tank | Osobne korytarze pojazdów, sektory sponsonów, pociski |
| missions/director + data/cambrai | Etapy zadania, zdarzenia once, kontratak i checkpointy |
| save/schema, store | Walidacja wersji, IndexedDB, ustawienia i fallback pamięciowy |
| render/* | Adapter lokalnego Babylon, GLB, teren, modele, efekty i cienie |
| audio/audio | Web Audio, limity źródeł, pozycjonowanie, tło |
| input/input, ui/* | Wejście, pointer lock, konfigurowalne klawisze i polski interfejs |

## Czas i pauza

`requestAnimationFrame` nie jest zegarem walki. `FixedClock` wywołuje kroki po 1/60 s i odrzuca nadmierny dług. Wejście jest pobierane dopiero w rzeczywistym kroku symulacji: szybki klik oraz akcje klawiatury nie giną w klatce bez kroku. Pierwszy krok konsumuje akcje jednorazowe; następne zachowują tylko wejście ciągłe. Utrata fokusu czyści wciśnięcia, resetuje akumulator, zatrzymuje audio i wymaga ręcznego wznowienia.

Pozy skeletal GLB wyznaczane są ręcznie na podstawie czasu symulacji. Pauza nie zostawia autonomicznego zegara animacji Babylon. UI toast ma własny czas prezentacji — nie zadaje obrażeń ani nie przesuwa misji.

## Geometria, graf i trafienia

Siatka terenu ma próbki co metr; obniżenia okopów, leje, rampy i przejazdy czołgów składają się w jedno pole wysokości. `height(x,z)` interpoluje te same trójkąty, które rysuje renderer. AABB z `layout.js` są współdzielone przez widoczność, kolizje, nawigację i wizualną konstrukcję osłon. Dekoracje nieistotne dla blokowania ruchu są uproszczone.

Graf 53 × 81 węzłów co dwa metry nie jest navmeshem Babylon. Połączenia sprawdzają przejście co 0,25 m oraz nachylenie powierzchni; po wykryciu rozjazdu ze sterowaniem gracza zaostrzono warunek skarp. A* ma limit 6500 rozwinięć. Zlecenia dróg wykonywane są w kolejce po dwa co 0,12 s; bez workera, ponieważ nie wykazano potrzeby jego kosztu w tej małej scenie. Nie jest to potwierdzenie spełnienia pełnego budżetu wydajnościowego.

Strzał: promień z oka określa zamiar → sprawdzenie od oka do lufy → promień od lufy do punktu celowania → najbliższe trafienie. Hitboxy są kilkoma sferami głowy/tułowia/kończyn z innym układem dla postaw. Jest to przybliżenie, nie śledzenie każdej animowanej kości. Wybuch bada dystans i widoczność do próbki ciała; nie przenika dowolnie przez ziemię czy ściany.

## AI i reżyser

Pojedyncza funkcja aktualizacji jednostki rozstrzyga akcję i ruch. Widzenie sprawdza FOV, zasięg, ziemię, bryły i pojazdy; po utracie kontaktu zostaje ostatnia znana pozycja. Zdarzenia dźwiękowe dają pozycję z odchyleniem, nie ciągłe śledzenie gracza. Amunicja, czas reakcji, obrót i przeładowanie są rzeczywistymi ograniczeniami. Rezerwacja osłon, ustępowanie i replanowanie są prototypowe, bez teleportacji naprawczych.

Reżyser wydaje zadania, ale nie udaje trafień. Wrogi kontratak to osiem wcześniej zdefiniowanych ID, tworzonych raz. MG może być uciszone wcześniej; kolejne etapy nie wymagają konkretnego żywego sojusznika. Natarcie i zakończenie są niezależne od awarii drugiego czołgu.

## Zapis

Snapshot v1 ma identyfikator i wersję misji, RNG, ID kolejnego obiektu, czas, gracza (łącznie z magazynkiem/rezerwą i timerami), jednostki, pojazdy, przedmioty, reżysera i statystyki. Checkpointy są odkładane do chwili bez aktywnego granatu/pocisku działa oraz bez świeżego obrażenia gracza. Ta wersja **nie zapisuje checkpointu w dowolnym momencie lotu pocisku**.

Walidacja odrzuca niezgodne wersje, NaN, ujemną amunicję, błędne ID, nieprawidłowe postawy i timery. Po odczycie odtwarzane są klasy `Weapon`, `Health`, graf i rezerwacje. Uszkodzony zapis nie kasuje automatycznie innych danych. Trwałe dane są w IndexedDB; ustawienia w localStorage. Fallback pamięciowy jest jawny.

## Zasoby i cykl życia

Babylon 8.46.2 znajduje się w `vendor/babylon-runtime/chunks`; aplikacja nie ładuje runtime z CDN. `Assets` ma AbortController, a start misji numer generacji. Wynik starego ładowania nie podmienia nowej sceny. `disposeMission` zatrzymuje dźwięki, unieważnia ładowanie, niszczy kontenery GLB, efekty, scenę i engine, usuwa referencje i resetuje zegar. `dispose` widoku jest idempotentne.

Presety zmieniają cienie i skalę obrazu, nie liczbę przeciwników. Obiekty dekoracyjne są scalane materiałami, a AI myśli rzadziej niż fizyczny krok. Postacie mają trzy prawdziwe LOD, efekty korzystają z ograniczonych pul, a czas GPU jest opcjonalnym pomiarem asynchronicznym.


## Zmiany v0.2: rendering i wejście

- `input/input.js`: dokumentowy capture Pointer Events, maska `buttons` (również chorded
  pointermove), fallback Mouse Events i przechowanie krótkiego kliknięcia. Babylon nie
  rejestruje własnych kontrolerów sceny. Wejście do gry rozstrzyga faktyczne zdarzenie
  Pointer Lock, nie sam zwrot z API.
- `render/sky-geometry.js`, `sky.js`: pełna sfera 64×32 z ciągłym sferycznym UV, unlit,
  nieskończony dystans względem kamery, bez picking/fog/shadow. Emisyjna tekstura nie jest
  dodawana do białego emissiveColor — kolor bazowy emisji jest czarny.
- `render/spatial-batches.js`: scalanie według materiału i regionu 48 m. `terrain-mesh.js`:
  kafle 48×48 komórek, normalki skopiowane z pełnego pola, bez zmiany kolizji i wysokości.
- `render/view.js`: osobna selekcja LOD, ograniczony promień listy cieni, próbkowanie animacji
  według dystansu. Lista statycznych shadow casterów odświeżana do 5 Hz. Preset średni ma
  promień 30 m / 1024, wysoki 48 m / 2048; niski nie generuje cieni.
- `render/animation-sampling.js`: konwersja czasu na rzeczywistą klatkę klipu, poprawny FPS,
  obsługa pętli i akcji niepętlonych. Jedna aktywna grupa na model, stara zatrzymywana.
- `core/pool.js`, `render/effects.js`: pool jest właścicielem obiektów, ogranicza alokacje,
  odrzuca podwójne zwolnienie. Pojemności: pył 48, błysk 20, tracer 20, pocisk 40.
- `performance/monitor.js`: 180 próbek CPU/klatki, publikacja do 4 Hz. `gpu-timer.js` jest
  właścicielem WebGL query: próbkowanie co 4 render, maksymalnie 4 oczekujące, do 20 wyników
  średniej GPU, odrzucenie disjoint i starych wyników. Wyłączenie/pauza/dispose usuwa query.
- `ui/ui.js`: tekst HUD jest cache'owany, HUD do 20 Hz, diagnostyka i mały overlay do 4 Hz.
  CPU obejmuje zmierzoną pracę aplikacji; GPU nie jest wyliczane z FPS.

Wydajność nie jest uzyskiwana przez usuwanie przeciwników lub uproszczenie zasad walki.
Zwiększona liczba batchy może kosztować CPU: culling przestrzenny nie jest bezwarunkowo
lepszy od globalnego scalenia. Konkretny kompromis i pomiary zapisano w PERFORMANCE.md.
