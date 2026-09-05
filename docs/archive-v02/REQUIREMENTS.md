# Rejestr wymagań — master prompt → v0.2

Statusy: **Z** — zaimplementowane i zweryfikowane wskazanym testem; **I** — implementacja istnieje, pełny odbiór jeszcze nieprzeprowadzony; **P** — prototyp / częściowo; **N** — nadal planowane. Z nie oznacza automatycznie kompletnego spełnienia całej sekcji. Numery sekcji odnoszą się do `MASTER_PROMPT.md`.

| ID / wymaganie | Moduł lub zasób | Etap docelowy | Dowód / brak | Status |
|---|---|---|---|---|
| 1–2: kompletna pięciomisyjna gra | data/cambrai, director | 4–5 | Działa tylko krótki Cambrai; cztery mapy nie istnieją | P |
| 3: HTML/CSS/JS + WebGL2 + Babylon | app, render, vendor | 0 | Import 8 GLB i działający renderer Chromium | Z |
| 3: Vite i oficjalny lock zależności | package, tools | 0 | Brak sieci npm; tymczasowy build Node, lock bez zależności | P |
| 3: npm ci/dev/build/preview/test | package, tools | 0 | Uruchomione komendy; szczegóły w raporcie | Z |
| 3: statyczne ścieżki root/repo, brak CDN | import.meta.url, build | 0 | HTTP i routowane testy produkcyjnego dist | Z |
| 3: Pages Actions bez gh-pages | .github/workflows/pages.yml | 0 | Przygotowany workflow, nie uruchomiony na GitHub | I |
| 4: realia / źródła / fikcja | docs/HISTORY, data | 0–5 | Zweryfikowane tło Cambrai; detale modeli wymagają audytu | P |
| 5: pięć odmiennych misji, chronologia | data/cambrai | 4 | Tylko metadane czterech planowanych misji | N |
| 5: misja pokazowa ma początek i koniec | director, ui | 3 | Normal-input autoplay kończy 6 etapów | Z |
| 5: 12–20 minut i docelowa dramaturgia | mapa + reżyser | 3 | Krótki prototyp, brak ręcznego pomiaru przejścia | N |
| 5/17: dwa checkpointy | director, save | 1–3 | Autoplay tworzy i odtwarza oba snapshoty | Z |
| 6: PL, fikcyjne postacie, bez wymogu dubbingu | ui, data | 1–3 | Odprawa/komunikaty/podsumowanie istnieją | I |
| 7: obniżone okopy, leje, ruiny, schrony | world, render/landscape | 1 | Wspólna siatka i test przejścia głównego/bocznego | Z |
| 7: wspólna kolizja / LOS / nawigacja | collision, navigation | 1–2 | Test lufy, wybuchu, skarp i przejścia gracza | Z |
| 7: pełna odporność granic mapy | collision, terrain | 3–5 | Nie obejrzano wszystkich krawędzi ręcznie | P |
| 7: niszczone umocnienia i aktualizacja przejść | world + vehicles | 3 | Przejazdy są zaprojektowanymi lukami; brak destrukcji | N |
| 8: docelowy retrorealizm, brak placeholderów | GLB, tekstury, efekty | 3–5 | Żołnierze mają nowe mundury/PBR/LOD; modele nadal nie są docelową oprawą | P |
| 8: pochodzenie/licencje | ASSET_LICENSES, vendor | 0–5 | Własne modele i tekstury, dołączone licencje runtime | I |
| 9: szkielety i animacje GLB | models, render/view | 0–3 | Importowane szkielety i 13 klipów; brak finalnego blendu | P |
| 9: wszystkie wymagane postawy i akcje AI | ai/soldier, view | 2–3 | Część klipów nie ma docelowego taktycznego zastosowania | P |
| 9: hitboxy postawy, brak działań martwych | collision, soldier | 1–2 | Test śmierci/pozy; hitboxy nie są per bone | P |
| 10: ruch niezależny od FPS, sprint/postawy | player, clock | 1 | Stały krok, finite stamina, test przejścia | Z |
| 10: klawisze, FOV, czułość i kołysanie | input, ui, view | 1 | Test UI remap oraz reset, faktyczne ustawienia | Z |
| 10: wszystkie sufity, skarpy i vault | collision, player | 3–5 | Uproszczony skok i clearance; testy wybranych tras | P |
| 11: podstawowy arsenał | weapons, models | 1–4 | SMLE/G98/Webley/Lewis/MG08; brak Vickers | P |
| 11: naboje / cykl zamka / reload | weapon, player | 1 | Atomic reload i checkpoint nie duplikują amunicji | Z |
| 11: docelowe animacje obsługi broni | view, GLB | 3 | Proste proceduralne gesty, nie finalne sekwencje | P |
| 11: najbliższa przeszkoda i blokada lufy | ballistics, collision | 1 | Test kamera widzi, lufa zablokowana | Z |
| 11: granaty, odbicia, osłony, ograniczony zapas | ballistics, player | 1–2 | Test pojedynczego wybuchu / osłony / reakcji NPC | Z |
| 11: historyczne odmiany obu granatów | GLB + data | 3–4 | Brak osobnej zweryfikowanej Stielhandgranate | N |
| 11: walka wręcz bez trafiania przez ściany | player, collision | 1 | Krótki raycast i cooldown; potrzebna ręczna regresja | I |
| 12: HP100, delay6, regen12, medkit50 | health, simulation | 1 | Testy granic, pełnego HP i resetu opóźnienia | Z |
| 12: śmierć i wznowienie | app, ui, save | 1–3 | Ekrany i odtwarzanie implementowane; nie pełny test ręczny | I |
| 12: trzy trudności | weapons, soldier | 2–5 | Różne reakcje/celność/obrażenia; balans niezaakceptowany | P |
| 13: percepcja/FOV/LOS/ostatnia pozycja | soldier, collision | 2 | Implementacja + testy przeszkód; pełny scenariusz ręczny brak | P |
| 13: drogi/queue/osłony/ustępowanie | navigation, soldier | 2 | Główne trasy działają; brak pełnej rezerwacji przejść | P |
| 13: przeładowanie i samodzielna walka obu stron | soldier, simulation | 2 | 60 s bez strzałów gracza, straty i przeładowania | Z |
| 13: granat, poszukiwanie i odwrót | soldier | 2 | Granat testowany; pozostałe zachowania wymagają szerszego odbioru | P |
| 13: pełna warstwa oddziału i role | soldier + director | 2–3 | Proste cele grup, nie kompletny system współpracy | P |
| 13: gęsty dym blokuje AI | effects + soldier | 3 | Brak gęstego dymu i odpowiadającej percepcji | N |
| 14: dwa Mark IV, trasy i sektory | tank, GLB | 2–3 | Test przejazdu i awarii; zapis odtwarza stan | P |
| 14: Mark I/V i pełne uszkodzenia | vehicles, assets | 4 | Brak implementacji | N |
| 15: data-driven cele i zdarzenia once | director, data | 1–3 | Test duplikacji kontrataku i checkpointów | Z |
| 15: brak nieskończonych fal i zależności od żywego ally | director | 2–3 | Osiem posiłków, cele oparte o miejsce/przedmiot | Z |
| 15: odczytywalna groźna artyleria | missions/effects | 3 | Tylko niegroźne tło; brak zaprojektowanych zagrożeń | N |
| 16: osobne menu, loading, gameplay, pause, errors | app, ui | 1 | Test braku sceny w menu, asset404 i dziesięciu cykli | Z |
| 16: HUD, cele, interakcja | ui | 1–3 | Widoczny działający HUD, bez minimapy wszechwiedzącej | I |
| 16: pełne audio + muzyka | audio | 3 | Syntetyczne efekty i tło; brak muzyki i nagranego foley | P |
| 16: pointer lock, Esc, blur, hidden | input, app | 1 | Rzeczywisty pointer lock/Esc; symulowany blur; hidden do odbioru | P |
| 16: brak WebGL2 / utrata kontekstu | view, app | 1–5 | Ścieżki błędów w kodzie, brak pełnego testu obu przypadków | I |
| 17: wersjonowany logiczny snapshot | schema, store | 1–3 | Walidacja, zużyte przedmioty, ammo, NPC, zdarzenia | Z |
| 17: trwałe IndexedDB / quota / permissions | store | 1–5 | Fallback odmowy zweryfikowany, normalny origin jeszcze nie | P |
| 18: podział kodu i jeden właściciel stanu | src, architecture | 0 | Implementacja modułowa, bez obiektów sceny w logice | I |
| 18: workery po profilowaniu | navigation | 2–5 | Kolejka main-thread; worker nie został uzasadniony pomiarem | N |
| 18: 60 FPS/1080p i GPU/p95 | F3 + profilowanie | 5 | Brak sprzętowego benchmarku; SwiftShader nie jest dowodem | N |
| 18/20: 10 cykli bez aktywnych scen/dźwięków | app, view, audio | 5 | 10/10, engine=0, scenes=0, sources=0 po wyjściu | Z |
| 18/20: brak wszystkich wycieków | renderer/audio | 5 | Heap mierzony; nie wykonano długiego/natywnego profilu | P |
| 19–21: dokumentacja, raport, zasady repo | docs, tools, workflow | 0–5 | Dostarczone; bez branchy, push, publikacji i zmian repo użytkownika | Z |


