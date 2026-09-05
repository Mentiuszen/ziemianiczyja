# Ziemia Niczyja — v0.3.0

Przeglądarkowy FPS osadzony w I wojnie światowej. Grywalna jest **jedna misja pokazowa:
nr 04, „Pęknięta linia” — Cambrai, 20 XI 1917**. Cztery pozostałe misje nadal są planowane.
v0.3 rozszerza istniejący prototyp, a nie zastępuje go innym projektem.

## Co zmieniła v0.3

Naprawione zewnętrzne powierzchnie skrzyń, ścian i innych obiektów, poprawiona geometria
importowanych modeli, nowe materiały otoczenia, zaokrąglone worki z piaskiem, bogatsze
skrzynie, ruiny z otworami i resztkami belek, nowe bronie i dłonie FPS oraz teksturowany Mark IV.
Sześć modeli piechoty: trzy warianty brytyjskie i trzy niemieckie, każdy z trzema LOD,
szkieletem i 13 klipami. Są to autorskie proceduralne modele retro, nie assety fotorealistyczne.

Teren ma **216 × 272 m** zamiast 144 × 192 m: 58 752 m², czyli 2,125 raza większą powierzchnię.
To rozmiar renderowanego terenu; prostokąt ograniczeń ruchu ma 186 × 236 m. Dodano zaplecze,
dłuższy zachodni łącznik, drogę z koleinami, pięć dodatkowych ruin gospodarstw, nowe osłony,
89 lejów, fragmenty płotów i płytkie kałuże. Północny cel z telefonem przeniesiono o 40 m.
Mapa jest fikcyjnym wycinkiem frontu, nie rekonstrukcją topografii historycznego Cambrai.

Kolizje obejmują żywych NPC, ogrodzenia, podpory, skrzynie, ściany i istotne przeszkody.
Nawigacja uwzględnia deski, stopnie i pozycję czołgów. Są mocniejsze efekty wybuchów:
krótki błysk, rozchodzący się pył, drobiny ziemi, ślad na gruncie i ograniczony wstrząs.
Obrażenia dają kierunkowy sygnał, winietę i subtelne ostrzeżenie niskiego HP.

## Aktualizacja z v0.2 — ważne

**Rozpakuj do nowego folderu, zatrzymaj stary serwer i uruchom nowy.** Nie podmieniaj samego
JavaScriptu: materiały, GLB, kod i CSS stanowią jeden komplet. Po zmianie wersji odśwież
stronę bez cache, gdy nadal pokazuje 0.2. Nie trzeba usuwać danych witryny.

**Checkpointy mapy v0.2 nie są zgodne z v0.3. Rozpocznij nową misję.** Walidator pokazuje
komunikat zamiast umieszczać postacie wewnątrz zmienionych przeszkód. Ustawienia pozostają
pod tym samym kluczem i są zachowane, o ile korzystasz z tego samego originu/portu.
Nie przeprowadzono automatycznej migracji pozycji starych zapisów.

## Uruchomienie projektu

Node.js 20 lub nowszy. Projekt ma lokalny Babylon.js 8.46.2, moduły ES i własne skrypty
statyczne Node. **Nie wymaga pobierania zależności gry i nadal nie używa Vite.**

```bash
npm ci
npm run dev
```

Otwórz adres wypisany przez serwer (domyślnie `http://localhost:5173/`). Wybierz misję,
potwierdź odprawę, poczekaj na zasoby i kliknij wejście na front. Kliknięcie uruchamia
Pointer Lock i audio. Wymagane są desktopowa przeglądarka z WebGL2, klawiatura i mysz.
Nie uruchamiaj `index.html` przez dwuklik / `file://`.

```bash
npm run build
npm run preview
```

Preview domyślnie podaje `http://localhost:4173/`. Pełny projekt zawiera gotowy `dist`.
Osobny ZIP z buildem zawiera zawartość strony bez nadrzędnego folderu. Umieść ją na hostingu
HTTP/HTTPS; gracz nie potrzebuje Node. Nie ma backendu, CDN, kluczy API ani usług generatywnych.
Workflow Pages jest przygotowany, ale nie był uruchamiany zdalnie. Niczego nie opublikowano.

## Grafika i diagnostyka

| Preset | Mapa cieni / promień | Normal mapy | LOD piechoty: bliski / średni | Zasięg dekoracji | Limit aktywnych efektów |
|---|---|---|---|---|---|
| Low | wyłączone | wyłączone | 12 / 36 m | 38 m | 72 |
| Medium | 1024² / 32 m | włączone | 20 / 54 m | 64 m | 128 |
| High | 2048² / 48 m | włączone | 30 / 78 m | 92 m | 208 |
| Ultra | 4096² / 64 m | włączone | 42 / 105 m | 130 m | 320 |

