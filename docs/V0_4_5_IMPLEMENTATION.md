# Ziemia Niczyja / No Man’s Land — implementacja 0.4.5

**Wersja: 0.4.5, rewizja UI: 1.** Data dokumentacji: 7 września 2026.
Kod funkcji z planu został wdrożony. Odbiór w środowisku przygotowania obejmuje testy
Node, rzeczywisty DOM HUD-u, matematykę kamery i symulację. **Pełny odbiór WebGL2 na
normalnym originie i porównanie na fizycznym GPU nie zostały wykonane.** Nie należy
traktować tej paczki jako pomiarowego potwierdzenia usunięcia wszystkich mikroprzycięć.

## Baza i sposób dostarczenia

Repozytorium `Mentiuszen/ziemianiczyja`, commit
`a567537c528e46b89fac0ff94555460f83bc864c` („fix tatooine”). Źródła pobrano z artefaktu
GitHub Pages przypisanego do tego commita: run `34064326947`, artifact `9998454840`.
Nie wracano do starszej wersji plików z planu. SHA i pochodzenie zapisano w raporcie JSON.

ZIP jest nakładką **nowych i zmienionych plików**. Nie jest samodzielnym całym projektem.
Należy nałożyć go na tę bazę, zgodnie z `INSTALL_0_4_5.md`. Nie ma plików do usunięcia.
Nie wykonano pusha, publikacji, utworzenia brancha ani worktree. `dist` należy zbudować
ponownie — nie jest dołączony do nakładki. Zmiany i hashe zawiera `V0_4_5_MANIFEST.json`.

## Pokrycie 11 punktów zamówienia

| Punkt | Wdrożenie |
|---|---|
| 1. Skalowanie HUD-u | Globalna i 18 lokalnych skal 50–200%, wynikowa skala ograniczona do 200%. Wspólny układ rezerwuje rzeczywiste wymiary, zawija/przenosi moduły; menu i F3 nie są skalowane. Minimapę renderuje bufor dostosowany do skali i DPR. |
| 2. Postawa | Wektorowe ikony stania, kucania i leżenia obok HP. Odczyt zatwierdzonego `player.stance`, nie klawisza; blokada wstawania nie fałszuje ikony. |
| 3. Obrażenia | Czerwone krawędzie/narożniki, łagodny zanik, ograniczony ruch. Tekst PL/EN przy żywym graczu i HP ściśle poniżej 20%, także przy `damageEffects=0`; bez powtarzania alertu co klatkę. |
| 4. Hitmarker w ADS | Własny element DOM i model czasu, niezależny od ukrytego w ADS celownika. Potwierdzenie wyłącznie po zatwierdzonych obrażeniach. |
| 5. Celowniki | Kropka, klasyczny krzyżak, krzyżak z kropką, brak. Domyślnie krzyżak, podgląd w opcjach. Stary obracany krzyż nie jest aktywną implementacją. |
| 6. Odstęp hitmarkera | Cztery ukośne kreski z wolnym środkiem; promień wynika z rozmiaru celownika i niezależnej skali znacznika. |
| 7. Czerwone zabójstwo | Zabójstwo czerwone z priorytetem nad kolejnym zwykłym białym trafieniem. Wspólna ścieżka pocisku, melee i granatu; bez fałszywych potwierdzeń od NPC, sojuszników, trupów czy 0 obrażeń. |
| 8. Granaty | Ocena wrogiego zagrożenia według frakcji, 3D, zapalnika i osłony. Znacznik rzeczywistej pozycji lub kierunek poza ekranem, także za plecami i przy przechylonej kamerze. Maks. trzy wskaźniki, licznik dodatkowych, natychmiastowe sprzątanie. |
| 9. CPU/GPU tylko F3 | Usunięte przełączniki z opcji i zwykłego overlayu. Stare zapisane klucze są ignorowane; proste FPS pozostaje. |
| 10. Diagnostyka | 10-sekundowe okno, p50/p95/p99/max czasów klatki i pracy CPU/GPU, osobny RAF, rozbicie CPU, wykres i przekroczenia budżetu. F4 reset, F6 capture, F7 JSON, liczność i status ważności danych. |
| 11. Płynność i koszt | Interpolacja transformacji przy niezmienionej symulacji 60 Hz, podgląd niezjedzonej delty myszy bez podwójnego obrotu, poprawny czas FOV/oka. Porcjowana nawigacja, ponownie używana pamięć i lokalne unieważnianie grafu, cache układu/viewportu HUD-u. Poprawa sprzętowego p95/p99 pozostaje do odbioru A/B. |

## Ważne kontrakty i granice

