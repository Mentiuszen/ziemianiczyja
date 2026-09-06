# Interfejs 0.4.4 — źródła i eksport, rewizja 3

## Status R3

Dostarczono nowy `authoring/ui/logo-en.svg`, eksportowany do
`public/assets/ui/logo-en.svg`. Zachowuje sylwetkę, drut i przetarcia PL;
kontury angielskich znaków pochodzą z DejaVu Sans Condensed Bold.
Nota DejaVu z R2 nadal dotyczy obu wersji. Nie dołączono plików fontów.

**Nowe tła wysokiej rozdzielczości nie zostały dostarczone.** Poniższa tabela
źródeł R2 nadal opisuje rzeczywiste obrazy. Nie są to mastery 4K.
`prepare_ui_assets.py` kopiuje oba logotypy i zachowuje dotychczasowe źródła teł.
Animacja frontu korzysta z tych samych datowanych wektorów; pośrednia polilinia
jest tylko przejściem wizualnym, nie nowym pomiarem/historyczną mapą.


## Baza i źródło kierunku wizualnego

Rewizja korzysta z aktualnego `ZiemiaNiczyja.zip` przekazanego przez użytkownika oraz
wyraźnie wskazanego mockupu 1536×1024. Nie korzysta z aktualizacji niezatwierdzonego
brancha ani nie traktuje wcześniejszego, niezapushowanego 0.4.4 jako zaakceptowanego wyglądu.
Historyczny opis pierwszej rewizji jest zachowany w `history/UI_ART_0.4.4_r1.md`.

## Trzy tła, nie obrazki udające kontrolki

`authoring/ui/revision2-reference.png` jest kopią wybranego konceptu. Zawiera wiele
paneli i nie jest plikiem runtime. Działająca gra ładuje tylko oddzielne obrazy:

| Eksport | Master | Natywny rozmiar mastera |
|---|---|---|
| `main-art.webp` | `main-art-r2.png` | 764×352 |
| `language-art.webp` | `language-art-r2.png` | 764×352 |
| `options-art.webp` | `options-art-r2.png` | 764×374 |

Z paneli usunięto nadrukowane napisy, przyciski i flagi przez wypełnienie obszarów
oraz tonalne dopasowanie. Delikatne rozmycie wyrównuje ślady usuwania. Logo, flagi,
napisy i ustawienia są właściwymi elementami HTML/SVG, niezależnymi od tła.
Jest to adaptacja wybranej ilustracji, **nie nowe generowanie detali 4K**. Powiększenie
kadru nie zwiększa jego rzeczywistej szczegółowości; na 1440p/ultrawide tło może być miękkie.

Źródło to koncepcja wygenerowana wcześniej w tej rozmowie i ponownie wybrana przez
użytkownika. Nie przedstawia konkretnej archiwalnej fotografii. Nie nadajemy automatycznie
cudzej lub nieustalonej treści licencji MIT. Własne elementy kodu/wektorów oraz obce
materiały są rozdzielone w rejestrze pochodzenia. Dodatkowe próby generowania całej
makiety z tej sesji nie zostały użyte jako tło ani dowód działającego interfejsu.

## Logo, ikony i flagi

`logo.svg` zawiera wektorowe kontury DejaVu Sans Condensed Bold, własny układ słów,
sylwetkę żołnierza, drut i deterministyczne przetarcia. Nie zawiera `<text>` ani
osadzonych plików fontów. Nota DejaVu jest zachowana w `public/assets/ui/licenses/`.
Flagi językowe PL i USA/UK oraz flaga sojuszników UK pozostają plikami z bazy użytkownika.
Nie zmienia się frakcja z wybranym językiem. Ikony broni nadal identyfikuje `weapon.id`.
Nowe symbole zdrowia/granatu są prostymi ścieżkami SVG bez zależności sieciowych.

## Rzeczywista geografia

Regionalny wycinek: długość −1,9° do 9,1°, szerokość 46,9° do 52,1°; północ na górze.
Mapowanie do `viewBox` 1000×720 jest jawne w `projectGeo(lon, lat)` w
`src/data/campaign-map.js`. Wszystkie punkty, wektory i raster używają tego samego układu.

