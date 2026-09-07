# v0.4.5 status

Logic, sources, localization and HUD have automated coverage. Local HTTP is blocked
and WebGL2 is unavailable in the preparation environment. DOM tests use the real UI
and Simulation with a synthetic view. Actual Babylon camera calculations are tested
separately without a GPU. This is not physical-GPU visual acceptance.

High HUD scales on small screens may activate compact layout. GPU p99 needs valid
samples from the optional WebGL extension. CPU and GPU times must not be added to
frame time. Node measurements show reduced longest spikes, not removal of every
micro-stutter. Complete Firefox/Chromium, durable-save and 165 Hz checks locally.
See `V0_4_5_IMPLEMENTATION.md` (Polish implementation and validation report).

---
## Historical limitations from earlier versions

# 0.4.4 limitations — 6 September 2026

## Revision 3 — current status

- Requests 2–4 are implemented. Request 1, new high-resolution backdrops, is not delivered; R2 image softness still applies.
- English uses No Man’s Land and its own logo. Earlier notes about a Polish-only title no longer describe the live UI.
- A continuing mission's difficulty can be changed only on the Campaign screen. Started timers retain their values; health and ammunition are not replenished.
- Native persistence, real GameView and Firefox/Edge still require local acceptance.

Sections below are preserved as history. R3 supersedes their difficulty and title behavior.

## 0.4.4 revision 2 — current limitations

- The three backdrops are adapted from the selected concept (native panels 764×352 / 764×374), not new native 4K paintings. They may look soft at large sizes. The vector logo and live controls remain independent and sharp.
- Campaign geography is based on real geographic data. The five military fronts are date-specific generalizations, not a verified trench-by-trench survey. Ypres has month-level dating.
- Actual WebGL2 gameplay, native persistence and gameplay readability require local acceptance. An isolated DOM test without the 3D scene does not replace it.
- Responsive menus do not add touchscreen-only gameplay.

Other earlier limitations still apply unless a specific revision-2 change supersedes them.


**Local-acceptance candidate, not a claim of full validation on the player's computer.**

- Cambrai is the only playable chapter. Other map points are informational; watching
  the introduction does not mark Ypres as completed.
- The front map is an original schematic, not a digitization of all historical
  positions on 20 November 1917. Campaign drawing units are separate from gameplay metres.
- Main-menu artwork uses a recovered 426×352 crop from the earlier work; it may look
  soft on large displays. It is not a high-resolution export or an archival photograph.
- Friendly flags use up to 4 geometry visibility checks per frame and a cache up to
  0.15 simulation seconds. The minimap redraws at up to 30 Hz, not every 165 Hz frame.
- Isolated DOM tests with view/storage fixtures do not establish real GameView,
  persistent IndexedDB, Firefox/Edge support or physical-GPU performance. Those remain
  local acceptance requirements; passing Node tests is not a substitute.
- New-campaign preview does not overwrite saves. A completed transaction is the
  replacement boundary; cancellation after that boundary cannot undo the accepted save.
- Denied storage permits session-only progress. Closing the browser can restore the
  older durable save instead of the newer session state; the warning is not a promise
  of persistence.

Earlier version-specific notices are preserved below as history. Their description
of old menus is not the current 0.4.4 interface.

---

# Known limitations 0.4.3 — September 6, 2026

**Code for local acceptance testing. This document does not confirm publication or a complete browser playthrough.**

## Languages and current acceptance testing

All project-authored game text uses the PL/EN catalogues: menus, settings, HUD, objectives, briefing, messages, interactions, saves, errors and diagnostics. Documents opened from the information screen have English versions. The project name, equipment proper names, technical identifiers and original dependency licenses remain unchanged. No dubbing was added. The briefing-map label has an English variant; the rest of the image is unchanged. The English USA/UK flag is a language-choice symbol, not a new faction.

Without a valid `settings.language`, the language picker opens, including after an upgrade from an older version. The browser's language is not automatically selected. Changing the option does not change the mission or checkpoint. If local storage is denied, the choice lasts only for the current session and the picker may return on reopening the page. Restoring default options does not clear the selected language.

Checking all keys and parameters is not a substitute for language review throughout a mission. In particular, test long subtitles and prompts in small windows, switching during pause, persistent preferences after a browser restart, and Firefox/Edge locally. The results, the controlled DOM test's scope and WebGL/HTTP limitations are in `V0_4_3_IMPLEMENTATION.md` (developer report in Polish). A network-free DOM test does not confirm persistent IndexedDB, full 3D rendering, Pointer Lock or hosted operation. Do not mark these as PASS on that basis.

0.4.3 does not change 0.4.2 balance, collisions, unit counts or model quality. `SAVE_VERSION=1` and `MISSION_VERSION=3` remain; valid 0.4.1/0.4.2 saves are supported. Historical checkpoint labels and generic character names are mapped to stable keys. Positions from incompatible older map versions are not migrated.

Earlier notes are retained below with their dates and status at the time. They are not a report of those tests being repeated in 0.4.3.

---

