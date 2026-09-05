# Znane ograniczenia v0.3.0

## Zakres gry
Grywalna jest tylko misja 04, Cambrai. Pozostałe cztery mapy, docelowa dramaturgia,
czas przejścia 12–20 minut i pełny balans kampanii pozostają nieukończone. Automatyczny
bot zna położenie przeciwników i graf: jego czas nie jest miarą doświadczenia człowieka.

## Modele, grafika i efekty
Modele są oryginalne i znacznie rozbudowane względem bazowego prototypu, ale nadal
proceduralne/retro. Twarze, dłonie, sylwetki, third-person rifle i część wyposażenia mają
uproszczone kształty. Brak muzealnego audytu każdego szczegółu, root motion, pełnego IK stóp,
ragdolli i docelowego mieszania animacji. Zmiany LOD nie mają crossfade.

Otoczenie używa albedo + normal w StandardMaterial; wygenerowane dodatkowe ORM otoczenia
pozostają zasobami pomocniczymi i nie są w tym shaderze mapami roughness. GLB piechoty,
broni i czołgu korzystają z atlasu PBR albedo/normal/ORM. Low wyłącza normal mapy.
Nie ma SSAO, bloom, volumetric fog, SSR ani RT; nie są udawane opisami presetów.
Cienie są lokalne, mogą pojawiać się na granicy zasięgu. Trawa jest alpha-tested, warstwowa,
bez systemu wiatru. Kałuże nie odbijają sceny. Ślad eksplozji jest płaską dekoracją i może
częściowo wejść w silnie nierówny teren. Dym jest krótkim, półprzezroczystym efektem pyłu,
a nie zasłoną taktyczną blokującą widzenie AI. Drobiny są kosmetyczne, bez osobnych obrażeń.

## Kolizje i AI
Wspólny layout określa istotne bryły. Nie ma collidera dla każdego gwoździa, źdźbła,
luźnego fragmentu na murze ani drobiny eksplozji. Worki i nieregularne ruiny mają uproszczone
AABB, nie dokładną siatkę fizyczną. Żywi NPC blokują ruch przybliżonymi kapsułami, a zwłoki
nie zamykają przejść. Sojusznicy ustępują, ale tłok kilku postaci w wąskim miejscu może
wymagać obejścia / ponownego wyznaczenia trasy. Nie jest to pełny system rezerwacji drzwi.
Nie sprawdzono ręcznie każdej szczeliny, skarpy i krawędzi całej większej mapy.

## Wydajność
Nie wykonano pomiaru na fizycznym NVIDIA/AMD/Intel. Większy teren, normal mapy, bliższe
LOD i bardziej szczegółowe obiekty zwiększyły koszt względem v0.2 w programowym rendererze.
Profil Ultra może być wyraźnie droższy; Medium / Low i skala renderowania są realnymi
opcjami redukcji kosztu. Wyników SwiftShader nie wolno przeliczać na gwarantowany FPS GPU.
Indeks kolizji, A*, rendering i AI działają na głównym wątku; nie wdrożono workera.
Limit pul może pominąć nadmiar wizualnych cząstek, nigdy logiczny wybuch/obrażenia.
Timer GPU jest opcjonalny. CPU nie jest zużyciem wszystkich rdzeni komputera.

## Przeglądarki, zapis i uruchomienie
Wykonano testy Chromium, nie potwierdzono Firefoksa/Edge/Safari ani sterowania mobilnego.
Małe rozdzielczości w regresji menu nie oznaczają obsługi dotyku.
Testy grafiki routują rzeczywiste pliki z originem opaque; nie weryfikują zachowania
IndexedDB po zamknięciu normalnej przeglądarki na zwykłym hostingu. Fallback pamięciowy,
walidacja i odtwarzanie checkpointów są testowane. Stare zapisy mapy v0.2 są celowo
odrzucane z komunikatem; nie kasujemy automatycznie ustawień użytkownika.

Build nadal jest statycznym narzędziem Node bez Vite. Vendor zawiera nieużywane moduły
Viewera. Nie wykonywano zdalnego workflow Pages i nie publikowano gry. Audio jest
syntetyczne, bez pełnego nagranego foley, muzyki i dubbingu.
