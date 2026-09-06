import {LocalizedError} from '../i18n/index.js';
import {MAP,MISSION_VERSION} from '../data/world-map.js';
import {FIELD_GUNS,AIR_SORTIES} from '../data/support.js';
import {WEAPONS,DIFFICULTIES} from '../data/weapons.js';
export const SAVE_VERSION=1;
const finite=(v,min=-100000,max=100000)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
function position(p){return p&&finite(p.x,MAP.minX,MAP.minX+MAP.width)&&finite(p.y,-20,40)&&finite(p.z,MAP.minZ,MAP.minZ+MAP.depth);}
export function validateSnapshot(s){
 if(!s||s.version!==SAVE_VERSION||s.mission!=='cambrai'||s.missionVersion!==MISSION_VERSION)throw new LocalizedError('save.version');
 if(!finite(s.time,0,360000)||!position(s.player?.pos)||!finite(s.player?.health?.hp,0,100))throw new LocalizedError('save.playerData');
 if(!Array.isArray(s.player.weapons)||s.player.weapons.length!==2)throw new LocalizedError('save.inventory');
 for(const w of s.player.weapons)if(!WEAPONS[w.id]||!Number.isInteger(w.mag)||w.mag<0||w.mag>WEAPONS[w.id].capacity||!Number.isInteger(w.reserve)||w.reserve<0||w.reserve>999||!finite(w.cooldown,0,60)||!finite(w.reloadLeft,0,60))throw new LocalizedError('save.ammo');
 if(!Number.isInteger(s.director?.phase)||s.director.phase<0||s.director.phase>7||!Array.isArray(s.director.events))throw new LocalizedError('save.mission');
 if(!Array.isArray(s.npcs)||s.npcs.length>100||!Array.isArray(s.tanks)||s.tanks.length!==2||!Array.isArray(s.items)||s.items.length>150)throw new LocalizedError('save.world');
 const ids=new Set(['player']);for(const a of [...s.npcs,...s.tanks,...s.items,...(s.fieldGuns||[])]){if(typeof a.id!=='string'||ids.has(a.id)||!position(a.pos))throw new LocalizedError('save.identity');ids.add(a.id);}
 for(const n of s.npcs){
  if(!finite(n.hp,0,100))throw new LocalizedError('save.npcHealth');
  const w=n.weapon;if(!w||!WEAPONS[w.id]||!Number.isInteger(w.mag)||w.mag<0||w.mag>WEAPONS[w.id].capacity||!Number.isInteger(w.reserve)||w.reserve<0||w.reserve>999||!finite(w.cooldown,0,60)||!finite(w.reloadLeft,0,60))throw new LocalizedError('save.npcWeapon');
  if(!finite(n.yaw)||!finite(n.think,-10,30)||!finite(n.suppression,0,10)||!finite(n.reaction,-100,360000)||!Array.isArray(n.path)||n.path.length>6500||n.path.some(p=>!position(p)))throw new LocalizedError('save.ai');
 }
 if(!['stand','crouch','prone'].includes(s.player.stance)||!Number.isInteger(s.player.slot)||s.player.slot<0||s.player.slot>1||!Number.isInteger(s.player.grenades)||s.player.grenades<0||s.player.grenades>8||!finite(s.player.health.delay,0,6)||!finite(s.player.yaw)||!finite(s.player.pitch,-1.5,1.5)||!finite(s.player.stamina,0,6))throw new LocalizedError('save.playerState');
 if(!finite(s.director.hold,0,55)||new Set(s.director.events).size!==s.director.events.length||s.director.events.some(id=>typeof id!=='string'))throw new LocalizedError('save.events');
 for(const tank of s.tanks)if(!['waiting','moving','holding','immobilized','destroyed'].includes(tank.state)||!finite(tank.weaponLeft,-360000,60)||!Number.isInteger(tank.ammunition)||tank.ammunition<0||tank.ammunition>30)throw new LocalizedError('save.vehicle');
 if(!finite(s.director.briefingTime,0,42)||(s.director.assaultTime!==null&&!finite(s.director.assaultTime,0,s.time))||!finite(s.director.holdThreats,0,100))throw new LocalizedError('save.briefing');
 if(!Array.isArray(s.fieldGuns)||s.fieldGuns.length!==FIELD_GUNS.length)throw new LocalizedError('save.artillery');
 for(const g of s.fieldGuns)if(!FIELD_GUNS.some(x=>x.id===g.id)||!position(g.pos)||!finite(g.yaw)||!finite(g.reloadLeft,-1,60)||!Number.isInteger(g.ammo)||g.ammo<0||g.ammo>18||typeof g.disabled!=='boolean'||typeof g.operational!=='boolean'||!Array.isArray(g.crewIds)||g.crewIds.some(id=>!s.npcs.some(n=>n.id===id)))throw new LocalizedError('save.gun');
 if(!Array.isArray(s.destroyedObstacles)||s.destroyedObstacles.some(id=>!['wire-tank-1','wire-tank-2'].includes(id))||new Set(s.destroyedObstacles).size!==s.destroyedObstacles.length)throw new LocalizedError('save.wire');
 if(!s.air||!Array.isArray(s.air.launched)||s.air.launched.length>AIR_SORTIES.length||new Set(s.air.launched).size!==s.air.launched.length||s.air.launched.some(id=>!AIR_SORTIES.some(x=>x.id===id))||!Array.isArray(s.air.planes)||s.air.planes.length>6||!Array.isArray(s.air.bombs)||s.air.bombs.length)throw new LocalizedError('save.air');
 if(new Set(s.air.planes.map(p=>p.id)).size!==s.air.planes.length)throw new LocalizedError('save.duplicatePlanes');
 const flightPos=p=>p&&finite(p.x,-1000,1000)&&finite(p.y,0,250)&&finite(p.z,-1000,1000);
 for(const p of s.air.planes)if(!s.air.launched.includes(p.id)||!AIR_SORTIES.some(x=>x.id===p.id&&x.model===p.model&&x.faction===p.faction)||!flightPos(p.pos)||!p.velocity||!['x','y','z'].every(k=>finite(p.velocity[k],-100,100))||!finite(p.yaw)||!finite(p.bank,-2,2)||(p.releaseAt!==null&&!finite(p.releaseAt,0,60))||!finite(p.age,0,120)||!finite(p.life,0,120)||typeof p.released!=='boolean')throw new LocalizedError('save.plane');
 for(const t of s.tanks)if(!Array.isArray(t.route)||t.route.length>12||t.route.some(p=>!finite(p.x,-95,95)||!finite(p.z,-20,215))||!Number.isInteger(t.routeIndex)||t.routeIndex<0||t.routeIndex>t.route.length||!finite(t.integrity,0,100)||!finite(t.tracks,0,100)||typeof t.gunWorking!=='boolean'||!finite(t.yaw)||!Number.isInteger(t.mgAmmo)||t.mgAmmo<0||t.mgAmmo>450||!finite(t.mgLeft,-360000,60)||!finite(t.mgBurst,0,4))throw new LocalizedError('save.tankRoute');
 if(!s.stats||Object.values(s.stats).some(v=>!finite(v,0,10000000))||!Number.isInteger(s.random)||!Number.isInteger(s.nextId))throw new LocalizedError('save.simulation');
 if(s.grenades?.length)throw new LocalizedError('save.grenade');
 validateRuntimeFields(s);
 return s;
}


