# Zmiany v0.4.5 — rewizja 2: HUD, napisy i drzwi odprawy

**Wersja: 0.4.5, UI_REVISION: 2. Baza: dostarczone archiwum `ZiemiaNiczyja 0.4.5 rew1.zip`.**
To poprawki rew1, nie nowa wersja 0.4.6. Wpisy wcześniejszych wydań poniżej pozostają historyczne.

## HUD i napisy

- Usunięto dodatkowy poziomy pasek HP z markupu, aktualizacji i CSS. Zdrowie pokazują
  krzyż i liczba; pod nimi pozostaje tylko pasek wytrzymałości.
- Pasek wytrzymałości biegnie od lewego brzegu pola ikony postawy do prawego brzegu
  liczby HP. Szerokość wynika z rzeczywistych rozmiarów całego rzędu, także przy
  różnych skalach postawy i HP. Lokalna skala wytrzymałości reguluje grubość paska,
  nie rozrywa tego wyrównania. Wyświetlanie jednej/dwóch/trzech cyfr nie przesuwa końca.
- Zastąpiono liniowe „patyczaki” trzema oryginalnymi, pełnymi sylwetkami żołnierza
  z hełmem i karabinem: stojącego, kucającego i leżącego. Bez trójkąta, tła ani
  kopiowania grafiki z CoD. Ikona nadal wynika z zatwierdzonej postawy gracza.
- Ikona broni i amunicja tworzą zwarty rząd z odstępem 10 px przy skali 100%.
  Usunięto rozpychanie rzędu i stałą pustą szerokość modułu. Przycięto marginesy
  viewBox dotychczasowych SVG broni; samych kształtów broni nie podmieniano.
- Napisy mają wyróżnione turkusowo imię mówcy i jasną wypowiedź w tej samej linii,
  z zawijaniem i ciemnym cieniem zamiast panelu tła. Tekst jest wstawiany do stałych
  elementów przez textContent, nie interpretowany jako HTML. Komunikaty bez mówcy
  nie odziedziczają nazwiska z poprzedniej kwestii. Zachowano PL/EN i opcję napisów.
- Zachowano istniejący układ mierzący powiększone elementy, limit skali wynikowej 200%,
  podpowiedzi interakcji, ostrzeżenie o niskim HP, minimapę i osobne skalowanie F3.

## Odprawa i drzwi

- W istniejącym wschodnim wyjściu pomieszczenia odprawy umieszczono drewniane,
  dwuskrzydłowe drzwi z belkami, zawiasami i uchwytami. Wykorzystują istniejące
  materiały i sześć partii geometrii, bez nowego pakietu modeli lub zależności.
- Usunięto globalną interakcję pomijania odprawy i powtarzającą ją podpowiedź celu.
  „Otwórz drzwi i pomiń odprawę” pojawia się dopiero w pobliżu drzwi, gdy gracz
  jest zwrócony w ich stronę i nie oddziela go inna przeszkoda. Używany jest aktualnie
  przypisany klawisz interakcji, nie zakodowane na sztywno E.
- Interakcja uruchamia dotychczasowy start natarcia i otwiera skrzydła na zewnątrz
  przez 0,65 s. Naturalny koniec odprawy i wcześniejszy alarm otwierają te same drzwi.
  Ponowne naciśnięcie nie powtarza fazy ani gwizdka.
- Zamknięte skrzydła mają rzeczywistą kolizję dla ruchu, nawigacji i pocisków.
  Wizualizacja i kolizja używają wspólnych pozycji/kątów. Stan otwarcia wynika
  z zapisywanych już fazy misji i czasu początku szturmu; bez nowej wersji zapisu,
  kasowania checkpointów albo resetowania ustawień.
- Testowy autoplayer podchodzi do drzwi i używa zwykłej interakcji. Ponawia trasę,
  gdy rozpoczęcie natarcia wyprzedza koniec animacji otwarcia. Nie zmieniono przez
  to zachowania produkcyjnego AI, obrażeń, poziomów trudności ani liczby żołnierzy.

## Utrzymanie

- Dodano regresje układu HP/wytrzymałości, bezpiecznych napisów, fizycznych drzwi,
  końca/skipu/alarmu odprawy, stanu zapisu, geometrii i wychodzenia przez ruchome skrzydła.
- Zaktualizowano metadane rewizji, manifest zasobów UI, opisy autorstwa oraz instrukcję.
  Zachowano grafikę nieba i inne zmiany dostarczonego rew1.
- Raport faktycznie wykonanych prób i ograniczeń: `docs/V0_4_5_REW2_IMPLEMENTATION.md`.
  Zmiany nie zawierają deklaracji pomiaru na fizycznym GPU ani testu gry przy 165 Hz.

