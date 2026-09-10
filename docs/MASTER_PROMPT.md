# MASTER PROMPT — „ZIEMIA NICZYJA”
## Przeglądarkowy FPS z I wojny światowej inspirowany klasycznymi Call of Duty

### 1. Twoje zadanie

Zaprojektuj i zaimplementuj kompletną, jednoosobową grę FPS działającą w przeglądarce. Nazwa robocza: **„Ziemia Niczyja”**. Projekt ma łączyć prowadzenie kampanii i odczucia ze strzelania inspirowane Call of Duty 1–2 z kierunkiem wizualnym zbliżonym do wczesnych części 1–3, ale przedstawiać **I wojnę światową**, nie drugą.

To ma być niewielka, dopracowana gra z początkiem, kampanią i zakończeniem — nie demonstracja renderera, losowa arena ani scena z nieruchomymi botami. Inspiracja nie oznacza kopiowania nazw, poziomów, muzyki, interfejsu ani zasobów Call of Duty.

Pracuj etapami. Pełny zakres obejmuje pięć misji; pierwszym dużym kamieniem milowym jest jedna kompletna misja reprezentatywna dla jakości całej gry. Nie przedstawiaj tego etapu jako ukończonej kampanii.

Podejmuj rozsądne decyzje w szczegółach, których ten dokument nie określa. Dokumentuj założenia i istotne kompromisy. Nie zamieniaj podstawowych wymagań w opcjonalne dodatki tylko dlatego, że są trudne.

### 2. Zakres i priorytety

Najważniejsza jest współpraca następujących elementów: przyjemnego strzelania, przekonujących żołnierzy i animacji, działającego AI obu stron, dobrze zaprojektowanych okopów oraz czytelnych misji.

Wymagany zakres końcowy: pełne 3D i kamera pierwszoosobowa; pięć powiązanych fabularnie misji; walczące ze sobą oddziały brytyjskie i niemieckie; teren, okopy, ruiny i schrony; broń palna, granaty i prosta walka wręcz; pojazdy sterowane przez AI w odpowiednich misjach; regeneracja zdrowia oraz apteczki; menu, ustawienia, pauza, zapis postępów i checkpointy; kompletne udźwiękowienie bez obowiązkowego dubbingu.

Poza zakresem pierwszego wydania pozostają: multiplayer, otwarty świat, crafting, budowanie baz, ekwipunek RPG, drzewka rozwoju, sterowanie czołgiem lub samolotem przez gracza, pełna destrukcja terenu, rozbudowane leczenie ran i synchronizacja ust. Ataki gazowe nie są wymagane; nie dodawaj ich kosztem podstawowych systemów.

Nie rozszerzaj projektu o nowe fronty i armie przed ukończeniem uzgodnionej kampanii.

### 3. Platforma, technologia i publikacja

Domyślny stos: **HTML, CSS, JavaScript z modułami ES, Babylon.js oraz Vite**. Używaj JSDoc i kontroli typów tam, gdzie pomaga to utrzymać kontrakty. Jeżeli zastany projekt ma już TypeScript i działającą strukturę, zachowaj je zamiast przepisywać bez powodu.

Gra ma działać jako statyczna aplikacja na GitHub Pages lub równoważnym hostingu. Gracz otwiera link i gra; nie instaluje Node.js, edytora, dodatków ani lokalnego serwera. Narzędzia budowania są wymaganiem deweloperskim, nie wymaganiem dla odbiorcy.

WebGL2 jest podstawowym rendererem. Nie uzależniaj uruchomienia od WebGPU. Modele i animacje dostarczaj jako GLB/glTF. Narzędzia offline, np. Blender oraz skrypty przygotowujące zasoby, są dopuszczalne; wynikowa gra pozostaje przeglądarkowa.

Nie wymagaj backendu, logowania, kluczy API, płatnych usług ani generowania AI przez model językowy podczas gry. Symulacja działa lokalnie. Podstawowa wersja nie może zależeć od SharedArrayBuffer ani niestandardowej konfiguracji nagłówków hostingu.

Sprawdź aktualną dokumentację użytych bibliotek, przypnij zgodne wersje i dostarcz lockfile. Nie wpisuj wymyślonych wywołań API. Biblioteki, dekodery, pliki WASM i zasoby potrzebne podczas gry powinny być częścią publikowanego buildu, bez zależności od przypadkowych CDN-ów.

Przygotuj działające polecenia `npm ci`, `npm run dev`, `npm run build`, `npm run preview` i `npm test`. Wynikiem produkcyjnym jest `dist`. Skonfiguruj GitHub Actions do publikowania artefaktu Pages bez zakładania brancha `gh-pages`.

Obsłuż adresy zasobów zarówno w katalogu głównym, jak i pod `/nazwa-repo/`. Dotyczy to również workerów, dźwięków i dekoderów. Nie opieraj działania na bezpośrednim otwieraniu `index.html` przez `file://`.

### 4. Historia i zasady wiarygodności

Kampania rozgrywa się na froncie zachodnim w latach **1916–1918**. Gracz jest fikcyjnym brytyjskim piechurem. Brytyjczycy reprezentują Ententę, przeciwnikiem jest armia Cesarstwa Niemieckiego należąca do państw centralnych. Dwie strony konfliktu nie oznaczają dwóch grywalnych kampanii.

Utrzymuj ciągłość kilku fikcyjnych postaci, ale nie przypisuj zmyślonej historii rzeczywistemu żołnierzowi lub batalionowi. Jeżeli używasz numeru prawdziwej jednostki, sprawdź jej obecność w danym miejscu i czasie. Bez takiego potwierdzenia stosuj ogólniejszy opis oddziału.

