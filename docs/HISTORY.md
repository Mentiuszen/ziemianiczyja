# Historia — zakres prototypu

Weryfikacja materiałów: 4 września 2026. To dokument roboczy, nie deklaracja audytu historycznego każdego modelu.

## Potwierdzone tło

Cambrai było bronione przez system Linii Hindenburga. Brytyjskie natarcie rozpoczęło się 20 listopada 1917 i łączyło działania piechoty, czołgów, artylerii i innych rodzajów wojsk. Wykorzystywano między innymi faszyny do pokonywania rowów. Początkowy sukces nie przyniósł trwałego przełamania; duży niemiecki kontratak rozpoczął się 30 listopada. Lokalny sukces kończący grę nie oznacza zwycięstwa w całej bitwie. Źródło: National Army Museum, „1917: Year of stalemate”, sekcje Cambrai–Lessons: https://www.nam.ac.uk/explore/1917-year-stalemate

Czołgi weszły do walki w operacji pod Flers-Courcelette 15 września 1916; techniczne awarie i współpraca z piechotą stanowiły realny problem. Nie przenosimy ich do planowanej misji z 1 lipca. Źródło: National Army Museum, „Attack of the tanks”: https://www.nam.ac.uk/explore/attack-tanks

SMLE był standardowym brytyjskim karabinem piechoty; karabiny, karabiny maszynowe, okopy, schrony i drut stanowią podstawę przyjętego wyposażenia i otoczenia. Źródło: National Army Museum, „Weapons of the Western Front”: https://www.nam.ac.uk/explore/weapons-western-front

Mark IV, nazwy konkretnych modeli broni i chronologia pięciu misji wynikają z zatwierdzonego `MASTER_PROMPT.md`. Nie traktujemy tej listy jako dowodu poprawności każdej cechy geometrycznej naszych prototypowych modeli. Artykuł IWM o Cambrai wskazany w promptcie zwracał w środowisku odczytu HTTP 403; nie oznaczamy go jako przeczytanego podczas tej realizacji. Zdjęcia muzealne nie zostały skopiowane do gry.

## Fikcja

Thomas Reed, Arthur Hughes, William Ellis i George Bennett to fikcyjne postacie. Nie przypisujemy oddziału do rzeczywistego batalionu. „Pęknięta linia”, telefon, punkt sanitarny, rozmieszczenie MG, przebieg lokalnego zadania są zaprojektowaną fikcją; od v0.4 uszkodzenia czołgów wynikają z symulowanych trafień, nie automatycznej awarii H24. Oznaczenia H21/H24 są roboczymi identyfikatorami fabularnymi, nie twierdzeniem o losach historycznych załóg.

Mapa sztabowa menu jedynie odwołuje się do obszaru Cambrai i pobliskich nazw. Nie jest źródłową mapą natarcia ani rekonstrukcją topografii. Rozgrywka wykorzystuje fikcyjny wycinek terenu. Mały kontratak podczas misji jest fikcyjnym lokalnym starciem, **nie przeniesieniem generalnego kontrataku z 30 na 20 listopada**.

## Uproszczenia i rzeczy wymagające audytu

Regeneracja 100 HP, leczenie +50, krótka mapa, szybkie przemieszczanie, czasy przeładowania, kamera, celownik i 55 sekund obrony są regułami gry. Nie przedstawiają realnego leczenia ran ani długości walk. Webley w startowym zestawie gracza to prototypowa decyzja testowa, a nie założenie powszechnego posiadania rewolweru przez szeregowych.

| Zasób | Obecny stan wiarygodności |
|---|---|
| Brytyjski i niemiecki mundur | Ogólne sylwetki oraz hełmy; bez zweryfikowanych detali pułkowych, oznak i pełnego wyposażenia |
| SMLE / Gewehr 98 / Webley / Lewis | Nazwy i role według master promptu; własne uproszczone modele, nie odwzorowanie rusznikarskie |
| MG 08 | Stałe stanowisko i mechanika; model oraz zgodność pozy obsługi wymagają poprawy |
| Mark IV | Rombowa sylwetka, sponsony, brak obrotowej wieży; szczegóły uzbrojenia, gąsienic i osprzętu wymagają audytu |
| Mills | Prototypowa reprezentacja i mechanika; detale korpusu/zapalnika nie zostały odtworzone docelowo |
| Niemiecki granat | Brak osobnego, zweryfikowanego modelu Stielhandgranate; wspólna bryła prototypowa nie spełnia końcowego wymagania |
| Mark I, Mark V, Vickers | Brak zasobów i implementacji, nie udawane innymi modelami |