---

# Zmiany v0.4.5 — HUD, informacje o walce i płynność

**Wersja: 0.4.5, UI_REVISION: 1. Ostatnia aktualizacja funkcjonalna serii 0.4.**
Baza: GitHub `Mentiuszen/ziemianiczyja`, commit
`a567537c528e46b89fac0ff94555460f83bc864c` („fix tatooine”).
Paczka aktualizacyjna nie publikuje gry ani nie zmienia repozytorium zdalnego.

## HUD i opcje

- Dodano skalę globalną i 18 niezależnych mnożników modułów HUD-u: 50–200%,
  z limitem **wynikowym 200%**. Wynik i osiągnięcie limitu są widoczne w opcjach.
  Menu oraz F3 nie są skalowane. Reset HUD-u zachowuje kampanię, język, dźwięk i klawisze.
- Układ rezerwuje rzeczywiste rozmiary powiększonych modułów, zawija tekst i przenosi
  elementy między strefami. Na zbyt małym ekranie ogranicza treści pomocnicze;
  status kompaktowy jest opisany w opcjach. Nie zmienia zapisanej skali po cichu.
- Minimapa ma bufor dopasowany do końcowego rozmiaru i DPR (limit 2), a nie tylko
  rozciągnięty obraz. Niewidoczna przez układ minimapa nie jest ponownie rysowana.
- Dodano trzy oryginalne wektorowe ikony postawy obok zdrowia. Odczytują zatwierdzony
  stan gracza, również gdy kolizja nie pozwala wstać.

## Informacje o walce

- Dopracowano czerwone krawędzie ekranu przy obrażeniach, z wolnym środkiem i obsługą
  ograniczenia animacji. Usunięto filtr saturacji nakładany na cały Canvas WebGL.
- Ostrzeżenie „Jesteś ranny! Znajdź osłonę!” / “You’re hurt! Get to cover!” pojawia się
  wyłącznie u żywego gracza poniżej 20% HP. Pozostaje czytelne przy `damageEffects=0`.
- Zastąpiono stary celownik wyborem: kropka, krzyżak, krzyżak z kropką, brak.
  Dostępny jest podgląd w opcjach. Wybór nie wpływa na rozrzut ani obrażenia.
- Hitmarker jest oddzielną warstwą działającą również w ADS i przy wyłączonym celowniku.
  Cztery kreski są odsunięte od środka; odległość uwzględnia rozmiar celownika.
- Białe potwierdzenie trafienia i czerwone zabójstwa pochodzą ze wspólnego punktu
  zatwierdzenia obrażeń. Obejmują pocisk, melee i granat gracza; nie potwierdzają
  friendly fire, trafień w zwłoki ani zabójstw dokonanych przez NPC.
  Kolejne zwykłe trafienie nie kasuje aktywnego czerwonego potwierdzenia.
- Kierunkowe znaczniki wskazują rzeczywistą pozycję wrogiego granatu lub kierunek
  poza ekranem, także za plecami. Uwzględniają zasłanianie eksplozji, wysokość,
  zatwierdzoną kamerę, kilka zagrożeń, dodatkowy licznik oraz usunięcie po wybuchu.

## F3 i czas klatki

- Usunięto CPU/GPU z opcji i zwykłego overlayu. Zachowano prosty FPS.
  Stare zapisane `showCpu`/`showGpu` są ignorowane bez resetowania preferencji.
- F3 pokazuje średnią, p95/p99 czasu klatki, CPU i GPU, maksimum, rozbicie CPU,
  odstępy RAF, kroki symulacji, porzucony czas, nawigację, przekroczenia budżetu
  i wykres ostatnich klatek. Zachowano informacje o scenie, misji i wsparciu.
- Okno próbek wynosi do 10 s, publikacja co 250 ms. p99 wymaga co najmniej 100
  ważnych próbek; mniejsze próby są jawnie oznaczane. FPS odpowiadający p99 czasu
  klatki nie jest podpisywany jako średnia „1% low”.
- GPU używa surowych, asynchronicznych wyników z ID klatki i sesji. Brak rozszerzenia,
  disjoint i utrata kontekstu nie stają się zerowym czasem GPU. Rytm próbkowania
  domyślnie zmienia się 3/4/5 klatek, bez używania RNG gry.
- F4 resetuje pomiar, F6 rozpoczyna/zatrzymuje rejestrację, F7 eksportuje JSON.
  Bufory są ograniczone; eksport ujawnia obcięcie najstarszych próbek.

## Płynność i utrzymanie

