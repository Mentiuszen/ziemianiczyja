/** Immutable XZ grid for static AABBs. Vertical tests remain exact in CollisionWorld. */
export class SpatialIndex {
 constructor(boxes,size=8){this.size=size;this.cells=new Map();for(const b of boxes){for(let z=Math.floor(b.min.z/size);z<=Math.floor(b.max.z/size);z++)for(let x=Math.floor(b.min.x/size);x<=Math.floor(b.max.x/size);x++){const key=x+','+z;if(!this.cells.has(key))this.cells.set(key,[]);this.cells.get(key).push(b);}}}
 bounds(x0,z0,x1,z1){const result=[],seen=new Set(),s=this.size;for(let z=Math.floor(z0/s);z<=Math.floor(z1/s);z++)for(let x=Math.floor(x0/s);x<=Math.floor(x1/s);x++)for(const b of this.cells.get(x+','+z)||[]){if(!seen.has(b)){seen.add(b);result.push(b);}}return result;}
 point(x,z,r=0){return this.bounds(x-r,z-r,x+r,z+r);}
 segment(o,d,length){
  // Amanatides-style XZ DDA visits each crossed cell once. Exact 3D slab tests
  // still decide hits; corner ties include both adjacent cells conservatively.
  let x=Math.floor(o.x/this.size),z=Math.floor(o.z/this.size);const sx=Math.sign(d.x),sz=Math.sign(d.z),dx=Math.abs(d.x)>1e-12?this.size/Math.abs(d.x):Infinity,dz=Math.abs(d.z)>1e-12?this.size/Math.abs(d.z):Infinity;
  let tx=dx===Infinity?Infinity:((x+(sx>0?1:0))*this.size-o.x)/d.x,tz=dz===Infinity?Infinity:((z+(sz>0?1:0))*this.size-o.z)/d.z;
  const seen=new Set(),result=[],visit=(xx,zz)=>{for(const b of this.cells.get(xx+','+zz)||[])if(!seen.has(b)){seen.add(b);result.push(b);}};
  visit(x,z);const limit=Math.ceil((Math.abs(d.x)+Math.abs(d.z))*length/this.size)+4;
  for(let count=0;count<limit;count++){if(Math.min(tx,tz)>length||(!sx&&!sz))break;if(Math.abs(tx-tz)<1e-9){visit(x+sx,z);visit(x,z+sz);x+=sx;z+=sz;tx+=dx;tz+=dz;}else if(tx<tz){x+=sx;tx+=dx;}else{z+=sz;tz+=dz;}visit(x,z);}return result;
 }
}
