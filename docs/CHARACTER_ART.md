# Postacie i uzbrojenie

Sześć modeli piechoty pochodzi z poprawionych eksportów `Blender/ZiemiaNiczyja/models`
zaimportowanych 2026-09-05. Każda frakcja ma trzy różne twarze; poprawiono uszy, dłonie,
szyję, nakrycia głowy i mundury. Nazwy plików i wybór wariantu po ID/roli pozostały zgodne.

Każdy plik ma 19 kości, 13 klipów i trzy osobne siatki. Dane szkieletu, macierzy wiązania
i animacji są identyczne z poprzednim zestawem. W danej chwili widoczny jest tylko
jeden LOD. Progi Low 12/36 m, Medium 20/54 m, High 30/78 m, Ultra 42/105 m.

| Model | Trójkąty LOD0 | LOD1 | LOD2 | Bajty GLB bez wspólnego atlasu |
|---|---:|---:|---:|---:|
| british.glb | 24490 | 8790 | 2390 | 2134348 |
| british-v1.glb | 24489 | 8790 | 2390 | 2132192 |
| british-v2.glb | 24400 | 8758 | 2381 | 2130276 |
| german.glb | 24489 | 8789 | 2390 | 2066788 |
| german-v1.glb | 24490 | 8790 | 2390 | 2063376 |
| german-v2.glb | 24489 | 8789 | 2390 | 2068392 |

Cztery zewnętrzne atlasy 2048 × 2048 w `public/assets/models/textures/`:
`infantry-refined-color.png`, `infantry-german-refined-color.png`,
`infantry-refined-normal.png`, `infantry-refined-orm.png`. GLB odwołują się do nich
przez `textures/`, bez wychodzenia poza katalog modeli. Stare atlasy pozostają
potrzebne innym zasobom, w tym modelom broni.

LOD0 jest około 2,6–3,1 razy cięższy niż poprzednio; większe atlasy zwiększają zużycie
pamięci tekstur. Test ładowania nie stanowi porównawczego pomiaru wydajności GPU.

## Aktualizacja z Blendera

Z katalogu `Blender/ZiemiaNiczyja/models` skopiuj sześć plików `british*.glb` i
`german*.glb` do `public/assets/models/`, a cztery wymienione atlasy z `models/textures/`
do `public/assets/models/textures/`. Nie kopiuj całego katalogu modeli: bronie i pojazdy
mają osobny cykl aktualizacji. Pliki `.blend`, staging i rendery pozostają w projekcie Blender.

Uruchom `npm test`, `npm run check` i `npm run build`, następnie sprawdź misję przez
`npm run preview`. `tools/regenerate_assets.py` zachowuje importowaną piechotę;
historyczny `generate_characters.py` służy wyłącznie odtworzeniu poprzedniego zestawu.
Skróty importu i budżety: `docs/INFANTRY_IMPORT.json`.

## Bronie i pojazd

| Model FPS / pojazd | Trójkąty | Zmiany |
|---|---:|---|
| SMLE / Gewehr 98 | 2800 każdy | profilowana kolba, zamek, lufa, spust, celownik, śruby, pas |
| Webley | 2348 | bęben z sześcioma komorami, kurek, chwyt, kabłąk |
| Lewis | 3844 | cieńszy talerz magazynka, detale pokrywy, chłodnica, dwójnóg |
| Dłonie | 4848 | zaokrąglone palce/dłonie, mankiety i dodatkowe szczegóły |
| Mark IV | 7724 | poprawne profile/sponsony, atlas metalu/gąsienic, włazy i detale |

Budżety obejmują pełne siatki pliku, nie koszt wielokrotnego renderowania do cieni.
Model broni w rękach NPC jest nadal uproszczoną częścią skinned modelu piechoty; nie jest
identyczny z nowym plikiem FPS. Czołg pozostaje proceduralnym przybliżeniem, nie skanem.

## Materiały i autorstwo
Uzbrojenie i wyposażenie przygotowano lokalnymi generatorami. Poprawione uszy i dłonie
korzystają z fragmentów siatki MakeHuman Community CC0; tekst licencji jest w
`public/assets/models/licenses/MakeHuman-LICENSE.ASSETS.md`. Nowe twarze wygenerowano
na potrzeby projektu. Pełne pochodzenie opisuje `ASSET_LICENSES.md`.
Nie dołączono zdjęć muzealnych, modeli marketplace ani assetów komercyjnych gier.
Generator nie wymaga usługi AI podczas uruchomienia ani zewnętrznego serwera.

## Kierunek historyczny i źródła

Źródła służą odniesieniu do sylwetki, koloru i wyposażenia. Nie oznaczają certyfikacji
każdego szwu, wymiaru, rozmieszczenia sprzętu ani zgodności z jedną konkretną jednostką.
Poniższe cechy to **artystyczna interpretacja**, nie skany eksponatów.

**Brytyjczycy:** khaki, kieszenie i kołnierz kurtki, szerokie parciane szelki/pas,
ładownice inspirowane Pattern 1908, manierka, pakunek i narzędzie, owijacze, trzewiki,
szeroki płytki hełm typu Brodie. Punkty odniesienia:

- National Army Museum, *Uniform and equipment in 1914*:
  https://ww1.nam.ac.uk/937/news/uniform-equipment-1914/
- Royal Sussex Regimental Association, *Private in Service Dress, Marching Order, WWI*:
  https://www.royalsussex.org.uk/the-regiment/uniform/pte-in-service-dress-marching-order-wwi/
- National Army Museum, *Brodie helmet*:
  https://ww1.nam.ac.uk/1904/news/brodie-helmet/
- Australian War Memorial, przykład elementu webbing / pokrowca narzędzia Pattern 1908:
  https://www.awm.gov.au/collection/C1238643

**Niemcy:** feldgrau, kurtka inspirowana M1915, uproszczona kryta listwa zapięcia,
ciemniejsze skórzane oporządzenie, potrójne ładownice, wyższe buty i puszka wyposażenia.
Hełm inspirowany M1916 ma głębszą osłonę uszu/karku i boczne występy wentylacyjne.
Nie użyto późnego malowania kamuflażowego z 1918 r. dla listopada 1917 r.
Punkty odniesienia do hełmów:

- Musée de la Grande Guerre, *Stahlhelm German helmet*:
  https://www.museedelagrandeguerre.com/en/collections/stahlhelm-german-helmet/
- Metropolitan Museum of Art, *Bashford Dean and Helmet Design during World War I*:
  https://www.metmuseum.org/de/perspectives/bashford-dean-and-helmet-design-during-world-war-i

Nie odwzorowano wszystkich wariantów dostaw, stopni, pułków ani zużycia sprzętu.
Konstrukcja kurtki i rozmieszczenie wyposażenia pozostają uproszczone.


## Przegląd i granice
`tools/showroom_v03.py` renderuje wszystkie sześć plików z przodu i tyłu oraz niższe LOD.
To te same modele co w grze, lecz neutralne światło podglądowe. Zdjęcia są w
`docs/v0.3-tests/characters-*.png`, a nie obrazami koncepcyjnymi zamiast modeli.

Blisko animacje próbkowane są co render, dalej do 24 Hz / 10 Hz. Poprzedni klip jest
zatrzymywany; 20 przełączeń nie zwiększa aktywnych celów ponad 28 × 19 kości.
Nie wdrożono motion capture, pełnego IK, nowego kompleksowego riggu ani docelowego blend tree.
Twarze, dłonie i sylwetki są nadal stylizowane/proceduralne. To upgrade prototypu retro,
nie ukończona oprawa o jakości nowych komercyjnych strzelanek.
