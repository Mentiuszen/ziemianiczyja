# Rejestr wymagań v0.4

Statusy nie oznaczają ukończenia całego master promptu. Pełne wyniki wykonania poleceń
znajdują się w TEST_REPORT.md i docs/v0.4-tests/.

| Wymaganie aktualizacji | Moduły | Test / status |
|---|---|---|
| PPM nie blokuje obrotu | input/input.js | v04-input + real Chromium; Firefox niewykonany |
| Odprawa w budynku z napisami | data/briefing, Director, layout, UI | v04-mission, renderer; 42s/E/pauza/checkpoint |
| Żywy front przed sygnałem | ai/soldier, Director.alert | v04-mission: strzały obu stron i wczesny alarm |
| Większy udział gracza | profil NPC→NPC, 7 celów | v04-mission + autoplay; balans ludzki niepotwierdzony |
| Czołgi działają i otwierają drut | vehicles/tank, Simulation, Navigation | v04-support + routes/playthrough |
| Niemiecka artyleria zamiast anachronicznych czołgów | field-gun, support data | crew loss, shells, armored damage, autoplay |
| Lotnictwo obu stron | air-support, support-view | v04-state/support; skończone przeloty/bomby, nie dogfight |
| Limit klatek | FrameLimiter, App, Store, UI | v04-framerate + browser cap; brak aplikacyjnego VSync OFF |
| Płoty nie są stopniami | CollisionWorld, layout, player | v04-collision: skosy, sklepienie, ruch w powietrzu |
| Nieprześwitujące worki | GeometryData.cushion, sandbags | v04-sandbags + renderer |
| Wyjście odprawiającego oddziału | cambrai, Navigation.path | v04-mission: 4 żołnierzy wychodzi, bez teleportów |
| Zapis nowych systemów | Simulation, schema | v04-state: aktywny lot, brak kopii, błędne dane |
| Brak duplikacji scen/audio | App.dispose, SupportView.dispose | browser_v04_lifecycle, log 10 cykli |
| Statyczny build i podkatalog | tools/build, relative URLs | build + regression --dist --prefix=test-repo |
| Pięć ukończonych misji | przyszła kampania | nadal planowane, nie objęte ukończeniem v0.4 |
| Pełna zgodność z historycznymi detalami modeli | asset art | prototypowa interpretacja, nie rekonstrukcja muzealna |
