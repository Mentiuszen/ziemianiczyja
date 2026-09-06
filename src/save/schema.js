import {MAP,MISSION_VERSION} from '../data/world-map.js';
import {FIELD_GUNS,AIR_SORTIES} from '../data/support.js';
import {WEAPONS,DIFFICULTIES} from '../data/weapons.js';
export const SAVE_VERSION=1;
const finite=(v,min=-100000,max=100000)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
function position(p){return p&&finite(p.x,MAP.minX,MAP.minX+MAP.width)&&finite(p.y,-20,40)&&finite(p.z,MAP.minZ,MAP.minZ+MAP.depth);}
export function validateSnapshot(s){
 if(!s||s.version!==SAVE_VERSION||s.mission!=='cambrai'||s.missionVersion!==MISSION_VERSION)throw Error('Niezgodna wersja punktu zapisu. Misja v0.4 wymaga rozpoczęcia nowej misji; ustawienia zostały zachowane.');
 if(!finite(s.time,0,360000)||!position(s.player?.pos)||!finite(s.player?.health?.hp,0,100))throw Error('Uszkodzone dane gracza.');
 if(!Array.isArray(s.player.weapons)||s.player.weapons.length!==2)throw Error('Nieprawidłowy ekwipunek.');
 for(const w of s.player.weapons)if(!WEAPONS[w.id]||!Number.isInteger(w.mag)||w.mag<0||w.mag>WEAPONS[w.id].capacity||!Number.isInteger(w.reserve)||w.reserve<0||w.reserve>999||!finite(w.cooldown,0,60)||!finite(w.reloadLeft,0,60))throw Error('Uszkodzone dane amunicji.');
 if(!Number.isInteger(s.director?.phase)||s.director.phase<0||s.director.phase>7||!Array.isArray(s.director.events))throw Error('Uszkodzony przebieg misji.');
 if(!Array.isArray(s.npcs)||s.npcs.length>100||!Array.isArray(s.tanks)||s.tanks.length!==2||!Array.isArray(s.items)||s.items.length>150)throw Error('Uszkodzony stan świata.');
 const ids=new Set(['player']);for(const a of [...s.npcs,...s.tanks,...s.items,...(s.fieldGuns||[])]){if(typeof a.id!=='string'||ids.has(a.id)||!position(a.pos))throw Error('Nieprawidłowy identyfikator lub położenie obiektu.');ids.add(a.id);}
 for(const n of s.npcs){
  if(!finite(n.hp,0,100))throw Error('Nieprawidłowe zdrowie NPC.');
  const w=n.weapon;if(!w||!WEAPONS[w.id]||!Number.isInteger(w.mag)||w.mag<0||w.mag>WEAPONS[w.id].capacity||!Number.isInteger(w.reserve)||w.reserve<0||w.reserve>999||!finite(w.cooldown,0,60)||!finite(w.reloadLeft,0,60))throw Error('Uszkodzona broń NPC.');
  if(!finite(n.yaw)||!finite(n.think,-10,30)||!finite(n.suppression,0,10)||!finite(n.reaction,-100,360000)||!Array.isArray(n.path)||n.path.length>6500||n.path.some(p=>!position(p)))throw Error('Uszkodzony stan AI.');
 }
 if(!['stand','crouch','prone'].includes(s.player.stance)||!Number.isInteger(s.player.slot)||s.player.slot<0||s.player.slot>1||!Number.isInteger(s.player.grenades)||s.player.grenades<0||s.player.grenades>8||!finite(s.player.health.delay,0,6)||!finite(s.player.yaw)||!finite(s.player.pitch,-1.5,1.5)||!finite(s.player.stamina,0,6))throw Error('Nieprawidłowy stan gracza.');
 if(!finite(s.director.hold,0,55)||new Set(s.director.events).size!==s.director.events.length||s.director.events.some(id=>typeof id!=='string'))throw Error('Uszkodzone zdarzenia misji.');
 for(const tank of s.tanks)if(!['waiting','moving','holding','immobilized','destroyed'].includes(tank.state)||!finite(tank.weaponLeft,-360000,60)||!Number.isInteger(tank.ammunition)||tank.ammunition<0||tank.ammunition>30)throw Error('Uszkodzony stan pojazdu.');
 if(!finite(s.director.briefingTime,0,42)||(s.director.assaultTime!==null&&!finite(s.director.assaultTime,0,s.time))||!finite(s.director.holdThreats,0,100))throw Error('Uszkodzony zegar odprawy.');
 if(!Array.isArray(s.fieldGuns)||s.fieldGuns.length!==FIELD_GUNS.length)throw Error('Uszkodzone dane artylerii.');
 for(const g of s.fieldGuns)if(!FIELD_GUNS.some(x=>x.id===g.id)||!position(g.pos)||!finite(g.yaw)||!finite(g.reloadLeft,-1,60)||!Number.isInteger(g.ammo)||g.ammo<0||g.ammo>18||typeof g.disabled!=='boolean'||typeof g.operational!=='boolean'||!Array.isArray(g.crewIds)||g.crewIds.some(id=>!s.npcs.some(n=>n.id===id)))throw Error('Uszkodzone działo.');
 if(!Array.isArray(s.destroyedObstacles)||s.destroyedObstacles.some(id=>!['wire-tank-1','wire-tank-2'].includes(id))||new Set(s.destroyedObstacles).size!==s.destroyedObstacles.length)throw Error('Nieprawidłowe przejścia w drucie.');
 if(!s.air||!Array.isArray(s.air.launched)||s.air.launched.length>AIR_SORTIES.length||new Set(s.air.launched).size!==s.air.launched.length||s.air.launched.some(id=>!AIR_SORTIES.some(x=>x.id===id))||!Array.isArray(s.air.planes)||s.air.planes.length>6||!Array.isArray(s.air.bombs)||s.air.bombs.length)throw Error('Uszkodzone dane lotnictwa.');
 if(new Set(s.air.planes.map(p=>p.id)).size!==s.air.planes.length)throw Error('Powielone samoloty.');
 const flightPos=p=>p&&finite(p.x,-1000,1000)&&finite(p.y,0,250)&&finite(p.z,-1000,1000);
 for(const p of s.air.planes)if(!s.air.launched.includes(p.id)||!AIR_SORTIES.some(x=>x.id===p.id&&x.model===p.model&&x.faction===p.faction)||!flightPos(p.pos)||!p.velocity||!['x','y','z'].every(k=>finite(p.velocity[k],-100,100))||!finite(p.yaw)||!finite(p.bank,-2,2)||(p.releaseAt!==null&&!finite(p.releaseAt,0,60))||!finite(p.age,0,120)||!finite(p.life,0,120)||typeof p.released!=='boolean')throw Error('Uszkodzony samolot.');
 for(const t of s.tanks)if(!Array.isArray(t.route)||t.route.length>12||t.route.some(p=>!finite(p.x,-95,95)||!finite(p.z,-20,215))||!Number.isInteger(t.routeIndex)||t.routeIndex<0||t.routeIndex>t.route.length||!finite(t.integrity,0,100)||!finite(t.tracks,0,100)||typeof t.gunWorking!=='boolean'||!finite(t.yaw)||!Number.isInteger(t.mgAmmo)||t.mgAmmo<0||t.mgAmmo>450||!finite(t.mgLeft,-360000,60)||!finite(t.mgBurst,0,4))throw Error('Uszkodzona trasa czołgu.');
 if(!s.stats||Object.values(s.stats).some(v=>!finite(v,0,10000000))||!Number.isInteger(s.random)||!Number.isInteger(s.nextId))throw Error('Nieprawidłowe dane symulacji.');
 if(s.grenades?.length)throw Error('Checkpoint nie może zawierać aktywnego granatu.');
 validateRuntimeFields(s);
 return s;
}


