import {BRIEFING_DOOR} from '../world/briefing-door.js';
import {PresentationState} from './presentation-state.js';
import {resolvePlayerLook} from '../core/player-look.js';
import {projectToHud} from '../ui/hud/projection.js';
import {LocalizedError} from '../i18n/index.js';
import {message} from '../i18n/message.js';
import {SupportView} from './support-view.js';
import {qualityProfile} from './quality.js';
import {appearanceFor} from './appearance.js';
import {sampleClipFrame} from './animation-sampling.js';
import {GpuTimer} from '../performance/gpu-timer.js';
import {Engine,Scene,Vector3,Color3,Color4,TargetCamera,HemisphericLight,DirectionalLight,ShadowGenerator,TransformNode,Matrix,Quaternion} from './babylon.js';
import {Assets} from './assets.js';
import {Geometry,boxMesh} from './geometry.js';
import {materials,makeLandscape} from './landscape.js';
import {Effects} from './effects.js';
import {EYE_HEIGHT} from '../world/collision.js';
import {clamp,lerp} from '../core/math.js';
export class GameView {
 constructor(canvas,world,settings){this.canvas=canvas;this.world=world;this.settings=settings;this.presentation=new PresentationState(world);this.lookPreview={yaw:0,pitch:0};this.markerActors=new Map();this.renderTimings={scene:0,render:0};this.engine=new Engine(canvas,true,{preserveDrawingBuffer:false,stencil:true,antialias:true},true);if(this.engine.webGLVersion<2){this.engine.dispose();throw new LocalizedError('error.webgl');}
  this.gpuTimer=new GpuTimer(canvas.getContext('webgl2'));this.renderStats={};this.engine.setHardwareScalingLevel(1/(settings.renderScale||1));this.scene=new Scene(this.engine);this.scene.detachControl();this.scene.clearColor=new Color4(.48,.55,.57,1);this.scene.fogMode=Scene.FOGMODE_LINEAR;this.scene.fogStart=65;this.scene.fogEnd=240;this.scene.fogColor=new Color3(.60,.65,.65);this.scene.ambientColor=new Color3(.23,.24,.22);this.scene.skipPointerMovePicking=true;this.scene.autoClear=true;
  this.camera=new TargetCamera('player-eye',new Vector3(0,0,0),this.scene);
  // Recompute up from all three axes even after explosion roll returns to zero.
  this.camera.updateUpVectorFromRotation=true;this.camera.minZ=.035;this.camera.maxZ=500;this.camera.fov=(settings.fov||78)*Math.PI/180;
  this.light=new HemisphericLight('overcast-sky',new Vector3(.25,1,.15),this.scene);this.light.intensity=.84;this.light.diffuse=new Color3(.82,.9,1);this.light.groundColor=new Color3(.31,.28,.20);
  this.sun=new DirectionalLight('november-sun',new Vector3(-.55,-.92,.48),this.scene);this.sun.position=new Vector3(42,75,-35);this.sun.intensity=1.13;this.sun.diffuse=new Color3(1,.94,.82);this.sun.shadowMinZ=1;this.sun.shadowMaxZ=190;
  this.assets=new Assets(this.scene);this.mats=materials(this.scene);this.staticMeshes=makeLandscape(this.scene,world,this.mats);this.units=new Map();this.tankModels=new Map();this.items=new Map();this.lastTime=world.time;this.smoothedEye=EYE_HEIGHT[world.player.stance];this.viewModels=new Map();this.lastSlot=null;this.lastWeapon=null;this.motionPhase=0;this.frameTimes=[];this.disposed=false;this.applySettings(settings);
 }
 setLanguage(language){this.support?.setLanguage(language);if(this.support&&!this.disposed)this.render(false);}
 applySettings(s){
  this.settings=s;this.support?.setLanguage(s.language);
  this.engine.setHardwareScalingLevel(1/(s.renderScale||1));this.resize();
  const profile=qualityProfile(s.quality);this.profile=profile;
  this.assets.applyQuality(profile);this.effects?.setQuality(profile);
  for(const m of new Set(Object.values(this.mats))){if(m._v03Normal)m.bumpTexture=profile.normals?m._v03Normal:null;for(const texture of m.getActiveTextures())texture.anisotropicFilteringLevel=profile.anisotropy;}
  if(this.quality===s.quality)return;
  this.quality=s.quality;this.shadow?.dispose();this.shadow=null;this.renderStats.shadowCasters=0;
  if(profile.shadowSize){
   this.shadowRadius=profile.shadowRadius;this.shadow=new ShadowGenerator(profile.shadowSize,this.sun);
   this.shadow.usePercentageCloserFiltering=true;this.shadow.filteringQuality=profile.shadowFilter;
   this.shadow.darkness=.27;this.shadow.bias=.0006;this.shadow.normalBias=.018;
   this.sun.shadowFrustumSize=this.shadowRadius*2;this.sun.shadowMinZ=1;this.sun.shadowMaxZ=180;
   this.sun.autoUpdateExtends=false;this.sun.autoCalcShadowZBounds=false;
  }
  this.nextDetailUpdate=-Infinity;
  this.shadowListTime=-Infinity;
 }
 setDiagnosticsEnabled(enabled,sessionId){this.diagnosticsEnabled=enabled;this.gpuTimer.setEnabled(enabled,sessionId);}
 beforeTick(){this.presentation.beforeTick(this.world);}
 afterTick(){this.presentation.afterTick(this.world);}
 resetPresentation(){this.presentation.reset(this.world);this.lastTime=this.world.time;}
 updateShadowList(force=false){
  if(!this.shadow)return;
  const p=this.world.player.pos,r=this.shadowRadius;
  // Stable world-space texel increments avoid a continuously drifting projection.
  const texel=r*2/this.profile.shadowSize;
  this.sun.position.set(Math.round((p.x+36)/texel)*texel,p.y+65,Math.round((p.z-32)/texel)*texel);
  if(!force&&this.world.time-this.shadowListTime<.2&&Math.hypot(p.x-(this.lastShadowX??Infinity),p.z-(this.lastShadowZ??Infinity))<6)return;
  this.lastShadowX=p.x;this.lastShadowZ=p.z;
  this.shadowListTime=this.world.time;
  const list=[];
  for(const mesh of this.staticMeshes){
   if(!mesh.metadata?.shadowCaster)continue;
   const box=mesh.getBoundingInfo().boundingBox,c=box.centerWorld,e=box.extendSizeWorld;
   const dx=Math.max(0,Math.abs(c.x-p.x)-e.x),dz=Math.max(0,Math.abs(c.z-p.z)-e.z);
   if(dx*dx+dz*dz<(r+8)*(r+8))list.push(mesh);
  }
  for(const unit of [...this.units.values(),...this.tankModels.values(),...(this.support?.guns.values()||[])]){
   const q=unit.root.position;
   if((q.x-p.x)**2+(q.z-p.z)**2<(r+8)**2)for(const mesh of unit.meshes)if(mesh.isEnabled()&&mesh.getTotalVertices()>0)list.push(mesh);
  }
  if(this.support?.door&&Math.hypot(p.x-BRIEFING_DOOR.x,p.z-BRIEFING_DOOR.z)<r+BRIEFING_DOOR.width)list.push(...this.support.door.meshes);
  this.shadow.getShadowMap().renderList=list;
  this.renderStats.shadowCasters=list.length;
 }
 async load(progress){await this.assets.load(progress);if(this.disposed)throw new DOMException('Scena anulowana.','AbortError');for(const n of this.world.npcs)this.addUnit(n);for(const t of this.world.tanks){const model=this.assets.instantiate('mark-iv',t.id);this.tankModels.set(t.id,model);for(const m of model.meshes){m.receiveShadows=true;if(this.shadow)this.shadow.addShadowCaster(m,false);}}
  this.support=new SupportView(this.scene,this.assets,this.mats,this.world,this.settings.language);
  this.fpRoot=new TransformNode('first-person',this.scene);this.fpRoot.parent=this.camera;
  for(const name of ['smle','gewehr','webley','lewis']){const model=this.assets.instantiate(name,`fp-${name}`);model.root.parent=this.fpRoot;model.root.setEnabled(false);for(const m of model.meshes){m.renderingGroupId=2;m.receiveShadows=false;m.alwaysSelectAsActiveMesh=true;}this.viewModels.set(name,model);}
  this.hands=this.assets.instantiate('hands','fp-hands');this.hands.root.parent=this.fpRoot;for(const m of this.hands.meshes){m.renderingGroupId=2;m.receiveShadows=false;m.alwaysSelectAsActiveMesh=true;}
  this.scene.setRenderingAutoClearDepthStencil(2,true,true,true);this.effects=new Effects(this.scene,this.mats,this.profile);this.assets.applyQuality(this.profile);
  for(const i of this.world.items){const root=new TransformNode(i.id,this.scene),y=i.type==='medkit'?.18:.15;const box=boxMesh(i.id+'-box',this.scene,i.type==='medkit'?this.mats.white:this.mats.crate,.5,.28,.35);box.parent=root;box.position.y=y;if(i.type==='medkit'){const a=boxMesh(i.id+'-cross1',this.scene,this.mats.red,.09,.012,.26),b=boxMesh(i.id+'-cross2',this.scene,this.mats.red,.29,.013,.075);a.parent=root;b.parent=root;a.position.y=b.position.y=.33;}
   if(i.type==='lewis'){box.setEnabled(false);const model=this.assets.instantiate('lewis','pickup-lewis');model.root.parent=root;model.root.position.y=.15;model.root.rotation.y=Math.PI/2;}
   root.position.set(i.pos.x,i.pos.y,i.pos.z);this.items.set(i.id,root);
  }
  // Freeze Babylon's wall-clock animation system; sampled clips follow simulation time.
  this.scene.animationsEnabled=false;progress(message('loading.frame'),1);await this.scene.whenReadyAsync();if(this.disposed)throw new DOMException('Scena anulowana.','AbortError');this.sync(0);this.updateShadowList(true);this.render(false);
 }
 addUnit(n){const model=this.assets.instantiate(appearanceFor(n).model,n.id);model.bones=new Map(model.root.getDescendants().map(node=>[node.name.split(':').pop(),node]));model.lastAnim=null;model.animation=null;model.animStart=0;model.nextSample=0;model.lod=-1;for(const m of model.meshes){m.receiveShadows=true;if(this.shadow)this.shadow.addShadowCaster(m,false);}this.units.set(n.id,model);}
 sync(dt,presentationDt=dt,alpha=1,look={}){const w=this.world,p=w.player,time=Math.max(0,w.time-(1-alpha)/60),poses=this.presentation.sample(alpha),pp=poses.get(p.id)||p,aim=resolvePlayerLook(p,w.collision,look,this.lookPreview);this.motionPhase=pp.distance*3;
  this.smoothedEye=lerp(this.smoothedEye,EYE_HEIGHT[p.stance],1-Math.exp(-Math.max(0,presentationDt)*14));const motion=this.settings.motion??.5,bob=p.moving&&p.grounded?Math.sin(this.motionPhase)*.023*motion:0;
  this.camera.position.set(pp.pos.x,pp.pos.y+this.smoothedEye+bob,pp.pos.z);this.camera.rotation.set(aim.pitch-p.recoil*.6*motion+Math.sin(time*51)*(this.effects?.trauma||0)*.018*motion,aim.yaw+Math.sin(time*39)*(this.effects?.trauma||0)*.012*motion,Math.sin(time*47)*(this.effects?.trauma||0)*.008*motion);this.camera.fov=lerp(this.camera.fov,((this.settings.fov||78)-(p.ads?22:0))*Math.PI/180,1-Math.exp(-Math.max(0,presentationDt)*14));
  if(this.fpRoot){const reload=p.weapon.reloadLeft>0?Math.sin(Math.min(1,p.weapon.reloadLeft/p.weapon.definition.reload)*Math.PI):0,melee=p.meleeLeft>0?Math.sin(p.meleeLeft/.85*Math.PI):0,throwing=p.grenadeLeft>0?Math.sin(p.grenadeLeft*Math.PI):0;
   const aim=p.ads?1:0;this.fpRoot.position.set(lerp(.19,0,aim)+(p.moving?Math.sin(this.motionPhase*.5)*.011*motion:0),lerp(-.24-(w.director.phase===0?.10:0),-.118,aim)-reload*.3-throwing*.25,lerp(.30,.22,aim)-p.recoil*1.8-melee*.1);this.fpRoot.rotation.set(reload*.42+melee*.75+throwing*.5+(p.weapon.cooldown>0&&['smle','gewehr'].includes(p.weapon.id)?Math.sin(p.weapon.cooldown/p.weapon.definition.cycle*Math.PI)*.07:0),p.recoil*.1,reload*-.28);this.fpRoot.scaling.setAll(1);
   if(this.lastWeapon!==p.weapon.id){for(const [id,m] of this.viewModels)m.root.setEnabled(id===p.weapon.id);this.lastWeapon=p.weapon.id;}
  }
  for(const n of w.npcs){if(!this.units.has(n.id))this.addUnit(n);const model=this.units.get(n.id),np=poses.get(n.id)||n;model.root.position.set(np.pos.x,np.pos.y+(n.stance==='crouch'?-.36:n.stance==='prone'?.25:0),np.pos.z);model.root.rotation.y=np.yaw;model.root.rotation.x=n.hp>0&&n.stance==='prone'?Math.PI/2:0;
   const distance=Math.hypot(n.pos.x-p.pos.x,n.pos.z-p.pos.z);
   const lod=distance<this.profile.lodNear?0:distance<this.profile.lodFar?1:2;
   if(lod!==model.lod){model.lod=lod;for(const mesh of model.meshes){const match=mesh.name.match(/lod([012])/i);if(match)mesh.setEnabled(Number(match[1])===lod);}this.shadowListTime=-Infinity;}
   let animation=n.hp<=0?'death':n.stance==='prone'?'prone':n.weapon.reloadLeft>0?'reload':time-n.hitTime<.18?'hit':time-n.shotTime<.15?'fire':n.state==='grenade'?'grenade':n.moving?(n.state==='evade'||n.state==='retreat'?'run':'walk'):n.stance==='crouch'?'crouch':n.state==='aim'?'aim':'idle';
   if(model.lastAnim!==animation){model.animation?.stop();model.nextSample=0;model.lastAnim=animation;model.animation=model.animations.get(animation);model.animStart=time;if(model.animation){model.animation.start(false);model.animation.pause();}}
   if(model.animation&&time>=model.nextSample){model.nextSample=time+(distance<16?0:distance<40?1/24:1/10);const a=model.animation,elapsed=time-model.animStart,clip={from:a.from,to:a.to,fps:a.targetedAnimations[0]?.animation.framePerSecond||60};const duration={death:1.2,fire:.25,hit:.3}[animation];a.goToFrame(animation==='reload'?a.from+(a.to-a.from)*(1-powSafe(n.weapon.reloadLeft/n.weapon.definition.reload)):sampleClipFrame(clip,elapsed,{loop:duration===undefined,duration,speed:animation==='run'?1.15:1}));
    // Stance is a lower-body layer: reloading while crouched must not put boots underground.
    if(n.hp>0&&n.stance==='crouch'){for(const [name,x,z] of [['ThighL',-1.02,-.08],['ThighR',-1.02,.08],['ShinL',1.67,0],['ShinR',1.67,0],['FootL',-.65,0],['FootR',-.65,0]]){const bone=model.bones.get(name);if(bone)bone.rotationQuaternion=Quaternion.FromEulerAngles(x,0,z);}}}
   if(n.hp<=0){const fall=Math.min(1,(time-(n.deathTime??time))/1.2);model.root.position.y=np.pos.y-fall*.7;}
  }
  for(const t of w.tanks){const model=this.tankModels.get(t.id),tp=poses.get(t.id)||t;model.root.position.set(tp.pos.x,tp.pos.y,tp.pos.z);model.root.rotation.y=tp.yaw;model.root.rotation.x=t.moving?Math.sin(t.trackPhase*2)*.006:0;}
  for(const i of w.items)this.items.get(i.id)?.setEnabled(!i.used);
  if(time>=(this.nextDetailUpdate??0)||Math.hypot(p.pos.x-(this.lastDetailX??Infinity),p.pos.z-(this.lastDetailZ??Infinity))>6){this.lastDetailX=p.pos.x;this.lastDetailZ=p.pos.z;this.nextDetailUpdate=time+.2;for(const mesh of this.staticMeshes){if(!mesh.metadata?.detail)continue;const bounds=mesh.getBoundingInfo().boundingBox,c=bounds.centerWorld,e=bounds.extendSizeWorld,dx=Math.max(0,Math.abs(c.x-p.pos.x)-e.x),dz=Math.max(0,Math.abs(c.z-p.pos.z)-e.z);mesh.setEnabled(mesh.metadata.detailRank<=this.profile.detailFraction&&dx*dx+dz*dz<this.profile.detailDistance**2);}}
  this.support?.sync(w,dt,this.effects,this.profile,poses);this.effects?.update(w,dt,poses);
 }
 render(active=true,options={}){
  if(this.disposed)return;
  this.engine.beginFrame();
  const dt=Math.max(0,this.world.time-this.lastTime);this.lastTime=this.world.time;
  const syncStart=performance.now();this.sync(active?dt:0,active?(options.presentationDt??dt):0,options.alpha??1,options.look||{});this.updateShadowList();this.renderTimings.scene=performance.now()-syncStart;
  this.gpuTimer.begin(performance.now(),{frameId:options.frameId||0,sessionId:options.sessionId??this.gpuTimer.sessionId});
  const drawsBefore=this.engine._drawCalls.current;
  const renderStart=performance.now();
  try{this.scene.render();}finally{this.gpuTimer.end();this.engine.endFrame();}
  this.renderTimings.render=performance.now()-renderStart;
  this.renderStats.drawCalls=this.engine._drawCalls.current-drawsBefore;
  this.renderStats.activeMeshes=this.scene.getActiveMeshes().length;
  this.renderStats.triangles=Math.round(this.scene.getActiveIndices()/3);
  this.renderStats.activeAnimatables=this.scene._activeAnimatables.length;
  this.renderStats.quality=this.quality;this.renderStats.effects=this.effects?.active.length||0;this.renderStats.shadowMapSize=this.profile.shadowSize;this.renderStats.lodCounts??=[0,0,0];this.renderStats.lodCounts.fill(0);for(const model of this.units.values())this.renderStats.lodCounts[model.lod]++;
 }
 event(e){this.effects?.event(e);}
 marker(){const o=this.world.director.objective;const point=new Vector3(o.x,this.world.terrain.height(o.x,o.z)+2,o.z);const projected=Vector3.Project(point,Matrix.Identity(),this.scene.getTransformMatrix(),this.camera.viewport.toGlobal(this.engine.getRenderWidth(),this.engine.getRenderHeight()));const dx=o.x-this.world.player.pos.x,dz=o.z-this.world.player.pos.z;return{x:projected.x/this.engine.getRenderWidth()*100,y:projected.y/this.engine.getRenderHeight()*100,visible:dx*Math.sin(this.world.player.yaw)+dz*Math.cos(this.world.player.yaw)>0&&projected.z>=0&&projected.z<=1,distance:Math.hypot(dx,dz)};}
 cameraPosition(){const p=this.camera.globalPosition||this.camera.position;return{x:p.x,y:p.y,z:p.z};}
 refreshViewport(){const r=this.canvas.getBoundingClientRect(),v=this.camera.viewport;this.viewportCache={left:r.left+v.x*r.width,top:r.top+(1-v.y-v.height)*r.height,width:r.width*v.width,height:r.height*v.height};return this.viewportCache;}
 viewport(){return this.viewportCache||this.refreshViewport();}
 presentPosition(id,fallback){return this.presentation.get(id)?.pos||fallback;}
 presentationActor(actor){let out=this.markerActors.get(actor.id);if(!out){out={};this.markerActors.set(actor.id,out);}out.pos=this.presentPosition(actor.id,actor.pos);out.yaw=this.presentation.get(actor.id)?.yaw??actor.yaw;out.stance=actor.stance;return out;}
 hudCamera(){return{pos:this.cameraPosition(),yaw:this.camera.rotation.y,pitch:this.camera.rotation.x,roll:this.camera.rotation.z};}
 projectPoint(point){return projectToHud(point,{getTransformationMatrix:()=>this.scene.getTransformMatrix(),isNDCHalfZRange:this.engine.isNDCHalfZRange},this.viewport());}
 resize(){this.engine.resize();this.refreshViewport();}
 dispose(){if(this.disposed)return;this.disposed=true;this.gpuTimer.dispose();this.support?.dispose();this.effects?.dispose();this.assets.dispose();this.scene.dispose();this.engine.dispose();this.units.clear();this.items.clear();this.tankModels.clear();this.markerActors.clear();this.presentation.records.clear();this.presentation.poses.clear();}
}
function powSafe(x){return Math.max(0,Math.min(1,x));}
