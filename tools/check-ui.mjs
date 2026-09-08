import assert from 'node:assert/strict';import {readFile,readdir,access} from 'node:fs/promises';import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url),manifest=JSON.parse(await readFile(new URL('public/assets/ui/manifest.json',root)));
for(const file of manifest.files){const data=await readFile(new URL(file.path,root));assert.equal(createHash('sha256').update(data).digest('hex'),file.sha256,file.path);assert.equal(data.length,file.bytes);}
for(const name of await readdir(new URL('src/ui/styles/',root))){const path=new URL('src/ui/styles/'+name,root),s=await readFile(path,'utf8');for(const m of s.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g))await access(new URL(m[1],path));}
const css=await readFile(new URL('src/ui/style.css',root),'utf8');for(const m of css.matchAll(/@import ['"]([^'"]+)['"]/g))await access(new URL(m[1],new URL('src/ui/style.css',root)));
console.log(`UI assets OK: ${manifest.files.length} hashes; stylesheet imports and background URLs resolve.`);
