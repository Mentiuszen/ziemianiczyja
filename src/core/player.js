import {HQ} from '../data/world-map.js';
import {Health} from '../combat/health.js';
import {Weapon} from '../combat/weapon.js';
import {v3,clamp,direction,norm,add,mul,flatDist} from './math.js';
import {eye} from '../world/collision.js';
import {fireBullet} from '../combat/ballistics.js';
export class Player {
 constructor(terrain){this.id='player';this.faction='uk';this.pos=v3(HQ.spawn.x,terrain.height(HQ.spawn.x,HQ.spawn.z),HQ.spawn.z);this.yaw=.15;this.pitch=0;this.stance='stand';this.vy=0;this.grounded=true;this.health=new Health();this.weapons=[new Weapon('smle',10,60),new Weapon('webley',6,24)];this.slot=0;this.grenades=3;this.stamina=6;this.ads=false;this.speed=0;this.recoil=0;this.damageYaw=0;this.hurt=0;this.hitMarker=0;this.meleeLeft=0;this.grenadeLeft=0;this.stepTime=0;this.vaultLeft=0;this.distance=0;}
 get hp(){return this.health.hp;}get weapon(){return this.weapons[this.slot];}
 update(world,dt,input={}){this.health.tick(dt);for(const w of this.weapons)w.tick(dt);this.hurt=Math.max(0,this.hurt-dt);this.hitMarker=Math.max(0,this.hitMarker-dt);this.recoil*=Math.exp(-dt*12);this.meleeLeft=Math.max(0,this.meleeLeft-dt);this.grenadeLeft=Math.max(0,this.grenadeLeft-dt);this.vaultLeft=Math.max(0,this.vaultLeft-dt);
  this.yaw+=input.lookX||0;this.pitch=clamp(this.pitch+(input.lookY||0),-1.4,1.4);this.ads=!!input.aim;
  if(input.slot!==undefined&&input.slot!==this.slot){this.weapon.cancelReload();this.slot=clamp(input.slot,0,1);world.emit('switch',{});}
  if(input.wheel){this.weapon.cancelReload();this.slot=1-this.slot;}
  const posture=input.prone?(this.stance==='prone'?'stand':'prone'):input.crouch?(this.stance==='crouch'?'stand':'crouch'):null;
  if(posture&&world.collision.canStand(this.pos,posture,this.yaw,this.id))this.stance=posture;
  let mx=input.right?1:input.left?-1:0,mz=input.forward?1:input.back?-1:0,mag=Math.hypot(mx,mz);if(mag){mx/=mag;mz/=mag;}
  const sprint=!!input.sprint&&mag>0&&!this.ads&&this.stance==='stand'&&this.stamina>.1;
  if(sprint)this.stamina=Math.max(0,this.stamina-dt);else this.stamina=Math.min(6,this.stamina+dt*.8);
  this.speed=this.stance==='prone'?.85:this.stance==='crouch'?1.65:sprint?5.6:this.ads?2:3.1;
  if(input.jump&&this.grounded){const d=direction(this.yaw),landing=add(this.pos,mul(d,1.25));landing.y=world.terrain.height(landing.x,landing.z);const obstacle=world.collision.ray(add(this.pos,v3(0,.55,0)),d,1.05);
   if(obstacle?.solid&&obstacle.solid.walkableTop!==false&&obstacle.solid.kind!=='fence'&&obstacle.solid.h<1.1&&!world.collision.overlaps(add(landing,v3(0,.03,0)),1.74)&&Math.abs(landing.y-this.pos.y)<.75){this.vy=4.8;this.vaultLeft=.38;this.stance='stand';}else if(this.stance==='stand')this.vy=4.5;
  }
  const dx=(Math.sin(this.yaw)*mz+Math.cos(this.yaw)*mx)*this.speed*dt,dz=(Math.cos(this.yaw)*mz-Math.sin(this.yaw)*mx)*this.speed*dt;
  this.moveIntent=mag>0;this.moveDirection={x:dx,z:dz};const before={...this.pos};world.collision.move(this,dx,dz,dt);this.moving=flatDist(before,this.pos)>dt*.15;this.distance+=flatDist(before,this.pos);
  if(this.moving&&this.grounded){this.stepTime-=dt;if(this.stepTime<=0){this.stepTime=sprint?.3:this.stance==='prone'?.85:.49;world.emit('step',{pos:{...this.pos},surface:world.terrain.trenchDistance(this.pos.x,this.pos.z)<1.6?'wood':'earth'});}}
  if(input.reload&&this.weapon.reload())world.emit('reload',{weapon:this.weapon.id,pos:eye(this)});
  if(input.fire&&!sprint&&this.meleeLeft<=.45&&this.grenadeLeft<=.4){if(this.weapon.fire()){const w=this.weapon;fireBullet(world,this,w,direction(this.yaw,this.pitch),this.ads?w.definition.adsSpread:w.definition.spread+(this.moving?.01:0));this.recoil=w.definition.recoil;this.pitch=clamp(this.pitch-w.definition.recoil*.6,-1.4,1.4);world.stats.playerShots++;if(world.director.phase===0&&this.pos.z>8)world.director.alert(world,'Zwiad został ostrzelany — ruszamy wcześniej!');}else if(this.weapon.mag===0&&this.weapon.reloadLeft===0&&this.weapon.reload())world.emit('reload',{weapon:this.weapon.id,pos:eye(this)});}
  if(input.grenade&&this.grenades>0&&this.grenadeLeft<=0){this.grenades--;this.grenadeLeft=1;const d=direction(this.yaw,this.pitch-.15),pos=add(eye(this),mul(d,.5));world.grenades.push({id:`grenade-${world.nextId++}`,owner:this.id,faction:this.faction,pos,vel:add(mul(d,13),v3(0,2,0)),fuse:3.1});world.emit('grenade',{pos});}
  if(input.melee&&this.meleeLeft<=0){this.meleeLeft=.85;const hit=world.collision.ray(eye(this),direction(this.yaw,this.pitch),2,world.actors,this.id);if(hit?.actor)world.damage(hit.actor,110,this);world.emit('melee',{});}
  if(input.interact)world.interact();
 }
 snapshot(){return{pos:{...this.pos},yaw:this.yaw,pitch:this.pitch,stance:this.stance,vy:this.vy,health:this.health.snapshot(),weapons:this.weapons.map(w=>w.snapshot()),slot:this.slot,grenades:this.grenades,stamina:this.stamina,meleeLeft:this.meleeLeft,grenadeLeft:this.grenadeLeft,distance:this.distance};}
 restore(data){Object.assign(this,data);this.health=new Health(data.health.hp,data.health.delay);this.weapons=data.weapons.map(Weapon.restore);this.grounded=true;this.ads=false;this.hurt=0;this.recoil=0;this.stepTime=0;this.hitMarker=0;}
}
