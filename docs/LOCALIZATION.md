# Lokalizacja PL/EN — 0.4.4, rewizja 3

## 0.4.4 rewizja 3

Tytuł to `app.title`: **Ziemia Niczyja** w PL i **No Man’s Land** w EN.
Wektorowe logotypy `logo.svg` / `logo-en.svg` oraz `page.title`, opis strony
 i opis projektu są zgodne z wyborem. Katalogi mają po 491 kluczy.
Techniczne ID, `window.ZiemiaNiczyja`, nazwę repozytorium i magazynu zachowano,
żeby zmiana języka nie powodowała utraty danych ani zgodności narzędzi.
Dodano komunikaty trudności kampanii i przejścia frontu; nie wypalono ich w mapie.

## 0.4.4 rewizja 2 — zakres historyczny

Dodano PL/EN dla strzałek wyboru, przełączników, datowanego frontu, podsumowań pięciu rozdziałów i oszczędnego HUD-u. Katalogi mają po 482 klucze. Zmiana języka zachowuje wybraną misję, jej datę i widok; małe etykiety oraz błędy pozostają tekstem DOM. Obrazy nie zawierają tłumaczeń; wyjątkiem jest nazwa własna w logotypie.


## Zakres i granica odpowiedzialności

Gra ma dwa języki tekstowe: `pl` i `en`. Obejmuje to menu, opcje, sterowanie, HUD,
cele, wszystkie siedem wypowiedzi odprawy, napisy zdarzeń, interakcje, komunikaty
zapisu i ładowania, własne komunikaty błędów, diagnostykę oraz dokumenty dostępne
z ekranu autorów. Nazwa gry przełącza się zgodnie z R3. Nazwiska, nazwy własne broni,
jednostki i techniczne identyfikatory pozostają niezmienne. Nie dodano dubbingu.
Dokumentacja dla programistów, komentarze i oryginalne teksty licencji nie są częścią
przełączanej warstwy interfejsu.

Symulacja nie podejmuje decyzji na podstawie języka. Renderer/UI przedstawiają ten
sam stan. Przełączenie nie zmienia czasu, RNG, obrażeń, AI, położenia, amunicji,
trudności ani dostępnych dróg. Nie tworzy nowej sceny ani nie przywraca checkpointu.

## Start i ustawienia

`Store.settings()` przyjmuje `language` tylko wtedy, gdy ma wartość `pl` albo `en`.
Brak, `null`, błędna wartość i ustawienia sprzed 0.4.3 pozostawiają `language: null`.
Pozostałe poprawne ustawienia i przypisania klawiszy są zachowane.

`Application` ustala pierwszy ekran przed wywołaniem `UI.render`:

- brak języka → `language-select`;
- poprawny język → `main` w tym języku.

Picker jest dwujęzyczny: English z łączoną flagą USA/UK po lewej, Polski z polską
flagą po prawej. Natywne przyciski obsługują mysz, Tab, Enter i spację. Escape ani
inna akcja menu nie omijają wyboru. Przed wyborem nie jest wczytywany checkpoint,
moduł renderera, modele ani scena. Nie uruchamia się Pointer Lock ani AudioContext.

`selectLanguage` waliduje wartość, aktualizuje preferencję i język dokumentu, zapisuje
ustawienia, a następnie otwiera menu lub odświeża obecny ekran. Przy pierwszym wyborze
uruchamia jeden odczyt checkpointu. Spóźniony wynik odczytu nie przywraca menu nad
innym ekranem i nie nadpisuje świata nowej generacji.

Preferencja jest przechowywana pod dotychczasowym kluczem `zn-settings-v1`, niezależnie
od danych misji w IndexedDB. Reset opcji zachowuje język i istniejący kontrakt klawiszy.
Wczytanie checkpointu nie zmienia języka. Brak dostępu do pamięci nie blokuje gry:
ustawienie pozostaje aktywne w pamięci aplikacji do zamknięcia lub przeładowania strony.
Nie ma automatycznego wyboru według języka systemu lub przeglądarki.

## Katalogi i komunikaty

`src/i18n/pl.js` i `src/i18n/en.js` zawierają po **387 kluczy**. Katalogi są płaskie,
mają identyczne klucze i identyczne zestawy nazw parametrów. Są lokalnymi modułami JS;
nie wymagają serwera tłumaczeń ani dodatkowej zależności npm.

`src/i18n/message.js` nie importuje UI, DOM ani obu słowników. Tworzy deskryptory:

