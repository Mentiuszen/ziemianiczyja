import test from 'node:test';
import assert from 'node:assert/strict';
import * as maps from '../src/data/campaign-map.js';
import * as projection from '../src/ui/hud/projection.js';
import * as settings from '../src/ui/screens/settings.js';
import {CAMPAIGN} from '../src/data/cambrai.js';
import {campaignMarkup,CampaignScreen} from '../src/ui/screens/campaign.js';
import {buildCampaignViewModel} from '../src/ui/campaign-model.js';
import {DEFAULT_SETTINGS,DEFAULT_KEYS} from '../src/save/store.js';
import {hudMarkup} from '../src/ui/hud/hud.js';
import {setLanguage} from '../src/i18n/index.js';
const app={settings:{...DEFAULT_SETTINGS,language:'en',keys:{...DEFAULT_KEYS}},checkpointState:'none',campaignIntent:'new',campaignSelection:'cambrai'};
const model=id=>buildCampaignViewModel({checkpointState:'none',intent:'new',selectedMissionId:id,newDifficultyId:'soldier'});
test('each chapter selects its own dated, immutable geographic front and arrows',()=>{
 assert.equal(typeof maps.campaignFrame,'function');
 const expected=['1916-07-01','1916-09-15','1917-10','1917-11-20','1918-08-08'];
 const paths=[];
 CAMPAIGN.forEach((m,i)=>{const f=maps.campaignFrame(m.id);assert.equal(f.date,expected[i]);assert.equal(f.id,m.id);assert.ok(f.front.length>20);assert.ok(f.arrows.length>0);assert.ok(f.sources.length>0);assert.ok(f.view[2]>0);paths.push(JSON.stringify(f.front));});
 assert.equal(new Set(paths).size,5);
 assert.throws(()=>maps.campaignFrame('not-a-mission'),/mission|chapter/i);
});
test('map geography projects Cambrai north of Paris; west-to-east is not inverted',()=>{
 assert.equal(typeof maps.projectGeo,'function');
 const p=maps.projectGeo(3.2357,50.1766),paris=maps.projectGeo(2.3522,48.8566);
 assert.ok(p.x>paris.x&&p.y<paris.y);assert.deepEqual(p,maps.MAP_POINTS.cambrai);
});
test('mission cards are ordered beneath the map, with no old right-hand mission column',()=>{
 setLanguage('en');const out=campaignMarkup(model('cambrai'),app);
 assert.ok(out.indexOf('chapter-nav')>out.indexOf('campaign-stage'));
 assert.ok(out.includes('campaign-detail'));assert.ok(!out.includes('<aside class="campaign-panel"'));
 assert.ok(out.includes('data-front-mission="cambrai"'));
 let last=-1;for(const m of CAMPAIGN){const i=out.indexOf(`data-mission-id="${m.id}"`);assert.ok(i>last);last=i;}
});
test('selecting a different chapter replaces front state and stops old intro without starting gameplay',()=>{
 const s=new CampaignScreen('new');assert.equal(typeof s.selectFrame,'function');s.selectFrame('amiens');
 assert.equal(s.frameId,'amiens');assert.equal(s.timeline.frame().done,true);assert.deepEqual(s.manualView,maps.campaignFrame('amiens').view);
 s.selectFrame('somme');assert.equal(s.frameId,'somme');
});
test('rounded radar filters corner points and clamps only the objective to its circular edge',()=>{
 assert.equal(typeof projection.worldToRadar,'function');assert.equal(typeof projection.radarEdge,'function');
 const p={x:0,z:0};assert.equal(projection.worldToRadar({x:59,z:59},p,240,60).inside,false);
 assert.equal(projection.worldToRadar({x:0,z:60},p,240,60).inside,true);
 const q=projection.radarEdge({x:400,y:-200},240,10);assert.ok(Math.abs(Math.hypot(q.x-120,q.y-120)-110)<1e-9);
});
test('choice arrows use the same choices as the native select, with wrapping',()=>{
 assert.equal(typeof settings.stepChoice,'function');assert.equal(settings.stepChoice('quality','ultra',1),'low');assert.equal(settings.stepChoice('language','pl',1),'en');assert.equal(settings.stepChoice('quality','low',-1),'ultra');assert.equal(settings.stepChoice('master',.5,1),undefined);
});
test('HUD has one circular radar, compact health and ammo rows, and no back action',()=>{
 const out=hudMarkup();assert.ok(out.includes('radar-dial'));assert.ok(out.includes('health-cross'));assert.ok(out.includes('ammo-line'));assert.ok(out.includes('grenade-count'));assert.ok(!out.includes('data-action="back"'));assert.ok(out.indexOf('chapter-label')>out.indexOf('id="minimap"'));
});
