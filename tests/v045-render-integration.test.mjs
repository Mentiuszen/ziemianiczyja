import test from 'node:test';import assert from 'node:assert/strict';
import {PresentationState} from '../src/render/presentation-state.js';
// Only import-time widget DOM names are substituted. Real GameView.sync and Babylon
// vector/camera math run below. This does not emulate or validate GPU rendering.
const saved=new Map(['HTMLElement','document','customElements'].map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));let GameView,Vector3,Matrix,TargetCamera;
try{globalThis.HTMLElement=class{};globalThis.document={createTreeWalker:()=>({})};globalThis.customElements={define(){}};({GameView}=await import('../src/render/view.js'));({Vector3,Matrix,TargetCamera}=await import('../src/render/babylon.js'));}
finally{for(const [k,d] of saved){if(d)Object.defineProperty(globalThis,k,d);else delete globalThis[k];}}
function fixture(){
 const world={time:1,player:{id:'player',pos:{x:0,y:0,z:0},yaw:0,pitch:0,stance:'stand',distance:0,moving:false,recoil:0,ads:false},npcs:[],tanks:[],items:[],fieldGuns:[],grenades:[],shells:[],air:{planes:[],bombs:[]},collision:{canTurn:()=>true}};
 const camera=Object.assign(Object.create(TargetCamera.prototype),{_scene:{useRightHandedSystem:false},_cachedRotationZ:0,_cachedQuaternionRotationZ:0,rotation:Vector3.Zero(),position:Vector3.Zero(),upVector:Vector3.Up(),_cameraRotationMatrix:Matrix.Identity(),_referencePoint:new Vector3(0,0,1),_transformedReferencePoint:Vector3.Zero(),_currentTarget:Vector3.Zero(),_viewMatrix:Matrix.Identity(),updateUpVectorFromRotation:true,fov:78*Math.PI/180});
 const view=Object.assign(Object.create(GameView.prototype),{world,camera,settings:{fov:78,motion:0},presentation:new PresentationState(world),lookPreview:{},smoothedEye:1.61,staticMeshes:[],profile:{},units:new Map(),tankModels:new Map(),items:new Map()});return {world,view};
}
test('v045 GameView: actual camera position interpolates between ticks without changing gameplay',()=>{
 const {world:w,view:v}=fixture();v.beforeTick();w.player.pos.z=.05;w.time+=1/60;v.afterTick();const snapshot=JSON.stringify(w.player);
 v.sync(1/60,1/165,.25,{});assert.ok(Math.abs(v.camera.position.z-.0125)<1e-10);v.sync(0,1/165,.75,{});assert.ok(Math.abs(v.camera.position.z-.0375)<1e-10);assert.equal(JSON.stringify(w.player),snapshot);
});
test('v045 GameView: a pending mouse delta is previewed once and its later consumption is seamless',()=>{
 const {world:w,view:v}=fixture();v.sync(0,1/165,1,{lookX:.12,lookY:.03});assert.equal(v.camera.rotation.y,.12);assert.equal(v.camera.rotation.x,.03);assert.equal(w.player.yaw,0);
 v.beforeTick();w.player.yaw=.12;w.player.pitch=.03;v.afterTick();v.sync(1/60,1/165,.4,{lookX:0,lookY:0});assert.equal(v.camera.rotation.y,.12);assert.equal(v.camera.rotation.x,.03);
});
test('v045 GameView: ADS FOV smoothing has the same real-time response at 60 and 165 renders/s',()=>{
 const a=fixture(),b=fixture();a.world.player.ads=b.world.player.ads=true;
 for(let i=0;i<60;i++)a.view.sync(0,1/60,1,{});for(let i=0;i<165;i++)b.view.sync(0,1/165,1,{});
 assert.ok(Math.abs(a.view.camera.fov-b.view.camera.fov)<1e-10);assert.ok(Math.abs(a.view.camera.fov-56*Math.PI/180)<1e-5);
});
test('v045 GameView: prone rotation preview respects the collision veto',()=>{
 const {world:w,view:v}=fixture();w.player.stance='prone';w.collision.canTurn=()=>false;v.sync(0,1/165,1,{lookX:1});assert.equal(v.camera.rotation.y,0);
});
test('v045 GameView: real Babylon up-vector recovers after trauma roll disappears',()=>{
 const {world:w,view:v}=fixture();v.settings.motion=1;v.effects={trauma:1,update(){}};v.sync(0,1/165,1,{});v.camera._getViewMatrix();assert.ok(Math.abs(v.camera.upVector.x)>1e-6);
 v.effects.trauma=0;v.sync(0,1/165,1,{});v.camera._getViewMatrix();assert.ok(Math.abs(v.camera.upVector.x)<1e-10);assert.ok(Math.abs(v.camera.upVector.z)<1e-10);
});