- Dodano interpolację transformacji między krokami symulacji 60 Hz. Nie interpoluje
  HP, amunicji, trafień ani AI i nie klonuje checkpointów co klatkę.
  Obrót myszy ma odczyt prezentacyjny bez podwójnego zużycia delty; FOV i wysokość
  oka używają rzeczywistego czasu prezentacji, bez minimum 16 ms na render.
- Nawigacja wykonuje porcje pracy zamiast dwóch pełnych A* w jednym skoku. Zimne
  rozwinięcia grafu kosztują więcej budżetu niż cache. Zachowano priorytety,
  generacje/anulowanie i kontrolę aktualnych przeszkód przed przyjęciem ścieżki.
- Bufory i kopiec A* są wielokrotnego użytku. Zniszczenie pojedynczego drutu
  unieważnia lokalne krawędzie, zamiast czyścić cache całego pola walki.
- Stały HUD ma cache geometrii; ruch świata nie uruchamia kolejnego pełnego pomiaru DOM.
- Naprawiono kontrolę zasobów: baza nie zawierała `authoring/ui/manifest.json`.
  Sprawdzany manifest znajduje się teraz przy rzeczywiście dostarczanych zasobach,
  w `public/assets/ui/manifest.json`; weryfikacja hashy nie została wyłączona.
- Zachowano obecne tła, modele, tekstury świata, vendor, profile obrażeń, liczbę
  jednostek, wersję zapisu i schemat misji. Nie dodano zależności npm.

## Weryfikacja i granice wyniku

Wyniki: `docs/V0_4_5_VALIDATION.json`, `docs/V0_4_5_IMPLEMENTATION.md` oraz surowe
raporty w `docs/validation/v045/`. Testy logiki i DOM nie zastępują odbioru GPU.
W tym środowisku lokalny HTTP jest blokowany, a WebGL2 jest niedostępny.
Pełny obraz gry, sterownik i p95/p99 na fizycznym GPU wymagają lokalnej weryfikacji.
Porównanie Node wykazało mniejsze najdłuższe skoki CPU; p95/p99 nie poprawiły się
w każdej próbie. Nie deklarujemy usunięcia wszystkich mikroprzycięć ani stałych 165 FPS.

---

# Zmiany v0.4.4 — rewizja 3A (grafiki kampanii i ładowania)

**Wersja: 0.4.4, UI_REVISION: 3. Bez publikacji.**
**Zakres tej poprawki: podpięcie nowych, samodzielnych teł `campaign-art.webp` i `loading-art.webp` oraz poprawa czytelności tekstu na tych ekranach.**

## Ekran kampanii

- Ekran kampanii korzysta teraz z osobnej grafiki `public/assets/ui/campaign-art.webp`,
  zamiast poprzedniego neutralnego tła. Grafika jest używana jako pełnoekranowe tło
  pod właściwym układem mapy, listy misji i panelu rozdziału.
- Dodano warstwę przyciemnienia i delikatne winietowanie, aby nagłówki, opis misji,
  karty rozdziałów oraz kontrolki mapy pozostały czytelne niezależnie od monitora.
- Dla szerokich proporcji, w tym 21:9, ustawiono osobne pozycjonowanie tła, tak aby
  stół i centralne materiały były nadal widoczne bez przypadkowego ucięcia kluczowych
  elementów kompozycji.

## Ekran ładowania

- Ekran ładowania korzysta teraz z osobnej grafiki `public/assets/ui/loading-art.webp`.
- Zmieniono układ na ciemny, półprzezroczysty panel nad tłem; zawiera on tytuł, status
  ładowania, pasek postępu, wskazówkę i przycisk anulowania.
- Warstwy przyciemnienia, rozmycie panelu i mocniejsze kontrasty zapewniają czytelność
  komunikatów niezależnie od jasności tła.

## Zakres techniczny

- Zmieniono tylko warstwę interfejsu i assety tła; logika kampanii, ładowania, zapisu,
  trudności i minimapy pozostaje bez zmian względem rewizji 3.
- Numer wydania pozostaje `0.4.4`, a `ZiemiaNiczyja.uiRevision` nadal zwraca `3`.

---

# Zmiany v0.4.4 — rewizja 3 (częściowy zakres)

**Wersja: 0.4.4, UI_REVISION: 3. Bez publikacji.**
**Zrealizowano punkty 2–4 zamówienia R3. Punkt 1 — regeneracja samodzielnych teł
w wysokiej rozdzielczości — nie został dostarczony. Nadal używane są tła R2.**

## Tytuł i logo PL/EN

- English używa nazwy **No Man’s Land** i osobnego wektorowego `logo-en.svg`.
  Polski zachowuje **Ziemia Niczyja** oraz dotychczasowy logotyp.
- Nazwa przełącza się także w tytule karty przeglądarki, metadanych strony,
  opisie projektu i tekstowym zastępstwie logo. Nie zmieniono technicznych nazw
  repozytorium, IndexedDB, kluczy ustawień ani API `ZiemiaNiczyja`.
