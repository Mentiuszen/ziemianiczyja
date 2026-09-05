import {MAP,LANDMARKS,roadX,RUIN_BUILDINGS,HQ} from '../data/world-map.js';
import {clamp,lerp,smooth,rng,segmentDistance} from '../core/math.js';
import {TRENCHES,RAMPS} from '../data/cambrai.js';
/** Shared triangular height field: rendering, movement, sight and projectiles agree. */
export class Terrain {
 constructor(){
  this.minX=MAP.minX;this.minZ=MAP.minZ;this.width=MAP.width;this.depth=MAP.depth;this.step=1;
  this.nx=this.width+1;this.nz=this.depth+1;this.heights=new Float32Array(this.nx*this.nz);
  const random=rng(19171120);this.craters=[];
  for(let i=0;i<105;i++){const x=(random()-.5)*177,z=12+random()*193;if(Math.abs(x-13)<7||Math.abs(x+13)<7)continue;this.craters.push({x,z,r:2.1+random()*3.9,depth:.65+random()*.65});}
  this.segments=[];for(const line of TRENCHES)for(let i=1;i<line.length;i++)this.segments.push([line[i-1],line[i]]);
  for(let z=0;z<this.nz;z++)for(let x=0;x<this.nx;x++)this.heights[z*this.nx+x]=this.raw(x+this.minX,z+this.minZ);
 }
 base(x,z){return .28*Math.sin(x*.08)*Math.cos(z*.042)+.19*Math.sin(z*.085+x*.026)+.42*Math.sin(x*.037+.4)*Math.sin(z*.019);}
 trenchDistance(x,z){let best=999;for(const [a,b] of this.segments)best=Math.min(best,segmentDistance(x,z,a,b));return best;}
 raw(x,z){let y=this.base(x,z),cut=0;const d=this.trenchDistance(x,z);if(d<3.2)cut=2.15*(1-smooth(1.8,3.15,d));
  // Broad earth/fascine causeways assigned to tanks; infantry also uses them.
  for(const lane of [-13,13]){if(z>42&&z<153)cut*=smooth(2.4,4.3,Math.abs(x-lane));}
  for(const r of RAMPS){if(z<r.z0-2||z>r.z1+2)continue;const t=clamp((z-r.z0)/(r.z1-r.z0),0,1),side=1-smooth(r.width*.5,r.width*.5+1.2,Math.abs(x-r.x));const amount=2.15*(r.deepAtStart?1-t:t)*side;cut=Math.max(cut,amount);}
  if(cut<.25)for(const c of this.craters){const q=Math.hypot(x-c.x,z-c.z)/c.r;if(q<1.25){const hole=-c.depth*(1-smooth(0,1,q)),rim=.24*Math.exp(-(((q-.97)*7)**2));y+=hole+rim;}}
  // Ruins stand on level ground, not a visually floating foundation.
  if(z>154&&z<168&&x>-3&&x<12)y=this.base(4,159);
  // A shallow winding supply lane and wheel ruts, not a flat decorative stripe.
  const road=Math.abs(x-roadX(z));if(cut<.1&&road<3.6){y-=.12*(1-smooth(2.6,3.6,road));for(const side of [-1,1])y-=.065*Math.exp(-(((x-roadX(z)-side*.8)/.22)**2));}
  for(const h of RUIN_BUILDINGS)if(Math.abs(x-h.x)<h.w/2+.6&&Math.abs(z-h.z)<h.d/2+.6)y=this.base(h.x,h.z);
  // Level HQ apron and artillery emplacement. Keep passage outside the room physical.
  if(Math.abs(x-HQ.x)<HQ.w/2+1.2&&Math.abs(z-HQ.z)<HQ.d/2+1.2){y=this.base(HQ.x,HQ.z);cut=0;}
  if(Math.abs(x-36)<4.5&&Math.abs(z-110)<4.5){y=this.base(36,110);cut=0;}
  const edge=Math.max(smooth(94,107,Math.abs(x)),smooth(214,239,z),1-smooth(-32,-24,z));
  return y-cut+edge*(2.5+.8*Math.sin(z*.037+x*.032));
 }
 height(x,z){const fx=clamp(x-this.minX,0,this.width-.00001),fz=clamp(z-this.minZ,0,this.depth-.00001),ix=Math.floor(fx),iz=Math.floor(fz),u=fx-ix,v=fz-iz,k=iz*this.nx+ix;
  const a=this.heights[k],b=this.heights[k+1],c=this.heights[k+this.nx],d=this.heights[k+this.nx+1];
  return u+v<=1?a+(b-a)*u+(c-a)*v:d+(c-d)*(1-u)+(b-d)*(1-v);
 }
}
