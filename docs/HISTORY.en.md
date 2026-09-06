# History — scope of the prototype

English translation of `HISTORY.md` for version 0.4.3. Source review dates and the distinction between confirmed background, fiction and unverified details are retained. This translation is not a new historical audit.

Materials reviewed: September 4, 2026. This is a working document, not a claim that every model has been historically audited.

## Confirmed background

Cambrai was defended by the Hindenburg Line system. The British assault began on November 20, 1917 and combined infantry, tanks, artillery and other arms. Fascines were among the equipment used to cross trenches. The initial success did not produce a lasting breakthrough; a major German counterattack began on November 30. The local success at the end of the game does not mean victory in the entire battle. Source: National Army Museum, “1917: Year of stalemate”, Cambrai–Lessons sections: https://www.nam.ac.uk/explore/1917-year-stalemate

Tanks entered combat at Flers-Courcelette on September 15, 1916; mechanical failures and cooperation with infantry were real difficulties. They are not being moved into the planned July 1 mission. Source: National Army Museum, “Attack of the tanks”: https://www.nam.ac.uk/explore/attack-tanks

The SMLE was the standard British infantry rifle; rifles, machine guns, trenches, dugouts and wire form the basis of the equipment and environment used here. Source: National Army Museum, “Weapons of the Western Front”: https://www.nam.ac.uk/explore/weapons-western-front

The Mark IV, specific weapon names and the chronology of the five missions come from the approved `MASTER_PROMPT.md`. That list is not evidence that every geometric feature of the prototype models is correct. The IWM article about Cambrai cited in the prompt returned HTTP 403 in the reading environment; it is not marked as having been read during that implementation. Museum photographs were not copied into the game.

## Fiction

Thomas Reed, Arthur Hughes, William Ellis and George Bennett are fictional characters. The squad is not assigned to a real battalion. “The Broken Line”, the telephone, aid post, machine-gun placement and local objective sequence are designed fiction; since v0.4, tank damage results from simulated hits rather than an automatic H24 breakdown. H21/H24 are working narrative identifiers, not claims about the fate of historical crews.

The menu's staff map merely refers to Cambrai and nearby place names. It is not an original attack map or a reconstruction of the topography. Gameplay uses a fictional area. The small counterattack during the mission is a fictional local engagement, **not the general counterattack moved from November 30 to November 20**.

## Simplifications and items requiring an audit

Regenerating 100 HP, healing by 50 points, the short map, rapid movement, reload times, camera, crosshair and 55-second defense are game rules. They do not represent real wound treatment or the duration of combat. The Webley in the player's starting equipment is a prototype testing decision, not an assumption that ordinary soldiers generally carried revolvers.

| Asset | Current level of historical reliability |
|---|---|
| British and German uniforms | General silhouettes and helmets; regimental details, insignia and complete equipment have not been verified |
| SMLE / Gewehr 98 / Webley / Lewis | Names and roles follow the master prompt; original simplified models, not detailed gunsmithing reconstructions |
| MG 08 | Fixed emplacement and mechanics; the model and the gunner's operating pose need improvement |
| Mark IV | Rhomboid silhouette, sponsons and no rotating turret; weapon, track and equipment details require an audit |
| Mills grenade | Prototype representation and mechanics; final body and fuse details have not been reproduced |
| German grenade | No separate, verified Stielhandgranate model; the shared prototype shape does not meet the final requirement |
| Mark I, Mark V, Vickers | No assets or implementation; other models are not used to pretend they are present |

A full release requires equipment variants to be checked separately for each date. The prototype grenades have not been assigned an exact historical variant. The other four missions exist only as names and metadata consistent with the prompt, not as an implemented campaign.

## v0.2 addendum — uniforms

The new models use references described in `CHARACTER_ART.md`: original interpretations of British khaki/P1908/Brodie and German feldgrau/M1916. No museum photograph is used as an in-game texture. This is not a complete reconstruction of every equipment detail.

## v0.3 presentation addendum

The expanded farms, road and obstacle placement are level design, not a copied historical map. The NCO variant wearing a cap is a visual interpretation; it does not imply an audit of a particular regiment's uniform during this assault. That update did not expand the story to other battles or change the mission date.

## v0.4 — support, briefing and separating fact from fiction

Sources reviewed on September 5, 2026. These are historical reference materials, not assets.

**Confirmed background:**
- The Tank Museum, “The Battle of Cambrai: Graincourt”: German 7.7 cm guns used in an anti-tank role at Graincourt on November 20, 1917. https://tankmuseum.org/graincourt/
- The Tank Museum, “Action Debut of The A7V”: combat debut on March 21, 1918, also mentioning captured Mark IV tanks in that operation. This does not justify adding German tanks to the current November 1917 mission. https://tankmuseum.org/action-debut-of-the-a7v-tank/
- Australian War Memorial, E01445: the DH.5 was used to bomb and harass positions during Cambrai in November 1917; the photograph is dated December 1, 1917. https://www.awm.gov.au/collection/E01445
- IWM, Q11894 / 205247444: a German two-seat DFW shot down near Flesquières on November 23, 1917. This confirms the aircraft family at the battle, not a flight over the game's sector on November 20. https://www.iwm.org.uk/collections/item/object/205247444

**Gameplay fiction:** Lieutenant Edward Shaw, dialogue around the map, the field emplacement's location, the schedule of five flyovers, two local bomb drops and the gun-breech objective are mission design. They are not attributed to a real battalion or pilot. DFW remains a broadly named two-seat aircraft family; the model is not a verified copy of a specific variant. No detailed assault plan is attributed to sources that do not describe it.

**Simplifications:** NPC spread, rate of fire, hull/track integrity, the gun's firing sector, bomb payload, compressed times and ranges are game rules. British aircraft and tanks do not inflict friendly fire under the global gameplay rule, not as a historical claim.

That update did not add a portable Tankgewehr or an A7V. The finite air-support layer is not a full reconstruction of both sides' aviation operations during the battle.