Wybrzeże, jeziora i rzeki pochodzą z **GSHHG 2.3.6, rozdzielczość intermediate**, z
zainstalowanej dystrybucji **basemap-data 2.0.0**. Nie dopisano współczesnych granic
państw jako historycznych. Wycinek zawiera 551 wierzchołków polygonów wybrzeża/jezior
oraz 1483 wierzchołki linii rzek. Narzędzie Basemap służyło tylko ekstrakcji offline,
nie jest zależnością gry ani Node.

Dane i pochodny SVG są objęte **LGPL-3.0-or-later**. Teksty GPL/LGPL i edytowalny
wycinek JSON są dołączone także do `public/assets/ui/maps/` i `licenses/`, więc trafiają
do `dist`. Podkład można niezależnie podmienić; nie przypisujemy LGPL całemu kodowi gry.
Źródło: https://www.soest.hawaii.edu/pwessel/gshhg/ ; dystrybucja:
https://github.com/matplotlib/basemap/tree/v2.0.0/data .

Przygaszona rzeźba pochodzi z regionalnego kadru `shadedrelief.jpg` dostarczonego z
basemap-data na MIT; nota copyright została zachowana. Przygotowane źródło regionalne
jest w `authoring/ui/geography/relief-source-region.png`, master eksportu w
`authoring/ui/campaign-relief-r2.png`. Szum papieru jest dekoracyjny, nie jest warstwicą
ani pomiarem wysokości. Raster przeskalowano; nie udajemy dostępności pomiarów w skali okopu.

## Pięć frontów i granica wiarygodności historycznej

`FRONT_SNAPSHOTS` ma osobne definicje dla Sommy 1.07.1916, Flers 15.09.1916,
Ypres w październiku 1917, Cambrai 20.11.1917 i Amiens 8.08.1918. Wybranie karty
podmienia rzeczywistą ścieżkę SVG, strzałki, datę oraz centrum mapy — nie sam podpis.
Ypres ma miesięczną precyzję zgodną z istniejącym rozdziałem, bez wymyślonego dnia.

**Granice wojskowe są własnymi, geograficznie osadzonymi uogólnieniami sytuacji**, nie
zweryfikowaną digitalizacją dziennych map sztabowych. Źródła potwierdzają kontekst i
zmiany strategiczne, ale nie poświadczają każdego wpisanego węzła polilinii. Strzałki
opisują ogólny kierunek natarcia, nie tor konkretnego oddziału. UI jawnie oznacza
front jako uogólniony. Gra nie symuluje przemieszczania całego frontu na podstawie wyniku demo.

Materiały odczytane przy rewizji:

- National Army Museum, *Battle of the Somme*: https://www.nam.ac.uk/explore/battle-somme — rozróżnia rozpoczęcie walk i wrześniowy atak na Flers.
- National Army Museum, *1917: Year of stalemate*: https://www.nam.ac.uk/explore/1917-year-stalemate — kontekst Ypres, Hindenburg Line i ataku pod Cambrai 20 listopada.
- Veterans Affairs Canada, *Map of the Western Front*: https://veterans.gc.ca/en/remembrance/military-history/first-world-war/map-western-front — porównawcza legenda stanów 1914, przed i po ofensywach 1918; nie gotowy plik dokładnej dziennej linii.
- Harry S. Truman Library, M1236: https://www.trumanlibrary.gov/maps/m1236-map-front-line-movement-and-areas-allied-occupation — opis zakresu historycznej mapy z liniami wycofania i ofensyw. W tej rewizji nie udało się pobrać jej skanu; nie twierdzimy, że wykonano jego digitalizację.
- UK Department for Culture, *Amiens100*: https://www.gov.uk/guidance/amiens100 — data rozpoczęcia bitwy 8 sierpnia 1918.

Nie skopiowano map ani aktywów Call of Duty. Misje niegrywalne pozostają niegrywalne.

## Reprodukcja i budżet

```sh
python tools/rebuild_campaign_base.py
python tools/prepare_ui_assets.py
npm run check
npm run build
```

Pierwsze polecenie odtwarza SVG z dostarczonego JSON bez GIS i bez sieci. Drugie
kopiuje źródłowe SVG/licencje i eksportuje gotowe masters PNG do WebP (wymaga Pillow).
Nie trzeba ponownie generować obrazów, mieć całego GSHHG ani plików fontów.
`authoring/ui/manifest.json` zawiera rozmiary i SHA-256 eksportów. Runtime nie importuje
plików authoringu, testów ani edytora. Minimapę nadal tworzą dane mapy gry, nie atlas frontu.