Każda misja ma własną listę dozwolonych broni, granatów, pojazdów, mundurów i oznaczeń. Historyczna dostępność nie oznacza automatycznie powszechnego użycia w każdym oddziale.

Nie mieszaj sprzętu z II wojny światowej, współczesnego wyposażenia ani nazistowskiej symboliki. Nie zamieniaj zwykłej piechoty w armię uzbrojoną przede wszystkim w broń automatyczną. Nie wprowadzaj czołgów do misji z 1 lipca 1916 roku.

Załóż fikcyjny lokalny epizod wewnątrz prawdziwej bitwy, nie wierną rekonstrukcję jej całej topografii. Gracz może wykonać lokalne zadanie mimo niepowodzenia większej ofensywy. Nie zmieniaj historycznego wyniku wydarzeń dla efektownego zakończenia.

W `docs/HISTORY.md` rozdziel: potwierdzone fakty, fikcję fabularną i uproszczenia rozgrywki. Regeneracja zdrowia, tempo leczenia oraz kompresja mapy są świadomymi uproszczeniami, nie twierdzeniami historycznymi. Korzystaj przede wszystkim z muzeów, archiwów i wiarygodnych opracowań. Nie wymyślaj źródeł.

### 5. Kampania: pięć różnych misji

Historyczne daty i dobór czołgów opierają się na materiałach wymienionych na końcu dokumentu. Nazwy misji, bohaterowie i szczegółowe zadania poniżej są fikcyjnym projektem rozgrywki.

**Misja 1 — „Pierwszy gwizdek”. Somma, 1 lipca 1916.**

Początek w brytyjskim okopie. Krótkie wprowadzenie do poruszania się, celowania i interakcji w ramach przygotowania do natarcia. Następnie wyjście na teren między liniami, utrata spójności oddziału i zmiana planu. Gracz dociera do ocalałych, przeprowadza ich przez dostępny odcinek okopów i pomaga utrzymać lokalną pozycję. Nie wygrywa całej bitwy. Bez czołgów i bez nieuniknionej śmierci gracza dla samego widowiska.

**Misja 2 — „Żelazne bestie”. Flers-Courcelette, 15 września 1916.**

Natarcie piechoty ze wsparciem Mark I. Czołg ułatwia przejście przez wybrany odcinek umocnień, ale jedna maszyna zostaje unieruchomiona. Oddział musi zmienić drogę. Gracz obchodzi stanowisko blokujące natarcie i pomaga zdobyć fragment wsi lub okopu. Awaria jest zaprojektowanym wydarzeniem z czytelną konsekwencją, nie losowym błędem uniemożliwiającym ukończenie poziomu.

**Misja 3 — „Morze błota”. Okolice Ypres, październik 1917, w ramach ofensywy Passchendaele.**

Fikcyjny epizod między odciętymi pozycjami. Mokry teren, leje, pomosty i ograniczona widoczność. Dotarcie do schronu, zabezpieczenie przejścia oraz odparcie kontrataku. Mniej otwartego szturmu, więcej orientacji w terenie i krótkich walk. Nie przypisuj konkretnego dnia ani prawdziwego batalionu bez dodatkowego potwierdzenia. Nie dodawaj czołgów wyłącznie po to, żeby były obecne na każdej mapie.

**Misja 4 — „Pęknięta linia”. Cambrai, 20 listopada 1917.**

Skoordynowane natarcie piechoty i Mark IV. Przejście przez umocnienia, działania we wrogim okopie, następnie walka o zabudowania i utrzymanie zdobytego odcinka. Co najmniej jedno starcie pozwala wybrać bezpośrednie podejście albo boczny łącznik. To główna misja pokazowa, implementowana jako pierwsza kompletna misja, lecz pozostająca czwartą w kolejności kampanii.

**Misja 5 — „Ostatnie lato”. Amiens, 8 sierpnia 1918.**

Natarcie o świcie z pojazdami odpowiednimi dla tego okresu, w tym Mark V. Więcej przemieszczania między kolejnymi pozycjami, mniej pozostawania w jednej linii okopów. Gracz realizuje lokalne zadanie oddziału; finał zamyka historię fikcyjnych bohaterów. Krótki epilog zaznacza dalszy przebieg wojny zamiast sugerować jej zakończenie tego dnia.

Każda misja otrzymuje osobny układ, rytm, warunki wizualne i zestaw wydarzeń — nie tę samą mapę z inną pogodą. Docelowy czas jednej misji to orientacyjnie 12–20 minut przy pierwszym przejściu, bez sztucznego wydłużania falami przeciwników.

Na początku wyświetl tytuł, rok/datę, miejsce i perspektywę gracza. Nie fałszuj dokładności daty: dla misji 3 wystarczy „Październik 1917”. Dodaj krótką odprawę i historyczne podsumowanie. Dla każdej misji przygotuj co najmniej dwa sensowne punkty zapisu, w tym jeden przed najtrudniejszym odcinkiem.

### 6. Narracja bez obowiązkowych dialogów

Podstawą narracji są wydarzenia podczas gry, krótkie odprawy, teksty między misjami i zmiany widoczne w otoczeniu. Nie wymagaj dubbingu, rozbudowanych rozmów ani synchronizacji ust.

Teksty po polsku, krótkie i naturalne. Powracające postacie otrzymują imiona i konsekwentne role. Ich obecność, brak albo zmiana sytuacji mają znaczenie, ale nie buduj osobnego systemu relacji.

