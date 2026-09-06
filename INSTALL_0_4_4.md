# Instalacja nakładki 0.4.4

Baza: 0.4.3, commit a3398c211292e1cd677478ad6c4d456b6d210193.
To nie jest pełna gra w pustym folderze. Przed podmianą zabezpiecz własne lokalne zmiany.
Scal katalogi i zastąp tylko dołączone pliki. Następnie usuń `src/ui/map.js`, wycofaną
mapę dekoracyjną menu (REMOVE_FILES.txt). Niczego innego nie usuwaj.

Zamiast ZIP można zastosować patch przez `git apply --check`, a następnie `git apply`.
Nie stosuj obu metod naraz. Patch wykonuje także usunięcie starego pliku.

```sh
npm ci
npm run check
npm test
node tools/autoplay.mjs
node tools/autoplay.mjs --destroyed-tanks
npm run build
npm run dev
```

`dist/` generujesz na nowo. W PowerShell można użyć `npm.cmd`.
Nowy interfejs nie wymaga skasowania preferencji ani poprawnych checkpointów 0.4.1–0.4.3.
Pierwszy start sprawdzaj w oddzielnym profilu przeglądarki, nie przez kasowanie własnych zapisów.

Dokładne zmiany: CHANGELOG.md. Wyniki i niewykonane odbiory:
[docs/V0_4_4_IMPLEMENTATION.md](docs/V0_4_4_IMPLEMENTATION.md).
Źródła grafiki i ograniczenie odzyskanego kadru: docs/UI_ART.md.
Bez commita, pusha, nowych gałęzi i publikacji po stronie wykonawcy.
