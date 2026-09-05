# Wydajność i limiter — v0.4.0

## Zakres wykonanych pomiarów

**Nie wykonano sprzętowego benchmarku v0.4 ani porównania A/B v0.3/v0.4.** Relacja
użytkownika o 165 FPS na Ultra dotyczy v0.3. Nie jest podstawą do obietnicy utrzymania
165 FPS w v0.4. Historyczne wyniki v0.3/v0.2 pozostają w `archive-v03/PERFORMANCE.md`;
nie należy przypisywać ich nowej wersji.

Nowa wersja ma 38 żołnierzy na mapie (12 UK + 26 DE): dotychczasową obsadę 28,
dwuosobową obsługę działa i osiem jednostek rezerwy istniejących od początku. Dowódca
i grupa odprawy korzystają z części dotychczasowej obsady. Dodatkowe systemy to artyleria,
przeloty, napisy i ruch czołgów. Nie formułujemy ogólnego wniosku o wzroście/spadku
wydajności bez kontrolowanego pomiaru tych samych scen.

Testy wykonane na Chromium 144.0.7559.96 / SwiftShader miały przede wszystkim wykrywać
błędy renderera, wejścia, limitera i sprzątania. Oprogramowanie udające GPU zużywa CPU;
nie jest reprezentatywne dla RTX/AMD/Intel. Nie powtarzano pomiaru na Firefoxie.

## Jak działa limit

Ustawienie `maxFps`: 0 oznacza brak ograniczenia aplikacji, wartości 1–360 oznaczają
maksymalną częstotliwość renderowania. Interfejs podpowiada 30/60/90/120/144/165/240;
można wpisać wartość własną. Ustawienie nie wyłącza synchronizacji przeglądarki.
Nie dodano pozornego przełącznika VSync OFF.

Symulacja i audio aktualizują się w każdym wywołaniu requestAnimationFrame, a nie tylko
przy renderze. Render zostaje pominięty do kolejnego terminu. Limiter zachowuje ułamkowe
terminy, zamiast obcinać 60 do 55 FPS przy 165 Hz. Nie generuje serii zaległych renderów
po powrocie do karty; pauza i zmiana capu zerują termin. Limit powyżej rytmu przeglądarki
nie tworzy dodatkowych widocznych klatek. Przy wartości niebędącej dzielnikiem odświeżania
odstępy klatek mogą być nierówne — średni cap nie jest gwarancją idealnego frame pacingu.

FixedClock ma krok 1/60 s i maksymalnie pięć zaległych kroków w jednej klatce RAF.
To zabezpieczenie przed spiralą przeciążenia, **nie gwarancja nadrobienia czasu przy
bardzo niskiej wydajności**. Rozdzielenie renderu od symulacji nie usuwa blokowania CPU
przez sterownik/przeglądarkę. Przy dobrym sprzęcie cap nie spowalnia samej gry, ale przy
przeciążeniu czas symulacji może odstawać od zegara, co widać w próbie programowej.

## Wyniki funkcjonalne limitera

Test `v04-framerate.test.mjs` użył 24 kombinacji: RAF 60/165/240 Hz, limity
0/30/60/90/120/144/165/240, po 6 s. Wszystkie przeszły z tolerancją <1 FPS oraz prawidłowym
clampem do częstotliwości źródłowej. Osobno sprawdzono zmianę capu i powrót po 10 s przerwy.

| Próba Chromium / SwiftShader | Żądany cap | Zmierzony FPS | Czas zegara | Postęp symulacji |
|---|---:|---:|---:|---:|
| źródła | 1 | 1,127 | 6,209 s | 4,167 s |
| dist pod `/test-repo/` | 1 | 0,966 | 6,209 s | 4,033 s |

To krótkie okna funkcjonalne, nie długookresowa precyzja limitera. Na ich wynik wpływa
faza pomiaru i obciążenie renderera. Test używa 1 FPS, ponieważ SwiftShader nie zapewnia
w tej scenie płynnego renderowania nawet przy Low. Ważny warunek: liczba kroków symulacji
jest znacznie większa niż maksymalna wynikająca z aktualizacji wyłącznie przy renderze.
Nie stosowano `setTimeout` do udawania większej liczby rzeczywistych klatek.

## Co pokazują wskaźniki

FPS/czas klatki: faktycznie wykonane rendery. CPU: praca aplikacji na głównym wątku,
obejmująca pominięte rendery między wyświetlanymi klatkami, nie procent zajęcia całego CPU.
F3 rozdziela pracę symulacji/audio oraz wysłanie renderu. GPU: opcjonalny asynchroniczny
timer WebGL2; brak/disjoint/oczekiwanie nie są zamieniane na 0 ms. CPU i GPU nakładają się
w czasie, więc nie należy dodawać ich mechanicznie do długości klatki.

Próba dist zwróciła timer gotowy z wynikiem około 491,95 ms, a overlay w innym krótkim
oknie pokazywał 2 FPS i 31,37 ms CPU. Są to telemetrie testu programowego, **nie wyniki
referencyjnego komputera**; różne okna metryk nie są zsynchronizowaną próbą benchmarkową.
Surowe dane: `v0.4-tests/regression-source.json` i `regression-dist.json`.

## Zachowane ograniczenia kosztu i presety

Wspólne materiały, grupowanie statycznej geometrii, indeks kolizji, bufor tras i jego
unieważnianie po zniszczeniu drutu, trzy LOD postaci, rzadsze odległe animacje, ograniczone
pule efektów i skończone lotnictwo. Culling/quality nie wyłączają przeciwników ani kolizji.
To mechanizmy ograniczania kosztów, nie dowód niezmienionej wydajności całej gry.

| Preset | Cienie | Promień | Normal mapy | Anizotropia | LOD m | Dekoracje m | Efekty |
|---|---|---|---|---|---|---|---|
| Low | brak | 0 | nie | 2 | 12 / 36 | 38 | 72 |
| Medium | 1024² | 32 | tak | 4 | 20 / 54 | 64 | 128 |
| High | 2048² | 48 | tak | 8 | 30 / 78 | 92 | 208 |
| Ultra | 4096² | 64 | tak | 16 | 42 / 105 | 130 | 320 |

Skala renderowania pozostaje osobna. Nie dodano ray tracingu ani obiecanych, lecz
niezaimplementowanych efektów post-process. Modeli i systemów wymaganych do rozgrywki
nie usuwa się po przejściu na Low.

## Kolejny pomiar na normalnym komputerze

Uruchomić nową misję na tej samej rozdzielczości i skali, włączyć FPS/CPU/GPU oraz F3,
porównać odprawę, otwieranie drutu, starcie z działem i obronę telefonu. Rejestrować średnią,
p95 i dłuższe przycięcia, nie tylko maksymalny FPS. Powtórzyć z capem 0,60,120,165.
GPU niedostępne traktować jako brak danych. Przed przypisaniem regresji zmianom uruchomić
wersję v0.3 w osobnym folderze z identyczną przeglądarką i ustawieniami.