- Oba logotypy są niezależne od tła. Angielski eksport zawiera kontury znaków,
  nie odwołania do zewnętrznego fontu; nota pochodzenia jest zachowana.

## Trudność wyłącznie na ekranie kampanii

- Usunięto kontrolkę trudności ze wszystkich kategorii Opcji. Reset Rozgrywki
  nie zmienia poziomu trudności ani preferencji następnej kampanii.
- W Nowej kampanii wybór określa profil nowego startu i nie zmienia starego checkpointu.
- W Kontynuacji kampanii można zmienić trudność grywalnej, nieukończonej misji.
  Zmieniany jest checkpoint i jego powiązane metadane w tej samej transakcji Store.
  Zmiana nie uruchamia świata, nie rozpoczyna misji od nowa i nie uzupełnia HP/amunicji.
- Pozostałe pola zapisu, w tym czas, RNG, pozycje, timery rozpoczętych akcji,
  ekwipunek, osiągnięte cele oraz identyfikator przebiegu, pozostają zachowane.
  Nowy profil działa po wznowieniu; trwające akcje zachowują swoje zapisane timery.
- Podczas zapisywania nie można wystartować ani uruchomić drugiej zmiany trudności.
  Wyjście z ekranu anuluje niezatwierdzony zapis. Zatwierdzona transakcja stanowi
  granicę przyjęcia zmiany i nie jest cofana przez późniejsze wyjście.
- Gdy trwały zapis jest niedostępny, aplikacja zachowuje spójną parę w tej sesji
  i pokazuje ostrzeżenie. Stary trwały zapis pozostaje na dysku.

## Płynna aktualizacja mapy frontu

- Linia frontu zmienia kształt przez około 0,9 sekundy, zamiast natychmiastowej
  podmiany całej warstwy SVG. Kamera przechodzi w tym samym czasie.
- Strzałki obu dat płynnie wygasają/pojawiają się. Szybki kolejny wybór startuje
  z obecnie wyświetlanego kształtu i krycia, nie z poprzedniego punktu końcowego.
- Pośredni obraz jest podpisany jako przejście; nie udaje kolejnej historycznej daty.
  Po zakończeniu wraca dokładna, niezmieniona polilinia wybranej misji z R2.
- Pomiń oraz ograniczenie animacji kończą przejście od razu. Opcje, ukryta karta
  i przełączenie języka nie resetują animacji ani nie zużywają czasu symulacji.

## Niezamknięty punkt: tła

Próby generowania nie dostarczyły właściwych pojedynczych teł o większej
rozdzielczości. Plansze z nadrukowanym UI nie są włączone do gry. Nie powiększono
małych wycinków do 4K pod nazwą nowych masterów. Rozmycie teł R2 pozostaje ograniczeniem.
Ta paczka **nie spełnia jeszcze całego zamówienia R3**.

Wyniki testów i granice odbioru: `docs/V0_4_4_R3_IMPLEMENTATION.md`.

---

# Zmiany v0.4.4 — rewizja 2

**Status: poprawiona implementacja do lokalnego odbioru. Numer wydania pozostaje 0.4.4; rewizja UI = 2.**
**Baza tej rewizji: aktualny ZIP użytkownika `ZiemiaNiczyja.zip`, nie ponownie pobrany main 0.4.3.**

## Wygląd zgodny z wybranym kierunkiem

- Wybór języka, main i opcje mają trzy oddzielne tła zaadaptowane z wybranego przez użytkownika konceptu. Z teł usunięto nadrukowane kontrolki i teksty; właściwe elementy są renderowane w HTML/CSS. Grafiki nie udają zrzutów działającej gry ani nowych natywnych assetów 4K.
- Nowy wektorowy logotyp: mocne, przetarte litery, sylwetka piechura pomiędzy słowami oraz motyw drutu. Eksport zawiera krzywe, nie plik fontu.
- Main otrzymał pełne tło sceny z żołnierzem po prawej oraz ciemną strefę pod menu, cieńsze separatory i oszczędne podświetlenie. Nadal ma dokładnie cztery działania i samo `v0.4.4` w rogu.
- Picker zachowuje flagi PL i USA/UK, brak ramek, klawiaturę, zapamiętanie wyboru i obowiązkowy pierwszy wybór. Zmieniono skalę oraz typografię podpisów i kompozycję tła.
- Opcje: przygaszone tło stanowiska dowodzenia, proste zakładki i równe wiersze. Doszły strzałki poprzedniej/następnej wartości obok dostępnych list oraz przełączniki z widocznym On/Off. Pod nimi nadal pracują natywne, podpisane selecty i checkboxy. Nie dodano fikcyjnych opcji z tekstu mockupu (dronów, automatycznego celowania, obsługi gamepada).

