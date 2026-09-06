# Raport testów — Ziemia Niczyja v0.4.4

6 września 2026. Baza `a3398c211292e1cd677478ad6c4d456b6d210193` (0.4.3).
**Implementacja do lokalnego odbioru; bez publikacji przez wykonawcę.**

| Sprawdzenie | Faktyczny wynik 0.4.4 |
|---|---|
| Pełny npm test | **331/331 PASS**, 0 fail/skip/cancel; baza 274 |
| npm run check | PASS; 85 JS/MJS, względne importy, 15 GLB, 463/463 klucze PL/EN, 11 hashy UI |
| Autoplay / destroyed-tanks | Oba PASS, faza 7, po 2 checkpointy |
| Statyczny build | PASS; dwa identyczne manifesty |
| HTTP source/dist/podkatalog | PASS; 96 odpowiedzi 200 oraz oczekiwane 404; klient Python |
| Chromium DOM | PASS w about:blank z fixture pamięci i widoku; menu, opcje, kampania, Canvas/HUD, języki, układ |
| Matematyka kamery | PASS na rzeczywistych macierzach przypiętego Babylon, bez GPU |
| Cała gra HTTP/GameView | **BLOCKED: ERR_BLOCKED_BY_ADMINISTRATOR** przed kontrolami |
| Firefox/Edge, natywny trwały storage, fizyczny GPU/p95/p99, 10 pełnych cykli | NIE WYKONANO; lokalny odbiór |

[Raport 0.4.4](V0_4_4_IMPLEMENTATION.md) · [wyniki maszynowe](V0_4_4_VALIDATION.json).
Poniżej zachowano wcześniejsze wyniki w ich oryginalnym kontekście. Nie są ponowną
walidacją starych przeglądarek, assetów ani jakości na potrzeby 0.4.4.

---

# Raport testów — Ziemia Niczyja v0.4.3

6 września 2026. Baza `d4f0b6a2ed59b7e3e53d7adb113a3fc639c6bb9d` (0.4.2).
**Implementacja do lokalnego odbioru; bez publikacji.**

| Sprawdzenie | Wynik 0.4.3 |
|---|---|
| Pełny `npm test` | **274/274 PASS**, bez pominiętych przypadków; 40 nowych |
| `npm run check` | PASS; 65 JS/MJS, importy, 15 GLB; 387/387 kluczy PL/EN |
| Oba scenariusze `autoplay` | PASS; misja ukończona, po 2 checkpointy |
| Build | PASS; 461 plików manifestu, 49,29 MiB; zgodne dwa buildy |
| HTTP `/` oraz `/ZiemiaNiczyja/` | PASS; 24 odpowiedzi, poprawne MIME; kontrola klientem Python, nie przeglądarką |
| Teksty/UI Chromium | PASS w izolowanym DOM: picker, klawiatura, 36 ekranów, 21 próbek napisów, 3 rozmiary okna; pamięciowy fixture zamiast trwałego storage, bez GPU |
| Pełny HTTP/WebGL `GameView` | **BLOCKED**: `ERR_BLOCKED_BY_ADMINISTRATOR` przy nawigacji Chromium; nie utożsamiać z testem DOM |
| Firefox/Edge, trwałość zapisu po restarcie, GPU/FPS | **NIE WYKONANO**; do lokalnego odbioru |

Szczegóły, wersje środowiska i instrukcje: [V0_4_3_IMPLEMENTATION.md](V0_4_3_IMPLEMENTATION.md).
Maszynowe zestawienie: [V0_4_3_VALIDATION.json](V0_4_3_VALIDATION.json).
Poniższa historia zachowuje wcześniejsze wyniki z ich datami; nie stanowi nowego testu 0.4.3.

---

# Raport testów — Ziemia Niczyja v0.4.1

Weryfikacja z 5 września 2026 po migracji źródeł i imporcie poprawionej piechoty:

| Sprawdzenie | Wynik |
|---|---|
| `npm ci`, `npm run check` | PASS; projekt bez zależności npm, składnia 56 plików i 15 GLB |
| Testy Node w kopii bez `.source`, `dist` i historycznych wyników | PASS, 134/134 |
| Build z czystej kopii źródeł | PASS, 446 plików, 48,92 MiB; wersja 0.4.1 |
| Skryptowe przejście misji `tools/autoplay.mjs` | PASS; ukończenie i odtwarzanie checkpointów |
| Walidacja importu | PASS; 6 GLB i 4 atlasy identyczne z eksportem Blender i plikami w dist |
| Zgodność animacji | PASS; 261 strumieni animacji/macierz wiązania na model identycznych z poprzednim zestawem |
| HTTP pod `/ZiemiaNiczyja/` | PASS; wszystkie 446 plików, odsyłacze menu i brak publikacji narzędzi/dokumentów roboczych |
| Chromium 152.0.7977.77, RTX 3060, ANGLE D3D11 | PASS; import sześciu postaci, atlasy 2048², 13 klipów i 3 LOD-y; 702 próbki macierzy skinningu |
| Cykl gry w przeglądarce | PASS; start, render odprawy, pominięcie odprawy, pauza, wyjście; brak błędów JS/HTTP, scena i audio zwolnione |
| Oznaczenie wersji | PASS; 0.4.1 w API, menu i HUD |
| Pełna regeneracja proceduralna w kopii roboczej | PASS; nie zmienia sześciu importowanych GLB ani czterech atlasów |

