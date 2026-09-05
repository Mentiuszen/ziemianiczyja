# Raport testów — Ziemia Niczyja v0.3.0

Data wydania/testów: 5 września 2026. Baza: dostarczona v0.2.0. Zakres: dziewięć zgłoszeń
aktualizacji, jedna misja Cambrai. Nie jest to odbiór ukończonej pięciomisyjnej kampanii.

## Środowisko i znaczenie wyników

Node.js 22.16.0, Python 3, Chromium **144.0.7559.96**, Linux x86_64 + Xvfb,
ANGLE SwiftShader — renderer programowy. Zasoby są faktycznie importowane i renderowane,
nie zastępowane atrapami. Browser tools podają lokalne pliki przez routing do dokumentu
z originem opaque. Weryfikuje to kod i względne ścieżki, ale nie trwałość IndexedDB po
zamknięciu przeglądarki na prawdziwym originie HTTP/HTTPS.

Nie wykonano testów fizycznego GPU, Firefox, Edge ani Safari. W bieżącym środowisku nie
znaleziono zainstalowanego Firefoksa; nie oznaczamy wcześniejszej nieudanej instalacji jako
wykonanego testu. Nie potwierdzamy 60 FPS, czasu misji 12–20 minut ani pełnej zgodności
historycznej każdego detalu assetów. Nie było niezależnego review przez drugiego agenta.

## Testy logiki i geometrii

| Polecenie | Wynik |
|---|---|
| `npm ci` | wykonane; pusty zbiór zależności gry, lokalny runtime |
| `npm test` | **83 testy, 83 PASS, 0 FAIL** |
| `npm run check` | składnia 48 plików JS/MJS, importy względne, 12 binarnych GLB — PASS |
| `python tools/test_asset_geometry.py` | **2 testy, 2 PASS** |
| `node tools/autoplay.mjs` | wszystkie 6 etapów, zakończenie misji, odtworzenie 2 checkpointów — PASS |

Nowe regresje obejmują kolejność wierzchołków rodzimych ścian, zakończenia cylindrów,
ellipsoidy, wnętrza/strony wielokątów glTF, kolizję żywych/martwych NPC, wykluczenie samego
siebie, brak przejścia przez cienki płot przy dużym kroku ruchu, wejście na niską deskę,
osiągalny początek nawigacji w okopie, dojście obok fizycznego telefonu i obchodzenie czołgu.
Indeks przestrzenny porównano z pełną listą: 450 promieni przez 150 pudełek. Dodatkowy test
sprawdza natychmiastową aktualizację referencji colliderów po restore, wyczyszczenie
starych żądań nawigacji i właścicieli osłon. Test belek wymaga połączenia z murem lub
podpartą belką poprzeczną — poprawiono wykryte w przeglądzie screenshotów wiszące belki.

Testy obejmują również niezmienność czterech profili, ich zakresy, deterministyczne warianty
postaci, skończony czas/parametry efektów oraz ograniczony feedback obrażeń. Regresje były
obserwowane w stanie FAIL przed poprawką, a potem PASS; dowody błędów i aktualne obrazy
pozostają w `docs/v0.3-tests/`. Historyczne logi jednostkowe przeniesiono do podfolderu logs.

## Potwierdzenie zgłoszonego błędu renderowania

Odtworzono inside-out native mesh: powierzchnie odrzucane od zewnątrz pokazywały odległą
wewnętrzną ścianę. Poprawiono winding/normalne natywnego generatora LH. Nie zastosowano
obejścia polegającego na wyłączeniu cullingu całej sceny. Import glTF RH pozostał osobnym
kontraktem, z poprawionymi pierwotnymi błędami ellipsoid i profili w generatorze GLB.

Test pikselowy `tools/render_v03_contracts.py` potwierdził widok przedniej czerwonej
powierzchni `(255,0,0)` i tylnej zielonej `(0,255,0)`. Przy okazji wykryto i poprawiono
opaque czarne prostokąty trawy: alpha test wymagał faktycznej alpha z diffuse w dołączonym
StandardMaterial. Przez przezroczysty narożnik widać teraz dokładnie tło `(51,77,102)`.
Nie jest to dowód, że każda możliwa usterka graficzna w każdej przeglądarce została usunięta.

## Przeglądarka — źródła oraz dist w podkatalogu

`browser_v03_regression.py` oraz `--dist --prefix=test-repo`: **PASS**.
Oba raporty zawierają puste tablice błędów JS i brakujących zasobów. Sprawdzono:

- Osiem rozmiarów menu od 320×568 do 2560×1440: brak scrolla całej strony i dostępne przyciski.
- Rzeczywiste zdarzenia myszy PPM→LPM i LPM→PPM, zmniejszenie magazynka, Pointer Lock.
- Pauza, zamrożony czas, czyszczenie wciśnięć, wznowienie i strzał po checkpointach.
- Cztery strony/zenit nieba; nie polegano wyłącznie na małym wycinku jednej klatki.
- Low/Medium/High/Ultra: faktyczne 0/1024/2048/4096 mapy cieni, normal mapy wyłączone tylko
  na Low, nadal 28 NPC, jeden aktywny LOD na postać i obecne trzy poziomy szczegółowości.
