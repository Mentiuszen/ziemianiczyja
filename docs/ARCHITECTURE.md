# Architektura v0.4.1

Źródła, testy i narzędzia znajdują się w głównym katalogu repozytorium. `tools/build.mjs`
kopiuje tylko runtime, zasoby i licencje do ignorowanego `dist/`; workflow
`.github/workflows/pages.yml` publikuje ten katalog przez GitHub Actions.

## Własność stanu i czasu
`Simulation` jest jedynym właścicielem stanu. Obejmuje gracza, 38 NPC (30 początkowej obsady
wraz z dwoma artylerzystami i 8 już istniejącymi rezerwistami), dwa Mark IV, działo polowe,
skończony program przelotów, pociski, przedmioty, zniszczone przejścia i `Director`.
Renderer nie rozstrzyga trafień. Menu nie tworzy bitwy.

`FixedClock` aktualizuje logikę po 1/60 s, maksymalnie 5 kroków na rAF. `FrameLimiter`
wybiera wyłącznie klatki do renderowania, utrzymując ułamkowy termin. Po pauzie/zmianie
limitu termin resetuje się bez oddawania zaległych renderów. Miernik agreguje pracę CPU
między renderami i liczy faktyczne odstępy klatek. Przy długim stallu czas jest celowo
porzucany, a nie nadrabiany bez limitu.

## Wejście
Dostępne Pointer Events: `pointermove` daje względne delty i aktualny `buttons`.
`pointerdown/up` aktualizują krawędzie przycisków; dodatkowa kompatybilna obsługa przycisków
jest idempotentna. `mousemove` nie jest równolegle sumowane. W przeglądarce bez Pointer Events
stosowany jest wyłącznie fallback myszy. Blokada kursora musi zostać potwierdzona przed grą.
Pauza, blur i ukrycie karty czyszczą krawędzie/stan klawiszy i zatrzymują audio.

## Misja
`data/briefing.js` definiuje 42 sekundy napisów oraz jawne fazy 0–7:
odprawa, podejście, MG, meldunek, artyleria, telefon, obrona, zakończenie.
`Director` korzysta wyłącznie z czasu symulacji, a `once()` zabezpiecza zdarzenia.
Pominięcie i zakończenie odprawy wywołują to samo `startAssault`. Polecenia nie zamrażają
percepcji całego frontu. Zaatakowanie wroga/przedwczesne wejście na front wywołuje alarm.
Zabicie oficera nie blokuje wyjścia. Obsada pokoju ma zweryfikowane trasy wyjścia.

Cel artylerii sprawdza działającą obsługę lub uszkodzony zamek; cel MG nie wymaga strzału
gracza. Obrona dotyczy przeciwników w promieniu 15 m od telefonu i obecności gracza w 22 m;
ma 55 sekund realnie wolnej pozycji, a zajęcie przez wroga lekko cofa postęp. Oba checkpointy
odkładają zapis podczas lotu granatów/pocisków/bomb i świeżych obrażeń.

## AI i ruch
Profil NPC→NPC ma celowanie w tułów, rozrzut i przerwy między seriami; profil przeciw
człowiekowi jest osobny. Istniejąca redukcja obrażeń NPC→NPC 0,72 pozostaje, bez progów
nieśmiertelności. Strzały posterunków korzystają z tej samej broni, amunicji i raycastu.
Główne cele oddziału i zasady rezerwy nie zależą od jakości grafiki.

Kolizja ruchu: promień 0,29 m, podkroki do 0,18 m na oś. Automatyczne wejście na obiekt
jest dozwolone tylko z gruntu, przy ograniczonej wysokości, podparciu i wolnym miejscu
nad głową. `walkableTop:false` wyłącza płoty, drut, pionowe podpory i dachy. Wąskie belki
nie podpierają kapsuły. Skok/wznoszenie nie uruchamia automatycznego wejścia na stopień.

