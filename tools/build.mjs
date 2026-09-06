import {cp,mkdir,rm,readFile,writeFile,stat,readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';import {resolve,join,relative,sep} from 'node:path';import {gzipSync} from 'node:zlib';
const root=fileURLToPath(new URL('../',import.meta.url)),dist=resolve(root,'dist');
// Only deployable files belong in dist. Validate inputs before replacing the old build.
const inputs=['index.html','src','public','vendor','ASSET_LICENSES.md','ASSET_LICENSES.en.md','LICENSE','CHANGELOG.md','docs/HISTORY.md','docs/HISTORY.en.md','docs/KNOWN_ISSUES.md','docs/KNOWN_ISSUES.en.md'];
for(const name of inputs)await stat(join(root,name));
await rm(dist,{recursive:true,force:true});await mkdir(dist,{recursive:true});
// Polish and English documents are linked from the game's Credits screen.
await mkdir(join(dist,'docs'),{recursive:true});
for(const name of inputs)await cp(join(root,name),join(dist,name),{recursive:true});
await writeFile(join(dist,'.nojekyll'),'');
const packageInfo=JSON.parse(await readFile(join(root,'package.json'),'utf8'));
async function files(dir){const out=[];for(const entry of await readdir(dir,{withFileTypes:true})){const path=join(dir,entry.name);if(entry.isDirectory())out.push(...await files(path));else out.push(path);}return out;}
let total=0,gzip=0;const manifest=[];for(const path of (await files(dist)).sort()){const b=await readFile(path);total+=b.length;gzip+=gzipSync(b).length;manifest.push({path:relative(dist,path).split(sep).join('/'),bytes:b.length});}
await writeFile(join(dist,'build-manifest.json'),JSON.stringify({version:packageInfo.version,runtime:'Babylon.js 8.46.2',builder:'Node static copy',totalBytes:total,gzipBytes:gzip,files:manifest},null,2));
console.log(`Zbudowano dist: ${manifest.length} plików, ${(total/1048576).toFixed(2)} MiB; osobno gzip ${(gzip/1048576).toFixed(2)} MiB. Wszystkie adresy aplikacji są względne.`);
