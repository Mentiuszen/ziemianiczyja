import {soldierName} from '../i18n/legacy.js';
import {PHASE} from '../data/briefing.js';
import {LANDMARKS} from '../data/world-map.js';
import {Weapon} from '../combat/weapon.js';
import {v3,sub,norm,flatDist,dist,angleDiff,approachAngle,clamp,direction} from '../core/math.js';
import {eye} from '../world/collision.js';
import {fireBullet,bulletMuzzle} from '../combat/ballistics.js';
export function createSoldier(data,terrain,random){return{...data,pos:v3(data.x,terrain.height(data.x,data.z),data.z),hp:100,stance:'stand',pitch:0,vy:0,grounded:true,weapon:new Weapon(data.weapon,undefined,data.weapon==='mg08'?300:data.weapon==='lewis'?188:40),state:'observe',nextShot:0,burstLeft:0,positionalLeft:1+random()*4,stateTime:0,think:random()*.3,reaction:0,targetId:null,lastKnown:null,lastSeen:-100,path:[],pathIndex:0,pathPending:false,pathTarget:null,coverId:null,suppression:0,grenades:1,grenadeCooldown:9+random()*12,stuck:0,moving:false,shotTime:-10,hitTime:-10,deathTime:null,travel:0,wait:0,perceptionCursor:0,repathLeft:0,avoidWaypoint:null,avoidLeft:0,moveGoal:null,moveReason:null,coverRetryLeft:0,failedCoverId:null,pathFailures:0,pathGeneration:0};}
/** The first visible sample is the aim point, not an eye-only detection shortcut. */
export function visibleAimPoint(w,n,target){
 const height=target.stance==='prone'?.25:target.stance==='crouch'?.68:1.05;
 const torso=v3(target.pos.x,target.pos.y+height,target.pos.z);
 if(w.collision.visible(eye(n),torso))return torso;
 const head=eye(target);
 return w.collision.visible(eye(n),head)?head:null;
}
function visibleTarget(w,n){
 const origin=eye(n),forward={x:Math.sin(n.yaw),z:Math.cos(n.yaw)},maxRange=n.fixed?95:72;
 const candidates=w.actors.filter(a=>a.id!==n.id&&a.faction!==n.faction&&a.hp>0&&flatDist(n.pos,a.pos)<maxRange)
  .sort((a,b)=>flatDist(n.pos,a.pos)-flatDist(n.pos,b.pos)||a.id.localeCompare(b.id));
 if(!candidates.length){n.perceptionCursor=0;return null;}
 const visible=target=>{
  const delta=sub(target.pos,n.pos),length=Math.hypot(delta.x,delta.z);
  if(length>6&&(delta.x*forward.x+delta.z*forward.z)/length<.05)return false;
  return !!visibleAimPoint(w,n,target);
 };
 let budget=5;
 const tracked=candidates.find(a=>a.id===n.targetId);
 if(tracked){budget--;if(visible(tracked))return tracked;}
 const pool=candidates.filter(a=>a!==tracked);
 if(!pool.length)return null;
 let cursor=(n.perceptionCursor||0)%pool.length;
 for(let i=0;i<Math.min(budget,pool.length);i++){
  const target=pool[cursor];cursor=(cursor+1)%pool.length;n.perceptionCursor=cursor;
  if(visible(target))return target;
 }return null;
}
function setStance(w,n,stance){if(w.collision.canStand(n.pos,stance,n.yaw,n.id))n.stance=stance;}
function turn(w,n,yaw){if(n.stance!=='prone'||w.collision.canTurn(n,yaw))n.yaw=yaw;}
function requestMove(w,n,p,reason=n.state){
 const changed=!n.moveGoal||flatDist(n.moveGoal,p)>2||n.moveReason!==reason;
 if(!changed&&(n.pathPending||n.pathIndex<n.path.length||n.repathLeft>0))return;
 if(n.coverId){const cover=w.nav.cover.find(c=>c.id===n.coverId);if(!cover||flatDist(cover.pos,p)>.5)w.nav.releaseCover(n);}
 w.nav.request(n,p,reason);
}
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
 if(!n.fixed){for(const g of w.grenades){
  if(g.fuse<.12||flatDist(n.pos,g.pos)>8||!w.collision.visible(eye(n),g.pos))continue;
  const away=norm(sub(n.pos,g.pos));
  if(Math.hypot(away.x,away.z)<.01){away.x=Math.cos(n.yaw);away.z=-Math.sin(n.yaw);}
  n.state='evade';setStance(w,n,'stand');n.visibleId=null;
  requestMove(w,n,v3(n.pos.x+away.x*9,n.pos.y,n.pos.z+away.z*9),'evade');n.wait=.8;return;
 }}
 if(n.state==='evade'&&n.wait>0){n.visibleId=null;return;}
 const target=visibleTarget(w,n);n.visibleId=target?.id||null;
 if(target){
  const rediscovered=n.targetId!==target.id||w.time-n.lastSeen>=5;
  if(rediscovered){
   const profile=w.difficulty;
   const delay=target.id==='player'&&n.faction==='de'
    ?profile.reactionMin+w.random()*(profile.reactionMax-profile.reactionMin)
    :(.5+w.random()*.48)*(n.faction==='de'?profile.npcReactionScale:1);
   n.reaction=w.time+delay;n.targetId=target.id;
  }
  n.lastKnown={...target.pos};n.lastSeen=w.time;
  if(n.hp<30&&n.suppression>.6&&!n.fixed){
   n.state='retreat';const cover=w.nav.chooseCover(n,target.pos);
   if(cover){requestMove(w,n,cover.pos);n.wait=1.3;}
   else{const away=norm(sub(n.pos,target.pos));requestMove(w,n,v3(n.pos.x+away.x*6,n.pos.y,n.pos.z+away.z*6));}return;
  }
  if(n.suppression>.65&&!n.fixed&&n.wait<=0&&!n.coverId){
   const cover=w.nav.chooseCover(n,target.pos);
   if(cover){n.state='cover';requestMove(w,n,cover.pos);n.wait=1.5;return;}
  }
  if(n.state==='cover'&&(n.pathPending||n.pathIndex<n.path.length))return;
  if(n.weapon.reloadLeft>0){n.state='reload';setStance(w,n,'crouch');return;}
  n.state='aim';w.nav.cancel(n,{releaseCover:false});
  setStance(w,n,n.fixed?'stand':n.coverId||n.suppression>.6?'crouch':'stand');
  if(w.director.phase!==PHASE.BRIEFING&&n.grenades>0&&n.grenadeCooldown<=0&&!n.fixed&&flatDist(n.pos,target.pos)<21&&flatDist(n.pos,target.pos)>8&&w.actors.every(a=>a.faction!==n.faction||a.hp<=0||flatDist(a.pos,target.pos)>7)){
   const from=eye(n),delta=sub(target.pos,from),flight=1.4;
   const vel=v3(delta.x/flight,(delta.y+6*flight*flight)/flight,delta.z/flight);
   // Keep the existing arc, but include the thrower's allies and grenade radius.
   const d=norm(vel),end=v3(from.x+d.x*2,from.y+d.y*2,from.z+d.z*2);
   if(!w.collision.sweepSphere(from,end,.09,w.actors,n.id)){
    w.grenades.push({id:`grenade-${w.nextId++}`,owner:n.id,faction:n.faction,pos:{...from},vel,fuse:3.2});
    n.grenades--;n.grenadeCooldown=20;n.state='grenade';n.wait=.6;
   }
  }
 }else{
  // Identity and last observation are separate from current visibility.
  if(n.lastKnown&&w.time-n.lastSeen<5){if(!n.fixed){n.state='search';requestMove(w,n,n.lastKnown);}return;}
  n.targetId=null;n.lastKnown=null;
  for(const sound of w.noises){
   if(w.director.phase===PHASE.BRIEFING||n.group==='gun-crew'||(n.group==='counter'&&w.director.phase<PHASE.HOLD))break;
   if(sound.faction!==n.faction&&flatDist(n.pos,sound.pos)<35){
    n.lastKnown=v3(sound.pos.x+(w.random()-.5)*8,sound.pos.y,sound.pos.z+(w.random()-.5)*8);
    n.lastSeen=w.time-2;n.state='search';if(!n.fixed)requestMove(w,n,n.lastKnown);return;
   }
  }
  const goal=squadGoal(w,n);
  if(flatDist(n.pos,goal)>3&&!n.fixed){n.state='move';setStance(w,n,'stand');requestMove(w,n,goal);}
  else{
   n.state='observe';w.nav.cancel(n,{releaseCover:false});setStance(w,n,n.coverId?'crouch':'stand');
   if(n.faction==='de')turn(w,n,approachAngle(n.yaw,Math.PI,.25));
  }
 }
}
function fireAtTarget(w,n,target,dt){
 const point=visibleAimPoint(w,n,target);if(!point)return;
 const from=eye(n),delta=sub(point,from),heading=Math.atan2(delta.x,delta.z),pitch=-Math.atan2(delta.y,Math.hypot(delta.x,delta.z));
 turn(w,n,approachAngle(n.yaw,heading,dt*2.6));
 n.pitch+=clamp(pitch-n.pitch,-dt*2.1,dt*2.1);
 if(Math.abs(angleDiff(n.yaw,heading))>.035||Math.abs(n.pitch-pitch)>.035||w.time<n.reaction||w.time<(n.nextShot||0)||n.weapon.cooldown>1e-7||n.weapon.reloadLeft>0)return;
 const muzzle=bulletMuzzle(n),guard=sub(muzzle,from),to=sub(point,muzzle);
 if(w.collision.ray(from,norm(guard),dist(from,muzzle),w.actors,n.id))return;
 const hit=w.collision.ray(muzzle,norm(to),dist(muzzle,point),w.actors,n.id);
 if(hit&&(!hit.actor||hit.actor.faction===n.faction))return;
 if(!n.weapon.fire())return;
 n.state='fire';n.shotTime=w.time;
 const human=target.id==='player',automatic=['mg08','lewis'].includes(n.weapon.id),profile=w.difficulty;
 const base=human?(n.weapon.id==='mg08'?.067:.047):(automatic?.080:.067);
 // The current, rate-limited weapon orientation owns the shot, not a hidden perfect aim.
 fireBullet(w,n,n.weapon,direction(n.yaw,n.pitch),base*(n.faction==='de'&&human?profile.spread:1)*(1+n.suppression*.35));
 if(automatic){
  if(!(n.burstLeft>0))n.burstLeft=human?profile.burstMin+Math.floor(w.random()*(profile.burstMax-profile.burstMin+1)):3;
  n.burstLeft--;
  const pause=human?profile.burstPauseMin+w.random()*(profile.burstPauseMax-profile.burstPauseMin):1.8+w.random()*1.5;
  n.nextShot=w.time+(n.burstLeft>0?Math.max(.14,n.weapon.definition.cycle):pause);
 }else n.nextShot=w.time+(human?.35:2.2+w.random()*2);
 if(w.director.phase===PHASE.BRIEFING)n.nextShot=Math.max(n.nextShot,w.time+6+w.random()*3);
}
function yieldingIntent(w,n,dt){
 const p=w.player;
 if(n.faction!=='uk'||flatDist(n.pos,p.pos)>=1.1||!(p.moveIntent||p.moving))return null;
 const away=norm(v3(n.pos.x-p.pos.x,0,n.pos.z-p.pos.z));
 const right=v3(Math.cos(p.yaw),0,-Math.sin(p.yaw));
 const forward=v3(Math.sin(p.yaw),0,Math.cos(p.yaw));
 // Sideways first, then retreat to a free local waiting point. No actor pushing.
 for(const dir of [right,v3(-right.x,0,-right.z),away,forward,v3(-forward.x,0,-forward.z)]){
  if(Math.hypot(dir.x,dir.z)<.01)continue;
  let free=true;
  for(let step=1;step<=4;step++){
   const pos=v3(n.pos.x+dir.x*step*.1,n.pos.y,n.pos.z+dir.z*step*.1);
   pos.y=w.collision.supportHeight(n,pos,.2);
   if(Math.abs(pos.y-n.pos.y)>.2||!w.collision.canStand(pos,n.stance,n.yaw,n.id)){free=false;break;}
  }
  if(free)return{x:dir.x*dt*2,z:dir.z*dt*2};
 }
 return{x:0,z:0};
}
export function updateSoldier(w,n,dt){
 if(n.hp<=0){n.state='dead';n.moving=false;return;}
 n.weapon.tick(dt);n.stateTime+=dt;n.think-=dt;n.wait=Math.max(0,n.wait-dt);
 n.grenadeCooldown-=dt;n.suppression=Math.max(0,n.suppression-dt*.24);n.moving=false;
 n.repathLeft=Math.max(0,(n.repathLeft||0)-dt);n.avoidLeft=Math.max(0,(n.avoidLeft||0)-dt);
 n.coverRetryLeft=Math.max(0,(n.coverRetryLeft||0)-dt);if(!n.avoidLeft)n.avoidWaypoint=null;
 const briefingHeld=n.briefingRole&&w.director.phase===PHASE.BRIEFING;
 if(!briefingHeld){
  n.positionalLeft-=dt;
  if(n.sentry&&w.director.phase===PHASE.BRIEFING&&!n.visibleId&&n.positionalLeft<=0&&n.weapon.mag>0){
   const z=n.faction==='uk'?43:18,x=n.x+(w.random()-.5)*5;
   const from=eye(n),to=v3(x,w.terrain.height(x,z)+.12,z),d=norm(sub(to,from));
   turn(w,n,Math.atan2(d.x,d.z));n.pitch=-Math.atan2(d.y,Math.hypot(d.x,d.z));
   if(n.weapon.fire()){fireBullet(w,n,n.weapon,d,.035);n.shotTime=w.time;n.state='suppress';}
   n.positionalLeft=3.8+w.random()*4.8;
  }
  if(n.think<=0){n.think=.26+(n.faction==='uk'?.03:0);think(w,n);}
  if(n.weapon.mag===0&&!n.weapon.reloadLeft){
   if(n.weapon.reload()){n.state='reload';w.stats.reloads++;w.emit('reload',{owner:n.id,actionId:n.weapon.reloadSerial,weapon:n.weapon.id,pos:eye(n)});}
   else if(n.weapon.reserve===0&&!n.fixed){n.state='retreat';requestMove(w,n,squadGoal(w,n));}
  }
  const target=w.actors.find(a=>a.id===n.visibleId&&a.hp>0);
  if(target&&['aim','fire','reload'].includes(n.state))fireAtTarget(w,n,target,dt);
 }
 let dx=0,dz=0,following=false;
 if(!briefingHeld&&!n.fixed&&!['aim','fire','reload','grenade'].includes(n.state)){
  // Consuming an already-reached waypoint must not skip physics or yielding.
  while(n.pathIndex<n.path.length&&flatDist(n.pos,n.path[n.pathIndex])<.48)n.pathIndex++;
  if(n.path.length&&n.pathIndex>=n.path.length){
   n.path=[];n.pathIndex=0;n.pathTarget=null;n.moveGoal=null;n.moveReason=null;
   if(n.state==='cover'){setStance(w,n,'crouch');n.state='observe';}
  }
  const waypoint=n.path[n.pathIndex];
  if(waypoint){
   following=true;const d=norm(v3(waypoint.x-n.pos.x,0,waypoint.z-n.pos.z));
   let speed=n.state==='evade'||n.state==='retreat'?3.1:n.state==='search'?1.45:2.25,sx=0,sz=0;
   for(const a of w.actors){
    if(a.id===n.id||a.hp<=0)continue;const distance=flatDist(n.pos,a.pos);
    if(distance<.85&&distance>.02){const strength=(.85-distance)*(a.id==='player'?2.2:1);sx+=(n.pos.x-a.pos.x)/distance*strength;sz+=(n.pos.z-a.pos.z)/distance*strength;if(distance<.4&&a.id<n.id)speed*=.45;}
   }
   for(const tank of w.tanks){const gap=n.pos.z-tank.pos.z;if(Math.abs(gap)<5.7&&Math.abs(n.pos.x-tank.pos.x)<3){sx+=(n.pos.x>=tank.pos.x?1:-1)*2.5;if(Math.abs(gap)<4)speed*=.7;}}
   turn(w,n,approachAngle(n.yaw,Math.atan2(d.x,d.z),dt*2.3));dx=(d.x*speed+sx)*dt;dz=(d.z*speed+sz)*dt;
  }
 }
 const yielding=yieldingIntent(w,n,dt);
 if(yielding){dx=yielding.x;dz=yielding.z;following=false;}
 const old={...n.pos};
 w.collision.move(n,dx,dz,dt); // Exactly one gravity/contact integration per living actor.
 const moved=flatDist(old,n.pos);n.moving=moved>dt*.15;n.travel+=moved;
 n.stuck=following&&moved<dt*.12?n.stuck+dt:0;
 if(n.stuck>1.6){
  const goal=n.moveGoal&&{...n.moveGoal},reason=n.moveReason;
  n.avoidWaypoint=n.path[n.pathIndex]?{...n.path[n.pathIndex]}:null;n.avoidLeft=3;
  w.nav.cancel(n);n.stuck=0;n.repathLeft=.5;n.think=.1;w.stats.replans++;
  if(goal){n.moveGoal=goal;n.moveReason=reason;} // Retry is bounded and excludes the blocked local waypoint.
 }
}
export function soldierSnapshot(n){const copy={...n,weapon:n.weapon.snapshot(),path:n.path.map(p=>({...p})),pos:{...n.pos}};delete copy.pathPending;delete copy.lastSafePosition;delete copy.collisionBlocked;delete copy.moveDirection;return copy;}
export function restoreSoldier(data){return{...data,name:soldierName(data),path:data.path.map(p=>({...p})),pos:{...data.pos},weapon:Weapon.restore(data.weapon),pathPending:false,pathIndex:data.pathIndex??0,pathGeneration:0,grounded:false,lastSafePosition:null,collisionBlocked:false,perceptionCursor:data.perceptionCursor??0,repathLeft:data.repathLeft??0,avoidWaypoint:data.avoidWaypoint??null,avoidLeft:data.avoidLeft??0,moveGoal:data.moveGoal??data.pathTarget??null,moveReason:data.moveReason??data.state,coverRetryLeft:data.coverRetryLeft??0,failedCoverId:data.failedCoverId??null,pathFailures:data.pathFailures??0};}
