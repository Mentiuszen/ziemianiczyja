/** Dependency-free localization build gate. Run from any working directory. */
import assert from 'node:assert/strict';
import {readFile,readdir,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {CATALOGUES,translate} from '../src/i18n/index.js';
import {VERSION} from '../src/version.js';
import {CAMPAIGN,OBJECTIVES,initialSoldiers} from '../src/data/cambrai.js';
import {BRIEFING_LINES} from '../src/data/briefing.js';
const root=new URL('../',import.meta.url),keys=Object.keys(CATALOGUES.pl).sort();
const params=s=>[...new Set([...s.matchAll(/\{([a-zA-Z][a-zA-Z0-9_]*)\}/g)].map(m=>m[1]))].sort();
assert.deepEqual(keys,Object.keys(CATALOGUES.en).sort(),'PL/EN catalogue keys differ');
for(const key of keys){
 assert.ok(CATALOGUES.pl[key].trim()&&CATALOGUES.en[key].trim(),`Empty translation: ${key}`);
 assert.deepEqual(params(CATALOGUES.pl[key]),params(CATALOGUES.en[key]),`Parameters differ: ${key}`);
 const sample=Object.fromEntries(params(CATALOGUES.en[key]).map(p=>[p,'TEST']));
 for(const language of ['pl','en'])assert.doesNotMatch(translate(language,key,sample),/\{[A-Za-z][A-Za-z0-9_]*\}|\[object Object\]/,key);
}
function descriptor(value){
 if(!value||typeof value!=='object')return;
 if(typeof value.key==='string'){assert.ok(Object.hasOwn(CATALOGUES.en,value.key),`Data key: ${value.key}`);return;}
 for(const v of Object.values(value))descriptor(v);
}
for(const data of [CAMPAIGN,OBJECTIVES,BRIEFING_LINES,initialSoldiers()])descriptor(data);
let sourceCount=0,referenceCount=0;
async function scan(dir){for(const entry of await readdir(dir,{withFileTypes:true})){
 const path=new URL(entry.name+(entry.isDirectory()?'/':''),dir);
 if(entry.isDirectory()){if(entry.name!=='i18n')await scan(path);continue;}
 if(!entry.name.endsWith('.js'))continue;sourceCount++;const source=await readFile(path,'utf8');
 // Plain authored Polish prose belongs in catalogues, not in gameplay/render/menu files.
 assert.doesNotMatch(source,/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/,`Polish text outside a catalogue: ${path}`);
 for(const match of source.matchAll(/(?:\bt|\btr|\bmessage|new LocalizedError)\(\s*['"]([^'"]+)['"]/g)){
  referenceCount++;assert.ok(Object.hasOwn(CATALOGUES.en,match[1]),`Missing static key ${match[1]} in ${path}`);
 }
 for(const match of source.matchAll(/['"](save\.[A-Za-z]+)['"]/g))assert.ok(Object.hasOwn(CATALOGUES.en,match[1]),`Missing validation key ${match[1]}`);
 for(const match of source.matchAll(/\b(label|hint|title|text)\s*:\s*['"]([A-Za-z][A-Za-z ]{5,})['"]/g)){
  // These legacy tokens drive render budgets; the UI displays quality.<id> instead.
  const internalQuality=path.pathname.endsWith('/render/quality.js')&&match[1]==='label'&&['Low','Medium','High','Ultra'].includes(match[2]);
  assert.ok(internalQuality,`Unkeyed presentation field ${match[2]} in ${path}`);
 }
}}
await scan(new URL('src/',root));
for(const file of ['ASSET_LICENSES.md','ASSET_LICENSES.en.md','docs/HISTORY.md','docs/HISTORY.en.md','docs/KNOWN_ISSUES.md','docs/KNOWN_ISSUES.en.md','public/assets/ui/flag-en.svg','public/assets/ui/flag-pl.svg','public/assets/textures/briefing-map-en.png'])await access(new URL(file,root));
const map=JSON.parse(await readFile(new URL('public/assets/textures/briefing-map-en.json',root),'utf8'));
const sha=async path=>createHash('sha256').update(await readFile(new URL(path,root))).digest('hex');
assert.equal(map.text,CATALOGUES.en[map.catalogueKey],'Regenerate English world-map text');
assert.equal(map.sourceSha256,await sha('public/assets/textures/briefing-map.jpg'),'Map source changed: regenerate its English label');
assert.equal(map.sha256,await sha('public/assets/textures/briefing-map-en.png'),'English map asset does not match its manifest');
const pkg=JSON.parse(await readFile(new URL('package.json',root),'utf8')),lock=JSON.parse(await readFile(new URL('package-lock.json',root),'utf8'));
assert.equal(pkg.version,VERSION);assert.equal(lock.version,VERSION);assert.equal(lock.packages[''].version,VERSION);
console.log(`Localization OK: ${keys.length}/${keys.length} PL/EN keys, ${sourceCount} source files, ${referenceCount} static references; assets, docs and version ${VERSION}.`);
