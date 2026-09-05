import {Mesh,VertexData} from './babylon.js';

/** Render chunks share the exact collision height field. Boundary normals are
 * copied from the complete field, so chunk edges don't create lighting seams.
 */
export function terrainMeshes(scene,terrain,material,positions,normals,uvs,colors,tile=48) {
  const meshes=[];
  for(let startZ=0;startZ<terrain.nz-1;startZ+=tile) {
    for(let startX=0;startX<terrain.nx-1;startX+=tile) {
      const width=Math.min(tile,terrain.nx-1-startX),depth=Math.min(tile,terrain.nz-1-startZ);
      const data=new VertexData(),p=[],n=[],uv=[],c=[],indices=[];
      for(let z=0;z<=depth;z++)for(let x=0;x<=width;x++){
        const k=(startZ+z)*terrain.nx+startX+x;
        p.push(...positions.slice(k*3,k*3+3));n.push(...normals.slice(k*3,k*3+3));
        uv.push(...uvs.slice(k*2,k*2+2));c.push(...colors.slice(k*4,k*4+4));
      }
      for(let z=0;z<depth;z++)for(let x=0;x<width;x++){
        const a=z*(width+1)+x,b=a+1,c=a+width+1,d=c+1;
        indices.push(a,b,c,b,d,c);
      }
      Object.assign(data,{positions:p,normals:n,uvs:uv,colors:c,indices});
      const mesh=new Mesh(`terrain:${startX}:${startZ}`,scene);data.applyToMesh(mesh);
      mesh.material=material;mesh.receiveShadows=true;mesh.isPickable=false;
      mesh.metadata={static:true,terrain:true,shadowCaster:false};
      mesh.freezeWorldMatrix();mesh.doNotSyncBoundingInfo=true;meshes.push(mesh);
    }
  }
  return meshes;
}