const integer=(v,min=0,max=10000000)=>Number.isInteger(v)&&v>=min&&v<=max;
const optional=(object,key,predicate)=>!Object.hasOwn(object,key)||predicate(object[key]);
const nullablePosition=p=>p===null||position(p);
const states=['observe','move','search','aim','fire','reload','retreat','cover','evade','grenade','suppress','dead'];
const counters=['britishShots','germanShots','playerShots','hits','kills','alliedLost','enemyLost','reloads','replans','tankHits','tankMGShots','tankCannonShots','fieldGunShots','airBombs','breaches'];
function check(ok,message){if(!ok)throw Error(message);}
function validateRuntimeFields(s){
 check(Object.hasOwn(DIFFICULTIES,s.difficulty),'Nieprawidłowy poziom trudności w zapisie.');
 check(integer(s.random,0,4294967295)&&integer(s.nextId,1,100000000),'Nieprawidłowy generator lub licznik obiektów.');
 const p=s.player;
 check(finite(p.vy,-250,250)&&finite(p.meleeLeft,0,.85)&&finite(p.grenadeLeft,0,1)&&finite(p.distance,0,10000000),'Uszkodzony ruch lub akcja gracza.');
 for(const weapon of [...p.weapons,...s.npcs.map(n=>n.weapon)]){
  check(optional(weapon,'reloadSerial',v=>integer(v)),'Nieprawidłowa tożsamość przeładowania.');
  check(weapon.cooldown<=WEAPONS[weapon.id].cycle+.001&&weapon.reloadLeft<=WEAPONS[weapon.id].reload+.001,'Nieprawidłowy czas obsługi broni.');
 }
 const actorIds=new Set(['player',...s.npcs.map(n=>n.id)]),covers=new Set();
 const target=id=>id===null||actorIds.has(id);
 for(const n of s.npcs){
  check(n.id!=='player'&&typeof n.id==='string'&&n.id.length<=100&&['uk','de'].includes(n.faction),'Nieprawidłowa frakcja NPC.');
  check(['stand','crouch','prone'].includes(n.stance)&&states.includes(n.state)&&finite(n.pitch,-1.6,1.6)&&finite(n.vy,-250,250),'Nieprawidłowa postawa lub ruch AI.');
  check(finite(n.x,MAP.minX,MAP.minX+MAP.width)&&finite(n.z,MAP.minZ,MAP.minZ+MAP.depth),'Nieprawidłowy punkt formacji AI.');
  check(optional(n,'pathIndex',v=>integer(v,0,n.path.length)),'Nieprawidłowy indeks trasy AI.');
  check(target(n.targetId)&&optional(n,'visibleId',target),'Nieprawidłowy cel AI.');
  check(nullablePosition(n.lastKnown)&&nullablePosition(n.pathTarget),'Nieprawidłowa zapamiętana pozycja AI.');
  check(finite(n.lastSeen,-360000,s.time+.1)&&finite(n.nextShot,-100,s.time+60)&&finite(n.stateTime,0,360000)&&finite(n.positionalLeft,-360000,60),'Nieprawidłowy zegar percepcji AI.');
  check(integer(n.burstLeft,0,6)&&integer(n.grenades,0,8)&&finite(n.grenadeCooldown,-360000,120)&&finite(n.wait,0,60)&&finite(n.stuck,0,360000)&&finite(n.travel,0,10000000),'Nieprawidłowy zegar walki AI.');
  for(const key of ['shotTime','hitTime'])check(finite(n[key],-360000,s.time+.1),'Nieprawidłowa historia trafienia AI.');
  check(n.deathTime===null||finite(n.deathTime,0,s.time+.1),'Nieprawidłowy czas śmierci.');
  for(const key of ['grounded','moving','fixed','briefingRole','sentry'])check(optional(n,key,v=>typeof v==='boolean'),'Nieprawidłowa flaga AI.');
  for(const key of ['moveGoal','avoidWaypoint'])check(optional(n,key,nullablePosition),'Nieprawidłowy cel ruchu AI.');
  check(optional(n,'moveReason',v=>v===null||states.includes(v)),'Nieprawidłowy zamiar AI.');
  for(const key of ['repathLeft','avoidLeft','coverRetryLeft'])check(optional(n,key,v=>finite(v,0,60)),'Nieprawidłowy czas ponownego planowania.');
  for(const key of ['perceptionCursor','pathFailures','pathGeneration'])check(optional(n,key,v=>integer(v,0,100000000)),'Nieprawidłowy licznik nawigacji.');
  for(const key of ['coverId','failedCoverId'])check(optional(n,key,v=>v===null||typeof v==='string'&&v.length<150),'Nieprawidłowa osłona AI.');
  if(n.coverId){check(!covers.has(n.coverId),'Powielona rezerwacja osłony.');covers.add(n.coverId);}
  check(optional(n,'gunId',id=>s.fieldGuns.some(g=>g.id===id&&g.crewIds.includes(n.id))),'Nieprawidłowe przypisanie artylerzysty.');
 }
 const d=s.director;
 check(integer(d.chapter,0,100)&&typeof d.checkpointPending==='boolean'&&finite(d.checkpointWait,0,360000)&&typeof d.contested==='boolean'&&(d.lastCheckpoint===null||typeof d.lastCheckpoint==='string'&&d.lastCheckpoint.length<200),'Uszkodzony stan checkpointu misji.');
 check(integer(d.holdThreats,0,100),'Nieprawidłowa liczba zagrożeń.');
 for(const g of s.fieldGuns){
  const definition=FIELD_GUNS.find(x=>x.id===g.id);
  check(g.faction===definition.faction&&g.model===definition.model&&g.crewIds.length===definition.crewIds.length&&new Set(g.crewIds).size===g.crewIds.length&&g.crewIds.every(id=>definition.crewIds.includes(id)&&s.npcs.some(n=>n.id===id&&n.faction===g.faction)),'Nieprawidłowa obsługa działa.');
  check(finite(g.homeYaw)&&finite(g.recoil,0,1)&&finite(g.lastFire,-360000,s.time+.1)&&optional(g,'neutralized',v=>typeof v==='boolean'),'Uszkodzona gotowość działa.');
 }
 for(const t of s.tanks){
  check(['tank-1','tank-2'].includes(t.id)&&t.faction==='uk'&&typeof t.moving==='boolean'&&finite(t.trackPhase,0,10000000)&&finite(t.blockedTime,0,360000)&&finite(t.lastFire,-360000,s.time+.1)&&finite(t.lastHit,-360000,s.time+.1),'Uszkodzony ruch czołgu.');
  check(t.route.every(p=>optional(p,'gate',v=>['mg-silenced','fieldgun-silenced'].includes(v))),'Nieprawidłowa brama trasy czołgu.');
 }
 for(const item of s.items)check(['medkit','ammo','lewis'].includes(item.type)&&typeof item.used==='boolean','Uszkodzony przedmiot.');
 check(counters.every(key=>integer(s.stats[key])),'Brak lub uszkodzenie licznika statystyk.');
 check(optional(s,'grenades',a=>Array.isArray(a)&&a.length===0)&&optional(s,'shells',a=>Array.isArray(a)&&a.length===0),'Nieobsługiwany pocisk w checkpointcie.');
}