```js
import {message} from './i18n/message.js';
const notification = message('storage.saved');
```

Zdarzenia symulacji i dane misji używają takiego `{key, params}`, a nie gotowego
polskiego lub angielskiego zdania. Prezentacja rozwiązuje deskryptor dopiero przy
wyświetleniu; dlatego aktywny napis może zmienić język bez odgrywania zdarzenia od nowa.

`src/i18n/index.js` udostępnia:

| API | Zastosowanie |
|---|---|
| `setLanguage`, `getLanguage`, `isLanguage` | Bieżący język prezentacji i ścisła walidacja |
| `t(key, params)` | Tekst w bieżącym języku |
| `translate(language, key, params)` | Jawny język; np. dwujęzyczny picker |
| `text(value, params)` | Rozwiązanie deskryptora, parametry kontekstowe i zagnieżdżone komunikaty |
| `number(value, digits)` | Buforowany `Intl.NumberFormat` odpowiedni dla PL/EN |
| `LocalizedError`, `errorText` | Własne błędy z kluczem i parametrami |
| `updateDocumentLanguage` | `html.lang`, opis strony i etykieta płótna |

Brak klucza lub wymaganego parametru jest błędem programistycznym i powoduje wyjątek;
nie jest cicho zastępowany polskim zdaniem lub `[object Object]`. Własne komunikaty
błędów są renderowane według aktualnego języka. `LocalizedError.message` zachowuje
polski tekst diagnostyczny dla zgodności istniejących narzędzi, ale UI używa `key/params`.
Nieznane wyjątki przeglądarki otrzymują tłumaczone objaśnienie i techniczną nazwę typu;
nie wstawiamy do interfejsu dowolnej treści błędu w języku systemu.

Teksty katalogów nie zawierają HTML. UI interpoluje parametry, a potem koduje znaki
HTML, zanim użyje `innerHTML`. Dynamiczne klawisze są pobierane z bieżącego mapowania,
nie z zaszytego `[E]`. Pełne zdanie jest jednym wpisem, zamiast sklejania odmian słów.

## Przełączenie w trakcie misji

`UI.refreshLanguage()` lokalizuje stałe etykiety HUD, ponownie renderuje aktywne menu
oraz zachowuje fokus ustawienia i przewinięcie panelu. Aktualizuje trwający toast,
komunikat checkpointu, napisy, cel i podpowiedzi. Nie wydłuża ich timerów. Ładowanie
przechowuje deskryptor i postęp; jego odświeżenie nie uruchamia importu ponownie.

`GameView.setLanguage` przełącza teksturę podpisu mapy na stole odprawy przez
`SupportView.setLanguage`. Oba lokalne warianty są przygotowywane razem ze sceną.
Odświeżenie `render(false)` nie wykonuje kroku symulacji. Tekstury są własnością sceny
i zwalnia je istniejące `scene.dispose()`.

## Zapis i zgodność

`SAVE_VERSION=1` i `MISSION_VERSION=3` pozostają bez zmian. `lastCheckpoint` nowych
zapisów używa stabilnego klucza (`checkpoint.bennett`, `checkpoint.telephone`), nie
przetłumaczonego zdania. `src/i18n/legacy.js` jawnie mapuje historyczne etykiety
„Początek misji”, „Meldunek Bennetta” i „Punkt łączności”. To migracja historycznego
zapisu, nie ogólny mechanizm podmieniania polskich tekstów podczas renderowania.

Nazwy funkcyjne NPC są odtwarzane według stabilnego ID/roli; właściwe imiona i nazwiska
pozostają. Stare legalne snapshoty 0.4.1/0.4.2 nadal przechodzą dotychczasową walidację.
Starsze niezgodne wersje mapy nadal są odrzucane, z komunikatem w wybranym języku.

## Flagi, tekst w świecie i dokumenty gracza

`public/assets/ui/flag-en.svg` i `flag-pl.svg` to własny kod wektorowy. Angielski kafel
ma USA w górnej/lewej części i UK w dolnej/prawej części, z podziałem od lewego dolnego
do prawego górnego rogu. Flagi są dekoracyjne dla czytnika ekranu; język identyfikuje
widoczny tekst przycisku z właściwym atrybutem `lang`.

Oryginalny `briefing-map.jpg` ma napis „SEKTOR FIKCYJNY - PLAN ODDZIALU”. Angielski
`briefing-map-en.png` tłumaczy go jako „FICTIONAL SECTOR - SQUAD PLAN”. Nie zmienia
mapy gry, siatki ani treści poza prostokątem podpisu. Oryginalny JPEG pozostaje
bajtowo niezmieniony. Metadane `briefing-map-en.json` zapisują źródło, jego SHA-256,
klucz katalogu, tekst i SHA-256 obrazu wynikowego.

