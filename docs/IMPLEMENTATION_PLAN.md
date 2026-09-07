# Bieżąca aktualizacja — 0.4.5

Zakres zatwierdzony: `V0_4_5_PLAN.md`. Wdrożenie: `V0_4_5_IMPLEMENTATION.md`.
Walidacja maszynowa: `V0_4_5_VALIDATION.json`. Wersja kodu: 0.4.5, UI revision 1.

Wdrożono skalowanie modułów HUD-u, ikony postawy, informacje o obrażeniach,
nowe celowniki, niezależny hit/kill, kierunek granatu, F3 i surowe pomiary,
interpolację prezentacji oraz porcjowaną nawigację. Bez zmian modeli/map i profili walki.

Testy logiki/DOM i CPU są wykonane. Odbiór WebGL na fizycznym GPU, stabilności
p95/p99 na komputerze użytkownika i pełnego runtime przez HTTP pozostaje jawnie
oddzielony; nie został zastąpiony deklaracją wyniku benchmarku.