## Kampania: mapa nad rozdziałami i datowane pozycje

- Mapa zajmuje górną część ekranu. Pięć kart rozdziałów znajduje się poniżej, w kolejności 01–05; na wąskim ekranie przewijają się poziomo. Opis i rozpoczęcie/wznowienie są pod kartami, zamiast w bocznej kolumnie.
- Podkład ma rzeczywiste współrzędne geograficzne, wybrzeże, rzeki i rzeźbę w skali strategicznej. Geografia pochodzi z regionalnego wycinka GSHHG 2.3.6/basemap-data 2.0.0; źródła danych, licencje i edytowalny wycinek są dołączone. Nie używamy współczesnych granic politycznych jako granic z 1917 roku.
- Każdy wybór rozdziału zmienia linię frontu, kierunki natarcia, datę i zbliżenie: Somma (1.07.1916), Flers (15.09.1916), Ypres (październik 1917), Cambrai (20.11.1917), Amiens (8.08.1918).
- Linie wojskowe są własnymi, datowanymi uogólnieniami. Nie są pomiarem każdego okopu ani zweryfikowaną digitalizacją dziennych arkuszy. Dla Ypres nie wymyślono dnia: źródłowy rozdział ma datę miesięczną.
- Zmiana rozdziału przerywa nieaktualne intro, a zmiana języka i powrót z opcji zachowują wybór. Ograniczenie ruchu wyłącza przejazd kamery. Obserwator rozmiaru jest zwalniany przy opuszczeniu mapy.
- Tylko Cambrai pozostaje grywalne. Oglądanie wcześniejszego/późniejszego frontu nie odblokowuje misji, nie zapisuje jej ukończenia i nie zmienia checkpointu.

## Czystszy HUD

- Okrągła minimapa zamiast kwadratu: delikatny obrys, kierunki świata, jasny gracz, niebiescy sojusznicy i czerwone kontakty. Lokacja i data są pod tarczą, a cel bezpośrednio poniżej.
- Zasięg ujawniania dostosowano do okrągłego pola: promień 60 m, nie narożniki dawnego kwadratu ±60 m. Timery 3/2/1 s, kopia miejsca wystrzału, pauza oraz brak śledzenia cichych wrogów pozostają.
- Zdrowie: jasny symbol krzyża, liczba i krótki pasek w jednym wierszu. Broń, amunicja i liczba granatów również tworzą jeden zwarty wiersz. Nazwy dostępności pozostają, ale zbędne widoczne etykiety usunięto.
- Nie dodano przycisku Wstecz do rozgrywki. Stan świata, HP, amunicja, AI, kolizje, modele, języki i zapis misji zachowują działanie z bazowego ZIP-a.

## Utrzymanie

- Dodano 12 regresji rewizji, lokalny scenariusz `browser_v044_r2.py`, edytowalne źródła i odtwarzanie eksportów UI.
- `VERSION` nadal wynosi `0.4.4`; `UI_REVISION` i `ZiemiaNiczyja.uiRevision` identyfikują rewizję 2. Nie zmieniono formatu zapisu ani wersji mapy.
- Dokładne wyniki i ograniczenia odbioru: `docs/V0_4_4_R2_IMPLEMENTATION.md`. Nie wykonano pusha ani publikacji.

---

# Historia pierwszej rewizji 0.4.4

Poniższy opis jest historyczny; wygląd i stałe, które rewizja 2 zmienia powyżej, nie opisują już bieżącego interfejsu.

# Zmiany v0.4.4 — 6 września 2026

**Status: implementacja przygotowana do lokalnego odbioru; bez publikacji przez wykonawcę.**

Przebudowa menu, ekranu kampanii i HUD-u na bazie 0.4.3. Nadal dostępna jest jedna
grywalna misja: Cambrai. Aktualizacja nie przebudowuje terenu, modeli, AI, obrażeń ani audio.

## Menu główne i wybór języka

- Nowe menu: logo w lewym górnym rogu, ilustracja frontu po prawej, przyciski po lewej
  oraz wyłącznie `v0.4.4` w lewym dolnym rogu.
- Usunięto górny i dolny pasek, dossier bieżącej misji, opisy prototypu i osobny wybór misji.
- Cztery pozycje: **Kontynuuj kampanię, Nowa kampania, Opcje, O projekcie i zasobach**.
  Dwa wejścia do kampanii zastępują trzy poprzednie przyciski misji.
- Wybór języka nie ma obramowań flag ani całych kafli. Hover unosi/rozjaśnia flagę
  i podkreśla nazwę; fokus klawiatury ma dodatkowy wskaźnik bez prostokątnego obrysu.
