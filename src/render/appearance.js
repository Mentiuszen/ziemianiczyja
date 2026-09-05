/** Cosmetics are independent of simulation RNG, difficulty, quality and spawn order. */
export function appearanceFor(actor){let hash=0;for(const c of actor.id)hash=(hash*31+c.charCodeAt(0))>>>0;const variant=actor.role==='leader'?2:hash%3;return {variant,model:(actor.faction==='uk'?'british':'german')+(variant?`-v${variant}`:'')};}
