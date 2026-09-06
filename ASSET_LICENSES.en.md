# Assets, provenance and licenses

English translation of the project's asset-provenance notice for v0.4.3. Original third-party license files are authoritative and remain unchanged. This translation does not grant additional rights.

## Project assets

No assets were downloaded from commercial games or marketplaces. No museum photographs, external fonts, other people’s recordings or services running during gameplay are included. The interface uses system fonts. New models, materials and effects are prepared locally for the project.

| Asset | Source / tool | License and scope |
|---|---|---|
| Six `british*.glb`, `german*.glb` files | Project work with AI assistance; refined Blender/ZiemiaNiczyja/models exports | Original project parts under MIT to the extent rights are licensable; MakeHuman CC0 ear/hand components; 3 LODs / 19 bones / 13 clips |
| SMLE, Gewehr, Webley, Lewis, hands | `generate_weapons_v03.py` | MIT; original meshes and atlas; replaces the older simple shapes |
| mark-iv.glb | `generate_assets.py` + `generate_tank_v03.py` | MIT; original profiles, improved triangulation, atlas and details |
| Infantry albedo/normal/ORM atlases | `generate_characters.py` | MIT; procedural cloth, skin and metal; copies in source and models/textures |
| Four `infantry-*-refined-*.png` / `infantry-refined-*.png` atlases | Blender/ZiemiaNiczyja project; face textures generated for the project | 2048 × 2048, separate faces for both factions; no commercial-game assets |
| Earth/wood/brick/bags/concrete, normal/ORM maps | `generate_materials_v03.py` | MIT; original noise, patterns and processing; albedo/normal maps are used, environment ORM is auxiliary |
| Grass-tuft, blast-smoke, scorch | `generate_materials_v03.py` | MIT; original alpha PNGs, no photographs |
| Sky-v02 and inherited textures | `generate_sky.py`, `generate_atmosphere.py`, `generate_assets.py` | MIT; original noise/drawing, no external photographs |
| Procedural world models | `world/layout.js`, `render/landscape.js`, `geometry-data.js` | MIT; original meshes and placement |
| UI map.svg / favicon / text | `src/ui/map.js`, `public/favicon.svg`, mission data | MIT; fictional map and messages, not scanned documents |
| field-gun-77.glb, dh5.glb, dfw.glb | `generate_support_v04.py`, project work with AI assistance | MIT to the extent rights are licensable; original meshes/vertex colors, no copied photographs |
| briefing-map.jpg | `generate_support_v04.py` / Pillow | MIT; original fictional map, not a scanned military document |
| Closed sandbags, wire, briefing interior | `render/sandbags.js`, `support-view.js`, `layout.js` | MIT; original buffered meshes and layout |
| Polish briefing dialogue | `data/briefing.js` | Fictional dialogue written for the project, not quotations from historical figures |
| Audio | `src/audio/audio.js` | MIT; local Web Audio oscillators and noise, no external samples |
| PL/EN game text and language-selection flags (v0.4.3) | `src/i18n/`, `public/assets/ui/flag-en.svg`, `flag-pl.svg` | Original project translations and SVG code, under the project's license to the extent applicable; no downloaded flag photographs or new font files |
| English briefing-map label (v0.4.3) | `tools/generate_localized_map.py`, `briefing-map.jpg`, `src/i18n/en.js` | Derivative of the project’s own map; no geometry changes or changed pixels outside the label area |

The project license does not guarantee copyright protection for AI-assisted materials. It does not alter the rights or provenance of the user's `docs/MASTER_PROMPT.md`. Required original notices for the local runtime are retained below and in `vendor`.

## MakeHuman mesh components

The refined ears and hands use fitted components of the MakeHuman Community base mesh. The source package carries a CC0 notice, preserved in `public/assets/models/licenses/MakeHuman-LICENSE.ASSETS.md` and included in the release.

Geometry source: https://github.com/makehumancommunity/makehuman/blob/master/makehuman/data/3dobjs/base.obj .
Source `base.obj` SHA-256: `8e761e6624b8f54536409135d1636da63b32486a90d4897f84e121d144f6fb4c`.
Ready GLB files and atlases were imported into the game, without the MakeHuman application's code or `.blend` files.

## Locally distributed runtime

### Babylon.js 8.46.2

Authors: Microsoft Corporation and Babylon.js contributors. Project source: https://github.com/BabylonJS/Babylon.js . Apache-2.0 license: https://github.com/BabylonJS/Babylon.js/blob/master/license.md . Full text: `vendor/babylon-runtime/LICENSE-APACHE-2.0.txt`.

This copy comes from a preinstalled Babylon Viewer ESM distribution in Gradio's frontend resources. `tools/vendor-runtime.py` records the exact local directory and extracts 334 dependent modules. The complete Gradio interface was not copied. Modules are bundled with the build and do not require a CDN. The manifest records the version and each file's SHA-256.

Local modifications: removal of unnecessary Svelte side-effect imports; replacement of the preload helper with a simple local import; exposure of the existing HemisphericLight class as `ZNHemisphericLight`. The bundle also contains unused Viewer capabilities. Changes are identified in the script and main file. The project does not claim authorship of Babylon.js.

### Lit (code embedded in the Viewer distribution)

Authors: The Lit Project Contributors; Google LLC. BSD-3-Clause license. Source: https://github.com/lit/lit/blob/main/LICENSE . Full text: `vendor/babylon-runtime/LICENSE-LIT-BSD-3.txt`. Copyright, conditions and disclaimers have been preserved. Exact versions of the individual embedded Lit modules were not independently reconstructed; a planned migration to official Babylon packages is intended to remove the unnecessary Viewer.

## Historical sources

Links in `docs/HISTORY.md` / `docs/HISTORY.en.md` and `docs/CHARACTER_ART.md` are for verifying the text only; they do not imply a license to museum multimedia. No photographs from the referenced sites are included.
