import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Store} from '../src/save/store.js';
const saved=()=>JSON.parse(readFileSync(new URL('./fixtures/v041-checkpoint.json',import.meta.url),'utf8'));
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return{promise,resolve};};
// Staged key-aware transaction: metadata is not confused with the checkpoint.
function database(initial){const writes=[],records=new Map(initial?[['checkpoint',initial]]:[]);return{writes,transaction(name,mode){const tx={},pending=new Map();let cancelled=false;
 tx.objectStore=()=>({put(value,key){pending.set(key,structuredClone(value));},get(key){const q={};queueMicrotask(()=>{q.result=records.get(key);q.onsuccess?.();});return q;}});
 tx.abort=()=>{cancelled=true;queueMicrotask(()=>tx.onabort?.());};queueMicrotask(()=>queueMicrotask(()=>{if(cancelled)return;for(const [k,v] of pending){records.set(k,v);if(k==='checkpoint')writes.push(v);}tx.oncomplete?.();}));return tx;}};}
test('an obsolete pending save cannot enter the persistent transaction',async()=>{const gate=deferred(),db=database();let current=true;const store=new Store(()=>{});store.db=()=>gate.promise;const pending=store.save(saved(),{isCurrent:()=>current});await Promise.resolve();current=false;gate.resolve(db);await pending;assert.equal(db.writes.length,0);});
test('a validated save is detached from later caller mutations',async()=>{const gate=deferred(),db=database(),store=new Store(()=>{});store.db=()=>gate.promise;const snapshot=saved(),pending=store.save(snapshot);snapshot.player.grenades=999;gate.resolve(db);await pending;assert.equal(db.writes[0].player.grenades,3);});
test('late load cannot replace a newer in-memory checkpoint',async()=>{const gate=deferred(),old=saved(),db=database(old),store=new Store(()=>{});store.db=()=>gate.promise;const pending=store.load();const newer=saved();newer.player.grenades=1;const saving=store.save(newer);gate.resolve(db);assert.equal((await pending).player.grenades,1);await saving;});
test('a malformed candidate leaves the previous checkpoint intact',async()=>{const db=database(),store=new Store(()=>{});store.db=async()=>db;await store.save(saved());const bad=saved();bad.npcs[0].pathIndex=-1;await assert.rejects(store.save(bad));assert.equal((await store.load()).npcs[0].pathIndex,0);});
test('two pending saves end with the latest candidate and not a stale overwrite',async()=>{const gate=deferred(),db=database(),store=new Store(()=>{});store.db=()=>gate.promise;const old=saved(),newer=saved();newer.player.grenades=2;const a=store.save(old),b=store.save(newer);gate.resolve(db);await Promise.all([a,b]);assert.equal(db.writes.at(-1).player.grenades,2);assert.equal((await store.load()).player.grenades,2);});