- Zachowano flagi English USA/UK i Polski, zapis preferencji i blokadę wejścia do menu
  przed pierwszym wyborem. Żaden ekran menu nie uruchamia świata ani kamery WebGL.
- Odświeżono także informacje o projekcie, ładowanie, wejście do gry, pauzę, śmierć,
  ukończenie i błędy. Oryginalne linki oraz atrybucje pozostają dostępne w PL/EN.

## Osobna mapa kampanii

- Pełnoekranowy ekran kampanii ma własny schemat frontu zachodniego, strony frontu,
  datę 20 listopada 1917, punkty pięciu rozdziałów, zoom i podgląd lokalnego sektora.
- Nowa kampania pokazuje około 7-sekundowe wprowadzenie: Ypres, narracyjne przejście
  do Cambrai, zbliżenie oraz kierunek natarcia. Pomiń działa od początku i prowadzi
  do tego samego końcowego stanu; sekwencja nie zapętla się.
- Poprzedni rozdział „Morze błota” jest kontekstem, nie fikcyjnym ukończeniem.
  Somma, Flers, Ypres i Amiens nie mają aktywnego przycisku rozpoczęcia.
- Kontynuacja otwiera mapę z rzeczywistym checkpointem i jego trudnością. Dopiero
  „Wznów misję” wczytuje zapis; brak zapisu nigdy nie oznacza ukrytego nowego startu.
- Powrót z opcji i zmiana języka zachowują wybór rozdziału oraz oś czasu mapy.
  Ustawienie animacji menu i preferencja ograniczonego ruchu wyłączają zbędny ruch.
- Mapa jest autorskim schematem, nie digitalizacją dokładnej historycznej linii frontu.
  Trasa Ypres–Cambrai nie udaje udokumentowanego marszu jednostki gracza.

## Opcje i sterowanie

- Jeden ekran opcji, cztery zakładki: **Rozgrywka, Sterowanie, Dźwięk, Grafika**
  / **Gameplay, Controls, Audio, Graphics**. Widoczna jest tylko aktywna kategoria.
- Usunięto długie techniczne opisy; zachowano etykiety, wartości, krótką pomoc i błędy.
  Nie dodano ustawień, których gra nie realizuje.
- Wszystkie przypisania klawiszy i czułość przeniesiono do Sterowania. Osobny przycisk
  Sterowanie znika z main i pauzy. Konflikty klawiszy nadal rozwiązują się przez zamianę.
- Dodano przełączniki minimapy, flag sojuszników i animacji menu, domyślnie włączone.
- Zakresy ustawień pochodzą ze wspólnego schematu. Skala renderowania 50–150% odpowiada
  walidacji zapisu; starsze 130–150% nie są obcinane do dawnego limitu kontrolki.
- Reset dotyczy wyłącznie aktywnej kategorii, wymaga potwierdzenia i zachowuje język.
  Reset Sterowania obejmuje klawisze i czułość; nigdy checkpoint.
- Strzałki/Home/End obsługują zakładki. Escape najpierw anuluje capture, potem modal,
  następnie wraca do właściwego rodzica. Opcje z pauzy nie wznawiają gry automatycznie.
- Zmiany grafiki są scalane do najwyżej jednej aktualizacji na klatkę; zmiana tekstów,
  zakładki lub głośności nie odbudowuje świata.

## HUD, minimapa, sojusznicy i broń

- Minimapę umieszczono w prawym górnym rogu; lokacja i data są częścią jej modułu,
  a cel, podpowiedź i postęp obrony znajdują się bezpośrednio pod nią.
- Canvas 2D korzysta z faktycznych danych terenu, okopów, ramp, dróg i colliderów.
  Tło jest buforowane i aktualizowane po przełamaniu przeszkody. Nie dodano kamery 3D.
- Północ pozostaje na górze, gracz w środku, widoczny zakres wynosi ±60 m X/Z.
  Mapa odrysowuje się najwyżej 30 razy/s; DPR do 2 jest niezależny od renderScale gry.
- Widoczne są żywe sojusznicze jednostki, niezniszczone czołgi, aktywne samoloty i cel.
  Nie ma znaczników przyszłych wylotów, trupów ani wszechwiedzącego podglądu wrogów.
- Wrogie rzeczywiste wystrzały broni i działa tworzą jeden kontakt na strzelca:
  **Rekrut 3 s, Żołnierz 2 s, Weteran 1 s** od ostatniego wystrzału w czasie symulacji.
  Kontakt wskazuje skopiowane miejsce strzału, nie śledzi późniejszego ruchu NPC.
