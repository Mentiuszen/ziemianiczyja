# Ziemia Niczyja 0.5.0 — rozbudowa misji 04, przebudowa pola bitwy i refaktor projektu

**Status: projekt wydania i plan wykonawczy. Implementacja nie została wykonana.**  
**Data opracowania: 7 września 2026.**  
**Repozytorium: `Mentiuszen/ziemianiczyja`, odczytana gałąź: `main`.**  
**Baza analizy: `9e393c6d8ea341864c955ab53c997430ea7d9668` — 0.4.5, UI revision 2.**

> Dla agenta wykonującego: realizować zadania z §22 w kolejności zależności, aktualizując checklistę i wyniki w jednym dokumencie. Nie rozpoczynać implementacji na podstawie samego otrzymania planu. Nie tworzyć ani nie przełączać branchy. Worktree tylko po osobnej zgodzie użytkownika. Nie publikować strony, nie kupować zasobów i nie zmieniać ustawień repozytorium bez odrębnego polecenia. Nie oznaczać etapu jako odebranego wyłącznie dlatego, że kod się parsuje.

**Cel:** przekształcić „Pękniętą linię” w dłuższą, przestrzennie większą, taktycznie wiarygodną misję FPS, w której gracz walczy ze swoim oddziałem wewnątrz szerszej operacji, a nie prowadzi wszystkich jednostek po jednej osi do telefonu.

**Architektura:** zachować jedną autorytatywną symulację, oddzielić przebieg zadania gracza od dowodzenia sektorami i od odtwarzania scen widowiskowych. Rozbudować istniejące systemy, usuwając zastępowane ścieżki po odbiorze odpowiedników; nie wprowadzać drugiego silnika ani równoległej „starej gry”.

**Stos technologiczny:** istniejące moduły JavaScript, lokalny Babylon.js 8.46.2, WebGL2, Web Audio, Node >=20, statyczny build, zasoby glTF/GLB. Modele i animacje: źródła Blender oraz odtwarzalny eksport. Wymiana frameworka, bundlera lub renderera nie jest celem wydania. [K01, K02]

**Specyfikacja i plan:** znajdują się w tym samym dokumencie. Po wdrożeniu konsolidacji dokumentacji docelowym miejscem jest `docs/PROJECT.md`, nie kolejny równoległy plik wersji.

---

## Spis treści

1. Znaczenie wersji i granice realizmu
2. Wyniki przeglądu aktualnego kodu
3. Co zachować ze starego planu i wydań 0.4.x
4. Jedna dokumentacja i zasady porządkowania
5. Docelowa architektura i własność stanu
6. Kontrakty danych, zdarzeń i koalicji
7. Rozmiar oraz struktura nowej mapy
8. Przebieg misji: 12 celów głównych i 4 poboczne
9. Stały oddział gracza
10. Dowodzenie polem bitwy i zachowanie piechoty
11. Symulacja większej liczby jednostek
12. Czołgi, ich uzbrojenie i przeciwdziałanie
13. Lotnictwo, bombardowania i wybuchy
14. Destrukcja i sceny widowiskowe
15. Nowe nacje oraz pełna produkcja modeli
16. Animacje, broń i integracja zasobów
17. Realistyczne audio
18. Zapis, odtwarzanie i długotrwała misja
19. Interfejs, sterowanie i trudność
20. Testy, narzędzia i bezpieczne usuwanie pozostałości
21. Wydajność i budżety projektowe
22. Kolejność realizacji i zadania wykonawcze
23. Macierz odbioru
24. Ryzyka, ograniczenia i warunki wydania
25. Źródła oraz zakres dowodów

---

## 1. Znaczenie wersji i granice realizmu

### 1.1. Co gracz powinien zauważyć

Wersja 0.5.0 nie jest pakietem dekoracji do obecnego krótkiego natarcia. Zmienia strukturę misji. Gracz rozpoznaje swój oddział, widzi obok inne pododdziały, przechodzi przez kolejne linie obrony, pomaga odblokować czołgi, reaguje na naloty i bierze udział w lokalnym utrzymaniu zdobyczy. Część frontu naciera, część jest przygwożdżona, a inna osłania odwrót. Zwycięstwo oznacza wykonanie zadania na własnym odcinku, nie unicestwienie wszystkich Niemców na mapie.

Obowiązkowe filary wydania to: większa i dłuższa misja; rzeczywisty oddział; sektorowe pole bitwy; współpraca piechoty, dział, czołgów i lotnictwa; pełniejsza oprawa modeli, animacji oraz audio; refaktor i konsolidacja dokumentacji. Żaden z tych filarów nie może zostać zastąpiony samym wzrostem liczby NPC.

### 1.2. Historia: rozstrzygnięcie konfliktu wymagań

Obecna misja jest opisana jako **Cambrai, 20 listopada 1917**. [K03] Niemieckie działa polowe stanowią właściwy punkt odniesienia dla zagrożenia przeciwpancernego: opis walk pod Graincourt potwierdza skuteczność ukrytych dział 7,7 cm przeciw brytyjskim czołgom. [H01]

Amerykańscy inżynierowie uczestniczyli w operacji pod Cambrai, pracując za brytyjskimi liniami i trafiając następnie do walki podczas kryzysu. Nie jest to jednak dowód wspólnego regularnego szturmu brytyjsko-francusko-amerykańskiego na wybranym odcinku 20 listopada. [H02, H03] Tego planu nie należy przedstawiać jako odtworzenia konkretnego historycznego porządku bojowego.

**Przyjęty wariant projektowy:** zachować Cambrai jako inspirację misji 04 i jej miejsce w kampanii, ale jawnie oznaczyć rozbudowany epizod z francuskim pododdziałem i amerykańską grupą inżynieryjną jako **fabularyzowany scenariusz inspirowany wydarzeniami z listopada 1917**. Nie udawać, że źródła potwierdzają spotkanie tych grup w przedstawionej wsi. Nie zmieniać po cichu daty na 1918 ani nie odwracać chronologii pozostałych rozdziałów.

W odprawie i opisie historycznym dodać jednoznaczną informację: miejsce akcji, sprzęt i charakter walk mają odniesienia historyczne; lokalny układ oddziałów oraz przebieg zadania są autorskie. Nowe nacje rzeczywiście uczestniczą w rozgrywce 0.5.0, a nie zostają tylko eksportami GLB bez zastosowania. Brytyjski oddział gracza pozostaje spójny narodowo; Francuzi i Amerykanie mają własne grupy i zadania.

Wariant ścisłej rekonstrukcji wymagałby ograniczenia składu tej misji lub osobnego przeprojektowania jej miejsca i daty. Nie jest domyślnym wariantem tego planu i nie blokuje projektowania systemów.

### 1.3. Granice zakresu

Nadal dostępna jest jedna grywalna misja kampanii. Nie dodawać przy okazji multiplayera, pełnego RTS, sterowania samolotami i czołgami, walk powietrznych, dowolnego burzenia całej mapy, fizyki każdego ogniwa gąsienicy, pełnego ragdolla wszystkich jednostek ani wymiany silnika.

Realizm oznacza przede wszystkim wiarygodne zachowanie, ograniczenia uzbrojenia, sens osłon, czytelne skutki działań i właściwe związki przyczynowe. Nie oznacza przymusu wiernego odwzorowania każdej procedury wojskowej, wielogodzinnego marszu lub usunięcia regeneracji zdrowia bez osobnej decyzji.

---

## 2. Wyniki przeglądu aktualnego kodu

### 2.1. Zakres i pewność ustaleń

Przegląd obejmował strukturę repozytorium, aktualne metadane, istniejący plan 0.5, dokumentację architektury, dane misji i mapy, kluczowe fragmenty symulacji, AI, reżysera misji, pojazdów, balistyki, efektów, renderowania, audio, budowania oraz wybrane testy. Była to analiza statyczna odczytanych źródeł. Nie uruchomiono tutaj testów repozytorium ani pełnego przejścia w WebGL2. Nie zweryfikowano w tej sesji źródłowych scen Blender.

W poniższej tabeli „potwierdzone” oznacza widoczną właściwość kodu, a nie potwierdzenie każdego skutku w grze. „Ryzyko” oznacza konsekwencję projektową wymagającą scenariusza reprodukcji.

| ID | Ustalenie | Dowód w bazie | Wniosek dla 0.5.0 |
|---|---|---|---|
| A01 | Stary plan nie opisuje bieżącej bazy | `docs/plans/V0_5.md` startuje z 0.4.1 i zakłada dopiero przyszłe odebranie 0.4.2 | Zastąpić bazę przez 0.4.5 rew2; nie cofać pracy do starego patcha |
| A02 | Pole jest małe i historycznie rozsuwane | `MAP.width=216`, `depth=272`; `northZ()` przesuwa część współrzędnych o 40 m | Nowy projekt przestrzeni zamiast kolejnych przesunięć i mnożenia współrzędnych |
| A03 | „Cel oddziału” nie oznacza podążania za graczem | `squadGoal()` wybiera stałe współrzędne zależnie od globalnej fazy | Osobny skład gracza, formacje, rozkazy i lokalne osłony |
| A04 | Faza misji steruje całym wojskiem | `Director.advance()` anuluje nawigację wszystkich NPC i ustawia ich ponowne myślenie | Oddzielić lokalne cele od rozkazów sektorowych; bez globalnego resetu po każdej interakcji |
| A05 | Istnieją już osłony, supresja i reakcje na granaty | `soldier.js` zawiera stany cover/retreat/evade/search i ograniczenia percepcji | Nie dodawać drugi raz tych samych stanów; rozbudować ich nadrzędne planowanie |
| A06 | Oba boczne działa dzielą stan | Jeden `weaponLeft` i `ammunition`; wybór strony w pętli celów i przerwanie po strzale | Niezależne stanowiska uzbrojenia, a nie tylko dodatkowy błysk po drugiej stronie |
| A07 | Uszkodzenie uzbrojenia jest globalne | `gunWorking=false` przerywa dalsze strzelanie czołgu | Osobne uszkodzenia stanowisk i osobny stan mobilności |
| A08 | Niemieckie działo już strzela w czołgi | `field-gun.js`, amunicja, obsada, sektor ostrzału, pociski i obrażenia | Rozwinąć pozycje, percepcję i współpracę, nie wpisywać „dodać działanie działa” |
| A09 | Celowanie działa zawiera warunek konkretnej mapy | Kandydaci wymagają `t.pos.z>57`; część neutralizacji jest powiązana z numerem fazy | Usunąć liczby przestrzeni i globalne zaliczenie z systemu uzbrojenia |
| A10 | Bomby mają logikę wybuchu | `air-support.js` przy trafieniu wywołuje `blast()`, który emituje `explosion` | Zgłoszenie niewidocznego wybuchu badać w pełnym łańcuchu, nie dopisywać drugiego obrażenia |
| A11 | Wybuch bomby nie ma wyraźnie własnej prezentacji | `effects.js` używa stałego błysku 2,7 i 0,105 s; promień zdarzenia nie określa klasy efektu | Profile granat/pocisk/bomba, materiał, skala i priorytety |
| A12 | Limity mogą odrzucić efekt | Wspólne `effectsLimit` i `acquire()` zwracające brak miejsca | Ryzyko niewidocznego wybuchu pod obciążeniem; wymaga reprodukcji, rezerwy dla ważnych efektów |
| A13 | Pocisk znikający po TTL nie musi wybuchnąć | Bomba z TTL<=0 jest usuwana, a `blast` następuje tylko przy trafieniu | Rozdzielić poprawne opuszczenie świata, uderzenie i błąd trajektorii; raportować powód |
| A14 | Zapis nie toleruje pocisków w całym świecie | `canCheckpoint()` i `snapshot()` odrzucają dowolne aktywne granaty, pociski lub bomby | Ciągłe tło może zagłodzić checkpoint; zapisywać pociski i oceniać lokalne bezpieczeństwo |
| A15 | Losowość jest już zapisywana | Snapshot zawiera `random.state()`, restore przywraca stan | Zachować tę własność, nie reklamować nowego zapisu RNG jako brakującej funkcji |
| A16 | Surowa frakcja jest używana zamiast relacji | AI i obrażenia porównują `faction`, statystyki często rozdzielają wyłącznie UK/DE | Dodanie FR/US wymaga koalicji we wszystkich konsumentach |
| A17 | Typ sprawcy bywa rozpoznawany z ID | Redukcja obrażeń NPC ma wyjątek `startsWith('tank')` | Jawne profile źródła, bez uzależniania reguł walki od nazw encji |
| A18 | Skala pracy ma ryzykowne pełne przeglądy | Filtrowanie/sortowanie list aktorów, aktualizacja wszystkich NPC, wielokrotne odświeżanie colliderów | Indeks przestrzenny aktorów, budżety zapytań i zadania sektorowe |
| A19 | Kolejka zdarzeń odrzuca najstarsze wpisy | `emit()` ogranicza wspólną listę do 200 przez `shift()` | Oddzielić stan i zdarzenia krytyczne od odrzucalnej prezentacji; mierzyć przepełnienia |
| A20 | Animacje nadal mają zastępcze korekty | Obrót całego modelu do prone, stałe rotacje nóg crouch, ruch całego `fpRoot` przy reload | Nowe klipy i adaptery, usunięcie zastępczych transformacji po odbiorze |
| A21 | Audio nadal jest proceduralne | Szum, oscylatory, odgłosy pojazdów odpalane cyklicznie | Zachować obowiązkową wymianę biblioteki audio ze starego planu |
| A22 | Są rzeczywiste duplikaty dokumentów | `docs/V0_4_5_PLAN.md` i `docs/plans/V0_4_5.md` mają ten sam blob SHA | Jeden dokument kanoniczny, nie katalog „archiwum” z tym samym bałaganem |
| A23 | Dokumenty są zależnością builda | `build.mjs` wymaga HISTORY/KNOWN_ISSUES PL/EN i kopiuje je dla Credits | Konsolidować równocześnie z buildem oraz odnośnikami UI |
| A24 | Stare nazwy testów kryją zarówno wartość, jak i ograniczenia | `characters-v02.test.mjs` sprawdza m.in. 19 kości i 1 materiał, ale też poprawne wagi/normalne | Zastąpić sztywne kontrakty nowym manifestem, zachować testy poprawności |
| A25 | Przeniesienie testów do podkatalogów wymaga zmiany uruchamiania | `npm test` wskazuje `tests/*.test.mjs` | Nowy discovery runner oraz kontrola liczby odnalezionych testów |

Źródła: [K01–K22]. To nie jest lista 25 niezależnych awarii do odtworzenia. Część pozycji to poprawne uproszczenia małej misji, które stają się nieodpowiednie po jej rozbudowie.

### 2.2. Diagnoza „wielkiego rushu”

Najbardziej prawdopodobna przyczyna systemowa to połączenie wspólnych celów fazowych, niewielkiej głębokości mapy, braku rozkazów utrzymania osobnych sektorów i małej liczby punktów oporu. Samo zwiększenie HP Niemców lub zmniejszenie obrażeń czołgów nie rozwiąże tego układu. [K05–K09]

W nowej misji musi istnieć powód zatrzymania i wznowienia natarcia: nierozpoznana bateria, nieoczyszczona flanka, piechota bez osłony, zablokowana przeprawa, utrata łączności lub lokalny kontratak. Jednostki nie mogą automatycznie zmieniać tych powodów na „biegnij do następnego znacznika gracza”.

---

## 3. Co zachować ze starego planu i wydań 0.4.x

| Element | Decyzja 0.5.0 |
|---|---|
| Wszystkie modele, animacje i ruchome części | Zachować jako obowiązkowy pełny zakres i rozszerzyć o FR/US oraz nowe moduły mapy |
| Realistyczna biblioteka audio | Zachować; dodać koordynację większej bitwy i ostrzeżenia oddziału |
| Sieć okopów z jednej definicji | Zachować i rozszerzyć do sektorów, przejść i zniszczeń |
| Naprawy kolizji, kamery, wejścia, AI i trudności | Zachować funkcjonalnie, nawet jeśli zmienią się pliki i fixture'y |
| HUD 0.4.5 rew2, skalowanie, napisy, drzwi odprawy | Zachować; integracja nowej zawartości nie jest kolejnym redesignem całego UI |
| PL/EN i ustawienia | Zachować istniejące wybory, mapowanie klawiszy i sens opcji |
| Diagnostyka F3, CPU/GPU, percentyle i interpolacja | Zachować; dodać liczniki nowych systemów |
| Skończone rezerwy i brak zależności logiki od jakości grafiki | Zachować jako twarde reguły |
| Bazowanie na przyszłym 0.4.2 | Usunąć; bazą jest odczytane 0.4.5 rew2 |
| Kolejne raporty i plany osobno dla każdej rewizji | Zastąpić rozdziałami jednego dokumentu i generowanymi artefaktami |
| Sztywna liczba kości, stare klipy i ścieżki modeli | Zastąpić nowym kontraktem zasobów, nie utrzymywać dla wygody dawnych testów |
| Bardzo krótka misja ograniczona do osi natarcia | Zastąpić pełnym projektem opisanym poniżej |

Zachowanie naprawy oznacza zachowanie reguły i dowodu działania, nie obowiązek pozostawienia identycznego kodu, numeru fazy ani historycznej nazwy pliku testowego. [K03, K04, K17]

---

## 4. Jedna dokumentacja i zasady porządkowania

### 4.1. Docelowy układ

```text
README.md                 krótki start: czym jest gra, polecenia, odnośnik do PROJECT
LICENSE                   zachowana licencja projektu
vendor/                   zachowane wymagane informacje licencyjne zależności
docs/PROJECT.md           jedyne ręcznie utrzymywane źródło dokumentacji projektu
public/assets/manifest.json   maszynowy katalog dystrybuowanych zasobów
authoring/manifest.json       źródła produkcyjne, eksporty i ich wersje
.local/reports/           generowane raporty, zrzuty i pomiary; poza repo i release
```

Nazwy nowych manifestów są decyzją planu, a nie informacją, że takie pliki już istnieją. Nie usuwać obecnych rejestrów importu przed przepięciem konsumentów.