Lokalne dowody są w ignorowanym `.local/`: `clean-tests.log`, `autoplay.log`,
`infantry-validation.json`, `browser-report.json`, `game-0.4.1.png`, `regenerate.log`.
Skróty importu przeznaczone do wersjonowania: `INFANTRY_IMPORT.json`.

AdGuard na tej maszynie dopisuje skrypty do odpowiedzi HTML localhost. Dlatego oryginalny
`tools/http_smoke.py`, wymagający identycznych bajtów HTTP/dysk, zatrzymał się na `index.html`.
Osobna kontrola wszystkich plików usuwała z porównania HTML wyłącznie te rozpoznane skrypty;
pozostałe pliki porównano bez zmian. Kod serwera i zabezpieczenia użytkownika pozostały bez zmian.

Nie wykonano porównawczego pomiaru FPS ani testu w Firefoxie. Pojedynczy test na RTX 3060
nie określa kosztu nowych LOD-ów i atlasów względem poprzednich modeli. Nie uruchamiano
publikacji GitHub Pages; sprawdzono workflow lokalnie i wskazano konfigurację w README.

## Historyczny raport v0.4.0

Data wykonania: 5 września 2026. Aktualizacja jednej misji Cambrai, nie ukończona kampania.
Stan runtime w tym raporcie odpowiada dostarczonemu buildowi. Po testach graficznych
zmieniono wyłącznie dokumentację, ponowiono build i porównano skróty kodu oraz zasobów.
Wynik weryfikacji paczek znajduje się obok ZIP jako plik manifestu wydania.

## Najważniejsze ograniczenia odbioru

**Firefox NIE został uruchomiony.** Poprawiono konkretną zależność od kompatybilnych
Mouse Events, dodano symulację ich braku i sprawdzono realne wejście w Chromium. To nie
jest potwierdzenie naprawy na komputerze użytkownika w Firefoxie. Nie był on zainstalowany,
a dostępne próby pobrania/instalacji kończyły się błędem DNS/ograniczeniem środowiska.
Edge i Safari również nie były oddzielnie uruchamiane.

Nie wykonano pomiarów na fizycznym GPU, porównania A/B v0.3/v0.4 ani testu ludzkiego balansu
misji. Wynik 165 FPS v0.3 jest relacją użytkownika, nie pomiarem v0.4. Przeglądarkowe testy
wykonano w Chromium 144.0.7559.96 / Debian 13 / ANGLE SwiftShader (render programowy),
w widocznym oknie pod Xvfb. Node 22.16.0, Python 3.13.5. Testy obsługi i cyklu życia nie
są benchmarkiem wydajności.

## Wykonane polecenia i wyniki

| Polecenie / sprawdzenie | Wynik | Dowód w paczce źródłowej |
|---|---|---|
| `npm ci` | PASS, brak zależności do pobrania | `docs/v0.4-tests/release-core-http.log` |
| `npm run check` | PASS, 56 plików JS/MJS i 15 modeli GLB | ten sam log |
| `npm test` | **115 / 115 PASS**, 0 skipped | ten sam log |
| `python tools/test_asset_geometry.py` | **2 / 2 PASS** | ten sam log |
| `python tools/http_smoke.py` | PASS, źródła `/`, dist `/`, dist `/test-repo/` | `http-smoke.json` |
| `node tools/autoplay.mjs` | PASS, zakończona misja + 2 odtworzone checkpointy | `autoplay-release.log` |
| `node tools/autoplay.mjs --destroyed-tanks` | PASS, ukończenie bez obu czołgów | `autoplay-fallback-release.log` |
| `xvfb-run -a python tools/browser_v04_regression.py` | PASS | `regression-source.json` |
| `xvfb-run -a python tools/browser_v04_regression.py --dist --prefix=test-repo` | PASS | `regression-dist.json` |
| `xvfb-run -a python tools/browser_v04_lifecycle.py --dist --prefix=test-repo --cycles 10` | PASS, 10 cykli | `lifecycle/dist-test-repo.json` |
| `xvfb-run -a python tools/showcase_v04.py` | Zrzuty prawdziwego renderera do kontroli wizualnej | `showcase.json`, pliki PNG |
| `npm run build` i kontrola ZIP | Świeży build; integralność i skróty zapisane w manifeście wydania | manifest obok paczek |

