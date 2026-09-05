import test from 'node:test';import assert from 'node:assert/strict';
import {Simulation} from '../src/core/simulation.js';
import * as tank from '../src/vehicles/tank.js';
const field=await import('../src/vehicles/field-gun.js').catch(()=>({}));
const air=await import('../src/vehicles/air-support.js').catch(()=>({}));
test('tanks have a curved authored route and meaningful damage, not rifle HP',()=>{const s=new Simulation(),t=s.tanks[0];assert.ok(t.route?.length>=4);assert.equal(typeof tank.damageTank,'function');const before=t.integrity;tank.damageTank(s,t,100,{id:'player',faction:'de',kind:'rifle'},t.pos);assert.equal(t.integrity,before);tank.damageTank(s,t,48,{id:'gun',faction:'de',kind:'shell'},{...t.pos,y:t.pos.y+.5});assert.equal(t.state,'immobilized');assert.ok(t.gunWorking);});
test('field gun is inoperable without surviving crew; never requires a particular killer',()=>{const s=new Simulation();assert.equal(typeof field.updateFieldGun,'function');assert.equal(s.fieldGuns?.length,1);const g=s.fieldGuns[0];for(const id of g.crewIds){s.npcs.find(n=>n.id===id).hp=0;}field.updateFieldGun(s,g,1/60);assert.equal(g.operational,false);s.director.phase=4;s.director.update(s,1/60);assert.equal(s.director.phase,5);});
test('tank wire breach is persistent and changes collision',()=>{const s=new Simulation();assert.equal(typeof s.breakObstacle,'function');const b=s.layout.find(b=>b.breakable);assert.ok(b);assert.ok(s.breakObstacle(b.id));assert.ok(!s.collision.boxes.some(x=>x.id===b.id));assert.equal(s.breakObstacle(b.id),false);const r=new Simulation(s.snapshot());assert.ok(!r.collision.boxes.some(x=>x.id===b.id));});
test('aircraft schedules are finite, persistent, and warn before live ordnance',()=>{const s=new Simulation();assert.equal(typeof air.updateAirSupport,'function');assert.ok(s.air);s.director.skipBriefing(s);for(let i=0;i<1000;i++){s.time+=.1;air.updateAirSupport(s,.1);}assert.ok(s.air.launched.length>0);assert.ok(s.air.launched.length<=6);assert.ok(s.events.some(e=>e.type==='air-warning'));});
test('tank projectile origins follow the model muzzle positions through turns',()=>{
 const s=new Simulation(),t=s.tanks[0];assert.equal(typeof tank.tankMuzzle,'function');t.yaw=0;
 let p=tank.tankMuzzle(t,'mg');assert.ok(Math.abs(p.x-t.pos.x)<1e-6);assert.ok(Math.abs(p.y-t.pos.y-1.36)<1e-6);assert.ok(Math.abs(p.z-t.pos.z-3.23)<1e-6);
 t.yaw=Math.PI/2;p=tank.tankMuzzle(t,'cannon',-1);assert.ok(Math.abs(p.x-t.pos.x-1.34)<1e-6);assert.ok(Math.abs(p.z-t.pos.z-2.93)<1e-6);
});
