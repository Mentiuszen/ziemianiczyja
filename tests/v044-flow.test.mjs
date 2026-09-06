import test from 'node:test';import assert from 'node:assert/strict';
import {Application} from '../src/app.js';import {MenuNavigation} from '../src/ui/navigation.js';import {DEFAULT_SETTINGS} from '../src/save/store.js';
const fixture=()=>{const a=Object.assign(Object.create(Application.prototype),{state:'main',alive:true,loadGeneration:0,actionSequence:0,checkpointState:'ready',checkpoint:{known:true},campaignProgress:{status:'in-progress'},navigation:new MenuNavigation(),settings:{...DEFAULT_SETTINGS,language:'en',keys:{...DEFAULT_SETTINGS.keys}},ui:{optionsTab:'gameplay',render(){},openCampaign(){},closeModal(){},showModal(m){this.modal=m;}},input:{capture:null},audio:{setSettings(){}},store:{saveSettings(){}},go(state){this.state=state;},world:null});a.start=()=>{throw Error('preview must not start a world');};return a;};
test('new campaign preview and options roundtrip leave the checkpoint intact',async()=>{const a=fixture(),cp=a.checkpoint;await a.action('campaign-new');assert.equal(a.state,'campaign');assert.equal(a.campaignIntent,'new');await a.action('settings');assert.equal(a.state,'settings');await a.action('back');assert.equal(a.state,'campaign');assert.equal(a.checkpoint,cp);});
test('Continue with no checkpoint cannot silently call start(null)',async()=>{const a=fixture();a.checkpoint=null;a.checkpointState='none';await a.action('campaign-continue');await a.action('campaign-resume');assert.equal(a.state,'main');});
test('reset of a category requires confirmation and preserves other categories',async()=>{const a=fixture();a.state='settings';a.settings.language='en';a.settings.fov=99;a.settings.master=.1;a.ui.optionsTab='graphics';await a.action('category-reset');assert.equal(a.settings.fov,99);assert.equal(a.ui.modal.kind,'reset');await a.action('confirm-modal');assert.equal(a.settings.fov,78);assert.equal(a.settings.master,.1);assert.equal(a.settings.language,'en');});
test('new start requests confirmation, default action cannot overwrite merely by opening map',async()=>{const a=fixture();a.state='campaign';a.campaignIntent='new';a.campaignSelection='cambrai';await a.action('campaign-start');assert.equal(a.ui.modal.kind,'new-campaign');assert.equal(a.checkpoint.known,true);});
test('late superseded autosave cannot replace the newer accepted campaign pair in the app',async()=>{
 const {readFileSync}=await import('node:fs');const {createProgress}=await import('../src/save/campaign.js');
 const old=JSON.parse(readFileSync(new URL('fixtures/v041-checkpoint.json',import.meta.url),'utf8'));
 const newer=structuredClone(old);newer.time+=1;const progress=createProgress(newer,'test-newer');
 const a=fixture();let resolve;const delayed=new Promise(r=>{resolve=r;});
 a.checkpoint=old;a.campaignProgress=createProgress(old,'test-older');a.audio.event=()=>{};a.ui.event=()=>{};a.ui.toast=()=>{};
 a.world={player:{hp:100},director:{},canCheckpoint:()=>true,snapshot:()=>old,consumeEvents:()=>[{type:'checkpoint'}]};
 a.store.saveCampaign=()=>delayed;a.events();
 a.store.memory=newer;a.store.progress=progress;a.store.sessionOnly=false;
 a.checkpoint=newer;a.campaignProgress=progress;resolve(false);await delayed;await Promise.resolve();
 assert.equal(a.checkpoint.time,newer.time);assert.equal(a.campaignProgress.runId,'test-newer');
});
