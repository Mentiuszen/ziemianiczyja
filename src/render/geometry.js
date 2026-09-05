import {Mesh,VertexData} from './babylon.js';
import {GeometryData} from './geometry-data.js';
/** GPU adapter. GeometryData owns the tested coordinate/winding convention. */
export class Geometry extends GeometryData {
 mesh(name,scene,material){const m=new Mesh(name,scene),d=new VertexData();d.positions=this.p;d.normals=this.n;d.indices=this.i;d.uvs=this.uv;d.colors=this.colors;d.applyToMesh(m);m.material=material;m.isPickable=false;m.receiveShadows=true;return m;}
}
export function boxMesh(name,scene,material,w=1,h=1,d=1){return new Geometry().box(0,0,0,w,h,d).mesh(name,scene,material);}
