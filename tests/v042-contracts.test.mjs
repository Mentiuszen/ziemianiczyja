import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/core/simulation.js';
import {validateSnapshot} from '../src/save/schema.js';
import {CollisionWorld} from '../src/world/collision.js';
import {Weapon} from '../src/combat/weapon.js';

// Snapshot and restore use the real mission; no mock navigation queue is serialized.
test('latest pending movement intent is reconstructed after a checkpoint',()=>{
 const s=new Simulation(),n=s.npcs[0];s.nav.request(n,{x:6,y:0,z:43},'move');s.nav.request(n,{x:9,y:0,z:35},'evade');
 const r=new Simulation(s.snapshot()),copy=r.npcs.find(a=>a.id===n.id);
 assert.equal(r.nav.requests.filter(j=>j.actor.id===n.id).length,1);assert.equal(copy.moveReason,'evade');
 assert.deepEqual(copy.moveGoal,{x:9,y:0,z:35});
});
test('cover ownership survives arrival and is not resurrected after release and load',()=>{
 const s=new Simulation(),n=s.npcs[0],cover=s.nav.cover[0];s.nav.reserveCover(n,cover);s.nav.cancel(n,{releaseCover:false});
 const r=new Simulation(s.snapshot());assert.equal(r.npcs[0].coverId,cover.id);assert.equal(r.nav.cover[0].owner,n.id);
 r.nav.releaseCover(r.npcs[0]);const again=new Simulation(r.snapshot());assert.equal(again.npcs[0].coverId,null);assert.equal(again.nav.cover[0].owner,null);
});
function checkpointWorld(wall=false){
 const p={id:'player',hp:100,faction:'uk',pos:{x:0,y:0,z:0},stance:'stand',yaw:0,vy:0};
 const n={id:'enemy',hp:100,faction:'de',pos:{x:0,y:0,z:10},stance:'stand',yaw:Math.PI,weapon:new Weapon('gewehr')};
 const collision=new CollisionWorld({height:()=>0},wall?[{id:'cover',min:{x:-2,y:0,z:4},max:{x:2,y:3,z:5}}]:[]);
 collision.actors=[p,n];return{player:p,npcs:[n],actors:[p,n],collision,grenades:[],shells:[],air:{bombs:[]}};
}
test('safe checkpoint rejects a real incoming line of fire and accepts the same line behind cover',()=>{
 assert.equal(Simulation.prototype.canCheckpoint.call(checkpointWorld()),false);
 assert.equal(Simulation.prototype.canCheckpoint.call(checkpointWorld(true)),true);
});
test('safe checkpoint rejects incomplete regeneration and airborne positions',()=>{
 const w=checkpointWorld(true);w.player.hp=99;assert.equal(Simulation.prototype.canCheckpoint.call(w),false);
 w.player.hp=100;w.player.pos.y=2;w.player.vy=-1;assert.equal(Simulation.prototype.canCheckpoint.call(w),false);
});
test('ordinary simulated combat produces snapshots accepted by the full validator',()=>{
 const s=new Simulation();s.director.skipBriefing(s);let validated=0;
 for(let i=0;i<15*60;i++){
  s.tick(1/60,{});
  if(i%60===0&&!s.grenades.length&&!s.shells.length&&!s.air.bombs.length){validateSnapshot(s.snapshot());validated++;}
 }
 assert.ok(validated>=10);
});