Ścieżki skrócone w kolumnie dowodów są względne do `docs/v0.4-tests/`. Historyczne logi
prób z czerwonymi testami i wczesnymi błędami pozostały w katalogu dla przejrzystości;
nie są końcowym wynikiem wydania. Liczba 115 oznacza testy Node, nie liczbę niezależnych
przypadków gry w różnych przeglądarkach. Dawny raport v0.3 zachowano w `docs/archive-v03/`.

## Co obejmują nowe regresje

W stosunku do 83 testów Node v0.3 dodano 32. Cztery sprawdzają wejście, cztery kolizje,
trzy limiter/ustawienia, siedem misję, pięć wsparcie, dwa worki, trzy zasoby i cztery zapis.

**Wejście:** obrót przy PPM bez kompatybilnego mousemove, oba przyciski, brak podwójnego
ruchu po dodatkowym mousemove i reset stanu. Rzeczywiste próby Chromium obejmują PPM→LPM,
LPM→PPM, obrót przy obu przyciskach, strzał, pauzę/wznowienie i checkpoint. Nie wystarczyło
samo wywołanie funkcji strzelania w konsoli: test wysyłał zdarzenia myszy przez Playwright.

**Kolizje:** płot nie jest powierzchnią do automatycznego wejścia, podejścia po przekątnych,
niski szeroki podest nadal działa, sufit blokuje podnoszenie postaci, brak dołączenia do
wierzchu ogrodzenia podczas skoku. Nie dowodzi to poprawności każdej kombinacji kąta,
postawy i nierówności na całej mapie. Dodano też rzeczywistą, wąską strzelnicę MG: test
sprawdza zasłonięcie z boku i widoczność od przodu, zamiast nieśmiertelnej obsługi.

**Odprawa i AI:** dach nad miejscem startu, czterej żołnierze w pomieszczeniu, 42 s napisów,
jednorazowy sygnał natarcia, pominięcie E, zgodne odtworzenie czasu i alarm po zaatakowaniu
wroga. W próbie 20 s przed natarciem obie strony oddały prawdziwe strzały, a łączne straty
były mniejsze od sześciu. W teście 80 s po sygnale cała czwórka opuściła pomieszczenie
normalnym ruchem; poprawiono brak trasy dowódcy i zakleszczanie na starcie wyjścia.

**Pojazdy:** trasy obu czołgów, przejazd bez teleportacji, MG i działa, sektory i pozycje
wylotów zgodne z modelem, zatrzymanie przed przeszkodą, odporność na zwykły karabin,
uszkodzenie gąsienic, działanie artylerii z obsługą oraz dwa otwierane przejścia drutu.
**Lotnictwo:** ograniczony harmonogram, brak powtórzenia wylotów, dwa zrzuty z ostrzeżeniem,
lot pocisku, stan zapisany i odtworzony bez rozmnażania samolotów. Nie testowano pojedynków
powietrznych ani zestrzeleń, ponieważ tych funkcji nie zaimplementowano.

**Zapis:** odtworzenie fazy, czasu odprawy, amunicji czołgów/działa, pancerza, tras,
otwartego drutu i samolotów. Odrzucanie niezgodnej wersji i uszkodzonych danych, m.in.
niekompletnej prędkości, zduplikowanego ID samolotu i nieprawidłowych wartości amunicji.

**Geometria:** zamknięta bryła nowego worka, zgodność indeksów i orientacji powierzchni,
próbki promieni przez stos z obu stron, modele wsparcia bez pustych/zdegenerowanych siatek.
Kontrola nie oznacza muzealnej wierności każdego detalu ani finalnej jakości assetów.

## Przejście misji — rzeczywista symulacja

Bot porusza gracza przez zwykłe wejście, strzela i oddziałuje przez system kolizji/obrażeń.
Zna jednak graf oraz pozycje celów, pomija odprawę i gra na Rekrucie. Nie jest człowiekiem;
czas testu nie świadczy o docelowych 12–20 minutach ani o wymagającym balansie.
Nie poprawiano jego zdrowia lub pozycji w trakcie tych dwóch końcowych przejść.