`PROJECT.md` zawiera: instrukcję uruchomienia i publikowania, zasady pracy, architekturę, aktualny projekt misji, kontrakty assetów, lokalizację i dostępność, plan 0.5.0, krótką historię, aktywne problemy, status odbioru, źródła techniczne i historyczne. Utrzymywać spis treści i stabilne identyfikatory sekcji; nie kopiować do niego całych starych raportów.

Dokumentacja opisuje **stan bieżący**, a plan i propozycje są wyraźnie oznaczone. Po wykonaniu zadania aktualizować odpowiedni rozdział architektury i wiersz odbioru, nie doklejać na górze kolejnej sprzecznej warstwy „różnice względem starego opisu”.

### 4.2. Procedura scalenia

- [ ] Sporządzić mapowanie wszystkich ręcznie utrzymywanych dokumentów do sekcji `PROJECT.md` albo decyzji „historyczne, dostępne w Git”.
- [ ] Przenieść obowiązujące wymagania i niewykonane zadania; rozstrzygnąć sprzeczności na podstawie kodu i decyzji użytkownika.
- [ ] Zachować w krótkiej historii jedynie istotne zmiany i identyfikatory wydań. Nie przenosić pełnych dzienników każdej próby do nowego dokumentu.
- [ ] Zaktualizować `tools/build.mjs`, Credits, walidatory oraz linki PL/EN przed usunięciem starych plików.
- [ ] Oddzielić opisy od danych: `INFANTRY_IMPORT.json` jest kandydatem do przeniesienia do narzędzi assetowych, a nie śmieciem dlatego, że leży w `docs/`.
- [ ] Scalić metadane pochodzenia zasobów. Zachować wymagane teksty licencji; ich istnienie nie jest niepożądanym rozdrobnieniem dokumentacji technicznej.
- [ ] Usunąć duplikaty, dawne prompty kontynuacyjne i zamknięte plany z aktywnego drzewa dopiero po kontroli odwołań. Historia pozostaje w Git, bez nowej kopii `archive/`.

Ekran „O projekcie” ma nadal działać w obu językach. Treść dla gracza i atrybucje mogą być generowane z danych lokalizacji i manifestu; wygenerowany dokument nie staje się drugim ręcznie utrzymywanym podręcznikiem. Nie wysyłać do gry całej historii raportów tylko po to, aby zachować stare adresy plików. [K02]

### 4.3. Zasada utrzymania

Nowe zadanie nie tworzy automatycznie `PLAN`, `IMPLEMENTATION`, `REW2`, `VALIDATION.md` i `CONTINUATION`. Agent dopisuje lub aktualizuje właściwe miejsce w `PROJECT.md`. Dane pomiarowe są artefaktem z SHA, konfiguracją i datą; w dokumencie zostaje interpretacja wyniku oraz odnośnik do trwałego artefaktu wydania/CI, jeśli został opublikowany.

---

## 5. Docelowa architektura i własność stanu

### 5.1. Wybrana strategia

Odrzucone podejście A: powiększenie tablic i współrzędnych bez zmiany odpowiedzialności. Byłoby najłatwiejsze, ale zachowałoby rush, globalne fazy i problemy z checkpointami.

Odrzucone podejście B: pełna, autonomiczna symulacja setek żołnierzy w 60 Hz oraz przepisywanie gry na nowy ECS. Zwiększyłoby koszt i ryzyko bez gwarancji lepszej misji.

**Przyjęte podejście C:** zaprojektowane sektory i zadania wojsk, pełna interakcja w istotnej przestrzeni, ograniczona symulacja dalszych starć i osobna warstwa panoramy. Filmowe wydarzenia są uczestnikami tej samej symulacji, nie dekoracją oszukującą kolizje.

### 5.2. Podział odpowiedzialności

| Obszar | Odpowiedzialność | Czego nie robi |
|---|---|---|
| `Simulation` | Własność stanu, zegar, kolejność systemów, identyfikatory, snapshot | Nie zawiera całego scenariusza, renderowania ani kodu audio |
| `MissionDirector` | Graf celów gracza, postęp, warunki sukcesu/porażki, checkpointy | Nie przestawia wszystkich NPC po zmianie celu |
| `BattleDirector` | Rozkazy sektorów, rezerwy, lokalne natarcia i wycofania | Nie podmienia HP i wyników trafienia, żeby scena „ładnie wyszła” |
| `SquadController` | Skład gracza, formacja, osłanianie, podążanie, role | Nie steruje wszystkimi aliantami i nie teleportuje kompanów |
| AI żołnierza | Percepcja, lokalna taktyka, użycie broni, ruch | Nie ma współrzędnych Cambrai i numerów globalnych faz |
| System pojazdów | Ruch, obsada, stanowiska uzbrojenia, uszkodzenia | Nie zna tekstu celów i nie zalicza misji numerem fazy |
| System zniszczeń | Przejścia stanów geometrii, kolizji i nawigacji | Nie opiera skutków na callbacku animacji renderera |
| `SetPieceDirector` | Uruchamianie ograniczonych scen po spełnieniu warunków | Nie ignoruje zniszczonych czołgów, martwych wykonawców i zajętych tras |
| Prezentacja | Modele, animacje, efekty, dźwięk i HUD | Nie ustala obrażeń, amunicji ani ukończenia celu |

### 5.3. Mapa refaktoru: pliki istniejące → odpowiedzialności docelowe

Poniższe nowe ścieżki są proponowanymi jednostkami projektu. Nie tworzyć pustych plików tylko po to, aby odtworzyć drzewko.

| Obecny punkt | Docelowa organizacja |
|---|---|
| `src/core/simulation.js` | Zachować klasę; wydzielić `src/core/events.js`, `src/core/entity-index.js` oraz adapter snapshotu |
| `src/missions/director.js` | `src/missions/mission-director.js`, `objective-graph.js`, `set-piece-director.js` |
| Cele i obsada w `src/data/cambrai.js` | `src/missions/cambrai/definition.js`, `objectives.js`, `forces.js`, `set-pieces.js`; kampania osobno od jednej misji |
| `src/ai/soldier.js` | Zachować fasadę aktora; `perception.js`, `tactics.js`, `squad.js`; ruch i broń delegować do istniejących właściwych systemów |
| Brak nadrzędnego pola bitwy | `src/battle/director.js`, `sector-state.js`, `simulation-tiers.js` |
| Powtarzane porównania narodowości | `src/combat/allegiance.js` oraz definicje narodowości i koalicji |
| `src/vehicles/tank.js` | `tank.js` jako integracja, `weapon-mounts.js`, `vehicle-damage.js`; współdzielona obsługa pocisków |
| `src/vehicles/field-gun.js` | Zachować, ale usunąć warunki mapy/faz i uogólnić obsadę oraz neutralizację |
| `src/data/world-map.js`, `northZ`, fragmenty `cambrai.js` | `src/missions/cambrai/map.js`, `src/world/trench-network.js`, `sector-world.js` |
| `src/render/view.js` | Fasadę `GameView` odchudzić przez `character-view.js`, `weapon-view.js`, `vehicle-view.js`; zachować `PresentationState` |
| `src/render/effects.js` | Profile efektów, priorytety puli, oddzielne lifecycle od interpretacji zdarzeń |
| `src/audio/audio.js` | `audio.js` jako fasada, `bank.js`, `mixer.js`, `spatial-audio.js` |
| `src/save/schema.js` i snapshot w symulacji | `schema.js` waliduje, `snapshot.js` zbiera/odtwarza domeny; brak referencji renderer/audio |
| `src/app.js` | Cykl sesji, wejście/menu/loading; nie miejsce dopisywania zachowań frontu |

Nie narzucać limitu liczby linii zamiast sensownych odpowiedzialności. Rozdzielenie dokumentacji nie jest tym samym co modularność kodu: dokument ma być jeden, kod ma być czytelnie podzielony.

### 5.4. Kolejność symulacji i zdarzeń

Utrzymać stały krok bazowy 1/60 s. W jego obrębie: zastosować wejście i rozkazy; uaktualnić decyzje przypadające na dany tick; wykonać ruch z kolizją; uaktualnić indeksy istotnych transformacji; rozstrzygnąć broń i pociski; zastosować obrażenia i zniszczenia; ocenić cele oraz rezerwy; opublikować spójny stan prezentacji. Jeżeli istniejący porządek jest inny, najpierw odtworzyć jego kontrakty testami, a potem świadomie zmienić.

Zdarzenia wynikające ze zmiany stanu mają sekwencję, tick, źródło, pozycję oraz jawny typ. `MissionDirector` obserwuje stan autorytatywny lub gwarantowany strumień domenowy; nie polega na kolejce efektów, z której renderer może odrzucać wpisy.

Dźwięk i cząstki mogą redukować odtwarzanie odległych zdarzeń. Zużycie amunicji, śmierć, zniszczenie przejścia i zaliczenie celu nie mogą zniknąć z powodu limitu wizualnego. Przepełnienia i odrzucone zdarzenia kosmetyczne mają liczniki diagnostyczne, nie ciche `shift()` bez rozróżnienia.

---

## 6. Kontrakty danych, zdarzeń i koalicji

### 6.1. Narodowość nie jest stroną konfliktu

Wprowadzić `nationality: uk | fr | us | de` i `coalitionId: entente | central`. Nazwy są kontraktem gry, nie ogólnym modelem wszystkich państw wojny. Identyfikator jednostki nie decyduje o jej relacjach.

Centralne funkcje:

```js
// Docelowe API. a i b mają coalitionId; brak danych jest błędem walidacji,
// a nie automatyczną zgodą na ostrzał.
isHostile(a, b)       // a.coalitionId !== b.coalitionId
isAllied(a, b)        // a.coalitionId === b.coalitionId
canDamage(source, target, damageContext)
```

Relacji używają percepcja, wybór celu, ochrona przed ostrzałem swoich, granaty, supresja, działo, czołg, eksplozje, ustępowanie, rezerwy, save, minimapa, flagi, statystyki i komunikaty. Dotychczasowe `faction` może istnieć tylko podczas kontrolowanej migracji; po odbiorze usunąć równoległą interpretację.

Statystyki prowadzić według koalicji i dodatkowo narodowości, nie przez „UK albo Niemcy”. Ten sam strzelec francuski nie może być sojusznikiem w HUD i wrogiem w AI.

### 6.2. Definicje i stan runtime

Rozdzielić niezmienne dane scenariusza od stanu sesji:

| Definicja | Stan sesji |
|---|---|
| `SectorDefinition`: ID, granice, sąsiedzi, punkty obrony, portale | Właściciel, presja, obsada, zrealizowane rozkazy |
| `ObjectiveDefinition`: ID, zależności, kryteria, obejścia, teksty | locked/active/completed/failed, postęp, zaliczone zdarzenia |
| `SquadDefinition`: skład i role | Żywi/ranni/polegli, rozkaz, formacja, przydzielone osłony |
| `VehicleDefinition`: model, obrys, stanowiska, limity | Mobilność, uszkodzenia, amunicja, obsada, trasa i zadanie |
| `DestructibleDefinition`: stany geometrii i przejścia | Stan, integralność, numer rewizji, otwarte portale |
| `SortieDefinition`: typ samolotu, plan podejścia, ładunek | Pozostały ładunek, lot, zrzuty, ukończenie, ID bomb |

Każda referencja po ID jest walidowana. Brak obowiązkowego modelu, broni, punktu przejścia lub celu nie skutkuje cichym podstawieniem brytyjskiego strzelca bądź zerowego wektora.

### 6.3. Typy zdarzeń i powiązanie akcji

Minimum: `weapon-fired`, `projectile-released`, `projectile-impact`, `explosion`, `actor-damaged`, `actor-downed`, `actor-killed`, `mount-disabled`, `vehicle-immobilized`, `destructible-state-changed`, `sector-order-changed`, `objective-state-changed`, `squad-order-changed`.

Dla łańcucha wystrzał → pocisk → trafienie → wybuch używać wspólnych `actionId`/`projectileId` i monotonnej sekwencji zdarzeń. Słownik określa wymagane pola: źródło, właściciel, pozycja, materiał, profil, siła prezentacyjna i tick. Siła prezentacyjna nie jest drugim mnożnikiem obrażeń.

Przykładowy kontrakt eksplozji:

```js
{
  type: 'explosion', eventId: 4182, tick: 9300,
  projectileId: 'bomb-17', sourceId: 'sortie-03',
  profileId: 'air-bomb-earth',
  position: { x: 15, y: 0, z: 340 },
  surface: 'earth', damageRadius: 7.5,
  importance: 'near-threat'
}
```

Liczby w przykładzie nie ustalają finalnego balansu. Żaden konsument tego zdarzenia nie nakłada ponownie obrażeń już rozstrzygniętych przez symulację.

---

## 7. Rozmiar oraz struktura nowej mapy

### 7.1. Założenia wymiarowe

Obecne 216 × 272 m całego terenu i około 186 × 236 m granic grywalnych nie stanowi wystarczającego układu dla planowanej głębi misji. Są to wartości z definicji mapy, nie pomiar długości przejścia. [K05]

**Wstępny cel projektowy: 600 × 1200 m logicznej przestrzeni operacji**, z głównym przebiegiem długości około 1,2–1,8 km, uwzględniającym oskrzydlenia i przejścia przez zabudowę. Nie oznacza to, że gracz musi mieć jednakowo swobodny dostęp do całego prostokąta ani że całość jest jednocześnie renderowana w pełnym detalu.

Główny pas zadania ma zwykle 200–350 m szerokości i kilka sensownych alternatyw, a nie ścieżkę między dwiema niewidzialnymi ścianami. Dalsza panorama frontu może rozciągać się szerzej, ale nie powiększa automatycznie fizyki i aktywnego grafu nawigacji. Skraj mapy zamykać czytelną geografią, linią własnych stanowisk, niedostępnym zboczem lub uzasadnionym obszarem ostrzału z ostrzeżeniem — nie niewidzialną śmiercią za arbitralną współrzędną.

Wymiary i czasy są **celami projektowymi do odbioru w szarej wersji poziomu**, nie zmierzonym wynikiem. Wolno zmniejszyć pustą przestrzeń; nie wolno uznać pustego kilometra za zrealizowane „wydłużenie misji”.

### 7.2. Trzy równoległe pasy działań

**Lewy pas:** boczne natarcie, odcinek utrzymany przez sojuszników, miejsce spotkania francuskiego pododdziału w fabularyzowanym scenariuszu. Pokazuje, że postęp sąsiedniego sektora może być wolniejszy niż gracza.

**Środkowy pas:** zasadnicze zadanie brytyjskiego oddziału, obie linie okopów, bateria przeciwpancerna, zabudowania, stanowisko dowodzenia i finał.

**Prawy pas:** trasa wsparcia pancernego, uszkodzona droga/przeprawa i grupa amerykańskich inżynierów. Częściowo otwarty teren, na którym czołg bez rozpoznania jest szczególnie narażony.

Nie tworzyć trzech kopii tej samej walki. Pasy łączą się określonymi przejściami, wzajemnym wsparciem ogniowym i widocznymi wydarzeniami. Udane oskrzydlenie na lewo może odciążyć środek; zablokowana prawa trasa ogranicza dojazd czołgu, ale nie zamyka przejścia piechoty.

### 7.3. Głębokość pola bitwy

| Strefa | Funkcja | Wymagana geometria i interakcje |
|---|---|---|
| S0 — zaplecze i odprawa | Poznanie składu i sytuacji | HQ, wyjście fizyczne, punkt zbiórki, krótki okop komunikacyjny, sanitariusze |
| S1 — linia wyjściowa | Napięcie i przygotowanie ataku | Trawersy, stanowiska obserwacyjne, przejścia na przedpole; sąsiedni oddział nie znika po starcie |
| S2 — ziemia niczyja | Przemieszczenie między osłonami | Leje, nierówności, fragmenty drutu, zerwana droga, minimum dwa wejścia do pierwszej linii |
| S3 — pierwsza linia niemiecka | Walka w okopach i obejście MG | Poprzeczne trawersy, nisze, schrony, strzelnice, możliwość bocznego podejścia |
| S4 — teren między liniami | Bateria i rozdzielenie zadań | Osłonięte działa, punkty obserwacji, boczny łącznik, punkt pomocy |
| S5 — przeprawa i połączenie skrzydeł | Inżynierowie oraz współpraca koalicji | Zniszczona droga/kładka, osłony pracujących, obejście piechoty, francuski punkt oporu |
| S6 — zabudowania | Krótsze linie widoczności i destrukcja | Domy, dziedziniec, sad, przejście przez ruinę, fragment umocnienia do przełamania |
| S7 — druga linia i węzeł dowodzenia | Cel operacyjny | Telefon, punkt obserwacyjny, dokumenty/mapa, linie odwrotu i dojścia rezerw |
| S8 — lokalny finał | Utrzymanie zdobyczy | Dwa kierunki kontrataku, własna linia odciążająca, stanowiska obronne i droga zakończenia |

Podział na sektory logiczne może mieć około 18–24 komórek, ale nie musi tworzyć regularnej siatki. Wąska wieś i szeroki odcinek przedpola potrzebują innych granic. ID sektora nie powinno zmieniać się przy niewielkim przesunięciu jednej ściany.

### 7.4. Jedna definicja przestrzeni

Definicja sieci okopów zawiera węzły, odcinki, szerokość **w świetle gotowych elementów**, wysokość dna, profile ścian, rampy, schody, trawersy i portale. Z tych danych wynikają teren, moduły widoczne, podparcie, kolizje, połączenia nawigacyjne i kandydaci osłon.

Usunąć `northZ()` po przeniesieniu danych, zamiast pozostawiać je jako ukrytą transformację nowej mapy. Cele, spawn, kamera kampanii, trasy czołgów, bombardowania, minimapa i save używają tej samej przestrzeni.

Główne przejścia oddziału projektować początkowo na 1,8–2,2 m wolnej szerokości. Węższe fragmenty wymagają zatok mijania i jawnej rezerwacji przejścia. Rampy w pierwszym bloku projektu utrzymać w okolicach maksymalnie 30°, a odstępstwa weryfikować właściwym kontrolerem ruchu. To reguły grywalności, nie deklaracja wymiarów wszystkich historycznych okopów.

Nie łączyć przeciwnych linii bezpiecznym tunelem przecinającym ziemię niczyją. Nie stawiać dekoracyjnego worka, deski lub kamienia w miejscu, które zmniejszy odebraną szerokość przejścia. Dla każdego modułu muszą być zdefiniowane: blokowanie ruchu, blokowanie pocisków, podparcie, możliwość wejścia oraz dozwolone stany zniszczenia.

