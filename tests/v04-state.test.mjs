import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/core/simulation.js';
import {validateSnapshot} from '../src/save/schema.js';
import {updateAirSupport} from '../src/vehicles/air-support.js';
import {AIR_SORTIES} from '../src/data/support.js';
import {tankMount} from '../src/vehicles/tank.js';

function airStep(w,seconds){for(let i=0;i<Math.round(seconds*60);i++){w.time+=1/60;updateAirSupport(w,1/60);}}
test('checkpoint while aircraft is airborne does not launch a second copy',()=>{
 const s=new Simulation();s.director.skipBriefing(s);airStep(s,19);
 assert.equal(s.air.planes.length,1);const r=new Simulation(s.snapshot());
 assert.deepEqual(r.air,s.air);airStep(s,6);airStep(r,6);assert.deepEqual(r.air,s.air);
 assert.equal(new Set(r.air.launched).size,r.air.launched.length);
});
test('air bomb has a warning, a visible carrier and physical flight before impact',()=>{
 const s=new Simulation();s.director.skipBriefing(s);airStep(s,99);
 assert.ok(s.events.some(e=>e.type==='air-warning'));assert.equal(s.air.bombs.length,0);
 assert.ok(s.air.planes.some(p=>p.id==='air-uk-strike'));airStep(s,4);
 assert.equal(s.air.bombs.length,1);assert.ok(s.air.bombs[0].pos.y>s.terrain.height(s.air.bombs[0].pos.x,s.air.bombs[0].pos.z)+10);
 assert.throws(()=>s.snapshot(),/Zapis/);airStep(s,6);assert.equal(s.air.bombs.length,0);
 assert.ok(s.events.some(e=>e.type==='explosion'));airStep(s,260);
 assert.equal(s.air.launched.length,AIR_SORTIES.length);assert.equal(s.stats.airBombs,2);
});
test('losing the officer cannot block skipping the briefing',()=>{
 const s=new Simulation();s.npcs.find(n=>n.id==='uk-1').hp=0;
 assert.ok(s.director.caption(s));s.director.skipBriefing(s);assert.equal(s.director.phase,1);
});
test('malformed new support state is rejected before constructing a scene',()=>{
 const s=new Simulation();s.director.skipBriefing(s);airStep(s,19);const snap=s.snapshot();
 for(const mutate of [s=>{s.air.planes[0].velocity={x:0};},s=>{s.air.planes.push({...s.air.planes[0]});},s=>{s.air.planes[0].releaseAt='bad';},s=>{s.tanks[0].mgAmmo=NaN;},s=>{s.fieldGuns[0].operational='yes';}]){
  const bad=structuredClone(snap);mutate(bad);assert.throws(()=>validateSnapshot(bad));
 }
});