Ważne polecenia przekazuj przez czytelne cele, gesty NPC i komunikaty tekstowe. Żadna misja nie może czekać na zakończenie nieistniejącego nagrania. Ewentualne krótkie głosy bojowe są późniejszym dodatkiem; nie używaj syntezatora przeglądarki jako podstawy oprawy.

Unikaj długiego odbierania sterowania. Sceny pokazuj z perspektywy gracza. Nie pozwalaj, aby gracz ginął podczas niepomijalnego tekstu lub sceny, w której nie może się bronić.

### 7. Teren i konstrukcja poziomów

Zaprojektuj ręcznie główne ścieżki, osłony, punkty walki i wydarzenia. Proceduralność wykorzystuj do detali i powtarzalnej dekoracji, z zapisanym ziarnem losowania.

Teren ma obejmować wzniesienia, zagłębienia, leje, nasypy, ruiny i fragmenty roślinności. Okopy muszą być rzeczywistym obniżeniem przestrzeni: dno poniżej otaczającego terenu, ziemne ściany, zakręty, łączniki, stanowiska strzeleckie i schrony. Nie wystarczy płaska podłoga otoczona skrzynkami.

Zapewnij spójność geometrii wizualnej, kolizji, widoczności AI i nawigacji. Ziemny nasyp blokuje pociski oraz widzenie; wejście do schronu jest przechodnie; stopień strzelecki pozwala faktycznie strzelać ponad osłoną.

Nie pozwalaj AI przechodzić przez drut kolczasty, ściany ani niedostępne skarpy. Dla przeszkód niszczonych w zaplanowanych miejscach aktualizuj kolizję i dostępne przejścia. Nie twórz pełnej destrukcji całej mapy.

Granice obszaru uzasadniaj terenem i sytuacją bojową. Unikaj niewidzialnych ścian w środku oczywistej ścieżki. Zaprojektuj bezpieczne obszary wytchnienia oraz czytelne przejścia między starciami.

### 8. Kierunek graficzny i zasoby

Cel: retro realizm, naturalne proporcje, wyraźne tekstury i mocna atmosfera. Nie fotorealizm współczesnych produkcji, ale również nie woksele, kreskówka, figurki z pudełek ani kolorowe kapsuły.

Priorytet wizualny mają broń i dłonie pierwszoosobowe, pobliscy żołnierze, wnętrza okopów oraz efekty trafień. Użyj stonowanej palety, mgły, dymu i oświetlenia różnicującego misje. Nie nakładaj jednego brunatnego filtra na wszystko.

Stosuj niedrogie oświetlenie, cienie dopasowane do poziomu jakości i ograniczoną liczbę dynamicznych świateł. Bez ray tracingu jako wymagania. Efekty nie mogą ukrywać przeciwników bardziej przed graczem niż przed AI.

Minimalna biblioteka końcowa obejmuje dwa zestawy żołnierzy z kilkoma wariantami wyglądu, modele uzbrojenia, trzy właściwe warianty czołgów kampanii oraz modularne elementy terenu, okopów, ruin i wyposażenia.

Zasoby twórz samodzielnie albo pozyskuj z prawem do wykorzystania i redystrybucji w grze. Prowadź `ASSET_LICENSES.md`: autor, źródło, licencja, wymagane oznaczenie i modyfikacje. Nie zakładaj, że znaleziony model lub fotografia muzealna są automatycznie do dowolnego użycia. Nie pobieraj zasobów z komercyjnych gier.

Modele zastępcze są dozwolone w prototypie, ale nie spełniają wymagań końcowych. Przy braku zasobu pokaż rzeczywisty brak i przygotuj uczciwe rozwiązanie; nie nazywaj sześcianu ukończonym czołgiem. Sprawdź import, skale, osie, materiały i animacje wcześnie, zanim zbudujesz całą kampanię wokół nieprzetestowanych modeli.

### 9. Żołnierze i animacje

Żołnierze muszą mieć animowane szkielety, naturalną sylwetkę, mundury i wyposażenie dopasowane do strony oraz czasu. Wspólny szkielet jest dopuszczalny. Różnicuj twarze, zabrudzenia i wyposażenie, zachowując rozpoznawalność frakcji.

Wymagane animacje: stanie, marsz, bieg, kucanie i ruch w kucki, leżenie oraz czołganie, celowanie, strzelanie, przeładowanie, rzut granatem, atak wręcz, reakcja na trafienie, śmierć i pokonanie używanej w misjach niskiej przeszkody.

Nie każda animacja musi być osobnym nagranym klipem: dopuszczalne są warstwy i proceduralne korekty. Efekt końcowy musi być jednak poprawny. Dopasuj chód do prędkości, kierunek górnej części ciała do celowania, broń do dłoni, a emisję strzału do jej pozycji. Unikaj ślizgania stóp, obrotów całego ciała bez przejścia i strzelania z opuszczonej broni.

Hitboxy dostosuj do postawy i położenia ciała, nie tylko do pionowej kapsuły. Leżący żołnierz nie może otrzymywać trafień w pustą przestrzeń nad sobą. Martwy żołnierz nie podejmuje decyzji ani nie strzela po czasie.

Przygotuj osobne animacje dłoni i broni gracza. Modele trzecioosobowe można uprościć w oddali, ale nie zastępować nieruchomymi obiektami w aktywnej walce.

### 10. Sterowanie i ruch gracza

