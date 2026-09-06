import test from 'node:test';
import assert from 'node:assert/strict';
import {BattlefieldAudio} from '../src/audio/audio.js';
import {Weapon} from '../src/combat/weapon.js';
const settings={master:.7,effects:.8,ambient:.3};
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return{promise,resolve};};
function audioFixture(){const audio=new BattlefieldAudio(settings);const gate=deferred();audio.ctx={state:'suspended',currentTime:0,resume(){return gate.promise.then(()=>{this.state='running';});},async suspend(){this.state='suspended';}};audio.master={gain:{value:0}};return{audio,gate};}
test('late resume after pause cannot enable audio again',async()=>{const {audio,gate}=audioFixture();const pending=audio.resume();audio.pause();gate.resolve();await pending;assert.equal(audio.enabled,false);assert.equal(audio.master.gain.value,0);});
test('a stale resume cannot cancel a newer valid resume',async()=>{const {audio,gate}=audioFixture();const first=audio.resume();audio.pause();const latest=audio.resume();gate.resolve();await Promise.all([first,latest]);assert.equal(audio.enabled,true);assert.equal(audio.ctx.state,'running');});
test('owner cancellation during resume leaves the mixer muted',async()=>{const {audio,gate}=audioFixture();let current=true;const pending=audio.resume(()=>current);current=false;gate.resolve();await pending;assert.equal(audio.enabled,false);});
const param=()=>({value:0,setValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(){}});
function node(){return{stopped:false,disconnected:false,gain:param(),frequency:param(),playbackRate:param(),pan:param(),connect(){},disconnect(){this.disconnected=true;},start(){},stop(){this.stopped=true;}};}
function nodesFixture(){const a=new BattlefieldAudio(settings);a.ctx={currentTime:0,state:'running',async suspend(){this.state='suspended';},createBufferSource:node,createBiquadFilter:node,createGain:node,createStereoPanner:node,createOscillator:node};a.master=node();a.enabled=true;const weapon=new Weapon('smle',5,30);weapon.reload();const player={id:'player',hp:100,pos:{x:0,y:0,z:0},yaw:0,weapon,weapons:[weapon]};const world={player,actors:[player],tanks:[],air:{planes:[]}};return{a,world,weapon};}
test('cancelling a reload cancels only its scheduled sounds',()=>{const {a,world,weapon}=nodesFixture();a.event({type:'reload',owner:'player',weapon:'smle',actionId:weapon.reloadSerial,pos:world.player.pos});const scheduled=[...a.sources];assert.equal(scheduled.length,3);a.event({type:'impact',pos:world.player.pos});weapon.cancelReload();a.update(world,0);assert.equal(a.sources.size,1);assert.ok(scheduled.every(n=>n.stopped&&n.disconnected));});
test('regular pause does not discard the active reload timeline',()=>{const {a,world,weapon}=nodesFixture();a.event({type:'reload',owner:'player',weapon:'smle',actionId:weapon.reloadSerial,pos:world.player.pos});a.pause();a.update(world,0);assert.equal(a.sources.size,3);assert.equal(weapon.reloadLeft,weapon.definition.reload);});
test('mission stop disconnects all transient sources and resets timers',()=>{const {a}=nodesFixture();a.event({type:'impact',pos:null});const sources=[...a.sources];a.nextAmbient=-10;a.stop();assert.equal(a.sources.size,0);assert.ok(sources.every(n=>n.stopped&&n.disconnected));assert.equal(a.nextAmbient,6);});
test('disposing audio releases ambience references and permits later settings changes',()=>{
 const {a}=nodesFixture();a.ctx.close=async()=>{};a.ambientGain=node();a.noise={};a.ambientNodes=[a.ambientGain];
 a.dispose();assert.doesNotThrow(()=>a.setSettings(settings));assert.equal(a.ambientGain,null);assert.equal(a.noise,null);
});