### 7.5. Nawigacja i streaming

Stara nawigacja nie ma być po prostu uruchomiona na kilkukrotnie większej powierzchni. Planowanie powinno używać grafu portali między sektorami i lokalnych danych ruchu w sektorze oraz jego sąsiadach. Kontrakty poprawnej kapsuły, podparcia, ruchu prone i ustępowania pozostają zachowane.

Aktywacja sektora przygotowuje jego geometrię i osłony z wyprzedzeniem. Ładowanie nie może usuwać niewidocznej, lecz wciąż istotnej ściany z logiki pocisku. Zniszczenie modyfikuje lokalną rewizję połączeń; nie przebudowuje całego świata. Zlecenia trasy posiadają numer generacji i rewizję geometrii, dzięki czemu spóźniony wynik nie przywraca drogi przez zawalony mur.

---

## 8. Przebieg misji: 12 celów głównych i 4 poboczne

### 8.1. Czas i rytm

Cel pierwszego, normalnego przejścia na Żołnierzu: **35–50 minut**, bez wliczania długiego bezczynnego stania i wielokrotnego powtarzania po śmierci. Cele poboczne mają dodawać około 5–10 minut zainteresowanemu graczowi, nie być obowiązkowym sposobem sztucznego osiągnięcia długości.

Rytm: przygotowanie → pierwsze natarcie → walka w okopach → oddech i rozpoznanie zagrożenia pancernego → podział zadań → przeprawa i skrzydła → zabudowania → łączność → lokalny kontratak → odciążenie. Spokojne odcinki zawierają obserwację frontu, rozmowy i przegrupowanie, a nie kilkaset metrów pustego biegu.

### 8.2. Cele główne

| ID | Cel | Co robi gracz | Udział świata i oddziału | Kryterium ukończenia i obejście |
|---|---|---|---|---|
| M01 `assemble` | Odprawa i dołączenie do sekcji | Poznaje zadanie, ogląda mapę, wychodzi przez fizyczne drzwi i dołącza do punktu zbiórki | Hughes, Ellis i pozostali reagują; oficer pozostaje na zapleczu | Zakończona/pominięta odprawa i wejście w strefę zbiórki; śmierć oficera nie blokuje drzwi |
| M02 `cross-no-mans-land` | Dotrzeć do wyłomu | Wybiera trasę przez leje lub osłanianą drogę, wykonuje krótkie przebiegnięcia | Oddział osłania naprzemiennie; czołgi nie jadą od razu do końca mapy | Utrzymane wejście do pierwszej linii; istnieje przejście piechoty także po utracie czołgów |
| M03 `secure-first-line` | Uciszyć stanowiska obejmujące wejście | Oskrzydla MG lub dociera do jego stanowiska przez trawersy | Lewis przygważdża, sąsiednia grupa utrzymuje własny odcinek | Kluczowe pola ostrzału neutralne i przejście dostępne; liczy się stan, nie ostatni strzał gracza |
| M04 `establish-aid-post` | Zabezpieczyć punkt przegrupowania | Oczyszcza bezpośrednie zagrożenie, umożliwia pomoc rannym i odbiera meldunek | Bennett zajmuje się rannymi, Hughes wskazuje działa zatrzymujące pancerz | Punkt bez bezpośredniego zagrożenia, meldunek otrzymany; inny kompan lub dokument zastępuje poległego mówiącego |
| M05 `neutralize-at-battery` | Wyłączyć baterię przeciwpancerną | Rozpoznaje dwa stanowiska, wybiera podejścia, likwiduje obsługę albo uszkadza mechanizm | Czołgi zajmują pozycje wsparcia i nie wykonują samobójczego ruchu wzdłuż drogi | Oba wskazane działa trwale niezdolne do ognia; amunicja chwilowo pusta nie musi oznaczać trwałej neutralizacji |
| M06 `open-engineer-route` | Umożliwić odtworzenie trasy | Obejmuje osłoną amerykańskich inżynierów, usuwa lokalny punkt oporu | Inżynierowie wykonują widoczną pracę etapami; strzelcy zabezpieczają dojście | Przejście otwarte po usunięciu zagrożenia i pracy; przy stracie grupy gracz/ocalały kompan wykonuje przygotowane interakcje |
| M07 `link-left-flank` | Połączyć się z francuskim pododdziałem | Ucisza boczny punkt oporu i otwiera łącznik | Francuzi po uwolnieniu sektora przechodzą do utrzymania skrzydła, nie przyłączają się wszyscy do ogona gracza | Łącznik dostępny i flanka zabezpieczona; brak konkretnego dowódcy nie unieważnia wyniku |
| M08 `break-village-strongpoint` | Przełamać obronę zabudowań | Oznacza zidentyfikowane stanowisko, osłania czołg lub obchodzi budynek | Boczne działo może zawalić przygotowany fragment domu; oddział wykorzystuje otwarcie | Stanowisko wyłączone i trasa dalej przechodnia; po utracie czołgów dostępna droga dziedzińcem i wejście od tyłu |
| M09 `seize-command-post` | Zdobyć stanowisko dowodzenia | Walczy w krótkich przestrzeniach, zabezpiecza mapę/rozkazy | Oddział kryje wejścia; inni alianci walczą poza lokalnym celem | Punkt zabezpieczony i dane pozyskane przez gracza; nie wymaga wybicia całej miejscowości |
| M10 `restore-communications` | Przywrócić telefon i przekazać meldunek | Dociera do uszkodzonego odcinka, wykonuje krótkie naprawy i nadaje meldunek | Kompani zajmują obronne osłony; świat zapowiada kontratak | Łączność sprawna, meldunek potwierdzony; brak jednego inżyniera/medyka nie blokuje interakcji |
| M11 `hold-counterattack` | Utrzymać dwa dojścia | Przemieszcza się między kierunkami, odpiera rozpoznanie i dwie ograniczone próby przełamania | Rezerwy wroga nadchodzą z wiarygodnych dróg, własne skrzydła wspierają; ocalały czołg walczy z pozycji | Utrzymany węzeł i załamane zadeklarowane próby szturmu, a nie globalne `enemyCount===0` |
| M12 `consolidate-line` | Przekazać pozycję i zakończyć misję | Potwierdza dojście odciążenia, zbiera ocalałych, obserwuje dalszą bitwę | Własny oddział odchodzi/utrzymuje sektor, front poza nim nadal istnieje | Jeden stan zwycięstwa; brak ponownych nalotów i zapisów po zakończeniu sesji |

M06 i M07 mogą być realizowane w różnej kolejności po M05. M08 wymaga rozpoznania warunków dojścia, a nie tożsamości konkretnego czołgu. Nie otwierać dostępnej części mapy dopiero po kliknięciu znacznika, jeśli fizycznie gracz mógł tam wcześniej wejść. Umożliwić wcześniejsze neutralizacje stanowisk i zachować ich wynik.

### 8.3. Cele poboczne z konsekwencjami

| ID | Zadanie | Konsekwencja |
|---|---|---|
| O01 `recover-wounded` | Dotarcie do odciętej małej grupy rannych za pierwszą linią | Dodatkowe zaopatrzenie i inne podsumowanie strat; nie podniesienie maksymalnego HP |
| O02 `silence-observer` | Wyłączenie wskazanego punktu obserwacji artyleryjskiej | Mniej dokładny lub opóźniony zaplanowany ostrzał wskazanego sektora; nie magiczne wyłączenie całego frontu |
| O03 `secure-supply` | Zdobycie składu amunicji na bocznej trasie | Uzupełnienie ograniczonych zasobów oddziału, dłuższa możliwość wsparcia Lewisa |
| O04 `open-flanking-trench` | Usunięcie lokalnej przeszkody i oczyszczenie łącznika | Dodatkowa droga przemieszczania w finale i korzystniejszy punkt wejścia własnych rezerw |

Każdy cel poboczny ma stan pominięty/wykonany, krótki komunikat i realny, ograniczony skutek. Nie tworzyć czterech znajdziek bez wpływu na misję.

### 8.4. Graf i checkpointy

Graf zależności:

```text
M01 → M02 → M03 → M04 → M05 → ┬ M06 ┬ → M08 → M09 → M10 → M11 → M12
                              └ M07 ┘
O01/O02/O03/O04 dołączone do właściwych obszarów; nie są warunkiem zwycięstwa.
```

Kryteria celów są oceniane na podstawie stabilnych ID i aktualnego stanu. Do ukończenia M08 może prowadzić neutralizacja + przejście otwarte przez czołg **albo** neutralizacja + przejście boczne dostępne. Nie wpisywać dwóch różnych celów opisujących tę samą rzecz tylko dlatego, że wykonawca zmienił się po stracie wsparcia.

Planować **osiem punktów zapisu**: po M01, M03, M04, M05, zakończeniu M06+M07, M08, M10 i przed ostatnią fazą M11 w sprawdzonej osłonie. Ich dokładne strefy zatwierdzić po playteście. Zapis nie ma zależeć od ustania wszystkich wybuchów na horyzoncie.

---

## 9. Stały oddział gracza

### 9.1. Skład i rozpoznawalność

Przyjąć **gracz + czterech stałych kompanów**. Istniejące postacie to punkt wyjścia: Thomas Reed jako gracz, Arthur Hughes, William Ellis i George Bennett; czwarty kompan otrzymuje nową rolę strzelca/grenadiera. [K06]

| Kompan | Rola | Zachowanie wymagane |
|---|---|---|
| Hughes | Dowodzenie małą sekcją i meldunki | Zna plan, wskazuje kierunek, zajmuje czytelną pozycję, nie biegnie sam przez cały poziom |
| Ellis | Wsparcie Lewisem | Zajmuje sektor ognia, osłania ruch, uwzględnia amunicję i przeładowanie |
| Bennett | Sanitariusz i strzelec | Udziela ograniczonej pomocy w bezpiecznych warunkach, nie podnosi kolegów bez końca pod MG |
| Czwarty kompan | Strzelec/grenadier, zabezpieczenie tyłu | Pilnuje drugiego kierunku i wykonuje krótkie zadania pomocnicze |

To funkcjonalny skład gry, nie deklaracja pełnej etatowej struktury historycznego pododdziału. Pozostali brytyjscy żołnierze należą do oddziałów sektora i nie są niekontrolowanymi duplikatami kompani.

### 9.2. Formacja i podążanie

Domyślne zachowanie: kompan pozostaje w lokalnym obszarze gracza i aktualnego punktu zadania, wybiera bezpieczną drogę, nie wyprzedza natarcia o dwa sektory. Na otwartym terenie utrzymuje luźne rozstawienie; w okopie przechodzi do kolumny, a w walce rozdziela się na parę osłaniającą i przemieszczającą się.

Przyjąć początkowo odległości rzędu 3–10 m podczas marszu i elastyczny obszar pracy 15–30 m w starciu. To parametry do strojenia, nie niewidzialne smycze. Osłanianie obejścia może uzasadniać większy dystans. Kompan nie biegnie do gracza w tej samej sekundzie, w której zostawił obsadzony punkt ogniowy na jego rozkaz.

Kompani muszą: przepuszczać gracza w drzwiach, reagować na jego cofanie, nie pchać go z osłony, nie stawać stale w linii strzału i nie zajmować bez powodu osłony, którą właśnie wykorzystuje. W ciasnym przejściu działa kolejka i miejsca oczekiwania, nie wzajemne przeliczenia ścieżki prowadzące do zapętlenia.

### 9.3. Proste polecenia

Wprowadzić jedno mapowalne wejście rozkazów z trzema kontekstowymi opcjami: **za mną / utrzymać pozycję / zbiórka**. Nie dodawać rozbudowanego ekranu RTS. Istniejące klawisze interakcji i diagnostyki nie mogą zostać nadpisane.

Rozkaz utrzymania oznacza obronę pobliskich osłon i dopuszczalne ustępowanie pod granatem; nie zakazuje samoratowania. Zbiórka anuluje stare zadanie, wybiera osiągalny punkt i odtwarza formację. Gracz otrzymuje krótki komunikat o przyjęciu lub braku bezpiecznej drogi, bez spamu co sekundę.

### 9.4. Ranni, śmierć i brak blokad fabuły

Zwykli żołnierze nie otrzymują nieśmiertelności. Dla stałych kompanów można zastosować jawny stan ciężkiego zranienia poprzedzający śmierć, ale z ograniczonym czasem pomocy i skończonym zasobem leczenia. Nie stosować ukrytej reguły „HP nigdy nie spada poniżej 1”.

Bennett podchodzi tylko wtedy, gdy może dotrzeć i nie jest bezpośrednio przygwożdżony. Przerwanie pomocy zachowuje stan akcji, nie nalicza leczenia dwa razy. Gracz może pomóc bez długiej obowiązkowej scenki. Weteran nie musi otrzymywać identycznego marginesu ratunku jak Rekrut, ale różnica jest jawna w profilu.

Śmierć Hughesa przekazuje niezbędny meldunek innemu ocalałemu lub dokumentowi. Śmierć inżyniera daje zastępczą interakcję. Brak medyka nie blokuje telefonu. Brak całego oddziału umożliwia ukończenie trudniejszej wersji zadania, bez natychmiastowego odradzania czterech identycznych postaci za graczem.

### 9.5. Odbiór oddziału

Obowiązkowy test trasy: 10 minut chodzenia, sprintu, cofania, kucania i skrętów przez okopy, drzwi oraz gruzy, następnie wejście w walkę, rozkaz zatrzymania, zbiórka i load. Rejestrować dystans do gracza, czas bez osiągalnej trasy, zajęte osłony, nieudane replanowanie i przecięcia linii ognia.

Nie wolno uznać teleportacji poza kadrem za standardową metodę podążania. Recovery może wykonać ograniczoną lokalną korektę nieprawidłowej penetracji zgodnie z kontraktem kolizji; nadrabianie 80 m przez przeniesienie kompana jest inną operacją i nie należy do przyjętego rozwiązania.

---

## 10. Dowodzenie polem bitwy i zachowanie piechoty

### 10.1. Rozkazy sektorowe zamiast jednego celu

Każdy pododdział otrzymuje własny sektor, zadanie, punkt bazowy, dopuszczalne granice pościgu, drogę odwrotu i warunki wezwania wsparcia. Stan sektora nie jest tym samym co faza misji gracza.

Minimalne rozkazy: `defend`, `suppress`, `advance`, `flank`, `regroup`, `fallback`, `reserve`. Przejścia wynikają z zagrożenia, dostępności drogi, obsady, rozpoznania, lokalnych strat i zamierzeń scenariusza. Nie korzystają z prostego sygnału „gracz kliknął E, wszyscy do kolejnej współrzędnej”.

Ogień i ruch są rozdzielone. Jedna grupa przygważdża stanowisko, druga przemieszcza się do zaprojektowanego punktu osłony. Jeśli przeciwnik nie jest przygwożdżony, część grupy może zatrzymać się i poprosić o wsparcie zamiast wejść kolumną w MG.

### 10.2. Niemiecka obrona

Obrona ma pierwszą linię, pozycje odwrotowe, bronione przejścia i lokalne rezerwy. Strzelec nie opuszcza dobrego stanowiska tylko dlatego, że ostatnio usłyszany gracz jest 60 m dalej. Rozpoznany kontakt poza obszarem zadania może wywołać meldunek, osłonę sąsiada albo ograniczony pościg, ale nie migrację całej obsady.

MG ma określone pola ostrzału i zmusza do obejścia. Obsługa działa jest osłaniana przez piechotę. Utrata działa nie powoduje automatycznej śmierci wszystkich jego obrońców; utrata obsługi nie może po load zostać cofnięta przez wyższy numer fazy. Lokalny odwrót kończy się na realnej pozycji, nie na losowym punkcie w odsłoniętym polu.

Nie wszyscy przeciwnicy mają tę samą odwagę i aktualną wiedzę. Rozkazy i informacje przekazywane między grupami mają kontrolowane opóźnienie. Nie wprowadzać globalnej wiedzy o pozycji gracza po jednym strzale.

### 10.3. Morale i supresja

Wykorzystać istniejącą supresję, ale uzupełnić ją o kontekst pododdziału: pobliskie straty, odcięcie osłony, utratę ciężkiej broni i rozkaz dowódcy. Morale ma wpływać na decyzję, nie dodawać arbitralnego pancerza lub odejmować HP bez trafienia.

Zdefiniować histerezę przejść, np. wejście w przygwożdżenie przy wyższym progu niż powrót do działania, aby jednostka nie zmieniała co tick stanów. Czas reakcji i regeneracja supresji są w czasie symulacji. Ogień na ścianę nie przygważdża automatycznie całej drużyny za kilkoma budynkami.

### 10.4. Rezerwy i tempo

Pododdziały rezerw mają skończony skład, widoczne lub wiarygodnie oddalone miejsca oczekiwania oraz fizyczne drogi wejścia. Każdy żołnierz posiada stabilne ID i bilans: w rezerwie, w drodze, w walce, ranny lub poległy.

Nie ma nieskończonych fal odradzanych po odwróceniu kamery. Reżyser może opóźnić rozkaz wejścia kolejnej grupy, gdy dojście jest zablokowane, ale nie wskrzesić poprzedniej dla zachowania wrażenia intensywności. Pole bitwy ma również krótkie uspokojenia, przegrupowania, noszowych i ruch zaopatrzenia.

### 10.5. Samodzielność bez grania za gracza

Sojusznicy mogą zabijać, uciszać stanowiska i otwierać lokalne drogi. Nie dawać im sztucznego zakazu zadania ostatniego trafienia celowi. Jednocześnie obszary działania i rozkazy mają zapobiegać sytuacji, w której dwa czołgi i kilkunastu aliantów czyszczą wszystkie przyszłe sektory podczas stania gracza w HQ.

Test bezczynności ma sprawdzać, czy front zachowuje strukturę i zmienia lokalne stany, a nie czy zawsze po 10 minutach nadal żyje dokładnie tyle samo NPC. Gracz nie może samoczynnie ukończyć misji bez wykonania czynności operacyjnych, takich jak pozyskanie danych i nadanie meldunku.

---

## 11. Symulacja większej liczby jednostek