- Zasięg kontaktu sprawdzany jest w chwili strzału. Pauza nie zużywa czasu; język
  i wyłączenie/włączenie minimapy go nie odnawiają. Nowy świat usuwa stare kontakty.
- Dodano półprzezroczyste flagi UK nad głowami żywych sojuszników. Kotwice uwzględniają
  postawę i faktyczną macierz kamery. Flagi nie przejmują wejścia ani nie oznaczają wrogów.
- Widoczność flag ma ograniczony budżet geometrii: do 4 LOS na klatkę, cache do 0,15 s.
  Nieznany/przeterminowany wynik ukrywa znacznik. Nakładające się flagi są wyciszane,
  nie przesuwane nad inną postać; obszary celu, napisów i celownika są chronione.
- Nazwę broni w amunicji zastąpiono osobnymi sylwetkami SMLE, Gewehr, Webley, Lewis
  i MG 08. Nazwa pozostaje dostępna dla czytnika; liczby amunicji i zdrowie bez zmian.
- FPS/CPU/GPU przeniesiono na lewą górę, komunikaty checkpointu na środek pod kompasem.
  Usunięto drobny stały napis HUD z Esc/F3/wersją. Ostrzeżenia i napisy mają wspólną
  strefę układu, a niskie okno zmniejsza mapę zamiast zakrywać cel lub amunicję.

## Zapis i kompatybilność

- Dodano metadane bieżącej kampanii do tej samej bazy IndexedDB co checkpoint.
  Odczyt i zapis pary odbywają się w jednej transakcji, przez jedną kolejkę operacji.
- Sam podgląd Nowej kampanii nie usuwa zapisu. Potwierdzenie zastąpienia następuje
  dopiero przy rozpoczęciu. Anulowanie/błąd ładowania przed zatwierdzeniem zachowują
  poprzednią parę; odmowa trwałego magazynu daje spójny zapis sesyjny z ostrzeżeniem.
- Spóźniony wynik zastąpionego autosave nie przywraca starszego checkpointu w aplikacji.
  Błąd drugiego zapisu w transakcji anuluje także pierwszy, zamiast pozostawić pół pary.
- Ukończenie zapisuje stan bieżącego przebiegu, nie tylko historyczną flagę.
  Powrót z ukończenia prowadzi do rzeczywistej mapy kampanii.
- Poprawne checkpointy 0.4.1/0.4.2/0.4.3 są obsługiwane przez migrację metadanych.
  `SAVE_VERSION=1`, `MISSION_VERSION=3` i klucz ustawień pozostają bez zmian.
- Zachowano pełne PL/EN; katalogi zawierają po 463 klucze. Nie zmieniono naprawy
  przechyłu kamery ani parametrów walki, AI, geometrii, modeli i audio.

## Weryfikacja i przygotowanie wydania

Dodano testy menu, nawigacji, zakładek, kampanii i transakcji, kontaktów, minimapy,
projekcji rzeczywistej kamery, flag oraz ikon. Poprzednie regresje dostosowano do nowych
wejść i zakładek, zamiast usuwać ich sprawdzenia. Nowe narzędzie `browser_v044_ui.py`
obsługuje lokalny HTTP i opcjonalnie prawdziwy GameView przez `--game`.

Dokładne wyniki i ograniczenia: `docs/V0_4_4_IMPLEMENTATION.md` oraz `docs/TEST_REPORT.md`.
Test DOM i matematyki kamery nie jest odbiorem pełnej gry, trwałego IndexedDB ani
wydajności fizycznego GPU. Odbiór lokalny i publikacja pozostają odrębnym krokiem.

---

# Zmiany v0.4.3 — 6 września 2026

**Status: kod przygotowany do lokalnego odbioru; bez publikacji przez wykonawcę.**

Wydanie językowe na bazie 0.4.2. Pełne polskie i angielskie teksty gry,
jednorazowy ekran wyboru języka oraz zapamiętana preferencja niezależna od postępu.

## Wybór języka przy uruchomieniu

- Przed pierwszym menu pojawiają się dwa duże kafle: **English** i **Polski**.
- Flaga English łączy USA w górnym lewym trójkącie i UK w dolnym prawym;
  przekątna biegnie od lewego dolnego do prawego górnego narożnika. Polski ma flagę biało-czerwoną.
- Kliknięcie, Enter lub Spacja na kaflu zapisuje wybór i otwiera menu główne w danym języku.
  Nie ma wcześniejszego mignięcia menu, dodatkowego potwierdzenia ani automatycznego wyboru
  według języka przeglądarki. Wybór nie ładuje mapy i nie przejmuje kursora.
- Kolejne uruchomienia pomijają wybór. Starsze ustawienia bez języka oraz nieprawidłowe
  wartości wyświetlają wybór, zachowując jakość grafiki, klawisze i zapis misji.