# Known limitations 0.4.2 — September 6, 2026

**Candidate for local acceptance; the release had not been published by its implementer.**

## Verification scope at that time

Gameplay, AI, collision, save and lifecycle fixes have automated tests. Results and the list of executed files are in `V0_4_2_IMPLEMENTATION.md`. Do not equate them with the full historical set of 134 tests or with balance acceptance. A full `npm test` in the complete checkout remains a required local step.

No playable WebGL2 test, Firefox/Edge test, listening session, physical GPU measurement or human playtest was performed in that environment. Chromium blocks local addresses with `ERR_BLOCKED_BY_ADMINISTRATOR`; a separate WebGL2 creation attempt returned no context. `CAM-01` has a confirmed test of the bundled camera's actual mathematics, but the full `GameView` regression awaits a local run of `tools/browser_v042_camera.py`. BLOCKED is not PASS.

## Gameplay and compatibility

The new difficulty profiles are an initial iteration requiring a mission playthrough and tests with different seeds. The bot still knows the map and enemies; completing the mission with and without tanks does not prove suitable difficulty for a person. Pay particular attention to narrow passages, fences, prone turns, squad yielding and the finale with a nearby enemy.

Hull collision now uses a yaw-rotated rectangle, with an AABB only as a broad-phase filter. It is still not track physics, ragdoll or armor simulation. Emergency penetration recovery is bounded and recorded; an unsolvable spawn or checkpoint is rejected instead of moving a character through a wall. Local corrections of historical NPC positions have a separate 1.25 m limit; normal recovery is limited to 0.65 m.

The format remains `SAVE_VERSION=1`, `MISSION_VERSION=3`. A valid 0.4.1 checkpoint has explicit defaults for new fields; incompatible older mission geometry or corrupted state is not accepted. Rejecting a save does not clear settings. A checkpoint's difficulty is not replaced by the new-mission selection in the menu. Saving can be deferred indefinitely while direct danger persists; the last good checkpoint remains. Persistent IndexedDB requires local acceptance on a normal origin.

Models, textures, sounds, map definitions and Babylon remain from 0.4.1. Their qualitative improvement belongs to 0.5. The text below describes earlier tests, not 0.4.2 results.

---

# Archived v0.4.1 limitations

## Browsers and performance

The RMB fix removes reliance on compatibility `mousemove` events suppressed after `pointerdown`. A stream without `mousemove` and real input in Chromium were tested. **Real Firefox was not run**: it was not installed and installation/download attempts failed because of environment restrictions. This remains an important user test. Do not write “Firefox PASS” in the report. Edge/Safari were not run separately either.

There was no physical GPU. SwiftShader renders in software; overload is subject to an intentional limit on accumulated simulation steps. Timings from such tests do not predict FPS on the user's computer. The frame cap is an application limit, not a way to disable browser VSync. Mouse and keyboard are required; a small window does not imply a touch version.

## Presentation and vehicles

Aircraft are simplified procedural silhouettes of historical families. There are five authored flyovers with two bomb drops; no autonomous dogfights, pilot accuracy simulation, airframe damage or player shoot-downs. This is not a complete later aviation system. The 7.7 cm gun is a visual approximation, not a claim to represent a specific factory variant.

The tanks had simple dynamic AABBs and limited weapon sectors, not simulation of tracks contacting every terrain irregularity, armor ballistics or animated crews. Sponson barrels do not have complete articulation reproducing every aiming correction. Movement along authored corridors may temporarily stop for infantry. Only two specified wire sections are destructible. No promise is made that any vehicle can destroy every fence.

Characters have six refined models and faces in v0.4.1 with the existing clips retained; conversation animation uses standing/turning, without facial animation or new motion-capture recordings. All sound is synthetic. There is no dubbing. Sandbags have closed, compressed filling rather than simulation of physically independent bags. Environment and character collisions are simplified; diagonal tests do not prove every possible location on the map. Collisions were not globally disabled to bypass issues.

## Mission and campaign

Still only Cambrai. The other four missions are not complete; there are no human tests confirming a 12–20 minute playtime or final balance. The bot knows enemy positions and the graph; its completion time only tests traversability. Eight reserve units already exist on the map rather than appearing in front of the player; before the defense they remain in position. They can die earlier too.

The lack of German tanks in this mission follows from the selected date, not a broken toggle. Portable anti-tank weapons from 1918 were not added to Cambrai 1917. The player silences the German gun through its crew or breech instead of fighting a fictional A7V. Historical material separated from the fictional local engagement plan is in `HISTORY.en.md`.

## Saves and tools

A new checkpoint from the v0.4 mission is required; old positions and phases are not migrated. Settings persist on the same origin. Graphics tests routed with an opaque origin test the memory fallback, not persistent IndexedDB after closing a browser on ordinary hosting.

The build is still a static Node tool, without Vite. No remote Pages workflow or publication was performed during those historical tests. v02/v03 test scripts were retained for reference; current commands are in the README. Introducing a generator alone does not mean all inherited models were re-exported: new GLBs were generated, while existing v0.3 assets were retained.
