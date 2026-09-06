import test from 'node:test';
import assert from 'node:assert/strict';
import {createTank,tankBounds,updateTank} from '../src/vehicles/tank.js';
import {CollisionWorld} from '../src/world/collision.js';
const terrain={height:()=>0};
function fixture(boxes=[],actors=[]){const tank=createTank({id:'tank-1',faction:'uk',x:0,z:0,route:[{x:20,z:0}]},terrain);tank.gunWorking=false;const collision=new CollisionWorld(terrain,boxes);const w={terrain,collision,actors,npcs:[],tanks:[tank],layout:boxes,destroyedObstacles:[],director:{phase:1,events:[]},stats:{},emit(){},breakObstacle(){}};collision.dynamic=[tankBounds(tank)];return {w,tank};}
test('turning tank does not sweep its side through an adjacent actor',()=>{const actor={id:'player',hp:100,stance:'stand',yaw:0,pos:{x:2.12,y:0,z:3.3}};const {w,tank}=fixture([],[actor]);assert.equal(w.collision.overlaps(actor.pos),false);updateTank(w,tank,.05);w.collision.dynamic=[tankBounds(tank)];assert.equal(w.collision.overlaps(actor.pos),false);});
test('turning tank checks the rear corner against solid geometry',()=>{const wall={id:'wall',min:{x:-1.9,y:0,z:-3.65},max:{x:-1.82,y:2,z:-3.5}};const {w,tank}=fixture([wall]);updateTank(w,tank,.05);const b=tankBounds(tank);assert.equal(tank.yaw,0);assert.equal(tank.moving,false);});
test('unobstructed movement retains tank speed and track progress',()=>{const {w,tank}=fixture();tank.route=[{x:0,z:20}];updateTank(w,tank,.05);assert.ok(Math.abs(tank.pos.z-.07)<1e-6);assert.ok(Math.abs(tank.trackPhase-.07)<1e-6);assert.equal(tank.moving,true);});
test('a rotated tank broadphase corner is not an invisible body wall',()=>{const {w,tank}=fixture();tank.yaw=Math.PI/4;w.collision.dynamic=[tankBounds(tank)];assert.equal(w.collision.overlaps({x:-3.4,y:0,z:3.4}),false);assert.equal(w.collision.ray({x:-3.4,y:1,z:3.4},{x:0,y:1,z:0},1),null);});
