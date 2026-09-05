import test from 'node:test';import assert from 'node:assert/strict';
import {Simulation} from '../src/core/simulation.js';
import {updateSoldier} from '../src/ai/soldier.js';
const direct=(s,duration)=>{for(let t=0;t<duration;t+=.1){s.time+=.1;s.director.update(s,.1);}};
test('mission starts in a roofed briefing room with officer and squad',()=>{const s=new Simulation();assert.equal(s.director.phase,0);assert.ok(s.player.pos.z<0);const roof=s.collision.ray({x:s.player.pos.x,y:s.player.pos.y+1.7,z:s.player.pos.z},{x:0,y:1,z:0},6);assert.equal(roof?.solid?.kind,'hq-roof');assert.ok(s.npcs.filter(n=>n.faction==='uk'&&n.pos.z<0).length>=4);});
test('briefing runs from simulation time and starts the assault once; skip is idempotent',()=>{const s=new Simulation();assert.equal(typeof s.director.skipBriefing,'function');direct(s,5);assert.equal(s.director.phase,0);assert.ok(s.director.caption(s)?.text);const snap=s.snapshot(),r=new Simulation(snap);assert.equal(r.director.briefingTime,s.director.briefingTime);direct(s,45);assert.equal(s.director.phase,1);assert.equal(s.director.events.filter(e=>e==='assault').length,1);s.director.skipBriefing(s);assert.equal(s.director.phase,1);r.director.skipBriefing(r);assert.equal(r.director.phase,1);assert.equal(r.director.events.filter(e=>e==='assault').length,1);});
test('enemy damaged before the assault alerts the sector, not a static target',()=>{const s=new Simulation();const enemy=s.npcs.find(n=>n.faction==='de');s.damage(enemy,5,s.player);assert.equal(s.director.phase,1);assert.ok(s.director.events.includes('early-alarm'));assert.ok(enemy.hp<100);});
test('both sides produce actual positional shots before the main assault',()=>{const s=new Simulation();for(let i=0;i<1200;i++)s.tick(1/60,{});assert.equal(s.director.phase,0);assert.ok(s.stats.britishShots>0);assert.ok(s.stats.germanShots>0);assert.ok(s.stats.alliedLost+s.stats.enemyLost<6);});
test('local defense is contested by nearby enemies instead of an unconditional countdown',()=>{const s=new Simulation();s.director.phase=6;s.player.pos={x:4,y:s.terrain.height(4,159),z:159};const enemy=s.npcs.find(n=>n.faction==='de');enemy.pos={x:5,y:s.player.pos.y,z:159};s.director.hold=10;direct(s,3);assert.ok(s.director.hold<=10);assert.equal(s.director.phase,6);});
test('all four briefing soldiers have an exit route and leave the room without a doorway deadlock',()=>{
 const s=new Simulation();const squad=s.npcs.filter(n=>n.briefingRole);
 for(const n of squad)assert.ok(s.nav.path(n.pos,{x:6,z:43}).length>0,`${n.id} has no path out of the command room`);
 s.director.skipBriefing(s);for(let i=0;i<80*60;i++)s.tick(1/60,{});
 for(const n of squad)assert.ok(n.hp<=0||n.pos.z>2,`${n.id} stuck at ${JSON.stringify(n.pos)}`);
});
test('MG bunker has a narrow real embrasure, not an exposed gunner across its whole facade',()=>{
 const s=new Simulation(),g=s.npcs.find(n=>n.id==='de-mg'),eye={x:g.pos.x,y:g.pos.y+1.59,z:g.pos.z};
 assert.equal(s.collision.visible({x:6,y:s.terrain.height(6,30)+1.6,z:30},eye),false);
 assert.equal(s.collision.visible({x:23,y:g.pos.y+1.50,z:54},eye),true);
});
