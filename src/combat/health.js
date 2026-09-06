import {clamp} from '../core/math.js';
export class Health {
 constructor(hp=100,delay=0){this.hp=clamp(hp,0,100);this.delay=delay;this.regenDelay=6;this.regenRate=12;}
 configure(profile){
  if(!Number.isFinite(profile?.regenDelay)||profile.regenDelay<0||!Number.isFinite(profile?.regenRate)||profile.regenRate<=0)throw new TypeError('Invalid regeneration profile');
  this.regenDelay=profile.regenDelay;this.regenRate=profile.regenRate;return this;
 }
 damage(amount){if(this.hp<=0||amount<=0)return false;this.hp=Math.max(0,this.hp-amount);this.delay=this.regenDelay;return true;}
 tick(dt){if(this.hp<=0)return;const remaining=Math.max(0,dt-this.delay);this.delay=Math.max(0,this.delay-dt);if(remaining>0)this.hp=Math.min(100,this.hp+remaining*this.regenRate);}
 medkit(){if(this.hp<=0||this.hp>=100)return false;this.hp=Math.min(100,this.hp+50);return true;}
 snapshot(){return{hp:this.hp,delay:this.delay};}
}