### 11.1. Trzy poziomy, ale nie trzy zestawy zasad obrażeń

**Poziom A — pełna interakcja:** gracz, jego oddział, miejscowi przeciwnicy, istotne pojazdy i wszystkie jednostki, które mogą wejść z nimi w kontakt. Ruch i pociski obsługiwane w kroku symulacji; percepcja i planowanie rozłożone na ticki.

**Poziom B — dalsze działania sektorowe:** grupy poruszają się po trasach, zachowują obsadę, stan zaopatrzenia, rozkazy i straty, ale nie wymagają każdej bliskiej animacji ani pełnego zestawu lokalnych decyzji co tick. Widoczne walki korzystają z ograniczonego modelu starcia; jednostki nie są losowo zabijane tylko po to, aby odtworzyć efekt.

**Poziom C — odległa panorama poza przestrzenią interakcji:** sylwetki, dym, dalekie przeloty i wymiany ognia przedstawiają szerszą bitwę. Nie mogą bez wcześniejszego przejścia do warstwy interaktywnej zadawać ukrytych obrażeń w strefie gracza. Ta warstwa nie zalicza celów ani nie tworzy realnych przeciwników wewnątrz osłony.

### 11.2. Promocja do pełnej symulacji

O istotności decyduje nie tylko odległość od kamery: także możliwość trafienia, widoczność, bieżący pocisk, udział w celu, rozkaz gracza, planowany set piece i sąsiedztwo walki. Obserwowany sektor nie może przełączać wyniku starcia na losowy przy każdym obrocie głowy.

Awans i degradacja zachowują ID, pozycje, HP, amunicję, rozkaz, straty oraz czas zdarzeń. Zastosować histerezę granic. Jednostka ostrzeliwana z daleka staje się interaktywna **przed rozstrzygnięciem trafienia**, a nie dopiero po tym, gdy kamera się do niej zbliży.

Jeżeli zaplanowany ostrzał z dalekiego sektora mógłby trafić gracza, źródło i pocisk muszą uzyskać pełne warunki widoczności, kolizji i zapisu. Przy braku budżetu odroczyć niekrytyczne tło, nie ignorować obrażeń albo osłon na trasie pocisku.

### 11.3. Wstępne liczby produkcyjne

Punkt startowy wzorcowego starcia: 48–64 lokalne NPC, potem próba 96; scenariusz obciążeniowy do 144 pełnych aktorów. Dodatkowa warstwa dalszych działań może reprezentować 150–250 żołnierzy rozłożonych po sektorach. Nie jest to obietnica jednoczesnego rysowania 400 szkieletów w LOD0.

Ostateczną obsadę ustalać po pomiarze i odbiorze grywalności. Liczby jednostek będące częścią misji są takie same na każdym presecie grafiki. Ustawienie Low może uprościć siatki i animacje panoramy, nie usunąć połowy niemieckiej obrony lub zmienić wyniku sektorowej bitwy.

### 11.4. Budżet pracy

Wprowadzić indeks przestrzenny aktorów, priorytetową kolejkę percepcji, lokalne zapytania o osłony i hierarchiczne planowanie. Unikać sortowania całej listy NPC dla każdego czołgu i każdego myślenia żołnierza. Zlecenia mają limit wieku; gracz i jego oddział nie mogą stale przegrywać dostępu do nawigacji z dalekim tłem.

Do workera przenosić tylko zadania czystych danych, gdy profilowanie potwierdzi korzyść. W pierwszej kolejności: przygotowanie nawigacji sektora lub kosztowne planowanie ścieżek, nie zapis, obrażenia i decyzja o śmierci. Wynik workera zawiera ID sesji, rewizję sektora i numer zlecenia. Spóźniony wynik zostaje odrzucony. Jedna sesja ma jeden kontrolowany cykl życia workerów; powrót do menu je anuluje.

Nie uruchamiać automatycznie workera na każdy sektor. Nie uzależniać poprawności od SharedArrayBuffer ani dodatkowych nagłówków hostingu, jeśli nie wykazano takiej potrzeby. Tryb bez workera zachowuje to samo API i reguły, ale nie staje się drugim, osobno rozwijanym systemem AI.

---

## 12. Czołgi, ich uzbrojenie i przeciwdziałanie

### 12.1. Czołg jako wsparcie, nie samodzielny czyściciel mapy

Zachować rolę przełamywania wybranych przeszkód, osłaniania podejścia i niszczenia stanowisk. Czołg ma własny rozkaz taktyczny: oczekiwanie, podejście, zajęcie pozycji wsparcia, ostrzał, przejście za piechotą, zatrzymanie przed zagrożeniem, ograniczone cofnięcie, unieruchomienie i zniszczenie.

Trasa pojazdu ma punkty wsparcia i warunki sytuacyjne, ale nie zakłada automatycznego ruchu aż do finału. Wykryte działo, brak oczyszczonej flanki lub zator w przejściu zatrzymują ruch. Czołg nie musi znać niewykrytego stanowiska; może zostać trafiony. Jego ograniczona wiedza nie może być zastąpiona perfekcyjną znajomością całej mapy.

Dwa istniejące pojazdy pozostają głównym wsparciem gracza. Kolejne 2–4 pojazdy mogą występować na sąsiednich odcinkach w ramach zaakceptowanego budżetu. Każdy pojazd ma odrębną rolę i historię stanu, nie tylko powielony model na tej samej trasie.

### 12.2. Pełne stanowiska uzbrojenia

Dla przyjętego modelu **Mark IV Male** przygotować dwie armaty 6-funtowe oraz trzy stanowiska karabinów maszynowych, zgodnie z opisem uzbrojenia egzemplarza muzealnego. [H04] Nie dodawać obrotowej wieży i nie stosować jednego wspólnego wylotu w środku kadłuba.

| Stanowisko | Dane wymagane | Praca w grze |
|---|---|---|
| Lewa armata sponsonu | Socket, lokalny pivot, sektor, podniesienie, amunicja, cykl, stan mechanizmu | Może ostrzeliwać lewy cel niezależnie od prawej armaty |
| Prawa armata sponsonu | Te same dane, osobne ID i stan | Może realizować scenę wsparcia bez blokowania całego uzbrojenia |
| Przedni MG | Socket, sektor przedni, magazyn/zasób, serie, przerwy | Przykuwa uwagę i osłania piechotę przed pojazdem |
| Lewy MG | Dane konkretnego mocowania, sektor i ograniczenia obsługi | Używany, gdy cel znajduje się we właściwym polu ognia |
| Prawy MG | Osobny stan i pola ostrzału | Nie jest kopią przedniego MG strzelającą przez kadłub |

Każdy mount posiada: `id`, `weaponProfileId`, `socket`, `aimLimits`, `ammo`, `reloadRemaining`, `burstState`, `health`, `disabled`, `targetId`, `crewRequirement`. Tam, gdzie obsługa stanowisk współdzieli członka załogi, arbitraż nie pozwala temu samemu zasobowi jednocześnie wykonywać sprzecznych działań. Niezależność broni nie oznacza automatycznej możliwości idealnego strzelania z pięciu miejsc bez ograniczeń.

Model i symulacja korzystają z tego samego zestawu lokalnych punktów montażowych. Renderer może interpolować kąt, ale pocisk wychodzi z autorytatywnej pozycji odpowiadającej ograniczeniom stanowiska. Testy porównują skrajne kąty i wyloty w grze, nie wyłącznie nazwy socketów w pliku.

### 12.3. Wybór celów i tempo ognia

Priorytety zależą od broni: armata zwalcza rozpoznane stanowisko, działo, barykadę lub większą grupę za osłoną; MG prowadzi ograniczone serie przeciw piechocie. Czołg nie obiera stale najbliższego widocznego pojedynczego żołnierza jako idealnego celu armaty.

Warunki strzału: cel w sektorze i zasięgu, czas obrotu/ustalenia, wolna droga od fizycznego wylotu, brak swoich w zagrożonej przestrzeni, dostępność obsługi, amunicja oraz cykl mechanizmu. Uwzględniać lokalną możliwość trafienia po łuku, nie tylko prostą linię do celu przed utworzeniem pocisku.

Ogień może być niedokładny i przygważdżający, ale nie powinien polegać na dopisanej minimalnej szansie chybienia chroniącej wybrane postacie. Balans wynika z pozycji, rozpoznania, amunicji, sektorów i czasu obsługi, a nie z tajnego zakazu zabijania przeciwników przez aliantów.

### 12.4. Uszkodzenia

Rozdzielić integralność kadłuba, lewą i prawą gąsienicę, napęd oraz stan każdego stanowiska. Nie trzeba pełnego modelu grubości każdej płyty. Wystarczy jawna, udokumentowana klasyfikacja stref i źródeł obrażeń, której wynik pokrywa się z feedbackiem.

Uszkodzenie gąsienicy zatrzymuje lub mocno ogranicza ruch, ale sprawne stanowisko może dalej strzelać. Uszkodzenie jednej armaty nie wyłącza wszystkich MG. Zniszczenie zatrzymuje pętle audio i uzbrojenie, zostawia wrak jako właściwą osłonę/przeszkodę oraz jest utrwalone w save.

Zwykłe strzały karabinowe nie zdejmują „paska HP czołgu”. Nowe rodzaje zagrożeń muszą mieć jawną podstawę historyczną i zakres gry; nie dodawać uzbrojenia z innej epoki tylko dlatego, że ułatwia balans. Ten plan opiera przeciwpancerne starcia na działach i terenie, nie na współczesnych wyrzutniach.

### 12.5. Niemieckie stanowiska przeciwpancerne

M05 zawiera dwa zasadnicze działa ustawione tak, aby wzajemnie utrudniały frontalne podejście, ale każde miało możliwą flankę piechoty. Dodatkowe stanowisko na odległym sektorze może pokazać stratę innego czołgu. To inspiracja udokumentowanym użyciem dział pod Cambrai, a nie rekonstrukcja dokładnej lokalizacji Graincourt. [H01]

Działa mają widoczny odrzut lufy, błysk, dym/kurz, załogę, ograniczone obracanie, czas przeładowania i skończoną amunicję. Spadek obsady wydłuża obsługę. Ucieczka załogi nie jest tym samym co uszkodzenie zamka; warunki celu jasno rozróżniają chwilową ciszę i trwałe wyłączenie.

Nie pozostawiać warunku `t.pos.z>57`, uznawania wszystkich czołgów za cele bez relacji koalicji ani globalnego `phase>=5` jako dowodu zniszczenia dowolnego działa. Te uproszczenia są związane z obecną małą misją. [K09]

### 12.6. Ruch i gąsienice

Zachować konserwatywny obrys i sprawdzanie ruchu obrotowego. Nie naprawiać zatorów zmniejszaniem collidera względem modelu. Piechota ma ustępować, a czołg ma wyznaczoną przestrzeń manewru i możliwość ograniczonego cofnięcia.

Lewa i prawa gąsienica animują się na podstawie rzeczywistego przesunięcia oraz skrętu. Pojazd zablokowany przez NPC nie ma „jadących” pasów, chyba że jest to osobny, fizycznie uzasadniony stan buksowania. Bliski wariant może używać instancjonowanych ogniw, dalszy uproszczonego pasa z zachowaną fazą. Nie tworzyć draw calla i pełnej fizyki dla każdego ogniwa.

---

## 13. Lotnictwo, bombardowania i wybuchy

### 13.1. Najpierw odtworzyć zgłoszenie

W bazie istnieje łańcuch bomba → trafienie → `blast()` → `explosion` → `Effects.event()`. [K10–K12] Dlatego pierwsze zadanie nie brzmi „dopisz eksplozję”, lecz „sprawdź, w którym miejscu ginie widoczny rezultat”.

Dodać scenariusz diagnostyczny: samolot nad łatwo widocznym, pustym obszarem, kamera i obserwator gracza przy bezpiecznej odległości, osobne logi startu, zrzutu, lotu, trafienia, wywołania `blast`, odbioru eventu i przydziału efektu. Powtórzyć przy pustej puli i przy maksymalnym obciążeniu efektów, na każdym presecie oraz po checkpoint.

Każda usunięta bomba ma powód: trafienie, opuszczenie zakresu scenariusza, TTL lub anulowanie sesji. TTL wewnątrz aktywnego sektora bez uderzenia jest sygnałem do diagnostyki trajektorii/kolizji, nie dowodem poprawnego nalotu. Nie detonować automatycznie bomby w powietrzu tylko dlatego, że skończył się timer.

### 13.2. Plan lotów

Pozostawić skończony harmonogram wsparcia, ale rozszerzyć go o rozpoznawalne rodzaje działań: przelot, podejście do bombardowania, zrzut nad celem i odejście. Nie każdy widoczny samolot musi atakować, lecz każda bomba zadająca obrażenia ma konkretne źródło.

Naloty mają okna uruchomienia związane z sytuacją w sektorze, a nie wyłącznie czasem od pierwszego gwizdka. Dopuszczalny cel jest wybrany przed podejściem; po zrzucie bomba nie śledzi aktualnej pozycji gracza. Nie tworzyć reguły „każde zatrzymanie gracza przywołuje bombę na jego głowę”.

Dla każdej użytej maszyny zweryfikować wariant modelu, podwieszenia, liczbę oraz rodzaj ładunku. Nie mnożyć liczby bomb przez limit cząstek i nie projektować ciągłego bombardowania strategicznego tylko dlatego, że silnik potrafi renderować kilkanaście obiektów. Istniejące DH.5/DFW są punktem wyjścia do walidacji zasobów, nie automatycznym dowodem dowolnego wyposażenia. [K04]

### 13.3. Prezentacja bombardowania

Wprowadzić co najmniej trzy profile: granat, pocisk artyleryjski/czołgowy i bomba lotnicza. Każdy profil odróżnia atak, wyrzut materiału, dym/kurz, odłamki prezentacyjne, ślad i dźwięk. Wybuch w ziemi wygląda inaczej niż w murze i na drodze.

Bomba daje czytelną sekwencję: narastający dźwięk przelotu, zauważalny zrzut, odgłos spadania, błysk uderzenia, energiczny wyrzut ziemi lub gruzu, dłużej pozostający kurz i ślad. Nacisk położyć na materiał i masę, a nie na wielką pomarańczową kulę zasłaniającą cały poziom.

Efekt respektuje teren i powierzchnię uderzenia. Ślad na ścianie nie jest poziomym kwadratem na ziemi. Dźwięk dochodzi z rzeczywistej pozycji XYZ. Drgania kamery i intensywność efektów są regulowane; nie mogą ponownie powodować trwałego przechylenia horyzontu.

### 13.4. Priorytety i gwarancja czytelności

Pula efektów ma zarezerwowane miejsce dla bliskich zagrożeń oraz scen misji. Najpierw odrzucać dalekie ślady, ozdobny pył i część smug. Nie odrzucać całego bliskiego wybuchu na Low lub podczas strzelania kilku MG.

Minimum prezentacyjne obejmuje widoczny sygnał uderzenia, pozycjonowany dźwięk i podstawowy ślad materiału. Zmniejszenie liczby cząstek nie zmienia promienia obrażeń, kolizji ani chwili uderzenia. Przepełnienie puli tworzy diagnostyczny licznik i tańszy reprezentant tego samego zdarzenia, nie drugi rodzaj eksplozji z innymi regułami.

Dalsze tło może używać uproszczonych dalekich eksplozji. Taki efekt nie może udawać realnej bomby spadającej na gracza bez odpowiadającej jej logiki.

---

## 14. Destrukcja i sceny widowiskowe

### 14.1. Model zniszczeń

Przyjąć **kontrolowane, przygotowane wcześniej stany obiektów**: `intact`, `damaged`, `breached`, `collapsed`. Nie obiecywać dowolnej symulacji zawalenia każdej ściany.

Każdy istotny obiekt ma zestaw geometrii widocznej, colliderów i portali dla danego stanu. Przejście stanu jest jedną operacją symulacji z numerem rewizji. Efekt kurzu i latający gruz nie jest właścicielem momentu otwarcia przejścia. Zmiana LOD ani jakości nie zmienia stanu przeszkody.

Zniszczenie może otworzyć drogę, zamknąć odcinek, odsłonić stanowisko lub stworzyć osłonę. W każdym przypadku aktualizuje lokalną nawigację i rezerwacje osłon. AI stojące na usuwanym elemencie otrzymuje poprawne podparcie albo przechodzi w uzasadniony ruch, a nie pozostaje w powietrzu.

### 14.2. Sceny obowiązkowe i wspierające

| Scena | Warunek uruchomienia | Rezultat fizyczny | Wariant zastępczy |
|---|---|---|---|
| SP01 — boczna armata burzy stanowisko w domu | Rozpoznany cel, sprawny właściwy mount, linia strzału, sojusznicy poza strefą | Uszkodzenie przygotowanej elewacji, kurz, gruz, otwarcie dostępu | Wejście przez dziedziniec/tył po utracie czołgu |
| SP02 — czołg przełamuje przednią część umocnienia | Oczyszczony dojazd, prawidłowa prędkość i dostępna przestrzeń | Zgniecenie lekkiej drewniano-ziemnej osłony, zapadnięcie przygotowanego fragmentu | Piechota otwiera boczne przejście przygotowaną interakcją |
| SP03 — niemieckie działo zatrzymuje czołg | Czołg w realnym sektorze ostrzału, aktywna obsługa | Trafienie może zerwać gąsienicę; pojazd przechodzi do walki z postoju | Po wcześniejszej neutralizacji działa wydarzenie nie jest wymuszane |
| SP04 — bombardowanie zrywa trasę lub ujawnia stanowisko | Zaplanowany lot i trafienie w wyznaczony destrukcyjny obiekt | Kurz, zmiana collidera, alternatywna droga lub krótkie zadanie inżynieryjne | Gdy trasa jest już zniszczona, lot wybiera ważny cel zapasowy albo nie startuje |
| SP05 — czołg przebija drut przed pierwszą linią | Pojazd dojechał do przeszkody | Trwały wyłom widoczny w renderze, kolizji i nawigacji | Wcześniej dostępne przejście piechoty |
| SP06 — odciążenie w finale | Meldunek nadany i dojście własnych rezerw dostępne | Widoczna grupa wchodzi na pozycję i przejmuje zadanie | Alternatywne wejście przy zablokowaniu głównej drogi |