Skala wynikowa jest iloczynem globalnej i lokalnej, ograniczonym do przedziału 50–200%.
18 modułów to: minimapa, cel, zdrowie, wytrzymałość, postawa, amunicja/broń, licznik granatów,
przeładowanie, interakcja, napisy, niski HP, powiadomienia, celownik, hitmarker, ostrzeżenia
granatów, flagi sojuszników, znacznik celu i prosty FPS. Reset HUD-u nie resetuje kampanii,
języka, audio ani sterowania. Układ może ukryć treści pomocnicze dopiero przy rzeczywistym
braku miejsca; ten tryb jest jawnie wskazywany. Bardzo małe ekrany z wieloma modułami 200%
nie mają gwarancji wyświetlenia wszystkich pomocniczych treści jednocześnie.

`Simulation.damage` nadal rozstrzyga HP. Nowe zdarzenie `combat-feedback` niesie seryjny
`feedbackId`, zatwierdzone obrażenia i informację o zabójstwie. Licznik celności pocisków
nie jest sztucznie zwiększany trafieniami eksplozji/melee. Stan przejściowy HUD-u nie trafia
do checkpointu. Krytyczny tekst znika przy śmierci i HP >=20%; ponowna zapowiedź jest
uzbrajana po powrocie do >=25%, aby nie spamować wokół progu.

Interpolowane są małe bufory transformacji, nie pełne snapshoty. HP, amunicja, decyzje AI,
kolizje, trafienia i postęp misji pozostają własnością stałokrokowej symulacji. Delta myszy
jest podejrzana do prezentacji, a zużywana raz w pierwszym kroku logiki. Ograniczenie obrotu
w leżeniu używa tej samej walidacji. Pauza, zmiana świata i przywrócenie resetują prezentację.
Nie dodano nowych przyspieszeń logiki ani zmiany kroku 1/60 s.

Wyszukiwanie ścieżek jest porcjowane deterministycznym budżetem pracy (32 jednostki/krok;
zimny węzeł kosztuje 8, węzeł z cache 1), zamiast dwóch pełnych A* w jednym wywołaniu.
Zachowano priorytety ucieczki, anulowanie/generacje, ponowną walidację i maksymalną liczbę
odwiedzonych węzłów. Zniszczenie drutu unieważnia lokalne krawędzie zamiast całego grafu.
Nie zmniejszono liczby NPC, jakości modeli, ustawień grafiki ani skuteczności walki.

F3 nie nazywa `1000 / frameP99` średnią „1% low”. Percentyle liczone są z surowych,
ważnych próbek metodą nearest rank, p99 jest nieobecne poniżej 100 próbek, a mniej niż
1000 sygnalizuje małą próbę. GPU zachowuje ID i czas wysłanej klatki, obsługuje brak
rozszerzenia/disjoint/utratę kontekstu, nie zastępuje braków zerem. Brak `gl.finish()`.
CPU i GPU nie są sumowane jako sztuczny czas całej klatki. Domyślny budżet jest szacunkiem
z rytmu RAF/limitu, nie domniemanym odświeżaniem 165 Hz.

Rejestracja ma ograniczone bufory (65 536 frame i RAF, 32 768 GPU), a eksport ujawnia
nadpisanie najstarszych danych. Reset/pauzy rozdzielają sesje. Eksport JSON i rozpoczęcie
rejestracji są czynnościami operatora, nie pracą wykonywaną przy każdym renderze.

## Faktycznie wykonana weryfikacja

| Próba | Wynik |
|---|---|
| Testy aktualnej bazy | 355 PASS, 0 FAIL |
| `npm ci` | PASS, bez nowych zależności runtime |
| `npm run check` | PASS: składnia/importy 97 JS, 15 GLB, 547/547 kluczy PL/EN, 27 hashy UI |
| Pełny `npm test` po implementacji | **399 PASS, 0 FAIL, 0 SKIP**; 44 nowe testy |
| Powtarzalny build | PASS: **524 pliki łącznie z manifestem**, identyczne SHA-256 wszystkich plików w kolejnych buildach |
| HUD w Chromium | PASS: 40 kombinacji języka, viewportu i skali + 8 mieszanych skal; kontrola rzeczywistych prostokątów DOM |
| Osobne sprawdzenia DOM | PASS: postawy, próg HP, ADS + każdy celownik, czerwony kill, granaty/pula/sprzątanie, opcje, F3, cache geometrii, dekodowanie SVG |
| Minimapa 200% / DPR 2 | PASS: fizyczny bufor odpowiada przeskalowanemu rozmiarowi CSS × DPR |
| Prawdziwa logika `GameView.sync` i matematyka Babylona | 5 PASS: interpolacja, mysz, ADS FOV, obrót prone, powrót wektora up po roll |
| Automatyczne przejście misji | PASS: faza 7, 162,75 s symulacji, 2 checkpointy |
| Przejście z oboma zniszczonymi czołgami | PASS: faza 7, 158,35 s, 2 checkpointy |
| Ochrona zasobów bazy | PASS: 413 istniejących plików vendor/modeli/tekstur/UI niezmienionych bajtowo |
| Zwykły HTTP + gra w Chromium | **BLOCKED: ERR_BLOCKED_BY_ADMINISTRATOR**, przed wykonaniem strony |
| Pełny renderer na kopii modułów | **BLOCKED: brak WebGL2** w dostępnym Chromium |
| Fizyczny GPU, 165 Hz, Firefox, trwały zapis w rzeczywistej przeglądarce | **NIE WYKONANO** |

