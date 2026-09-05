import {SpatialIndex} from './spatial-index.js';
import {MAP} from '../data/world-map.js';
import {v3,add,mul,sub,norm,dist,rayBox,raySphere} from '../core/math.js';
export const BODY_HEIGHT={stand:1.74,crouch:1.16,prone:.48};
export const EYE_HEIGHT={stand:1.61,crouch:1.04,prone:.38};
export function eye(actor){return v3(actor.pos.x,actor.pos.y+(EYE_HEIGHT[actor.stance]??1.61),actor.pos.z);}
export function hitSpheres(actor){const p=actor.pos,stance=actor.stance||'stand',dy=stance==='crouch'?-.5:0;
 if(stance==='prone'){const sx=Math.sin(actor.yaw),cz=Math.cos(actor.yaw);return[{c:v3(p.x+sx*.65,p.y+.32,p.z+cz*.65),r:.15,part:'head'},{c:v3(p.x,p.y+.26,p.z),r:.27,part:'torso'},{c:v3(p.x-sx*.5,p.y+.2,p.z-cz*.5),r:.21,part:'limb'}];}
 return[{c:v3(p.x,p.y+1.59+dy,p.z),r:.16,part:'head'},{c:v3(p.x,p.y+1.24+dy,p.z),r:.25,part:'torso'},{c:v3(p.x,p.y+.85+dy*.6,p.z),r:.24,part:'torso'},{c:v3(p.x-.12,p.y+.39+dy*.25,p.z),r:.19,part:'limb'},{c:v3(p.x+.12,p.y+.39+dy*.25,p.z),r:.19,part:'limb'}];
}
export class CollisionWorld {
 constructor(terrain,boxes){this.terrain=terrain;this.boxes=boxes;this.dynamic=[];this.actors=[];}
 get boxes(){return this._boxes;}
 set boxes(value){this._boxes=value;this.index=new SpatialIndex(value);}
 ground(x,z,fromY=Infinity,r=0,stepHeight=.46){
  let y=this.terrain.height(x,z);
  for(const b of this.index.point(x,z,r)){
   if(b.blocksMovement===false||b.walkableTop===false||b.kind==='fence'||b.kind==='revetment'||b.wire)continue;
   // A narrow rail cannot support a capsule, even when approached diagonally.
   if(r>0&&(b.max.x-b.min.x<r*2||b.max.z-b.min.z<r*2))continue;
   if(x+r>b.min.x&&x-r<b.max.x&&z+r>b.min.z&&z-r<b.max.z&&b.max.y<=fromY+stepHeight+.001)y=Math.max(y,b.max.y);
  }
  return y;
 }
 overlaps(pos,height=1.74,r=.28,includeDynamic=true){const candidates=this.index.point(pos.x,pos.z,r);if(includeDynamic)candidates.push(...this.dynamic);for(const b of candidates){if(b.blocksMovement===false)continue;if(pos.x+r>b.min.x&&pos.x-r<b.max.x&&pos.z+r>b.min.z&&pos.z-r<b.max.z&&pos.y+height>b.min.y+.01&&pos.y<b.max.y-.015)return true;}return false;}
 actorOverlap(p,height,r,ignoreId){for(const a of this.actors){if(a.id===ignoreId||(a.hp??a.health?.hp??0)<=0)continue;const ah=BODY_HEIGHT[a.stance]||1.74,ar=a.stance==='prone'?.48:.31;if(p.y+height<=a.pos.y+.04||p.y>=a.pos.y+ah-.04)continue;if((p.x-a.pos.x)**2+(p.z-a.pos.z)**2<(r+ar)**2)return true;}return false;}
 canStand(p,stance,yaw=0,ignoreId=null){ignoreId=ignoreId??this.actors.find(a=>a.pos===p)?.id;if(this.overlaps(p,BODY_HEIGHT[stance])||this.actorOverlap(p,BODY_HEIGHT[stance],.29,ignoreId))return false;if(stance==='prone'){for(const side of [-.55,.55])if(this.overlaps(v3(p.x+Math.sin(yaw)*side,p.y,p.z+Math.cos(yaw)*side),.48,.28))return false;}return true;}
 dynamicBlocked(a,b,r=.36){const steps=Math.max(1,Math.ceil(Math.hypot(a.x-b.x,a.z-b.z)/.65));for(const box of this.dynamic)for(let i=0;i<=steps;i++){const t=i/steps,x=a.x+(b.x-a.x)*t,z=a.z+(b.z-a.z)*t,y=(a.y??this.terrain.height(x,z))+((b.y??a.y??this.terrain.height(x,z))-(a.y??this.terrain.height(x,z)))*t;if(x+r>box.min.x&&x-r<box.max.x&&z+r>box.min.z&&z-r<box.max.z&&y+1.65>box.min.y&&y<box.max.y)return true;}return false;}
 canWalk(a,b,r=.29){const length=Math.hypot(b.x-a.x,b.z-a.z),steps=Math.max(1,Math.ceil(length/.25)),stride=length/steps;let old=this.ground(a.x,a.z,a.y,r),oldNatural=this.terrain.height(a.x,a.z);for(let i=1;i<=steps;i++){const t=i/steps,x=a.x+(b.x-a.x)*t,z=a.z+(b.z-a.z)*t,y=this.ground(x,z,old,r),natural=this.terrain.height(x,z);const slope=Math.hypot(this.terrain.height(x+.08,z)-this.terrain.height(x-.08,z),this.terrain.height(x,z+.08)-this.terrain.height(x,z-.08))/.16;if((Math.abs(natural-oldNatural)>.012&&slope>1.02)||Math.abs(y-old)>.46||Math.abs(natural-oldNatural)>Math.max(.06,stride*1.02)||this.overlaps(v3(x,y+.03,z),1.65,r,false))return false;old=y;oldNatural=natural;}return true;}

