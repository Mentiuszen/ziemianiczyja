import {HQ} from '../data/world-map.js';
import {PHASE} from '../data/briefing.js';
import {orientedBounds} from './shapes.js';
import {canReach} from '../core/interaction.js';

// The existing eastern opening is 2.74 m wide and 2.40 m high. Hinges sit on
// its outer face; two leaves swing out, never into the command-room squad.
export const BRIEFING_DOOR=Object.freeze({id:'briefing-door',x:HQ.x+HQ.w/2+.18,z:HQ.z,width:2.72,height:2.36,thickness:.10,seconds:.65,range:2.35});

/** State is derived from the already saved mission phase/assault timestamp.
 * No wall-clock animation, extra checkpoint field or second owner of phase changes.
 * Both the renderer and collision system consume these same two leaf poses.
 */
export class BriefingDoor {
 constructor(terrain){
  this.floor=terrain.height(HQ.x,HQ.z)+.22;
  this.progress=-1;
  this.leaves=[-1,1].map((sign,index)=>({id:`briefing-door-${index}`,sign,pos:{x:0,y:this.floor+BRIEFING_DOOR.height/2,z:0},yaw:0,box:{id:BRIEFING_DOOR.id,kind:'briefing-door',walkableTop:false}}));
  this.colliders=this.leaves.map(leaf=>leaf.box);
  this.sync({phase:PHASE.BRIEFING,assaultTime:null},0);
 }
 sync(director,time){
  const d=BRIEFING_DOOR;
  const progress=director.phase===PHASE.BRIEFING?0:!Number.isFinite(director.assaultTime)?1:Math.max(0,Math.min(1,(time-director.assaultTime)/d.seconds));
  if(progress===this.progress)return;
  this.progress=progress;
  const angle=progress*progress*(3-2*progress)*Math.PI/2,half=d.width/4;
  for(const leaf of this.leaves){
   leaf.yaw=-leaf.sign*angle;
   leaf.pos.x=d.x+Math.sin(angle)*half;
   leaf.pos.z=d.z+leaf.sign*(d.width/2-Math.cos(angle)*half);
   Object.assign(leaf.box,orientedBounds(d.id,leaf.pos,leaf.yaw,d.thickness/2,half,this.floor,this.floor+d.height));
  }
 }
}

/** The prompt and E action use this exact eligibility check; no skip through walls. */
export function canUseBriefingDoor(world){
 if(world.director.phase!==PHASE.BRIEFING||!world.briefingDoor)return false;
 const d=BRIEFING_DOOR,p=world.player,point={x:d.x,y:world.briefingDoor.floor+1.04,z:d.z};
 const dx=point.x-p.pos.x,dz=point.z-p.pos.z,length=Math.hypot(dx,dz);
 if(length>.025&&(dx*Math.sin(p.yaw)+dz*Math.cos(p.yaw))/length<.5)return false;
 return canReach(world,point,d.range,d.id);
}
