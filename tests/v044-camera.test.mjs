import test from 'node:test';import assert from 'node:assert/strict';import {projectToHud} from '../src/ui/hud/projection.js';
const saved=new Map(['HTMLElement','document','customElements'].map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));let runtime;
try{globalThis.HTMLElement=class{};globalThis.document={createTreeWalker:()=>({})};globalThis.customElements={define(){}};runtime=await import('../src/render/babylon.js');}finally{for(const [k,d] of saved){if(d)Object.defineProperty(globalThis,k,d);else delete globalThis[k];}}
const {Vector3,Matrix,TargetCamera}=runtime;
function camera(pitch,yaw,roll){return Object.assign(Object.create(TargetCamera.prototype),{_scene:{useRightHandedSystem:false},_cachedRotationZ:0,_cachedQuaternionRotationZ:0,rotation:new Vector3(pitch,yaw,roll),position:Vector3.Zero(),upVector:Vector3.Up(),_cameraRotationMatrix:Matrix.Identity(),_referencePoint:new Vector3(0,0,1),_transformedReferencePoint:Vector3.Zero(),_currentTarget:Vector3.Zero(),_viewMatrix:Matrix.Identity(),updateUpVectorFromRotation:true});}
test('HUD projection agrees with the actual Babylon matrix at pitch/yaw/roll and ADS',()=>{
 for(const fov of [78,56])for(const pitch of [-.4,0,.5])for(const yaw of [0,1,3]){
  const c=camera(pitch,yaw,.004),view=c._getViewMatrix(),projection=Matrix.PerspectiveFovLH(fov*Math.PI/180,16/9,.035,500),transform=view.multiply(projection);
  const direction=new Vector3(Math.sin(yaw)*Math.cos(pitch),-Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch)),point=direction.scale(12),rect={left:15,top:30,width:960,height:540};
  const result=projectToHud(point,{getTransformationMatrix:()=>transform,isNDCHalfZRange:false},rect),expected=Vector3.Project(point,Matrix.Identity(),transform,{x:rect.left,y:rect.top,width:rect.width,height:rect.height});
  assert.ok(result.visible);assert.ok(Math.abs(result.x-expected.x)<.001);assert.ok(Math.abs(result.y-expected.y)<.001);
  assert.equal(projectToHud(point.scale(-1),{getTransformationMatrix:()=>transform,isNDCHalfZRange:false},rect).visible,false);
 }
});
