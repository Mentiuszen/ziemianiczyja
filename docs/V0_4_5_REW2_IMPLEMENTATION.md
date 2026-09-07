# Ziemia Niczyja 0.4.5 rew2 — raport implementacji

**Wersja gry: 0.4.5. Rewizja: 2.** Poprawki wdrożono na kopii dostarczonego
archiwum `ZiemiaNiczyja 0.4.5 rew1.zip`, a nie na ponownie pobranej wersji GitHub.
Nie utworzono brancha ani worktree; nie wykonano commita, pusha ani publikacji.

SHA-256 archiwum bazowego:
`fde001cbe78bc526b2fb2eea1e0cd47be3d6b01a8a07d027c2f7eb39428ab280`.

## 1. Wynik względem zamówienia

| Poprawka | Implementacja |
|---|---|
| Zbędny pasek przy HP | Usunięte `.health-bar` / `#hp-fill`, ich CSS i aktualizacje. Krzyż, liczba HP i wytrzymałość pozostają. |
| Ikony postawy | Trzy oryginalne wypełnione sylwetki żołnierza z hełmem i bronią, bez trójkąta i tła. Wspólne pole SVG 64×64, nominalna prezentacja 42×42 CSS px. |
| Broń za daleko od amunicji | Rozmiar modułu wynika z zawartości, bez `space-between` i dawnej pustej szerokości. Odstęp 10 CSS px przy 100%; viewBox broni przycięty do rysunku. |
| Wytrzymałość pod całym rzędem | Lewa krawędź pola postawy → prawa krawędź HP. Szerokość wyliczana z powiększonych elementów. Mnożnik wytrzymałości reguluje grubość paska, zachowując jego końce. |
| Napisy w stylu odniesienia | Turkusowy mówca z dwukropkiem, jasny tekst w tej samej linii, zawijanie i ciemny cień; bez panelu tła. Pełna obsługa PL/EN, komunikatów bez mówcy oraz wyłączenia napisów. |
| Pomijanie odprawy przy drzwiach | Fizyczne drzwi w istniejącym wschodnim wyjściu. Lokalna interakcja po podejściu i zwróceniu się do drzwi; wspólne otwieranie po skipie, naturalnym końcu i alarmie. |
| Changelog i rewizja | Dopisany nowy wpis, poprzednia historia zachowana. Metadane, manifest UI, autorstwo, instrukcja i testy uaktualnione. |

## 2. Układ HUD-u

Zmiany są lokalne w `src/ui/hud/hud.js`, `layout.js` i `src/ui/styles/hud.css`.
Zachowano mechanizm rezerwowania rzeczywistych rozmiarów modułów i cache geometrii.
Skalowanie nie obejmuje menu i F3. Limit wynikowy 200% pozostaje bez zmian.

Postawa i zdrowie są centrowane w jednym rzędzie także przy różnych mnożnikach.
Szerokość HP rezerwuje trzy cyfry, ale nie dawny 225-pikselowy panel z paskiem:
nie powstaje luka po usuniętym elemencie. Położenie końca liczby jest stabilne
przy spadku ze 100 do 9 HP. Pasek wytrzymałości ma domyślnie grubość 3 px.

Amunicja i licznik granatów wykorzystują rozmiary swojej zawartości. Dla pistoletu
przewidziano węższe pole rysunku niż dla karabinu; stary rysunek nie jest rozciągany.
Zmieniono tylko viewBox sześciu istniejących SVG broni, nie ich kształty ani kolory.

Na fizycznie zbyt małych ekranach pozostaje istniejący tryb kompaktowy. Nie jest
on deklaracją, że dowolna kombinacja treści i skali zawsze zmieści się na każdym
możliwym ekranie. W wykonanej macierzy nie wykryto nakładających się widocznych modułów.

## 3. Napisy i grafiki

Nowy mały moduł `src/ui/hud/subtitle.js` oddziela dane mówcy od treści. Nie parsuje
nazwiska z przypadkowego tekstu z dwukropkiem i nie używa `innerHTML`. Aktualizuje
istniejące spany przez `textContent`; komunikat systemowy czyści mówcę, a wygaśnięcie
czyści treść. Zmiana języka nie wymaga przebudowania drzewa napisów.