const integer=(v,min=0,max=10000000)=>Number.isInteger(v)&&v>=min&&v<=max;
const optional=(object,key,predicate)=>!Object.hasOwn(object,key)||predicate(object[key]);
const nullablePosition=p=>p===null||position(p);
const states=['observe','move','search','aim','fire','reload','retreat','cover','evade','grenade','suppress','dead'];
const counters=['britishShots','germanShots','playerShots','hits','kills','alliedLost','enemyLost','reloads','replans','tankHits','tankMGShots','tankCannonShots','fieldGunShots','airBombs','breaches'];
function check(ok,message){if(!ok)throw new LocalizedError(message);}
function validateRuntimeFields(s){
 check(Object.hasOwn(DIFFICULTIES,s.difficulty),'save.difficulty');
 check(integer(s.random,0,4294967295)&&integer(s.nextId,1,100000000),'save.random');
 const p=s.player;
 check(finite(p.vy,-250,250)&&finite(p.meleeLeft,0,.85)&&finite(p.grenadeLeft,0,1)&&finite(p.distance,0,10000000),'save.playerMotion');
 for(const weapon of [...p.weapons,...s.npcs.map(n=>n.weapon)]){
  check(optional(weapon,'reloadSerial',v=>integer(v)),'save.reloadId');
  check(weapon.cooldown<=WEAPONS[weapon.id].cycle+.001&&weapon.reloadLeft<=WEAPONS[weapon.id].reload+.001,'save.weaponTime');
 }
 const actorIds=new Set(['player',...s.npcs.map(n=>n.id)]),covers=new Set();
 const target=id=>id===null||actorIds.has(id);
 for(const n of s.npcs){
  check(n.id!=='player'&&typeof n.id==='string'&&n.id.length<=100&&['uk','de'].includes(n.faction),'save.faction');
  check(['stand','crouch','prone'].includes(n.stance)&&states.includes(n.state)&&finite(n.pitch,-1.6,1.6)&&finite(n.vy,-250,250),'save.aiMotion');
  check(finite(n.x,MAP.minX,MAP.minX+MAP.width)&&finite(n.z,MAP.minZ,MAP.minZ+MAP.depth),'save.formation');
  check(optional(n,'pathIndex',v=>integer(v,0,n.path.length)),'save.pathIndex');
  check(target(n.targetId)&&optional(n,'visibleId',target),'save.target');
  check(nullablePosition(n.lastKnown)&&nullablePosition(n.pathTarget),'save.memory');
  check(finite(n.lastSeen,-360000,s.time+.1)&&finite(n.nextShot,-100,s.time+60)&&finite(n.stateTime,0,360000)&&finite(n.positionalLeft,-360000,60),'save.perception');
  check(integer(n.burstLeft,0,6)&&integer(n.grenades,0,8)&&finite(n.grenadeCooldown,-360000,120)&&finite(n.wait,0,60)&&finite(n.stuck,0,360000)&&finite(n.travel,0,10000000),'save.combat');
  for(const key of ['shotTime','hitTime'])check(finite(n[key],-360000,s.time+.1),'save.hitHistory');
  check(n.deathTime===null||finite(n.deathTime,0,s.time+.1),'save.death');
  for(const key of ['grounded','moving','fixed','briefingRole','sentry'])check(optional(n,key,v=>typeof v==='boolean'),'save.flag');
  for(const key of ['moveGoal','avoidWaypoint'])check(optional(n,key,nullablePosition),'save.moveGoal');
  check(optional(n,'moveReason',v=>v===null||states.includes(v)),'save.intent');
  for(const key of ['repathLeft','avoidLeft','coverRetryLeft'])check(optional(n,key,v=>finite(v,0,60)),'save.repath');
  for(const key of ['perceptionCursor','pathFailures','pathGeneration'])check(optional(n,key,v=>integer(v,0,100000000)),'save.navigation');
  for(const key of ['coverId','failedCoverId'])check(optional(n,key,v=>v===null||typeof v==='string'&&v.length<150),'save.aiCover');
  if(n.coverId){check(!covers.has(n.coverId),'save.coverOwner');covers.add(n.coverId);}
  check(optional(n,'gunId',id=>s.fieldGuns.some(g=>g.id===id&&g.crewIds.includes(n.id))),'save.artilleryAssignment');
 }
 const d=s.director;
 check(integer(d.chapter,0,100)&&typeof d.checkpointPending==='boolean'&&finite(d.checkpointWait,0,360000)&&typeof d.contested==='boolean'&&(d.lastCheckpoint===null||typeof d.lastCheckpoint==='string'&&d.lastCheckpoint.length<200),'save.checkpoint');
 check(integer(d.holdThreats,0,100),'save.threats');
 for(const g of s.fieldGuns){
  const definition=FIELD_GUNS.find(x=>x.id===g.id);
  check(g.faction===definition.faction&&g.model===definition.model&&g.crewIds.length===definition.crewIds.length&&new Set(g.crewIds).size===g.crewIds.length&&g.crewIds.every(id=>definition.crewIds.includes(id)&&s.npcs.some(n=>n.id===id&&n.faction===g.faction)),'save.gunCrew');
  check(finite(g.homeYaw)&&finite(g.recoil,0,1)&&finite(g.lastFire,-360000,s.time+.1)&&optional(g,'neutralized',v=>typeof v==='boolean'),'save.gunReady');
 }
 for(const t of s.tanks){
  check(['tank-1','tank-2'].includes(t.id)&&t.faction==='uk'&&typeof t.moving==='boolean'&&finite(t.trackPhase,0,10000000)&&finite(t.blockedTime,0,360000)&&finite(t.lastFire,-360000,s.time+.1)&&finite(t.lastHit,-360000,s.time+.1),'save.tankMotion');
  check(t.route.every(p=>optional(p,'gate',v=>['mg-silenced','fieldgun-silenced'].includes(v))),'save.tankGate');
 }
 for(const item of s.items)check(['medkit','ammo','lewis'].includes(item.type)&&typeof item.used==='boolean','save.item');
 check(counters.every(key=>integer(s.stats[key])),'save.stats');
 check(optional(s,'grenades',a=>Array.isArray(a)&&a.length===0)&&optional(s,'shells',a=>Array.isArray(a)&&a.length===0),'save.projectile');
}
