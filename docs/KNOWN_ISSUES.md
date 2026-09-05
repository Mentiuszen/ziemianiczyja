# Znane ograniczenia v0.4.1

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
