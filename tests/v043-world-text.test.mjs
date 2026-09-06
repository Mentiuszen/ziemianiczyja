import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
// Supply only the bundled widget's import-time DOM names; methods under test are unmodified.
const saved=new Map(['HTMLElement','document','customElements'].map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
let SupportView,GameView;
try{globalThis.HTMLElement=class{};globalThis.document={createTreeWalker:()=>({})};globalThis.customElements={define(){}};
 ({SupportView}=await import('../src/render/support-view.js'));({GameView}=await import('../src/render/view.js'));
}finally{for(const [key,value] of saved){if(value)Object.defineProperty(globalThis,key,value);else delete globalThis[key];}}


test('the actual world support layer changes only the briefing-map texture when language changes',()=>{
 assert.equal(typeof SupportView.prototype.setLanguage,'function');
 const pl={},en={},view=Object.assign(Object.create(SupportView.prototype),{mapTextures:{pl,en},mapMaterial:{diffuseTexture:pl}});
 view.setLanguage('en');assert.equal(view.mapMaterial.diffuseTexture,en);view.setLanguage('pl');assert.equal(view.mapMaterial.diffuseTexture,pl);
});
test('a paused GameView applies world-text language and redraws without advancing simulation',()=>{
 assert.equal(typeof GameView.prototype.setLanguage,'function');const calls=[];
 const view=Object.assign(Object.create(GameView.prototype),{disposed:false,support:{setLanguage:v=>calls.push(v)},render:active=>calls.push(active)});
 view.setLanguage('en');assert.deepEqual(calls,['en',false]);
});
test('the English world-map label has a local PNG asset, while the original map remains available',()=>{
 const en=new URL('../public/assets/textures/briefing-map-en.png',import.meta.url);assert.ok(existsSync(en));
 const b=readFileSync(en);assert.equal(b.subarray(1,4).toString(),'PNG');assert.equal(b.readUInt32BE(16),1024);assert.equal(b.readUInt32BE(20),768);
 assert.ok(existsSync(new URL('../public/assets/textures/briefing-map.jpg',import.meta.url)));
});