- Dodano obsługę klawiatury, widoczny fokus, natywne nazwy języków i układ dla małych okien.
  Flagi są lokalnymi SVG; nie wymagają CDN, pobierania fontów ani usług tłumaczenia.

## Pełna warstwa tekstowa PL/EN

- Zlokalizowano menu główne, wybór misji, odprawę przed startem, ustawienia, sterowanie,
  informacje o projekcie, ładowanie, pauzę, ekran śmierci, ukończenia i błędów.
- Tłumaczenia obejmują HUD, postawy, przeładowanie, ostrzeżenia o zdrowiu i granatach,
  wszystkie cele i podpowiedzi, interakcje, wyposażenie, pickupy oraz checkpointy.
- Przetłumaczono siedem wypowiedzi odprawy, stopnie i ogólne nazwy rozmówców, meldunki oddziału,
  ostrzeżenia artylerii, czołgów i nalotów. Zachowano kolejność, czas i warunki zdarzeń.
- W obu językach dostępne są komunikaty walidacji zapisów, odmowy pamięci, ładowania zasobów,
  WebGL2, blokady kursora i audio oraz podpisy diagnostyki CPU/GPU/FPS i stanów AI.
- Podpowiedzi korzystają z faktycznie przypisanych klawiszy. Liczby interfejsu mają format
  właściwy dla języka. Tekst z parametrami jest wyświetlany bez interpretowania go jako HTML.
- Ekran informacji otwiera angielskie odpowiedniki historii, znanych ograniczeń i pochodzenia
  zasobów po wybraniu English. Oryginalne licencje zależności pozostają bez zmian.
- Nazwa **Ziemia Niczyja**, nazwy własne bohaterów, miejsc i broni nie zostały arbitralnie
  zmienione. Lokalizacja dotyczy tekstów, nie dubbingu ani nagrań.
- Dodano angielski napis w teksturze mapy na stole odprawy. Zmiana języka przełącza
  materiał bez przebudowy sceny. Oryginalna mapa pozostaje; wariant EN zmienia tylko obszar napisu.

## Zmiana języka i zgodność

- Opcja **Język / Language** zmienia teksty natychmiast, również w opcjach otwartych z pauzy.
  Nie przeładowuje strony, nie tworzy nowej sceny, nie resetuje zdrowia, czasu ani postępu.
- Aktywne powiadomienia, bieżący cel, podpis checkpointu i napisy odświeżają tłumaczenie
  bez ponownego wywoływania zdarzenia, przedłużania timera czy odtwarzania dźwięku.
- Wybór `pl` / `en` jest częścią `zn-settings-v1`, a nie snapshotu misji. Reset ustawień
  pozostawia język; odrzucenie checkpointu także go nie kasuje.
- Gdy przeglądarka nie pozwala zapisać ustawień, gra nadal działa w wybranym języku w sesji
  i pokazuje przetłumaczone ostrzeżenie. Nie obiecuje zapamiętania wyboru po zamknięciu.
- Zachowano `SAVE_VERSION=1` i `MISSION_VERSION=3`. Starsze nazwy checkpointów i ogólne
  nazwy NPC są normalizowane przy odczycie; nie zamrażają polskiego tekstu w angielskiej grze.

## Utrzymanie, wydanie i regresje

- Dodano wspólny translator, katalogi `src/i18n/pl.js` i `en.js`, stabilne klucze i parametry.
  Brakujące klucze i parametry są błędami, a nie cichym mieszaniem języków.
- Ujednolicono wersję **0.4.3** w metadanych pakietu, lockfile, menu/HUD i API diagnostycznym.
  Baza 0.4.2 miała jeszcze numer 0.4.1 w części metadanych.
- Rozszerzono build o dokumenty EN oraz kontrole kompletności tłumaczeń, ścieżek i numerów wersji.
- Dodano regresje wyboru języka, starszych ustawień, zapamiętania/odmowy zapisu,
  przełączania w pauzie, zachowania snapshotów, parametrów, błędów i wszystkich ekranów.
- Zachowano naprawy 0.4.2, istniejącą mapę, modele, oryginalne tekstury, audio i przypięty Babylon.
  Dodatkowy wariant tekstury EN dotyczy wyłącznie podpisu na stole odprawy.
  Nie zmieniono poziomu trudności, mechaniki walki, kolizji ani przebiegu misji.

Szczegóły rzeczywiście wykonanej weryfikacji oraz lokalnych prób są w
`docs/V0_4_3_IMPLEMENTATION.md`. Zielone testy tekstów nie oznaczają zakończonego
odbioru pełnej gry, Firefoksa/Edge, fizycznego GPU ani publikacji.

---

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
