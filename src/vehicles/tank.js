import {v3,sub,norm,flatDist,add,mul} from '../core/math.js';
import {blast} from '../combat/ballistics.js';
export function createTank(data,terrain){return{...data,pos:v3(data.x,terrain.height(data.x,data.z),data.z),yaw:0,state:'waiting',weaponLeft:2,mgLeft:1,ammunition:18,moving:false,gunWorking:true,trackPhase:0};}
export function tankBounds(t){return{id:t.id,min:v3(t.pos.x-1.8,t.pos.y+.05,t.pos.z-3.7),max:v3(t.pos.x+1.8,t.pos.y+2.65,t.pos.z+3.7)};}
export function updateTank(w,t,dt){t.weaponLeft-=dt;t.mgLeft-=dt;t.moving=false;if(w.director.phase===0||t.state==='destroyed')return;
 if(t.state==='waiting')t.state='moving';
 if(t.state==='moving'){
  const ahead=w.actors.some(a=>a.hp>0&&Math.abs(a.pos.x-t.pos.x)<2.1&&a.pos.z>t.pos.z+2&&a.pos.z<t.pos.z+6);
  const nextZ=t.pos.z+dt*1.4,nextY=w.terrain.height(t.pos.x,nextZ);
  const blocked=w.collision.boxes.some(b=>Math.abs(b.x-t.pos.x)<b.w/2+1.7&&b.z>t.pos.z+3&&b.z<t.pos.z+4.7&&b.h>.7);
  if(!ahead&&!blocked&&Math.abs(nextY-t.pos.y)<.45){t.pos.z=nextZ;t.pos.y=nextY;t.moving=true;t.trackPhase+=dt*1.4;}
  if(t.pos.z>=t.endZ){t.state=t.immobilize?'immobilized':'holding';if(t.immobilize){w.emit('message',{text:'Hughes: H24 stanął! Działa wciąż pracują. Przechodzimy łącznikiem.'});w.director.once('tank-stalled');}}
 }
 if(!t.gunWorking)return;
 const enemies=w.npcs.filter(n=>n.hp>0&&n.faction==='de').sort((a,b)=>flatDist(a.pos,t.pos)-flatDist(b.pos,t.pos));
 for(const enemy of enemies){const dx=enemy.pos.x-t.pos.x,dz=enemy.pos.z-t.pos.z,distance=flatDist(enemy.pos,t.pos);if(distance<7||distance>47||dz<-4)continue;
  // Two fixed sponsons, no rotating turret. Each covers an outward/front arc.
  if(Math.abs(dx)<Math.abs(dz)*.35||Math.abs(dx)>Math.abs(dz)*3.5+10)continue;
  const from=v3(t.pos.x+Math.sign(dx)*2.05,t.pos.y+1.5,t.pos.z+1),target=add(enemy.pos,v3(0,.85,0));
  const delta=sub(target,from),hit=w.collision.ray(from,norm(delta),Math.hypot(delta.x,delta.y,delta.z)-.2,[],null,{ignoreSolid:t.id});if(hit)continue;
  if(t.weaponLeft<=0&&t.ammunition>0){const flight=Math.max(.35,distance/34);w.shells.push({id:`shell-${w.nextId++}`,owner:t.id,faction:'uk',pos:from,vel:v3(delta.x/flight,(delta.y+3*flight*flight)/flight,delta.z/flight),ttl:flight+.8});t.weaponLeft=10+w.random()*4;t.ammunition--;w.emit('cannon',{pos:from});}break;
 }
}
export function updateShells(w,dt){for(const s of w.shells){s.ttl-=dt;s.vel.y-=6*dt;const delta=mul(s.vel,dt),length=Math.hypot(delta.x,delta.y,delta.z),hit=w.collision.ray(s.pos,norm(delta),length,w.npcs,null,{ignoreSolid:s.owner});if(hit||s.ttl<=0){blast(w,hit?.point||s.pos,4.8,190,{id:s.owner,faction:s.faction});s.dead=true;}else s.pos=add(s.pos,delta);}w.shells=w.shells.filter(s=>!s.dead);}
