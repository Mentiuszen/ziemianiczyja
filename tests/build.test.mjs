import test from 'node:test';
import assert from 'node:assert/strict';
import {cp,mkdir,mkdtemp,readFile,readdir,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';

test('build publishes only runtime files, removes stale output and has a reproducible portable manifest',async()=>{
 const root=await mkdtemp(join(tmpdir(),'zn-build-'));
 try{
  for(const dir of ['tools','src','public','vendor','docs','tests','.local','dist'])await mkdir(join(root,dir));
  await cp(new URL('../tools/build.mjs',import.meta.url),join(root,'tools/build.mjs'));
  for(const [name,body] of Object.entries({'index.html':'<html></html>','src/app.js':'export const ok=true;','public/asset.txt':'asset','vendor/runtime.js':'export {};','LICENSE':'license','ASSET_LICENSES.md':'attribution','ASSET_LICENSES.en.md':'attribution EN','CHANGELOG.md':'changes','README.md':'developer instructions','docs/HISTORY.md':'history','docs/HISTORY.en.md':'history EN','docs/KNOWN_ISSUES.md':'limits','docs/KNOWN_ISSUES.en.md':'limits EN','docs/internal.md':'internal','tests/private.txt':'test','dist/stale.txt':'old release','.local/private.txt':'private','package.json':'{"version":"0.4.0","type":"module"}'}))await writeFile(join(root,name),body);
  const build=()=>execFileSync(process.execPath,[join(root,'tools/build.mjs')],{cwd:tmpdir(),stdio:'pipe'});
  build();
  assert.deepEqual((await readdir(join(root,'dist'))).sort(),['.nojekyll','ASSET_LICENSES.md','ASSET_LICENSES.en.md','CHANGELOG.md','LICENSE','build-manifest.json','docs','index.html','public','src','vendor'].sort());
  assert.deepEqual((await readdir(join(root,'dist/docs'))).sort(),['HISTORY.en.md','HISTORY.md','KNOWN_ISSUES.en.md','KNOWN_ISSUES.md']);
  const first=await readFile(join(root,'dist/build-manifest.json'),'utf8'),manifest=JSON.parse(first);
  assert.equal(manifest.version,'0.4.0');
  assert.ok(manifest.files.some(f=>f.path==='src/app.js'));
  let bytes=0;
  for(const file of manifest.files){assert.ok(!file.path.includes('\\'));const data=await readFile(join(root,'dist',file.path));assert.equal(data.length,file.bytes);bytes+=data.length;}
  assert.equal(manifest.totalBytes,bytes);
  build();
  assert.equal(await readFile(join(root,'dist/build-manifest.json'),'utf8'),first);
 }finally{await rm(root,{recursive:true,force:true});}
});
