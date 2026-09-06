# Zmiany v0.4.2 — 6 września 2026

**Status: kandydat do lokalnego odbioru, bez publikacji.**

Wydanie naprawcze skupione na trudności, AI, blokadach ruchu i stabilności rozgrywki.
Bez przebudowy mapy, nowych modeli ani wymiany biblioteki dźwięków.

## Trudność i regeneracja

- Rozdzielono mnożniki otrzymywanych obrażeń od kul, wybuchów i walki wręcz.
  Obrażenia są rozstrzygane w jednym miejscu, bez podwójnego naliczania redukcji.
- Wprowadzono osobne parametry regeneracji dla Rekruta, Żołnierza i Weterana.
  Kolejne trafienie przerywa leczenie; regeneracja nie przywraca życia martwej postaci.
- Mnożnik zwykłego trafienia hitscan w głowę gracza wynosi ×1,25; dla NPC pozostaje
  ×1,6, a dla kończyn ×0,57. Ochrona gracza nie osłabia jego strzałów w przeciwników.
- Zachowano dotychczasowe zasady obrażeń walki wręcz i ochrony własnej frakcji.
  Nie dodano ukrytej nieśmiertelności ani zatrzymywania zdrowia na 1 HP.
- Menu i komunikaty korzystają z właściwego profilu. Wczytana misja zachowuje swoją
  trudność; wybór w menu określa poziom kolejnej nowej misji.

| Parametr gracza | Rekrut | Żołnierz | Weteran |
|---|---:|---:|---:|
| Otrzymywane obrażenia od kul | ×0,25 | ×0,35 | ×0,65 |
| Otrzymywane obrażenia od wybuchów | ×0,55 | ×0,75 | ×1,00 |
| Przerwa bez obrażeń do rozpoczęcia regeneracji | 3 s | 4 s | 5 s |
| Tempo regeneracji | 25 HP/s | 20 HP/s | 16 HP/s |

Są to parametry pierwszej iteracji balansu; ich odbiór wymaga lokalnego przejścia misji.

## AI i nawigacja

- Automaty strzelające do gracza korzystają z serii i przerw zależnych od trudności,
  z zachowaniem fizycznego cyklu broni. Na Żołnierzu serie obejmują 3–5 strzałów,
  z przerwą 0,8–1,4 s.
- Krótkie zasłonięcie celu nie zeruje bez końca gotowości przeciwnika. Dodano pamięć
  wykrytego celu, reakcję na nowe wykrycie i ograniczoną szybkość korekty celowania.
- Celowanie uwzględnia widoczny tułów lub głowę zamiast stałego kierowania ognia
  w okolice oczu; strzał nadal sprawdza fizyczną linię z wylotu broni.
- Rotacyjny budżet percepcji pozwala zbadać dalszych kandydatów zamiast ciągle
  sprawdzać tych samych pięciu bliższych, zasłoniętych przeciwników.
- Nowy rozkaz zastępuje poprzednią oczekującą trasę. Zlecenia mają kontrolę aktualności,
  priorytet uniku oraz anulowanie; na aktora przypada najwyżej jedno oczekujące zlecenie.
- Ujednolicono rezerwacje osłon i ich odtwarzanie po zapisie. Wybór osłony nie wykonuje
  dodatkowych synchronicznych wyszukiwań A* poza ograniczoną kolejką nawigacji.
- Poprawiono ustępowanie oddziału w przejściach, także podczas logiki ognia.
  Ruch i grawitacja są integrowane raz na aktualizację, bez przepuszczania przez żywe NPC.

## Ruch, kolizje i pojazdy

- Ruch pionowy sprawdza całą sylwetkę na pokonywanym odcinku. Poprawiono opadanie
  w belki i płoty, które mogło kończyć się penetracją oraz blokadą wycofania.
- Dodano ograniczoną korektę początkowego nakładania brył i awaryjny powrót do
  zweryfikowanej pozycji. Korekty sprawdzają drogę i są rejestrowane; nie włączają noclip.
- Obrót leżącej postaci uwzględnia miejsce przed głową i za nogami, innych aktorów
  oraz granice mapy. Skok sprawdza prześwit nad postacią.
- Spawn i odtworzenie pozycji przechodzą walidację. Gdy nie ma bezpiecznej korekty,
  stan zostaje odrzucony zamiast umieszczenia postaci w przeszkodzie.
- Collider kadłuba Mark IV obraca się zgodnie z pojazdem. AABB służy jako wstępny filtr,
  a właściwy kontakt uwzględnia obrócony prostokąt — również przy promieniach,
  nawigacji i kontakcie z aktorami. Nie zmieniono modelu, ścian ani trasy czołgu.

## Kamera

- Naprawiono mechanizm pozostawiający przechylony horyzont po wygaśnięciu wstrząsu
  i późniejszym obrocie myszą, mimo zerowego `rotation.z` (`CAM-01`).
