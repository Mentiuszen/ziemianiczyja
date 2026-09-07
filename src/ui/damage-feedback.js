import {clamp,angleDiff} from '../core/math.js';
import {MAX_HEALTH} from '../combat/health.js';
/** Visual strength never controls whether the player can read a critical warning. */
export function damageFeedback(player,time,intensity=1,reducedMotion=false){
 const gain=clamp(Number.isFinite(intensity)?intensity:1,0,1),hp=clamp(player.hp,0,MAX_HEALTH);
 const low=clamp((.36*MAX_HEALTH-hp)/(.36*MAX_HEALTH),0,1),hit=clamp((player.hurt||0)/.65,0,1);
 const pulse=reducedMotion?1:.65+.35*Math.pow(Math.max(0,Math.sin(time*(hp<15?10:7))),4);
 const critical=hp>0&&hp/MAX_HEALTH<.20;
 return {critical,vignette:Math.min(.72,(hit*(reducedMotion?.20:.55)+low*pulse*.4)*gain),directionOpacity:hit*gain,rotation:angleDiff(player.damageYaw||0,player.yaw||0)*180/Math.PI,saturation:1-low*.32*gain,pulse:reducedMotion?0:low*pulse*gain};
}
/** Live-announcement latch. Visibility remains strict; rearming has hysteresis. */
export class CriticalHealth {
 constructor(){this.reset();}
 reset(){this.armed=true;this.visible=false;}
 update(hp){this.visible=hp>0&&hp/MAX_HEALTH<.2;if(hp>=MAX_HEALTH*.25)this.armed=true;const announce=this.visible&&this.armed;if(announce)this.armed=false;if(hp<=0)this.reset();return{visible:this.visible,announce};}
}
