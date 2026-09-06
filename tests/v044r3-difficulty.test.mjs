import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {Application} from '../src/app.js';import {Store,DEFAULT_SETTINGS} from '../src/save/store.js';
import {createProgress,validateProgress} from '../src/save/campaign.js';
import {settingsScreen} from '../src/ui/screens/settings.js';import {campaignPanel} from '../src/ui/screens/campaign.js';
import {buildCampaignViewModel} from '../src/ui/campaign-model.js';
import {OPTIONS_TABS,SETTINGS_SCHEMA,resetCategory} from '../src/save/settings-schema.js';
import {Simulation} from '../src/core/simulation.js';import {DIFFICULTIES} from '../src/data/weapons.js';
const checkpoint=()=>JSON.parse(readFileSync(new URL('./fixtures/v041-checkpoint.json',import.meta.url)));
function fixture(){
 const cp=checkpoint(),store=new Store();store.db=async()=>{throw Error('intentional storage denial');};
 store.memory=structuredClone(cp);store.progress=createProgress(cp,'preserved-run');
 const a=Object.assign(Object.create(Application.prototype),{alive:true,state:'campaign',world:null,view:null,loadGeneration:4,actionSequence:0,campaignIntent:'continue',campaignSelection:'cambrai',checkpointState:'ready',checkpoint:cp,campaignProgress:structuredClone(store.progress),settings:{...DEFAULT_SETTINGS,keys:{...DEFAULT_SETTINGS.keys}},store,ui:{refreshCampaign(){},toast(){},modal:null},audio:{setSettings(){}},input:{},frameLimiter:{reset(){}}});
 return {a,store};
}
test('difficulty is not rendered in any options category or reset with gameplay',()=>{
 const s={...DEFAULT_SETTINGS,difficulty:'veteran'};
 assert.equal(SETTINGS_SCHEMA.difficulty.category,'campaign');
 for(const tab of OPTIONS_TABS){assert.doesNotMatch(settingsScreen({settings:s},tab),/data-setting="difficulty"/);assert.equal(resetCategory(s,tab).difficulty,'veteran');}
});
test('campaign offers difficulty both for a new game and resuming a valid checkpoint',()=>{
 const {a}=fixture();
 for(const intent of ['new','continue']){
  const vm=buildCampaignViewModel({checkpointState:'ready',checkpoint:a.checkpoint,progress:a.campaignProgress,intent});
  assert.match(campaignPanel(vm,a),/data-setting="difficulty"/);
 }
});
test('difficulty cannot be changed from options, gameplay, or an unavailable chapter',async()=>{
 for(const state of ['settings','playing','main','paused']){const {a,store}=fixture();a.state=state;const before=structuredClone(a.checkpoint);await a.changeSetting('difficulty','veteran');assert.deepEqual(a.checkpoint,before);assert.equal(a.settings.difficulty,'soldier');assert.equal(store.writeRevision,0);}
 const {a,store}=fixture();a.campaignSelection='ypres';await a.changeSetting('difficulty','veteran');assert.equal(store.writeRevision,0);
});
test('changing continuation difficulty updates the checkpoint pair, not health, timers, RNG or progress',async()=>{
 const {a,store}=fixture(),before=structuredClone(a.checkpoint);await a.changeSetting('difficulty','veteran');
 assert.equal(a.checkpoint.difficulty,'veteran');const comparison=structuredClone(a.checkpoint);comparison.difficulty=before.difficulty;assert.deepEqual(comparison,before);
 assert.equal(a.campaignProgress.runId,'preserved-run');assert.equal(a.campaignProgress.checkpointRef.difficulty,'veteran');validateProgress(a.campaignProgress,a.checkpoint);
 assert.equal(store.memory.difficulty,'veteran');assert.equal(a.sessionOnly,true);assert.equal(a.world,null);assert.equal(a.settings.difficulty,'soldier');
 const world=new Simulation(a.checkpoint);assert.equal(world.difficultyId,'veteran');assert.equal(world.player.health.regenRate,DIFFICULTIES.veteran.regenRate);
});
test('a new campaign choice does not change an existing continuation checkpoint',async()=>{
 const {a,store}=fixture(),before=structuredClone(a.checkpoint);let saved=null;store.saveSettings=s=>{saved=structuredClone(s);};a.campaignIntent='new';
 await a.changeSetting('difficulty','recruit');assert.equal(a.settings.difficulty,'recruit');assert.equal(saved.difficulty,'recruit');assert.deepEqual(a.checkpoint,before);assert.equal(store.writeRevision,0);
});
test('invalid difficulty values are rejected rather than silently becoming Soldier',async()=>{
 const {a,store}=fixture();for(const value of ['constructor','__proto__','easy',null,{}])await a.changeSetting('difficulty',value);assert.equal(store.writeRevision,0);
});
test('cancelling a pending difficulty write preserves the accepted old pair',async()=>{
 const {a,store}=fixture();assert.equal(typeof a.cancelCampaignDifficulty,'function');let release;store.db=()=>new Promise(resolve=>{release=resolve;});
 const old=structuredClone(a.checkpoint),work=a.changeSetting('difficulty','veteran');await Promise.resolve();await Promise.resolve();
 assert.equal(a.campaignDifficultyPending,true);a.cancelCampaignDifficulty();a.state='main';release({transaction(){throw Error('cancelled operation must never open a transaction');}});await work;
 assert.deepEqual(a.checkpoint,old);assert.equal(store.memory.difficulty,old.difficulty);assert.equal(a.campaignDifficultyPending,false);
});
