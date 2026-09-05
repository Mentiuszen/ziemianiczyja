# Źródła techniczne / decyzje

Odczytano 4 września 2026. Te linki są dokumentacją, nie zasobami wymaganymi podczas gry.

| Źródło pierwotne | Zastosowanie |
|---|---|
| https://vite.dev/guide/static-deploy | Kontrakt dist, podkatalogi, publikacja statyczna; Vite NIE jest zaimplementowane w v0.1 ani v0.2 |
| https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages | Pages artifact, zależność build/deploy, uprawnienia i environment |
| https://github.com/actions/setup-node | Konfiguracja Node w ręcznym workflow |
| https://doc.babylonjs.com/features/featuresDeepDive/importers/glTF | Format importu glTF/GLB; rzeczywisty importer zweryfikowano na lokalnej wersji 8.46.2 |
| https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API | Gesture, utrata blokady i obsługa odmowy |
| https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay | Uruchomienie AudioContext w interakcji użytkownika |
| vendor/babylon-runtime/MANIFEST.json oraz rzeczywiste moduły | Nie zgadywano nazw eksportów: adapter używa sprawdzonych eksportów lokalnego bundla |

## Dlaczego build nie jest Vite

Próba pobrania paczek z npm nie powiodła się z powodu ograniczeń DNS/sieci środowiska. Zamiast dodawać niezweryfikowane zależności lub udawać lockfile, przygotowano zero-dependency skrypty Node i sprawdzony lokalny runtime. To kompromis etapu prototypowego; migracja jest pierwszym zadaniem technologicznym po normalnych testach przeglądarki. Wersja Babylon jest stała; nie ma odwołania do `latest` ani publicznego CDN w ścieżce uruchomienia gry.

Workflow używa wersji głównych oficjalnych akcji wskazanych przez dokumentację. Nie został zdalnie wykonany. Przed szerszym publicznym wydaniem warto przypiąć sprawdzone, niezmienne SHA tych akcji i przeprowadzić zdalny test publikacji. Projekt nie został samoczynnie upubliczniony.


## Uzupełnienie v0.2

- W3C Pointer Events — `buttons`, chorded button interactions i wpływ preventDefault
  na compatibility mouse events: https://www.w3.org/TR/pointerevents/
- Pointer Lock (specyfikacja): https://www.w3.org/TR/pointerlock-2/
- Khronos EXT_disjoint_timer_query_webgl2 — dostępność wyników, nanosekundy i disjoint:
  https://registry.khronos.org/webgl/extensions/EXT_disjoint_timer_query_webgl2/
- Lokalny runtime Babylon 8.46.2: faktyczne zachowanie AnimationGroup, skinning,
  emissiveColor/texture i liczników sprawdzano również wykonaniem w rendererze,
  zamiast zakładać zachowanie innej wersji biblioteki.

Dokumentacja wyjaśnia użyty kontrakt. Nie jest dowodem przeprowadzenia testu konkretnej
przeglądarki; zakres środowisk wykonanych znajduje się w TEST_REPORT.md.

## v0.3 — geometria, alpha i podział stanu
Analiza dotyczyła przede wszystkim faktycznie dołączonego kodu Babylon 8.46.2: StandardMaterial,
rendering groups, alpha test po obliczeniach alpha oraz przekształcenie glTF RH→LH. Nie zmieniono
bundla w celu obejścia cullingu ani bezpiecznych URI zasobów.

- Khronos glTF 2.0 specification (winding / coordinate system): https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html
- Babylon custom meshes: https://doc.babylonjs.com/features/featuresDeepDive/mesh/creation/custom/custom
- Babylon maintainer discussion, alpha test/cutoff: https://forum.babylonjs.com/t/transparency-cutoff/12701
- Babylon maintainer discussion, alpha-from-diffuse: https://forum.babylonjs.com/t/alpha-destroys-atlas-in-custom-material/17019

Źródła są pomocą techniczną; o poprawności tej paczki świadczą dodatkowo wykonane testy
pikselowe rodzimych ścian i transparentnej karty, nie samo przeczytanie dokumentacji.


## v0.4 — odczyt 5 września 2026
- W3C Pointer Events: anulowanie pointerdown a kompatybilne zdarzenia myszy oraz button chords.
  https://www.w3.org/TR/pointerevents/
- MDN Pointer Lock i względny ruch: https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API
- MDN requestAnimationFrame: rytm odświeżania i zatrzymanie w tle.
  https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
- Babylon.js issue #7797 dokumentuje wcześniejszy problem Firefoksa związany z preventDefault
  i mieszaniem strumieni; nie jest dowodem testu aktualnej przeglądarki.
  https://github.com/BabylonJS/Babylon.js/issues/7797

Nie używamy flag przeglądarki ani timerów spin-loop do udawania VSync OFF. Limiter dotyczy
renderów wewnątrz rAF, nie prezentacji OS. Specyfikacja nie zastępuje testu realnego Firefoksa,
którego nie udało się zainstalować w tym środowisku.
