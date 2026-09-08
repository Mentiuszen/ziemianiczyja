# Assets, provenance and licenses

## Interface 0.4.5

`stance-stand.svg`, `stance-crouch.svg` and `stance-prone.svg` are original vector
illustrations created for this project. Crosshairs and hitmarkers use original
CSS/SVG geometry. No Call of Duty/CS icons or font files were copied. These additions
use the project license to the extent rights are licensable. Existing artwork and
third-party license notices from base `a567537` remain unchanged.


Revision 3 adds the English `logo-en.svg`: the existing motif and DejaVu outlines, covered by the retained DejaVu notice. No new high-resolution backdrops were delivered.

## Interface 0.4.4 — revision 2

- New main, language and options backdrops: adaptations of the concept explicitly selected by the user in this conversation. The reference and prepared crops are in `authoring/ui/`. Baked UI elements were removed; the illustration is not automatically relicensed as MIT or presented as an archival photograph.
- New wordmark: DejaVu Sans Condensed Bold letter outlines with original layout, wear and soldier silhouette. The existing DejaVu license notice is retained. No font files are included.
- Geographic base: GSHHG 2.3.6, intermediate resolution, distributed by basemap-data 2.0.0. Coast/lake/river data and derived geography carry LGPL-3.0-or-later separately from the game code. GPL/LGPL texts and editable regional coordinates accompany the release at `public/assets/ui/maps/western-front-geography.json`; the map SVG can be replaced independently. No modern international borders are rendered.
- Relief: regional crop of basemap-data `shadedrelief.jpg`, distributed under MIT. The MIT notice and regional source crop are retained.
- Dated front lines, arrows, symbols and selection logic are original generalizations, not copied Call of Duty assets. Historical references and precision limitations are described in `docs/PROJECT.md`.

Older notices below concern prior deliveries. The first 426×352 main crop is no longer the active backdrop.


English translation of the project's asset-provenance notice for v0.4.4. Original third-party license files are authoritative and remain unchanged. This translation does not grant additional rights.

## Project assets

No assets were downloaded from commercial games or marketplaces. No museum photographs, external fonts, other people’s recordings or services running during gameplay are included. The interface uses system fonts. New models, materials and effects are prepared locally for the project.

| Asset | Source / tool | License and scope |
|---|---|---|
| Six `british*.glb`, `german*.glb` files | Project work with AI assistance; refined Blender/ZiemiaNiczyja/models exports | Original project parts under MIT to the extent rights are licensable; MakeHuman CC0 ear/hand components; 3 LODs / 19 bones / 13 clips |
| SMLE, Gewehr, Webley, Lewis, hands | `generate_weapons_v03.py` | MIT; original meshes and atlas; replaces the older simple shapes |
| mark-iv.glb | `authoring/vehicles/` Blender sources and export scripts | MIT; original articulated geometry, three LODs, baked base/normal/ORM PBR maps; final visual acceptance pending |
| Infantry albedo/normal/ORM atlases | `generate_characters.py` | MIT; procedural cloth, skin and metal; copies in source and models/textures |
| Four `infantry-*-refined-*.png` / `infantry-refined-*.png` atlases | Blender/ZiemiaNiczyja project; face textures generated for the project | 2048 × 2048, separate faces for both factions; no commercial-game assets |
| Earth/wood/brick/bags/concrete, normal/ORM maps | `generate_materials_v03.py` | MIT; original noise, patterns and processing; albedo/normal maps are used, environment ORM is auxiliary |
| `cambrai-overcast.hdr` | `authoring/vehicles/review-pbr-lighting.py` | MIT; original procedural field radiance, no photographs |
| `blast-dust-volume.png` | `authoring/effects/build-dust-sprite.py`, editable `Dust_Impact_050.blend` | MIT; original neutral-lit volume render for impact VFX |
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

Links in `docs/PROJECT.md` / `docs/PROJECT.md` and `docs/PROJECT.md` are for verifying the text only; they do not imply a license to museum multimedia. No photographs from the referenced sites are included.


## 0.4.4 interface assets

Campaign backdrop, UK marker and weapon silhouettes were drawn locally for this
interface. The logo contains exported DejaVu Sans Condensed Bold outlines; the notice
is included at `public/assets/ui/licenses/DejaVu-LICENSE.txt`, without any font files.

`main-art.webp` uses the supplied 426×352 crop recovered from the earlier work. No
separate larger master or original generation record survived; provenance before
the attachment and rights in the illustration were not independently verified.
This notice does not assign it an MIT license. Confirm its provenance or replace
it with an approved original before public distribution. Editable files are under
`authoring/ui/`; `docs/PROJECT.md` describes them (developer-only, outside dist). The
map is an original schematic, not a traced museum sheet or a Call of Duty asset.

## 0.4.5 rew2 — HUD and doors

The three `public/assets/ui/stance-*.svg` files are original filled infantry silhouettes
(helmet, uniform, rifle) drawn for this project. No triangle, Call of Duty marks or
extracted game assets are used. User-supplied screenshots were style references only.
Existing weapon silhouettes only have trimmed viewboxes. The timber doors are original
procedural geometry using the existing project materials. No external fonts, textures,
models or dependencies were added.