- Załadowane wszystkie sześć wersji żołnierzy. Osobny showroom: obu stronom z przodu/z tyłu,
  LOD 1/2 i brak błędów importu atlasów. To rzeczywiste modele z paczki, nie concept art.
- Faktyczne obrażenia gracza do 18 HP: winieta, kierunek, desaturacja, ostrzeżenie; wyłączenie
  efektu daje opacity=0 i filter=none. Pauza nie przesuwa czasu pulsu/zdrowia.
- Zmiany animacji nie powiększają stale liczby aktywnych ścieżek ponad 28×19.
- 250 żądań eksplozji: pule mieszczą się w swoich limitach. Przekroczenie limitu wizualnego
  nie jest anulowaniem symulowanego wybuchu; logika obrażeń pozostaje osobna.
- Niezależne wskaźniki FPS/CPU/GPU, gotowy asynchroniczny wynik GPU, wyłączenie pomiaru.

Pliki dowodowe: `regression-source.json`, `regression-dist.json`, `render-contracts.json`,
`showroom.json` oraz screenshoty w `docs/v0.3-tests/` pełnego projektu.
Ustawienia jakości testowano przy nieruchomej scenie; nie wyliczamy z nich porównania FPS.

## Stabilność i błędy zasobów

`browser_smoke.py --cycles 10` (źródła) i
`browser_smoke.py --dist --prefix=test-repo --cycles 10`: **PASS**.
W każdej z 10 prób na buildzie załadowano 28 NPC i jedną scenę. Po wyjściu każdorazowo:
**0 silników Babylon, 0 scen, 0 aktywnych źródeł dźwięku**. Zapisano również heap po GC;
nie jest on miarą całej pamięci przeglądarki lub sterownika. Nie znaleziono narastania
aktywnych scen/zasobów w wykonanym cyklu, ale nie obiecujemy braku każdego rodzaju wycieku.

Pierwszy cykl obejmuje rzeczywisty strzał, kucanie, rzut granatem, Esc, remap klawiszy
i syntetyczne zdarzenie blur. Celowo zwrócony 404 dla british.glb dał widoczny ekran błędu
i możliwość powrotu do menu. Nie było przypadkowych 404 ani zewnętrznych zapytań aplikacji.
Logi: `docs/v0.3-tests/lifecycle/source.json`, `lifecycle/dist-test-repo.json`.
Dodatkowo `python tools/http_smoke.py` sprawdził rzeczywisty serwer Node przez localhost:
źródła w root, dist w root i dist pod `/test-repo/`. Odpowiedzi porównano bajt po bajcie
z plikami; celowo brakujący zasób zwracał 404. To nie jest test pamięci przeglądarki.

## Przejście misji i zgodność zapisu

Autoplay steruje zwykłymi wejściami, korzysta z nawigacji i reguł broni. Nie teleportuje
gracza, nie przyznaje amunicji ani nie zmienia HP. Bot jest wszechwiedzący i testuje
spójność przejścia, nie jakość doświadczenia człowieka. Wynik: **148,55 s czasu symulacji**,
6 zakończonych etapów, 5 strzałów gracza / 5 trafień, 3 straty sojuszników, 22 straty
przeciwnika. Dwa checkpointy: 40,12 s i 93,55 s. Odtworzone bez duplikacji NPC/przedmiotów.
Czołg 1 osiągnął końcowy odcinek, drugi pozostawał zgodnie ze skryptem unieruchomiony.

Layout v0.3 używa missionVersion=2. Stary checkpoint v0.2 (missionVersion=1) jest odrzucany
z komunikatem; należy zacząć nową misję. Ustawienia nie są celowo kasowane. Brak testu
trwałości IndexedDB w normalnej sesji został opisany wyżej, nie zamaskowany testem JSON.

## Wydajność i znane ograniczenia

Przeprowadzono porównanie Medium 1280×720 z v0.2: 45 próbek / scena / wersja, SwiftShader.
**v0.3 jest droższa**: czas klatki wzrósł o 45.7% na starcie i 68.3%
w scenie walki w tym środowisku. Wzrosły draw calls i CPU renderowania. Pełne liczby,
metoda i ograniczenia znajdują się w PERFORMANCE.md. Nie są to liczby z fizycznego GPU.

Istotne pozostałe ograniczenia: proceduralne twarze/animacje i uproszczona broń NPC,
brak pełnego IK, uproszczone collidery, możliwość tłoku w wąskich przejściach, płaskie
ślady na stromym terenie, krótkie efekty pyłu bez taktycznego zasłaniania AI, jedna misja,
syntetyczny dźwięk. Vite nadal nie jest wdrożone; działa lokalny statyczny build Node.
Nie wykonywano zdalnego workflow Pages, nie publikowano strony ani repozytorium.

## Paczki i odtwarzalność

Pełny projekt zawiera źródła, generatory, testy, GLB/atlasy, runtime, dokumentację i dist.
Osobny build ma względne adresy i nie wymaga usług zewnętrznych. Test podkatalogu wykonano
na tych samych kodzie, modelach, vendorze i CSS; późniejszy końcowy build aktualizuje tylko
dokumentację i manifest. Integralność ZIP i zgodność plików weryfikuje release-verification.json.
Nie dołączono plików czcionek systemowych ani folderów __pycache__ / .git / node_modules.
Raport nie zastępuje KNOWN_ISSUES.md ani rejestru wymagań.
