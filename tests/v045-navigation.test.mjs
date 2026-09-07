import test from 'node:test';import assert from 'node:assert/strict';import {Simulation} from '../src/core/simulation.js';
test('v045: incremental A* respects expansion budget and returns the synchronous route',()=>{
 const w=new Simulation(),nav=w.nav,a=w.npcs.find(n=>n.hp>0),target={x:23,y:0,z:62};
 assert.equal(typeof nav.processBudget,'function');const expected=nav.path(a.pos,target);nav.request(a,target);let slices=0;
 while(a.pathPending&&slices++<5000){nav.processBudget(8);assert.ok(nav.metrics.sliceVisits<=8);}
 assert.ok(slices<5000);assert.deepEqual(a.path,expected);
});
test('v045: replaced or cancelled in-flight job never commits a stale path',()=>{
 const w=new Simulation(),nav=w.nav,a=w.npcs[0];assert.equal(typeof nav.processBudget,'function');
 nav.request(a,{x:4,y:0,z:160});nav.processBudget(1);nav.request(a,{x:33,y:0,z:0});
 for(let i=0;i<1000&&a.pathPending;i++)nav.processBudget(16);
 assert.equal(a.pathTarget.z,0);nav.request(a,{x:4,y:0,z:160});nav.processBudget(1);nav.cancel(a);nav.processBudget(32);
 assert.equal(a.pathPending,false);assert.deepEqual(a.path,[]);
});
test('v045: urgent evade can preempt an unfinished normal request',()=>{
 const w=new Simulation(),nav=w.nav,a=w.npcs[0],b=w.npcs[1];assert.equal(typeof nav.processBudget,'function');
 nav.request(a,{x:4,y:0,z:160},'move');nav.processBudget(1);nav.request(b,{x:23,y:0,z:62},'evade');nav.processBudget(1);
 assert.ok(nav.activeJob?.actor.id===b.id||!b.pathPending);nav.cancel(b);nav.processBudget(1);assert.ok(!nav.activeJob||nav.activeJob.actor.id!==b.id);
});
test('v045: cold graph expansion costs more of the slice than cached edges',()=>{
 const w=new Simulation(),nav=w.nav,a=w.npcs[0];nav.request(a,{x:4,y:0,z:160});nav.processBudget(32);
 assert.ok(Number.isFinite(nav.metrics.sliceColdNodes));assert.ok(nav.metrics.sliceColdNodes<=4,nav.metrics.sliceColdNodes);
});
test('v045: opening one wire segment retains far-away static graph edges',()=>{
 const w=new Simulation(),nav=w.nav,box=w.layout.find(b=>b.breakable),far=nav.nodes.find(n=>n.valid&&Math.abs(n.pos.z-box.z)>20);
 const cached=nav.edges(far);nav.invalidate(box);assert.equal(far.edges,cached);
});
