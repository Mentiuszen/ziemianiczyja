import {Color3,StandardMaterial,Texture,Mesh} from './babylon.js';
import {Geometry,boxMesh} from './geometry.js';
import {assetURL} from './assets.js';
import {BoundedPool} from '../core/pool.js';
import {qualityProfile} from './quality.js';
import {explosionParticles} from './effect-particles.js';

/** Resident mesh pools. Cosmetic budgets cannot cancel the simulated explosion. */
export class Effects {
 constructor(scene,mats,profile=qualityProfile('medium')){
  this.scene=scene;this.active=[];this.projectiles=new Map();this.serial=0;this.eventSerial=0;this.profile=profile;this.trauma=0;
  this.smokeMat=new StandardMaterial('blast-dust',scene);this.smokeMat.diffuseTexture=new Texture(assetURL('textures/blast-smoke.png'),scene);this.smokeMat.diffuseTexture.hasAlpha=true;this.smokeMat.useAlphaFromDiffuseTexture=true;this.smokeMat.diffuseColor=new Color3(.51,.48,.41);this.smokeMat.emissiveColor=new Color3(.08,.076,.066);this.smokeMat.specularColor=Color3.Black();this.smokeMat.backFaceCulling=false;this.smokeMat.disableDepthWrite=true;
  this.fireMat=new StandardMaterial('brief-hot-flash',scene);this.fireMat.diffuseTexture=this.smokeMat.diffuseTexture;this.fireMat.useAlphaFromDiffuseTexture=true;this.fireMat.emissiveColor=new Color3(1,.65,.21);this.fireMat.disableLighting=true;this.fireMat.backFaceCulling=false;this.fireMat.alphaMode=1;this.fireMat.disableDepthWrite=true;
  this.tracerMat=new StandardMaterial('tracer',scene);this.tracerMat.emissiveColor=new Color3(1,.76,.38);this.tracerMat.disableLighting=true;
  this.markMat=new StandardMaterial('blast-scorch',scene);this.markMat.diffuseTexture=new Texture(assetURL('textures/scorch.png'),scene);this.markMat.diffuseTexture.hasAlpha=true;this.markMat.useAlphaFromDiffuseTexture=true;this.markMat.diffuseColor=new Color3(.28,.22,.17);this.markMat.specularColor=Color3.Black();this.markMat.backFaceCulling=false;this.markMat.disableDepthWrite=true;
  const quad=new Geometry();quad.quad([[-.5,-.5,0],[.5,-.5,0],[.5,.5,0],[-.5,.5,0]],[0,0,-1]);
  this.templates={dust:quad.mesh('dust-template',scene,this.smokeMat),flash:quad.mesh('flash-template',scene,this.fireMat),mark:quad.mesh('mark-template',scene,this.markMat),debris:boxMesh('debris-template',scene,mats.earth,.07,.05,.055),tracer:boxMesh('tracer-template',scene,this.tracerMat,.012,.012,1),projectile:new Geometry().ellipsoid(0,0,0,.055,.075,.055,10,6).mesh('grenade-template',scene,mats.iron)};
  this.templates.dust.billboardMode=this.templates.flash.billboardMode=Mesh.BILLBOARDMODE_ALL;
  this.pools={};for(const [kind,template] of Object.entries(this.templates)){template.setEnabled(false);template.isPickable=false;this.pools[kind]=new BoundedPool(()=>{const mesh=template.clone(`${kind}-${this.serial++}`);mesh.isPickable=false;mesh.setEnabled(false);return mesh;},mesh=>mesh.dispose(),kind==='projectile'?40:kind==='mark'?32:kind==='tracer'?28:kind==='flash'?28:160);}
 }
 setQuality(profile){this.profile=profile;while(this.active.length>profile.effectsLimit){const p=this.active.shift();this.release(p.kind,p.mesh);}const marks=this.active.filter(p=>p.kind==='mark');for(const p of marks.slice(0,Math.max(0,marks.length-profile.markLimit)))p.ttl=0;}
 acquire(kind){if(kind!=='projectile'&&this.active.length>=this.profile.effectsLimit)return null;const mesh=this.pools[kind].acquire();if(!mesh)return null;mesh.position.setAll(0);mesh.rotation.setAll(0);mesh.scaling.setAll(1);mesh.visibility=1;mesh.setEnabled(true);return mesh;}
 release(kind,mesh){mesh.setEnabled(false);this.pools[kind].release(mesh);}
 particle(pos,kind,size,life,velocity={x:0,y:0,z:0}){const mesh=this.acquire(kind);if(!mesh)return;mesh.position.set(pos.x,pos.y,pos.z);mesh.scaling.setAll(size);mesh.visibility=kind==='dust'?.45:1;const p={kind,mesh,ttl:life,life,size,vx:velocity.x,vy:velocity.y,vz:velocity.z};this.active.push(p);return p;}
 event(e){
  if(e.type==='shot'){
   this.particle(e.from,'flash',.24,.042);
   if(++this.eventSerial%4===0){const mesh=this.acquire('tracer');if(mesh){const a=e.from,b=e.to,dx=b.x-a.x,dy=b.y-a.y,dz=b.z-a.z;mesh.position.set((a.x+b.x)*.5,(a.y+b.y)*.5,(a.z+b.z)*.5);mesh.scaling.z=Math.hypot(dx,dy,dz);mesh.rotation.y=Math.atan2(dx,dz);mesh.rotation.x=-Math.atan2(dy,Math.hypot(dx,dz));this.active.push({kind:'tracer',mesh,ttl:.04,life:.04,size:1});}}
  }
  if(e.type==='impact'){this.particle(e.pos,'dust',.21,.4,{x:.10,y:.24,z:0});for(let i=0;i<2;i++)this.particle(e.pos,'debris',.4,.3,{x:(i-.5)*1.1,y:.8,z:.3});}
  if(e.type==='explosion'){
   const pos={x:e.pos.x,y:e.pos.y+.16,z:e.pos.z};this.particle(pos,'flash',2.7,.105);
   for(const data of explosionParticles(this.profile,++this.eventSerial*37)){this.particle({x:pos.x+data.x,y:pos.y+data.y,z:pos.z+data.z},data.kind,data.size,data.life,{x:data.vx,y:data.vy,z:data.vz});}
   if(this.world){const y=this.world.terrain.height(pos.x,pos.z);if(pos.y-y<1.2){const marks=this.active.filter(p=>p.kind==='mark');if(marks.length>=this.profile.markLimit)marks[0].ttl=0;const mark=this.particle({x:pos.x,y:y+.038,z:pos.z},'mark',2.2,34);if(mark)mark.mesh.rotation.x=Math.PI/2;}
    const p=this.world.player,dist=Math.hypot(p.pos.x-pos.x,p.pos.y+1-pos.y,p.pos.z-pos.z);this.trauma=Math.min(1,this.trauma+Math.max(0,1-dist/19)*.65);
   }
  }
  if(e.type==='cannon')this.particle(e.pos,'flash',1.1,.09);
 }
 update(world,dt){this.world=world;this.trauma=Math.max(0,this.trauma-dt*2.6);let keep=0;
  for(const p of this.active){p.ttl-=dt;if(p.ttl<=0){this.release(p.kind,p.mesh);continue;}const t=1-p.ttl/p.life;
   if(p.kind==='dust'){p.mesh.position.x+=p.vx*dt;p.mesh.position.y+=p.vy*dt;p.mesh.position.z+=p.vz*dt;p.vx*=Math.exp(-dt*2);p.vz*=Math.exp(-dt*2);p.mesh.scaling.setAll(p.size*(1+t*2.5));p.mesh.visibility=Math.min(1,t*15)*(1-t)*.52;}
   if(p.kind==='debris'){p.vy-=12*dt;p.mesh.position.x+=p.vx*dt;p.mesh.position.y+=p.vy*dt;p.mesh.position.z+=p.vz*dt;p.mesh.rotation.x+=dt*7;p.mesh.rotation.z+=dt*5;const floor=world.terrain.height(p.mesh.position.x,p.mesh.position.z)+.027;if(p.mesh.position.y<floor){p.mesh.position.y=floor;p.vy=Math.abs(p.vy)*.25;p.vx*=.35;p.vz*=.35;}p.mesh.visibility=Math.min(1,p.ttl*3);}
   if(p.kind==='flash')p.mesh.visibility=Math.max(0,1-t);
   if(p.kind==='mark')p.mesh.visibility=Math.min(.65,p.ttl/8);
   this.active[keep++]=p;
  }this.active.length=keep;
  const live=new Set();for(const p of [...world.grenades,...world.shells]){live.add(p.id);let mesh=this.projectiles.get(p.id);if(!mesh){mesh=this.acquire('projectile');if(!mesh)continue;this.projectiles.set(p.id,mesh);}mesh.position.set(p.pos.x,p.pos.y,p.pos.z);mesh.rotation.x+=dt*3;mesh.rotation.z+=dt*2;}
  for(const [id,mesh] of this.projectiles)if(!live.has(id)){this.release('projectile',mesh);this.projectiles.delete(id);}
 }
 dispose(){this.active.length=0;this.projectiles.clear();for(const pool of Object.values(this.pools))pool.dispose();for(const mesh of Object.values(this.templates))mesh.dispose();for(const m of [this.smokeMat,this.fireMat,this.tracerMat,this.markMat])m.dispose();}
}
