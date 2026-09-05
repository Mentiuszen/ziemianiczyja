# Zmiany v0.4.0 — 5 września 2026

- Zunifikowany strumień ruchu/przycisków Pointer Events, regresja trzymanego PPM.
- 42-sekundowa odprawa z napisami, dowodzący i oddział w zamkniętym stanowisku.
- Żywe posterunki, wczesny alarm, profil ognia NPC→NPC oraz siedem etapów misji.
- Obsługiwane działo 7,7 cm, trasy Mark IV, MG/działa, uszkodzenia i dwa otwierane druty.
- Skończone przeloty DH.5/DFW i dwie widoczne, ostrzegane bomby.
- Limiter renderowania 0/1–360 FPS, prawdziwa liczba renderów, bez pozornego VSync OFF.
- Jawnie niewchodzalne płoty, bez step-up w locie, zamknięte stosy worków.
- Poprawione trasy wyjścia całej obsady odprawy; brak cofania do miniętego węzła przy replanie.
- Nowy schemat misji (missionVersion=3), walidacja zapisów lotnictwa/artylerii/czołgów.
- Nie dodano kampanii, Vite, pełnego AI pilotów ani niemieckich czołgów do daty 1917.

## Historia wcześniejszych wydań

# Ziemia Niczyja — historia wydań

## 0.3.0 — 5 września 2026

### Naprawy
- Natywna geometria środowiska: poprawne zewnętrzne ścianki w lewoskrętnym rendererze.
  Nie zastosowano globalnego double-sided jako obejścia błędu.
- Oddzielna poprawka prawoskrętnego glTF: elipsoidy bez odwróconych / zerowych trójkątów,
  spójne profile i triangulacja wklęsłych części pojazdu.
- Jawne alpha-from-diffuse i clamp dla trawy: brak czarnych prostokątów; test pikselowy.
- Kolizje NPC, płotów i pozostałych istotnych obiektów; kroki ruchu ograniczają tunelowanie.
- Podparcie kapsuły na krawędzi deski, poprawne przyłączenie do grafu w okopie,
  dojście obok solidnego stołu telefonu, omijanie unieruchomionego czołgu.
- Snapshot odświeża referencje kolizji, rezerwacje osłon i kolejkę tras.
- Podparte belki ruin zamiast wiszących fragmentów; regresja połączenia z konstrukcją.
- Selekcja detali i shadow casterów odświeżana także po dużej zmianie pozycji.

### Mapa i oprawa
- Teren 216 × 272 m, rozbudowane zaplecze i zachodni łącznik, północne cele przesunięte
  o 40 m, droga z koleinami, 89 lejów, pięć ruin gospodarstw, nowe osłony i ogrodzenia.
- Autorskie materiały ziemi, drewna, cegły, płótna i betonu z normal mapami; poprawione
  światło i mgła; kałuże z prostym specularem, bez screen-space reflections.
- Zaokrąglone worki, skrzynie z listwami i okuciami, otwory ruin, belki i drobny gruz.
- Nowe teksturowane SMLE, Gewehr 98, Webley, Lewis, dłonie oraz poprawiony Mark IV.
- Trzy warianty każdej armii, dobierane deterministycznie bez zmiany RNG walki; trzy LOD.

### Efekty i ustawienia
- Low / Medium / High / Ultra z realnymi budżetami cieni, normal map, LOD, trawy i efektów.
- Granat: błysk, pył, ziemia/gruz, ślad i wstrząs. Kosmetyczne cząstki nie zastępują obrażeń.
- Kierunek trafienia, ograniczona winieta, low-HP pulse / desaturacja, regulacja intensywności.
- Indeks przestrzenny colliderów i przechodzenie promienia po komórkach zamiast pełnych skanów.
- Istniejące FPS/CPU/GPU, pointer lock, menu i checkpointy zachowane i objęte regresją.

### Zgodność i ograniczenia
Checkpoint mapy v0.2 wymaga rozpoczęcia nowej misji; ustawienia pozostają zgodne.
Nie dodano czterech pozostałych misji, Vite, nowego runtime, backendu ani publikacji.
Oprawa retro pozostaje proceduralna. Koszt renderowania wzrósł w teście SwiftShader;
nie deklarujemy przyspieszenia na sprzęcie użytkownika.

## 0.2.0 — 4 września 2026
Poprawki inputu, menu i nieba, teksturowane mundury/LOD, lokalne cienie, bounded pools,
odrębne FPS/CPU/GPU. Historyczne wyniki nie zastępują raportu v0.3.

## 0.1.0 — 4 września 2026
Pierwsza grywalna misja Cambrai z podstawową walką, AI, pojazdami i checkpointami.