 move(actor,dx,dz,dt){const old=actor.pos,h=BODY_HEIGHT[actor.stance]||1.74;let moved=false;const steps=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dz))/.18));
  for(let step=0;step<steps;step++)for(const [x,z] of [[dx/steps,0],[0,dz/steps]]){if(!x&&!z)continue;const p=v3(old.x+x,old.y,old.z+z);if(p.x<MAP.minPlayX||p.x>MAP.maxPlayX||p.z<MAP.minPlayZ||p.z>MAP.maxPlayZ)continue;const stepHeight=actor.grounded&&!(actor.vy>0)?.46:.015;const ground=this.ground(p.x,p.z,old.y,.29,stepHeight);const rise=ground-old.y;
   if(rise>stepHeight)continue;const horizontal=Math.hypot(x,z),naturalRise=this.terrain.height(p.x,p.z)-this.terrain.height(old.x,old.z);if(actor.grounded&&actor.vy<=0&&naturalRise>Math.max(.025,horizontal*1.08))continue;if(rise>0&&rise<=stepHeight)p.y=ground;
   if(this.canStand(v3(p.x,p.y+.025,p.z),actor.stance,actor.yaw,actor.id)){old.x=p.x;old.z=p.z;if(rise>0)old.y=p.y;moved=true;}
  }
  const floor=this.ground(old.x,old.z,old.y,.29,.025);if(old.y>floor+.025||actor.vy>0){actor.vy=(actor.vy||0)-18*dt;const ny=old.y+actor.vy*dt;
   if(actor.vy>0&&this.overlaps(v3(old.x,ny+.01,old.z),h)){actor.vy=0;}else old.y=ny;
   if(old.y<floor){old.y=floor;actor.vy=0;actor.grounded=true;}else actor.grounded=false;
  }else{old.y=floor;actor.vy=0;actor.grounded=true;}
  return moved;
 }
 ray(o,d,max=180,actors=[],ignoreId=null,options={}){let result=null,best=max;
  for(const b of [...this.index.segment(o,d,max),...this.dynamic]){if(b.blocksRay===false)continue;if(options.ignoreSolid!=null&&(b.id===options.ignoreSolid||b.owner===options.ignoreSolid))continue;const t=rayBox(o,d,b,best);if(t!==null&&t<best){best=t;result={distance:t,solid:b,point:add(o,mul(d,t)),kind:'solid'};}}
  // Sample the same triangular field rendered on screen; refine first intersection.
  for(let t=.035;t<best;t+=.34){const p=add(o,mul(d,t));if(p.y<this.terrain.height(p.x,p.z)+.018){let lo=Math.max(0,t-.34),hi=t;for(let i=0;i<5;i++){const m=(lo+hi)*.5,q=add(o,mul(d,m));if(q.y<this.terrain.height(q.x,q.z)+.018)hi=m;else lo=m;}best=hi;result={distance:best,point:add(o,mul(d,best)),kind:'terrain'};break;}}
  for(const a of actors){if(a.id===ignoreId||(a.hp??a.health?.hp)<=0)continue;for(const h of hitSpheres(a)){const t=raySphere(o,d,h.c,h.r,best);if(t!==null&&t<best){best=t;result={distance:t,actor:a,part:h.part,point:add(o,mul(d,t)),kind:'actor'};}}}
  return result;
 }
 visible(a,b){const delta=sub(b,a),length=dist(a,b);return !this.ray(a,norm(delta),Math.max(0,length-.2));}
}
