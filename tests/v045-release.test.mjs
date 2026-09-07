import test from 'node:test';import assert from 'node:assert/strict';import {existsSync,readFileSync,readdirSync} from 'node:fs';import {createHash} from 'node:crypto';import {VERSION,UI_REVISION} from '../src/version.js';
const root=new URL('../',import.meta.url);
test('v045: release metadata, lockfile and code agree on 0.4.5',()=>{
 const p=JSON.parse(readFileSync(new URL('package.json',root))),l=JSON.parse(readFileSync(new URL('package-lock.json',root)));
 assert.equal(VERSION,'0.4.5');assert.equal(UI_REVISION,2);assert.equal(p.version,VERSION);assert.equal(p.uiRevision,UI_REVISION);assert.equal(l.version,VERSION);assert.equal(l.packages[''].version,VERSION);
});
test('v045: committed UI manifest covers real assets including every stance',()=>{
 const path=new URL('public/assets/ui/manifest.json',root);assert.ok(existsSync(path),'Deployable UI manifest is missing');const m=JSON.parse(readFileSync(path));
 for(const id of ['stand','crouch','prone'])assert.ok(m.files.some(f=>f.path===`public/assets/ui/stance-${id}.svg`));
 for(const f of m.files){const b=readFileSync(new URL(f.path,root));assert.equal(b.length,f.bytes,f.path);assert.equal(createHash('sha256').update(b).digest('hex'),f.sha256,f.path);}
});
