import {v3,add,sub,mul,norm,dist,direction,flatDist,clamp} from '../core/math.js';
import {eye} from '../world/collision.js';
export function bulletMuzzle(shooter){
 const origin=eye(shooter);
 return add(add(origin,v3(Math.cos(shooter.yaw)*.12,-.13,-Math.sin(shooter.yaw)*.12)),mul(direction(shooter.yaw,shooter.pitch||0),.55));
}
export function segmentDistance(point,a,b){
 const ab=sub(b,a),ap=sub(point,a),den=ab.x*ab.x+ab.y*ab.y+ab.z*ab.z;
 const t=den?clamp((ap.x*ab.x+ap.y*ab.y+ap.z*ab.z)/den,0,1):0;
 return dist(point,add(a,mul(ab,t)));
}
export function suppressAlong(world,owner,from,to,radius=3.5,amount=.32){
 for(const a of world.npcs)if(a.hp>0&&a.faction!==owner.faction){
  const p=add(a.pos,v3(0,a.stance==='prone'?.25:a.stance==='crouch'?.68:1.05,0));
  // A hit wall terminates the segment; nearby actors behind it are not suppressed.
  const ab=sub(to,from),den=ab.x*ab.x+ab.y*ab.y+ab.z*ab.z;
  const t=den?clamp(((p.x-from.x)*ab.x+(p.y-from.y)*ab.y+(p.z-from.z)*ab.z)/den,0,1):0;
  const nearest=add(from,mul(ab,t));
  if(segmentDistance(p,from,to)<radius&&world.collision.visible(nearest,p))a.suppression=Math.min(1.7,(a.suppression||0)+amount);
 }
}
/** Camera selects intent; two muzzle tests prevent firing through nearby cover. */
export function fireBullet(world,shooter,weapon,aim,spread){
 const origin=eye(shooter),random=world.random;
 let d=norm(add(aim,v3((random()-.5)*spread,(random()-.5)*spread,(random()-.5)*spread)));
 const intent=world.collision.ray(origin,d,weapon.definition.range,world.actors,shooter.id);
 const point=intent?.point||add(origin,mul(d,weapon.definition.range));
 const front=bulletMuzzle(shooter);
 const blocked=world.collision.ray(origin,norm(sub(front,origin)),dist(origin,front),[],shooter.id);
 const hit=blocked||world.collision.ray(front,norm(sub(point,front)),weapon.definition.range,world.actors,shooter.id);
 const end=hit?.point||point;
 world.emit('shot',{from:front,to:end,faction:shooter.faction,weapon:weapon.id,owner:shooter.id});
 world.stats[shooter.faction==='uk'?'britishShots':'germanShots']++;
 world.noises.push({pos:{...shooter.pos},faction:shooter.faction,ttl:.5});
 if(hit?.actor){world.damage(hit.actor,weapon.definition.damage,shooter,{kind:'bullet',hitPart:hit.part,weaponId:weapon.id,origin:shooter.pos});if(shooter.id==='player'&&hit.actor.faction!==shooter.faction){world.player.hitMarker=.16;world.stats.hits++;}}
 else if(hit)world.emit('impact',{pos:end,kind:hit.kind});
 // Near misses cause a bounded reaction, not permanent suppression.
 suppressAlong(world,shooter,blocked?origin:front,end);
 return hit;
}
export function blast(world,pos,radius,power,owner){world.emit('explosion',{pos:{...pos},radius});for(const actor of world.actors){if((actor.hp??actor.health?.hp)<=0)continue;const chest=add(actor.pos,v3(0,actor.stance==='prone'?.25:actor.stance==='crouch'?.65:1.05,0)),distance=dist(pos,chest);if(distance>radius)continue;if(world.collision.visible(add(pos,v3(0,.12,0)),chest))world.damage(actor,power*clamp(1-distance/radius,.1,1),owner,{kind:'explosion',origin:{...pos}});}}
export function updateGrenades(world,dt){for(const g of world.grenades){g.fuse-=dt;g.vel.y-=12*dt;const delta=mul(g.vel,dt),distance=dist(v3(),delta),hit=distance>.001?world.collision.ray(g.pos,norm(delta),distance+.08):null;
 if(hit){g.pos=add(hit.point,mul(norm(delta),-.09));if(hit.kind==='terrain'){g.vel.y=Math.abs(g.vel.y)*.36;g.vel.x*=.63;g.vel.z*=.63;}else{const b=hit.solid,dx=Math.min(Math.abs(g.pos.x-b.min.x),Math.abs(g.pos.x-b.max.x)),dz=Math.min(Math.abs(g.pos.z-b.min.z),Math.abs(g.pos.z-b.max.z));if(g.pos.y>b.max.y-.15)g.vel.y=Math.abs(g.vel.y)*.36;else if(dx<dz)g.vel.x*=-.46;else g.vel.z*=-.46;g.vel.x*=.75;g.vel.z*=.75;}}
 else g.pos=add(g.pos,delta);const y=world.terrain.height(g.pos.x,g.pos.z)+.09;if(g.pos.y<y){g.pos.y=y;g.vel.y=Math.abs(g.vel.y)*.32;g.vel.x*=.8;g.vel.z*=.8;}
 if(g.fuse<=0){const owner=world.actors.find(a=>a.id===g.owner)||{id:g.owner,faction:g.faction};blast(world,g.pos,7,190,owner);g.dead=true;}}
 world.grenades=world.grenades.filter(g=>!g.dead);
}

/** A mounted weapon shares actor hits, friendly blockers and world geometry.
 * No invented eye/muzzle on a tank; the physical mounting is supplied explicitly.
 */
export function fireMountedBullet(world,owner,origin,aim,{weapon='lewis',range=95,damage=34,spread=.075}={}){
 const random=world.random,d=norm(add(aim,v3((random()-.5)*spread,(random()-.5)*spread,(random()-.5)*spread)));
 const hit=world.collision.ray(origin,d,range,world.actors,null,{ignoreSolid:owner.id});
 const end=hit?.point||add(origin,mul(d,range));
 world.emit('shot',{from:origin,to:end,faction:owner.faction,weapon,owner:owner.id});
 world.stats[owner.faction==='uk'?'britishShots':'germanShots']++;
 if(hit?.actor)world.damage(hit.actor,damage,owner,{kind:'bullet',hitPart:hit.part,weaponId:weapon,origin});
 else if(hit)world.emit('impact',{pos:end,kind:hit.kind});
 suppressAlong(world,owner,origin,end,4,.30);
 return hit;
}
