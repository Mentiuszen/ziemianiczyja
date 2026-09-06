import {message} from '../i18n/message.js';
import {v3,sub,norm,flatDist,add,mul,angleDiff,approachAngle} from '../core/math.js';
import {orientedBounds,footprintOverlap,footprintsIntersect} from '../world/shapes.js';
import {BODY_HEIGHT,CONTACT_EPS} from '../world/collision.js';
import {blast,fireMountedBullet} from '../combat/ballistics.js';

export function createTank(data,terrain){return{...data,route:data.route.map(p=>({...p})),routeIndex:0,pos:v3(data.x,terrain.height(data.x,data.z),data.z),yaw:0,state:'waiting',weaponLeft:2,mgLeft:1,mgAmmo:450,mgBurst:0,ammunition:18,moving:false,gunWorking:true,trackPhase:0,integrity:100,tracks:100,blockedTime:0,lastFire:-100,lastHit:-100};}
export function tankBounds(t){return orientedBounds(t.id,t.pos,t.yaw,1.8,3.7,t.pos.y+.05,t.pos.y+2.65);}
export function tankMount(t,x,y,z){return v3(t.pos.x+x*Math.cos(t.yaw)+z*Math.sin(t.yaw),t.pos.y+y,t.pos.z-x*Math.sin(t.yaw)+z*Math.cos(t.yaw));}
/** Keep these offsets aligned with the Mark IV asset muzzle tips (metres). */
export function tankMuzzle(t,kind,side=1){return kind==='mg'?tankMount(t,0,1.36,3.23):tankMount(t,Math.sign(side)*2.93,1.40,1.34);}
function local(t,p){const x=p.x-t.pos.x,z=p.z-t.pos.z;return{x:x*Math.cos(t.yaw)-z*Math.sin(t.yaw),z:x*Math.sin(t.yaw)+z*Math.cos(t.yaw)};}

/** Conservative swept footprint shared with actor blocking; no two front-point shortcut. */
export function tankMoveClear(w,t,pos,yaw){
 const delta=angleDiff(yaw,t.yaw),angle=t.yaw+delta/2,c=Math.cos(angle),s=Math.sin(angle);
 const dx=pos.x-t.pos.x,dz=pos.z-t.pos.z,rotationMargin=4.2*Math.abs(delta)/2;
 const mid=v3((pos.x+t.pos.x)/2,(pos.y+t.pos.y)/2,(pos.z+t.pos.z)/2);
 const sweep=orientedBounds(t.id,mid,angle,1.8+Math.abs(dx*c-dz*s)/2+rotationMargin,3.7+Math.abs(dx*s+dz*c)/2+rotationMargin,Math.min(pos.y,t.pos.y)+.05,Math.max(pos.y,t.pos.y)+2.65);
 for(const a of w.actors){
  if(a.hp<=0||a.pos.y+(BODY_HEIGHT[a.stance]||1.74)<=sweep.min.y+CONTACT_EPS||a.pos.y>=sweep.max.y-CONTACT_EPS)continue;
  for(const offset of a.stance==='prone'?[0,-.55,.55]:[0]){
   const x=a.pos.x+Math.sin(a.yaw||0)*offset,z=a.pos.z+Math.cos(a.yaw||0)*offset,r=.28;
   if(footprintOverlap({x,z},r,sweep,CONTACT_EPS))return false;
  }
 }
 const boxes=[...w.collision.index.bounds(sweep.min.x,sweep.min.z,sweep.max.x,sweep.max.z),...w.collision.dynamic];
 for(const b of boxes){
  if(b.id===t.id||b.owner===t.id||b.blocksMovement===false)continue;
  // Retain the existing .60 m ground-clearance rule; do not shrink actor blockers.
  if(b.max.y<=Math.min(t.pos.y,pos.y)+.60||b.min.y>=sweep.max.y-CONTACT_EPS)continue;
  if(footprintsIntersect(sweep,b,CONTACT_EPS))return false;
 }
 return true;
}

