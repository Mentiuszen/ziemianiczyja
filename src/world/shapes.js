import {v3,rayBox} from '../core/math.js';

/** AABB broadphase with an optional oriented XZ footprint (the existing tank hull). */
export function orientedBounds(id,pos,yaw,halfX,halfZ,minY,maxY){
 const c=Math.abs(Math.cos(yaw)),s=Math.abs(Math.sin(yaw)),rx=halfX*c+halfZ*s,rz=halfX*s+halfZ*c;
 return{id,min:v3(pos.x-rx,minY,pos.z-rz),max:v3(pos.x+rx,maxY,pos.z+rz),obb:{x:pos.x,z:pos.z,yaw,halfX,halfZ}};
}
export function footprint(box){
 return box.obb||{x:(box.min.x+box.max.x)/2,z:(box.min.z+box.max.z)/2,yaw:0,halfX:(box.max.x-box.min.x)/2,halfZ:(box.max.z-box.min.z)/2};
}
function local(point,frame){const dx=point.x-frame.x,dz=point.z-frame.z,c=Math.cos(frame.yaw),s=Math.sin(frame.yaw);return{x:dx*c-dz*s,z:dx*s+dz*c};}
export function footprintOverlap(point,radius,box,epsilon=0){
 if(!box.obb)return point.x+radius>box.min.x+epsilon&&point.x-radius<box.max.x-epsilon&&point.z+radius>box.min.z+epsilon&&point.z-radius<box.max.z-epsilon;
 const f=box.obb,q=local(point,f),dx=Math.max(0,Math.abs(q.x)-f.halfX),dz=Math.max(0,Math.abs(q.z)-f.halfZ);
 return dx*dx+dz*dz<(radius-epsilon)**2;
}
/** Near-face corrections preserve the side of a wall/hull when recovering a bad pose. */
export function shapeCorrections(point,radius,height,box,epsilon){
 const f=footprint(box),q=local(point,f),c=Math.cos(f.yaw),s=Math.sin(f.yaw);
 const exits=[v3(-f.halfX-radius-q.x-epsilon,0,0),v3(f.halfX+radius-q.x+epsilon,0,0),v3(0,0,-f.halfZ-radius-q.z-epsilon),v3(0,0,f.halfZ+radius-q.z+epsilon),v3(0,box.min.y-height-point.y-epsilon,0),v3(0,box.max.y-point.y+epsilon,0)];
 const length=v=>Math.hypot(v.x,v.y,v.z),options=[];
 for(let i=0;i<exits.length;i+=2){const a=exits[i],b=exits[i+1],v=length(a)<=length(b)?a:b;options.push(v3(v.x*c+v.z*s,v.y,-v.x*s+v.z*c));}
 return{depth:Math.min(...exits.map(length)),options};
}
export function rayShape(origin,direction,box,max,expansion=0){
 if(!box.obb&&expansion===0)return rayBox(origin,direction,box,max);
 const f=footprint(box),q=local(origin,f),c=Math.cos(f.yaw),s=Math.sin(f.yaw);
 return rayBox(v3(q.x,origin.y,q.z),v3(direction.x*c-direction.z*s,direction.y,direction.x*s+direction.z*c),{min:v3(-f.halfX-expansion,box.min.y-expansion,-f.halfZ-expansion),max:v3(f.halfX+expansion,box.max.y+expansion,f.halfZ+expansion)},max);
}
/** Four separating axes are sufficient for two XZ rectangles. */
export function footprintsIntersect(a,b,epsilon=0){
 const fa=footprint(a),fb=footprint(b),ca=Math.cos(fa.yaw),sa=Math.sin(fa.yaw),cb=Math.cos(fb.yaw),sb=Math.sin(fb.yaw);
 const axes=[[ca,-sa],[sa,ca],[cb,-sb],[sb,cb]],dx=fb.x-fa.x,dz=fb.z-fa.z;
 for(const [x,z] of axes){
  const ra=fa.halfX*Math.abs(x*ca-z*sa)+fa.halfZ*Math.abs(x*sa+z*ca);
  const rb=fb.halfX*Math.abs(x*cb-z*sb)+fb.halfZ*Math.abs(x*sb+z*cb);
  if(Math.abs(dx*x+dz*z)>=ra+rb-epsilon)return false;
 }return true;
}