Własny graf A* co 2 m, maks. 12000 rozwinięć i dwa zlecenia co 0,12 s. Początek ścieżki
musi być dostępny z rzeczywistej pozycji. Replan nie zawraca postaci do już miniętego
węzła, jeżeli może bezpiecznie dotrzeć do kolejnego — usuwa to wykryte spotkanie dwóch
żołnierzy idących ku sobie w wyjściu odprawy. Nie dodano teleportów ani workera.

## Wsparcie naziemne
`tank.js`: trasy z pozycjami wsparcia i ograniczonym skrętem, zatrzymanie przed przeszkodą
lub piechotą, MG z krótkimi seriami i działo ze sponsonów, skończona amunicja. Wyloty
powiązane wymiarami z modelem. Nie ma obrotowej wieży. Pociski są balistyczne, a raycast
sprawdza najbliższą przeszkodę i aktora, ignorując tylko własny collider właściciela.

`field-gun.js`: dwaj artylerzyści, limit sektora obrotu, opóźnienie przeładowania zależne
od obsady, rzeczywiste pociski w czołgi. Pancerz obsługuje tylko wrogie pociski dział:
trafienie w niską część może zniszczyć gąsienicę, w kadłub odejmuje integralność; uszkodzone
uzbrojenie nie strzela. To jawna reguła gry, nie model penetracji oparty na grubości płyt.

`Simulation.breakObstacle` usuwa wskazany fragment drutu z aktywnych colliderów,
unieważnia cache połączeń i aktualizuje pobliskie węzły nawigacji. Renderer wyłącza osobny
mesh tego samego ID. Snapshot zapisuje ID przejścia. Inne płoty/ściany nie są ogólnie niszczalne.

## Lotnictwo
`data/support.js`: pięć wylotów z datą względem sygnału natarcia. `air-support.js` symuluje
trasy oraz dwie bomby. Ostrzeżenie pojawia się 4 sekundy przed zrzutem, potem następuje
czas fizycznego opadania. Pocisk testuje kolizję po odcinku; obrażenia korzystają ze wspólnego
`blast`. Nie istnieją niewidzialne naloty. To skończona warstwa wsparcia, nie AI walk powietrznych.
Samoloty nie są celami hitscanu. Aktywne loty można odtworzyć, ale zapis podczas lotu bomby
jest odkładany. Limity dotyczą logiki, nie tylko liczby widocznych cząstek.

## Renderer / zasoby
`SupportView` tylko odtwarza działo, samoloty, wirujące śmigła, drut, mapę odprawy i
ograniczone efekty pracy/uszkodzenia czołgów. Instancje samolotów są zwalniane po przelocie.
Wszystkie obiekty znikały wraz ze sceną w sprawdzanych cyklach; wyniki w raporcie.

`GeometryData.cushion` tworzy zamknięte, zaokrąglone prostopadłościany. `sandbags.js`
układa mijankę i dopasowuje skrajne fragmenty, z cienkim wypełnieniem skompresowanego środka.
Test ray-grid obejmuje oba lica. Nie wyłączano globalnego odrzucania tylnych ścianek.

15 plików GLB: sześć poprawionych modeli piechoty z atlasami 2048², dotychczasowe bronie
i pojazdy oraz oryginalne modele artylerii/DH.5/DFW. Szkielet i klipy piechoty są zachowane.
Nowe samoloty mają uproszczony materiał koloru wierzchołków, nie nowe fotograficzne tekstury.
Preset nadal steruje wyłącznie renderingiem. Nie zmieniono runtime Babylon ani dodano Vite.

## Zapis
`missionVersion=3` odrzuca zapis starszego układu zdarzeń. Snapshot zawiera briefing,
zdarzenia, timer obrony, NPC, tank routes/damage/ammo, artylerię i jej obsadę, aktywne loty,
zużyte przedmioty oraz usunięte druty. Walidator odrzuca duplikaty samolotów, niepełne wektory,
niepoprawne stany amunicji i trajektorii. Ustawienia zachowują klucz poprzednich wersji.
