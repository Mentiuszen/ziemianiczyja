import {GeometryData} from './geometry-data.js';
import {BRIEFING_DOOR} from '../world/briefing-door.js';

/** Author once; three batches, not one draw call per plank/hinge. Pure CPU geometry. */
export function makeDoorLeafGeometry(sign){
 const d=BRIEFING_DOOR,width=d.width/2;
 const batches={wood:new GeometryData(),darkwood:new GeometryData(),iron:new GeometryData()};
 const part=(material,w,h,depth,x,y,z,tilt=0)=>{
  const g=batches[material],start=g.p.length;
  g.box(0,0,0,w,h,depth);
  const c=Math.cos(tilt),s=Math.sin(tilt);
  for(let i=start;i<g.p.length;i+=3){
   const py=g.p[i+1],pz=g.p[i+2],ny=g.n[i+1],nz=g.n[i+2];
   g.p[i]+=x;g.p[i+1]=y+py*c-pz*s;g.p[i+2]=z+py*s+pz*c;
   g.n[i+1]=ny*c-nz*s;g.n[i+2]=ny*s+nz*c;
  }
 };
 part('darkwood',d.thickness,d.height,width,0,0,0);
 for(let i=0;i<6;i++)part('wood',d.thickness+.006,d.height-.03,width/6-.014,0,0,-width/2+(i+.5)*width/6);
 for(const face of [-1,1]){
  for(const y of [-.76,.76])part('darkwood',.025,.12,width-.08,face*(d.thickness/2+.014),y,0);
  part('darkwood',.025,.085,Math.hypot(width-.16,1.48),face*(d.thickness/2+.016),0,0,sign*Math.atan2(1.48,width-.16));
  for(const y of [-.70,.70])part('iron',.026,.065,.30,face*(d.thickness/2+.032),y,sign*(width/2-.15));
  part('iron',.045,.16,.045,face*(d.thickness/2+.045),-.12,-sign*(width/2-.13));
 }
 return batches;
}