- Wektor góry kamery jest aktualizowany z pełnej bieżącej orientacji przez
  `TargetCamera.updateUpVectorFromRotation`. Zachowano małe zamierzone wstrząsy;
  poprawka nie obraca mapy ani nie zeruje kierunku celowania.

## Walka i przebieg misji

- Początek rzutu granatem sprawdza objętość na odcinku od oka do miejsca utworzenia
  pocisku. Niedozwolony start przy ścianie nie zużywa granatu ani nie tworzy go za osłoną.
- Tłumienie ogniem jest liczone wzdłuż rzeczywiście przebytego odcinka strzału,
  zakończonego na trafionej przeszkodzie. Informacja o kierunku wybuchu korzysta
  z miejsca eksplozji, nie z pozycji strzelca.
- Rozdzielono chwilowy brak obsługi działa od jego trwałego uciszenia. Zdolność
  działania, zaliczenie celu i odtworzenie starego stanu korzystają ze spójnych reguł.
- Śmierć gracza ma pierwszeństwo przed sukcesem w tym samym kroku; kolejność
  odbierania zdarzeń nie może zmienić porażki w ukończenie misji.
- Prompty i wykonanie interakcji korzystają z jednego warunku zasięgu XYZ i widoczności.
  Przy obsłudze działa świadomie pomijany jest wyłącznie collider samego urządzenia.

## Checkpointy i odtwarzanie stanu

- Automatyczny zapis czeka na pełne zdrowie, podparcie, brak penetracji, aktywnych
  pocisków i bezpośredniej linii ognia oraz możliwość wykonania małego zwykłego kroku.
  Trwające zagrożenie może odraczać zapis; ostatni poprawny checkpoint pozostaje zachowany.
- Rozszerzono walidację indeksów ścieżek, timerów, stanów, identyfikatorów i referencji
  używanych po odtworzeniu. Uszkodzone dane są odrzucane przed wejściem do rozgrywki.
- Zachowano obsługę poprawnych checkpointów 0.4.1 i jawne wartości domyślne nowych pól.
  Kolejka referencji runtime nie jest serializowana; odtwarzany jest ostatni ważny zamiar AI.
- Zachowano `SAVE_VERSION=1` i `MISSION_VERSION=3`. Odrzucenie checkpointu nie usuwa
  ustawień gracza; odmowa trwałego zapisu nadal pozwala korzystać z pamięci sesji.

## Ładowanie, wznawianie i audio

- Dodano kontrolę aktualności operacji po asynchronicznych etapach przygotowania,
  także po zapisie początkowego checkpointu, oraz limit czasu całego przygotowania misji.
- Uporządkowano i zabezpieczono anulowanie zapisów. Późno zakończony import, zapis lub
  wznowienie nie może ponownie aktywować starej misji ani nadpisać stanu nowszej.
- Zasoby późno kończącego się importu są zwalniane. Anulowane wznowienie audio nie
  uruchamia ponownie dźwięków po wyjściu z misji.
- Fazy dźwięku przeładowania są powiązane z konkretną akcją i anulowane po jej przerwaniu.
  Uzupełniono odłączanie źródeł bez zastępowania dotychczasowych odgłosów nową biblioteką.

## Testy, diagnostyka i zakres odbioru

- Dodano regresje kolizji, AI, nawigacji, obrażeń, interakcji, misji, zapisu, cyklu życia,
  audio i kamery oraz fixture checkpointu pochodzący z kodu 0.4.1.
- Dodano liczniki korekt kontaktu i nawigacji, w tym liczby/czasu wyszukiwań A*,
  odwiedzonych węzłów i szczytu kolejki, dostępne przez `ZiemiaNiczyja.inspect()`.
- Dołączono `tools/browser_v042_camera.py` do lokalnego sprawdzenia pełnego `GameView`.
  Test matematyki kamery nie zastępuje sprawdzenia jej w działającej grze.
- Metadane i oznaczenia gry podniesiono do 0.4.2. Modele, tekstury, układ mapy,
  profile jakości, biblioteka dźwięków i dołączony Babylon pozostają bez zmian.

Wykonaną weryfikację i ograniczenia opisuje [raport implementacji](docs/V0_4_2_IMPLEMENTATION.md).
Pełny lokalny zestaw testów, odbiór w przeglądarkach, balans, odsłuch i trwałość zapisu
pozostają do sprawdzenia przed pushem. Ten wpis nie oznacza publikacji ani zamknięcia
ręcznych kryteriów odbioru; zmiany jakościowe modeli, mapy i audio pozostają zakresem 0.5.

---

# Zmiany v0.4.1 — 5 września 2026

