import {clamp} from '../core/math.js';
export class Health {
 constructor(hp=100,delay=0){this.hp=clamp(hp,0,100);this.delay=delay;}
 damage(amount){if(this.hp<=0||amount<=0)return false;this.hp=Math.max(0,this.hp-amount);this.delay=6;return true;}
 tick(dt){if(this.hp<=0)return;const remaining=Math.max(0,dt-this.delay);this.delay=Math.max(0,this.delay-dt);if(remaining>0)this.hp=Math.min(100,this.hp+remaining*12);}
 medkit(){if(this.hp<=0||this.hp>=100)return false;this.hp=Math.min(100,this.hp+50);return true;}
 snapshot(){return{hp:this.hp,delay:this.delay};}
}