Pełne wydanie wymaga sprawdzenia wariantów sprzętu oddzielnie dla każdej daty. Nie przypisano prototypowym granatom dokładnej historycznej odmiany. Pozostałe cztery misje istnieją wyłącznie jako nazwy/metadane zgodne z promptem — nie jako zrealizowana kampania.


## Uzupełnienie v0.2 — mundury

Nowe modele korzystają z odniesień opisanych w `CHARACTER_ART.md`: autorska interpretacja
brytyjskiego khaki/P1908/Brodie i niemieckiego feldgrau/M1916. Żadne muzealne zdjęcie
nie jest teksturą w grze. To nie pełna rekonstrukcja wszystkich detali wyposażenia.

## Uzupełnienie oprawy v0.3
Rozbudowane gospodarstwa, droga i rozmieszczenie przeszkód są projektem poziomu, nie kopiowaną
mapą historyczną. Wariant podoficera w czapce jest interpretacją wizualną; nie oznacza audytu
umundurowania konkretnego pułku podczas wskazanego natarcia. W tej aktualizacji nie poszerzano
fabuły o inne bitwy ani nie zmieniano daty misji.


## v0.4 — wsparcie, odprawa i rozdzielenie faktów od fikcji

Źródła sprawdzone 5 września 2026. To materiały do weryfikacji historycznej, nie assety.

**Potwierdzone tło:**
- The Tank Museum, „The Battle of Cambrai: Graincourt”: niemieckie działa 7,7 cm w roli
  przeciwczołgowej pod Graincourt, 20 XI 1917. https://tankmuseum.org/graincourt/
- The Tank Museum, „Action Debut of The A7V”: debiut bojowy 21 III 1918, także wzmianka
  zdobycznych Mark IV w tej operacji. Nie stanowi podstawy do dodania niemieckich czołgów
  do obecnej misji z listopada 1917. https://tankmuseum.org/action-debut-of-the-a7v-tank/
- Australian War Memorial, E01445: DH.5 używany do bombardowania i nękania pozycji w czasie
  Cambrai w listopadzie 1917; fotografia ma datę 1 XII 1917. https://www.awm.gov.au/collection/E01445
- IWM, Q11894 / 205247444: niemiecki dwumiejscowy DFW zestrzelony pod Flesquières 23 XI 1917.
  Potwierdza rodzinę samolotu w bitwie, nie jego przelot nad naszym sektorem 20 XI.
  https://www.iwm.org.uk/collections/item/object/205247444

**Fikcja rozgrywki:** Porucznik Edward Shaw, wypowiedzi przy mapie, położenie stanowiska
polowego, harmonogram pięciu przelotów, dwa lokalne zrzuty i zadanie z zamkiem działa są
projektem misji. Nie przypisujemy ich prawdziwemu batalionowi lub pilotowi. DFW pozostaje
ogólnie nazwaną rodziną dwumiejscową; model nie jest zweryfikowaną kopią konkretnej odmiany.
Nie dopisujemy źródłom dokładnego planu natarcia, którego nie opisują.

**Uproszczenia:** rozrzut NPC, tempo ostrzału, integralność kadłuba/gąsienic, sektor działa,
ładunek bomby, skompresowane czasy i zasięgi są regułami gry. Brytyjskie samoloty i czołgi nie
zadają przyjaznego ognia zgodnie z globalną regułą rozgrywki, nie jako twierdzenie historyczne.

W tej aktualizacji nie dodano przenośnego Tankgewehr ani A7V. Skończona warstwa lotnicza nie
jest pełną rekonstrukcją działania lotnictwa obu stron w bitwie.
