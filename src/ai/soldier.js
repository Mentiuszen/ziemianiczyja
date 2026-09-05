import {PHASE} from '../data/briefing.js';
import {LANDMARKS} from '../data/world-map.js';
import {Weapon} from '../combat/weapon.js';
import {v3,sub,norm,flatDist,dist,angleDiff,approachAngle,clamp} from '../core/math.js';
import {eye} from '../world/collision.js';
import {fireBullet} from '../combat/ballistics.js';
export function createSoldier(data,terrain,random){return{...data,pos:v3(data.x,terrain.height(data.x,data.z),data.z),hp:100,stance:'stand',pitch:0,vy:0,grounded:true,weapon:new Weapon(data.weapon,undefined,data.weapon==='mg08'?300:data.weapon==='lewis'?188:40),state:'observe',nextShot:0,burstLeft:0,positionalLeft:1+random()*4,stateTime:0,think:random()*.3,reaction:0,targetId:null,lastKnown:null,lastSeen:-100,path:[],pathIndex:0,pathPending:false,pathTarget:null,coverId:null,suppression:0,grenades:1,grenadeCooldown:9+random()*12,stuck:0,moving:false,shotTime:-10,hitTime:-10,deathTime:null,travel:0,wait:0};}
function visibleTarget(w,n){const origin=eye(n),forward={x:Math.sin(n.yaw),z:Math.cos(n.yaw)},maxRange=n.fixed?95:72;
 const candidates=w.actors.filter(a=>a.id!==n.id&&a.faction!==n.faction&&(a.hp??0)>0&&flatDist(n.pos,a.pos)<maxRange).sort((a,b)=>flatDist(n.pos,a.pos)-flatDist(n.pos,b.pos));
 for(const target of candidates.slice(0,5)){const delta=sub(target.pos,n.pos),length=Math.hypot(delta.x,delta.z);if(length>6&&(delta.x*forward.x+delta.z*forward.z)/length<.05)continue;if(w.collision.visible(origin,eye(target)))return target;}return null;
}
function requestMove(w,n,p){if(!n.pathTarget||flatDist(n.pathTarget,p)>3||(!n.path.length&&!n.pathPending)){w.nav.request(n,p);}}
function squadGoal(w,n){const phase=w.director.phase;if(phase===PHASE.BRIEFING||n.group==='gun-crew'||(n.group==='counter'&&phase<PHASE.HOLD))return v3(n.x,0,n.z);if(n.faction==='uk'){
 const i=Number(n.id.split('-')[1])||0,offset=(i%4-1.5)*2.3;
 if(phase<=1)return v3(i%2?6:-27,0,41+(i%3)*2);
 if(phase===2)return v3(i%2?30:-20,0,63+offset);
 if(phase===PHASE.RALLY)return v3(-27+offset,0,72+(i%3)*2);
 if(phase===PHASE.ARTILLERY)return v3(12+offset,0,84+(i%3)*3);
 return v3(2+offset*1.5,0,LANDMARKS.telephone.z+(i%3)*2);
 }
 if(n.group==='counter')return v3(4+(Number(n.id.split('-').pop())%3-1)*4,0,LANDMARKS.telephone.z);
 if(n.group==='village'&&phase>=PHASE.TELEPHONE)return v3(n.pos.x>4?17:-9,0,166);
 return v3(n.x,0,n.z);
}
function think(w,n){
 if(!n.fixed){for(const g of w.grenades){if(g.fuse<.12||flatDist(n.pos,g.pos)>8||!w.collision.visible(eye(n),g.pos))continue;const away=norm(sub(n.pos,g.pos)),goal=v3(n.pos.x+away.x*9,0,n.pos.z+away.z*9);n.state='evade';n.stance='stand';n.visibleId=null;requestMove(w,n,goal);n.wait=.8;return;}}
 const target=visibleTarget(w,n);n.visibleId=target?.id||null;
 if(target){if(n.targetId!==target.id){n.reaction=w.time+(.5+w.random()*.48)*(n.faction==='de'?w.difficulty.reaction:1);n.targetId=target.id;}
  n.lastKnown={...target.pos};n.lastSeen=w.time;
  if(n.hp<30&&n.suppression>.6&&!n.fixed){n.state='retreat';const cover=w.nav.chooseCover(n,target.pos);if(cover){n.coverId=cover.id;requestMove(w,n,cover.pos);n.wait=1.3;}else{const away=norm(sub(n.pos,target.pos));requestMove(w,n,{x:n.pos.x+away.x*6,y:n.pos.y,z:n.pos.z+away.z*6});}return;}
  if(n.suppression>.65&&!n.fixed&&n.wait<=0){const cover=w.nav.chooseCover(n,target.pos);if(cover){n.coverId=cover.id;n.state='cover';requestMove(w,n,cover.pos);n.wait=1.5;return;}}
  if(n.state==='cover'&&n.path.length&&n.pathIndex<n.path.length)return;
  if(n.weapon.reloadLeft>0){n.state='reload';n.stance='crouch';return;}
  n.state='aim';n.path=[];n.pathIndex=0;n.pathTarget=null;
  n.stance=n.fixed?'stand':n.suppression>.6?'crouch':'stand';
  if(w.director.phase!==PHASE.BRIEFING&&n.grenades>0&&n.grenadeCooldown<=0&&!n.fixed&&flatDist(n.pos,target.pos)<21&&flatDist(n.pos,target.pos)>8&&w.actors.every(a=>a.faction!==n.faction||a.hp<=0||flatDist(a.pos,target.pos)>7)){
   const from=eye(n),delta=sub(target.pos,from),range=Math.hypot(delta.x,delta.z),flight=1.4,vel=v3(delta.x/flight,(delta.y+6*flight*flight)/flight,delta.z/flight);
   // Test the early arc; do not throw into a close roof or the back of an ally.
   if(!w.collision.ray(from,norm(vel),2,[],n.id)){w.grenades.push({id:`grenade-${w.nextId++}`,owner:n.id,faction:n.faction,pos:{...from},vel,fuse:3.2});n.grenades--;n.grenadeCooldown=20;n.state='grenade';n.wait=.6;}
  }
 }else{
  n.targetId=null;
  if(n.lastKnown&&w.time-n.lastSeen<5&&!n.fixed){n.state='search';requestMove(w,n,n.lastKnown);return;}
  for(const sound of w.noises){if(w.director.phase===PHASE.BRIEFING||n.group==='gun-crew'||(n.group==='counter'&&w.director.phase<PHASE.HOLD))break;if(sound.faction!==n.faction&&flatDist(n.pos,sound.pos)<35){n.lastKnown=v3(sound.pos.x+(w.random()-.5)*8,sound.pos.y,sound.pos.z+(w.random()-.5)*8);n.lastSeen=w.time-2;n.state='search';if(!n.fixed)requestMove(w,n,n.lastKnown);return;}}
  const goal=squadGoal(w,n);if(flatDist(n.pos,goal)>3&&!n.fixed){n.state='move';n.stance='stand';requestMove(w,n,goal);}else{n.state='observe';n.path=[];n.stance='stand';if(n.faction==='de')n.yaw=approachAngle(n.yaw,Math.PI,.25);}
 }
 // Perceived nearby grenades override movement, only after line of sight.
 for(const g of w.grenades){if(g.fuse<.12||flatDist(n.pos,g.pos)>8||!w.collision.visible(eye(n),g.pos))continue;if(n.fixed)break;const away=norm(sub(n.pos,g.pos)),goal=v3(n.pos.x+away.x*9,0,n.pos.z+away.z*9);n.state='evade';n.stance='stand';requestMove(w,n,goal);n.wait=.8;break;}
}
export function updateSoldier(w,n,dt){
 if(n.hp<=0){n.state='dead';n.moving=false;return;}
 n.weapon.tick(dt);n.stateTime+=dt;n.think-=dt;n.wait=Math.max(0,n.wait-dt);n.grenadeCooldown-=dt;n.suppression=Math.max(0,n.suppression-dt*.24);n.moving=false;
 // Odprawa holds movement orders, never perception or self-defense.
 if(n.briefingRole&&w.director.phase===PHASE.BRIEFING){w.collision.move(n,0,0,dt);return;}
 n.positionalLeft-=dt;
 if(n.sentry&&w.director.phase===PHASE.BRIEFING&&!n.visibleId&&n.positionalLeft<=0&&n.weapon.mag>0){
  const z=n.faction==='uk'?43:18,x=n.x+(w.random()-.5)*5;
  const from=eye(n),to=v3(x,w.terrain.height(x,z)+.12,z),d=norm(sub(to,from));
  n.yaw=Math.atan2(d.x,d.z);n.pitch=-Math.atan2(d.y,Math.hypot(d.x,d.z));
  if(n.weapon.fire()){fireBullet(w,n,n.weapon,d,.035);n.shotTime=w.time;n.state='suppress';}
  n.positionalLeft=3.8+w.random()*4.8;
 }

 if(n.think<=0){n.think=.26+(n.faction==='uk'?.03:0);think(w,n);}
 if(n.weapon.mag===0&&!n.weapon.reloadLeft){if(n.weapon.reload()){n.state='reload';w.stats.reloads++;w.emit('reload',{weapon:n.weapon.id,pos:eye(n)});}else if(n.weapon.reserve===0&&!n.fixed){n.state='retreat';requestMove(w,n,squadGoal(w,n));}}
 const target=w.actors.find(a=>a.id===n.visibleId&&a.hp>0);
 if(target&&['aim','fire','reload'].includes(n.state)){
  const point=eye(target);if(target.id!=='player')point.y=target.pos.y+(target.stance==='prone'?.25:target.stance==='crouch'?.68:1.05);else point.y-=.16;const d=sub(point,eye(n)),heading=Math.atan2(d.x,d.z);n.yaw=approachAngle(n.yaw,heading,dt*2.6);n.pitch=-Math.atan2(d.y,Math.hypot(d.x,d.z));
  const aligned=Math.abs(angleDiff(n.yaw,heading))<.15;
  if(aligned&&w.time>=n.reaction&&w.time>=(n.nextShot||0)&&n.weapon.cooldown<=0&&!n.weapon.reloadLeft&&w.collision.visible(eye(n),eye(target))){
   // Friendly actors are real blockers, not invisible pass-through targets.
   const hit=w.collision.ray(eye(n),norm(d),dist(eye(n),eye(target)),w.actors,n.id);
   if(hit?.actor&&hit.actor.faction===n.faction){n.state='observe';n.yaw+=.08;return;}
   if(n.weapon.fire()){
    n.state='fire';n.shotTime=w.time;const human=target.id==='player',automatic=['mg08','lewis'].includes(n.weapon.id);
    const base=human?(n.weapon.id==='mg08'?.067:.047):(automatic?.080:.067);
    fireBullet(w,n,n.weapon,norm(d),base*(n.faction==='de'&&human?w.difficulty.spread:1)*(1+n.suppression*.35));
    if(!human){
     if(automatic){n.burstLeft=(n.burstLeft||3)-1;n.nextShot=w.time+(n.burstLeft>0?.16:1.8+w.random()*1.5);}
     else n.nextShot=w.time+2.2+w.random()*2.0;
     if(w.director.phase===PHASE.BRIEFING)n.nextShot=w.time+6+w.random()*3;
    }else n.nextShot=w.time+(automatic?.14:.35);
   }
  }
 }
 if(n.path?.length&&n.pathIndex<n.path.length&&!n.fixed&&!['aim','fire','reload','grenade'].includes(n.state)){
  const p=n.path[n.pathIndex];if(flatDist(n.pos,p)<.48){n.pathIndex++;if(n.pathIndex>=n.path.length){n.path=[];n.pathTarget=null;if(n.state==='cover'){n.stance='crouch';n.state='observe';}w.nav.releaseCover(n.id);}return;}
  const d=norm(v3(p.x-n.pos.x,0,p.z-n.pos.z));let speed=n.state==='evade'||n.state==='retreat'?3.1:n.state==='search'?1.45:2.25;let sx=0,sz=0;
  for(const a of w.actors){if(a.id===n.id||a.hp<=0)continue;const distance=flatDist(n.pos,a.pos);if(distance<.85&&distance>.02){const strength=(.85-distance)*(a.id==='player'?2.2:1);sx+=(n.pos.x-a.pos.x)/distance*strength;sz+=(n.pos.z-a.pos.z)/distance*strength;if(distance<.4&&a.id<n.id)speed*=.45;}}
  for(const tank of w.tanks){const dz=n.pos.z-tank.pos.z;if(Math.abs(dz)<5.7&&Math.abs(n.pos.x-tank.pos.x)<3){sx+=(n.pos.x>=tank.pos.x?1:-1)*2.5;if(Math.abs(dz)<4)speed*=.7;}}
  n.yaw=approachAngle(n.yaw,Math.atan2(d.x,d.z),dt*2.3);const old={...n.pos};w.collision.move(n,(d.x*speed+sx)*dt,(d.z*speed+sz)*dt,dt);const moved=flatDist(old,n.pos);n.moving=moved>dt*.15;n.travel+=moved;n.stuck=moved<dt*.12?n.stuck+dt:0;
  if(n.stuck>1.6){n.stuck=0;n.path=[];n.pathTarget=null;n.think=.1;n.state='search';w.stats.replans++;}
 }else w.collision.move(n,0,0,dt);
 // Allies yield to the approaching player instead of pinning a doorway.
 if(n.faction==='uk'&&flatDist(n.pos,w.player.pos)<1.1&&(w.player.moveIntent||w.player.moving)){const dx=n.pos.x-w.player.pos.x,dz=n.pos.z-w.player.pos.z,l=Math.hypot(dx,dz)||1;w.collision.move(n,(dx/l+Math.cos(w.player.yaw)*.7)*dt*2,(dz/l-Math.sin(w.player.yaw)*.7)*dt*2,dt);}
}
export function soldierSnapshot(n){const copy={...n,weapon:n.weapon.snapshot(),path:n.path.map(p=>({...p})),pos:{...n.pos}};delete copy.pathPending;return copy;}
export function restoreSoldier(data){return{...data,weapon:Weapon.restore(data.weapon),pathPending:false};}