Domyślne sterowanie: WASD — ruch; mysz — rozglądanie; lewy przycisk — ogień; prawy — przyrządy celownicze; R — przeładowanie; Shift — ograniczony sprint; C — kucanie; Z — leżenie; Spacja — niewysoki skok lub pokonanie niskiej przeszkody; E — interakcja; G — granat; V — atak wręcz; 1/2 i kółko — zmiana broni; Esc — pauza.

Pozwól zmieniać przypisania. Zapewnij responsywną kamerę, ustawienia czułości i pola widzenia. Ruch nie może zależeć od liczby klatek.

Obsłuż schody, skarpy, sufity, krawędzie i zmianę postawy. Nie pozwalaj wstać bez miejsca nad głową ani przeniknąć przez ścianę podczas przejścia do leżenia. Pokonywanie przeszkód wymaga bezpiecznego miejsca docelowego.

Bez ślizgów, podwójnych skoków i nieograniczonego sprintu. Kołysanie, drgania kamery i rozmycie muszą być regulowane lub wyłączalne. Nie wymagaj widocznego pełnego ciała gracza, jeśli pogarsza to jakość podstawowych animacji i kolizji.

### 11. Broń, granaty i obrażenia

Podstawowy arsenał: SMLE Mk III jako główny brytyjski karabin, Gewehr 98 po stronie niemieckiej, Webley Mk VI jako broń krótka, Lewis jako broń wsparcia oraz stanowiska Vickers i MG 08. Dodaj brytyjski granat Mills oraz niemiecki granat trzonkowy Stielhandgranate, z wariantami zweryfikowanymi dla dat misji. Nie zastępuj go bez sprawdzenia modelem charakterystycznym dla późniejszej wojny.

Gracz może przenosić dwie bronie palne i ograniczoną liczbę granatów. Ciężkie karabiny maszynowe pozostają stanowiskami, nie bronią do biegania z biodra. Rozmieszczenie uzbrojenia wynika z misji; broń krótka u każdego szeregowca nie jest założeniem historycznym.

Każda broń ma odrębne parametry, dźwięki, odrzut, celowanie i poprawną sekwencję obsługi. Karabin powtarzalny wymaga pracy zamka. Amunicja nie może się powielać przez anulowanie przeładowania, zmianę broni lub wczytanie checkpointu. Przeładowanie częściowe uwzględnia posiadaną amunicję.

Dla podstawowych pocisków dopuszczony jest hitscan; granaty i pociski dział mają fizyczny lot w uproszczonej symulacji. Wszystkie trafienia respektują najbliższą przeszkodę. Kamera określa zamiar celowania, ale wylot broni i znajdująca się przed nim ściana ograniczają możliwość oddania strzału.

Wspólny system obrażeń obsługuje gracza, sojuszników i przeciwników, z jawnie konfigurowanym balansem. Rozróżniaj głowę, tułów i kończyny. Nie twórz zwykłych żołnierzy wymagających kilkunastu trafień karabinem. Obrażenia sojusznicze domyślnie wyłącz, lecz nie pozwalaj AI planowo strzelać przez kolegów.

Granaty mają skończony zapas, czas do wybuchu, odbicia i czytelny efekt. Obrażenia zależą od odległości i osłonięcia; ziemna ściana lub zamknięty schron nie mogą być ignorowane przez sam test promienia. AI ocenia możliwość rzutu i zagrożenie dla własnych żołnierzy. Nie dodawaj szczegółowej symulacji odłamków kosztem stabilności.

Atak wręcz ma krótki zasięg, animację i czas ponownego użycia. Bez teleportowania gracza do celu i trafiania przez ściany.

### 12. Zdrowie: pełna regeneracja oraz apteczki

Oba systemy są obowiązkowe. Bazowe parametry do testów: **100 HP; rozpoczęcie regeneracji po 6 sekundach bez obrażeń; regeneracja 12 HP/s do pełna; apteczka natychmiast przywraca 50 HP, maksymalnie do 100**. Są to własne wartości startowe, nie deklaracja wiernego odtworzenia CoD2.

Nowe obrażenia resetują opóźnienie. Apteczka znika dopiero po skutecznym użyciu; przy pełnym zdrowiu pozostaje dostępna. Umieszczaj je sensownie w schronach, okopach i punktach zaopatrzenia, nie losowo na otwartym polu.

Pokaż niski stan zdrowia w sposób czytelny, ale nie zasłaniający całego obrazu. Śmierć uruchamia ekran porażki i możliwość powrotu do checkpointu. Nie pozwalaj, aby gra leczyła lub zabijała gracza podczas pauzy albo wczytywania.

Dodaj poziomy trudności Rekrut, Żołnierz i Weteran. Balansuj celność, czas reakcji, obrażenia i presję przeciwnika, nie wszechwiedzę AI ani absurdalną wytrzymałość zwykłych żołnierzy.

### 13. AI żołnierzy: wymagania behawioralne

AI jest systemem walki, nie pojedynczą funkcją „idź do gracza i strzelaj”. Użyj czytelnej maszyny stanów lub drzewa zachowań oraz oddzielnej, lekkiej warstwy zadań oddziału. Jedna warstwa rozstrzyga ruch i akcję, aby konkurujące zachowania nie wydawały sprzecznych poleceń.

**Percepcja.** Pole widzenia, dystans, przeszkody i zdarzenia dźwiękowe. Po utracie kontaktu pozostaje ostatnia znana pozycja, nie aktualna pozycja niewidocznego celu. Słyszenie daje informację przybliżoną. Gęsty dym zasłaniający walkę powinien ograniczać również widzenie AI.