Kolor mówcy: `#7fd9d2`; treści: `#f4f4f0`. Typografia używa istniejącej rodziny
systemowej, bez dołączania fontów. Trzy ikony postawy to własne ścieżki SVG, nie
wycięte grafiki z CoD. `stance.js` nadal pokazuje zatwierdzone `player.stance`, a nie
sam klawisz — blokada wstania pod przeszkodą nie wyświetla błędnej ikony.

Podglądy z rzeczywistego DOM na neutralnym tle:

- `validation/v045-rew2/previews/hud-en-100.png`
- `validation/v045-rew2/previews/hud-en-200.png`
- `validation/v045-rew2/previews/health-stand.png`
- `validation/v045-rew2/previews/health-crouch.png`
- `validation/v045-rew2/previews/health-prone.png`

**Nie są to zrzuty wyrenderowanej sceny 3D.** Pokazują produkcyjny HUD z kontrolowaną
projekcją świata w teście przeglądarkowym.

## 4. Drzwi, kolizja i odprawa

`src/world/briefing-door.js` jest właścicielem dwóch pozycji skrzydeł i dwóch
zorientowanych colliderów. `Simulation.refreshDynamic()` dołącza je do istniejących
przeszkód dynamicznych. Aktualizacja odbywa się przed ruchem gracza; NPC i raycasty
widzą te same skrzydła. Zamknięte drzwi nie są tylko obrazkiem.

Wymiary dobrano do istniejącego otworu: szerokość 2,72 m, wysokość 2,36 m,
grubość bazowa 0,10 m. Zawiasy są na zewnętrznej stronie wschodniej ściany
(`x=39.18`, `z=-7.8`). Oba skrzydła otwierają się 90° na zewnątrz, przez 0,65 s czasu
symulacji; nie wpychają animacji do pomieszczenia pełnego żołnierzy. Po otwarciu nadal
mają kolizję w rzeczywistym miejscu, ale środek wyjścia jest drożny.

`Director.interaction()` i `interact()` używają wspólnego warunku: aktywna odprawa,
żywy gracz, zasięg 2,35 m do punktu uchwytu, odpowiedni kierunek patrzenia w poziomie
oraz brak innej przeszkody po drodze. Ray interakcji ignoruje tylko własne skrzydła,
żeby gracz mógł użyć zamkniętych drzwi; nie ignoruje ścian pokoju.

Interakcja wywołuje istniejące `skipBriefing()` → `startAssault()`. Naturalny koniec
odprawy i wcześniejszy alarm mają ten sam koniec przepływu. Otwarcie wylicza się
z zapisywanych już `director.phase`, `director.assaultTime` i `world.time`.
Nie dodano pola wymagającego migracji checkpointu ani nowego zegara czasu rzeczywistego.
Pauza nie kończy animacji drzwi w tle. Odtworzenie sprawdzono dla zamkniętych,
częściowo otwartych i otwartych drzwi.

`src/render/briefing-door-geometry.js` tworzy deski, poprzeczki, ukośne wzmocnienie,
zawiasy i uchwyt w trzech istniejących materiałach na skrzydło. To sześć meshów
łącznie, nie osobny draw call dla każdej deski. `BriefingDoorView` przenosi te same
pozycje i kąty na model; po zakończeniu otwierania nie przepisuje macierzy przy
każdym renderze. Drzwi są uwzględniane w lokalnej liście obiektów rzucających cień.
Weryfikacja obejmuje skończone współrzędne, normalne, winding wszystkich trójkątów
oraz zgodność pozycji colliders/render. Nie zastępuje to oględzin na działającym GPU.

## 5. Testy i faktycznie wykonana weryfikacja

