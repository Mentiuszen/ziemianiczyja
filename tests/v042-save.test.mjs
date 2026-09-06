import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateSnapshot} from '../src/save/schema.js';
import {Simulation} from '../src/core/simulation.js';
const legacy=()=>JSON.parse(readFileSync(new URL('./fixtures/v041-checkpoint.json',import.meta.url),'utf8'));
test('real 0.4.1 snapshot remains valid including its six-second health delay',()=>{const s=legacy();s.player.health.delay=6;assert.doesNotThrow(()=>validateSnapshot(s));});
for(const [label,change] of [
 ['negative pathIndex',s=>s.npcs[0].pathIndex=-1],['fractional pathIndex',s=>s.npcs[0].pathIndex=.5],['index after empty path',s=>s.npcs[0].pathIndex=1],
 ['NaN vertical velocity',s=>s.player.vy=NaN],['null vertical velocity',s=>s.player.vy=null],['infinite AI pitch',s=>s.npcs[0].pitch=Infinity],
 ['unknown difficulty',s=>s.difficulty='impossible'],['unknown stance',s=>s.npcs[0].stance='flying'],['unknown AI state',s=>s.npcs[0].state='flying'],
 ['negative grenade action timer',s=>s.player.grenadeLeft=-1],['invalid target reference',s=>s.npcs[0].targetId='missing-soldier'],
 ['wrong gun crew',s=>s.fieldGuns[0].crewIds=['uk-0']],['missing used stats counter',s=>delete s.stats.enemyLost],
 ['item used flag',s=>s.items[0].used='false'],['invalid saved movement goal',s=>s.npcs[0].moveGoal={x:NaN,y:0,z:0}]
])test(`reject ${label} in an otherwise valid historical save`,()=>{const s=legacy();validateSnapshot(s);change(s);assert.throws(()=>validateSnapshot(s));});
test('missing historically optional movement fields get explicit defaults',()=>{const s=legacy();delete s.npcs[0].pathIndex;assert.doesNotThrow(()=>validateSnapshot(s));const w=new Simulation(s);assert.equal(w.npcs[0].pathIndex,0);});
test('all live actors are collision-free after historical restore',()=>{const w=new Simulation(legacy());for(const n of w.actors)assert.equal(w.collision.canStand(n.pos,n.stance,n.yaw,n.id),true,n.id);});
test('an unsafe player position is rejected instead of distant teleport',()=>{const s=legacy();s.player.pos={x:33,y:s.player.pos.y-8,z:-7};assert.throws(()=>new Simulation(s),/pozycj|ustaw|checkpoint/i);});
test('a previously credited gun does not resume after migration',()=>{const s=legacy();s.director.phase=5;s.director.events.push('fieldgun-silenced');s.fieldGuns[0].operational=false;const w=new Simulation(s);assert.equal(w.fieldGuns[0].neutralized,true);assert.equal(w.fieldGuns[0].operational,false);});
test('restoring an airborne snapshot never grants grounded/jump before landing',()=>{const s=legacy();s.player.pos.y+=.8;s.player.vy=-1;const w=new Simulation(s);assert.equal(w.player.grounded,false);w.player.update(w,1/60,{jump:true});assert.ok(w.player.vy<0);});
test('pending checkpoint waits for full health and valid support',()=>{const w=new Simulation();w.director.checkpoint('test');w.player.health.hp=90;w.player.health.delay=0;w.director.update(w,1/60);assert.equal(w.director.checkpointPending,true);w.player.health.hp=100;w.player.pos.y+=1;w.director.update(w,1/60);assert.equal(w.director.checkpointPending,true);});
test('new snapshot roundtrip preserves health profile and does not replay events',()=>{const w=new Simulation(null,'recruit');w.player.health.damage(20);const s=w.snapshot(),restored=new Simulation(s);assert.equal(restored.player.health.regenRate,25);assert.equal(restored.player.health.delay,3);assert.equal(restored.consumeEvents().length,0);assert.equal(restored.difficultyId,'recruit');});
