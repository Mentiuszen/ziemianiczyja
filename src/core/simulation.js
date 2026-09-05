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
 constructor(snapshot=null,difficulty='soldier'){
  validateObjectives();this.time=0;this.random=rng(112017);this.nextId=100;this.difficultyId=difficulty;this.difficulty=DIFFICULTIES[difficulty]||DIFFICULTIES.soldier;
  this.terrain=new Terrain();this.layout=makeLayout(this.terrain);this.collision=new CollisionWorld(this.terrain,this.layout);this.nav=new Navigation(this.collision);this.player=new Player(this.terrain);this.director=new Director();
  this.npcs=initialSoldiers().map(d=>createSoldier(d,this.terrain,this.random));this.tanks=TANK_ROUTES.map(d=>createTank(d,this.terrain));this.items=INITIAL_ITEMS.map(d=>({...d,pos:v3(d.x,this.terrain.height(d.x,d.z),d.z),used:false}));this.grenades=[];this.shells=[];this.events=[];this.noises=[];this.stats={britishShots:0,germanShots:0,playerShots:0,hits:0,kills:0,alliedLost:0,enemyLost:0,reloads:0,replans:0};this.actors=[this.player,...this.npcs];this.navBudget=0;
  if(snapshot)this.restore(snapshot);this.collision.dynamic=this.tanks.map(tankBounds);this.collision.actors=this.actors;
 }
 emit(type,data){this.events.push({type,...data,time:this.time});if(this.events.length>200)this.events.shift();}
 consumeEvents(){const e=this.events;this.events=[];return e;}
 spawnSoldier(data){if(this.npcs.some(n=>n.id===data.id))return;this.npcs.push(createSoldier(data,this.terrain,this.random));this.actors=[this.player,...this.npcs];this.collision.actors=this.actors;}
 tick(dt,input){if(this.player.hp<=0||this.director.phase===6)return;dt=Math.min(dt,.05);this.time+=dt;this.player.update(this,dt,input);this.collision.dynamic=this.tanks.map(tankBounds);this.collision.actors=this.actors;
  this.navBudget+=dt;if(this.navBudget>=.12){this.navBudget=0;this.nav.process(2);}
  for(const n of this.npcs)updateSoldier(this,n,dt);for(const t of this.tanks)updateTank(this,t,dt);updateGrenades(this,dt);updateShells(this,dt);this.director.update(this,dt);
  for(const noise of this.noises)noise.ttl-=dt;this.noises=this.noises.filter(n=>n.ttl>0);
 }
 damage(target,amount,source){if(target.hp<=0||target.faction===source.faction)return;let result=amount;if(target.id==='player'){result*=this.difficulty.incoming;target.health.damage(result);target.hurt=.65;target.damageYaw=Math.atan2((source.pos?.x??target.pos.x)-target.pos.x,(source.pos?.z??target.pos.z)-target.pos.z);this.emit('hurt',{pos:source.pos||target.pos});if(target.hp<=0)this.emit('dead',{});}else{if(source.id!=='player'&&!String(source.id).startsWith('tank'))result*=.72;target.hp=Math.max(0,target.hp-result);target.hitTime=this.time;target.suppression=Math.min(1.5,target.suppression+.45);if(target.hp===0){target.state='dead';target.deathTime=this.time;target.path=[];target.targetId=null;target.visibleId=null;this.nav.releaseCover(target.id);if(target.faction==='uk')this.stats.alliedLost++;else this.stats.enemyLost++;if(source.id==='player')this.stats.kills++;}}
 }
 nearbyItem(){return this.items.filter(i=>!i.used&&flatDist(i.pos,this.player.pos)<2.1).sort((a,b)=>flatDist(a.pos,this.player.pos)-flatDist(b.pos,this.player.pos))[0];}
 interact(){if(this.director.interact(this))return;const item=this.nearbyItem();if(!item)return;
  if(item.type==='medkit'){if(!this.player.health.medkit()){this.emit('toast',{text:'Zdrowie pełne — apteczka zostaje na miejscu.'});return;}item.used=true;this.emit('pickup',{text:'+50 zdrowia'});}
  if(item.type==='ammo'){let changed=false;for(const w of this.player.weapons){const max=w.id==='lewis'?188:w.id==='webley'?36:80;if(w.reserve<max){w.reserve=max;changed=true;}}if(this.player.grenades<3){this.player.grenades=3;changed=true;}if(changed){item.used=true;this.emit('pickup',{text:'Uzupełniono amunicję i granaty.'});}else this.emit('toast',{text:'Masz pełny zapas amunicji.'});}
  if(item.type==='lewis'){this.player.weapon.cancelReload();this.player.weapons[1]=new Weapon('lewis',47,94);this.player.slot=1;item.used=true;this.emit('pickup',{text:'Lewis zajmuje drugi slot broni.'});}
 }
 interaction(){const o=this.director.objective,p=this.player.pos;if(o.kind==='interact'&&flatDist(p,{x:o.x,z:o.z})<o.radius)return{key:'interact',label:this.director.phase===0?'Odbierz rozkaz':this.director.phase===3?'Zabierz meldunek':'Uruchom telefon polowy'};if(o.kind==='gun'&&p.z>60.5&&flatDist(p,{x:23,z:62})<3)return{key:'interact',label:'Przerwij podawanie amunicji MG 08'};const item=this.nearbyItem();if(item)return{key:'interact',label:item.type==='medkit'?'Apteczka · +50 zdrowia':item.type==='ammo'?'Uzupełnij amunicję i granaty':'Podnieś Lewisa · slot 2'};return null;}
 snapshot(){if(this.grenades.length||this.shells.length)throw Error('Zapis odłożony do zakończenia lotu pocisków.');return{version:SAVE_VERSION,mission:'cambrai',missionVersion:MISSION_VERSION,time:this.time,difficulty:this.difficultyId,nextId:this.nextId,random:this.random.state(),player:this.player.snapshot(),npcs:this.npcs.map(soldierSnapshot),tanks:deepCopy(this.tanks),items:deepCopy(this.items),director:this.director.snapshot(),stats:{...this.stats},grenades:[]};}
 restore(snapshot){const s=deepCopy(validateSnapshot(snapshot));this.time=s.time;this.nextId=s.nextId;this.random.restore(s.random);this.difficultyId=s.difficulty||'soldier';this.difficulty=DIFFICULTIES[this.difficultyId]||DIFFICULTIES.soldier;this.player.restore(s.player);this.npcs=s.npcs.map(restoreSoldier);this.tanks=s.tanks;this.items=s.items;this.director.restore(s.director);this.stats=s.stats;this.actors=[this.player,...this.npcs];this.grenades=[];this.shells=[];this.events=[];this.noises=[];this.collision.actors=this.actors;this.collision.dynamic=this.tanks.map(tankBounds);this.nav.requests.length=0;for(const c of this.nav.cover)c.owner=null;for(const n of this.npcs){if(n.coverId){const c=this.nav.cover.find(c=>c.id===n.coverId);if(c)c.owner=n.id;}}}
}