**Nawigacja.** Navmesh albo równoważny graf rzeczywiście obejmujący okopy, schrony i przejścia. Uwzględniaj szerokość, postawę oraz wejścia/wyjścia z okopu. Kolejkuj kosztowne przeliczenia. Lokalnie unikaj innych postaci, rezerwuj ciasne przejścia i wykrywaj brak postępu. Naprawa utknięcia polega najpierw na zmianie trasy lub celu, nie teleportacji na oczach gracza.

**Osłony.** Oceniaj je względem zagrożenia, dostępności i możliwości ostrzału. Rezerwuj miejsca, aby cały oddział nie zajmował jednego punktu. AI musi umieć schować się, wychylić lub zmienić stanowisko. Nie wybiera osłony za ścianą, do której nie ma drogi.

**Walka.** Czas reakcji, niedoskonała celność, przeładowanie, ograniczenia broni i kontrola linii ognia. Ostrzał przygniatający może ograniczać ekspozycję i celność, lecz nie może powodować wiecznego paraliżu wszystkich jednostek. Unikaj natychmiastowego obrotu i trafienia po dostrzeżeniu gracza.

**Zagrożenia.** Zauważony granat wywołuje próbę ucieczki do osiągalnego miejsca. Przeciwnik utracony z oczu uruchamia krótkie sprawdzenie ostatniej pozycji. NPC nie muszą znać każdego granatu ani wydarzenia na całej mapie.

**Oddział.** Role obejmują strzelca, wsparcie i dowódcę. Zadania: utrzymanie pozycji, natarcie, osłona przemieszczania i odwrót. Dopuszczaj ograniczoną współpracę, zamiast wymagać pełnego symulatora dowodzenia. Wykorzystanie bocznej drogi zależy od jej istnienia i sytuacji, nie losowego timera.

**Obie strony.** Sojusznicy i przeciwnicy mają prawdziwe cele, otrzymują obrażenia, giną i mogą wygrywać lokalne potyczki. Gracz nie jest automatycznie najważniejszym celem wszystkich wrogów. Sojusznicy ustępują mu w wąskich przejściach.

Przygotuj stany obejmujące co najmniej przemieszczanie, obserwację, zajmowanie osłony, celowanie, strzelanie, przeładowanie, reakcję na ostrzał, granat, poszukiwanie, odwrót i śmierć. Nie dodawaj zachowań wyłącznie jako nazw w kodzie: muszą mieć obserwowalny efekt.

### 14. Pojazdy i ich współpraca z piechotą

W misjach wykorzystuj właściwe Mark I, Mark IV i Mark V, nie jeden współczesny czołg przemalowany dla wszystkich dat. Odróżnij sylwetki i konfiguracje uzbrojenia. Nie dodawaj obrotowej wieży tam, gdzie dany model jej nie miał; uzbrojenie musi respektować swoje położenie i sektory ostrzału.

Każdy pojazd ma zadanie, korytarz przejazdu, prędkość, ograniczenia skrętu, sprawdzanie przeszkód oraz ocenę przejezdności. Nie korzysta bezpośrednio z trasy piechura przez ciasny rów. Nie wspina się pionowo, nie obraca jak zabawka i nie jeździ bez celu w pętli.

Stanowiska uzbrojenia wyszukują cele i sprawdzają widoczność. Piechota reaguje na tor przejazdu i potrafi korzystać z pojazdu jako osłony. Zablokowana droga wymaga zatrzymania, obejścia lub zaplanowanego alternatywnego przebiegu misji.

Rozróżnij pojazd sprawny, unieruchomiony, z uszkodzonym uzbrojeniem i zniszczony. Unieruchomiony może nadal strzelać. Nie pozwalaj niszczyć ciężkiego czołgu dowolną liczbą zwykłych trafień karabinowych w jednolity pasek HP. Zagrożenia dla niego wynikają z uzbrojenia i wydarzeń przewidzianych w misji.

Nie wymuszaj identycznej liczby czołgów po obu stronach. Awaria ważnego pojazdu nie może bezpowrotnie blokować zadania. Podaj w danych misji warunek zastępczy albo jasny warunek porażki.

### 15. Reżyseria bitwy i cele misji

Oddziel skrypty przebiegu misji od AI wykonującego rozkazy. Skrypt może rozpocząć natarcie; nie powinien udawać trafień, ignorować osłon ani przesuwać żołnierzy przez przeszkody.

Użyj danych opisujących cele, zależności, wyzwalacze, strefy, posiłki, checkpointy i zakończenia. Zdarzenia wykonują się najwyżej raz, także po ponownym wczytaniu. Waliduj identyfikatory oraz zależności celów.

Rozróżniaj walkę interaktywną blisko gracza i tańsze tło bitwy. Tło nie może podszywać się pod dostępnego do trafienia żołnierza ani potajemnie zadawać obrażeń bez reprezentacji zagrożenia.

Posiłki pojawiają się w uzasadnionych, niewidocznych miejscach i docierają do walki normalną drogą. Nie twórz nieskończonych fal do chwili wejścia na niewidoczny wyzwalacz. Każde starcie ma określone zasady i granice posiłków.

Artyleria ma warstwę atmosferyczną oraz zaprojektowane zagrożenia. Groźny ostrzał musi być możliwy do odczytania i przetrwania przez dostępne działanie. Bez losowej, nieuniknionej śmierci z nieba.