SP01, SP02 oraz widoczny nalot/uderzenie są obowiązkowymi scenami jakościowymi standardowego przebiegu. Nie wymuszać ich kosztem logiki, gdy gracz wcześniej zniszczył wykonawcę lub rozwiązał problem inaczej. Odbiór obejmuje zarówno trasę widowiskową, jak i zastępczą.

Czołg wjeżdżający w „bunkier” oznacza przygotowaną scenę naruszenia lekkiego elementu umocnienia lub osłabionej przedniej części. Nie przedstawiać przejazdu przez nienaruszony masywny beton jak przez dekorację. Wiarygodność sceny opiera się na materiale, skali i wcześniejszym stanie obiektu.

### 14.3. Reguły reżysera scen

Każda scena zawiera: ID, warunki, listę wymaganych aktorów/obiektów, rezerwację trasy, fazy wykonania, limit oczekiwania, warunki przerwania, efekt domenowy, sposób odtworzenia oraz obejście. Stan jest zapisywany.

Brak czołgu nie uruchamia niewidzialnego strzału. Śmierć dowódcy nie pozostawia oczekiwania na jego wypowiedź. Zajęcie toru jazdy przez gracza opóźnia scenę lub zmienia wariant; nie wyłącza kolizji. Po wczytaniu nie odtwarzać od nowa zaliczonego zawalenia i nie nakładać drugi raz obrażeń.

Nie przejmować kamery gracza na siłę przy każdym wydarzeniu. Kompan może zwrócić uwagę głosem lub gestem, a projekt przestrzeni kierować wzrok. Gracz zachowuje kontrolę i możliwość schowania się.

### 14.4. Granice bezpieczeństwa technicznego

Kosmetyczne fragmenty gruzu nie blokują nieprzewidywalnie kapsuły i nie zabijają gracza zależnie od liczby cząstek na presecie. Ważne odłamki/przeszkody są częścią przygotowanego stanu logicznego. Pył wizualny może być uproszczony; jeżeli ma blokować widoczność AI, potrzebuje osobnej, jednakowej dla wszystkich ustawień reprezentacji w symulacji.

Dowolna deformacja heightfieldu nie jest wymagana. Głębszy lej zmieniający ruch powstaje wyłącznie w przygotowanym obszarze ze zgodnym podparciem i nawigacją. Zwykła większość śladów po bombach może pozostać prezentacyjna.

---

## 15. Nowe nacje oraz pełna produkcja modeli

### 15.1. Nowe modele francuskie i amerykańskie

Przygotować minimum trzy warianty wyglądu Francuzów i trzy Amerykanów, z rozróżnieniem ról przez wyposażenie. Nie traktować zmiany koloru brytyjskiego munduru jako gotowej nowej nacji.

Dla Francuzów potrzebne są rozpoznawalne nakrycie głowy, sylwetka umundurowania, ładownice, plecak i właściwa broń. Dla Amerykanów oddzielne wyposażenie piechura i członka grupy inżynieryjnej, narzędzia oraz animacje pracy. Szczegółowe wzory i dopuszczalne uzbrojenie zatwierdzić w historycznej karcie assetu przed modelowaniem. Nazwa kraju nie wystarcza jako referencja ubioru konkretnego roku.

Planowana minimalna broń nowych grup: jedna francuska rodzina karabinu i jedna amerykańska, z własnym modelem trzecioosobowym, profilem użycia oraz animacjami chwytu. Dobór konkretnego wzoru nie może wprowadzać uzbrojenia niepasującego do przyjętej daty. Jeżeli broń jest podnoszona przez gracza, wymaga także gotowego wariantu FPS, dłoni, celowania i pełnej obsługi; nie udostępniać jej z brytyjskim modelem zastępczym.

W 0.5.0 nowe nacje muszą przejść odbiór w misji: wejście do sektora, walka obok gracza, ostrzał przez wspólne pole ognia, udzielanie osłony, przeładowanie, reakcja na granat, śmierć i zapis. Eksport GLB do katalogu bez tych prób nie zamyka zadania.

### 15.2. Macierz całej produkcji

| Rodzina | Zakres obowiązkowy 0.5.0 |
|---|---|
| Brytyjczycy i Niemcy | Przebudowane dotychczasowe warianty, rozpoznawalne role, broń oddzielona od ciała |
| Francuzi i Amerykanie | Nowe modele/wyposażenie i minimum trzy warianty wizualne na nację |
| Stały oddział gracza | Rozpoznawalność czterech kompanów, akcesoria i indywidualne oznaczenia bez czterech całkowicie niezależnych rigów |
| Broń istniejąca | SMLE, Gewehr, Webley, Lewis i stanowisko MG — modele, mocowania, ruchome części, animacje |
| Broń nowych grup | Rodziny zaakceptowane dla FR/US, właściwe chwyty i cykle działania |
| Dłonie i broń FPS | Nowe sekwencje mechaniki; brak obsługi wyłącznie ruchem całego korzenia |
| Mark IV | Pięć stanowisk przyjętego wariantu, części ruchome, gąsienice, uszkodzenia, wrak |
| Działa | Lufa, odrzut, obsługa, stan uszkodzenia i podstawowe animacje artylerzystów |
| Samoloty | Właściwe podwieszenia i bomby, śmigła, poprawna sylwetka i LOD-y |
| Okopy i umocnienia | Trawersy, rampy, ściany, schrony, stanowiska, drut i przełamywane moduły |
| Wieś | Kilka spójnych rodzin budynków, wnętrza istotne dla zadania, przygotowane stany destrukcji |
| Inżynieria i zaplecze | Telefon, przewody, mapy, narzędzia, nosze, skrzynie, elementy przeprawy |
| Świat i efekty | Teren, gruz, drzewa/sad, ślady ostrzału, dym i nowe profile uderzeń |

„Wszystkie modele” oznacza wszystkie używane rodziny widoczne w misji, również obecnie tworzone geometrią JavaScript. Nie należy wymieniać taniej proceduralnej kładki na ciężki GLB tylko dla zgodności z hasłem; każdy zachowany generator ma jednak jawne uzasadnienie i zgodny standard wizualny.

### 15.3. Źródła i eksport

Dotychczasowy plan wskazywał lokalną scenę `blender/Infantry_Refined.blend` w projekcie Blender użytkownika. To historyczna informacja do potwierdzenia, nie odczytana w tej sesji zawartość dysku. [K04]

W wykonaniu zweryfikować połączenie Blender MCP, aktywną scenę i niezapisane zmiany przed edycją. Zachować `.blend`, tekstury źródłowe, skrypty produkcyjne, ustawienia eksportu i wersję kontraktu w wybranym trwałym miejscu authoringu. Źródła nie muszą być publikowane do przeglądarki, ale nie mogą mieć jedynej kopii w katalogu tymczasowym.

Eksport trafia do staging, przechodzi walidację i dopiero wtedy zastępuje komplet plików runtime. Manifest wiąże GLB, tekstury, sockety, klipy, rig i hashe. Nie dopuszczać do wydania nowego modelu ze starym atlasem albo do regeneracji, która nadpisuje ręcznie poprawioną piechotę dawnym generatorem.

Każdy plik produkcyjny ma źródło oraz właściciela. Usunięcie historycznego generatora jest poprawne dopiero wtedy, gdy nie odpowiada już za żaden potrzebny asset i istnieje odtwarzalny następca. Przepisanie generatora nie musi oznaczać utrzymania wszystkich jego starych przełączników.

### 15.4. Jakość i ograniczenia

Zachować metryczną skalę, zgodny układ osi, pivots, lokalne sockety, poprawne normalne, spójność materiałów i czytelność sylwetek. LOD jest rzeczywistym uproszczeniem, a nie trzema identycznymi siatkami o różnych nazwach.

Zestawy powinny mieć wspólną skalę detalu: żołnierz nie może wyglądać jak realistyczny obiekt stojący obok klockowego czołgu i gładkiej ściany. Ważniejsze są poprawne proporcje, materiały, światło i animacja niż maksymalna liczba trójkątów.

Odbiór odbywa się w grze, z aktywnym LOD, fog, oświetleniem, cieniem i animacją. Screenshot sceny Blender nie dowodzi poprawnego eksportu ani wyglądu w Babylon.js.

---

## 16. Animacje, broń i integracja zasobów

### 16.1. Ciało i wyposażenie

Broń jest osobnym obiektem wyposażenia z mocowaniem do szkieletu. Nie pozostawiać karabinu zaszytego w siatce ciała pod drugim widocznym karabinem. Jeden kierunek zależności: kość/socket i stan akcji sterują bronią, a warstwa chwytu dopasowuje kontakt dłoni bez cyklicznego sterowania.

Szkielet może zostać rozszerzony; dawne 19 kości i jeden materiał nie są ograniczeniem jakości. Wspólna rodzina rigów ułatwia obsługę nowych narodowości, lecz nie zwalnia z odebrania chwytu każdej rodziny broni.

### 16.2. Warstwy animacji

Wydzielić lokomocję, postawę, górną część ciała, celowanie i krótkie reakcje. Określić dozwolone połączenia i priorytety: śmierć/ranny, interakcja, granat, reload, ogień, ruch i bezczynność. Kucający reload nie może prostować nóg w ziemię, a prone nie może polegać na obrocie całej stojącej postaci o 90°.

Minimalna macierz obejmuje stanie/kucanie/leżenie; ruch i zatrzymanie; celowanie w górę i dół; ogień; przeładowanie; zmianę broni; granat; reakcję na trafienie; śmierć; podstawową pomoc rannemu i pracę inżyniera. Działo oraz MG wymagają pozycji faktycznej obsługi.

Root motion nie przenosi autorytatywnej kapsuły podczas zwykłego ruchu. Tempo klipu odpowiada przebytej drodze. Zdarzenia audio/efektów wiążą się z identyfikatorem i fazą akcji, nie z liczbą klatek renderowanych przez Babylon.

### 16.3. Broń FPS

Wymagana mechanika: ruch zamka lub odpowiedniej części, właściwe ręce, fazy wkładania amunicji/magazynka, przejście do gotowości, ogień i przerwanie. Rozróżnienia reloadu pełnego/częściowego wprowadzać tylko tam, gdzie istnieje zgodny stan logiki i odpowiednie animacje.

Zużycie amunicji, możliwość strzału, przerwanie i czas akcji należą do symulacji. Animacja nie może „naprawić” niespójności przez dodanie naboju po callbacku, który nie wykona się na niskim FPS. Przerwanie reloadu, zmiana slotu, śmierć, pauza i load są scenariuszami obowiązkowymi.

Po wdrożeniu nowych klipów usunąć zastępcze ruchy `fpRoot` odpowiadające tej samej czynności. Pozostawić subtelny sway/odrzut kamery zgodny z ustawieniami użytkownika, ale nie nakładać dwóch przeładowań jednocześnie.

### 16.4. Kontakty i LOD

Przy zmianie LOD nie może znikać broń, przeskakiwać hełm, resetować się klip ani zmieniać strona dłoni. Daleki LOD może ograniczać częstotliwość próbkowania, jednak nie przesuwa momentu trafienia i nie przywraca dawnych zdarzeń po zbliżeniu.

Blenderowe constraints i sterowniki wymagają uzgodnionego eksportu do używanego formatu. Nie zakładać automatycznego działania niezweryfikowanej funkcji authoringu w runtime. Przed masową produkcją obejrzeć w grze kompletną animację pierwszego żołnierza i pierwszej broni, włącznie z przejściami i anulowaniem.

---

## 17. Realistyczne audio

### 17.1. Biblioteka zamiast zastępczych tonów

Wymiana szumów i oscylatorów jako głównych odgłosów walki pozostaje obowiązkowa. Aktualny kod nadal używa tych rozwiązań dla strzałów, kroków, silników i wybuchów. [K14]

Wprowadzić bibliotekę nagranych lub przygotowanych na bazie nagrań efektów, z potwierdzonym prawem do dystrybucji. Nie kopiować plików z Call of Duty. Zakupy i zewnętrzne usługi generowania głosu wymagają osobnej autoryzacji; brak zakupu nie uzasadnia deklarowania ukończonego audio bez odpowiednich plików.

| Grupa | Zawartość |
|---|---|
| Broń | Osobne charaktery używanych karabinów, pistoletu, Lewisa i MG; strzał blisko/daleko, mechanika, przeładowanie i pusty magazynek |
| Trafienia | Ziemia, drewno, cegła, metal; przeloty blisko gracza związane z prawdziwą trajektorią |
| Eksplozje | Granat, armata i bomba z odmiennym atakiem, odłamkami oraz ogonem |
| Ruch | Kroki po ziemi, błocie, deskach i gruzie; bieg, lądowanie, czołganie, wyposażenie |
| Pojazdy | Ciągły silnik i gąsienice czołgu, obciążenie/jałowy bieg, odrzut działa, lot i odejście samolotu |
| Postacie | Wysiłek, krótkie reakcje, ostrzeżenia, komendy i wołanie o pomoc |
| Świat | Daleki front, wiatr, wnętrze schronu, ruiny, odgłosy zaplecza |
| Zadania | Telefon, gwizdek, narzędzia, interakcje inżynieryjne, komunikaty UI |

Początkowo zakładać co najmniej cztery warianty powtarzalnych strzałów i sześć kroków na powierzchnię. Ilość zaakceptować odsłuchem; mechaniczne powielanie identycznej próbki z inną nazwą nie spełnia wymagania.

### 17.2. Przestrzeń, miks i priorytety

Listener korzysta z pozycji XYZ i orientacji kamery. Samolot nad głową nie brzmi jak nieruchomy sygnał stereo z lewej strony. Dystans i osłonięcie wpływają na głośność oraz barwę, ale nie wymagają pełnej symulacji akustycznej.

Kanały: master, własna broń, świat/efekty, pojazdy, dialogi/komendy, tło i interfejs. Nie mnożyć głośności ambientu drugi raz przez suwak efektów. Głos ostrzegający o granacie ma priorytet nad przypadkowym okrzykiem na drugim końcu wsi.

Początkowy budżet to około 48 aktywnych głosów, z maksymalnie kilkunastoma droższymi źródłami przestrzennymi. Dalsze pętle pojazdów mogą być wirtualizowane i wracać we właściwej fazie. Ograniczanie głosów nie odłącza własnego wystrzału, telefonu albo pobliskiego nalotu.

### 17.3. Synchronizacja i lifecycle

Bufory krótkich efektów są współdzielone i dekodowane raz; aktywne odtworzenia mają osobną własność i czas życia. Długie tła nie muszą być w całości trzymane jako duże bufory PCM. Raportować pamięć po dekodowaniu, nie tylko rozmiar pliku.

Silnik czołgu i lot samolotu korzystają z płynnych pętli i parametrów obciążenia, nie z serii oddzielnych tonów odpalanych co 0,19/0,38 s. [K14] Pauza wstrzymuje właściwe źródła, koniec sesji je zwalnia, a spóźniony `resume()` starej sesji nie włącza dźwięku nad menu.

Dźwięki reloadu są przypisane do właściciela i `actionId`. Przerwanie nie pozostawia końcowego kliknięcia z nieistniejącej już akcji. Load nie odgrywa ponownie historii wybuchów i meldunków; odtwarza bieżące pętle oraz niezakończone stany w uzgodniony sposób.

### 17.4. Dialogi i odbiór

Krótkie komendy oddziału i ostrzeżenia należą do zakresu. Pełny dubbing całej odprawy i wszystkich rozmów jest dodatkiem po odbiorze głównego audio; napisy PL/EN i możliwość pominięcia są obowiązkowe niezależnie od dubbingu.

Odsłuch wykonać na słuchawkach oraz zwykłych głośnikach: próbki solo, strzał przy ścianie, wewnątrz schronu, pełne natarcie, przejazd czołgu, nalot i finał. Sprawdzić czytelność zagrożenia, brak przesteru, klików zapętleń, męczącego tłoku głosów i nieuzasadnionych skoków głośności. Sam test istnienia plików nie jest odbiorem realizmu audio.

---

## 18. Zapis, odtwarzanie i długotrwała misja

### 18.1. Aktualne ograniczenia potwierdzone w schemacie

`src/save/schema.js` ma `SAVE_VERSION=1`, dopuszcza wyłącznie frakcje UK/DE, maksymalnie 100 NPC, dokładnie dwa czołgi, konkretne ID czołgów, dwa ID niszczonych drutów i numery faz 0–7. Trasy oraz pozycje mają granice starej mapy, a aktywne bomby/pociski są odrzucane. [K21]

To dodatkowe ustalenie **A26**: większa mapa, nowe nacje i więcej pojazdów wymagają zmiany kontraktu zapisu, nawet gdy samo renderowanie nowej zawartości działa. Nie wystarczy podnieść limitu NPC i zostawić pozostałych założeń.

### 18.2. Wersjonowanie

Dla zaprojektowanej zmiany formatu przyjąć **SAVE_VERSION 2**, a dla nowej przestrzeni **MISSION_VERSION 4**, pod warunkiem że baza wykonania nadal ma odpowiednio 1 i 3. Jeśli użytkownik wdroży kolejne zmiany przed implementacją, najpierw ponownie odczytać wartości i użyć właściwej kolejnej wersji, nigdy ich nie cofać.

Zapisy pozycyjne 0.4.x nie są automatycznie przenoszone do nowej mapy. Wyświetlić informację o niezgodności checkpointu i możliwość rozpoczęcia nowej misji. Zachować ustawienia grafiki, dźwięku, języka, HUD oraz klawiszy. Nie wykonywać `localStorage.clear()` i nie podmieniać starej pozycji przypadkowym „najbliższym punktem”.

Nie zostawiać w nowym runtime kompletnego interpretera starej misji tylko po to, aby udawać kompatybilność. Odczyt starego nagłówka i czytelne odrzucenie jest wystarczającą obsługą niezgodnego zapisu.

### 18.3. Zakres snapshotu 0.5

Snapshot zawiera: wersję definicji, seed/stan RNG, tick, identyfikatory, stan gracza i broni, skład i stan oddziału, jednostki/rezerwy/straty, rozkazy sektorów, aktualne cele, stan czołgów i każdego mounta, obsługi dział, samolotów, aktywnych pocisków, zniszczeń, przedmiotów, scen widowiskowych oraz odtwarzalnego harmonogramu zadań.

