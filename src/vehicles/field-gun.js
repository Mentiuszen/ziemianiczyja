import {message} from '../i18n/message.js';
import {v3,sub,norm,flatDist,angleDiff,approachAngle} from '../core/math.js';

export function createFieldGun(data,terrain){return{...data,crewIds:[...data.crewIds],pos:v3(data.x,terrain.height(data.x,data.z),data.z),yaw:data.yaw,homeYaw:data.yaw,operational:true,disabled:false,neutralized:false,reloadLeft:5,ammo:18,recoil:0,lastFire:-100};}
export function fieldGunBounds(g){return[
 {id:g.id+'-shield',owner:g.id,min:v3(g.pos.x-.96,g.pos.y+.48,g.pos.z-.19),max:v3(g.pos.x+.96,g.pos.y+1.48,g.pos.z+.03)},
 {id:g.id+'-carriage',owner:g.id,min:v3(g.pos.x-.98,g.pos.y+.04,g.pos.z-.12),max:v3(g.pos.x+.98,g.pos.y+.5,g.pos.z+2)}
];}
/** Permanent objective status differs from current firing readiness. */
export function isFieldGunNeutralized(w,g){
 return g.disabled||g.neutralized===true||!g.crewIds.some(id=>w.npcs.some(n=>n.id===id&&n.hp>0));
}
export function restoreFieldGunState(w,g){
 // In 0.4.1 operational=false could mean only a temporarily absent crew.
 // Already credited neutralization must never resurrect artillery after loading.
 const credited=w.director.events.includes('fieldgun-silenced')||w.director.phase>=5;
 g.neutralized=!!(g.disabled||g.neutralized||credited||!g.crewIds.some(id=>w.npcs.some(n=>n.id===id&&n.hp>0)));
 g.operational=!g.neutralized&&g.crewIds.some(id=>w.npcs.some(n=>n.id===id&&n.hp>0&&flatDist(n.pos,g.pos)<6));
}
export function updateFieldGun(w,g,dt){
 g.recoil=Math.max(0,g.recoil-dt*2);g.reloadLeft=Math.max(0,g.reloadLeft-dt);
 const crew=g.crewIds.map(id=>w.npcs.find(n=>n.id===id)).filter(n=>n?.hp>0&&flatDist(n.pos,g.pos)<6);
 if(isFieldGunNeutralized(w,g)){
  if(!g.neutralized)w.emit('gun-disabled',{id:g.id,pos:{...g.pos}});
  g.neutralized=true;g.operational=false;return;
 }
 g.operational=crew.length>0;if(!g.operational)return;
 if(w.director.phase===0||g.ammo<=0)return;
 const candidates=w.tanks.filter(t=>t.state!=='destroyed'&&t.pos.z>57&&flatDist(t.pos,g.pos)<120).sort((a,b)=>Number(a.state==='immobilized')-Number(b.state==='immobilized')||flatDist(a.pos,g.pos)-flatDist(b.pos,g.pos));
 for(const t of candidates){
  const heading=Math.atan2(t.pos.x-g.pos.x,t.pos.z-g.pos.z);
  if(Math.abs(angleDiff(heading,g.homeYaw))>1.1)continue;
  g.yaw=approachAngle(g.yaw,heading,dt*.38);if(Math.abs(angleDiff(g.yaw,heading))>.08)continue;
  const from=v3(g.pos.x+Math.sin(g.yaw)*2.11,g.pos.y+1.08,g.pos.z+Math.cos(g.yaw)*2.11);
  const target=v3(t.pos.x+(w.random()-.5)*.14,t.pos.y+.86,t.pos.z),d=sub(target,from),distance=Math.hypot(d.x,d.y,d.z);
  const hit=w.collision.ray(from,norm(d),distance-.5,[],null,{ignoreSolid:g.id});if(hit&&hit.solid?.id!==t.id)continue;
  if(g.reloadLeft>0)break;
  const flight=Math.max(.4,distance/42);
  w.shells.push({id:`shell-${w.nextId++}`,owner:g.id,faction:g.faction,pos:from,vel:v3(d.x/flight,(d.y+3*flight*flight)/flight,d.z/flight),ttl:flight+1,power:180,radius:4.2,armorDamage:48,kind:'shell'});
  g.ammo--;g.reloadLeft=(crew.length>1?7.5:13)+w.random()*2;g.recoil=1;g.lastFire=w.time;w.stats.fieldGunShots++;
  w.emit('cannon',{pos:from,owner:g.id,faction:g.faction});
  if(w.director.once('gun-revealed'))w.emit('message',{text:message('message.fieldgun')});
  break;
 }
}
