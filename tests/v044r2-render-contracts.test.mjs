import test from 'node:test';import assert from 'node:assert/strict';
import {Minimap} from '../src/ui/hud/minimap.js';
import {FRONT_SNAPSHOTS,campaignFrame,MAP_POINTS} from '../src/data/campaign-map.js';
import {settingsScreen} from '../src/ui/screens/settings.js';
import {DEFAULT_SETTINGS,DEFAULT_KEYS} from '../src/save/store.js';
import {setLanguage} from '../src/i18n/index.js';
import {VERSION,UI_REVISION} from '../src/version.js';
import {readFileSync} from 'node:fs';
test('round minimap uses one circular clip, a cached background and balanced context state',t=>{
 const saved=globalThis.document,oldDpr=globalThis.devicePixelRatio;let saves=0,clips=0;const arcs=[];
 const ctx=new Proxy({save(){saves++;},restore(){saves--;assert.ok(saves>=0);},clip(){clips++;},arc(...a){arcs.push(a);}}, {get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
 globalThis.document={createElement:()=>({getContext:()=>ctx})};globalThis.devicePixelRatio=1.5;
 t.after(()=>{if(saved===undefined)delete globalThis.document;else globalThis.document=saved;if(oldDpr===undefined)delete globalThis.devicePixelRatio;else globalThis.devicePixelRatio=oldDpr;});
 const canvas={clientWidth:200,getContext:()=>ctx};const mm=new Minimap(canvas);
 const w={time:0,terrain:{height:()=>0},collision:{boxes:[]},destroyedObstacles:[],player:{pos:{x:0,y:0,z:0},yaw:0,faction:'uk'},npcs:[],tanks:[],air:{planes:[]},director:{objective:{x:100,z:100}}};
 mm.draw(w,[],{},0);assert.equal(canvas.width,300);assert.equal(canvas.height,300);assert.equal(clips,1);assert.ok(arcs.some(a=>a[0]===100&&a[1]===100&&a[2]===98.5));assert.equal(saves,0);
 for(let now=1;now<1000;now+=1000/165)mm.draw(w,[],{},now);assert.ok(mm.draws<=31);assert.equal(mm.rebuilds,1);assert.equal(saves,0);
 const n=mm.draws;mm.draw(w,[],{showMinimap:false},1100);assert.equal(mm.draws,n);assert.equal(canvas.hidden,true);
});
test('front definitions cannot be mutated by the screen; default version stays 0.4.4',()=>{
 assert.equal(VERSION,'0.4.4');assert.equal(UI_REVISION,3);const x=FRONT_SNAPSHOTS.cambrai.front[0][0];assert.throws(()=>{FRONT_SNAPSHOTS.cambrai.front[0][0]=123;});assert.equal(campaignFrame('cambrai').front[0][0],x);
 assert.equal(Object.keys(FRONT_SNAPSHOTS).length,Object.keys(MAP_POINTS).length);
});
test('the geographic master includes editable high-detail coast/rivers and separate licensing',()=>{
 const data=JSON.parse(readFileSync(new URL('../public/assets/ui/maps/western-front-geography.json',import.meta.url)));
 assert.ok(data.coastPolygons.reduce((n,p)=>n+p.coordinates.length,0)>500);
 assert.ok(data.rivers.reduce((n,p)=>n+p.length,0)>1400);
 assert.equal(data.license,'LGPL-3.0-or-later');assert.deepEqual(data.extent,[-1.9,46.9,9.1,52.1]);
});
test('live options keep native accessible inputs and exclude fictitious mockup controls',()=>{
 setLanguage('en');const out=settingsScreen({settings:{...DEFAULT_SETTINGS,language:'en',keys:{...DEFAULT_KEYS}}},'gameplay');
 assert.match(out,/role="switch"/);assert.match(out,/choice-language-next/);assert.match(out,/data-setting="language"/);
 assert.doesNotMatch(out,/gamepad|aimbot|data-setting="autosave"|data-setting="drone"/i);
 assert.ok(out.indexOf('options-content')<out.lastIndexOf('options-footer'));
});
