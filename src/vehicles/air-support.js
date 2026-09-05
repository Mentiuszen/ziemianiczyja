import {AIR_SORTIES} from '../data/support.js';
import {v3,add,sub,mul,norm,dist} from '../core/math.js';
import {blast} from '../combat/ballistics.js';

export function createAirSupport(){return{launched:[],planes:[],bombs:[]};}
/** Finite local sorties. A physical, visible aircraft precedes each bomb by four seconds.
 * The historical types are represented, not an invented date-specific squadron.
 */
export function updateAirSupport(w,dt){
 const a=w.air;if(w.director.assaultTime===null)return;
 const elapsed=w.time-w.director.assaultTime;
 for(const s of AIR_SORTIES){
  if(elapsed<s.at||a.launched.includes(s.id))continue;
  a.launched.push(s.id);let pos,velocity,life,releaseAt=null;
  if(s.attack){
   const fall=Math.sqrt(2*s.altitude/12),dir=v3(Math.sin(s.heading),0,Math.cos(s.heading));
   velocity=mul(dir,s.speed);pos=v3(s.target.x-velocity.x*(fall+4),w.terrain.height(s.target.x,s.target.z)+s.altitude,s.target.z-velocity.z*(fall+4));life=fall+13;releaseAt=4;
   w.emit('air-warning',{pos:{...pos},faction:s.faction,text:s.faction==='de'?'Niemiecki samolot obniża lot! Osłoń się za ziemnym nasypem lub w budynku.':'Brytyjski samolot nadlatuje z lewej — nie wychodź na stanowiska przeciwnika.'});
  }else{pos={...s.start};velocity=mul(norm(sub(s.end,s.start)),s.speed);life=dist(s.start,s.end)/s.speed;}
  a.planes.push({id:s.id,model:s.model,faction:s.faction,pos,velocity,age:0,life,releaseAt,released:false,yaw:Math.atan2(velocity.x,velocity.z),bank:s.faction==='uk'?.05:-.04});
  w.emit('air-pass',{pos:{...pos},faction:s.faction});
 }
 for(const p of a.planes){
  p.age+=dt;p.pos=add(p.pos,mul(p.velocity,dt));
  if(p.releaseAt!==null&&!p.released&&p.age>=p.releaseAt){
   p.released=true;
   a.bombs.push({id:`${p.id}-bomb`,owner:p.id,faction:p.faction,pos:add(p.pos,v3(0,-.8,0)),vel:{...p.velocity},ttl:18});
   w.stats.airBombs++;w.emit('bomb-release',{pos:{...p.pos},faction:p.faction});
  }
 }
 a.planes=a.planes.filter(p=>p.age<p.life);
 for(const b of a.bombs){
  b.ttl-=dt;b.vel.y-=12*dt;const step=mul(b.vel,dt),length=dist(v3(),step),hit=w.collision.ray(b.pos,norm(step),length);
  if(hit||b.ttl<=0){
   const pos=hit?.point||b.pos;
   if(hit)blast(w,pos,7.5,155,{id:b.owner,faction:b.faction,kind:'bomb',pos});
   b.dead=true;
  }else b.pos=add(b.pos,step);
 }
 a.bombs=a.bombs.filter(b=>!b.dead);
}
