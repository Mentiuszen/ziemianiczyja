import test from 'node:test';
import assert from 'node:assert/strict';
import {Navigation} from '../src/ai/navigation.js';
const bare=()=>{const n=Object.create(Navigation.prototype);n.requests=[];n.cover=[];n.coverOwners=new Map();n.path=(_from,to)=>[{...to}];return n;};
const soldier=()=>({id:'n',hp:100,pos:{x:0,y:0,z:0},path:[],pathPending:false,stateTime:0});
test('AI-02: the latest destination replaces the queued old order',()=>{
 const nav=bare(),n=soldier();nav.request(n,{x:10,y:0,z:0});nav.request(n,{x:-10,y:0,z:0});nav.process();
 assert.equal(n.pathTarget.x,-10);assert.equal(n.path[0].x,-10);
});
test('coalescing does not grow the queue per repeated intent',()=>{
 const nav=bare(),n=soldier();for(let i=0;i<100;i++)nav.request(n,{x:10+i,y:0,z:0});
 assert.equal(nav.requests.length,1);nav.process();assert.equal(n.pathTarget.x,109);
});
test('cancelling a queued path prevents its return',()=>{const nav=Object.create(Navigation.prototype);nav.requests=[];nav.cover=[];nav.coverOwners=new Map();nav.path=()=>[{x:20,y:0,z:0}];const actor={id:'a',hp:100,pos:{x:0,y:0,z:0},path:[]};nav.request(actor,{x:20,y:0,z:0});assert.equal(typeof nav.cancel,'function');nav.cancel(actor);nav.process();assert.equal(actor.path.length,0);assert.equal(actor.pathPending,false);});
test('cover release clears both ends, arrival need not release ownership',()=>{const nav=Object.create(Navigation.prototype);nav.requests=[];nav.cover=[{id:'c',owner:null,pos:{x:0,y:0,z:0}}];nav.coverOwners=new Map();const actor={id:'a',coverId:null};assert.equal(typeof nav.reserveCover,'function');assert.equal(nav.reserveCover(actor,nav.cover[0]),true);assert.equal(actor.coverId,'c');assert.equal(nav.cover[0].owner,'a');nav.releaseCover(actor.id);assert.equal(actor.coverId,null);assert.equal(nav.cover[0].owner,null);});
