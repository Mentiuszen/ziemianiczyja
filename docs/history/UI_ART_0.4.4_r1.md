# Interfejs 0.4.4 — źródła i eksport aktywów

6 września 2026. Zakres: UI, bez modyfikowania modeli i tekstur świata.

## Logo i wektory

`authoring/ui/logo.svg` jest edytowalnym wektorowym masterem słów ZIEMIA NICZYJA.
Kontury liter pochodzą z DejaVu Sans Condensed Bold, dostępnego w środowisku pracy.
Gotowy plik zawiera ścieżki, nie osadzony font ani zależność od Google Fonts.
Notę licencyjną konturów dostarczono w `public/assets/ui/licenses/DejaVu-LICENSE.txt`.
Żaden plik TTF/OTF/WOFF nie został dołączony.

`ally-uk.svg`, podkład kampanii i sylwetki pięciu broni + neutralny symbol są lokalnym
rysunkiem SVG przygotowanym dla tego interfejsu. Nie skopiowano ikon ani mapy z CoD.
Oddzielne pliki English USA/UK i Polski z 0.4.3 pozostają bajtowo niezmienione.
Sojusznicza flaga jest UK, niezależnie od języka.

## Grafika main — granica dostępnego źródła

Z poprzedniej, przerwanej implementacji zachował się załączony `main-art-crop.png`,
426×352. To rzeczywisty źródłowy kadr użyty w tej dostawie, z żołnierzem od tyłu,
ruinami i dymem. Konwersja RGB → WebP quality 91 nie dodaje szczegółów. Nie ma nowego
obrazu high-resolution, modelu Mark IV ani deklaracji odtworzenia archiwalnego zdjęcia.

Plik został przekazany w tej rozmowie jako wynik wcześniejszej pracy. Nie zachował się
pierwotny większy master ani osobny rejestr jego wytworzenia; pochodzenie przed tym
załącznikiem i ewentualne cudze prawa nie zostały niezależnie potwierdzone. Niniejsza
nota nie nadaje ilustracji arbitralnie licencji MIT. Przed publicznym rozpowszechnieniem
należy potwierdzić jej pochodzenie albo zastąpić własnym zatwierdzonym masterem.
Kod i własne rysunki interfejsu pozostają w zakresie dotychczasowej licencji projektu.

## Mapa kampanii

Przestrzeń podkładu: 1000×720 jednostek rysunkowych; kontekst daty 20.11.1917 przed
natarciem. Podkład i polilinie są własną generalizacją, NIE digitalizacją datowanych
arkuszy całego frontu. Widoczna legenda mówi „Schemat sytuacji” / „Schematic overview”.
Nie ma współczesnych kafli mapowych ani połączenia z usługą map.

Nazwy/chronologia pięciu rozdziałów pochodzą z istniejącego `CAMPAIGN` i katalogów
0.4.3. Tylko `cambrai` jest grywalne. Narracyjna linia Ypres→Cambrai nie jest ustaloną
trasą marszu historycznej jednostki. Fikcyjny postęp demo nie przesuwa historycznego
frontu. Plan `V0_4_4.md` zawiera materiały historyczne do dalszego odbioru; ich obecność
nie oznacza wykonanej tutaj digitalizacji.

Lokalny podgląd sektora i minimapa mają inne źródło: istniejące TRENCHES/RAMPS, MAP,
teren, drogi, layout/collision i przełamane przeszkody. To rzeczywiste współrzędne
poziomu w metrach, bez kopiowania grafiki mapy strategicznej.

## Odtwarzanie eksportu

Master SVG edytuje się bez fontu. Poniższe narzędzie kopiuje wektory i licencję oraz
konwertuje zachowany kadr (Pillow potrzebne tylko do eksportu obrazu, nie do gry):

```sh
python tools/prepare_ui_assets.py
npm run check
npm run build
```

`authoring/ui/manifest.json` zawiera skróty SHA-256/rozmiary eksportów i opis źródła.
Po świadomej zmianie mastera generator aktualizuje manifest. `check-ui.mjs` wykrywa
przypadkową zmianę eksportu i błędne ścieżki CSS. Pliki authoringu, testy i fonty nie
są kopiowane przez builder do `dist/`; gotowe aktywa i tekst licencji są lokalne.
