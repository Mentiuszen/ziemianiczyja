# Ziemia Niczyja / No Man’s Land 0.4.4 — rewizja 3

**Status: częściowa realizacja zamówienia R3. Punkty 2–4 wdrożone; punkt 1 niewykonany.**
Wersja pozostaje `0.4.4`, `UI_REVISION=3`. Nie wykonano commita, pusha, publikacji,
zmiany brancha ani worktree. Pracowano na kopii dostarczonych pełnych źródeł R2.

Baza: `ZiemiaNiczyja_0.4.4_R2_pelne_zrodla.zip`. SHA-256:
`41aea3f88943957c77afb2627ae56f81e555f3f323e2edf03225f2b81b11a53f`.

## 1. Wynik względem zamówienia

| Punkt | Stan | Rzeczywisty zakres |
|---|---|---|
| Nowe grafiki o wyższej rozdzielczości | **NIEDOSTARCZONE** | Próby generowania nie dały użytecznych, samodzielnych teł. Main, języki i opcje nadal korzystają z R2; ich bajty są niezmienione. |
| Angielski tytuł i logo | Wdrożone | No Man’s Land w English, Ziemia Niczyja w Polski; osobny SVG EN, tytuł karty, opis strony i projektu, dostępny fallback logo. |
| Trudność wyłącznie w kampanii | Wdrożone | Usunięta z Opcji, ustawiana przy nowym przebiegu i zmieniana dla checkpointu w Kontynuacji kampanii. |
| Płynne przejścia frontu | Wdrożone | Morph polilinii, przejście strzałek, zgodny ruch kamery, obsługa ponownego wyboru, pominięcia i reduced motion. |

**To nie jest ukończony komplet R3.** Nie dołączono kolejnych plansz UI jako rzekomo
nowych teł ani nie nazwano zwykłego skalowania „regeneracją 4K”. Rozmycie obrazu
menu z R2 pozostaje. Dostarczone logo EN jest natomiast wektorowe.

## 2. Istotne kontrakty

### Nazwa gry

Katalogi zawierają `app.title` i `page.title`. `updateDocumentLanguage()` zmienia
kartę, metadane i dostępność; main wybiera `logo.svg` / `logo-en.svg`. Błąd wczytania
logo zachowuje właściwy tekst językowy. Polski tytuł nie jest pokazywany jako nazwa
gry w angielskim main/opisie projektu. Techniczne ID `ZiemiaNiczyja`, nazwa bazy,
klucz ustawień i repozytorium nie są tłumaczone; stare dane i skrypty pozostają zgodne.

### Trudność kontynuacji

`difficulty` pozostaje walidowaną preferencją kampanii, ale jej kategoria to
`campaign`, a nie żadna zakładka Opcji. Reset kategorii nie zmienia tej wartości.
`Application.changeSetting()` przekazuje ją do wydzielonego kontrolera, który
odmawia działania poza mapą kampanii, w trakcie ładowania, w niegrywalnym rozdziale,
przy otwartym modalu i podczas oczekiwania na poprzedni zapis.

Nowa kampania zapisuje tylko wybór dla nowego startu. Kontynuacja klonuje checkpoint,
zmienia wyłącznie jego `difficulty` i odświeża odpowiadający `checkpointRef`. Store
zapisuje parę w istniejącej jednej transakcji. Run ID, HP, amunicja, RNG, postęp,
pozycje i trwające timery są zachowane. Po wznowieniu istniejący `Simulation.restore`
ustawia właściwy profil obrażeń/regeneracji. Nie leczy to postaci ani nie odnawia akcji.

Wyjście anuluje niezatwierdzony zapis przez istniejącą generację/abort. Zatwierdzona
transakcja jest granicą przyjęcia zmiany; późniejszy powrót nie obiecuje rollbacku.
Przy odmowie pamięci pojawia się komunikat o sesyjnym profilu; stare dane trwałe
nie są opisywane jako zastąpione. Ukończony przebieg nie zmienia po fakcie swojej
trudności — jego powtórzenie przechodzi przez świadome rozpoczęcie nowej kampanii.

### Przejścia mapy

