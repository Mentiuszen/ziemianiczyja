import {WEAPONS} from '../data/weapons.js';
/** Transfers ammunition atomically at the end of a reload. Cycles persist per weapon. */
export class Weapon {
 constructor(id,mag=WEAPONS[id]?.capacity,reserve=50){if(!WEAPONS[id])throw Error(`Unknown weapon ${id}`);this.id=id;this.mag=mag;this.reserve=reserve;this.cooldown=0;this.reloadLeft=0;}
 get definition(){return WEAPONS[this.id];}
 fire(){if(this.cooldown>1e-7||this.reloadLeft>0||this.mag<=0)return false;this.mag--;this.cooldown=this.definition.cycle;return true;}
 reload(){if(this.reloadLeft>0||this.mag>=this.definition.capacity||this.reserve<=0)return false;this.reloadLeft=this.definition.reload;return true;}
 cancelReload(){this.reloadLeft=0;}
 tick(dt){this.cooldown=Math.max(0,this.cooldown-dt);if(this.reloadLeft>0){this.reloadLeft=Math.max(0,this.reloadLeft-dt);if(this.reloadLeft===0){const n=Math.min(this.definition.capacity-this.mag,this.reserve);this.mag+=n;this.reserve-=n;}}}
 snapshot(){return{id:this.id,mag:this.mag,reserve:this.reserve,cooldown:this.cooldown,reloadLeft:this.reloadLeft};}
 static restore(s){const w=new Weapon(s.id,s.mag,s.reserve);w.cooldown=s.cooldown;w.reloadLeft=s.reloadLeft;return w;}
}