Test DOM działa na `about:blank`, importując rzeczywiste moduły UI i Simulation przez
adresy Blob i faktyczne bajty CSS/SVG. Widok jest jawnie syntetyczny. To nie jest pełny
screenshot gry z modelem broni, przesłanianiem przez scenę i prawdziwym GPU. Oddzielne
testy kamery używają faktycznej klasy `GameView` i wektorów/macierzowych operacji vendora,
ale nie wykonują renderu GPU. Wyjątki środowiskowe nie zostały zamienione w PASS.

W istniejących testach zaktualizowano jedynie oczekiwany numer wydania/rewizji i walidację
nowego pola boolean `critical` obok wcześniejszych pól liczbowych. Nie usunięto testów
starej rozgrywki ani nie osłabiono asercji o nienaruszaniu czasu/stanu przez renderer.

## Pomiary kosztu CPU i ich interpretacja

Trzy próby po 900 kroków symulacji (15 s symulacji), identyczny seed i skrypt wejścia;
porównywana baza to wskazany aktualny commit. Surowe czasy i metodę zapisano w
`validation/v045/cpu-base.json`, `cpu-v045.json` i `tools/benchmark_v045.mjs`.

| Próba | Baza p95 / p99 / max [ms] | 0.4.5 p95 / p99 / max [ms] |
|---|---|---|
| 1 | 2,760 / 5,369 / 46,743 | 2,752 / 4,191 / 21,138 |
| 2 | 2,060 / 2,972 / 42,537 | 2,501 / 3,634 / 11,216 |
| 3 | 2,088 / 3,280 / 37,945 | 1,997 / 2,686 / 3,343 |

Maksymalny koszt kroku spadł we wszystkich trzech próbach; **nie wszystkie p95/p99 się
poprawiły** (druga próba jest gorsza pod tym względem). Testy są krótkie, zależą od JIT,
GC i współdzielonego hosta. Porcjowanie nawigacji może zmienić pośrednie decyzje AI,
więc identyczny seed/wejście nie oznacza identycznego stanu każdej klatki. Nie są to
FPS ani czasy fizycznego GPU. Szczegółowe definicje i dalszy protokół A/B: `PERFORMANCE.md`.

## Naprawa kontroli zasobów i zachowana baza

W pobranym aktualnym repozytorium brakowało `authoring/ui/manifest.json`; potwierdzono
również 404 dla tego pliku w GitHub. Bazowe `npm run check` zatrzymywało się na tym
odwołaniu, mimo przechodzących testów. Kontrola UI korzysta teraz z wersjonowanego
`public/assets/ui/manifest.json` z rzeczywistymi hashami 27 istniejących i nowych eksportów.
Nie pominięto kontroli ani nie utworzono fikcyjnych źródeł artystycznych. Oryginalne grafiki
pozostały nietknięte, a trzy nowe ikony postaw są własnymi prostymi SVG z opisem licencji.

SHA-256 zachowanego `public/assets/ui/main-art.webp`:
`adc6dda18c8768162dbc77aa1c19a99b9ae1f3be2438c27057daa950aa1deefb`.
Nie udostępniono plików fontów. Nie zmieniono `SAVE_VERSION=1`, `MISSION_VERSION=3`,
frakcji, presetów broni, grafiki ani plików vendor.

## Odbiór lokalny

Uruchomić polecenia z `INSTALL_0_4_5.md` na swojej aktualnej kopii i oddzielnym profilu
przeglądarki. Dostępny jest powtarzalny test `tools/browser_v045.py --url
http://127.0.0.1:5173/` oraz wariant modelowo-DOM `--memory-ui`. Python Playwright to
narzędzie odbioru, nie zależność runtime gry. Testy korzystają z osobnego kontekstu;
nie należy podłączać do nich własnego profilu z zapisem gry.

Właściwy odbiór obejmuje pełne przejście, źródła oraz `dist`, ADS podczas ruchu,
trafienie/zabójstwo pociskiem i granatem, granat za plecami/pod nogami, postawę pod
stropem, pauzę i odtworzenie checkpointu. Porównać identyczne trasy na 60/120/165 Hz,
F3 wyłączone/włączone, z rozgrzanym renderingiem i osobno przy pierwszych zdarzeniach.
Nie wyłączać NPC, jakości cieni ani kolizji, aby sztucznie poprawić wynik.

Maszynowy rejestr: `V0_4_5_VALIDATION.json`. Źródłowe logi i dane:
`docs/validation/v045/`. Zestawienie wszystkich zmian: główny `CHANGELOG.md`.
