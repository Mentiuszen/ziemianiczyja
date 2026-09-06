import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {CATALOGUES,translate,text,message,setLanguage,errorText,LocalizedError,number} from '../src/i18n/index.js';
import {checkpointKey} from '../src/i18n/legacy.js';
import {CAMPAIGN,OBJECTIVES,initialSoldiers} from '../src/data/cambrai.js';
import {BRIEFING_LINES} from '../src/data/briefing.js';
import {UI} from '../src/ui/ui.js';
import {DEFAULT_SETTINGS} from '../src/save/store.js';
import {Simulation} from '../src/core/simulation.js';
const parameters=s=>[...new Set([...s.matchAll(/\{([a-zA-Z][a-zA-Z0-9_]*)\}/g)].map(m=>m[1]))].sort();
test('both complete catalogues have exactly the same keys and parameter contracts',()=>{
 const keys=Object.keys(CATALOGUES.pl).sort();assert.ok(keys.length>300);assert.deepEqual(keys,Object.keys(CATALOGUES.en).sort());
 for(const key of keys){assert.ok(CATALOGUES.pl[key].trim(),key);assert.ok(CATALOGUES.en[key].trim(),key);assert.deepEqual(parameters(CATALOGUES.pl[key]),parameters(CATALOGUES.en[key]),key);assert.doesNotMatch(CATALOGUES.en[key],/<\/?(?:script|div|span|img)\b/i);}
});
test('every catalogue entry resolves with its complete parameter contract',()=>{
 for(const language of ['pl','en'])for(const [key,value] of Object.entries(CATALOGUES[language])){
  const params=Object.fromEntries(parameters(value).map(k=>[k,'TEST']));const result=translate(language,key,params);assert.equal(typeof result,'string');assert.doesNotMatch(result,/\{[A-Za-z][A-Za-z0-9_]*\}|\[object Object\]/,key);
 }
});
test('unknown message descriptors fail loudly instead of displaying object text',()=>{
 assert.throws(()=>text(message('missing.translation')),/Missing translation/);
 assert.throws(()=>translate('en','__proto__'),/Missing translation/);
 assert.throws(()=>translate('pl','loading.models',{}),/Missing parameter/);
});
test('campaign, objectives, all seven briefing lines and generic names resolve in both languages',()=>{
 assert.equal(BRIEFING_LINES.length,7);
 for(const lang of ['pl','en']){setLanguage(lang);for(const c of CAMPAIGN)for(const field of ['title','place','date'])assert.ok(text(c[field]));
  for(const o of OBJECTIVES){assert.ok(text(o.title));assert.ok(text(o.hint,{interact:'F'}));}
  for(const line of BRIEFING_LINES){assert.ok(text(line.speaker));assert.ok(text(line.text));}
  for(const n of initialSoldiers())assert.doesNotMatch(text(n.name),/\[object Object\]/);
 }setLanguage('pl');
});
test('keyed errors can be retransmitted and translated after changing the language',()=>{
 const error=new LocalizedError('error.assetHttp',{url:'models/test.glb',status:404});
 assert.match(error.message,/Nie udało/);setLanguage('en');assert.match(text(error),/Could not load models\/test.glb: HTTP 404/);
 const saved=JSON.parse(JSON.stringify(message('error.audio',{error:message(error.key,error.params)})));
 assert.match(text(saved),/^Audio unavailable:/);setLanguage('pl');assert.match(text(saved),/^Dźwięk niedostępny:/);
});
test('foreign operating-system error prose is not leaked into the selected game language',()=>{
 assert.doesNotMatch(errorText(new Error('polski tekst sterownika'),'en'),/polski|sterownika/);
 assert.match(errorText(new Error('polski tekst sterownika'),'en'),/Unexpected error/);
 assert.equal(errorText({name:'AbortError'},'en'),translate('en','error.loadCancelled'));
});
test('legacy checkpoint labels migrate to stable IDs rather than freezing Polish strings',()=>{
 assert.equal(checkpointKey('Meldunek Bennetta'),'checkpoint.bennett');assert.equal(checkpointKey('Punkt łączności'),'checkpoint.telephone');
 assert.equal(checkpointKey('checkpoint.telephone'),'checkpoint.telephone');assert.equal(checkpointKey(null),'checkpoint.start');
 const saved=JSON.parse(readFileSync(new URL('./fixtures/v041-checkpoint.json',import.meta.url),'utf8'));saved.director.lastCheckpoint='Meldunek Bennetta';
 const w=new Simulation(saved);assert.equal(w.director.lastCheckpoint,'checkpoint.bennett');setLanguage('en');assert.equal(text(w.npcs.find(n=>n.id==='uk-1').name),'Lieutenant Edward Shaw');setLanguage('pl');
});
test('numbers follow the selected locale without changing underlying values',()=>{setLanguage('en');assert.equal(number(12.5,1),'12.5');setLanguage('pl');assert.equal(number(12.5,1),'12,5');});
test('error parameters are escaped as text in menu markup',()=>{
 setLanguage('en');const ui=Object.assign(Object.create(UI.prototype),{menu:{hidden:false,innerHTML:''},hud:{hidden:true},app:{settings:{...DEFAULT_SETTINGS,keys:{...DEFAULT_SETTINGS.keys}},errorMessage:message('error.assetMissing',{name:'<img src=x onerror=alert(1)>'})}});
 ui.render('error');assert.ok(ui.menu.innerHTML.includes('&lt;img src=x onerror=alert(1)&gt;'));assert.doesNotMatch(ui.menu.innerHTML,/<img src=x/);setLanguage('pl');
});
test('all static translation references resolve, including validation helpers',()=>{
 function scan(dir){for(const f of readdirSync(dir,{withFileTypes:true})){const path=new URL(f.name,dir);if(f.isDirectory()){scan(new URL(f.name+'/',dir));continue;}if(!f.name.endsWith('.js')||path.pathname.includes('/i18n/'))continue;const s=readFileSync(path,'utf8');
  for(const m of s.matchAll(/(?:\bt|\btr|\bmessage|new LocalizedError)\(\s*['"]([^'"]+)['"]/g))assert.ok(Object.hasOwn(CATALOGUES.en,m[1]),`${path}: ${m[1]}`);
  for(const m of s.matchAll(/['"](save\.[A-Za-z]+)['"]/g))assert.ok(Object.hasOwn(CATALOGUES.en,m[1]),m[1]);
 }}scan(new URL('../src/',import.meta.url));
});
