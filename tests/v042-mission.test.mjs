import test from 'node:test';
import assert from 'node:assert/strict';
import {createFieldGun,updateFieldGun} from '../src/vehicles/field-gun.js';
import {Director} from '../src/missions/director.js';
const scenario=()=>{
 const crew={id:'crew',hp:100,pos:{x:20,y:0,z:100}};
 const g=createFieldGun({id:'gun',crewIds:['crew'],x:0,z:100,yaw:Math.PI,faction:'de'},{height:()=>0});g.reloadLeft=0;
 const w={npcs:[crew],tanks:[{id:'tank',state:'moving',pos:{x:0,y:0,z:80}}],director:new Director(),time:1,nextId:100,stats:{fieldGunShots:0},shells:[],grenades:[],air:{bombs:[]},random:()=>.5,collision:{ray:()=>null},player:{hp:100,pos:{x:0,y:0,z:90},health:{delay:0}},events:[],emit(type,data){this.events.push({type,...data});}};
 w.director.phase=4;w.fieldGuns=[g];return{w,g,crew};
};
test('MIS-01: a temporarily unmanned gun does not complete the artillery objective',()=>{
 const {w,g}=scenario();updateFieldGun(w,g,1/60);w.director.update(w,1/60);assert.equal(w.director.phase,4);
});
test('MIS-01: living crew returns to a consistent operational gun',()=>{
 const {w,g,crew}=scenario();updateFieldGun(w,g,1/60);crew.pos.x=0;updateFieldGun(w,g,1/60);
 assert.equal(w.shells.length,1);assert.equal(g.operational,true);
});
test('MIS-02: a dead player cannot complete the final defence',()=>{
 const {w}=scenario();w.player.hp=0;w.player.pos={x:4,y:0,z:159};w.director.phase=6;w.director.hold=54.999;w.npcs=[];
 w.director.update(w,.05);assert.equal(w.director.phase,6);assert.equal(w.events.some(e=>e.type==='complete'),false);
});
test('permanent disabled breech cannot be revived by returning crew',()=>{const {w,g,crew}=scenario();g.disabled=true;crew.pos.x=0;updateFieldGun(w,g,1/60);assert.equal(w.shells.length,0);assert.equal(g.operational,false);});
test('a nearby wall must block the objective prompt and its action identically',async()=>{const {Simulation}=await import('../src/core/simulation.js');const w=new Simulation();w.director.phase=5;w.player.pos={x:4,y:w.terrain.height(4,153),z:153};const prompt=w.interaction();const before=w.director.phase;const used=w.director.interact(w);assert.equal(Boolean(prompt),Boolean(used));assert.equal(w.director.phase,before);});
