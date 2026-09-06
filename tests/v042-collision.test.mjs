import test from 'node:test';
import assert from 'node:assert/strict';
import {CollisionWorld, BODY_HEIGHT} from '../src/world/collision.js';
const ground={height:()=>0};
const box=(id,x,y,z,w,h,d,extra={})=>({id,x,y,z,w,h,d,...extra,min:{x:x-w/2,y:y-h/2,z:z-d/2},max:{x:x+w/2,y:y+h/2,z:z+d/2}});
const actor=(x=0,y=0,z=0)=>({id:'player',pos:{x,y,z},stance:'stand',yaw:0,vy:0,grounded:y===0,hp:100});
const rail=()=>box('rail',0,.34,0,.12,.14,6,{kind:'fence',walkableTop:false});

test('COL-01: falling onto an unwalkable rail never embeds the body',()=>{
 const c=new CollisionWorld(ground,[rail()]),a=actor(0,.55);a.vy=-1;
 for(let i=0;i<60;i++){c.move(a,0,0,1/60);assert.equal(c.overlaps(a.pos),false,`step ${i+1}`);}
 assert.equal(a.grounded,false,'a fence is not a jump platform');
 for(let i=0;i<60;i++)c.move(a,-3.1/60,0,1/60);
 assert.ok(a.pos.x<-.5);assert.equal(c.overlaps(a.pos),false);
});
test('COL-02: a shallow initial penetration recovers on the same side',()=>{
 const c=new CollisionWorld(ground,[rail()]),a=actor(-.28);assert.equal(c.overlaps(a.pos),true);
 for(let i=0;i<60;i++){c.move(a,-.01,0,1/60);assert.ok(a.pos.x<0);}
 assert.equal(c.overlaps(a.pos),false);assert.ok(a.pos.x<-.5);
});
for(const dt of [1/60,.05,.25])test(`vertical sweep stops at a thin beam with dt=${dt}`,()=>{
 const c=new CollisionWorld(ground,[box('beam',0,2,0,2,.025,2,{walkableTop:false})]),a=actor(0,3);a.vy=-40;
 c.move(a,0,0,dt);assert.ok(a.pos.y>=2.0125-.003);assert.equal(c.overlaps(a.pos),false);
});
test('an upward sweep cannot skip a thin roof',()=>{
 const c=new CollisionWorld(ground,[box('roof',0,2,0,4,.025,4,{walkableTop:false})]),a=actor();a.vy=30;
 c.move(a,0,0,.1);assert.ok(a.pos.y+BODY_HEIGHT.stand<=2-.0125+.003);
});
test('COL-03: prone endpoints also collide with actors',()=>{
 const c=new CollisionWorld(ground,[]),a=actor(),b=actor(0,0,1.08);a.stance='prone';b.id='npc';
 c.actors=[a,b];assert.equal(c.canStand(a.pos,'prone',0,a.id),false);
});
test('thin walls are not crossed by horizontal movement or by recovery',()=>{
 const c=new CollisionWorld(ground,[box('wall',0,1,0,.02,2,6,{walkableTop:false})]),a=actor(-1);
 for(let i=0;i<180;i++)c.move(a,.12,0,1/60);
 assert.ok(a.pos.x<-.28);assert.equal(c.overlaps(a.pos),false);
 for(let i=0;i<60;i++)c.move(a,-.02,0,1/60);
 assert.ok(a.pos.x<-1);
});
test('recovery cannot push an actor into a second neighbouring wall',()=>{
 const c=new CollisionWorld(ground,[rail(),box('back',-.67,1,0,.04,2,6)]),a=actor(-.28);
 for(let i=0;i<10;i++)c.move(a,0,-.04,1/60);
 // The slot is physically large enough for the unchanged standing footprint.
 assert.equal(c.overlaps(a.pos),false);assert.ok(a.pos.x<0);
});
test('prone endpoints and radius stay inside playable bounds',async()=>{
 const {MAP}=await import('../src/data/world-map.js');const c=new CollisionWorld({height:()=>0},[]);
 assert.equal(c.canStand({x:0,y:0,z:MAP.maxPlayZ-.5},'prone',0),false);
 assert.equal(c.canStand({x:0,y:0,z:MAP.maxPlayZ-1},'prone',0),true);
});
