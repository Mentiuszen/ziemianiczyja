import {v3,add,sub,mul,norm,dist,direction,flatDist,clamp} from '../core/math.js';
import {eye} from '../world/collision.js';
/** Camera selects intent; two muzzle tests prevent firing through nearby cover. */
export function fireBullet(world,shooter,weapon,aim,spread){
 const origin=eye(shooter),random=world.random;
 let d=norm(add(aim,v3((random()-.5)*spread,(random()-.5)*spread,(random()-.5)*spread)));
 const intent=world.collision.ray(origin,d,weapon.definition.range,world.actors,shooter.id);
 const point=intent?.point||add(origin,mul(d,weapon.definition.range));
 const muzzle=add(origin,v3(Math.cos(shooter.yaw)*.12,-.13,-Math.sin(shooter.yaw)*.12));
 const front=add(muzzle,mul(direction(shooter.yaw,shooter.pitch||0),.55));
 const blocked=world.collision.ray(origin,norm(sub(front,origin)),dist(origin,front),[],shooter.id);
 const hit=blocked||world.collision.ray(front,norm(sub(point,front)),weapon.definition.range,world.actors,shooter.id);
 const end=hit?.point||point;
 world.emit('shot',{from:front,to:end,faction:shooter.faction,weapon:weapon.id,owner:shooter.id});
 world.stats[shooter.faction==='uk'?'britishShots':'germanShots']++;
 world.noises.push({pos:{...shooter.pos},faction:shooter.faction,ttl:.5});
 if(hit?.actor){const multiplier=hit.part==='head'?1.6:hit.part==='limb'?.57:1;world.damage(hit.actor,weapon.definition.damage*multiplier,shooter);if(shooter.id==='player'&&hit.actor.faction!==shooter.faction){world.player.hitMarker=.16;world.stats.hits++;}}
 else if(hit)world.emit('impact',{pos:end,kind:hit.kind});
 // Near misses cause a bounded reaction, not permanent suppression.
 for(const a of world.npcs){if(a.hp>0&&a.faction!==shooter.faction&&flatDist(a.pos,end)<3.5)a.suppression=Math.min(1.7,(a.suppression||0)+.32);}
 return hit;
}
export function blast(world,pos,radius,power,owner){world.emit('explosion',{pos:{...pos},radius});for(const actor of world.actors){if((actor.hp??actor.health?.hp)<=0)continue;const chest=add(actor.pos,v3(0,actor.stance==='prone'?.25:actor.stance==='crouch'?.65:1.05,0)),distance=dist(pos,chest);if(distance>radius)continue;if(world.collision.visible(add(pos,v3(0,.12,0)),chest))world.damage(actor,power*clamp(1-distance/radius,.1,1),owner);}}
export function updateGrenades(world,dt){for(const g of world.grenades){g.fuse-=dt;g.vel.y-=12*dt;const delta=mul(g.vel,dt),distance=dist(v3(),delta),hit=distance>.001?world.collision.ray(g.pos,norm(delta),distance+.08):null;
 if(hit){g.pos=add(hit.point,mul(norm(delta),-.09));if(hit.kind==='terrain'){g.vel.y=Math.abs(g.vel.y)*.36;g.vel.x*=.63;g.vel.z*=.63;}else{const b=hit.solid,dx=Math.min(Math.abs(g.pos.x-b.min.x),Math.abs(g.pos.x-b.max.x)),dz=Math.min(Math.abs(g.pos.z-b.min.z),Math.abs(g.pos.z-b.max.z));if(g.pos.y>b.max.y-.15)g.vel.y=Math.abs(g.vel.y)*.36;else if(dx<dz)g.vel.x*=-.46;else g.vel.z*=-.46;g.vel.x*=.75;g.vel.z*=.75;}}
 else g.pos=add(g.pos,delta);const y=world.terrain.height(g.pos.x,g.pos.z)+.09;if(g.pos.y<y){g.pos.y=y;g.vel.y=Math.abs(g.vel.y)*.32;g.vel.x*=.8;g.vel.z*=.8;}
 if(g.fuse<=0){const owner=world.actors.find(a=>a.id===g.owner)||{id:g.owner,faction:g.faction};blast(world,g.pos,7,190,owner);g.dead=true;}}
 world.grenades=world.grenades.filter(g=>!g.dead);
}
