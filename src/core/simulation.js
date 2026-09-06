import {PHASE} from '../data/briefing.js';
import {FIELD_GUNS} from '../data/support.js';
import {createFieldGun,fieldGunBounds,updateFieldGun,restoreFieldGunState} from '../vehicles/field-gun.js';
import {createAirSupport,updateAirSupport} from '../vehicles/air-support.js';
import {canReach} from './interaction.js';
import {eye} from '../world/collision.js';
import {bulletMuzzle} from '../combat/ballistics.js';
import {dist,norm,sub} from './math.js';
import {MISSION_VERSION} from '../data/world-map.js';
import {Terrain} from '../world/terrain.js';
import {makeLayout} from '../world/layout.js';
import {CollisionWorld} from '../world/collision.js';
import {Navigation} from '../ai/navigation.js';
import {createSoldier,updateSoldier,soldierSnapshot,restoreSoldier} from '../ai/soldier.js';
import {createTank,tankBounds,updateTank,updateShells} from '../vehicles/tank.js';
import {Director,validateObjectives} from '../missions/director.js';
import {Player} from './player.js';
import {Weapon} from '../combat/weapon.js';
import {initialSoldiers,TANK_ROUTES,INITIAL_ITEMS} from '../data/cambrai.js';
import {DIFFICULTIES} from '../data/weapons.js';
import {rng,v3,flatDist,deepCopy} from './math.js';
import {updateGrenades} from '../combat/ballistics.js';
import {validateSnapshot,SAVE_VERSION} from '../save/schema.js';
export class Simulation {
 constructor(snapshot=null,difficulty='soldier',seed=112017){
  validateObjectives();this.time=0;this.random=rng(seed);this.nextId=100;this.difficultyId=Object.hasOwn(DIFFICULTIES,difficulty)?difficulty:'soldier';this.difficulty=DIFFICULTIES[this.difficultyId];
  this.terrain=new Terrain();this.layout=makeLayout(this.terrain);this.collision=new CollisionWorld(this.terrain,this.layout);this.nav=new Navigation(this.collision);this.player=new Player(this.terrain);this.player.health.configure(this.difficulty);this.director=new Director();
  this.npcs=initialSoldiers().map(d=>createSoldier(d,this.terrain,this.random));this.tanks=TANK_ROUTES.map(d=>createTank(d,this.terrain));this.fieldGuns=FIELD_GUNS.map(d=>createFieldGun(d,this.terrain));this.air=createAirSupport();this.destroyedObstacles=[];this.items=INITIAL_ITEMS.map(d=>({...d,pos:v3(d.x,this.terrain.height(d.x,d.z),d.z),used:false}));this.grenades=[];this.shells=[];this.events=[];this.noises=[];this.stats={britishShots:0,germanShots:0,playerShots:0,hits:0,kills:0,alliedLost:0,enemyLost:0,reloads:0,replans:0,tankHits:0,tankMGShots:0,tankCannonShots:0,fieldGunShots:0,airBombs:0,breaches:0};this.actors=[this.player,...this.npcs];this.navBudget=0;
  for(const actor of this.actors)actor.pos.y=this.collision.ground(actor.pos.x,actor.pos.z,actor.pos.y,.29);
  if(snapshot)this.restore(snapshot);else{this.refreshDynamic();this.collision.actors=this.actors;this.validateActorPositions(true);}
 }
 refreshDynamic(){this.collision.dynamic=[...this.tanks.map(tankBounds),...this.fieldGuns.flatMap(fieldGunBounds)];}
 breakObstacle(id){
  const box=this.layout.find(b=>b.id===id&&b.breakable);if(!box||this.destroyedObstacles.includes(id))return false;
  this.destroyedObstacles.push(id);this.collision.boxes=this.layout.filter(b=>!this.destroyedObstacles.includes(b.id));this.nav.invalidate(box);
  this.stats.breaches++;this.emit('breach',{id,pos:{x:box.x,y:box.y,z:box.z}});return true;
 }
 emit(type,data){this.events.push({type,...data,time:this.time});if(this.events.length>200)this.events.shift();}
 consumeEvents(){const e=this.events;this.events=[];return e;}
 validateActorPositions(spawn=false){
  for(const actor of this.actors){
   if(actor.hp<=0)continue;
   // v0.4.1 has four embedded authored spawn poses, including uk-8 at the tank rear.
   // The 1.25 m bound is for spawn/historical restore only; ordinary recovery stays .65 m.
   const limit=actor.id==='player'?.65:1.25;
   if(!this.collision.recover(actor,limit))throw Error(`Niebezpieczna pozycja ${actor.id} w checkpointcie lub na starcie. Nie przeniesiono postaci przez przeszkodę.`);
   actor.grounded=this.collision.supported(actor);
   if(actor.grounded)actor.lastSafePosition={...actor.pos};
   if(spawn)actor.recoveryThisStep=false;
  }
 }
 spawnSoldier(data){
  if(this.npcs.some(n=>n.id===data.id))return;
  const actor=createSoldier(data,this.terrain,this.random);
  if(!this.collision.recover(actor,1.25))throw Error(`Nie można bezpiecznie ustawić ${actor.id}.`);
  this.npcs.push(actor);this.actors=[this.player,...this.npcs];this.collision.actors=this.actors;
 }
 tick(dt,input){if(this.player.hp<=0||this.director.phase===PHASE.COMPLETE)return;dt=Math.min(dt,.05);this.time+=dt;this.player.update(this,dt,input);if(this.player.collisionBlocked)throw Error('Nie można bezpiecznie ustawić postaci. Wczytaj poprzedni checkpoint lub rozpocznij misję ponownie.');this.refreshDynamic();this.collision.actors=this.actors;
  this.navBudget+=dt;if(this.navBudget>=.12){this.navBudget=0;this.nav.process(2);}
  for(const n of this.npcs)updateSoldier(this,n,dt);for(const t of this.tanks){updateTank(this,t,dt);this.refreshDynamic();}this.refreshDynamic();for(const g of this.fieldGuns)updateFieldGun(this,g,dt);updateGrenades(this,dt);updateShells(this,dt);updateAirSupport(this,dt);if(this.player.hp>0)this.director.update(this,dt);
  for(const noise of this.noises)noise.ttl-=dt;this.noises=this.noises.filter(n=>n.ttl>0);
 }
 /** The only HP commit point. Callers supply base damage, never a pre-scaled hit. */
 damage(target,amount,source,context={kind:'melee'}){
  if(!target||target.hp<=0||!Number.isFinite(amount)||amount<=0||!source||target.faction===source.faction)return 0;
  const kind=context.kind||'melee';
  if(!['bullet','explosion','melee'].includes(kind))throw new TypeError(`Invalid damage kind ${kind}`);
  if(source.id==='player'&&target.faction==='de'&&this.director.phase===PHASE.BRIEFING)this.director.alert(this);
  const player=target.id==='player';
  const part=kind==='bullet'?(context.hitPart==='head'?(player?1.25:1.6):context.hitPart==='limb'?.57:1):1;
  let result=amount*part;
  if(player){
   result*=kind==='bullet'?this.difficulty.bulletIncoming:kind==='explosion'?this.difficulty.explosionIncoming:this.difficulty.meleeIncoming;
   target.health.damage(result);target.hurt=.65;
   const origin=context.origin||source.pos||target.pos;
   target.damageYaw=Math.atan2(origin.x-target.pos.x,origin.z-target.pos.z);
   this.emit('hurt',{pos:{...origin},kind,amount:result});
   if(target.hp<=0)this.emit('dead',{});
  }else{
   if(source.id!=='player'&&!String(source.id).startsWith('tank'))result*=.72;
   target.hp=Math.max(0,target.hp-result);target.hitTime=this.time;target.suppression=Math.min(1.5,(target.suppression||0)+.45);
   if(target.hp===0){
    target.state='dead';target.deathTime=this.time;target.targetId=null;target.visibleId=null;
    this.nav.cancel(target);target.weapon?.cancelReload();
    if(target.faction==='uk')this.stats.alliedLost++;else this.stats.enemyLost++;
    if(source.id==='player')this.stats.kills++;
   }
  }return result;
 }
 nearbyItem(){return this.items.filter(i=>!i.used&&canReach(this,{...i.pos,y:i.pos.y+.3},2.1)).sort((a,b)=>flatDist(a.pos,this.player.pos)-flatDist(b.pos,this.player.pos))[0];}
 interact(){if(this.director.interact(this))return;const item=this.nearbyItem();if(!item)return;
  if(item.type==='medkit'){if(!this.player.health.medkit()){this.emit('toast',{text:'Zdrowie pełne — apteczka zostaje na miejscu.'});return;}item.used=true;this.emit('pickup',{text:'+50 zdrowia'});}
  if(item.type==='ammo'){let changed=false;for(const w of this.player.weapons){const max=w.id==='lewis'?188:w.id==='webley'?36:80;if(w.reserve<max){w.reserve=max;changed=true;}}if(this.player.grenades<3){this.player.grenades=3;changed=true;}if(changed){item.used=true;this.emit('pickup',{text:'Uzupełniono amunicję i granaty.'});}else this.emit('toast',{text:'Masz pełny zapas amunicji.'});}
  if(item.type==='lewis'){this.player.weapon.cancelReload();this.player.weapons[1]=new Weapon('lewis',47,94);this.player.slot=1;item.used=true;this.emit('pickup',{text:'Lewis zajmuje drugi slot broni.'});}
 }
 interaction(){
  const action=this.director.interaction(this);if(action)return action;
  const item=this.nearbyItem();return item?{key:'interact',label:item.type==='medkit'?'Apteczka · +50 zdrowia':item.type==='ammo'?'Uzupełnij amunicję i granaty':'Podnieś Lewisa · slot 2'}:null;
 }
 canCheckpoint(){
  const p=this.player;
  if(p.hp<100||this.grenades.length||this.shells.length||this.air.bombs.length||p.recoveryThisStep||p.collisionBlocked||!this.collision.supported(p))return false;
  // A safe point must allow at least a small ordinary step, not be an isolated pocket.
  let exit=false;
  for(const [x,z] of [[.15,0],[-.15,0],[0,.15],[0,-.15]]){
   const point={x:p.pos.x+x,y:p.pos.y,z:p.pos.z+z};point.y=this.collision.supportHeight(p,point,.2);
   if(Math.abs(point.y-p.pos.y)<.2&&this.collision.canStand(point,p.stance,p.yaw,p.id)){exit=true;break;}
  }
  if(!exit)return false;
  for(const n of this.npcs){
   if(n.hp<=0||n.faction===p.faction||!n.weapon.mag||n.weapon.reloadLeft>0||flatDist(n.pos,p.pos)>Math.min(n.weapon.definition.range,n.fixed?95:72))continue;
   const muzzle=bulletMuzzle(n),guard=sub(muzzle,eye(n));
   if(this.collision.ray(eye(n),norm(guard),dist(eye(n),muzzle),this.actors,n.id))continue;
   for(const target of [eye(p),{...p.pos,y:p.pos.y+(p.stance==='prone'?.25:p.stance==='crouch'?.68:1.05)}]){
    const delta=sub(target,muzzle),hit=this.collision.ray(muzzle,norm(delta),dist(muzzle,target),this.actors,n.id);
    if(!hit||hit.actor?.id===p.id)return false;
   }
  }
  return true;
 }
 snapshot(){if(this.grenades.length||this.shells.length||this.air.bombs.length)throw Error('Zapis odłożony do zakończenia lotu pocisków.');return{version:SAVE_VERSION,mission:'cambrai',missionVersion:MISSION_VERSION,time:this.time,difficulty:this.difficultyId,nextId:this.nextId,random:this.random.state(),player:this.player.snapshot(),npcs:this.npcs.map(soldierSnapshot),tanks:deepCopy(this.tanks),fieldGuns:deepCopy(this.fieldGuns),air:deepCopy(this.air),destroyedObstacles:[...this.destroyedObstacles],items:deepCopy(this.items),director:this.director.snapshot(),stats:{...this.stats},grenades:[]};}
 restore(snapshot){
  const s=deepCopy(validateSnapshot(snapshot));
  this.time=s.time;this.nextId=s.nextId;this.random.restore(s.random);this.difficultyId=s.difficulty;this.difficulty=DIFFICULTIES[s.difficulty];
  this.player.restore(s.player);this.player.health.configure(this.difficulty);this.npcs=s.npcs.map(restoreSoldier);this.tanks=s.tanks;this.fieldGuns=s.fieldGuns;this.air=s.air;
  this.destroyedObstacles=s.destroyedObstacles;this.collision.boxes=this.layout.filter(b=>!this.destroyedObstacles.includes(b.id));
  for(const id of this.destroyedObstacles)this.nav.invalidate(this.layout.find(b=>b.id===id));
  this.items=s.items;this.director.restore(s.director);this.stats=s.stats;this.actors=[this.player,...this.npcs];
  this.grenades=[];this.shells=[];this.events=[];this.noises=[];this.navBudget=0;this.collision.actors=this.actors;this.refreshDynamic();
  this.nav.requests.length=0;this.nav.coverOwners.clear();for(const c of this.nav.cover)c.owner=null;
  for(const n of this.npcs){
   if(n.coverId&&n.hp>0){const cover=this.nav.cover.find(c=>c.id===n.coverId);if(!cover)throw Error('Nieprawidłowa osłona w checkpointcie.');this.nav.reserveCover(n,cover);}
   else n.coverId=null;
   if(n.hp>0&&n.moveGoal&&n.pathIndex>=n.path.length)this.nav.request(n,n.moveGoal,n.moveReason||n.state);
  }
  for(const gun of this.fieldGuns)restoreFieldGunState(this,gun);
  this.validateActorPositions();
 }
}