Po zmianie źródłowej mapy lub `world.mapLegend` odtwórz wariant:

```sh
python tools/generate_localized_map.py
npm run check
```

Generator wymaga Pillow, już używanego przez narzędzia zasobów. Jest dołączony jako
ostatni krok `regenerate_assets.py`; sama gra i normalny build nie wymagają Pythona.
Angielski obraz jest wersjonowany, a kontrola sprawdza zgodność katalogu i skrótów.

Ekran autorów wybiera odpowiedniki `.en.md` dla `ASSET_LICENSES.md`, `HISTORY.md` i
`KNOWN_ISSUES.md`. Builder kopiuje oba warianty i sprawdza obecność wejść przed
zastąpieniem starego `dist`. Oryginalne licencje vendor oraz opis historii nie są
reinterpretowane przez samą lokalizację. README i raporty programistyczne pozostają
po polsku; nie są alternatywną warstwą komunikatów gry.

## Dodawanie tekstów i testy

Nowy tekst wymaga od razu wpisu w obu katalogach z tymi samymi parametrami. Przypisz
klucz semantyczny, np. z obszaru `hud`, `mission`, `error`, a nie polskie zdanie jako ID.
Nie zapisuj aktualnego języka ani gotowej etykiety w stanie symulacji. Zmianę kluczy
już zapisanych w checkpointach poprzedź migracją. Tekst nowego assetu świata także
należy do zakresu lokalizacji.

`npm run check` uruchamia dotychczasową kontrolę oraz `check-localization.mjs`:
kompletność katalogów, parametry, deskryptory danych, odwołania statyczne, skan
niezlokalizowanych pól, pliki, wariant mapy i zgodność wersji. Taki skan nie jest
gwarancją jakości tłumaczenia ani automatycznym rozpoznawaniem tekstu na dowolnym obrazie.

`npm test` obejmuje pięć plików `v043-*.test.mjs`, istniejące regresje oraz rozszerzony
test buildu. Próby obejmują ustawienia i pierwszy start, zmianę bez resetu stanu,
błędy, katalogi, tekst w świecie i zgodny przebieg symulacji w obu językach.
Pełny test użytkowy na normalnym originie HTTP:

```sh
npm run dev
python tools/browser_v043_language.py --url http://127.0.0.1:5173/ --headed --game
```

Skrypt wymaga opcjonalnego Playwright i zainstalowanej przeglądarki. Obsługuje
`--browser firefox`, `--executable` i `--output`. Bez `--game` sprawdza wybór/menu/
ustawienia/pamięć; z `--game` także rzeczywisty `GameView`, HUD i misję. Błąd lub brak
możliwości uruchomienia nie jest raportowany jako PASS. Wyniki oraz ograniczenia
sprawdzenia dostarczonej paczki są w `V0_4_3_IMPLEMENTATION.md`.


## Rozszerzenie 0.4.4

Oba katalogi mają po 463 klucze (76 nowych względem 0.4.3). Obejmują nawigację kampanii,
wszystkie zakładki i potwierdzenia, stany metadanych, mapę i narrację Ypres/Cambrai,
minimapę, nazwy dostępności ikon oraz komunikaty błędów. Nazwy własne gry/broni nie
są duplikowane według języka. Wycofane teksty starych ekranów zachowano dla zgodności
historycznych narzędzi; runtime nie montuje dawnych widoków missions/brief/controls.

Nowe ekrany są w `src/ui/screens/`, HUD w `src/ui/hud/`; nadal używają `message`,
`t/text`, interpolacji i escaping po interpolacji. Zmiana języka nie resetuje mapy,
kontaktu strzelca, timera napisów, stanu symulacji ani zasobów. Capture kończy się,
ale zakładka, przewinięcie i sensowny fokus pozostają. Legendy SVG to tekst DOM,
nie wypalone litery w obrazie. Flagi językowe nie są flagami frakcji.

Sprawdzenie: `npm run check`, `tests/v043-*.test.mjs`, `tests/v044-*.test.mjs`,
`tools/browser_v043_language.py` (zaktualizowane wejścia) oraz `browser_v044_ui.py`.
Nie uznawać kontroli identyczności zbiorów kluczy za pełny wizualny odbiór każdej linii.
