# Architektura v0.3

## Właściciel stanu
`Simulation` posiada pozycje, zdrowie, broń, jednostki, pojazdy, przedmioty, logiczne
pociski i reżysera. `GameView` tylko prezentuje stan w Babylon.js. Snapshot nie zawiera
obiektów renderera. Menu nie tworzy symulacji. App rozdziela main/loading/ready/playing/
paused/dead/complete/error, a wczytanie ma numer generacji i timeout.

Stały krok 1/60 s, maksymalnie pięć kroków nadrabiania, brak odgrywania całej przerwy
po powrocie karty. Input jest konsumowany przy rzeczywistym ticku; krótkie kliknięcia,
PPM/LPM razem i utrata fokusu mają odrębne regresje. Pauza zamraża symulację, próbki
animacji i obrażenia; etykiety UI mogą kończyć własny czas prezentacji.

## Świat i kolizje
`data/world-map.js` definiuje granice, rozmiar 216×272 m, landmarki, drogę i wersję misji 2.
`terrain.js` tworzy pole 217×273 próbek co 1 m, z 89 lejami, rowami, rampami i przejazdami.
`height()` interpoluje te same trójkąty, które renderuje teren. Mesh terenu jest podzielony
na kafle 48 m, a obiekty statyczne na regiony 32 m według materiału.

`layout.js` to wspólne dane widocznych obiektów i ich AABB: 4754 bryły, w tym 138 części
ogrodzeń. Szczegóły kosmetyczne nie muszą mieć osobnych colliderów. Istotne drzwi/okna
powstają jako przerwy między bryłami, nie ciemne prostokąty na nieprzenikalnej ścianie.
`SpatialIndex` ma komórki 8 m. Ruch pyta pobliskie komórki; promień przechodzi po komórkach
XZ metodą DDA, z dokładnym testem brył w fazie końcowej. Test porównuje 450 promieni z
pełnym skanem 150 brył, także na granicach komórek.

Kapsuła ruchu ma promień 0,29 m, podparcie uwzględnia obrys stopy, a ruch dzielony jest
na odcinki do 0,18 m na oś. Pozwala to wejść na niską deskę i nie przeskoczyć cienkiego
płotu pomiędzy tickami. Żywi aktorzy są osobnymi colliderami, ignorują własne ID; martwi
nie blokują. Postawy zmieniają wysokość. Pojazdy mają dynamiczne AABB.

Graf 93×118 (10974 węzły) co 2 m jest własnym grafem, nie navmeshem Babylon. Węzły stoją
na powierzchni kolizji; połączenia badają nachylenie i clearance. Start ścieżki musi być
osiągalny z rzeczywistej pozycji; cel interakcji może wybrać sąsiedni węzeł obok stołu.
A* ma limit 12000 rozwinięć, kolejka przetwarza do dwóch zleceń co 0,12 s. Połączenia
statyczne są cache'owane, dynamiczne czołgi sprawdzane przy wyszukiwaniu. Nie ma workera.

## Geometria i materiały
`GeometryData` jest czystym, testowalnym autorem buforów. Natywny renderer jest
lewoskrętny: indeksy orientowane są względem zadanej zewnętrznej normalnej. `Geometry`
dopisuje jedynie adapter GPU. glTF pozostaje prawoskrętny, a loader wykonuje własną zmianę
układu; nie wolno globalnie odwracać wszystkich importowanych modeli.

Generatory Python naprawiają elipsoidy i profile glTF, eksportują sześć wariantów piechoty,
cztery bronie, dłonie i Mark IV. Każdy wariant postaci ma trzy skinned LOD, 19 kości,
13 klipów oraz jeden materiał PBR. Atlasy ładowane są względnie z `models/textures/`.
`appearanceFor` dobiera wariant deterministycznie po ID/roli, bez konsumpcji RNG walki.

`quality.js` zawiera cztery niezmienne profile renderowania. Zmieniają tylko cienie,
normal mapy, anizotropię, progi LOD, dekoracje i cząstki. Żaden profil nie usuwa przeciwnika
ani collidera. Normal mapy importów i materiałów są przechowywane, więc Low→High przywraca
te same tekstury. First-person mesh ma osobną grupę renderowania z wyczyszczeniem głębi.
Natywne bryły pozostają jednostronne. Trawa używa rzeczywistego alpha testu + kanału alpha
z diffuse, clamp UV i oświetlenia dwustronnego, a nie przezroczystych colliderów.

## Efekty, zdrowie, czas
`Effects` zarządza ograniczonymi pulami pyłu, gruzu, błysków, smug, śladów i pocisków.
`explosionParticles` ma własny seed; budżet grafiki nie zmienia stanu RNG ani obrażeń
`ballistics.js`. Pył trwa krótko i jest kosmetyczny; nie jest gameplayowym dymem.
Kamera dostaje malejący wstrząs skalowany ustawieniem ruchu. Wszystkie czasy efektów
wynikają z ticku symulacji; pauza ich nie nadrabia.

`damageFeedback` oblicza ograniczoną winietę, kierunek źródła trafienia, puls low HP i
saturację z HP/czasu. Suwak może je wyłączyć bez leczenia gracza. Wyjście czyści filtr
canvasa. Health zachowuje 100 HP, 6 s przerwy, 12 HP/s regeneracji i apteczkę +50.

## Zapis, diagnostyka i sprzątanie
Schema v1 zawiera `missionVersion:2`; geometria v0.2 nie jest zgodna. Odtworzenie ustawia
nowe referencje colliderów aktorów/pojazdów i czyści stare zlecenia tras/rezerwacje osłon.
IndexedDB ma jawny fallback sesyjny. Zapis odbywa się tylko bez aktywnych granatów/pocisków
ciężkiej broni; nie obiecuje wczytania dowolnego momentu lotu.

PerformanceMonitor mierzy klatkę i CPU aplikacji. GpuTimer korzysta z opcjonalnego WebGL2
query bez blokującego oczekiwania. Próbki są publikowane do 4 Hz, maksymalnie cztery query
oczekują równolegle. F3/overlay nie fałszują braku timera zerem. `disposeMission` usuwa
render, kontenery, pule, timery/query, dźwięk, referencje i filtr obrażeń; menu pozostaje lekkie.
Szczegóły wykonanego odbioru, a nie deklaracja braku każdego wycieku: TEST_REPORT.md.
