# Znane ograniczenia v0.2.0

## Zweryfikowany zakres, nie pełna gra

Grywalna jest tylko misja nr 04 — Cambrai. Pozostałe cztery misje, docelowy czas 12–20 min,
pełny balans i końcowa jakość oprawy nie są ukończone. Poprawki v0.2 nie dodają kampanii.

## Sterowanie i przeglądarki

Rzeczywiste kombinacje LPM/PPM, blokada kursora, pauza i checkpoint zostały sprawdzone
w Chromium. Braku strzału w v0.1 nie udało się tam odtworzyć: naprawiono odkryte ryzyko
konkurujących Pointer/Mouse Events i dodano regresje, lecz nie stwierdzamy tym samym
potwierdzenia naprawy na komputerze użytkownika. Firefox nie został wykonany — pobranie
silnika testowego zakończyło się błędem DNS. Edge/Safari również nie były oddzielnie testowane.

Gra wymaga myszy, klawiatury i Pointer Lock. Test responsywności 320×568 nie oznacza
obsługi sterowania dotykowego ani gotowości wydania mobilnego.

## Grafika

Mundury i oporządzenie są znacznie bogatsze niż v0.1, ale postacie pozostają proceduralną
oprawą retro. Twarze, dłonie, blendy animacji, chwyty i modelowanie części wyposażenia
wymagają dalszej pracy. Nie ma gwarancji muzealnej zgodności wszystkich detali. Broń i dłonie
pierwszoosobowe oraz czołgi nie zostały kompleksowo zastąpione w tej aktualizacji.

LOD ma przejścia bez crossfade. Cienie są lokalne i mogą zmieniać widoczność na granicy
obszaru; dalekie postacie i cienki drut/trawa nie otrzymują pełnej kosztownej projekcji.
Mapa nadal korzysta z prototypowych tekstur i uproszczonego terenu.

## Wydajność i zapis

Nie wykonano pomiaru na fizycznym GPU. Wyniki A/B pochodzą ze SwiftShader; nie są obietnicą
60 FPS. Podział geometrii ogranicza liczbę renderowanych trójkątów, ale zwiększa liczbę draw
calls i w scenie startowej średni koszt CPU względem bazowego testu — opisano to jawnie
w PERFORMANCE.md. Efekty mają limit wizualnych instancji; symulacja wybuchu nie znika,
gdy wizualny pool jest pełny.

Przeglądarka może nie udostępniać timera GPU. Wówczas interfejs pokazuje brak pomiaru,
nie 0 ms. Wskaźnik CPU mierzy aplikację na głównym wątku, nie całkowite obciążenie maszyny.

Z uwagi na opaque origin testów graficznych nie zweryfikowano trwałego zapisu po zamknięciu
przeglądarki na zwykłym hostingu. Testowano walidację, snapshot, odtwarzanie i jawny fallback
pamięciowy. Dane nadal są lokalne dla konkretnego originu/portu.

## Narzędzia i publikacja

Build pozostaje statycznym narzędziem Node, bez Vite. Lokalny vendor Babylon Viewera
zawiera nieużywane moduły; przyszła kontrolowana migracja do oficjalnych paczek może go
odchudzić. Nie uruchamiano zdalnie workflow Pages, nie publikowano gry i nie sprawdzono
prawdziwego hostingu/CDN. Syntetyczny Web Audio nie zastępuje docelowego udźwiękowienia.
