# Postacie v0.2 — zasoby, budżety i ograniczenia

## Co znajduje się w grze

`british.glb` i `german.glb` to nowe autorskie modele z `tools/generate_characters.py`.
Każdy zawiera trzy skinned meshe, wspólny szkielet 19 kości i 13 klipów. Model bliższy ma
łagodniej modelowane proporcje ciała, twarz, kieszenie, guziki, szwy, pasy, oporządzenie,
hełm, buty i chwyt broni. Nie dodano zdjęć ani modeli pozyskanych z komercyjnych gier.

| Model | LOD0 — wierzchołki / trójkąty | LOD1 | LOD2 | GLB |
|---|---:|---:|---:|---:|
| Brytyjski | 6506 / 10052 | 3589 / 4428 | 1441 / 1544 | 4 028 684 B |
| Niemiecki | 5408 / 8732 | 3249 / 4332 | 1365 / 1532 | 3 902 268 B |

Budżety obejmują postać z modelowanym wyposażeniem i bronią. v0.1 miała po 4004 trójkąty
na postać niezależnie od dystansu. Najbliższe modele v0.2 są droższe, odległe znacznie
lżejsze. To rzeczywiste oddzielne siatki, nie tylko zmiana etykiety jakości.

Progi odległości w metrach od gracza: niska 10/30, średnia 12/40, wysoka 22/58.
W danej chwili wyświetlany jest jeden LOD danej postaci. Nie zmienia to jej AI ani hitboxów.

## Materiały

Autorski atlas 1024×1024 zawiera tkaninę, skórę, metal, skórę twarzy i detale. GLB ma
wbudowane albedo, normal oraz ORM i jeden materiał PBR na stronę; źródłowe PNG znajdują
się również w `public/assets/textures/`. Normal/roughness służą drobnej fakturze, nie
zastępują geometrii hełmu czy wyposażenia. Tekstury nie są fotografiami muzealnymi.
Kontenery i instancje współdzielą zasoby materiałowe w obrębie danego modelu.

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

## Animacja i przegląd

Przy zmianie działania poprzednia grupa animacji jest zatrzymywana. Renderer próbkuje
klatki zgodnie z FPS zapisanym w klipie; nie zakłada na sztywno 24 FPS. Kucanie ma dodatkową
pozę nóg także podczas przeładowania. Najbliższe animacje są próbkowane co render,
średnie do 24 Hz, odległe do 10 Hz; symulacja nadal ma swój stały krok.

W testach 20 zmian działania nie zwiększyło liczby aktywnych celów animacji ponad
532 dla 28 postaci × 19 kości. Sama liczba 532 nie oznacza 532 żołnierzy.

`tools/showroom_v02.py` renderuje **te same pliki GLB** w neutralnym świetle. Zdjęcia z
`docs/v0.2-tests/characters-*.png` to zrzuty renderera, nie koncepcje wygenerowane zamiast
modelu. Oświetlenie podglądowe różni się od oświetlenia pola bitwy.

## Dalsze ograniczenia

Twarze i dłonie nadal są kanciaste, animacje programowo przygotowane, część wyposażenia
sztywno związana z kością. Broń trzecioosobowa i pierwszoosobowa wymaga dalszego opracowania.
Brak motion capture, blend tree lokomocji z root motion, pełnego IK terenu i różnorodnych
indywidualnych twarzy. W tej wersji liczy się zauważalny krok od kapsułowego prototypu do
rozpoznawalnego żołnierza, nie deklaracja końcowej jakości oprawy.
