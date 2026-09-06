# Pochodzenie zasobów — Ziemia Niczyja v0.4.3

Nie pobrano assetów z komercyjnych gier ani marketplace. Nie dołączono zdjęć muzealnych,
zewnętrznych fontów, cudzych nagrań ani usług uruchamianych podczas gry. Interfejs używa
fontów systemowych. Nowe modele, materiały i efekty są przygotowane lokalnie dla projektu.

| Zasób | Autor / źródło | Warunki / modyfikacje |
|---|---|---|
| 6 plików `british*.glb`, `german*.glb` | projekt z pomocą AI; poprawione eksporty Blender/ZiemiaNiczyja/models | Oryginalne części projektu MIT w zakresie praw podlegających licencjonowaniu; fragmenty uszu/dłoni MakeHuman CC0; 3 LOD/19 kości/13 klipów |
| SMLE, Gewehr, Webley, Lewis, hands | generate_weapons_v03.py | MIT; własne siatki i atlas; zastępują starsze proste bryły |
| mark-iv.glb | generate_assets.py + generate_tank_v03.py | MIT; własne profile, poprawiona triangulacja, atlas i detale |
| Atlasy infantry albedo/normal/ORM | generate_characters.py | MIT; proceduralna tkanina, skóra, metal; kopie source i models/textures |
| Cztery atlasy `infantry-*-refined-*.png` / `infantry-refined-*.png` | Blender/ZiemiaNiczyja; tekstury twarzy wygenerowane na potrzeby projektu | 2048 × 2048, osobne twarze obu frakcji; bez zasobów komercyjnych gier |
| Earth/wood/brick/bags/concrete, normal/ORM | generate_materials_v03.py | MIT; własny szum, wzory i obróbka; albedo/normal używane, ORM otoczenia pomocnicze |
| Grass-tuft, blast-smoke, scorch | generate_materials_v03.py | MIT; autorskie PNG alpha, bez fotografii |
| Sky-v02 i odziedziczone tekstury | generate_sky.py, generate_atmosphere.py, generate_assets.py | MIT; autorski szum/rysowanie, bez zewnętrznych zdjęć |
| Modele proceduralne świata | world/layout.js, render/landscape.js, geometry-data.js | MIT; własne siatki i rozmieszczenie |
| UI map.svg / favicon / teksty | src/ui/map.js, public/favicon.svg, dane misji | MIT; fikcyjna mapa i komunikaty, nie skany dokumentów |
| field-gun-77.glb, dh5.glb, dfw.glb | generate_support_v04.py, projekt z pomocą AI | MIT w zakresie praw podlegających licencjonowaniu; własne siatki/kolory wierzchołków, bez kopiowania fotografii |
| briefing-map.jpg | generate_support_v04.py / Pillow | MIT; własna fikcyjna mapa, nie skan wojskowego dokumentu |
| Zamknięte worki, drut, wnętrze odprawy | render/sandbags.js, support-view.js, layout.js | MIT; własne buforowane siatki i układ |
| Polskie dialogi odprawy | data/briefing.js | Fikcyjne wypowiedzi dla projektu, nie cytaty historycznych postaci |
| Audio | src/audio/audio.js | MIT; lokalne oscylatory i szum Web Audio, bez próbek zewnętrznych |
| Teksty PL/EN i flagi wyboru języka (v0.4.3) | src/i18n/, public/assets/ui/flag-en.svg, flag-pl.svg | Własne tłumaczenia i kod SVG projektu na zasadach jego licencji w mającym zastosowanie zakresie; bez pobranych fotografii flag i nowych plików fontów |
| Angielski podpis mapy odprawy (v0.4.3) | tools/generate_localized_map.py, briefing-map.jpg, src/i18n/en.js | Pochodna własnej mapy projektu; bez zmiany geometrii i pikseli poza obszarem podpisu |

Licencja projektu nie gwarantuje ochrony prawnoautorskiej materiałom wygenerowanym z pomocą AI.
Nie zmienia praw ani pochodzenia dokumentu użytkownika `docs/MASTER_PROMPT.md`.
Wszystkie wymagane oryginalne oznaczenia lokalnego runtime zachowano poniżej i w vendor.

## Fragmenty siatki MakeHuman

Poprawione uszy i dłonie wykorzystują dopasowane fragmenty siatki bazowej MakeHuman
Community. Pakiet źródłowy zawiera oznaczenie CC0; jego tekst zachowano w
`public/assets/models/licenses/MakeHuman-LICENSE.ASSETS.md` i dołączono do release.
Źródło geometrii: https://github.com/makehumancommunity/makehuman/blob/master/makehuman/data/3dobjs/base.obj .
SHA-256 źródłowego `base.obj`: `8e761e6624b8f54536409135d1636da63b32486a90d4897f84e121d144f6fb4c`.
Do gry importowano gotowe GLB i atlasy, bez kodu aplikacji MakeHuman i bez plików `.blend`.

## Runtime dostarczony lokalnie

### Babylon.js 8.46.2

Autorzy: Microsoft Corporation i współtwórcy Babylon.js. Źródło projektu: https://github.com/BabylonJS/Babylon.js . Licencja Apache-2.0: https://github.com/BabylonJS/Babylon.js/blob/master/license.md . Pełny tekst: `vendor/babylon-runtime/LICENSE-APACHE-2.0.txt`.

Kopia pochodzi z preinstalowanej dystrybucji ESM Babylon Viewer w zasobach frontendu Gradio. `tools/vendor-runtime.py` dokumentuje dokładny lokalny katalog i wyodrębnia 334 zależne moduły. Nie skopiowano całego interfejsu Gradio. Moduły są dołączone do buildu i nie wymagają CDN. Manifest podaje wersję oraz SHA-256 każdego pliku.

Modyfikacje lokalne: usunięcie niepotrzebnych importów efektów ubocznych Svelte; zastąpienie pomocnika preload prostym lokalnym importem; udostępnienie istniejącej klasy HemisphericLight pod nazwą `ZNHemisphericLight`. Kod bundla zawiera również nieużywane możliwości Viewera. Oznaczenia zmian są w skrypcie i pliku głównym. Nie przypisujemy sobie autorstwa Babylon.js.

### Lit (kod osadzony w dystrybucji Viewera)

Autorzy: The Lit Project Contributors; Google LLC. Licencja BSD-3-Clause. Źródło: https://github.com/lit/lit/blob/main/LICENSE . Pełny tekst: `vendor/babylon-runtime/LICENSE-LIT-BSD-3.txt`. Zachowano informację o prawach, warunkach i wyłączeniu odpowiedzialności. Dokładnych wersji poszczególnych osadzonych modułów Lit nie odtworzono niezależnie; planowana migracja do oficjalnych paczek Babylon ma usunąć niepotrzebny Viewer.

## Źródła historyczne

Linki w `docs/HISTORY.md` i `docs/CHARACTER_ART.md` służą wyłącznie weryfikacji tekstu i nie oznaczają licencji na muzealne multimedia. Żadne zdjęcie ze wskazanych stron nie zostało dołączone.
