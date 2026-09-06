import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Application} from '../src/app.js';
const snapshot=()=>JSON.parse(readFileSync(new URL('./fixtures/v041-checkpoint.json',import.meta.url),'utf8'));
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return{promise,resolve,reject};};
const flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
function fixture(){
 const views=[];class World{constructor(){this.data=snapshot();this.player={hp:100};}snapshot(){return this.data;}}
 class View{constructor(){views.push(this);}async load(){}dispose(){this.disposed=true;}event(){}}
 const app=Object.assign(Object.create(Application.prototype),{alive:true,loadGeneration:0,enterSequence:0,enterPending:false,actionSequence:0,state:'main',world:null,view:null,checkpoint:null,settings:{difficulty:'soldier'},input:{setActive(){}},audio:{stop(){},event(){}},canvas:{style:{}},clock:{reset(){}},ui:{progress(){},event(){},toast(){},message:''},store:{invalidatePending(){},async saveCampaign(){return true;},completed(){throw Error('unexpected completion');}},go(state){this.state=state;},loadRuntime:async()=>[{Simulation:World},{GameView:View}]});return{app,views,World,View};
}
test('LIF-01: late initial save does not bring back a mission after exit',async()=>{const {app,views}=fixture(),gate=deferred();app.store.saveCampaign=()=>gate.promise;const pending=app.start();await flush();assert.equal(app.state,'loading');assert.ok(app.world);app.disposeMission();app.go('main');gate.resolve(true);await pending;assert.equal(app.state,'main');assert.equal(app.world,null);assert.ok(views[0].disposed);});
test('a late old save does not replace the newer mission or clear its state',async()=>{const {app,views}=fixture(),gate=deferred();let writes=0;app.store.saveCampaign=()=>++writes===1?gate.promise:Promise.resolve(true);const first=app.start();await flush();const firstWorld=app.world;await app.start();const nextWorld=app.world;assert.notEqual(firstWorld,nextWorld);gate.resolve(true);await first;assert.equal(app.state,'ready');assert.equal(app.world,nextWorld);assert.ok(views[0].disposed);assert.ok(!views[1].disposed);});
test('an import that finishes after exit never constructs the old world/view',async()=>{const {app,views,World,View}=fixture(),gate=deferred();app.loadRuntime=()=>gate.promise;const pending=app.start();app.disposeMission();app.go('main');gate.resolve([{Simulation:World},{GameView:View}]);await pending;assert.equal(views.length,0);assert.equal(app.state,'main');});
test('failure during model loading immediately disposes the owned scene',async t=>{t.mock.method(console,'error',()=>{});const {app,views,World,View}=fixture();class BrokenView extends View{async load(){throw Error('bad asset');}}app.loadRuntime=async()=>[{Simulation:World},{GameView:BrokenView}];await app.start();assert.equal(app.state,'error');assert.equal(app.world,null);assert.equal(app.view,null);assert.ok(views[0].disposed);});
test('the deadline also covers a pending initial database write',async t=>{t.mock.method(console,'error',()=>{});let expire;t.mock.method(globalThis,'setTimeout',(callback,delay)=>{assert.equal(delay,45000);expire=callback;return 1;});t.mock.method(globalThis,'clearTimeout',()=>{});const {app,views}=fixture(),gate=deferred();app.store.saveCampaign=()=>gate.promise;const pending=app.start();await flush();assert.equal(app.state,'loading');expire();await pending;assert.equal(app.state,'error');assert.equal(app.world,null);assert.ok(views[0].disposed);gate.resolve(true);await flush();assert.equal(app.state,'error');});
test('same-tick death wins over completion regardless of event order',()=>{for(const batch of [[{type:'complete'},{type:'dead'}],[{type:'dead'},{type:'complete'}]]){const {app}=fixture();let completed=false;app.store.completed=()=>{completed=true;};const seen=[];app.ui.event=e=>seen.push(e.type);app.world={player:{hp:0},consumeEvents:()=>batch};app.events();assert.equal(app.state,'dead');assert.equal(completed,false);assert.ok(!seen.includes('complete'));}});
test('a late checkpoint write cannot toast in a different mission',async()=>{const {app}=fixture(),gate=deferred();let toasts=0;app.ui.toast=()=>toasts++;app.store.saveCampaign=()=>gate.promise;app.world={player:{hp:100},director:{},canCheckpoint:()=>true,snapshot,consumeEvents:()=>[{type:'checkpoint'}]};app.events();app.disposeMission();app.go('main');gate.resolve(true);await flush();assert.equal(toasts,0);});
test('late pointer-lock error cannot pause a newer session with a valid lock',()=>{
 const {app}=fixture();app.state='playing';let paused=false;app.pause=()=>{paused=true;};
 const previous=globalThis.document;globalThis.document={pointerLockElement:app.canvas};
 try{app.lockError();assert.equal(paused,false);}finally{if(previous===undefined)delete globalThis.document;else globalThis.document=previous;}
});
test('failed new campaign loading preserves the previously accepted checkpoint and metadata',async t=>{
 t.mock.method(console,'error',()=>{});const {app,World,View}=fixture();const previous=snapshot(),progress={runId:'old'};app.checkpoint=previous;app.campaignProgress=progress;
 class BrokenView extends View{async load(){throw Error('missing asset');}}app.loadRuntime=async()=>[{Simulation:World},{GameView:BrokenView}];await app.start();assert.equal(app.state,'error');assert.equal(app.checkpoint,previous);assert.equal(app.campaignProgress,progress);
});
