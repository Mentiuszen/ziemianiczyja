import {northZ,RUIN_BUILDINGS} from '../data/world-map.js';
import {TRENCHES,RAMPS} from '../data/cambrai.js';
import {rng} from '../core/math.js';
/** Collision descriptors are also consumed by the renderer, avoiding separate walls. */
export function makeLayout(terrain){const boxes=[];let serial=0;
 const rawBox=(x,y,z,w,h,d,mat='wood',extra={})=>{const b={id:`solid-${serial++}`,x,y,z,w,h,d,mat,...extra,min:{x:x-w/2,y:y-h/2,z:z-d/2},max:{x:x+w/2,y:y+h/2,z:z+d/2}};if(extra.yaw){const c=Math.abs(Math.cos(extra.yaw)),s=Math.abs(Math.sin(extra.yaw)),rx=(w*c+d*s)/2,rz=(w*s+d*c)/2;b.min.x=x-rx;b.max.x=x+rx;b.min.z=z-rz;b.max.z=z+rz;}boxes.push(b);return b;};
 const box=(x,y,z,w,h,d,mat,extra)=>rawBox(x,y,northZ(z),w,h,d,mat,extra);
 const groundBox=(x,z,w,h,d,mat='wood',extra={})=>box(x,terrain.height(x,northZ(z))+h/2,z,w,h,d,mat,extra);
 // Machine-gun shelter: physical roof, rear entrance, front firing aperture.
 const y=terrain.height(23,60);
 box(19.8,y+1.2,60,.65,2.4,6.4,'concrete');box(26.2,y+1.2,60,.65,2.4,6.4,'concrete');
 box(23,y+2.45,60,7.2,.55,7,'concrete');
 box(23,y+.43,57,6.4,.86,.7,'bags');box(23,y+2,57,6.4,.55,.7,'concrete');
 box(20.8,y+1.2,63,2.6,2.4,.65,'concrete');box(25.4,y+1.2,63,1.9,2.4,.65,'concrete');
 // Forward dressing shelter. Its entrance does not depend on a surviving NPC.
 const ay=terrain.height(-27,69);
 box(-30.2,ay+1.05,67,.6,2.1,4,'wood');box(-23.8,ay+1.05,69,.6,2.1,8,'wood');box(-27,ay+2.2,69,7,.45,8,'wood');
 // Ruined communications house. Open southern approach and two real doors.
 const ry=terrain.height(4,159);
 box(-2,ry+1.9,114.5,.7,3.8,3,'brick');box(-2,ry+.57,118.25,.7,1.14,4.5,'brick');box(-2,ry+3.4,118.25,.7,.8,4.5,'brick');box(-2,ry+2,122.75,.7,4,4.5,'brick');
 box(10,ry+.95,116.5,.7,1.9,3,'brick');box(10,ry+.65,120,.7,1.3,4,'brick');box(10,ry+1.6,123.5,.7,3.2,3,'brick');
 for(const x of [-.8,2,4.8,7.6])box(x,ry+3.10,123.4,.16,.21,3.1,'darkwood',{kind:'roof-beam'});
 box(4,ry+3.05,123.8,12.4,.22,.21,'wood',{kind:'roof-beam'});
 for(let i=0;i<12;i++)box(-2,ry+4.10+(i%3)*.09,121+i*.34,.7,.20,.30,'brick',{kind:'broken-crown'});
 for(const [x,z,w,d] of [[-.5,121,1.4,1.3],[8,123,2,1.4],[-1,115,1.3,.7]])groundBox(x,z,w,.24,d,'rubble',{kind:'rubble'});
 box(1.2,ry+1.5,125,6.5,3,.7,'brick');box(8.8,ry+1.1,125,2.4,2.2,.7,'brick');
 box(-.7,ry+.65,113,3,1.3,.8,'brick');box(8.6,ry+.6,113,3,1.2,.8,'brick');
 box(4,ry+1.2,118.8,2.2,.16,1,'wood',{table:true});box(3.2,ry+.57,118.8,.14,1.14,.7,'wood');box(4.8,ry+.57,118.8,.14,1.14,.7,'wood');
 // Authored cover. Gaps are wide enough for navigation.
 for(const [x,z,w] of [[-37,39,5],[-19,35,4],[27,37,5],[37,45,5],[-2,71,4],[33,77,5],[-13,86,5],[21,101,4],[-15,132,5],[24,136,6],[0,132,5]])groundBox(x,z,w,.95,1.15,'bags',{cover:true});
 for(const [x,z,w,h,d] of [[-43,117,6,3,1],[-38,122,1,3.5,9],[29,119,1,4,8],[33,115,8,2,1],[38,130,7,3,1],[42,134,1,2,7],[-39,91,5,1.8,1],[35,91,1,2.2,6]])groundBox(x,z,w,h,d,'brick');
 // Initial supplies and protected posts.
 for(const [x,z] of [[3,4],[-26,65],[6,117],[-9,2],[28,57],[31,94]])groundBox(x,z,1.3,.65,.85,'crate');
 const random=rng(404);for(let i=0;i<28;i++){const x=(random()-.5)*104,z=20+random()*120;if(Math.abs(x-13)<6||Math.abs(x+13)<6||terrain.trenchDistance(x,z)<5)continue;groundBox(x,z,.5+random(),.25+random()*.3,.5+random(),'rubble');}
 // Wire is a real narrow obstacle, with marked breaks on both viable approaches.
 for(const [x,z,w] of [[-43,30,10],[-5,31,9],[31,31,22],[-42,83,10],[29,98,18]])groundBox(x,z,w,.9,.6,'wire',{wire:true});

 // Collidable timber fences: gaps between rails remain real gaps for bullets.
 const ground=(x,z,w,h,d,mat='wood',extra={})=>rawBox(x,terrain.height(x,z)+h/2,z,w,h,d,mat,extra);
 const fence=(x,z,length,alongZ=false)=>{
  const count=Math.floor(length/2.2);for(let i=0;i<=count;i++){
   const xx=x+(alongZ?0:i*2.2),zz=z+(alongZ?i*2.2:0),y=terrain.height(xx,zz);
   rawBox(xx,y+.65,zz,.16,1.3,.16,'wood',{kind:'fence'});
   if(i<count)for(const h of [.48,1.02])rawBox(xx+(alongZ?0:1.1),y+h,zz+(alongZ?1.1:0),alongZ?.10:2.2,.14,alongZ?2.2:.10,'wood',{kind:'fence'});
  }
 };
 fence(-88,29,19);fence(-58,29,11);fence(63,119,24,true);fence(63,180,18,true);fence(-84,183,18);fence(-57,183,12);
 // Farm buildings share exactly the same solid blocks for rendering, bullets and movement.
 for(const house of RUIN_BUILDINGS){const {x,z,w,d,h}=house,y=terrain.height(x,z),th=.5;
  rawBox(x,y+.08,z,w+.45,.16,d+.45,'concrete',{kind:'foundation'});
  const doorway=3,side=(w-doorway)/2;
  for(const sign of [-1,1]){
   rawBox(x+sign*(doorway/2+side/2),y+h*.5,z-d/2,side,h,th,'brick',{kind:'ruin'});
   // End walls have genuine full-height breaks, not painted doors.
   for(const off of [-d*.34,d*.34])rawBox(x+sign*w/2,y+h*.5,z+off,th,h,d*.3,'brick',{kind:'ruin'});
   rawBox(x+sign*w/2,y+.55,z,th,1.1,d*.38,'brick',{kind:'ruin'});
   rawBox(x+sign*w/2,y+h-.35,z,th,.7,d*.38,'brick',{kind:'ruin'});
  }
  rawBox(x,y+h-.27,z-d/2,doorway,.54,th,'brick',{kind:'lintel'});
  for(let beam=0;beam<3;beam++)rawBox(x,y+h-.12,z+d*(.24+beam*.1),w+.20,.18,.14,'darkwood',{kind:'roof-beam'});
  rawBox(x-w*.20,y+h*.38,z+d/2,w*.60,h*.76,th,'brick',{kind:'ruin'});
  rawBox(x+w*.40,y+h*.5,z+d/2,w*.2,h,th,'brick',{kind:'ruin'});
  for(let i=0;i<8;i++){const xx=x-w*.42+i*w*.12;rawBox(xx,y+h+(.5-Math.abs(i-3.5)/7)*.7,z-d/2,w*.12,.3+random()*.4,th,'brick',{kind:'broken-crown'});}
  ground(x-w*.18,z+d*.15,w*.30,.22,1.5,'rubble',{kind:'rubble'});
  ground(x+w*.22,z+d*.28,1.7,.30,d*.24,'rubble',{kind:'rubble'});
 }
 // The side routes contain useful cover and supply positions, not just distant decoration.
 for(const [x,z,w] of [[-59,40,4],[-74,74,4],[-52,115,5],[-72,141,4],[67,79,5],[56,130,4],[34,178,5],[-20,181,4]])ground(x,z,w,.92,1.05,'bags',{cover:true});
 for(const [x,z] of [[-70,161],[59,167],[-40,192],[-48,-14],[36,-14]])ground(x,z,1.25,.8,.85,'crate');
 // Trench fixtures are authored ONCE here; the renderer consumes the same descriptors.
 for(const line of TRENCHES)for(let i=1;i<line.length;i++){
  const a=line[i-1],b=line[i],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),yaw=Math.atan2(dx,dz),nx=Math.cos(yaw),nz=-Math.sin(yaw);
  for(let d=.8;d<length-.6;d+=1.4){const x=a[0]+dx*d/length,z=a[1]+dz*d/length,y=terrain.height(x,z);
   if(terrain.base(x,z)-y<1.25)continue;
   rawBox(x,y+.045,z,1.48,.09,1.22,'wood',{kind:'duckboard',yaw});
   for(const side of [-1,1]){const wx=x+nx*1.7*side,wz=z+nz*1.7*side;if(terrain.height(wx,wz)>y+.65)continue;
    if(RAMPS.some(r=>Math.abs(wx-r.x)<r.width/2+.7&&wz>=r.z0-1&&wz<=r.z1+1))continue;
    rawBox(wx,y+.8,wz,.13,1.6,.12,'darkwood',{kind:'revetment',yaw});
    for(let k=0;k<4;k++)rawBox(wx,y+.2+k*.37,wz,.075,.25,1.28,'wood',{kind:'revetment',yaw});
   }
  }
 }
 // Orchard trunks and burned stumps have body colliders; branches are decorative overhead.
 for(const [x,z,h] of [[-78,130,3.9],[-81,151,5],[-77,172,3.3],[77,152,4.8],[82,186,4],[54,201,3.5],[-48,173,2.8],[47,76,2.4],[-45,29,1.6]])ground(x,z,.62,h,.62,'darkwood',{kind:'stump'});
 return boxes;
}
