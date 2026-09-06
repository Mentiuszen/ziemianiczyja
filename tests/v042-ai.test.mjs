import test from 'node:test';
import assert from 'node:assert/strict';
import {createSoldier,updateSoldier} from '../src/ai/soldier.js';
import {Navigation} from '../src/ai/navigation.js';
import {CollisionWorld} from '../src/world/collision.js';
import {DIFFICULTIES} from '../src/data/weapons.js';
const terrain={height:()=>0};
function fixture(weapon='mg08'){
 const player={id:'player',hp:100,faction:'uk',stance:'stand',yaw:0,pitch:0,pos:{x:0,y:0,z:20},moveIntent:false};
 const n=createSoldier({id:'de-1',x:0,z:0,yaw:0,faction:'de',weapon,fixed:true},terrain,()=>.5);n.think=0;n.grenades=0;
 const nav=Object.create(Navigation.prototype);Object.assign(nav,{requests:[],cover:[],coverOwners:new Map(),path:(_a,b)=>[{...b}]});
 const w={time:0,player,npcs:[n],actors:[player,n],tanks:[],terrain,collision:new CollisionWorld(terrain,[]),nav,grenades:[],noises:[],difficulty:DIFFICULTIES.soldier,director:{phase:1},stats:{germanShots:0,reloads:0,replans:0},random:()=>.5,events:[],emit(type,data){this.events.push({time:this.time,type,...data});},damage(){}};w.collision.actors=w.actors;return {w,n};
}
function ticks(w,n,count){for(let i=0;i<count;i++){w.time+=1/60;updateSoldier(w,n,1/60);}}
test('MG attacking the player has a real burst gap',()=>{const {w,n}=fixture();ticks(w,n,240);const times=w.events.filter(e=>e.type==='shot').map(e=>e.time);assert.ok(times.length>=5);assert.ok(times.some((t,i)=>i&&t-times[i-1]>=.79),'no pause in a player-target burst');});
test('short loss of sight does not reset recognition and reaction',()=>{const {w,n}=fixture('gewehr');ticks(w,n,1);const ready=n.reaction;assert.equal(n.targetId,'player');w.collision.visible=()=>false;n.think=0;ticks(w,n,1);assert.equal(n.targetId,'player');assert.deepEqual(n.lastKnown,{x:0,y:0,z:20});w.player.pos.x=10;w.collision.visible=()=>true;n.think=0;ticks(w,n,1);assert.equal(n.reaction,ready);});
test('the sixth visible candidate is not starved by five hidden nearer actors',()=>{const {w,n}=fixture();const hidden=Array.from({length:5},(_,i)=>({id:`uk-${i}`,hp:100,faction:'uk',stance:'stand',pos:{x:0,y:0,z:8+i}}));w.actors=[...hidden,w.player,n];w.collision.visible=(_from,to)=>to.z>=19;for(let i=0;i<3;i++){n.think=0;ticks(w,n,1);}assert.equal(n.targetId,'player');});
test('friendly firing blocker still integrates actor physics exactly once',()=>{const {w,n}=fixture();const ally={id:'de-2',hp:100,faction:'de',stance:'stand',pos:{x:0,y:0,z:1}};w.actors.push(ally);w.collision.actors=w.actors;n.think=10;n.state='aim';n.visibleId='player';n.targetId='player';n.reaction=0;let calls=0;const move=w.collision.move.bind(w.collision);w.collision.move=(...args)=>{calls++;return move(...args);};ticks(w,n,1);assert.equal(calls,1);});
test('an allied actor yielding at a waypoint integrates physics once',()=>{const {w,n}=fixture();n.faction='uk';n.fixed=false;n.state='move';n.think=10;n.path=[{...n.pos}];n.pathIndex=0;w.player.pos={x:0,y:0,z:-.8};w.player.moveIntent=true;let calls=0;const move=w.collision.move.bind(w.collision);w.collision.move=(...args)=>{calls++;return move(...args);};ticks(w,n,1);assert.equal(calls,1);assert.ok(n.pos.x!==0||n.pos.z!==0,'ally did not yield');});
test('NPC aims at a visible torso rather than automatically at eye height',()=>{const {w,n}=fixture('gewehr');ticks(w,n,120);const shot=w.events.find(e=>e.type==='shot');assert.ok(shot);assert.ok(shot.to.y<1.45,`target height ${shot.to.y}`);});
