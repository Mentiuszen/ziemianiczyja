import test from 'node:test';import assert from 'node:assert/strict';
import {CollisionWorld} from '../src/world/collision.js';
const ground={height:()=>0};
const box=(id,x,y,z,w,h,d,extra={})=>({id,x,y,z,w,h,d,...extra,min:{x:x-w/2,y:y-h/2,z:z-d/2},max:{x:x+w/2,y:y+h/2,z:z+d/2}});
const actor=(x=-1,z=0)=>({id:'p',pos:{x,y:0,z},stance:'stand',yaw:0,vy:0,grounded:true,hp:100});
test('a low fence rail is not a walkable step even at diagonal approach',()=>{for(const slope of [-.7,0,.4,1]){const c=new CollisionWorld(ground,[box('rail',0,.34,0,.12,.14,6,{kind:'fence',walkableTop:false})]);const a=actor(-.7,slope);let max=0;for(let i=0;i<50;i++){c.move(a,.04,.01*slope,1/60);max=Math.max(max,a.pos.y);}assert.ok(max<.02,`rail lifted player to ${max}`);assert.ok(a.pos.x<0);}});
test('wide low platforms remain walkable without a jump',()=>{const c=new CollisionWorld(ground,[box('slab',0,.09,0,2,.18,3,{walkableTop:true})]);const a=actor(-1.5);for(let i=0;i<50;i++)c.move(a,.04,0,1/60);assert.ok(a.pos.x>0);assert.ok(Math.abs(a.pos.y-.18)<.02);});
test('step-up respects overhead headroom',()=>{const c=new CollisionWorld(ground,[box('slab',0,.12,0,2,.24,3,{walkableTop:true}),box('ceiling',0,1.90,0,2,.25,3,{walkableTop:false})]);const a=actor(-1.5);for(let i=0;i<50;i++)c.move(a,.04,0,1/60);assert.ok(a.pos.x<-1);assert.ok(a.pos.y<.02);});
test('airborne horizontal movement cannot trigger automatic upward stepping',()=>{const c=new CollisionWorld(ground,[box('slab',0,.21,0,2,.42,3,{walkableTop:true})]);const a=actor(-1.35);a.pos.y=.20;a.grounded=false;a.vy=-1;c.move(a,.15,0,1/60);assert.ok(a.pos.y<.21);});
