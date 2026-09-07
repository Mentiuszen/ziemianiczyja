import {TransformNode} from './babylon.js';
import {Geometry} from './geometry.js';
import {makeDoorLeafGeometry} from './briefing-door-geometry.js';

/** Timber door prop: Simulation supplies poses, the GPU owns only six material batches. */
export class BriefingDoorView {
 constructor(scene,mats,door){
  this.roots=[];this.meshes=[];
  for(const leaf of door.leaves){
   const root=new TransformNode(leaf.id,scene);this.roots.push(root);
   for(const [material,data] of Object.entries(makeDoorLeafGeometry(leaf.sign))){
    const mesh=Object.assign(new Geometry(),data).mesh(`${leaf.id}-${material}`,scene,mats[material]);
    mesh.parent=root;mesh.receiveShadows=true;this.meshes.push(mesh);
   }
  }
  this.sync(door);
 }
 sync(door){
  if(this.progress===door.progress)return;this.progress=door.progress;
  for(let i=0;i<this.roots.length;i++){const leaf=door.leaves[i],root=this.roots[i];root.position.set(leaf.pos.x,leaf.pos.y,leaf.pos.z);root.rotation.y=leaf.yaw;}
 }
 dispose(){for(const root of this.roots)root.dispose();this.roots.length=0;this.meshes.length=0;}
}
