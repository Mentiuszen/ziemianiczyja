import test from 'node:test';import assert from 'node:assert/strict';
import {PresentationState} from '../src/render/presentation-state.js';import {FixedClock} from '../src/core/clock.js';
import {resolvePlayerLook} from '../src/core/player-look.js';import {grenadeThreats,grenadeDirection,placeGrenade} from '../src/ui/hud/grenade-warning.js';
import {getHudScale,HUD_SCALE_KEYS,resetHud} from '../src/ui/hud/settings.js';import {normalizeSettings} from '../src/save/settings-schema.js';
import {PerformanceMonitor} from '../src/performance/monitor.js';import {CriticalHealth} from '../src/ui/damage-feedback.js';
const simpleWorld=()=>({player:{id:'player',pos:{x:0,y:0,z:0},yaw:0,pitch:0},npcs:[],tanks:[],fieldGuns:[],grenades:[],shells:[],air:{planes:[],bombs:[]}});
for(const hz of [60,120,144,165,240])test(`v045: linear presentation stays smooth at ${hz} Hz over a 60 Hz simulation`,()=>{
 const w=simpleWorld(),c=new FixedClock(),p=new PresentationState(w);let last=null;
 for(let i=0;i<hz*2;i++){
  c.advance(1/hz,true,dt=>{p.beforeTick();w.player.pos.z+=3*dt;p.afterTick(w);});p.sample(c.alpha);
  const z=p.get('player').pos.z;
  if(i>3)assert.ok(Math.abs(z-last-3/hz)<1e-9,`unequal presentation delta at ${i}`);last=z;
 }
 assert.ok(Math.abs(w.player.pos.z-6)<1e-9);
});
test('v045: restore, teleport and removed projectiles cannot interpolate across old sessions',()=>{
 const w=simpleWorld(),p=new PresentationState(w);w.grenades.push({id:'g',pos:{x:1,y:2,z:3}});p.beforeTick();w.player.pos.x=10;p.afterTick(w);p.sample(.1);assert.equal(p.get('player').pos.x,10);
 w.grenades=[];p.beforeTick();w.player.pos.x=11;w.player.recoveryThisStep=true;p.afterTick(w);p.sample(.1);assert.equal(p.get('player').pos.x,11);assert.equal(p.get('g'),undefined);
 p.reset(w);assert.equal(p.get('player').pos.x,11);
});
test('v045: look preview uses the same prone blocking and pitch clamp as committed movement',()=>{
 const p={yaw:1,pitch:0,stance:'prone',pos:{x:0,y:0,z:0}},collision={canTurn:()=>false};let out=resolvePlayerLook(p,collision,{lookX:1,lookY:100});assert.equal(out.yaw,1);assert.equal(out.pitch,1.4);assert.equal(p.pitch,0);
 collision.canTurn=()=>true;out=resolvePlayerLook(p,collision,{lookX:.2,lookY:-.3});assert.equal(out.yaw,1.2);Object.assign(p,out);out=resolvePlayerLook(p,collision,{lookX:0,lookY:0});assert.equal(out.yaw,1.2);assert.equal(out.pitch,-.3);
});
test('v045: critical live announcement is rearmed above 25%, not every hit at 19%',()=>{
 const s=new CriticalHealth();assert.deepEqual(s.update(20),{visible:false,announce:false});assert.equal(s.update(19).announce,true);assert.equal(s.update(18).announce,false);s.update(21);assert.equal(s.update(19).announce,false);s.update(25);assert.equal(s.update(19).announce,true);assert.equal(s.update(0).visible,false);
});
test('v045: HUD-only reset and settings roundtrip preserve campaign, audio and controls',()=>{
 const a=normalizeSettings({hudScale:2,hudAmmoScale:.5,crosshairStyle:'none',difficulty:'veteran',language:'pl',master:.2,keys:{forward:'ArrowUp'},showCpu:true});
 assert.equal(getHudScale(a,'ammo'),1);const b=normalizeSettings(JSON.parse(JSON.stringify(a)));assert.deepEqual(b,a);
 const c=resetHud(a);assert.equal(c.difficulty,'veteran');assert.equal(c.language,'pl');assert.equal(c.master,.2);assert.equal(c.keys.forward,'ArrowUp');assert.equal(c.crosshairStyle,'cross');for(const key of Object.values(HUD_SCALE_KEYS))assert.equal(c[key],1);assert.ok(!Object.hasOwn(c,'showCpu'));
});
function threats(){const w=simpleWorld();w.player.faction='uk';w.player.stance='stand';w.collision={visible:()=>true};return w;}
test('v045: grenade threat selection excludes harmless, occluded, expired and vertically distant grenades',()=>{
 const w=threats();w.grenades=[{id:'own',faction:'uk',fuse:1,pos:{x:0,y:1,z:1}},{id:'dead',faction:'de',fuse:0,pos:{x:0,y:1,z:1}},{id:'high',faction:'de',fuse:1,pos:{x:0,y:12,z:1}},{id:'live',faction:'de',fuse:1,pos:{x:0,y:1,z:1}}];assert.deepEqual(grenadeThreats(w).items.map(x=>x.id),['live']);w.collision.visible=()=>false;assert.equal(grenadeThreats(w).items.length,0);
});
test('v045: multiple grenade warnings have stable priority and disclose additional threats',()=>{
 const w=threats();w.grenades=Array.from({length:5},(_,i)=>({id:'g'+i,faction:'de',fuse:1+i,pos:{x:i,y:1,z:1}}));assert.deepEqual(grenadeThreats(w).items.map(x=>x.id),['g0','g1','g2']);assert.equal(grenadeThreats(w).extra,2);w.grenades.reverse();assert.deepEqual(grenadeThreats(w).items.map(x=>x.id),['g0','g1','g2']);
});
test('v045: behind-camera grenade points to lower rim and never mirrors to the front',()=>{
 const d=grenadeDirection({x:0,y:1,z:-5},{pos:{x:0,y:1,z:0},yaw:0,pitch:0});assert.equal(d.behind,true);assert.ok(d.y>.99);
 const placed=placeGrenade({x:-1e6,y:1e6,visible:false},d,{left:0,top:0,width:1280,height:720},[],68);assert.ok(placed.x>0&&placed.x<1280&&placed.y>360&&placed.y<720);assert.ok(placed.targetY>placed.y);
});
test('v045: grenade direction follows camera roll as well as yaw and pitch',()=>{
 const d=grenadeDirection({x:5,y:0,z:1},{pos:{x:0,y:0,z:0},yaw:0,pitch:0,roll:Math.PI/2});assert.ok(Math.abs(d.x)<1e-8);assert.ok(d.y>.99);
});
test('v045: displaced on-screen grenade arrow still targets the exact projected point',()=>{
 const q={x:700,y:400,visible:true},r=placeGrenade(q,{x:1,y:0,behind:false},{left:0,top:0,width:1280,height:720},[{left:650,right:750,top:320,bottom:380}],68);
 assert.equal(r.targetX,q.x);assert.equal(r.targetY,q.y);assert.ok(Math.hypot(r.x-q.x,r.y-q.y)>0);
});
test('v045: raw GPU samples and capture records remain associated with their submitting session',()=>{
 const m=new PerformanceMonitor(128,0),id=m.startCapture({scenario:'test'});m.recordRaf({interval:6,cpu:1},10);m.record({frame:6,cpu:1,frameId:7},10);assert.equal(m.recordGpu({frameId:7,sessionId:id,submittedAt:10,milliseconds:3}),true);
 m.reset('pause');assert.equal(m.recordGpu({frameId:7,sessionId:id,submittedAt:10,milliseconds:9}),false);m.record({frame:6,cpu:2,frameId:8},20);const report=m.stopCapture();assert.equal(report.frames.length,2);assert.equal(report.gpu.length,1);assert.equal(report.gpu[0].frameId,7);assert.notEqual(report.frames[0].sessionId,report.frames[1].sessionId);assert.equal(report.metadata.scenario,'test');
});
test('v045: unavailable GPU is missing data and is never synthesized from CPU or FPS',()=>{
 const m=new PerformanceMonitor(128,0);for(let i=0;i<128;i++)m.record({frame:6,cpu:2},i*6);assert.equal(m.metrics.gpu.n,0);assert.equal(m.metrics.gpu.avg,null);assert.equal(m.metrics.gpu.p99,null);
});