Nie serializować obiektów Babylon, węzłów Web Audio, obietnic, referencji workera, colliderów jako żywych klas lub kopii wszystkich statycznych assetów. Statyczne dane wskazywać przez ID i wersję. Timery zapisywać konsekwentnie jako tick docelowy lub czas pozostały, bez mieszania czasu systemowego i symulacji.

Aktualny zapis stanu RNG jest zaletą bazy. [K13] Zachować ją również przy dodatkowych podsystemach. Dla oddzielnych strumieni losowości zapisać każdy stan i właściciela; kosmetyczny dym nie powinien zużywać losowości decyzji bojowych.

### 18.4. Checkpoint nie czeka na ciszę całego frontu

Ocena bezpieczeństwa dotyczy pozycji gracza, najbliższych aktywnych zagrożeń, podparcia, możliwości zwykłego ruchu z osłony i stabilności wykonywanej akcji. Pocisk lecący w innym sektorze nie blokuje zapisu; jest zapisany i odtwarzany.

Zachować ochronę przed zapisaniem postaci wewnątrz ściany, w izolowanej kieszeni lub przed natychmiastowym trafieniem. W początkowym wariancie można zachować wymóg odzyskanego HP w punktach odpoczynku, ale nie uzależniać go od globalnego braku pocisków.

Przy długim oczekiwaniu checkpoint pozostaje oznaczony jako oczekujący, a gra wskazuje właściwą strefę osłony. Nie teleportować gracza do bezpieczeństwa. Nie wymuszać zapisu w miejscu śmierci po przekroczeniu czasu oczekiwania. Zmierzyć opóźnienie zapisu i zebrać przypadki, w których punkt odpoczynku nie jest faktycznie bezpieczny.

### 18.5. Walidacja danych i odtworzenie

Walidator korzysta z definicji misji: dozwolonych ID, narodowości, koalicji, stanów zniszczeń, broni i obszarów ruchu. Zachować twarde limity rozmiaru danych i liczby encji, ale wyznaczyć je z zaakceptowanej obsady oraz limitów sesji, nie z historycznych „100 NPC, dwa czołgi”. Osobno walidować przestrzeń lotu, która może wychodzić poza prostokąt chodzenia.

Po restore: odbudować indeksy, załadować właściwe stany sektorów i zniszczeń, odtworzyć rezerwacje, przywrócić aktywne pociski i terminy, anulować stare zadania asynchroniczne, a następnie uruchomić prezentację. Nie odpalać historycznych jednorazowych dźwięków i nie uruchamiać drugi raz zakończonych scen.

Kolejność zatwierdzania zaplanowanych decyzji musi być odtwarzalna. Jeżeli wewnętrzny stan planowania nie jest serializowany, rekonstrukcja kolejki ma zachować ustalone reguły i nie konsumować innej liczby losowań. Test identycznego wejścia po restore porównuje istotny stan gry, a nie losowy układ cząstek.

---

## 19. Interfejs, sterowanie i trudność

### 19.1. Ochrona zmian 0.4.5 rew2

Nie cofać obecnego kierunku HUD, sylwetek postaw, położenia HP/zmęczenia, zbliżenia broni do amunicji, napisów i skalowania. Nowe elementy oddziału wpasować w istniejący język wizualny. Nie dokładać drugiego paska zdrowia ani przypadkowych ikon o odmiennej stylistyce. [K03]

Pokazywać ograniczoną informację: imię lub oznaczenie kompana przy istotnym kontakcie, stan ranny/poległy, przyjęty rozkaz i krótką wskazówkę zadania. Nie nakładać stałej ściany czterech dużych portretów, kilkunastu pasków i wskaźników wszystkich jednostek frontu.

HUD odróżnia narodowość od relacji. Francuz i Amerykanin są aliantami; symbol nacji nie zastępuje koloru/oznaczenia koalicji. Minimapę sprawdzić na nowych rozmiarach i przesuniętym początku mapy, bez hardcoded założenia środka przy x=0 i dawnego maksimum z.

### 19.2. Lokalizacja i dostępność

Każdy cel, rozkaz, opis, komunikat błędu, stan zapisu i nowy asset UI posiada klucze PL/EN. Nazwy sprzętu i imiona nie wymagają sztucznego tłumaczenia; instrukcje i fallback po stracie postaci już tak.

Sprawdzić napisy przy dużym HUD, dłuższe angielskie etykiety, zmianę języka w menu i podczas sesji, bez utraty stanu celu. Zachować konfigurowalną intensywność ruchu kamery i głośność kanałów. Ostrzeżenie o nalocie musi być dostępne również jako napis, a nie wyłącznie odsłuch samolotu.

### 19.3. Trudność

Zachować trzy profile i brak przeciwników będących gąbkami na pociski. Większa liczba NPC nie uzasadnia ustawienia wszystkich jako celnych strzelców aktywnych jednocześnie przeciw graczowi.

Strojenie dotyczy: czasu rozpoznania i reakcji, przerw w seriach, intensywności supresji, liczby równoczesnych kierunków ekspozycji, odległości do osłony, pomocy oddziału, dostępnej amunicji i składu lokalnego starcia. Nie dodawać ukrytego limitu „tylko dwóch wrogów może zadawać obrażenia”.

Duże pole bitwy nie wymaga, aby każdy dalszy żołnierz strzelał w gracza. Sektory i rzeczywiste pola widoczności ograniczają presję w naturalny sposób. Poziom grafiki nie zmienia profilu trudności, prędkości myślenia AI ani tego, czy osłona zatrzymuje pocisk.

### 19.4. Odbiór balansu

W kontrolowanych scenariuszach mierzyć: czas do wykrycia i pierwszego trafienia, obrażenia w krótkich oknach, liczbę kierunków ognia, drogę do osłony, odsetek udanych przejść i udział sojuszników. Scenariusze: jeden karabin, MG, bateria, wejście do wsi, nalot, finał i wersja bez czołgów.

Powtórzyć minimum 30 seedów na profil trudności dla wybranych krótkich scen oraz pełne przejścia przez co najmniej trzech ludzi o różnej znajomości FPS. Wyniki botów i testy deterministyczne nie zastępują oceny, czy gracz rozumie przyczynę śmierci i potrafi zareagować.

---

## 20. Testy, narzędzia i bezpieczne usuwanie pozostałości

### 20.1. Co znaczy „usunąć stare testy”

Usuwać test, który pilnuje nieobowiązującego kontraktu, powiela inny test albo nie bada już używanego systemu. Nie usuwać dowodu poprawności tylko dlatego, że nazwa zawiera `v02` lub `v042`.

Przykład: dawny test postaci wymaga dokładnie 19 kości i jednego materiału, a jednocześnie sprawdza poprawne wagi skórowania i normalne. Po zmianie modelu pierwsze ograniczenia należy zastąpić kontraktem manifestu, a drugie zachować. Usunięcie całego pliku bez przeniesienia tych asercji pogorszyłoby ochronę jakości. [K17]

Dla każdej rodziny sporządzić tabelę: **zachować / scalić / przepisać / usunąć**, uzasadnienie, nowy test zastępujący oraz warunek odbioru. Po przeniesieniu nowy test powinien wykrywać celowo zepsuty przypadek tej samej klasy. Zielony wynik po skasowaniu asercji nie jest naprawą.

### 20.2. Docelowa organizacja

```text
tests/
  unit/              math, health, weapons, allegiance, events, pools, graph
  integration/       collision, navigation, squad, battle, vehicles, save, lifecycle
  content/           mission-definition, map-connectivity, assets, localization
  browser/           input, HUD, rendering, audio, checkpoints, session lifecycle
  fixtures/          małe sceny odtwarzające faktyczne klasy błędów
tools/
  test.mjs           jeden discovery/runner testów Node
  browser.mjs        jeden entry point regresji przeglądarkowych
  benchmark.mjs      jeden entry point pomiarów i scenariuszy
  assets/            aktywny pipeline importu/eksportu/walidacji
  build.mjs, serve.mjs, check.mjs
```

To organizacja logiczna; nie przenosić istniejącego działającego runnera do innego języka tylko dla estetyki. Jeden entry point może wywołać uzgodnione narzędzie przeglądarkowe. Ważne, aby nie utrzymywać kilkunastu niezależnych wersji otwierania gry, klikania menu i zbierania logów.

Aktualne `node --test tests/*.test.mjs` nie zbierze nowego układu w sposób gwarantowany przez ten wzorzec. [K01] Runner musi jawnie i stabilnie odkrywać pliki, uruchamiać je na Windows i Linux oraz kończyć błędem przy pustej wymaganej grupie. Podział szybkich i długich testów ma być widoczny w poleceniach, nie ukryty w pomijaniu przypadków.

### 20.3. Macierz porządkowania istniejących rodzin

| Istniejąca rodzina | Docelowe działanie |
|---|---|
| `characters-v02.test.mjs` | Przenieść poprawność geometrii, wag, LOD i animacji do content tests; usunąć stare liczby kości/materialów |
| `input*.test.mjs`, `v04-input`, testy pointer lock | Scalić według funkcji; zachować regresje myszy, fokus, mapowanie i interakcję drzwi |
| `v042-collision`, `v04-collision`, testy kamery | Zachować klasy przypadków: opadanie w belkę, prone, obroty, krawędzie, brak trwałego roll |
| `v042-ai`, `navigation`, `tank` | Przenieść nieaktualne współrzędne do małych fixture'ów; rozszerzyć o sektory i oddział |
| `v04/v042-mission` | Zastąpić testy numeric phase grafem; zachować pojedynczy stan terminalny i brak blokady przez odległego wroga |
| `v042-save/storage/lifecycle/audio` | Zachować odporność na uszkodzony zapis, przerwanie ładowania, późny wynik i wycieki |
| `v043/v044/v045` związane z UI | Scalić aktywne scenariusze PL/EN, HUD i ustawień; nie usuwać dlatego, że plan dotyczy gameplayu |
| `benchmark_v02.py`, `benchmark_v03.py`, `benchmark_v045.mjs` | Wydzielić użyteczne scenariusze do jednego benchmark runnera; usunąć nieaktualne adaptery po porównaniu |
| `browser_v*_*.py`, `browser_v*.py` | Scalić wspólne uruchamianie i asercje; historyczne jednorazowe sondy usunąć po przeniesieniu wartości |
| `diagnose_support_v04.mjs`, `scene_v03.py`, `render_v03_contracts.py` | Kandydaci do usunięcia albo zamiany na trwałe scenariusze narzędzia diagnostycznego |
| `generate_*_v03.py`, `generate_support_v04.py`, stare generatory postaci | Usunąć dopiero po ustaleniu właściciela każdego assetu i odtworzeniu eksportu nowym pipeline'em |
| Duplikaty planów, zamknięte implementation/continuation | Scalić obowiązujące treści; resztę pozostawić wyłącznie w historii Git |

Nazwy pochodzą z odczytanego drzewa repozytorium. [K18–K20] Wpis „kandydat” nie oznacza, że każdy wymieniony plik został uruchomiony i wykazano jego bezużyteczność.

### 20.4. Nowe obowiązkowe rodziny testów

| Rodzina | Przykłady wymaganych przypadków |
|---|---|
| Koalicje | UK/FR/US nie wybierają się nawzajem jako wrogowie; DE pozostaje przeciwnikiem; minimapa/save/statystyki zgodne |
| Graf celów | Wcześniejsze wykonanie, M06/M07 w obu kolejnościach, utrata NPC, oba czołgi zniszczone, pojedyncze zakończenie |
| Oddział | Wąskie drzwi, mijanie, rozkazy, osłanianie, ranny medyk, utrata dowódcy, powrót z flanki |
| Sektory | Pościg ma granice, rezerwy skończone, local fallback, nie wszystkie grupy zmieniają rozkaz po M04 |
| Warstwy symulacji | To samo ID/HP/ammo po awansie, trafienie z daleka, brak odradzania po odwróceniu kamery |
| Mounty | Niezależna amunicja i reload, właściwe sektory, nie strzelają przez kadłub, uszkodzenie jednego nie wyłącza reszty |
| Działa | Ubytek obsługi, obrót i collider, widoczność, neutralizacja indywidualna, brak uzależnienia od współrzędnej z |
| Bomby | Poprawny zrzut/trafienie, TTL i wyjście poza mapę, brak podwójnych obrażeń, minimalny efekt przy pełnej puli |
| Destrukcja | Geometria/kolizja/nav zmieniają się razem; aktor na elemencie; save przed/w trakcie/po; brak drugiego zawalenia |
| Save | Aktywne pociski, więcej niż 100 NPC w dozwolonej definicji, dodatkowe pojazdy, FR/US, nowe granice lotu, stary checkpoint |
| Lifecycle | Pauza w nalocie, menu podczas importu, worker zwracający spóźnioną trasę, stary `resume` audio |
| Treść | Wszystkie cele mają teksty PL/EN, wymagane sockety istnieją, brak osieroconych referencji i brakujących plików |
| Build | Czysty katalog, root i podkatalog, Credits po konsolidacji, brak tools/tests/authoring w release |

### 20.5. Testy przeglądarkowe i wizualne

Obowiązkowe: Firefox oraz Chromium/Edge na rzeczywistym WebGL2. Test headless bez właściwego GPU nie potwierdza kosztu renderowania na komputerze użytkownika. Oznaczyć backend renderowania, urządzenie i ograniczenia środowiska.

Sprawdzić prawdziwe kliknięcia, Pointer Lock, obrót + strzał + PPM, utratę fokusu, powrót do gry, skalowanie HUD, zmianę jakości i języka, napisy, zapis po restarcie przeglądarki. Zrzut ekranu ma pokazywać sensowny moment: bombę po uderzeniu, aktywną boczną armatę, pracujących inżynierów, formację w przejściu i stan po zniszczeniu.

Dla wielokrotnego testu przechodniości używać rzeczywistego kontrolera gracza lub sekwencji wejść. Bezpośrednie przypisanie graczowi kolejnych współrzędnych sprawdza co najwyżej cele, nie drogę przez mapę.

### 20.6. Procedura usuwania martwego kodu i assetów

Zebrać importy statyczne, dynamiczne odwołania, katalogi assetów, manifesty, referencje w UI oraz narzędziach produkcyjnych. Brak zwykłego importu nie dowodzi nieużywania pliku wczytywanego po ID.

Usuwać jedną rodzinę odpowiedzialności wraz z przepięciem konsumentów i testami. Po usunięciu: czysty build, uruchomienie wymaganych scenariuszy, walidacja kompletności zasobów, kontrola Credits i porównanie zachowania. Nie zachowywać starego kodu w komentarzu ani w katalogu `legacy/` „na wszelki wypadek”; możliwość odtworzenia daje Git.

Nie usuwać defensywnej obsługi nieobsługiwanego WebGL, błędu odczytu, utraty fokusu czy anulowania sesji tylko dlatego, że nie wystąpiła podczas jednego przejścia. Stara ścieżka implementacji i potrzebna obsługa błędów to różne rzeczy.

---

## 21. Wydajność i budżety projektowe

### 21.1. Warunek podstawowy

Większa mapa ma być osiągnięta dzięki odpowiedniej organizacji pracy, a nie kosztem stałych przycięć. Ustawienia grafiki regulują prezentację; nie zmieniają postępu bitwy i odporności przeciwników.

Wzorcowy cel użytkowy: 1080p, Medium, około 60 FPS na konfiguracji klasy RTX 3060 z jawnie zapisanym CPU. Osobno sprawdzić 1440p i słabsze urządzenie. Nie przedstawiać tych wartości jako obecnego pomiaru — w tej analizie nie uruchomiono gry. Punkt odniesienia ze starego planu nie zastępuje aktualnego benchmarku. [K04]

### 21.2. Budżety startowe

| Obszar | Cel do walidacji |
|---|---|
| Klatka 1080p/Medium | Docelowo mediana <=16,7 ms, p95 <=25 ms, p99 <=33,3 ms na ustalonej konfiguracji |
| Symulacja | Początkowo p95 <=5 ms na tick w referencyjnym starciu; rozdzielić AI, nav, ruch, pociski i dyrektorów |
| Aktorzy pełni | Zaczynać od 48–64, odebrać 96; 144 jako cel sceny obciążeniowej, nie gwarancja każdego widoku |
| Piechur + broń LOD0/1/2 | Orientacyjnie do 30k / 10k / 3k trójkątów, z kontrolą draw calli i skórowania |
| Dłonie + broń FPS | Orientacyjnie do 35k trójkątów, priorytet elementów blisko kamery |
| Mark IV LOD0/1/2 | Orientacyjnie 55k / 20k / 7k plus osobno wykazany koszt gąsienic |
| Działo / samolot LOD0 | Orientacyjnie do 20k / 25k; dalsze modele proporcjonalnie tańsze |
| Audio | Około 48 głosów, kilkanaście kosztownie pozycjonowanych źródeł |
| Aktywny bank PCM | Punkt startowy do 96 MiB; uwzględnić kopie i bufory, nie sam rozmiar pobrania |
| Początkowe pobieranie | Najpierw menu i pierwsze sektory; docelowy budżet określić po próbce jakościowej |
| Cały release | Roboczy cel <=150 MiB dla rozszerzonej zawartości; przekroczenia muszą mieć podział i decyzję, nie ukryte pominięcie modeli |
| Dynamiczna destrukcja | Lokalne zmiany; brak pełnej przebudowy całej nawigacji i wszystkich colliderów po pojedynczym uderzeniu |

Te wartości są budżetami projektowymi, nie danymi historycznymi ani certyfikatem wydajności. Wzrost względem starego celu wielkości release uzasadnia nowa zawartość, ale nie zwalnia z usunięcia duplikatów tekstur, modeli i dokumentów.

### 21.3. Profilowanie

Scenariusze: HQ, wyjście oddziału, największe natarcie, dwa czołgi strzelające różnymi stanowiskami, bateria, nalot nad ruinami, SP01/SP02, szeroki widok frontu, finał, checkpoint/load i 10 cykli start–menu.

Raport obejmuje medianę/p95/p99 klatki, CPU symulacji i renderu, GPU przy dostępnym pomiarze, aktywne szkielety, draw calle, liczbę zapytań percepcji i nawigacji, opóźnienie kolejki, pule efektów, głosy audio, heap oraz pamięć assetów. Brak GPU timer query oznacza „brak pomiaru”, nie GPU=0.