Cele nie powinny wymagać zabicia zagubionego NPC na końcu mapy. Śmierć zwykłego sojusznika nie blokuje otwarcia przejścia. Ważne role mogą przejąć inni żołnierze; wymagane wyjątki fabularne muszą być jawnie zaprojektowane, nie ukrytą nieśmiertelnością połowy oddziału.

### 16. Menu, interfejs, dźwięk i obsługa przeglądarki

Menu główne ma wojenny, oszczędny charakter: mapa sztabowa, dokumenty, osobne tło lub lekka scena dekoracyjna, własna typografia i muzyka. Zawiera nową kampanię, kontynuację, wybór odblokowanej misji, ustawienia, sterowanie i informacje o autorach oraz zasobach. Nie dodawaj niedziałającego przycisku zamknięcia przeglądarki.

Wejście na stronę **nie tworzy świata misji i nie uruchamia walki**. Menu, wczytywanie, rozgrywka, pauza, śmierć i zakończenie są odrębnymi stanami. Przy wyjściu z misji sprzątaj scenę, timery, dźwięki, referencje i zadania workerów.

HUD pokazuje amunicję, granaty, aktywny cel, kontekst interakcji i stan zagrożenia zdrowia. Bez minimapy ujawniającej wszystkich przeciwników. Znaczniki celów mogą pomagać w nawigacji, ale nie powinny stale zasłaniać obrazu. Tekst musi być czytelny w 1080p i przy skalowaniu interfejsu.

Dźwięk: odrębne odgłosy broni i jej mechanizmów, kroki zależne od podłoża, trafienia, wybuchy, gąsienice, silniki, oddech i tło bitwy. Dźwięki pozycyjne mają zasięg, priorytety i limit jednoczesnych źródeł. Ogranicz powtarzalność wariantami. Brak dubbingu nie usprawiedliwia ubogiego udźwiękowienia.

Ustawienia obejmują grafikę, rozdzielczość renderowania, pole widzenia, czułość, klawisze, głośności, napisy oraz intensywność drgań i kołysania. Presety graficzne zmieniają koszt renderowania, nie uczciwość AI ani obecność istotnych przeciwników.

Pointer lock i audio uruchamiaj przez świadomą interakcję użytkownika. Obsłuż odmowę i utratę blokady myszy. Esc, utrata fokusu i ukrycie karty zatrzymują rozgrywkę; powrót wymaga świadomego wznowienia. Wyczyść wciśnięte klawisze, aby postać nie biegła sama. Nie odgrywaj po powrocie zaległych sekund symulacji.

Wczytywanie pokazuje rzeczywisty postęp lub uczciwy stan etapów. Błąd zasobu daje komunikat, ponowienie lub powrót, nie nieskończony ekran. Brak WebGL2 lub utrata kontekstu grafiki wymagają czytelnej obsługi zamiast pustego canvasa.

### 17. Zapis i checkpointy

Ustawienia i postęp kampanii zapisuj lokalnie. Dla większych snapshotów użyj IndexedDB lub równoważnego rozwiązania; nie zapisuj całego świata synchronicznie w każdej klatce. Ostrzeż, że zapis jest lokalny i może zniknąć po usunięciu danych strony. Obsłuż odmowę zapisu oraz brak miejsca.

Checkpoint odtwarza spójny stan logiczny: identyfikator i wersję misji, cele i wykonane zdarzenia, stan gracza, amunicję, przedmioty, istotnych NPC, pojazdy, posiłki i pozostałe czasy zaplanowanych działań. Używaj stabilnych identyfikatorów oraz wersjonowanego formatu.

Przy wczytywaniu odbudowuj referencje i subskrypcje bez duplikowania obiektów. Nie musisz odtwarzać każdej cząsteczki lub pozy zwłok, ale nie możesz przywrócić wcześniej zużytej apteczki albo ponownie uruchomić już zakończonego natarcia.

Checkpointy nie powstają w sytuacji gwarantującej natychmiastową śmierć. Uszkodzony lub niezgodny zapis ma dać bezpieczny powrót do początku misji, bez skasowania całego postępu w ciemno.

### 18. Architektura i wydajność

Podziel projekt według odpowiedzialności: aplikacja i stany; zasoby; gracz i wejście; walka; AI i nawigacja; pojazdy; misje; zapis; audio; interfejs; narzędzia diagnostyczne. Definicje broni i misji oddziel od kodu. Nie twórz jednego olbrzymiego pliku ani ogólnego silnika większego od gry.

Ustal jednego właściciela pozycji i stanu każdego obiektu. Oddziel krok symulacji od renderowania, ogranicz nadrabianie opóźnionych klatek i poprawnie obsłuż pauzę. Unikaj niekontrolowanych alokacji w głównych pętlach.

Ciężkie obliczenia nawigacji lub przygotowania danych wykonuj offline albo w workerach, jeśli pomiary uzasadniają koszt komunikacji. Nie przesyłaj obiektów sceny do workerów. Wyniki mają identyfikator żądania i wersję misji; wynik dla opuszczonej sceny jest odrzucany. Nie przenoś całej logiki do workera wyłącznie dla samego hasła „wielowątkowość”.

Cel projektowy: stabilne **60 FPS przy 1080p na uzgodnionym sprzęcie referencyjnym**, potwierdzone pomiarami w bitwie. Nie gwarantuj tego przed testami. Pierwsza scena pomiarowa powinna obejmować orientacyjnie 24–32 aktywnych żołnierzy obu stron, dwa działające pojazdy i reprezentatywne efekty; liczby są punktem startowym do profilowania.

