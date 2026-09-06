import test from 'node:test';
import assert from 'node:assert/strict';

// The vendored bundle also contains DOM widgets. Only their import-time symbols
// are supplied here; all camera and matrix methods below are the REAL runtime.
// This is a camera-math contract test, not a WebGL/GameView acceptance test.
const saved=new Map(['HTMLElement','document','customElements'].map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
let runtime;
try{
 globalThis.HTMLElement=class{};
 globalThis.document={createTreeWalker:()=>({})};
 globalThis.customElements={define(){}};
 runtime=await import('../src/render/babylon.js');
}finally{
 for(const [key,descriptor] of saved){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}
}
const {TargetCamera,Vector3,Matrix}=runtime,rad=Math.PI/180;
function camera(update){
 // No Engine/GPU is created. Populate the state read by the actual _getViewMatrix.
 return Object.assign(Object.create(TargetCamera.prototype),{
  _scene:{useRightHandedSystem:false},_cachedRotationZ:0,_cachedQuaternionRotationZ:0,
  rotation:Vector3.Zero(),position:Vector3.Zero(),upVector:Vector3.Up(),
  _cameraRotationMatrix:Matrix.Identity(),_referencePoint:new Vector3(0,0,1),
  _transformedReferencePoint:Vector3.Zero(),_currentTarget:Vector3.Zero(),
  _viewMatrix:Matrix.Identity(),updateUpVectorFromRotation:update
 });
}
function roll(c){const up=Vector3.TransformNormal(Vector3.Up(),c._getViewMatrix());return Math.atan2(up.x,up.y)/rad;}
test('CAM-01 negative control reproduces a 12-degree tilt with zero commanded roll',()=>{
 const c=camera(false);c.rotation.set(12*rad,0,.004);roll(c);c.rotation.z=0;roll(c);
 c.rotation.set(0,Math.PI/2,0);assert.equal(c.rotation.z,0);assert.ok(Math.abs(roll(c)-12)<.001);
});
test('continuous up-vector updates remove history without removing intentional shake',()=>{
 for(const pitch of [-60,-30,-12,0,12,30,60])for(const yaw of [0,90,180,270]){
  const c=camera(true);c.rotation.set(pitch*rad,yaw*rad,.004);
  assert.ok(Math.abs(roll(c)-.004/rad)<.001,'intentional roll must remain');
  c.rotation.z=0;assert.ok(Math.abs(roll(c))<.001);
  for(const newYaw of [0,90,180,270,360]){c.rotation.set(0,newYaw*rad,0);assert.ok(Math.abs(roll(c))<.001);}
 }
});