| Próba | Wynik |
|---|---|
| Testy archiwum bazowego | 399 PASS, 0 FAIL, 0 SKIP |
| Pełny zestaw po zmianach | **413 PASS, 0 FAIL, 0 SKIP**; 14 nowych testów |
| `npm ci` | PASS; brak nowych zależności gry |
| `npm run build` | PASS; dwa przebiegi dały identyczne SHA-256 wszystkich 527 plików dist (w tym manifestu buildu) |
| `npm run check` | PASS: składnia 101 plików, importy, 15 modeli, 547/547 kluczy PL/EN, 27 hashy UI |
| Test Chromium dotychczasowego HUD-u | PASS: 40 konfiguracji + 8 mieszanych skal, minimapa DPR 2, F3, trafienia ADS i ostrzeżenia |
| Test Chromium rew2 | PASS: 32 konfiguracje + 12 mieszanych skal, końce stamina, bliskość amunicji, inline speaker, drzwi i bezpieczne napisy |
| Automatyczne przejście misji | PASS: 157,03 s czasu symulacji, faza 7, dwa checkpointy |
| Przejście z oboma czołgami zniszczonymi | PASS: 158,27 s czasu symulacji, faza 7, dwa checkpointy |
| Oddział odprawy | Regresja egress zachowana: wszyscy czterej mają trasę po otwarciu i nie zostają zablokowani w pokoju |
| Kontakt z otwieranymi skrzydłami | PASS: stanie/kucanie/leżenie i pozycje po zewnętrznej stronie drzwi |
| Pełny renderer 3D | **BLOCKED: Chromium nie udostępnia WebGL2 w tym środowisku** |

Chromium w wykonanych próbach: `144.0.7559.96`. Oba testy UI uruchamiają rzeczywistą
symulację i DOM interfejsu, lecz podstawiają kontrolowaną projekcję. Nie twierdzą,
że renderują grę. Zestaw testów zawiera też istniejącą weryfikację matematyki kamery
`GameView`, która nie wymaga kontekstu GPU.

Surowe wyniki znajdują się w `docs/validation/v045-rew2/`, a podsumowanie maszynowe
w `docs/V0_4_5_REW2_VALIDATION.json`. Początkowe testy nowych wymagań wykonano w stanie
RED; ich logi też dołączono. Historycznych wyników rew1 nie przypisano rew2.

### Zmiany w dotychczasowych testach

Nie usunięto regresji gry. Testy tras, które wcześniej zakładały zawsze otwarty otwór,
odpalają natarcie i otwierają drzwi przed badaniem trasy; dodatkowy przypadek wymaga
braku trasy przez zamknięte drzwi. Oryginalna kontrola wyjścia oddziału w 80 s pozostała.
Test liczby colliderów uwzględnia dwa skrzydła, a test remapowanego klawisza sprawdza
podpowiedź meldunku zamiast celowo usuniętej globalnej podpowiedzi skipu.
Dwa testy metadanych oczekują rewizji 2.

Autoplayer nie teleportuje się przez drzwi i nie wywołuje prywatnego skipu. Podchodzi
normalnym ruchem, używa interakcji i ponawia trasę, jeśli drzwi jeszcze się otwierają.
Produkcyjny kod AI, reguły obrażeń i poziomy trudności nie zostały zmienione.

## 6. Zachowane pliki i ograniczenia

**407 plików z `public/` i `vendor/` pozostało bajtowo identycznych z rew1.** W tych
katalogach zmieniły się trzy SVG postawy, sześć viewBox broni i manifest UI.
Zachowano modele, tekstury sceny, tła menu i vendora. Również dostarczony w rew1
`src/render/sky.js` pozostaje niezmieniony.

Nie wykonano pełnego testu obrazu 3D na fizycznym GPU, w Firefoxie ani przy monitorze
165 Hz. Nie ma nowej obietnicy poprawy p95/p99: ta rewizja dopracowuje HUD i początek
misji, zachowując poprzednią telemetrię. Drzwi wymagają końcowego wizualnego odbioru
w uruchomionej grze; kolizje, przepływ misji, geometria i opuszczanie pokoju zostały
sprawdzone niezależnie od GPU.

## 7. Dostarczenie

ZIP jest nakładką na rew1. Zawiera tylko nowe/zmienione źródła, SVG, testy i dokumenty,
bez `dist`, `.local`, cache, `node_modules` i fontów. **Nie ma plików do usunięcia.**
Po nałożeniu trzeba wykonać `npm run build`: stary `dist` z archiwum rew1 nie
aktualizuje się sam. Szczegóły: `INSTALL_0_4_5_REW2.md` w katalogu projektu.
Wykaz i SHA-256 plików dostarczonych w nakładce: `V0_4_5_REW2_MANIFEST.json`.
