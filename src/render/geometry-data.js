/** Pure authoring buffers for Babylon's LEFT-handed native meshes.
 * glTF is RIGHT-handed and is intentionally not routed through this builder.
 * Front faces use the winding implied by the supplied exterior normal, not the
 * incidental order a caller happened to list its points in.
 */
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const sub=(a,b)=>a.map((v,i)=>v-b[i]);
const unit=a=>{const l=Math.hypot(...a)||1;return a.map(v=>v/l);};
export class GeometryData {
 constructor(){this.p=[];this.n=[];this.uv=[];this.i=[];this.colors=[];}
 face(points,normals,uvs,color=[1,1,1,1]){
  const offset=this.p.length/3;
  for(let k=0;k<points.length;k++){this.p.push(...points[k]);this.n.push(...normals[k]);this.uv.push(...uvs[k]);this.colors.push(...color);}
  const c=cross(sub(points[1],points[0]),sub(points[2],points[0]));
  const reverse=c.reduce((sum,v,i)=>sum+v*normals[0][i],0)>0;
  for(let k=1;k<points.length-1;k++)this.i.push(offset,offset+(reverse?k+1:k),offset+(reverse?k:k+1));
  return this;
 }
 quad(points,normal,uvScale=[1,1],color=[1,1,1,1]){return this.face(points,points.map(()=>normal),[[0,0],[uvScale[0],0],[uvScale[0],uvScale[1]],[0,uvScale[1]]],color);}
 box(x,y,z,w,h,d,yaw=0,color=[1,1,1,1]){
  const c=Math.cos(yaw),s=Math.sin(yaw),tr=p=>[x+p[0]*c+p[2]*s,y+p[1],z-p[0]*s+p[2]*c],nr=p=>[p[0]*c+p[2]*s,p[1],-p[0]*s+p[2]*c];w/=2;h/=2;d/=2;
  const faces=[[[[-w,-h,d],[w,-h,d],[w,h,d],[-w,h,d]],[0,0,1],w*2,h*2],[[[w,-h,-d],[-w,-h,-d],[-w,h,-d],[w,h,-d]],[0,0,-1],w*2,h*2],[[[w,-h,d],[w,-h,-d],[w,h,-d],[w,h,d]],[1,0,0],d*2,h*2],[[[-w,-h,-d],[-w,-h,d],[-w,h,d],[-w,h,-d]],[-1,0,0],d*2,h*2],[[[-w,h,d],[w,h,d],[w,h,-d],[-w,h,-d]],[0,1,0],w*2,d*2],[[[-w,-h,-d],[w,-h,-d],[w,-h,d],[-w,-h,d]],[0,-1,0],w*2,d*2]];
  for(const [points,normal,u,v] of faces)this.quad(points.map(tr),nr(normal),[u,v],color);return this;
 }
 cylinder(a,b,r=.1,top=r,sides=8,color=[1,1,1,1]){
  const delta=sub(b,a),length=Math.hypot(...delta);if(length<1e-7||r<=0||top<=0)return this;
  const axis=unit(delta),tangent=unit(cross(axis,Math.abs(axis[1])>.9?[1,0,0]:[0,1,0])),bitangent=cross(axis,tangent);
  const radial=t=>tangent.map((v,i)=>v*Math.cos(t)+bitangent[i]*Math.sin(t));
  const point=(base,radius,t)=>base.map((v,i)=>v+radial(t)[i]*radius);
  for(let j=0;j<sides;j++){
   const t=j/sides*Math.PI*2,next=(j+1)/sides*Math.PI*2,normal=unit(radial((t+next)*.5).map((v,i)=>v+axis[i]*(r-top)/length));
   this.quad([point(a,r,t),point(a,r,next),point(b,top,next),point(b,top,t)],normal,[2*Math.PI*r/sides,length],color);
   for(const [base,radius,n] of [[a,r,axis.map(v=>-v)],[b,top,axis]])this.face([base,point(base,radius,t),point(base,radius,next)],[n,n,n],[[.5,.5],[.5+Math.cos(t)*.5,.5+Math.sin(t)*.5],[.5+Math.cos(next)*.5,.5+Math.sin(next)*.5]],color);
  }return this;
 }
 ellipsoid(x,y,z,rx,ry,rz,segments=12,rings=8,yaw=0,color=[1,1,1,1]){
  const c=Math.cos(yaw),s=Math.sin(yaw),rot=p=>[p[0]*c+p[2]*s,p[1],p[2]*c-p[0]*s];
  const vertex=(row,col)=>{const a=row/rings*Math.PI,b=col/segments*Math.PI*2,q=[Math.sin(a)*Math.cos(b),Math.cos(a),Math.sin(a)*Math.sin(b)],p=rot([q[0]*rx,q[1]*ry,q[2]*rz]);return {p:[x+p[0],y+p[1],z+p[2]],n:rot(unit([q[0]/rx,q[1]/ry,q[2]/rz])),uv:[col/segments,row/rings]};};
  for(let row=0;row<rings;row++)for(let col=0;col<segments;col++){
   const a=vertex(row,col),b=vertex(row,col+1),cc=vertex(row+1,col),d=vertex(row+1,col+1);
   const triangles=[];if(row>0)triangles.push([a,b,cc]);if(row<rings-1)triangles.push([b,d,cc]);
   for(const t of triangles)this.face(t.map(v=>v.p),t.map(v=>v.n),t.map(v=>v.uv),color);
  }return this;
 }
}