/** Conventional small-arms fire cannot drain a tank's hull-health bar. */
export function damageTank(w,t,amount,source,point){
 if(t.state==='destroyed'||source.faction===t.faction||source.kind!=='shell')return false;
 const trackHit=point.y-t.pos.y<1.02;
 if(trackHit){t.tracks=Math.max(0,t.tracks-amount*2.2);t.integrity=Math.max(0,t.integrity-amount*.28);}
 else {t.integrity=Math.max(0,t.integrity-amount);if(t.integrity<48)t.gunWorking=false;}
 if(t.tracks<=0)t.state='immobilized';
 if(t.integrity<=0){t.state='destroyed';t.gunWorking=false;w.emit('explosion',{pos:{...t.pos,y:t.pos.y+1.2},radius:4});}
 t.lastHit=w.time;w.stats.tankHits++;w.emit('tank-hit',{id:t.id,pos:{...point},destroyed:t.state==='destroyed'});
 if(w.director.once(t.id+'-damaged'))w.emit('message',{text:message('message.tankHit',{name:t.name})});
 return true;
}
export function updateTank(w,t,dt){
 t.weaponLeft-=dt;t.mgLeft-=dt;t.moving=false;
 if(w.director.phase===0||t.state==='destroyed')return;
 if(t.state!=='immobilized'){
  const waypoint=t.route[t.routeIndex];
  if(!waypoint)t.state='holding';
  else if(flatDist(t.pos,waypoint)<.38){
   if(!waypoint.gate||w.director.events.includes(waypoint.gate)){t.routeIndex++;t.state='moving';}else t.state='holding';
  }else{
   const heading=Math.atan2(waypoint.x-t.pos.x,waypoint.z-t.pos.z);const yaw=approachAngle(t.yaw,heading,dt*.32);
   const speed=1.4*Math.max(.15,Math.cos(angleDiff(heading,yaw))),dx=Math.sin(yaw)*speed*dt,dz=Math.cos(yaw)*speed*dt;
   const front=tankMount(t,0,1,4.05),next=v3(t.pos.x+dx,0,t.pos.z+dz);next.y=w.terrain.height(next.x,next.z);
   for(const b of w.layout)if(b.breakable&&!w.destroyedObstacles.includes(b.id)&&Math.abs(front.x-b.x)<b.w/2+1.5&&Math.abs(front.z-b.z)<b.d/2+.7)w.breakObstacle(b.id);
   const clear=tankMoveClear(w,t,next,yaw);
   const steep=Math.abs(next.y-t.pos.y)>Math.max(.06,Math.hypot(dx,dz)*.9);
   if(clear&&!steep){t.yaw=yaw;t.pos=next;t.state='moving';t.moving=true;t.trackPhase+=Math.hypot(dx,dz);t.blockedTime=0;}
   else{t.state='holding';t.blockedTime+=dt;}
  }
 }
 if(!t.gunWorking)return;
 const enemies=w.npcs.filter(n=>n.hp>0&&n.faction!==t.faction).sort((a,b)=>flatDist(a.pos,t.pos)-flatDist(b.pos,t.pos));
 for(const enemy of enemies){
  const q=local(t,enemy.pos),distance=flatDist(enemy.pos,t.pos);if(distance<6||distance>65)continue;
  const target=add(enemy.pos,v3(0,enemy.stance==='crouch'?.65:1.05,0));
  // Front MG aperture: short bursts; unlike the old unused mgLeft it actually fires.
  if(q.z>0&&Math.abs(q.x)<q.z*.9&&t.mgLeft<=0&&t.mgAmmo>0){
   const from=tankMuzzle(t,'mg'),d=sub(target,from),hit=w.collision.ray(from,norm(d),Math.hypot(d.x,d.y,d.z),w.actors,null,{ignoreSolid:t.id});
   if(!hit||hit.actor?.faction!==t.faction&&hit.kind==='actor'){
    fireMountedBullet(w,t,from,norm(d));t.mgAmmo--;t.mgBurst=(t.mgBurst||4)-1;t.mgLeft=t.mgBurst>0?.15:2.4+w.random()*1.1;w.stats.tankMGShots++;t.lastFire=w.time;
   }
  }
  // Fixed sponsons: outward/front sectors. No imaginary traversing turret.
  if(q.z<-4||Math.abs(q.x)<Math.max(2,Math.abs(q.z)*.35)||Math.abs(q.x)>Math.max(0,q.z)*3.5+13||t.weaponLeft>0||t.ammunition<=0)continue;
  const from=tankMuzzle(t,'cannon',q.x),d=sub(target,from),length=Math.hypot(d.x,d.y,d.z);
  const hit=w.collision.ray(from,norm(d),length-.2,w.actors,null,{ignoreSolid:t.id});if(hit&&hit.actor?.faction!==enemy.faction)continue;
  // Deliberately suppress the position instead of every cannon round being a perfect headshot.
  d.x+=(w.random()-.5)*1.7;d.z+=(w.random()-.5)*1.7;
  const flight=Math.max(.35,length/35);
  w.shells.push({id:`shell-${w.nextId++}`,owner:t.id,faction:t.faction,pos:from,vel:v3(d.x/flight,(d.y+3*flight*flight)/flight,d.z/flight),ttl:flight+1,power:145,radius:3.8,kind:'shell'});
  t.weaponLeft=9+w.random()*4;t.ammunition--;t.lastFire=w.time;w.stats.tankCannonShots++;w.emit('cannon',{pos:from,owner:t.id});break;
 }
}
export function updateShells(w,dt){
 for(const s of w.shells){
  s.ttl-=dt;s.vel.y-=6*dt;const delta=mul(s.vel,dt),length=Math.hypot(delta.x,delta.y,delta.z);
  const hit=w.collision.ray(s.pos,norm(delta),length,w.actors,null,{ignoreSolid:s.owner});
  if(hit||s.ttl<=0){
   const point=hit?.point||s.pos,owner={id:s.owner,faction:s.faction,kind:'shell',pos:{...point}};
   if(hit?.solid){const t=w.tanks.find(t=>t.id===hit.solid.id);if(t)damageTank(w,t,s.armorDamage||48,owner,point);}
   blast(w,point,s.radius||4.8,s.power||190,owner);s.dead=true;
  }else s.pos=add(s.pos,delta);
 }
 w.shells=w.shells.filter(s=>!s.dead);
}
