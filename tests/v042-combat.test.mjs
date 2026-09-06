import test from 'node:test';
import assert from 'node:assert/strict';
import {CollisionWorld} from '../src/world/collision.js';
import {Player} from '../src/core/player.js';
import * as ballistics from '../src/combat/ballistics.js';
const terrain={height:()=>0,trenchDistance:()=>10};
const box=(id,min,max)=>({id,min,max,w:max.x-min.x,h:max.y-min.y,d:max.z-min.z,x:(min.x+max.x)/2,y:(min.y+max.y)/2,z:(min.z+max.z)/2,walkableTop:false});
function fixture(boxes=[]){const p=new Player(terrain);p.pos={x:0,y:0,z:0};p.yaw=0;return{player:p,terrain,collision:new CollisionWorld(terrain,boxes),actors:[p],npcs:[],grenades:[],nextId:1,stats:{playerShots:0},director:{phase:1},events:[],emit(type,data){this.events.push({type,...data});}};}
test('grenade start cannot cross thin wall and failed attempt keeps inventory',()=>{const w=fixture([box('wall',{x:-2,y:0,z:.35},{x:2,y:3,z:.37})]);w.player.update(w,1/60,{grenade:true});assert.equal(w.grenades.length,0);assert.equal(w.player.grenades,3);assert.equal(w.events.filter(e=>e.type==='grenade').length,0);});
test('legal grenade throw consumes one grenade and has a swept start',()=>{const w=fixture();w.player.update(w,1/60,{grenade:true});assert.equal(w.grenades.length,1);assert.equal(w.player.grenades,2);});
test('swept grenade volume respects an actor beside its centre ray',()=>{const w=fixture();w.npcs=[{id:'friend',faction:'uk',hp:100,stance:'stand',yaw:0,pos:{x:.2,y:0,z:.47}}];w.actors.push(...w.npcs);w.player.update(w,1/60,{grenade:true});assert.equal(w.grenades.length,0);});
test('prone turning does not rotate the body through a wall',()=>{const w=fixture([box('wall',{x:.38,y:0,z:-2},{x:.43,y:2,z:2})]);w.player.stance='prone';w.collision.actors=w.actors;w.player.update(w,1/60,{lookX:Math.PI/2});assert.equal(w.collision.canStand(w.player.pos,'prone',w.player.yaw,'player'),true);assert.ok(Math.abs(w.player.yaw)<.2);});
test('a crouched vault cannot force standing under a ceiling',()=>{const w=fixture([box('slab',{x:-.5,y:0,z:.6},{x:.5,y:.8,z:1.1}),box('roof',{x:-2,y:1.2,z:-2},{x:2,y:1.3,z:2})]);w.player.stance='crouch';w.player.update(w,1/60,{jump:true});assert.equal(w.player.stance,'crouch');assert.ok(w.player.pos.y<.01);});
test('suppression follows a long actual shot segment, not just its end',()=>{const n={id:'n',hp:100,faction:'de',pos:{x:.5,y:0,z:5},stance:'stand',suppression:0};assert.equal(typeof ballistics.suppressAlong,'function');ballistics.suppressAlong({npcs:[n],collision:{visible:()=>true}},{faction:'uk'},{x:0,y:1,z:0},{x:0,y:1,z:50});assert.ok(n.suppression>0);});
test('suppression does not reach behind a hit wall',()=>{const n={id:'n',hp:100,faction:'de',pos:{x:0,y:0,z:6},stance:'stand',suppression:0};const c=new CollisionWorld(terrain,[box('wall',{x:-4,y:0,z:5},{x:4,y:3,z:5.2})]);assert.equal(typeof ballistics.suppressAlong,'function');ballistics.suppressAlong({npcs:[n],collision:c},{faction:'uk'},{x:0,y:1,z:0},{x:0,y:1,z:5});assert.equal(n.suppression,0);});
test('grenade start inside an actor is blocked even when the short segment stays inside',()=>{
 const c=new CollisionWorld({height:()=>0},[]),a={id:'ally',hp:100,stance:'stand',yaw:0,pos:{x:0,y:0,z:0}};
 const hit=c.sweepSphere({x:0,y:1.24,z:0},{x:0,y:1.24,z:.02},.09,[a]);assert.equal(hit?.distance,0);
});