Porównania A/B prowadzić na tej samej scenie, trasie, seedzie, rozdzielczości i ustawieniach po rozgrzaniu, co najmniej w trzech powtórzeniach. Cała nowa mapa może być porównana użytkowo ze starą, ale nie jest kontrolowanym A/B samego renderera.

### 21.4. Kolejność optymalizacji

Najpierw: usunięcie pełnych przeglądów i niepotrzebnych alokacji, indeksy przestrzenne, budżety nav/percepcji, właściwe LOD i próbkowanie animacji, sektory renderu, pule i limity audio. Następnie dopiero dodatkowa równoległość potwierdzona pomiarem.

Nie ratować wyniku wyłączaniem kolizji ruin, zmniejszaniem liczby obrońców na Low lub usuwaniem wybuchów. Jeśli scena przekracza budżet, ograniczyć zbędne nakładanie scen i kosmetyczne detale, a zakres logiczny poprawić przez strukturę misji i symulacji.

---

## 22. Kolejność realizacji i zadania wykonawcze

### 22.1. Zasady przechodzenia przez plan

Wszystkie zadania poniżej są otwarte. Żaden wiersz nie opisuje wykonanej w tej sesji implementacji. Dla każdej zmiany kontraktu: najpierw scenariusz odtwarzający problem lub oczekiwaną regułę, potem kod, następnie regresje. Zmiana zachowania wymaga wpisu do odpowiedniego rozdziału `PROJECT.md`.

Końcowy wynik etapu ma być uruchamialny. Refaktor nie pozostawia na kilka etapów dwóch aktywnych ścieżek walki lub zapisu. Przejściowy adapter jest dopuszczalny w ramach zadania, ale ma datę usunięcia rozumianą jako zależny etap, nie obietnicę „kiedyś”.

Do każdego wyniku przypisać: SHA, zakres, polecenie/scenariusz, środowisko, wynik, ograniczenia i odnośnik do dowodu. Kod istnieje ≠ test przeszedł ≠ wizualnie odebrane ≠ gotowe do wydania.

### E00 — przyjęcie faktycznej bazy

**Zależności:** brak.  
**Pliki:** `package.json`, istniejące źródła metadanych wersji, `README.md`, `src/`, `tests/`, `tools/`, obecny plan i aktywne manifesty.  
**Wynik:** ustalona baza 0.4.5 rew2 lub jawnie nowsza baza dostarczona przez użytkownika.

- [ ] **E00.1** Potwierdzić aktualny branch i SHA bez tworzenia nowego brancha/worktree. Porównać stan z SHA tego audytu i opisać różnice, które wpływają na plan.
- [ ] **E00.2** Uruchomić `npm run check`, `npm test`, `npm run build`; zapisać faktyczne błędy. Zrobić przejście misji i próbę zgłoszonego bombardowania w przeglądarce.
- [ ] **E00.3** Zebrać bazę jakościową i wydajnościową: oddział/rush, czołgi, nalot, chwilę z checkpointem, HUD i 10 cykli sesji. Zinwentaryzować źródła assetów oraz aktywne narzędzia.

**Test odbioru:** każdy błąd wejściowy ma reprodukcję lub adnotację „nie odtworzono”; raport nie przypisuje obecnej sesji wyników ze starego dokumentu. Nie trzeba naprawiać z góry całej starej misji, ale żaden istniejący problem nie może zniknąć przez zmianę nazwy testu.

### E01 — dokumentacja i fundament utrzymania testów

**Zależności:** E00.  
**Pliki:** `docs/PROJECT.md` (nowy), `README.md`, `tools/build.mjs`, odpowiednie widoki Credits, `package.json`, testy builda i linków.  
**Wynik:** jedno źródło dokumentacji, działający build i jawny zestaw testów.

- [ ] **E01.1** Scalić obowiązujące wymagania, architekturę, historię i aktywne problemy; usunąć potwierdzony duplikat planu 0.4.5 po przeniesieniu potrzebnych treści.
- [ ] **E01.2** Przepiąć build/Credits/PL/EN na właściwe dane i sekcje, pozostawiając wymagane licencje. Sprawdzić wszystkie publikowane odnośniki.
- [ ] **E01.3** Wprowadzić inwentaryzację i stabilne uruchamianie testów domenowych. Na tym etapie zmieniać organizację, nie usuwać dowodów złożonych systemów przed ich migracją.

**Test odbioru:** build z pustego `dist` działa, Credits nie prowadzą do usuniętych plików, runner wykrywa oczekiwaną liczbę testów i kończy się błędem dla pustej wymaganej grupy. Repozytorium nie dostaje równoległego nowego spec/plan/report dla tego samego wydania.

### E02 — neutralny refaktor oraz koalicje

**Zależności:** E01.  
**Pliki:** `src/core/simulation.js`, `src/ai/soldier.js`, `src/missions/director.js`, `src/combat/ballistics.js`, pojazdy, HUD/statystyki, nowe `events.js`, `entity-index.js`, `allegiance.js`.  
**Wynik:** czytelniejsze granice bez utraty działania starego scenariusza.

- [ ] **E02.1** Wydzielić własność zdarzeń i indeks encji. Zastąpić sprawdzanie rodzaju źródła przez prefiks ID jawnym profilem; rozdzielić gwarantowany stan od odrzucalnych efektów.
- [ ] **E02.2** Wprowadzić nationality/coalition i przepiąć wszystkich konsumentów. Dodać sztuczną scenę UK+FR+US przeciw DE jeszcze na zastępczych modelach.
- [ ] **E02.3** Wydzielić sterowanie sesją, aktualizację systemów i fasady renderu/audio bez zmiany reguł fizyki. Przestać dopisywać zależności misji do żołnierza i uzbrojenia.

**Test odbioru:** stare istotne scenariusze nadal działają, sojusznicy różnych narodowości nie atakują się nawzajem, reakcje/damage/minimapa/save są zgodne. Celowe usunięcie wymaganej relacji powoduje walidowany błąd, nie domyślny ostrzał.

### E03 — nowe definicje misji i podstawowy format save

**Zależności:** E02.  
**Pliki:** `src/missions/cambrai/definition.js`, `objectives.js`, `forces.js`, nowy graf; `src/save/schema.js`, adapter snapshotu, dane mapy.  
**Wynik:** wersjonowane definicje bez twardych ograniczeń starego scenariusza.

- [ ] **E03.1** Wprowadzić stabilne ID celów, sektorów, jednostek i zniszczeń, walidację referencji oraz rozdzielenie definicji od runtime.
- [ ] **E03.2** Dodać początkową wersję nowego formatu save: aktywne pociski, koalicje, cele po ID i dopuszczalne jednostki z manifestu misji. Podnieść wersje według §18.
- [ ] **E03.3** Zaimplementować czytelne odrzucenie starego checkpointu bez resetowania ustawień; dodać test odtworzenia RNG i terminalnego stanu misji.

**Test odbioru:** mała scena testowa z FR/US, dodatkowym pojazdem i lecącym pociskiem zapisuje się i odtwarza; nieznane ID/nieprawidłowy stan są odrzucane. Przyszłe systemy rozszerzają ten format w swoich etapach, nie odkładają zapisu do samego końca.

### E04 — cała misja w uproszczonej geometrii

**Zależności:** E03.  
**Pliki:** mapa Cambrai, `trench-network.js`, teren/layout/collision, nawigacja, graf celów, definicje obsady i tras.  
**Wynik:** pełny przebieg M01–M12 na nowej przestrzeni, bez finalnego dekorowania.

- [ ] **E04.1** Zbudować główne strefy S0–S8, trzy pasy działań i portale. Usunąć `northZ` po migracji wszystkich konsumentów. Ustalić rzeczywiste szerokości przejść.
- [ ] **E04.2** Wpiąć 12 celów, obie kolejności M06/M07, cztery cele poboczne, alternatywę bez czołgów i osiem planowanych stref checkpointów.
- [ ] **E04.3** Przejść całość rzeczywistym kontrolerem, zmierzyć długość i tempo, odrzucić puste odcinki. Sprawdzić scenariusz bez konkretnego dowódcy i bez wsparcia pancernego.

**Test odbioru:** misja kończy się bez ręcznego ustawiania pozycji i faz; żaden odcinek nie wymaga nieplanowanego skoku po dekoracjach. Brak całego oddziału lub wcześniejsze uciszenie działa nie powoduje softlocka. Graf i nawigacja nie są uzależnione od końcowej siatki artystycznej.

### E05 — oddział gracza i rozdzielony front

**Zależności:** E04.  
**Pliki:** `src/ai/squad.js`, `perception.js`, `tactics.js`, nawigacja, `src/battle/`, dane sił; wejście i minimalny HUD rozkazów.  
**Wynik:** gracz ma własną sekcję, a inne wojska wykonują zadania sektorowe.

- [ ] **E05.1** Wdrożyć stały skład, formacje, trzy polecenia, rezerwacje przejść/osłon, osłanianie i przekazanie istotnej roli po stracie kompana.
- [ ] **E05.2** Wdrożyć rozkazy sektorowe, granice pościgu, warunki natarcia/odwrotu i skończone rezerwy. Usunąć dotychczasową globalną funkcję `squadGoal` po przepięciu zachowań.
- [ ] **E05.3** Dodać poziomy istotności symulacji, zachowanie stanu przy przejściach i lokalne indeksy/budżety. Zacząć od 48–64 pełnych NPC, dopiero potem zwiększać obsadę.

**Test odbioru:** 10-minutowa trasa oddziału bez teleportów i trwałych blokad, scena równoczesnego natarcia/obrony/odwrotu na trzech odcinkach, śmierć i powrót do dalekiego sektora bez odrodzenia jednostek. Zmiana celu gracza nie anuluje tras wszystkich obcych pododdziałów.

### E06 — pełne uzbrojenie i współpraca pancerna

**Zależności:** E05.  
**Pliki:** `tank.js`, `weapon-mounts.js`, `vehicle-damage.js`, `field-gun.js`, balistyka, definicje tras, snapshot, metadane modelu.  
**Wynik:** pojazdy i działa walczą według swoich możliwości oraz zadania.

- [ ] **E06.1** Wdrożyć niezależne mounty, amunicję, ograniczenia obsługi i uszkodzenia; podpiąć fizyczne wyloty i kierunki ognia.
- [ ] **E06.2** Wdrożyć pozycje wsparcia, zatrzymanie przed zagrożeniem, ograniczone cofnięcie i współpracę z piechotą; usunąć wybór zachowania wyłącznie z fazy i kolejnej współrzędnej.
- [ ] **E06.3** Rozbudować baterię, poprawić indywidualną neutralizację i obsadę, zapisać stany; zastąpić stare warunki `z>57` oraz globalne zaliczenie wszystkich dział.

**Test odbioru:** oba sponsony obsługują różne cele z własnym cooldownem; awaria lewego działa nie wyłącza prawego i MG; czołg może zostać unieruchomiony prawdziwym pociskiem; przejście piesze nadal działa po stracie obu pojazdów. Nie wymagać pełnych finalnych materiałów, ale odrzucić błędne punkty montażu.

### E07 — naloty i destrukcja związane z symulacją

**Zależności:** E06.  
**Pliki:** `air-support.js`, balistyka, profile efektów, pule, system zniszczeń, `set-piece-director.js`, collidery/nav, snapshot.  
**Wynik:** widoczne bombardowanie i przygotowane otwieranie/zamykanie przejść.

- [ ] **E07.1** Odtworzyć zgłoszenie braku wybuchów; wprowadzić pełną identyfikowalność lotu bomby i powodu jej usunięcia. Usunąć potwierdzoną przyczynę, nie nakładając drugiego `blast`.
- [ ] **E07.2** Wdrożyć profile eksplozji i priorytety puli, rzeczywisty zrzut oraz skończone okna nalotów. Sprawdzić widoczność na wszystkich presetach.
- [ ] **E07.3** Wdrożyć stany obiektów, atomową zmianę kolizji/nav i sceny SP01–SP06 z przerwaniem, obejściem oraz zapisem. Rozszerzyć snapshot o nowe stany.

**Test odbioru:** jedna bomba daje jeden wynik obrażeń i jedno zdarzenie uderzenia, ważny wybuch pozostaje czytelny przy pełnej puli, zawalony dom ma zgodną geometrię logiczną, load nie powtarza sceny. Czołg zniszczony przed SP01 nie oddaje niewidzialnego pocisku.

### E08 — obowiązkowy wzorcowy fragment jakości

**Zależności:** E07; może korzystać z równoległego przygotowania źródeł art/audio, ale nie omija integracji.  
**Pliki/zasoby:** jeden finalny brytyjski żołnierz, broń + dłonie FPS, Mark IV, moduł okopu i domu; adaptery animacji, próbka banku audio i efekt bomby.  
**Wynik:** 90–120 sekund reprezentatywnej rozgrywki w docelowej jakości.

- [ ] **E08.1** Wyprodukować przez zweryfikowany workflow Blender ciało bez zaszytej broni, chwyt, podstawowe klipy oraz mechanikę FPS. Odebrać proporcje, eksport i kontakt dłoni.
- [ ] **E08.2** Uruchomić obie gąsienice i stanowiska Mark IV, fragment zawalenia domu oraz nalot z finalnym jakościowo wybuchem. Dodać nagraną broń, kroki, silnik i wybuch.
- [ ] **E08.3** Przejść fragment z oddziałem, pauzą, load, zmianami LOD i kilkoma presetami. Zmierzyć koszt i ocenić obraz/dźwięk przez człowieka.

**Test odbioru:** widoczna poprawa całego połączenia, nie tylko screenshot jednego modelu. Brak przenikającego karabinu, stojących gąsienic, znikającego wybuchu i mechanicznego reloadu z dawnej ścieżki. Nie produkować masowo pozostałych wariantów przed odbiorem tego kontraktu.

### E09 — pełna produkcja modeli i nowej przestrzeni

**Zależności:** E08.  
**Pliki/zasoby:** cały katalog modeli/tekstur, źródła Blender, manifesty authoringu/runtime, właściwe adaptery, komplet sektorów i stanów zniszczeń.  
**Wynik:** wszystkie rodziny §15 dostępne i użyte w grze.

- [ ] **E09.1** Dokończyć brytyjskie i niemieckie warianty, nowe FR/US i ich uzbrojenie, kompanów, role medyczne/inżynieryjne oraz animacje użycia sprzętu.
- [ ] **E09.2** Dokończyć działo, samoloty, otoczenie, rekwizyty celów i wszystkie wymagane stany zniszczeń. Ujednolicić materiały i wygląd terenu.
- [ ] **E09.3** Wymienić tymczasową geometrię w sektorach i po każdej rodzinie powtórzyć przechodniość, widoczność i pełne wymiary. Usunąć zastąpione proceduralne kopie i generatory dopiero po walidacji eksportu.

**Test odbioru:** każdy wpis macierzy ma komplet eksportów, źródło, LOD i demonstrację w misji. Francuzi i Amerykanie działają jako realne jednostki w M06/M07 i po nich. Brak obowiązkowej rodziny blokuje zamknięcie etapu.

### E10 — kompletne audio i scenariusz po integracji

**Zależności:** E09, fundament audio z E08.  
**Pliki:** `src/audio/`, bank i źródła, dane dialogów/PL/EN, zdarzenia działań, definicje misji i końcowe ustawienia wsparcia.  
**Wynik:** cały poziom ma spójną oprawę i zamierzony rytm.

- [ ] **E10.1** Zastąpić wszystkie obowiązkowe grupy audio, wdrożyć miks, wirtualizację źródeł, przestrzeń i synchronizację mechaniki.
- [ ] **E10.2** Dokończyć krótkie komendy, ostrzeżenia i wszystkie napisy PL/EN, w tym zastępcze meldunki po stracie istotnych postaci.
- [ ] **E10.3** Przejść misję od początku do końca z finalną obsadą, odnotować odcinki pustego biegu i nadmiernego tłoku; skorygować cele, osłony i okna wsparcia bez redukcji do dawnego rushu.

**Test odbioru:** broń i pojazdy nie mają pozostałych dawnych tonów jako głównego dźwięku, zagrożenia są rozpoznawalne w pełnym miksie, czas przejścia wynika z zawartości. Pełny dubbing pozostaje opcjonalny i nie maskuje braków podstawowego audio.

### E11 — finalizacja save i odporność sesji

**Zależności:** E10; testy podstawowego save obowiązywały także w poprzednich etapach.  
**Pliki:** `src/save/`, lifecycle aplikacji, systemy posiadające stan i zadania asynchroniczne.  
**Wynik:** długą misję można bezpiecznie przerwać i kontynuować.

- [ ] **E11.1** Zrobić save/load przed, w trakcie i po krytycznych sytuacjach: aktywne pociski w dalszym sektorze, ranny kompan, zrzut bomby, zniszczenie domu, unieruchomienie czołgu i wejście rezerw.
- [ ] **E11.2** Sprawdzić odtwarzalność istotnego stanu przy tej samej sekwencji wejść, wersje misji, nieznane ID i uszkodzone dane; zachować ustawienia po odrzuceniu 0.4.x.
- [ ] **E11.3** Powtórzyć anulowanie importu, audio i workera, pauzę, blur, 10 cykli menu oraz powrót po restarcie przeglądarki. Usunąć wycieki i przechwytywanie zdarzeń starej sesji.

**Test odbioru:** checkpoint nie oczekuje na globalną ciszę, load nie powiela eksplozji/scen, a rezerwy i zniszczenia nie resetują się. Brak udokumentowanego przejścia tej bramki blokuje wydanie niezależnie od jakości grafiki.

### E12 — optymalizacja i końcowe sprzątanie

**Zależności:** E11.  
**Pliki:** zmierzone punkty kosztu, `src/performance/`, benchmark/browser runner, stare narzędzia, testy, manifesty i dokumentacja.  
**Wynik:** ustabilizowany koszt oraz usunięte faktycznie zastąpione rzeczy.