Stosuj culling, LOD, instancing odpowiednich obiektów, ograniczone koszty cieni i cząsteczek, rzadsze decyzje odległego AI oraz budżet raycastów i wyznaczania dróg. LOD symulacji nie może usuwać realnego zagrożenia, przywracać zabitych NPC ani zmieniać wyniku trafienia.

Ładuj wybraną misję, nie wszystkie poziomy naraz. Mierz rozmiar pobierania, pamięć, czasy klatek CPU/GPU tam, gdzie dostępne, oraz p95 czasu klatki. Testuj powtarzane restarty i zmianę map: brak nieograniczonego wzrostu pamięci jest warunkiem odbioru. Pomiar na pustej scenie lub w programowym rendererze nie potwierdza docelowej wydajności.

### 19. Etapy realizacji

**Etap 0 — przygotowanie i ograniczenie ryzyka.** Sprawdź repozytorium oraz instrukcje, ustal strukturę, zależności, zasoby, formaty danych i plan testów. Przygotuj rejestr wymagań. Uruchom minimalny build pod ścieżką repozytorium. Sprawdź import reprezentatywnego żołnierza z animacjami, broni oraz pojazdu. Braki zasobów ujawnij teraz, nie pod koniec.

**Etap 1 — fundament gry.** Mały odcinek okopów, poprawny gracz, jeden karabin, granat, trafienia, zdrowie, apteczka, podstawowe animacje i przeciwnicy obu stron. Działające menu, wczytywanie, pauza i restart. Zakończ testami ruchu, kolizji i walki.

**Etap 2 — systemowa potyczka.** Nawigacja, osłony, percepcja, przeładowanie, reakcje na zagrożenia, role oddziału i rzeczywiste straty po obu stronach. Jeden czołg z zadaniem i ograniczeniami. Panel diagnostyczny pozwala oglądać aktualny stan AI, cel, trasę, osłonę i sektory ostrzału pojazdu.

**Etap 3 — kompletna misja pokazowa.** Ukończ Cambrai od menu przez odprawę, walkę i checkpointy do podsumowania. Zastosuj docelowy kierunek wizualny oraz dźwięk. Usuń placeholdery z kluczowych elementów. Zmierz wydajność i usuń blokady postępu. Nie twórz jeszcze czterech kolejnych map na niestabilnej podstawie.

**Etap 4 — pełna kampania.** Dodaj pozostałe misje i odpowiednie wyposażenie. Sprawdź chronologię, ciągłość fabularną, różnorodność poziomów, odblokowywanie misji oraz cały przebieg kampanii.

**Etap 5 — stabilizacja i wydanie.** Testy regresji, poprawki modeli i animacji, balans, przegląd historii i licencji, optymalizacja, testy produkcyjnego buildu w przeglądarkach i przygotowanie publikacji.

Każdy etap kończy się działającym stanem i raportem z rzeczywiście wykonanych testów. Gdy nie mieści się całość prac, pozostaw spójny rezultat oraz precyzyjny stan kontynuacji. Nie udawaj ukończenia, nie porzucaj zakresu bez wyjaśnienia i nie kończ wyłącznie na deklaracji, że kiedyś go zrealizujesz.

### 20. Testy odbioru

Poniższe przypadki muszą mieć wynik oraz opis sposobu sprawdzenia. Testy automatyczne logiki uzupełnij testami integracyjnymi, wizualnymi i rozgrywką w prawdziwej przeglądarce.

| Obszar | Warunek zaliczenia |
| --- | --- |
| Uruchomienie | Build działa z katalogu głównego i ścieżki repozytorium; modele, audio i ewentualny WASM wczytują się bez błędów. |
| Menu | Przed wyborem misji nie istnieje aktywna symulacja bitwy ani ładowanie całej kampanii. |
| Pauza | Esc i zmiana karty zatrzymują ruch, AI, obrażenia, regenerację i timery; wznowienie nie powoduje skoku czasu. |
| Ruch | Przejście całego poziomu bez wypadania z mapy, przenikania ścian i nieprawidłowej zmiany postawy. |
| Trafienia | Ściana między lufą a celem blokuje strzał również wtedy, gdy kamera widzi cel; hitboxy odpowiadają postawie. |
| Broń | Przeładowanie, zmiana broni i wczytanie zapisu nie powielają amunicji ani nie omijają pracy zamka. |
| Granaty | Odbijają się, wybuchają raz, uwzględniają osłony i wywołują reakcję NPC, które je zauważyły. |
| Zdrowie | Regeneracja i apteczki działają razem; pełne zdrowie nie zużywa apteczki; obrażenia resetują opóźnienie. |
| Percepcja | NPC po utracie kontaktu nie śledzi aktualnej pozycji gracza przez ścianę. |
| Samodzielna walka | Podczas co najmniej 60 sekund obserwacji obie strony strzelają, przemieszczają się, przeładowują i mogą ponosić straty bez strzałów gracza. |
| Nawigacja | Grupa przechodzi przez ciasne okopy; blokada uruchamia ustąpienie lub zmianę trasy, nie trwałe zakleszczenie. |
| Pojazdy | Pokonują zaprojektowaną trasę, respektują przeszkody i sektory broni; awaria nie blokuje misji bez rozwiązania. |
| Animacje | Nie występują trwałe pozy T, wystrzały z opuszczonej broni, rażące ślizganie ani działania martwych NPC. |
| Checkpoint | Wczytanie przed i po ważnym wydarzeniu zachowuje spójny świat; brak duplikacji posiłków i przedmiotów. |
| Odporność misji | Śmierć sojusznika, obejście trasy, brak amunicji i wcześniejsze wyeliminowanie celu nie prowadzą do ukrytej blokady postępu. |
| Kampania | Wszystkie pięć misji można przejść kolejno od nowej gry do epilogu bez konsoli i ręcznej naprawy zapisu. |
| Stabilność | Co najmniej 10 cykli wczytania i opuszczenia misji bez narastania aktywnych scen, timerów i nieograniczonego zużycia pamięci. |
| Wydajność | Raport obejmuje reprezentatywną walkę, sprzęt, przeglądarkę, ustawienia i czasy klatek, nie sam maksymalny FPS. |

