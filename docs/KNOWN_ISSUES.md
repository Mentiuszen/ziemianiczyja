# Znane ograniczenia 0.4.3 — 6 września 2026

**Kod do lokalnego odbioru. Ten dokument nie potwierdza publikacji ani pełnego przejścia gry w przeglądarce.**

## Języki i bieżący odbiór

Cała własna warstwa tekstowa gry korzysta z katalogów PL/EN: menu, opcje, HUD,
cele, odprawa, komunikaty, interakcje, zapis, błędy i diagnostyka. Dokumenty otwierane
z ekranu informacji mają wersje angielskie. Nazwa projektu, nazwy własne sprzętu,
identyfikatory techniczne oraz oryginalne licencje zależności pozostają niezmienione.
Nie dodano dubbingu. Tekst na mapie odprawy ma osobny wariant EN; reszta obrazu pozostaje taka sama. Flaga English jest znakiem wyboru języka USA/UK, a nie nową frakcją.

Brak poprawnego `settings.language` uruchamia wybór języka, także po aktualizacji ze
starszej wersji. Nie wybiera się języka automatycznie na podstawie przeglądarki.
Zmiana w opcjach nie zmienia misji ani checkpointu. Przy odmowie pamięci lokalnej
wybór obowiązuje tylko w bieżącej sesji; po ponownym otwarciu wybór może wrócić.
Przywrócenie domyślnych opcji nie usuwa wybranego języka.

Sprawdzenie kompletu kluczy/parametrów nie zastępuje korekty językowej w całym przebiegu
misji. W szczególności lokalnie sprawdzić długie napisy i podpowiedzi przy małym oknie,
zmianę języka podczas pauzy, trwały zapis ustawień po restarcie przeglądarki oraz Firefox/Edge.
Wyniki wykonanych testów, zakres kontrolowanej próby DOM i ograniczenia WebGL/HTTP są
w `V0_4_3_IMPLEMENTATION.md`. Próba DOM bez sieci nie potwierdza trwałego IndexedDB,
pełnego renderu 3D, Pointer Lock ani działania na hostingu. Nie oznaczać ich jako PASS.

0.4.3 nie zmienia balansu, kolizji, liczby jednostek ani jakości modeli z 0.4.2.
`SAVE_VERSION=1` i `MISSION_VERSION=3` pozostają; poprawne zapisy 0.4.1/0.4.2 są obsługiwane.
Historyczne etykiety checkpointów i ogólne nazwy postaci są mapowane na stabilne klucze.
Nie przenosi się pozycji z niezgodnej starszej wersji mapy.

Poniżej zachowano wcześniejsze notatki wraz z ich datami i ówczesnym statusem;
nie są one raportem ponownego wykonania prób w 0.4.3.

---

# Znane ograniczenia 0.4.2 — 6 września 2026

**Kandydat do lokalnego odbioru; nie opublikowano wydania.**

## Aktualny zakres weryfikacji

Naprawy rozgrywki, AI, kolizji, zapisu i cyklu życia mają testy automatyczne.
Aktualne wyniki i lista uruchomionych plików są w `V0_4_2_IMPLEMENTATION.md`.
Nie utożsamiać ich z całym zestawem historycznych 134 testów ani z odbiorem balansu.
Pełny `npm test` w kompletnym checkoutcie pozostaje obowiązkowym krokiem lokalnym.

Nie przeprowadzono w tym środowisku grywalnego testu WebGL2 ani Firefoksa/Edge,
odsłuchu, pomiaru fizycznego GPU czy sesji ludzkich. Chromium blokuje lokalny adres
przez `ERR_BLOCKED_BY_ADMINISTRATOR`; niezależna próba utworzenia WebGL2 zwraca brak
kontekstu. `CAM-01` ma potwierdzony test rzeczywistej matematyki dołączonej kamery,
lecz regresja na pełnym `GameView` czeka na lokalne uruchomienie
`tools/browser_v042_camera.py`. Wynik BLOCKED nie jest PASS.

## Rozgrywka i zgodność

Nowe profile trudności są pierwszą iteracją: wymagają przejścia misji i prób
różnych seedów. Bot nadal zna mapę i wrogów; jego ukończenie z czołgami i bez nich
nie dowodzi właściwej trudności dla człowieka. Szczególnie sprawdzić ciasne przejścia,
płoty, obrót leżącej postaci, ustępowanie oddziału i finał z pobliskim przeciwnikiem.

Kolizja kadłuba używa teraz prostokąta obróconego zgodnie z yaw, z AABB tylko jako
wstępnym filtrem. Nadal nie jest to fizyka gąsienic, ragdoll ani symulacja pancerza.
Awaryjna korekta penetracji jest ograniczona i rejestrowana; nierozwiązywalny spawn
lub checkpoint zostaje odrzucony zamiast przeniesienia przez ścianę. Lokalne korekty
historycznych pozycji NPC mają osobny limit 1,25 m, a normalny odzysk 0,65 m.