`FrontTransition` jest czystym modelem prezentacji z czasem około 0,9 s. Wyznacza
korespondencję punktów polilinii według długości i zachowuje narożniki obu stanów,
z ograniczeniem do 512 próbek przy intensywnym przełączaniu. Kolejny wybór zaczyna
od wyświetlonej geometrii i krycia strzałek. Końcowy kształt jest dokładną polilinią
R2; nie zmieniono danych historycznych ani ich generalizacji.

Warstwa SVG nie jest zastępowana przez `innerHTML` przy każdym wyborze. Zmieniane
są ścieżki i krycie istniejących elementów. Przejściowa linia ma etykietę przejścia,
nie fikcyjną datę. Zmiana języka i powrót z opcji nie powtarzają animacji. Pomiń
oraz ograniczenie ruchu kończą przejście natychmiast. Nie jest używany RNG gry.

## 3. Faktycznie wykonana weryfikacja

| Próba | Wynik |
|---|---|
| Pełne testy bazy R2 | 343 PASS, 0 FAIL |
| Nowe przypadki R3 | 12; przed zmianami 10 wykazywało brak wymaganych zachowań, 2 chroniły zachowany kontrakt |
| Pełny `npm test` po zmianach | **355 PASS, 0 FAIL, 0 SKIP** |
| `npm ci`, `npm run check` | PASS; składnia/importy, 15 GLB, 491/491 kluczy i 20 hashy eksportów UI |
| Build | PASS; dwa identyczne manifesty, wersja 0.4.4 i uiRevision 3 |
| Autoplay | PASS; 161,73 s czasu symulacji, faza 7 i 2 checkpointy |
| Autoplay z oboma zniszczonymi czołgami | PASS; 158,32 s czasu symulacji, faza 7 i 2 checkpointy |
| Chronione źródła/zasoby | 433 pliki bajtowo niezmienione; silnik, modele, teren, AI, walka, audio, wejście i vendor |
| Chromium DOM | 17 sprawdzeń PASS; tytuły, logo, kategorie, stan frontu po drodze i na końcu, zachowanie DOM, trudność kontynuacji |
| Zwykły HTTP w Chromium | **BLOCKED — ERR_BLOCKED_BY_ADMINISTRATOR** przed wykonaniem strony |
| Nowe wysokorozdzielcze tła | **NIEDOSTARCZONE** |

Test DOM wykonywał produkcyjne moduły z przepisanymi adresami importów w
`about:blank`, źródłowy CSS i faktyczne bajty zasobów. Preferencje były pamięciową
atrapą; natywne IndexedDB nie było dostępne. Kontynuację sprawdzano prawdziwym
Store w trybie sesyjnym i rzeczywistym fixture checkpointu, bez tworzenia GameView.
To nie jest odbiór pełnego renderera, trwałego zapisu ani wydajności fizycznego GPU.
Oryginalne testy zmieniono tylko tam, gdzie jawnie zmieniono kontrakt: brak trudności
w Opcjach, lokalizowana ścieżka logotypu i numer rewizji. Nie usunięto regresji gry.

## 4. Lokalny odbiór

Nałożyć ZIP **albo** patch na R2. Nie usuwać plików i nie uruchamiać czyszczenia R1.
Przed podmianą zabezpieczyć lokalne zmiany. Odbudować `dist`.

```sh
npm ci
npm run check
npm test
npm run build
npm run dev
```

Opcjonalny rzeczywisty odbiór w osobnym profilu:

```sh
python tools/browser_v044_r3.py --url http://127.0.0.1:5173/ --headed --game
```

Sprawdzić EN/PL i brak logo w cache, wszystkie kategorie opcji, wybór przy nowym
starcie i kontynuacji, odświeżenie przeglądarki po zmianie profilu, odmowę zapisu,
anulowanie oczekującej zmiany, szybkie przełączanie pięciu misji, Pomiń,
wyłączenie animacji oraz zmianę języka podczas przejścia frontu.
Nie uznawać aktualnych teł R2 za spełnienie punktu 1.

Wyniki maszynowe: `docs/V0_4_4_R3_VALIDATION.json`.