Testuj desktopowe Firefox i Chrome/Edge. Jeżeli któregoś środowiska lub testu nie uda się uruchomić, zaznacz to jednoznacznie. Nie wpisuj „przetestowane” na podstawie samego przeczytania kodu.

### 21. Dokumentacja i zasady pracy

Dostarcz kod, zasoby, konfigurację budowania i publikacji, README, dokumentację architektury, plan etapów, rejestr wymagań, raport testów, listę znanych problemów, `docs/HISTORY.md` i `ASSET_LICENSES.md`.

Rejestr wymagań ma łączyć wymaganie z modułem, etapem, testem oraz statusem. Odróżniaj: planowane, prototypowe, zaimplementowane i zweryfikowane. Duża liczba plików nie jest dowodem ukończenia.

Przed zmianami przeczytaj instrukcje repozytorium i sprawdź stan pracy użytkownika. Nie nadpisuj cudzych zmian. Pracuj na zastanym branchu; nie zakładaj nowych branchy. Worktree twórz wyłącznie po wyraźnej zgodzie i posprzątaj tylko własne, zatwierdzone środowiska po bezpiecznym zakończeniu. Bez destrukcyjnego resetowania historii i force-pusha.

Przygotowanie workflow publikacyjnego nie oznacza zgody na samodzielne upublicznienie repozytorium, zmianę widoczności projektu, uruchomienie płatnej usługi lub zakup zasobów.

Nie ukrywaj błędów pustymi blokami obsługi wyjątków. Nie zostawiaj przycisków udających działające funkcje. Nie oznaczaj brakujących modeli, atrap AI ani samych opisów misji jako ukończonej zawartości.

**Ostateczna definicja sukcesu:** gracz otwiera stronę, widzi menu, uruchamia kampanię, gra w pięć różnych misji osadzonych w realiach I wojny światowej, walczy w przekonującym otoczeniu z aktywnymi żołnierzami obu stron, korzysta z dopracowanych broni, obserwuje sensowne działania pojazdów i dociera do zakończenia bez ręcznego naprawiania gry.

Zacznij od sprawdzenia projektu i realizacji etapu 0, a następnie przechodź przez etapy w podanej kolejności. Ten dokument jest zleceniem realizacji, nie prośbą o ponowne wypisanie samej koncepcji.

---

## Materiały referencyjne

Poniższe materiały służą do weryfikacji historii i technologii. Nie stanowią automatycznie zgody na kopiowanie grafik, nagrań lub innych zasobów. Wymagania dotyczące AI, balansu, fabuły i architektury są autorskim projektem, nie treścią tych źródeł.

- Imperial War Museums, „First Day Of The Battle Of The Somme”: https://www.iwm.org.uk/history/first-world-war/somme/first-day
- National Army Museum, „Attack of the tanks”: https://www.nam.ac.uk/explore/attack-tanks
- Imperial War Museums, „Battle of Passchendaele — The Third Battle of Ypres”: https://www.iwm.org.uk/history/first-world-war/passchendaele
- Imperial War Museums, „The Fighting Tactics Of The Battle Of Cambrai”: https://www.iwm.org.uk/history/first-world-war/western-front/cambrai
- Imperial War Museums, fotografia Mark IV przed Cambrai: https://www.iwm.org.uk/collections/item/object/205215585
- Imperial War Museums, „Battle Of Amiens 1918: Victory On The Somme”: https://www.iwm.org.uk/history/first-world-war/battle-of-amiens
- The Tank Museum, „Mark V”: https://tankmuseum.org/tank-nuts/tank-collection/mark-v/
- National Army Museum, „Weapons of the Western Front”: https://www.nam.ac.uk/explore/weapons-western-front
- Imperial War Museums, Gewehr 98: https://www.iwm.org.uk/collections/item/object/30034964
- Imperial War Museums, MG 08: https://www.iwm.org.uk/collections/item/object/30034915
- Imperial War Museums, Webley Mk VI: https://www.iwm.org.uk/collections/item/object/30034679
- Imperial War Museums, Mills No. 5: https://www.iwm.org.uk/collections/item/object/30022763
- Imperial War Museums, Stielhandgranate z 1915 roku: https://www.iwm.org.uk/collections/item/object/30023017
- Babylon.js, specyfikacja funkcji: https://www.babylonjs.com/specifications/
- Babylon.js, importer glTF: https://doc.babylonjs.com/features/featuresDeepDive/importers/glTF
- Babylon.js, nawigacja: https://doc.babylonjs.com/features/featuresDeepDive/crowdNavigation/v2Intro/
- Vite, publikacja statyczna: https://vite.dev/guide/static-deploy
- GitHub Docs, GitHub Pages: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
- MDN, Pointer Lock API: https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API
- MDN, zasady automatycznego odtwarzania audio: https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay
