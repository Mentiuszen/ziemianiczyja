import {BriefingDoorView} from './briefing-door-view.js';
import {Geometry,boxMesh} from './geometry.js';
import {StandardMaterial,Texture,Color3} from './babylon.js';
import {assetURL} from './assets.js';
import {HQ} from '../data/world-map.js';

/** Render-only support layer. Ownership of trajectories and damage remains in Simulation. */
export class SupportView {
 constructor(scene,assets,mats,world,language='pl'){
  this.door=new BriefingDoorView(scene,mats,world.briefingDoor);
  this.scene=scene;this.assets=assets;this.mats=mats;this.guns=new Map();this.planes=new Map();this.wire=new Map();this.lastDust=-1;
  for(const g of world.fieldGuns){const m=assets.instantiate(g.model,g.id);for(const mesh of m.meshes)mesh.receiveShadows=true;this.guns.set(g.id,m);}
  for(const b of world.layout.filter(b=>b.breakable)){
   const g=new Geometry();
   for(let x=b.min.x+.12;x<b.max.x;x+=1.3)g.cylinder([x,b.min.y,b.z],[x+.10,b.max.y+.20,b.z],.032,.026,6);
   for(let row=0;row<3;row++)for(let x=b.min.x;x<b.max.x-.2;x+=.4){const y=b.min.y+.20+row*.26;g.cylinder([x,y,b.z],[x+.4,y+.02,b.z],.013,.013,5);g.cylinder([x+.20,y-.09,b.z-.08],[x+.20,y+.09,b.z+.08],.012,.012,4);}
   const mesh=g.mesh('breakable:'+b.id,scene,mats.iron);mesh.freezeWorldMatrix();mesh.metadata={breakable:b.id};mesh.setEnabled(!world.destroyedObstacles.includes(b.id));this.wire.set(b.id,mesh);
  }
  const y=world.terrain.height(HQ.x,HQ.z)+.20;
  const mapMat=new StandardMaterial('operations-map',scene);this.mapTextures={pl:new Texture(assetURL('textures/briefing-map.jpg'),scene),en:new Texture(assetURL('textures/briefing-map-en.png'),scene)};this.mapMaterial=mapMat;this.setLanguage(language);mapMat.specularColor=Color3.Black();mapMat.diffuseColor=new Color3(.93,.92,.82);
  const map=new Geometry();map.quad([[31.74,y+1.166,-6.43],[34.24,y+1.166,-6.43],[34.24,y+1.166,-5.31],[31.74,y+1.166,-5.31]],[0,1,0]);map.mesh('briefing-map',scene,mapMat).receiveShadows=true;
  const deco=new Geometry();
  // Lantern frame and chimney; lighting remains within the existing bounded light rig.
  deco.cylinder([34.03,y+1.18,-5.39],[34.03,y+1.47,-5.39],.072,.068,12);
  for(const x of [33.96,34.10])deco.cylinder([x,y+1.18,-5.39],[x,y+1.61,-5.39],.01,.01,6);
  deco.cylinder([33.96,y+1.61,-5.39],[34.10,y+1.61,-5.39],.012,.012,6);
  deco.mesh('briefing-lantern-frame',scene,mats.iron);
  const glow=new StandardMaterial('lantern-glass',scene);glow.emissiveColor=new Color3(.72,.40,.12);glow.diffuseColor=new Color3(.8,.49,.16);
  const bulb=boxMesh('briefing-lantern-light',scene,glow,.073,.16,.07);bulb.position.set(34.03,y+1.36,-5.39);
  const papers=new Geometry();for(let i=0;i<4;i++)papers.box(31.82+i*.025,y+1.17+i*.006,-5.48,.30,.008,.30,-.15);papers.mesh('briefing-orders',scene,mats.paper);
 }
 setLanguage(language){this.mapMaterial.diffuseTexture=this.mapTextures[language==='en'?'en':'pl'];}
 sync(w,dt,effects,profile,poses){
  this.door.sync(w.briefingDoor);
  for(const [id,mesh] of this.wire)mesh.setEnabled(!w.destroyedObstacles.includes(id));
  for(const g of w.fieldGuns){const model=this.guns.get(g.id),gp=poses?.get(g.id)||g;model.root.position.set(gp.pos.x-Math.sin(gp.yaw)*g.recoil*.07,gp.pos.y,gp.pos.z-Math.cos(gp.yaw)*g.recoil*.07);model.root.rotation.y=gp.yaw;}
  const live=new Set();for(const p of w.air.planes){
   live.add(p.id);let model=this.planes.get(p.id);
   if(!model){model=this.assets.instantiate(p.model,p.id);const anchor=model.root.getDescendants().find(n=>n.name.endsWith(':Propeller'));
    if(anchor){const prop=new Geometry();prop.ellipsoid(0,0,0,1.03,.065,.025,12,6);prop.ellipsoid(0,0,0,.065,1.03,.025,12,6);const mesh=prop.mesh(p.id+'-propeller',this.scene,this.mats.darkwood);mesh.parent=anchor;model.propeller=mesh;}
    this.planes.set(p.id,model);
   }
   const pp=poses?.get(p.id)||p;model.root.position.set(pp.pos.x,pp.pos.y,pp.pos.z);model.root.rotation.set(-Math.atan2(p.velocity.y,Math.hypot(p.velocity.x,p.velocity.z)),pp.yaw,pp.bank+Math.sin(pp.age*.6)*.02);
   if(model.propeller)model.propeller.rotation.z=pp.age*73;
  }
  for(const [id,model] of this.planes)if(!live.has(id)){model.entry.dispose();model.root.dispose();this.planes.delete(id);}
  if(dt>0&&w.time>=this.lastDust){
   this.lastDust=w.time+(profile.label==='Low'?.48:.22);
   for(const t of w.tanks){
    if(t.moving){for(const side of [-1,1])effects.particle({x:t.pos.x+side*1.45,y:t.pos.y+.18,z:t.pos.z-2.7},'dust',.40,.9,{x:side*.32,y:.32,z:-.28});}
    if(t.state==='destroyed'||!t.gunWorking){effects.particle({x:t.pos.x,y:t.pos.y+2.15,z:t.pos.z-.2},'dust',1.0,2.5,{x:.35,y:.85,z:.12});if(t.state==='destroyed')effects.particle({x:t.pos.x,y:t.pos.y+1.85,z:t.pos.z-.7},'flash',.65,.25);}
    else if(t.moving)effects.particle({x:t.pos.x,y:t.pos.y+2.35,z:t.pos.z-1.8},'dust',.18,.8,{x:.10,y:.5,z:-.13});
   }
  }
 }
 dispose(){this.door.dispose();for(const model of [...this.guns.values(),...this.planes.values()]){model.entry.dispose();model.root.dispose();}this.guns.clear();this.planes.clear();this.wire.clear();}
}
