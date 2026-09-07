import {clamp} from './math.js';
/** Shared constraints for the committed aim and its non-consuming render preview. */
export function resolvePlayerLook(player,collision,input={},out={}){
 const dx=Number.isFinite(input.lookX)?input.lookX:0,dy=Number.isFinite(input.lookY)?input.lookY:0;
 const yaw=player.yaw+dx;
 out.yaw=!dx||player.stance!=='prone'||collision.canTurn(player,yaw)?yaw:player.yaw;
 out.pitch=clamp(player.pitch+dy,-1.4,1.4);return out;
}
