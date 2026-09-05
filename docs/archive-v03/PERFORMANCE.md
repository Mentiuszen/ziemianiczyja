# Wydajność — v0.3.0

## Wniosek
Ta aktualizacja poprawia oprawę i powiększa teren, ale **nie jest przyspieszeniem v0.2**.
W pomiarze programowego renderera średni czas klatki zwiększył się o **45.7% na starcie**
i **68.3% po 25 sekundach symulacji walki**. Wzrosły też koszt CPU renderowania i liczba
wywołań rysowania. Nie ukrywamy tej regresji za większą liczbą opcji w menu.

## Co i jak zmierzono

Chromium 144.0.7559.96, Linux x86_64, ANGLE SwiftShader. Brak fizycznego GPU. Zasoby podawane lokalnie,
brak pobierania w czasie próbki. Okno 1280 × 720, Medium, skala renderowania 1.0.
Na wariant przypada 10 klatek rozgrzewki i 45 mierzonych klatek. Testy uruchamiano
sekwencyjnie, bez równoległych innych testów graficznych. To pojedyncza seria o małej
liczbie próbek, nie wielogodzinna analiza statystyczna.

Zachowano seed i harmonogram wejść, ale v0.3 ma większy teren, inny layout i poprawione
kolizje. To porównanie całych wydań, **nie izolowany benchmark samej optymalizacji**.
Scenę walki przygotowano 25 sekundami symulacji. W próbce wykonywano jeden krok 1/60 s
na klatkę renderowania; nie należy czytać tych 25 sekund jako 25 sekund płynnej gry na GPU.
W obu wydaniach istnieją prawdziwi żołnierze i efekty walki, nie sam pusty krajobraz.

Frame ms = odstęp requestAnimationFrame; FPS = 1000 / średni odstęp. p95 to percentyl
z tej konkretnej próbki. CPU w tym benchmarku = czas kroku symulacji + wywołania render,
bez HUD. Nie jest to czas całego procesora ani 1000/FPS. Draw calls są różnicą licznika
w pojedynczej klatce, a nie narastającą sumą z całej sesji.

| Wersja | Scena | Klatka średnia ms | p95 ms | FPS | CPU średnie ms | Draw calls średnio | Trójkąty średnio |
|---|---|---:|---:|---:|---:|---:|---:|
| v0.2 | Start w okopie | 373.69 | 699.90 | 2.68 | 5.19 | 142.0 | 293,324 |
| v0.3 | Start w okopie | 544.42 | 783.30 | 1.84 | 8.18 | 311.0 | 503,652 |
| v0.2 | Po 25 s symulacji walki | 267.40 | 299.90 | 3.74 | 5.82 | 129.7 | 238,439 |
| v0.3 | Po 25 s symulacji walki | 449.98 | 483.40 | 2.22 | 8.35 | 284.0 | 429,644 |

Pełne próbki, dodatkowe percentyle, stany świata i liczniki znajdują się w źródłach:
`docs/v0.3-tests/benchmark-ab.json`. Obok zapisano screenshoty czterech scen.
Powtórzenie: `xvfb-run -a python tools/benchmark_v03.py --baseline /sciezka/v0.2.0 --samples 45`.
Test wymaga lokalnej kopii v0.2; nie pobiera ani nie modyfikuje repozytorium użytkownika.

## Przyczyny i ograniczenia

Teren ma 2,125 raza większą powierzchnię. Nowy layout obejmuje tysiące elementów okopów,
pięć gospodarstw, dodatkowe płoty i osłony. Dochodzą normal mapy, teksturowane modele,
wyższe bliższe LOD, warstwy trawy i droższe efekty. Podział materiałów/chunków ogranicza
rysowanie niewidocznej geometrii, ale zwiększa liczbę draw calls. SwiftShader wykonuje
pracę GPU na CPU i jest szczególnie niekorzystny dla cieni i fragmentów z alpha test.

Zastosowano indeks przestrzenny colliderów, DDA dla kandydatów promienia, buforowanie
materiałów, LOD, ograniczanie odległych animacji i pule efektów. To mechanizmy ograniczania
kosztu, nie dowód, że cała v0.3 jest szybsza. Nie wyłączano AI, kolizji ani przeciwników
w celu uzyskania dobrych wyników. Limit wizualnej puli nie blokuje obrażeń eksplozji.

Wszystkie te wyniki dotyczą środowiska testowego. Nie zmierzono RTX/AMD/Intel, Firefoksa
ani 1080p/1440p na fizycznym komputerze. Nie przewidujemy z nich FPS użytkownika.

## Rzeczywista skalowalność presetów

| Preset | Cienie | Promień | Normal mapy | Anizotropia | Progi LOD m | Dekoracje m | Limit efektów |
|---|---|---|---|---|---|---|---|
| Low | brak | 0 | nie | 2 | 12 / 36 | 38 | 72 |
| Medium | 1024² | 32 m | tak | 4 | 20 / 54 | 64 | 128 |
| High | 2048² | 48 m | tak | 8 | 30 / 78 | 92 | 208 |
| Ultra | 4096² | 64 m | tak | 16 | 42 / 105 | 130 | 320 |

Zmieniają się też filtr cieni i liczba cząstek wybuchu / warstw trawy. Low nie usuwa wrogów,
przeszkód i istotnych osłon. Przełączenie na Low, a następnie z powrotem przywraca normal mapy.
Skala renderowania jest niezależnym ustawieniem. Nie dodano pozornego RT/SSAO ani ukrytego
przeskalowania rozdzielczości w Ultra. Początkowy preset to Medium.

## Wskaźniki gracza

FPS/czas klatki uwzględnia odstępy rzeczywistych klatek. CPU mierzy pracę aplikacji na głównym
wątku; F3 rozdziela symulację i wysłanie renderowania. GPU to opcjonalny asynchroniczny timer
WebGL2: kolejka jest ograniczona, a wynik disjoint/niedostępny nie zamienia się w 0 ms.
Test Chromium potwierdził wynik timera w **programowym** GPU; to nie pomiar fizycznej karty.
CPU i GPU mogą nakładać się czasowo, więc nie należy dodawać ich do czasu klatki.
Przełączniki FPS, CPU i GPU są niezależne. Wyłączony pomiar GPU nie odpytuje timera.