Format pozostaje `SAVE_VERSION=1`, `MISSION_VERSION=3`. Poprawny checkpoint 0.4.1
ma jawne wartości domyślne dla nowych pól; niezgodna geometria starszych misji lub
uszkodzony stan nie są akceptowane. Nie kasuje się ustawień przy odrzuceniu zapisu.
Trudność checkpointu nie jest zastępowana wyborem nowej misji z menu. Zapis może być
odroczony bez końca, jeśli wciąż trwa bezpośrednie zagrożenie; ostatni dobry punkt
pozostaje zachowany. Trwały IndexedDB wymaga lokalnego odbioru na zwykłym originie.

Modele, tekstury, dźwięki, definicje mapy i Babylon pozostają z 0.4.1. Ich poprawa
jakościowa należy do 0.5. Poniższy tekst opisuje wcześniejsze próby, nie wyniki 0.4.2.

---

# Archiwum ograniczeń v0.4.1

## Przeglądarki i wydajność
Poprawka PPM usuwa zależność od kompatybilnego mousemove anulowanego po pointerdown.
Wykonano test strumienia zdarzeń bez mousemove i rzeczywiste wejście w Chromium.
**Nie wykonano realnego Firefoksa**: nie był zainstalowany, a próby instalacji/pobrania
nie powiodły się z powodu ograniczeń środowiska. To pozostaje najważniejsza próba użytkowa.
Nie należy wpisywać w raporcie „Firefox PASS”. Edge/Safari też nie były osobno uruchamiane.

Brak fizycznego GPU. SwiftShader wykonuje render programowo; przy przeciążeniu działa
celowe ograniczenie zaległych kroków symulacji. Przytaczane czasy takich testów nie są
predykcją FPS komputera użytkownika. Limit klatek jest limitem aplikacji, nie wyłączeniem
VSync przeglądarki. Wymagana mysz i klawiatura; małe okno nie oznacza wersji dotykowej.

## Oprawa i pojazdy
Samoloty to uproszczone, proceduralne sylwetki historycznych rodzin. Pięć autorskich przelotów
z dwoma zrzutami bomb; brak autonomicznych walk, celności pilotów, uszkodzeń płatowca i możliwości
zestrzelenia przez gracza. Nie jest to pełne zrealizowanie późniejszego systemu lotnictwa.
Działo 7,7 cm jest przybliżeniem wizualnym, bez deklaracji konkretnej fabrycznej odmiany.

Czołgi mają proste dynamiczne AABB i ograniczone sektory uzbrojenia, nie symulację gąsienic
stykających się z każdą nierównością, balistyki pancerza ani animowanych załóg. Lufy sponsonów
nie mają pełnej artykulacji odtwarzającej każdą korektę celowania. Ruch po autorskich korytarzach
może się chwilowo zatrzymać przed piechotą. Tylko dwa wskazane fragmenty drutu są niszczalne.
Nie obiecujemy zniszczenia wszystkich płotów przez dowolny pojazd.

Postacie mają sześć poprawionych modeli i twarzy w v0.4.1, z zachowanymi klipami;
animacje rozmowy wykorzystują postoje/obroty,
bez mimiki i nowego nagrania motion capture. Cały dźwięk jest syntetyczny. Brak dubbingu.
Worki mają zamknięte, skompresowane wypełnienie, a nie symulację fizycznie niezależnych worków.
Kolizje otoczenia i postaci są uproszczone; testy przekątnych nie dowodzą każdego możliwego
miejsca na całej mapie. Nie wprowadzono globalnego wyłączenia kolizji w celu obejścia problemów.

## Misja i kampania
Nadal tylko Cambrai. Brak ukończonych czterech pozostałych misji, testów ludzkiego czasu
12–20 minut i finalnego balansu. Bot zna pozycje wrogów i graf; jego czas ukończenia jest
wyłącznie testem przechodniości. Osiem jednostek rezerwy już istnieje na mapie, a nie pojawia
się na oczach gracza; przed obroną pozostaje na pozycjach. Są śmiertelne także wcześniej.

Brak niemieckich czołgów w tej misji wynika z wybranej daty, nie z niedziałającego przełącznika.
Nie dodano przenośnej broni przeciwpancernej z 1918 roku do Cambrai 1917. Gracz ucisza niemieckie
działo obsadą lub zamkiem, a nie walczy z fikcyjnym A7V. Materiały historyczne rozdzielone od
fikcyjnego planu lokalnego starcia znajdują się w HISTORY.md.

## Zapis i narzędzia
Wymagany nowy checkpoint z misji v0.4; nie ma migracji starej pozycji i faz. Ustawienia są
zachowane przy tym samym originie. Graficzne testy routowane z originem opaque sprawdzają
fallback pamięciowy, nie trwały IndexedDB po zamknięciu przeglądarki na zwykłym hostingu.

Build nadal jest statycznym narzędziem Node bez Vite. Nie wykonywano zdalnego workflow Pages
ani publikacji. Historyczne skrypty testowe v02/v03 pozostawiono dla odniesienia; bieżące
polecenia są w README. Samo wprowadzenie generatora nie oznacza nowego eksportu wszystkich
odziedziczonych modeli: nowe GLB wygenerowano, istniejące zasoby v0.3 zachowano.
