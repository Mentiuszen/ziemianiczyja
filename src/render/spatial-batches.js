import {Geometry} from './geometry.js';

/** Merge by material AND region, so a distant fence cannot keep the whole map active. */
export class SpatialBatches {
  constructor(size = 24) { this.size=size;this.batches=new Map();this.writers=new Map(); }
  get(name,x,z) {
    const col=Math.floor(x/this.size),row=Math.floor(z/this.size),key=`${name}:${col}:${row}`;
    if(!this.batches.has(key)) this.batches.set(key,{name,col,row,geometry:new Geometry()});
    return this.batches.get(key).geometry;
  }
  writer(name) {
    if(!this.writers.has(name))this.writers.set(name,{
      box:(x,y,z,...rest)=>this.get(name,x,z).box(x,y,z,...rest),
      ellipsoid:(x,y,z,...rest)=>this.get(name,x,z).ellipsoid(x,y,z,...rest),
      cylinder:(a,b,...rest)=>this.get(name,(a[0]+b[0])/2,(a[2]+b[2])/2).cylinder(a,b,...rest),
      blade:(x,y,z,w,h,yaw,color)=>{const dx=Math.cos(yaw)*w/2,dz=Math.sin(yaw)*w/2;return this.get(name,x,z).quad([[x-dx,y,z-dz],[x+dx,y,z+dz],[x+dx,y+h,z+dz],[x-dx,y+h,z-dz]],[-Math.sin(yaw),0,Math.cos(yaw)],[1,1],color);}
    });
    return this.writers.get(name);
  }
  meshes(scene,materials) {
    return [...this.batches.entries()].map(([key,batch])=>{
      const mesh=batch.geometry.mesh(`static:${key}`,scene,materials[batch.name]||materials.earth);
      mesh.freezeWorldMatrix();
      mesh.doNotSyncBoundingInfo=true;
      // Thin grass blades and wire don't justify a second pass into the shadow map.
      mesh.metadata={static:true,shadowCaster:!['grass','iron','rope'].includes(batch.name)};
      return mesh;
    });
  }
}
