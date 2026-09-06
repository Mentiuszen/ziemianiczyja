import {dist,norm,sub} from './math.js';
import {eye} from '../world/collision.js';
/** Shared eligibility for a prompt and an action; only the device itself may be ignored. */
export function canReach(world,point,range,ignoreSolid=null){
 const player=world.player;if(player.hp<=0)return false;
 const origin=eye(player),delta=sub(point,origin),length=dist(point,origin);
 if(length>range||Math.abs(point.y-player.pos.y)>2.1)return false;
 return length<.025||!world.collision.ray(origin,norm(delta),Math.max(0,length-.025),[],player.id,{ignoreSolid});
}
