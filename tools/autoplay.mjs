/** Deterministic, omniscient navigation test bot. Not representative of human difficulty.
 * It drives normal movement/fire/interact inputs; it never teleports or changes HP/ammo. */
import {Simulation} from '../src/core/simulation.js';import {eye} from '../src/world/collision.js';import {norm,sub,flatDist,angleDiff} from '../src/core/math.js';
const s=new Simulation(null,'recruit');if(process.argv.includes('--destroyed-tanks')){for(const t of s.tanks){t.state='destroyed';t.integrity=0;t.gunWorking=false;}console.log('Fallback fixture: both tanks destroyed before mission; no player position/health edits.');}let phase=-1,path=[],index=0,stuck=0,last={...s.player.pos},checkpoints=[];
for(let step=0;step<36000&&s.player.hp>0&&s.director.phase<7;step++){
 const p=s.player,o=s.director.objective,input={};
 if(phase!==s.director.phase){phase=s.director.phase;const goal=phase===2?{x:23,z:62}:phase===4?{x:36,z:113}:phase===6?{x:4,z:160}:{x:o.x,z:o.z};path=s.nav.path(p.pos,goal);index=0;console.log('phase',phase,o.id,'time',s.time.toFixed(1),'HP',p.hp.toFixed(1),'route',path.length);}
 if(phase===0)input.interact=true;
 let target=s.npcs.filter(n=>n.faction==='de'&&n.hp>0&&flatDist(p.pos,n.pos)<65&&s.collision.visible(eye(p),eye(n))).sort((a,b)=>flatDist(p.pos,a.pos)-flatDist(p.pos,b.pos))[0];
 if(target){const d=sub(eye(target),eye(p));input.lookX=angleDiff(Math.atan2(d.x,d.z),p.yaw);input.lookY=-Math.atan2(d.y,Math.hypot(d.x,d.z))-p.pitch;input.fire=true;input.aim=true;}
 if(index<path.length){const wp=path[index];if(flatDist(p.pos,wp)<.42)index++;else{const heading=Math.atan2(wp.x-p.pos.x,wp.z-p.pos.z),aimYaw=p.yaw+(input.lookX||0);if(!target){input.lookX=angleDiff(heading,p.yaw);input.lookY=-p.pitch;input.forward=true;}else{const relative=angleDiff(heading,aimYaw),cos=Math.cos(relative),sin=Math.sin(relative);input.forward=cos>.38;input.back=cos<-.38;input.right=sin>.38;input.left=sin<-.38;}}}
 else if(phase===2||phase===3||phase===4||phase===5)input.interact=true;
 if(phase===6)input.interact=false;
 if(p.weapon.mag===0)input.reload=true;
 s.tick(1/60,input);for(const event of s.consumeEvents())if(event.type==='checkpoint'){checkpoints.push({name:event.name,time:s.time,phase:s.director.phase});const snapshot=s.snapshot();const check=new Simulation(snapshot);if(check.npcs.length!==s.npcs.length)throw Error('Checkpoint duplicated NPCs');}
 if(flatDist(last,p.pos)<.002&&index<path.length)stuck+=1/60;else stuck=0;last={...p.pos};if(stuck>3){path=s.nav.path(p.pos,phase===2?{x:23,z:62}:{x:o.x,z:o.z});index=0;stuck=0;}
}
const result={completed:s.director.phase===7,time:s.time,hp:s.player.hp,phase:s.director.phase,pos:s.player.pos,stats:s.stats,checkpoints,fieldGuns:s.fieldGuns.map(g=>({id:g.id,operational:g.operational,ammo:g.ammo})),air:s.air.launched,tanks:s.tanks.map(t=>({id:t.id,state:t.state,z:t.pos.z}))};console.log(JSON.stringify(result,null,2));if(!result.completed||checkpoints.length<2)process.exitCode=1;
