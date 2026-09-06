import test from 'node:test';
import assert from 'node:assert/strict';
import {Application} from '../src/app.js';
import {DEFAULT_SETTINGS} from '../src/save/store.js';
import {getLanguage,setLanguage,message,text} from '../src/i18n/index.js';
import {Simulation} from '../src/core/simulation.js';
const defer=()=>{let resolve;return{promise:new Promise(r=>{resolve=r;}),resolve:v=>resolve(v)};};
const flush=async()=>{for(let i=0;i<8;i++)await Promise.resolve();};
function fixture(t){
 const old=globalThis.document;globalThis.document={documentElement:{lang:'en'},querySelector:()=>null};t.after(()=>{if(old===undefined)delete globalThis.document;else globalThis.document=old;setLanguage('pl');});
 const calls={saved:[],states:[],rendered:[],toasts:[],loads:0,refreshes:0};
 const a=Object.assign(Object.create(Application.prototype),{state:'language-select',alive:true,loadGeneration:0,actionSequence:0,checkpointLoadStarted:false,settings:{...DEFAULT_SETTINGS,keys:{...DEFAULT_SETTINGS.keys}},world:null,view:null,storageWarning:'',checkpoint:null,
  ui:{optionsTab:'graphics',showModal(m){this.modal=m;},closeModal(){this.modal=null;},render(s){calls.rendered.push(s);},refreshLanguage(){calls.refreshes++;},toast(v){calls.toasts.push(v);}},input:{},audio:{setSettings(){}},go(s){this.state=s;calls.states.push(s);},
  store:{saveSettings(s){calls.saved.push(structuredClone(s));return true;},async loadCampaign(){calls.loads++;return{checkpoint:null,progress:null,checkpointState:'none'};}}
 });return{a,calls};
}
test('first selection persists once and opens only the selected main menu, without runtime loading',async t=>{
 const {a,calls}=fixture(t);a.loadRuntime=()=>{throw Error('must stay lazy');};assert.equal(a.selectLanguage('en'),true);await flush();
 assert.equal(a.state,'main');assert.equal(a.settings.language,'en');assert.equal(getLanguage(),'en');assert.equal(document.documentElement.lang,'en');assert.equal(calls.loads,1);assert.deepEqual(calls.states,['main']);assert.equal(a.world,null);assert.equal(a.view,null);assert.equal(calls.saved[0].language,'en');
 a.loadCheckpoint();assert.equal(calls.loads,1);
});
test('invalid or inherited language names cannot bypass the first-run gate',async t=>{
 const {a,calls}=fixture(t);for(const language of ['fr','constructor','__proto__',null,{},'EN'])assert.equal(a.selectLanguage(language),false);
 await a.action('start');await a.action('back');assert.equal(a.state,'language-select');assert.equal(calls.saved.length,0);assert.equal(calls.loads,0);
});
test('blocked persistence still enters main and retains the choice for the session',async t=>{
 const {a,calls}=fixture(t);a.store.saveSettings=()=>{a.storageWarning=message('storage.settingsFailed');return false;};
 assert.equal(a.selectLanguage('en'),true);await flush();assert.equal(a.state,'main');assert.equal(a.settings.language,'en');assert.equal(calls.loads,1);assert.match(text(calls.toasts[0]),/settings/i);
});
test('a delayed checkpoint result does not replace an options screen or start a mission',async t=>{
 const {a,calls}=fixture(t),pending=defer();a.store.loadCampaign=()=>pending.promise;a.selectLanguage('pl');a.state='settings';
 pending.resolve({checkpoint:{director:{lastCheckpoint:'checkpoint.bennett'}},checkpointState:'ready'});await flush();assert.equal(a.state,'settings');assert.equal(calls.rendered.length,0);assert.equal(a.world,null);assert.ok(a.checkpoint);
});
test('a delayed boot checkpoint cannot overwrite a newer mission checkpoint',async t=>{
 const {a}=fixture(t),pending=defer();a.store.loadCampaign=()=>pending.promise;a.selectLanguage('en');a.loadGeneration++;a.checkpoint={current:true};
 pending.resolve({checkpoint:{stale:true},checkpointState:'ready'});await flush();assert.deepEqual(a.checkpoint,{current:true});
});
test('paused language changes preserve the exact world, checkpoint, input and audio objects',t=>{
 const {a,calls}=fixture(t);a.state='settings';a.returnState='paused';a.settings.language='pl';a.world=new Simulation();a.checkpoint=structuredClone(a.world.snapshot());a.view={};const {world,view,input,audio,checkpoint}=a,before=world.snapshot();
 a.audio.resume=()=>{throw Error('no audio resume');};a.start=()=>{throw Error('no mission restart');};a.store.invalidatePending=()=>{throw Error('no save invalidation');};
 a.changeSetting('language','en');assert.equal(a.state,'settings');assert.equal(a.world,world);assert.equal(a.view,view);assert.equal(a.input,input);assert.equal(a.audio,audio);assert.equal(a.checkpoint,checkpoint);assert.deepEqual(world.snapshot(),before);assert.equal(calls.refreshes,1);assert.equal(calls.loads,0);
});
test('restore default settings keeps the selected language and key bindings',async t=>{
 const {a,calls}=fixture(t);a.state='settings';a.settings.language='en';a.settings.fov=99;a.settings.keys.interact='KeyF';setLanguage('en');
 await a.action('category-reset');await a.action('confirm-modal');assert.equal(a.settings.language,'en');assert.equal(getLanguage(),'en');assert.equal(a.settings.keys.interact,'KeyF');assert.equal(a.settings.fov,DEFAULT_SETTINGS.fov);assert.equal(calls.saved.at(-1).language,'en');
});
test('queued load errors retain descriptors and resolve in the later selected language',async t=>{
 const {a,calls}=fixture(t);a.store.loadCampaign=async()=>{throw Error('foreign message');};a.selectLanguage('pl');await flush();
 assert.equal(calls.toasts[0].key,'error.bootSave');a.state='settings';a.selectLanguage('en');assert.match(text(calls.toasts[0]),/You can safely start a new mission/);assert.doesNotMatch(text(calls.toasts[0]),/foreign message/);
});