| Wartość | Normalne przejście | Oba czołgi zniszczone przed startem |
|---|---:|---:|
| Stan końcowy | ukończona misja, faza 7 | ukończona misja, faza 7 |
| Czas symulacji | 175,83 s | 171,25 s |
| Zdrowie gracza na końcu | 100 | 100 |
| Strzały gracza / zabici | 17 / 12 | 23 / 17 |
| Strzały NPC UK / DE | 464 / 111 | 229 / 141 |
| Straty UK / DE | 1 / 23 | 0 / 21 |
| Strzały MG czołgów / działa czołgów | 228 / 15 | 0 / 0 |
| Strzały niemieckiego działa | 2 | 0 (brak czynnych czołgów jako celów) |
| Zrzuty bomb | 2 | 2 |
| Otwarte przez czołgi przejścia | 2 | 0 |

W normalnym przejściu pierwszy czołg został unieruchomiony, drugi dotarł do końcowego
punktu wsparcia. Niemieckie działo zostało uciszone. Oba warianty odtworzyły checkpointy
„Meldunek Bennetta” i „Punkt łączności” w nowej instancji symulacji bez duplikacji obsady.
Faza MG może zostać zaliczona od razu, jeżeli jego obsługa została wcześniej wyeliminowana;
test nie wymaga ostatniego trafienia gracza. Test bez czołgów dowodzi istnienia alternatywnej
drogi, **nie dowodzi, że jest trudniejszy** — tu bot ukończył ją nawet nieco szybciej.
Przed końcem wykonano cztery z pięciu przelotów; ostatni zaplanowany jest później.

## Przeglądarka, interfejs i czyszczenie zasobów

W źródłach i dist: osiem rozmiarów okna, w tym 320×568, 800×400 i 1920×1080, bez przewijania
całego menu i zasłoniętych przycisków. Low/Medium/High/Ultra zachowały 38 NPC, zmieniały
rzeczywiste cienie (0/1024/2048/4096), normal mapy oraz LOD. Wczytano sześć wariantów postaci.
Potwierdzono pojedynczy widoczny LOD na żołnierza, niezależność wskaźników i brak narastania
animatables w powtarzanych renderach. Sprawdzono włączenie i wyłączenie efektów obrażeń.

Dziesięć cykli z gotowego dist pod `/test-repo/` zakończyło się każdorazowo **0 silników,
0 scen i 0 aktywnych źródeł audio**. Każde wejście wczytało 614 meshy. W drugim cyklu
utworzono także rzeczywisty obiekt renderera samolotu, żeby sprawdzić jego sprzątanie.
Po wymuszonym GC użyty JS heap wynosił około 9,53–18,02 MiB i nie rósł monotonicznie.
To ograniczony test dziesięciu cykli, nie dowód braku jakiegokolwiek wycieku po wielu godzinach.

Sprawdzono stan menu bez świata, blokadę myszy, kucanie, granat, pauzę zatrzymującą czas,
utratę fokusu, zmianę klawisza i widoczny błąd celowo brakującego `british.glb` (404).
Brak nieoczekiwanych błędów JS, brakujących żądań i połączeń do zewnętrznych usług.

Dokument testów graficznych miał origin opaque, a Playwright podawał rzeczywiste pliki
ze źródeł/dist. To weryfikuje importy i ścieżkę podkatalogu, **nie trwałe IndexedDB po
zamknięciu karty na zwykłym hostingu**. Osobno uruchomiony prawdziwy serwer HTTP sprawdził
statusy/MIME/skróty w trzech konfiguracjach, ale także nie zastępuje testu trwałego zapisu.

## Limiter i koszt renderowania

24 kombinacje sztucznych zegarów (60/165/240 Hz × osiem capów) przeszły test liczby
wyrenderowanych klatek, zmiany limitu i długiej przerwy bez nadrabiania renderów.
Rzeczywista próba dist z capem 1 uzyskała około **0,966 FPS przez 6,209 s**, przy 4,033 s
postępu symulacji. Tak niski cap jest próbą techniczną poniżej wydajności SwiftShader,
nie zaleceniem do grania. Źródła dały 1,127 FPS w krótkiej próbie z inną fazą odświeżania.

Symulacja wykonywała znacznie więcej kroków niż wynikałoby z jednego kroku na render,
ale wskutek przeciążenia programowego renderera limit pięciu zaległych kroków odrzucił
część czasu. Nie ukrywamy tego jako prawidłowego odtwarzania pełnego czasu rzeczywistego.
Więcej o znaczeniu metryk i braku pomiaru A/B w `PERFORMANCE.md`.

## Co pozostaje do odbioru ręcznego

Rzeczywisty Firefox z PPM, sprzętowe GPU (w tym komputer użytkownika), dłuższa rozgrywka
na wszystkich trudnościach, kolizje w nietypowych miejscach, trwały zapis między sesjami,
publiczny hosting i kolejne misje. Nie wykonywano publikacji ani niezależnego review przez
innego agenta. Testy oraz przegląd zmian wykonano w tym samym środowisku autora.