Presety zmieniają też filtr cieni, anizotropię, warstwy trawy i liczbę cząstek wybuchu.
**Nie zmieniają AI, liczby przeciwników, obrażeń, kolizji ani celów misji.** Skala renderowania
jest osobnym ustawieniem, nie ukrytym mnożnikiem presetu. Medium to ustawienie domyślne.
Ultra nie oznacza ray tracingu ani nowego zestawu assetów.

Włącz niezależnie „Pokaż FPS i czas klatki”, „Pokaż czas CPU” i „Pokaż czas GPU”. F3 pokazuje
rozszerzoną diagnostykę. FPS/czas klatki mierzy odstępy requestAnimationFrame; CPU mierzy
pracę aplikacji na głównym wątku, a GPU używa asynchronicznych WebGL timer queries.
Brak timera jest jawnie oznaczony, nie zastępowany liczbą z FPS. CPU i GPU nie sumują się
wprost do czasu klatki. W ustawieniach można wyłączyć efekty obrażeń lub zmniejszyć kołysanie.

Większa mapa, detale i bogatsze materiały kosztują więcej niż v0.2. Nie deklarujemy wzrostu
FPS ani 60 FPS na Twoim sprzęcie. Pomiary programowego renderera i kompromisy: [PERFORMANCE](docs/PERFORMANCE.md).

## Sterowanie

| Działanie | Klawisz / przycisk |
|---|---|
| Ruch / bieg | WASD / lewy Shift |
| Celowanie / strzał | PPM / LPM; oba mogą być wciśnięte razem |
| Przeładowanie / broń | R / 1, 2 albo kółko myszy |
| Interakcja | E |
| Kucanie / leżenie / skok | C / Z / spacja |
| Granat / wręcz | G / V |
| Pauza / diagnostyka | Esc / F3 |

Klawisze zmienisz w menu. Utrata fokusu zatrzymuje grę; powrót wymaga świadomego wznowienia.
Żywy sojusznik nie jest już przenikalny: obchodź go lub podejdź, aby ustąpił miejsca.
Kolizje postaci są uproszczone, nie ragdollowe. Zwłoki nie blokują ciasnych przejść.

## Testy i narzędzia

```bash
npm test
npm run check
node tools/autoplay.mjs
python tools/test_asset_geometry.py
```

Opcjonalne testy przeglądarkowe wymagają Python 3, Playwright, Pillow, Chromium oraz Xvfb
na bezekranowym Linuxie. Nie są zależnościami uruchomienia gry ani `npm ci`.

```bash
xvfb-run -a python tools/browser_v03_regression.py
xvfb-run -a python tools/browser_v03_regression.py --dist --prefix=test-repo
xvfb-run -a python tools/browser_smoke.py --cycles 10
python tools/http_smoke.py
xvfb-run -a python tools/render_v03_contracts.py
xvfb-run -a python tools/showroom_v03.py
xvfb-run -a python tools/scene_v03.py
xvfb-run -a python tools/benchmark_v03.py --baseline /sciezka/do/v0.2.0 --samples 45
```

Testy tej paczki używały Chromium / SwiftShader, **nie fizycznego GPU**. Routowane pliki
działają pod dokumentem z originem opaque; nie jest to potwierdzenie trwałego IndexedDB
po zamknięciu przeglądarki na normalnym hostingu. Firefox nie jest zweryfikowany.
Szczegółowe wyniki oraz brakujące testy: [TEST_REPORT](docs/TEST_REPORT.md).

## Regeneracja zasobów

Zasoby są gotowe; generowanie przed grą nie jest potrzebne. Pełny łańcuch offline wymaga
Python 3, numpy, scipy i Pillow. Może trwać kilka minut.

```bash
python tools/regenerate_assets.py
npm test
npm run check
npm run build
```

Nie uruchamiaj jedynie starego `generate_assets.py`: nadpisuje bazowe modele, które późniejsze
etapy zastępują wersją v0.3. Tekstury GLB w `public/assets/models/textures/` muszą pozostać
obok modeli. Nie przenoś samych GLB bez atlasów. To zasoby autorskie, z rejestrem w
[ASSET_LICENSES](ASSET_LICENSES.md). Budżety i ograniczenia postaci: [CHARACTER_ART](docs/CHARACTER_ART.md).

## Granice wydania

Jedna misja, proceduralne modele i animacje, syntetyczny dźwięk, proste hitboxy i AI,
brak pełnej destrukcji, gęstego dymu taktycznego, IK stóp i dopracowanego balansu kampanii.
Nie potwierdzono czasu 12–20 minut dla człowieka. [KNOWN_ISSUES](docs/KNOWN_ISSUES.md)
opisuje konkretne ograniczenia zamiast oznaczać cały master prompt jako ukończony.
