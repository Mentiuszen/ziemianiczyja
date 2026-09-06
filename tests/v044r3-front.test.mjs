import test from 'node:test';import assert from 'node:assert/strict';import {campaignFrame} from '../src/data/campaign-map.js';
const module=await import('../src/ui/front-transition.js').catch(()=>({}));
const model=()=>{assert.equal(typeof module.FrontTransition,'function','front transitions must have a testable animation model');return new module.FrontTransition('cambrai');};
const close=(a,b)=>{assert.equal(a.length,b.length);a.forEach((p,i)=>p.forEach((v,k)=>assert.ok(Math.abs(v-b[i][k])<1e-7)));};
test('front geometry does not jump when selecting another mission and reaches the exact endpoint',()=>{
 const m=model(),initial=m.sample();m.select('amiens');close(m.sample().front,initial.front);assert.equal(m.sample().done,false);m.advance(.45);const middle=m.sample();assert.notDeepEqual(middle.front,initial.front);assert.notDeepEqual(middle.front,campaignFrame('amiens').front);assert.ok(middle.arrows.cambrai>0&&middle.arrows.amiens>0);m.advance(1);assert.deepEqual(m.sample().front,campaignFrame('amiens').front);assert.equal(m.sample().done,true);
});
test('rapid retargeting starts at the displayed geometry and current arrow opacities',()=>{
 const m=model();m.select('amiens');m.advance(.4);const displayed=m.sample();m.select('somme');close(m.sample().front,displayed.front);assert.deepEqual(m.sample().arrows,displayed.arrows);m.advance(2);assert.deepEqual(m.sample().front,campaignFrame('somme').front);
});
test('reduced motion and skip settle without callbacks or fake intermediate dates',()=>{
 const m=model();m.select('ypres');m.advance(.1);m.finish();assert.deepEqual(m.sample().front,campaignFrame('ypres').front);assert.equal(m.sample().done,true);m.select('flers',true);assert.deepEqual(m.sample().front,campaignFrame('flers').front);assert.equal(m.sample().done,true);
});
test('repeat selection, paused time and invalid ids cannot restart or corrupt a transition',()=>{
 const m=model();m.select('somme');m.advance(.3);const at=m.sample();m.select('somme');m.advance(0);assert.deepEqual(m.sample(),at);assert.throws(()=>m.select('constructor'));assert.deepEqual(m.sample(),at);
});
