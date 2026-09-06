export function worldToMinimap(point,center,size,range){
 const dx=point.x-center.x,dz=point.z-center.z;return{x:size/2+dx*size/(2*range),y:size/2-dz*size/(2*range),inside:Number.isFinite(dx)&&Number.isFinite(dz)&&Math.max(Math.abs(dx),Math.abs(dz))<=range};
}
/** Babylon matrices use column-major storage. Output always uses CSS, not render pixels. */
export function projectToHud(point,camera,viewportCss){
 const matrix=camera.getTransformationMatrix?camera.getTransformationMatrix():camera.getViewMatrix().multiply(camera.getProjectionMatrix());
 const m=matrix.m||matrix.asArray();const {x,y,z}=point;
 const w=x*m[3]+y*m[7]+z*m[11]+m[15];if(!Number.isFinite(w)||w<=.00001)return{x:0,y:0,depth:0,visible:false};
 const nx=(x*m[0]+y*m[4]+z*m[8]+m[12])/w,ny=(x*m[1]+y*m[5]+z*m[9]+m[13])/w,nz=(x*m[2]+y*m[6]+z*m[10]+m[14])/w;
 const half=camera.isNDCHalfZRange??camera.getScene?.().getEngine().isNDCHalfZRange??false;
 const depth=half?nz:(nz+1)/2;
 return{x:viewportCss.left+(nx+1)*viewportCss.width/2,y:viewportCss.top+(1-ny)*viewportCss.height/2,depth,visible:[nx,ny,depth].every(Number.isFinite)&&Math.abs(nx)<=1&&Math.abs(ny)<=1&&depth>=0&&depth<=1};
}

/** Circular presentation introduced in revision 2. The original square projector stays pure. */
export function worldToRadar(point,center,size,range){
 const q=worldToMinimap(point,center,size,range),dx=point.x-center.x,dz=point.z-center.z;
 return {...q,inside:Number.isFinite(dx)&&Number.isFinite(dz)&&Math.hypot(dx,dz)<=range};
}
export function radarEdge(point,size,padding=8){
 const cx=size/2,cy=size/2,dx=point.x-cx,dy=point.y-cy,length=Math.hypot(dx,dy),radius=Math.max(0,size/2-padding);
 if(!Number.isFinite(length))return {x:cx,y:cy};
 const ratio=length>radius?radius/length:1;return{x:cx+dx*ratio,y:cy+dy*ratio};
}
