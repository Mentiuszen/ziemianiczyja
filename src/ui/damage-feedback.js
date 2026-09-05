import {clamp,angleDiff} from '../core/math.js';
/** Simulation-time feedback: pausing cannot keep a pulse/shake running behind menus. */
export function damageFeedback(player,time,intensity=1){
 const gain=clamp(Number.isFinite(intensity)?intensity:1,0,1),hp=clamp(player.hp,0,100),low=clamp((36-hp)/36,0,1),hit=clamp((player.hurt||0)/.65,0,1),pulse=.65+.35*Math.pow(Math.max(0,Math.sin(time*(hp<15?10:7))),4);
 return {vignette:Math.min(.78,(hit*.52+low*pulse*.48)*gain),directionOpacity:hit*gain,rotation:angleDiff(player.damageYaw||0,player.yaw||0)*180/Math.PI,saturation:1-low*.32*gain,pulse:low*pulse*gain};
}
