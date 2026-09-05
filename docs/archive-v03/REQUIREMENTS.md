# Rejestr wymagań v0.3

**Z**: zaimplementowane i zweryfikowane w podanym zakresie. **P**: prototyp / częściowe.
**N**: niewdrożone lub niezweryfikowane. Ocena upgrade'u nie oznacza ukończenia master promptu.
Pełny historyczny rejestr v0.2: `archive-v02/REQUIREMENTS.md` w paczce źródłowej.

## Dziewięć punktów uzgodnionej aktualizacji

| Punkt użytkownika | Implementacja | Dowód | Status / granica |
|---|---|---|---|
| 1. Bug powierzchni modeli | geometry-data, generator profile/ellipsoid | unit winding, Python primitive tests, render front/back pixels | Z w Chromium; nie audyt każdego obiektu z każdej strony |
| 2. Lepsze modele | nowe GLB FPS, Mark IV, worki/skrzynie/ruiny | import 12 GLB, galerie i zrzuty | Z upgrade; P docelowy art |
| 3. Grafika | materiały, normal maps, światło, mgła, trawa, kałuże | source/dist render, alpha-cutout pixels | Z upgrade; brak RT/SSAO/SSR |
| 4. Granaty/efekty | bounded Effects + effect-particles | budget tests, 250 eksplozji, flash/dust screenshots | Z; drobiny kosmetyczne |
| 5. Low/Medium/High/Ultra | quality.js, ustawienia, GameView | cztery rozmiary shadow map + niezmienione 28 NPC, przywracanie normal map | Z |
| 6. Kolizje | layout, indeks, capsule move, actor blocking, navigation | cienki płot, NPC/self/dead, deska, droga obok telefonu/czołgu, ray parity | Z wybrane regresje; P każda szczelina świata |
| 7. Większa mapa | world-map, terrain, layout, cambrai/director | rozmiary, 89 lejów/5 ruin, autoplay i checkpointy | Z rozbudowa; P realizm historyczny i balans |
| 8. Obrażenia/niski HP | damage-feedback, UI, damageYaw | helper tests + rzeczywiste world.damage, kierunek 90°, wyłączenie, pause | Z |
| 9. Postacie + warianty | appearanceFor, 6 GLB, 3 LOD | deterministyczny dobór, wszystkie sześć użyte w scenie, front/back/LOD | Z warianty; P finalne twarze/IK/animacja |

## Zachowane fundamenty

| Wymaganie master promptu | Zakres bieżącej wersji | Status |
|---|---|---|
| Statyczna aplikacja WebGL2, menu bez bitwy | ES modules, lokalny Babylon, build Node; test root/subpath | Z |
| Vite / oficjalny tree-shaken runtime | nadal własny build i odziedziczony vendor | N |
| Pełne pięć misji | tylko misja 04 ma mapę i logiczny przebieg | P |
| 12–20 minut / balans / dramaturgia | brak wiarygodnego pomiaru ludzkiego przejścia | N |
| Walka obu stron, ograniczona amunicja, osłony | zachowane istniejące testy i logika | Z dla testów; P pełny odbiór AI |
| HP100, regeneracja6s/12HPs, apteczka50 | unit i obecna implementacja | Z |
| Dwa checkpointy, zdarzenia once, brak duplikacji posiłków | logiczny autoplay + browser checkpoint restore | Z |
| Trwały IndexedDB na prawdziwym originie | walidacja/fallback tak, trwałość po zamknięciu brak testu | P |
| LPM/PPM, Esc, focus, responsywne menu | zdarzenia przeglądarkowe, 8 viewportów | Z Chromium |
| Firefox / Edge / sprzętowy GPU | brak zakończonego testu | N |
| Wydajność, FPS/CPU/GPU | rzeczywiste wskaźniki + diagnostyczny test SwiftShader | Z pomiar; N obietnica 60 FPS |
| Wielokrotne ładowanie / sprzątanie | dziesięć cykli, engine/scene/audio = 0 po wyjściu | Z; nie dowód braku każdego natywnego wycieku |
| Pełne audio, destrukcja, taktyczny dym, Mark I/V | niewdrożone; dźwięk syntetyczny, pył kosmetyczny | P/N |
| Źródła, dokumentacja, licencje, brak publikacji bez zgody | repo/paczki i raport, bez nowych branchy/pusha | Z |

Wyniki wykonanych poleceń i środowisko: `TEST_REPORT.md`. Historyczne liczby testów v0.1/v0.2
nie są wliczane drugi raz do liczby testów bieżącej wersji.