- [ ] **E12.1** Zmierzyć scenariusze §21 na uzgodnionym sprzęcie. Optymalizować indeksy, budżety, LOD, audio i sektory według pomiarów; nie wprowadzać losowych zmian parametrów.
- [ ] **E12.2** Zamknąć tabelę keep/merge/rewrite/delete: usunąć zastąpione testy kontraktów, jednorazowe skrypty, stare generatory i martwe adaptery. Zweryfikować kompletność eksportów po sprzątaniu.
- [ ] **E12.3** Odświeżyć jedną dokumentację: aktualna architektura, działające polecenia, status odbioru, aktywne ograniczenia i krótka historia. Usunąć linki i instrukcje do nieistniejących narzędzi.

**Test odbioru:** wyniki nie pogarszają reguł gameplayu, tester widzi jawną listę wykonywanych grup, clean build nie korzysta z plików pozostawionych lokalnie przez dawny generator. Raportuje się wyniki i braki, nie sam średni FPS z pustego sektora.

### E13 — balans, regresje i przygotowanie wydania

**Zależności:** E12.  
**Pliki:** finalne dane trudności/scenariusza, testy, metadane wersji, dokumentacja, build i istniejący workflow publikowania.  
**Wynik:** kandydat do wydania 0.5.0, bez automatycznego upoważnienia do publikacji.

- [ ] **E13.1** Wykonać serie seedów i ludzkie przejścia na trzech trudnościach, w tym bez czołgów, po stracie dowódcy i z pominiętymi celami pobocznymi. Potwierdzić rytm oraz czytelność przyczyn porażki.
- [ ] **E13.2** Uruchomić całą macierz regresji, normalny origin HTTP, Firefox/Chromium/Edge, root i `/ziemianiczyja/`; sprawdzić względne assety, Credits, MIME, konfigurację domeny i brak śmieci w `dist`.
- [ ] **E13.3** Ustawić 0.5.0 w rzeczywistych punktach metadanych, zapisać krótką historię i znane ograniczenia w `PROJECT.md`, zbudować artefakt i przedstawić wynik odbioru. Publikacja/commit/push tylko w zakresie osobnego polecenia użytkownika.

**Test odbioru:** spełniona macierz §23 i warunki §24, bez obowiązkowych TODO zastąpionych opisem. Nie ogłaszać zakończenia pełnej wersji, gdy dostarczono wyłącznie nowy blok poziomu, jeden model albo częściowy refaktor.

### 22.2. Zależności w skrócie

```text
E00 baza
 └─ E01 dokumentacja + testy
     └─ E02 architektura + koalicje
         └─ E03 definicje + format save
             └─ E04 pełny blok mapy + graf
                 └─ E05 oddział + pole bitwy + skala
                     └─ E06 czołgi + działa
                         └─ E07 naloty + zniszczenia
                             └─ E08 próbka finalnej jakości
                                 └─ E09 wszystkie modele + mapa
                                     └─ E10 audio + pełny przebieg
                                         └─ E11 finalny save + lifecycle
                                             └─ E12 wydajność + cleanup
                                                 └─ E13 balans + release candidate
```

Prace nad referencjami artystycznymi, źródłami audio i prostymi testami mogą być wykonywane równolegle, ale pełna produkcja zależna od rigów/socketów nie wyprzedza E08. Nie przenosić workerów, źródeł Blender ani kosztownych zakupów poza jawnie ustalony zakres.

---

## 23. Macierz odbioru

Wynik każdej pozycji: `NIE WYKONANO`, `NIE SPEŁNIA`, `SPEŁNIA` lub `NIE DOTYCZY` z uzasadnieniem. Domyślnie wszystkie poniższe pozycje mają status **NIE WYKONANO**.

| ID | Scenariusz | Kryterium |
|---|---|---|
| Q01 | Start z czystego checkoutu | check/test/build działają według jednego podręcznika, bez lokalnych brakujących źródeł |
| Q02 | Odprawa i wyjście | Fizyczne drzwi, skip i sterowanie działają, brak blokady przez kompanów |
| Q03 | Pełna misja | M01–M12 ukończone realnym ruchem, z zapisami i bez ręcznej edycji faz |
| Q04 | Czas i zawartość | Docelowy rząd 35–50 min wynika z różnorodnych działań, nie pustych marszów i długich timerów |
| Q05 | Alternatywna kolejność | M06/M07 w obu kolejnościach, wcześniejsze neutralizacje nie cofają się |
| Q06 | Cele poboczne | Każdy z czterech daje zapowiedziany, zapisany skutek i nie jest potajemnie wymagany |
| Q07 | Oddział | Czterech rozpoznawalnych kompanów; follow/hold/rally, mijanie, osłanianie i stany rannych |
| Q08 | Straty osobowe | Utrata Hughesa/Bennetta/inżynierów nie blokuje obowiązkowych interakcji |
| Q09 | Bez czołgów | Oba główne pojazdy zniszczone przed wsią, misja nadal ukończalna |
| Q10 | Struktura frontu | Równoczesne różne stany sektorów, brak globalnego rushu po zmianie celu |
| Q11 | Rezerwy | Skończony skład, fizyczne drogi wejścia, brak odradzania po odwróceniu kamery |
| Q12 | Warstwy symulacji | Zachowane ID, HP, amunicja i straty; trafienie z daleka nie trafia w pozorny, nieinteraktywny model |
| Q13 | Koalicje | FR/US/UK zgodne w AI, obrażeniach, osłonach, statystykach, minimapie i save |
| Q14 | Boczne armaty | Niezależne cykle i cele; brak strzałów poza sektor i przez własny kadłub |
| Q15 | Wszystkie stanowiska | Wszystkie rzeczywiste mounty przyjętego Mark IV działają w odpowiednich sytuacjach |
| Q16 | Uszkodzenia pojazdu | Unieruchomienie nie oznacza automatycznej śmierci uzbrojenia; uszkodzenia mountów są niezależne |
| Q17 | Działa niemieckie | Mogą zatrzymać pojazd i mają flankę dla piechoty; obsługa/neutralizacja zgodne po load |
| Q18 | Bombardowanie | Samolot, zrzut, lot, trafienie i widoczny wybuch z właściwej pozycji |
| Q19 | Limit efektów | Bliski wybuch nie znika na Low i przy pełnej puli; gameplay identyczny |
| Q20 | SP01/SP02 | Dom zawala się po działaniu broni, czołg przełamuje przygotowane umocnienie, przejścia są rzeczywiste |
| Q21 | Warianty scen | Martwy wykonawca, zajęta trasa i wcześniejsze zniszczenie mają obsłużone obejścia |
| Q22 | Assety | Komplet macierzy, nie tylko część eksportów; rzeczywiste modele FR/US widoczne w grze |
| Q23 | Animacje | Brak broni w torsie, nieprawidłowych chwytów i zastępczego obrotu całego ciała do prone |
| Q24 | Gąsienice | Obie strony zgodne z ruchem, skrętem, zatrzymaniem, cofaniem i uszkodzeniem |
| Q25 | Audio | Właściwe efekty broni, pojazdów, kroków i bomb; odsłuch pełnej bitwy |
| Q26 | Zapis aktywnego świata | Save/load przy działaniu frontu, bez globalnego wymagania pustej listy pocisków |
| Q27 | Odtwarzanie | Brak podwójnych wybuchów, rezerw, zawaleń i meldunków; RNG i postęp zachowane |
| Q28 | Wersje i ustawienia | Stary checkpoint odrzucony z wyjaśnieniem, ustawienia użytkownika pozostają |
| Q29 | Lifecycle | Pauza, blur, menu w trakcie load, późny worker/audio i 10 restartów bez narastających zasobów |
| Q30 | Trudność | Trzy profile, serie kontrolowane i ludzki odbiór; brak gąbek i śmierci bez czytelnego źródła |
| Q31 | Render FPS | 30/60/120/144 Hz oraz opóźnione klatki nie zmieniają zasad ruchu i broni |
| Q32 | PL/EN i HUD | Wszystkie nowe treści, istniejące skalowanie i napisy, brak regresji rew2 |
| Q33 | Hosting | Root, `/ziemianiczyja/`, właściwe assety/MIME i odnośniki Credits |
| Q34 | Wydajność | Metryki z §21 na opisanym sprzęcie; brak nieujawnionego braku pomiaru GPU |
| Q35 | Cleanup | Usunięte zastąpione testy i narzędzia, zachowane regresje, brak martwych assetów i równoległych ścieżek |
| Q36 | Dokumentacja | Jeden aktualny podręcznik, brak sprzecznych aktywnych planów/raportów i zepsutych linków |

---

## 24. Ryzyka, ograniczenia i warunki wydania

### 24.1. Rejestr ryzyk

| Ryzyko | Wczesny sygnał | Przeciwdziałanie |
|---|---|---|
| Większa mapa pozostaje tą samą krótką grą | Większość czasu to bieg między identycznymi punktami | Odbiór E04 przed finalną dekoracją, różne mechaniki i skrzydła |
| Refaktor zmienia zbyt wiele naraz | Stara gra przestaje działać przed przyjęciem nowych kontraktów | Neutralny E02, małe granice odpowiedzialności, test przed zmianą |
| Wzrasta koszt AI | Pełne sortowania i kolejki bez limitu wieku | Indeksy, budżety, sektory i próba obciążeniowa przed masową obsadą |
| Odległe jednostki są atrapami w zasięgu strzału | Brak reakcji na pocisk lub zmiana HP po zbliżeniu | Promocja według możliwości interakcji, zachowanie ID/stanu |
| Czołgi nadal wykonują zadanie za gracza | Po kilku minutach puste kolejne sektory | Rozkazy wsparcia, sektory, baterie, ograniczona wiedza, nie nerf HP |
| Oddział blokuje ruch lub znika | Drzwi zatkane, powtarzane recovery, duże skoki pozycji | Formacje, portale, ustępowanie, rezerwacje, brak teleportu jako podstawy |
| Filmowe wydarzenie blokuje misję | Oczekiwanie na martwego aktora albo brak pojazdu | Jawne preconditions i obejścia, test wszystkich strat wykonawców |
| Bomby są logicznie groźne, ale niewidoczne | Brak przydziału efektu przy pełnej puli | Telemetria łańcucha oraz rezerwa minimalnego feedbacku |
| Checkpoint nigdy nie powstaje | Ciągle aktywne pociski w innym sektorze | Lokalna ocena bezpieczeństwa i pełny zapis pocisków |
| Nowe nacje psują sojusze | FR jest aliantem na mapie i wrogiem w damage | Jedno API relacji, test przekrojowy wszystkich konsumentów |
| Sprzątanie usuwa wiedzę i licencje | Testów „mniej i zielono”, Credits 404 | Mapowanie testów, kontrola linków, zachowanie wymaganej atrybucji |
| Nowy generator nadpisuje finalne modele | Po regeneracji wraca stara piechota | Manifest właścicieli, staging, hashe i odtwarzalny eksport |
| Dokument znowu się rozrasta w wiele wersji | Kolejne PLAN_REW i IMPLEMENTATION_REW | Aktualizacja jednej sekcji, raporty jako artefakty, historia w Git |
| „Realizm” sugeruje fałszywą rekonstrukcję | Opis wspólnego szturmu bez źródeł | Jawna fabularyzacja składu i rozdzielenie faktów od projektu |

### 24.2. Rzeczy opcjonalne po odbiorze podstawy

Pełny dubbing, większa liczba wariantów twarzy, dodatkowe odległe sceny frontu, kolejny typ Mark IV, bardziej rozbudowane dopasowanie stóp i bogatsza fizyka drobnego gruzu mogą być rozszerzeniami. Nie należą do warunków zastępujących podstawy.

Nie są opcjonalne: działający oddział, nowe FR/US w misji, większa mapa z dodatkowymi celami, przebudowane zachowanie frontu, wszystkie stanowiska przyjętego czołgu, widoczne bombardowania, sceny destrukcji z kolizją, komplet wymaganych rodzin modeli, główne audio, save i konsolidacja dokumentacji.

### 24.3. Definicja ukończenia 0.5.0

Wydanie jest gotowe dopiero wtedy, gdy cała misja jest grywalna w docelowej oprawie, ma nowy rytm oraz skalę, oddział współpracuje, front zachowuje strukturę, czołgi potrzebują piechoty, a nowe nacje i naloty faktycznie uczestniczą w wydarzeniach. Utrata wykonawcy lub pojazdu nie zamyka gry. Zapis przywraca bitwę, nie tylko współrzędne gracza.

Kod nie ma aktywnych równoległych odpowiedników starego i nowego systemu. Testy pilnują aktualnych zachowań, a nie nieaktualnej liczby kości. Dokumentacja ma jedno źródło i zgadza się z buildem. Wszystkie niewykonane próby oraz rzeczywiste ograniczenia są jawnie zapisane.

Nie wystarcza: kompilacja/build, samo istnienie klas nowych dyrektorów, plansza 600 × 1200 m bez treści, folder nowych modeli bez integracji, licznik 200 NPC, test `explosion` bez widocznego wybuchu ani jedna ładna scena z niesprawną resztą misji.

---

## 25. Źródła oraz zakres dowodów

### 25.1. Źródła repozytorium

Wszystkie poniższe pliki lub ich wskazane obszary odczytano względem tego samego commitu:

`9e393c6d8ea341864c955ab53c997430ea7d9668`

Adres pliku można zbudować jako:

```text
https://github.com/Mentiuszen/ziemianiczyja/blob/9e393c6d8ea341864c955ab53c997430ea7d9668/<ścieżka>
```

| Klucz | Plik / źródło | Do czego wykorzystano |
|---|---|---|
| K01 | `package.json` | Wersja, UI revision, Node, skrypty i discovery testów |
| K02 | `tools/build.mjs` | Statyczny build, wersja runtime w manifeście, kopiowanie dokumentów |
| K03 | `README.md` | Aktualny zakres, oznaczenie misji i zachowane funkcje wydań |
| K04 | `docs/plans/V0_5.md` | Stary plan, jego baza, pełny zakres modeli/audio/mapy i produkcji |
| K05 | `src/data/world-map.js` | Rozmiar, granice, `northZ`, wersja misji |
| K06 | `src/data/cambrai.js` | Cele, skład, postacie, trasy i dostępność kampanii |
| K07 | `src/ai/soldier.js` | Percepcja, stany lokalne, `squadGoal`, relacje i ustępowanie |
| K08 | `src/missions/director.js` | Globalne fazy, cele, checkpointy, interakcje i zakończenie |
| K09 | `src/vehicles/field-gun.js` | Obsługa działa, ostrzał czołgów, zależności współrzędnych/faz |
| K10 | `src/vehicles/air-support.js` | Loty, zrzut, trajektoria, trafienie i TTL |
| K11 | `src/combat/ballistics.js` | Obrażenia, eksplozje, supresja, relacje i statystyki |
| K12 | `src/render/effects.js` | Profile obecnych efektów, limit puli, obsługa `explosion` |
| K13 | `src/core/simulation.js` | Tick, kolejka zdarzeń, damage, zapis i restore RNG |
| K14 | `src/audio/audio.js` | Proceduralne audio, źródła i lifecycle |
| K15 | `src/render/view.js` | Animacje, stance, broń FPS, czołgi i granice prezentacji |
| K16 | `docs/ARCHITECTURE.md` | Deklarowane kontrakty i rozbieżność warstw opisu |
| K17 | `tests/characters-v02.test.mjs` | Sztywne i wartościowe asercje wymagające rozdzielenia |
| K18 | Drzewo `docs/` i `docs/plans/` w tej rewizji | Rozproszenie dokumentów, identyczny blob dwóch planów 0.4.5 |
| K19 | Drzewo `tools/` w tej rewizji | Rodziny historycznych runnerów, generatorów i sond |
| K20 | Drzewo `tests/` w tej rewizji | Podział według dawnych wersji i aktywne rodziny testów |
| K21 | `src/save/schema.js` | SAVE_VERSION, limity liczby/narodowości/ID i stare zakresy mapy |
| K22 | `src/vehicles/tank.js` | Wspólny cooldown dział, przedni MG, ruch, uszkodzenia i pociski |

Dwa dokumenty planu 0.4.5 mają wspólny blob:

`df1475127393cbbee62977ce9e16cbba70c35314`

Są to `docs/V0_4_5_PLAN.md` oraz `docs/plans/V0_4_5.md`. Potwierdzenie identyczności dotyczy tej rewizji, nie dowolnej przyszłej wersji gałęzi.

### 25.2. Referencje historyczne

**H01 — The Tank Museum, „The Battle of Cambrai: Graincourt”, 22 listopada 2017.** Użyte jako potwierdzenie niemieckich dział 7,7 cm w roli przeciwpancernej i zależności czołgów od sytuacji taktycznej. Projekt nie kopiuje dokładnego przebiegu tej walki.

`https://tankmuseum.org/graincourt/`

**H02 — U.S. Army Center of Military History, „World War I Campaigns”, część o Cambrai.** Użyte w ograniczonym zakresie do obecności amerykańskich pułków inżynieryjnych za brytyjskimi liniami i ich wejścia do walki podczas kryzysu. Nie stanowi potwierdzenia fikcyjnego wspólnego szturmu z Francuzami.

`https://history.army.mil/Research/Reference-Topics/Army-Campaigns/Brief-Summaries/World-War-I/`

**H03 — American Battle Monuments Commission, „U. S. Engineers’ Life at the Front: First, American Combat Casualties of World War I”.** Uzupełniające źródło kontekstu amerykańskich inżynierów przy froncie.

`https://www.abmc.gov/news-events/news/u-s-engineers-life-front-first-american-combat-casualties-world-war-i/`

**H04 — War Heritage Institute, „British Mark IV ‘Lodestar III’ tank”.** Dane uzbrojenia egzemplarza: dwie armaty 6-funtowe i trzy karabiny Lewis. Szczegółowe osie mocowań i wygląd należy potwierdzić na referencjach podczas produkcji assetu.

`https://warheritage.be/en/british-mark-iv-lodestar-iii-tank`

### 25.3. Czego ten dokument nie dowodzi

Nie dowodzi, że obecna gra osiąga wskazane FPS, że zgłoszony brak wybuchu ma już odtworzoną przyczynę, że nowe modele istnieją, że Blender jest połączony ani że testy przeszły. Parametry mapy, długości misji, liczby aktorów, budżetów i kolejności celów są propozycją projektu przygotowaną na podstawie odczytanej bazy.

Ten plik jest kompletnym planem nowego zakresu 0.5.0. Nie zmodyfikowano nim repozytorium, nie usunięto testów i nie opublikowano gry.
