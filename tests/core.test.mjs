import test from 'node:test';
import assert from 'node:assert/strict';
import { Health } from '../src/combat/health.js';
import { Weapon } from '../src/combat/weapon.js';
import { FixedClock } from '../src/core/clock.js';
import { rayBox, raySphere, rng } from '../src/core/math.js';
import { WEAPONS } from '../src/data/weapons.js';
import { validateSnapshot } from '../src/save/schema.js';

test('health: 6-second delay, 12 HP/s, full regeneration', () => {
 const h = new Health(); h.damage(60); h.tick(5.9); assert.equal(h.hp,40); h.tick(.1); assert.ok(Math.abs(h.hp-40)<1e-9); h.tick(1); assert.ok(Math.abs(h.hp-52)<1e-9); h.tick(20); assert.equal(h.hp,100);
});
test('health: a new hit resets regeneration delay', () => {
 const h=new Health(); h.damage(20); h.tick(5); h.damage(10);h.tick(2);assert.equal(h.hp,70);
});
test('health: medkit is not consumed at full health; max +50',()=>{
 const h=new Health();assert.equal(h.medkit(),false);h.damage(70);assert.equal(h.medkit(),true);assert.equal(h.hp,80);h.medkit();assert.equal(h.hp,100);
});
test('dead actors do not regenerate or use medkits',()=>{
 const h=new Health();h.damage(200);h.tick(100);assert.equal(h.hp,0);assert.equal(h.medkit(),false);
});
test('reload transfers only at completion, cancellation cannot duplicate ammunition',()=>{
 const w=new Weapon('smle',2,8); assert.equal(w.reload(),true);w.tick(1);w.cancelReload();assert.equal(w.mag,2);assert.equal(w.reserve,8);w.reload();w.tick(10);assert.equal(w.mag,10);assert.equal(w.reserve,0);
});
test('partial reload respects the available reserve',()=>{
 const w=new Weapon('webley',1,2);w.reload();w.tick(10);assert.equal(w.mag,3);assert.equal(w.reserve,0);
});
test('bolt cycle blocks an immediate second shot and survives serialization',()=>{
 const w=new Weapon('smle',10,30);assert.ok(w.fire());assert.equal(w.fire(),false);const restored=Weapon.restore(w.snapshot());assert.equal(restored.fire(),false);restored.tick(WEAPONS.smle.cycle);assert.ok(restored.fire());assert.equal(restored.mag,8);
});
test('reload progress roundtrips exactly once',()=>{
 const w=new Weapon('smle',3,10);w.reload();w.tick(.7);const copy=Weapon.restore(w.snapshot());copy.tick(10);assert.equal(copy.mag,10);assert.equal(copy.reserve,3);copy.tick(100);assert.equal(copy.mag+copy.reserve,13);
});
test('cannot fire during reload or when magazine is empty',()=>{
 const w=new Weapon('smle',0,10);assert.equal(w.fire(),false);w.reload();assert.equal(w.fire(),false);
});
test('clock stops during pause and discards long frame backlog',()=>{
 const c=new FixedClock();let count=0;c.advance(1,false,()=>count++);assert.equal(count,0);c.advance(5,true,()=>count++);assert.ok(count<=5);c.advance(.01,false,()=>count++);assert.equal(c.accumulator,0);
});
test('ray intersects the nearest surface of a box',()=>{
 assert.equal(rayBox({x:0,y:1,z:0},{x:0,y:0,z:1},{min:{x:-1,y:0,z:3},max:{x:1,y:2,z:4}},100),3);
 assert.equal(rayBox({x:3,y:1,z:0},{x:0,y:0,z:1},{min:{x:-1,y:0,z:3},max:{x:1,y:2,z:4}},100),null);
});
test('ray that starts inside a solid is blocked immediately',()=>{
 assert.equal(rayBox({x:0,y:1,z:3.5},{x:0,y:0,z:1},{min:{x:-1,y:0,z:3},max:{x:1,y:2,z:4}},100),0);
});
test('sphere hitbox ignores empty space above a prone soldier',()=>{
 assert.equal(raySphere({x:0,y:1.7,z:-5},{x:0,y:0,z:1},{x:0,y:.3,z:0},.3,100),null);
 assert.ok(raySphere({x:0,y:.3,z:-5},{x:0,y:0,z:1},{x:0,y:.3,z:0},.3,100)>0);
});
test('world random seed is repeatable',()=>{
 const a=rng(123),b=rng(123);for(let i=0;i<100;i++)assert.equal(a(),b());
});
test('corrupt and incompatible checkpoint versions are rejected',()=>{
 assert.throws(()=>validateSnapshot(null));assert.throws(()=>validateSnapshot({version:99,mission:'cambrai'}));
});