- Źródła, narzędzia, testy i workflow Pages wersjonowane w głównym katalogu projektu.
- Osobny, generowany `dist/`; GitHub Actions testuje projekt i publikuje wyłącznie release.
- Sześć poprawionych modeli piechoty z Blendera, sześć różnych twarzy i cztery atlasy 2048 × 2048.
- Zachowane szkielety, 13 klipów na model i trzy LOD-y; uzupełnione testy oraz pochodzenie zasobów.
- Regeneracja zasobów proceduralnych zachowuje importowaną piechotę.
- Checkpointy i ustawienia v0.4 pozostają zgodne.

## Zmiany v0.4.0 — 5 września 2026

- Zunifikowany strumień ruchu/przycisków Pointer Events, regresja trzymanego PPM.
- 42-sekundowa odprawa z napisami, dowodzący i oddział w zamkniętym stanowisku.
- Żywe posterunki, wczesny alarm, profil ognia NPC→NPC oraz siedem etapów misji.
- Obsługiwane działo 7,7 cm, trasy Mark IV, MG/działa, uszkodzenia i dwa otwierane druty.
- Skończone przeloty DH.5/DFW i dwie widoczne, ostrzegane bomby.
- Limiter renderowania 0/1–360 FPS, prawdziwa liczba renderów, bez pozornego VSync OFF.
- Jawnie niewchodzalne płoty, bez step-up w locie, zamknięte stosy worków.
- Poprawione trasy wyjścia całej obsady odprawy; brak cofania do miniętego węzła przy replanie.
- Nowy schemat misji (missionVersion=3), walidacja zapisów lotnictwa/artylerii/czołgów.
- Nie dodano kampanii, Vite, pełnego AI pilotów ani niemieckich czołgów do daty 1917.

## Historia wcześniejszych wydań

# Ziemia Niczyja — historia wydań

## 0.3.0 — 5 września 2026

### Naprawy
- Natywna geometria środowiska: poprawne zewnętrzne ścianki w lewoskrętnym rendererze.
  Nie zastosowano globalnego double-sided jako obejścia błędu.
- Oddzielna poprawka prawoskrętnego glTF: elipsoidy bez odwróconych / zerowych trójkątów,
  spójne profile i triangulacja wklęsłych części pojazdu.
- Jawne alpha-from-diffuse i clamp dla trawy: brak czarnych prostokątów; test pikselowy.
- Kolizje NPC, płotów i pozostałych istotnych obiektów; kroki ruchu ograniczają tunelowanie.
- Podparcie kapsuły na krawędzi deski, poprawne przyłączenie do grafu w okopie,
  dojście obok solidnego stołu telefonu, omijanie unieruchomionego czołgu.
- Snapshot odświeża referencje kolizji, rezerwacje osłon i kolejkę tras.
- Podparte belki ruin zamiast wiszących fragmentów; regresja połączenia z konstrukcją.
- Selekcja detali i shadow casterów odświeżana także po dużej zmianie pozycji.

### Mapa i oprawa
- Teren 216 × 272 m, rozbudowane zaplecze i zachodni łącznik, północne cele przesunięte
  o 40 m, droga z koleinami, 89 lejów, pięć ruin gospodarstw, nowe osłony i ogrodzenia.
- Autorskie materiały ziemi, drewna, cegły, płótna i betonu z normal mapami; poprawione
  światło i mgła; kałuże z prostym specularem, bez screen-space reflections.
- Zaokrąglone worki, skrzynie z listwami i okuciami, otwory ruin, belki i drobny gruz.
- Nowe teksturowane SMLE, Gewehr 98, Webley, Lewis, dłonie oraz poprawiony Mark IV.
- Trzy warianty każdej armii, dobierane deterministycznie bez zmiany RNG walki; trzy LOD.

### Efekty i ustawienia
- Low / Medium / High / Ultra z realnymi budżetami cieni, normal map, LOD, trawy i efektów.
- Granat: błysk, pył, ziemia/gruz, ślad i wstrząs. Kosmetyczne cząstki nie zastępują obrażeń.
- Kierunek trafienia, ograniczona winieta, low-HP pulse / desaturacja, regulacja intensywności.
- Indeks przestrzenny colliderów i przechodzenie promienia po komórkach zamiast pełnych skanów.
- Istniejące FPS/CPU/GPU, pointer lock, menu i checkpointy zachowane i objęte regresją.

### Zgodność i ograniczenia
Checkpoint mapy v0.2 wymaga rozpoczęcia nowej misji; ustawienia pozostają zgodne.
Nie dodano czterech pozostałych misji, Vite, nowego runtime, backendu ani publikacji.
Oprawa retro pozostaje proceduralna. Koszt renderowania wzrósł w teście SwiftShader;
nie deklarujemy przyspieszenia na sprzęcie użytkownika.

## 0.2.0 — 4 września 2026
Poprawki inputu, menu i nieba, teksturowane mundury/LOD, lokalne cienie, bounded pools,
odrębne FPS/CPU/GPU. Historyczne wyniki nie zastępują raportu v0.3.

## 0.1.0 — 4 września 2026
Pierwsza grywalna misja Cambrai z podstawową walką, AI, pojazdami i checkpointami.
