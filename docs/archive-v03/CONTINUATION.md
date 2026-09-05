# Kontynuacja po v0.3

Podstawa: README, CHANGELOG, ARCHITECTURE, TEST_REPORT, KNOWN_ISSUES oraz zatwierdzony
MASTER_PROMPT. Nie wracaj do bazowego generatora assetów ani starej orientacji geometrii.
Natywne meshe są LH, glTF RH. Używaj całego `regenerate_assets.py`, zachowaj models/textures.

Następny odbiór powinien zacząć się na fizycznym sprzęcie użytkownika i Firefoxie:
LPM/PPM, kolizje grup w wąskich przejściach, materiały z przodu/tyłu, cztery presety,
CPU/GPU i normalny trwały zapis HTTP/HTTPS. Nie używaj SwiftShader jako prognozy FPS RTX.

Największe otwarte obszary: twarze/ręce/pozy żołnierzy, animacje broni i IK, bardziej
organiczna kompozycja zniszczeń, granice lokalnych cieni, balans/tempo, dźwięk i pełna kampania.
Indeks kolizji jest na main thread; przed workerem zmierz realne miejsca kosztu. Nie zmniejszaj
NPC, zasad obrażeń ani kolizji, aby polepszyć wynik presetu.

Checkpointy mapy v0.2 nie migrują; kolejna zmiana geometrii wymaga jawnej decyzji o wersji
misji. Nie kasuj danych przeglądarki ani historii bez zgody. Skrypt build to nadal Node,
nie Vite — ewentualna migracja runtime/build powinna być osobnym, testowanym zadaniem.

Przed zmianą: npm test, npm run check, render_v03_contracts.py oraz regresje źródeł i dist.
Nie twórz branchy/worktree, nie publikuj, nie resetuj cudzej pracy bez wyraźnej autoryzacji.