## Odbiór zakresu aktualizacji v0.2

| Zgłoszenie | Implementacja | Dowód | Status i granica odbioru |
|---|---|---|---|
| Celowanie / strzelanie | input.js, wyłączenie wejścia Babylon, potwierdzenie Pointer Lock | input-v02/pointer-lock + realne oba porządki LPM/PPM, pauza i checkpoint | Z w Chromium; Firefox i maszyna użytkownika niezweryfikowane |
| Scroll menu / nakładanie stopki | ui/style.css, map-clip, grid | 8 viewportów, pomiar scrollWidth/Height i hit test przycisków | Z; przewijanie wewnętrzne długich paneli pozostaje zamierzone |
| Zdeformowany skybox | sky-geometry/sky.js, sky-v02.jpg | UV/normalki, zrzuty zenitu i różnych kierunków | Z |
| Szczegółowe mundury | generate_characters.py, british/german.glb | 3 skinned LOD, tekstury, budżety, test normals/skin, zrzuty renderera | Z dla upgrade'u; P dla docelowego artyzmu i pełnej zgodności historycznej |
| Wydajność | batching przestrzenny, LOD, animacje, cienie, pools, HUD | A/B jednakowego scenariusza, cap animacji/efektów, lifecycle | Z dla wykonanych pomiarów software; I dla fizycznego GPU/CPU |
| FPS/CPU/GPU | performance/*, ustawienia/overlay/F3 | unit + rzeczywisty query Chromium, niezależne wyłączenie | Z; GPU opcjonalne, brak obsługi nie udaje wyniku |

Historyczne szczegóły v0.1 w wcześniejszych wierszach nie są dowodem testowania nowych
plików. Wyniki bieżącego wydania znajdują się w TEST_REPORT.md i docs/v0.2-tests/.
