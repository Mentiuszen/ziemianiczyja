import {LocalizedError} from '../i18n/index.js';
import {footprintOverlap,shapeCorrections,rayShape} from './shapes.js';
import {SpatialIndex} from './spatial-index.js';
import {MAP} from '../data/world-map.js';
import {v3,add,mul,sub,norm,dist,raySphere} from '../core/math.js';
export const CONTACT_EPS=.002;
const BODY_RADIUS=.28, ACTOR_RADIUS=.29, GRAVITY=18;
const bodyPoints=(pos,stance,yaw=0)=>stance==='prone'
 ? [0,-.55,.55].map(offset=>v3(pos.x+Math.sin(yaw)*offset,pos.y,pos.z+Math.cos(yaw)*offset))
 : [pos];
const alive=a=>(a.hp??a.health?.hp??0)>0;
const finitePoint=p=>p&&['x','y','z'].every(k=>Number.isFinite(p[k]));
const xzBox=(p,r,b)=>footprintOverlap(p,r,b,CONTACT_EPS);
export const BODY_HEIGHT={stand:1.74,crouch:1.16,prone:.48};
export const EYE_HEIGHT={stand:1.61,crouch:1.04,prone:.38};
export function eye(actor){return v3(actor.pos.x,actor.pos.y+(EYE_HEIGHT[actor.stance]??1.61),actor.pos.z);}
export function hitSpheres(actor){const p=actor.pos,stance=actor.stance||'stand',dy=stance==='crouch'?-.5:0;
 if(stance==='prone'){const sx=Math.sin(actor.yaw),cz=Math.cos(actor.yaw);return[{c:v3(p.x+sx*.65,p.y+.32,p.z+cz*.65),r:.15,part:'head'},{c:v3(p.x,p.y+.26,p.z),r:.27,part:'torso'},{c:v3(p.x-sx*.5,p.y+.2,p.z-cz*.5),r:.21,part:'limb'}];}
 return[{c:v3(p.x,p.y+1.59+dy,p.z),r:.16,part:'head'},{c:v3(p.x,p.y+1.24+dy,p.z),r:.25,part:'torso'},{c:v3(p.x,p.y+.85+dy*.6,p.z),r:.24,part:'torso'},{c:v3(p.x-.12,p.y+.39+dy*.25,p.z),r:.19,part:'limb'},{c:v3(p.x+.12,p.y+.39+dy*.25,p.z),r:.19,part:'limb'}];
}
export class CollisionWorld {
 constructor(terrain,boxes){this.terrain=terrain;this.boxes=boxes;this.dynamic=[];this.actors=[];this.diagnostics={recoveries:0,recoveryDistance:0,recoveryFailures:0};}
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
 overlaps(pos,height=1.74,r=BODY_RADIUS,includeDynamic=true){
  const candidates=this.index.point(pos.x,pos.z,r);if(includeDynamic)candidates.push(...this.dynamic);
  return candidates.some(b=>b.blocksMovement!==false&&xzBox(pos,r,b)&&
   pos.y+height>b.min.y+CONTACT_EPS&&pos.y<b.max.y-CONTACT_EPS);
 }
 actorOverlap(p,height,r,ignoreId){
  for(const a of this.actors){
   if(a.id===ignoreId||!alive(a))continue;
   const ah=BODY_HEIGHT[a.stance]||1.74;
   if(p.y+height<=a.pos.y+CONTACT_EPS||p.y>=a.pos.y+ah-CONTACT_EPS)continue;
   for(const [i,q] of bodyPoints(a.pos,a.stance,a.yaw).entries()){
    const ar=a.stance==='prone'&&i===0?.48:.31;
    if(Math.hypot(p.x-q.x,p.z-q.z)<r+ar-CONTACT_EPS)return true;
   }
  }
  return false;
 }
 canStand(p,stance,yaw=0,ignoreId=null){
  if(!finitePoint(p)||!BODY_HEIGHT[stance]||!Number.isFinite(yaw)||
   p.x<MAP.minPlayX||p.x>MAP.maxPlayX||p.z<MAP.minPlayZ||p.z>MAP.maxPlayZ)return false;
  ignoreId=ignoreId??this.actors.find(a=>a.pos===p)?.id;
  for(const q of bodyPoints(p,stance,yaw)){
   if(q.x-BODY_RADIUS<MAP.minPlayX||q.x+BODY_RADIUS>MAP.maxPlayX||q.z-BODY_RADIUS<MAP.minPlayZ||q.z+BODY_RADIUS>MAP.maxPlayZ||
    q.y<this.terrain.height(q.x,q.z)-CONTACT_EPS||
    this.overlaps(q,BODY_HEIGHT[stance])||this.actorOverlap(q,BODY_HEIGHT[stance],ACTOR_RADIUS,ignoreId))return false;
  }
  return true;
 }
 canTurn(actor,yaw){
  const delta=Math.atan2(Math.sin(yaw-actor.yaw),Math.cos(yaw-actor.yaw));
  const steps=Math.max(1,Math.ceil(Math.abs(delta)/.08));
  for(let i=1;i<=steps;i++)if(!this.canStand(actor.pos,actor.stance,actor.yaw+delta*i/steps,actor.id))return false;
  return true;
 }
 supportHeight(actor,pos=actor.pos,step=.025){
  return Math.max(...bodyPoints(pos,actor.stance,actor.yaw).map(q=>this.ground(q.x,q.z,pos.y,.29,step)));
 }
 supported(actor){
  return Math.abs(actor.vy||0)<CONTACT_EPS&&
   Math.abs(actor.pos.y-this.supportHeight(actor))<=CONTACT_EPS*3&&
   this.canStand(actor.pos,actor.stance,actor.yaw,actor.id);
 }
 /** Geometry contacts used ONLY for bounded recovery, never ordinary noclip. */
 contacts(actor,pos=actor.pos){
  const result=[],height=BODY_HEIGHT[actor.stance]||1.74;
  for(const [part,q] of bodyPoints(pos,actor.stance,actor.yaw).entries()){
   const boxes=[...this.index.point(q.x,q.z,BODY_RADIUS),...this.dynamic];
   for(const b of boxes){
    if(b.blocksMovement===false||!xzBox(q,BODY_RADIUS,b)||q.y+height<=b.min.y+CONTACT_EPS||q.y>=b.max.y-CONTACT_EPS)continue;
    const correction=shapeCorrections(q,BODY_RADIUS,height,b,CONTACT_EPS);
    result.push({key:`box:${b.id}:${part}`,...correction});
   }
   for(const other of this.actors){
    if(other.id===actor.id||!alive(other)||q.y+height<=other.pos.y+CONTACT_EPS||q.y>=other.pos.y+(BODY_HEIGHT[other.stance]||1.74)-CONTACT_EPS)continue;
    for(const [i,c] of bodyPoints(other.pos,other.stance,other.yaw).entries()){
     const r=ACTOR_RADIUS+(other.stance==='prone'&&i===0?.48:.31),dx=q.x-c.x,dz=q.z-c.z,length=Math.hypot(dx,dz);
     if(length>=r-CONTACT_EPS)continue;
     const sign=actor.id<other.id?-1:1,depth=r-length+CONTACT_EPS;
     result.push({key:`actor:${other.id}:${part}:${i}`,depth,options:[{x:length?dx/length*depth:sign*depth,y:0,z:length?dz/length*depth:0}]});
    }
   }
   const floor=this.terrain.height(q.x,q.z);
   if(q.y<floor-CONTACT_EPS)result.push({key:`terrain:${part}`,depth:floor-q.y,options:[v3(0,floor-q.y,0)]});
  }
  for(const [axis,lo,hi] of [['x',MAP.minPlayX,MAP.maxPlayX],['z',MAP.minPlayZ,MAP.maxPlayZ]]){
   const value=pos[axis],target=Math.max(lo,Math.min(hi,value));
   if(target!==value){const v=v3();v[axis]=target-value;result.push({key:`bounds:${axis}`,depth:Math.abs(target-value),options:[v]});}
  }
  return result;
 }
 recoverySegment(actor,from,to){
  const initial=new Map(this.contacts(actor,from).map(c=>[c.key,c.depth]));
  const steps=Math.max(1,Math.ceil(dist(from,to)/.025));
  for(let i=1;i<=steps;i++){
   const p=v3(from.x+(to.x-from.x)*i/steps,from.y+(to.y-from.y)*i/steps,from.z+(to.z-from.z)*i/steps);
   for(const c of this.contacts(actor,p)){
    if(!initial.has(c.key)||c.depth>initial.get(c.key)+CONTACT_EPS)return false;
    initial.set(c.key,c.depth);
   }
  }
  return true;
 }
 recover(actor,maxDistance=.65){
  if(this.canStand(actor.pos,actor.stance,actor.yaw,actor.id)){actor.collisionBlocked=false;return true;}
  const start={...actor.pos},queue=[{pos:start,steps:0,length:0}],seen=new Set();let attempts=0;
  while(queue.length&&attempts++<64){
   queue.sort((a,b)=>a.length-b.length);const state=queue.shift();
   if(state.steps>=4)continue;
   for(const c of this.contacts(actor,state.pos))for(const v of c.options){
    const length=state.length+Math.hypot(v.x,v.y,v.z);if(length>maxDistance||Math.hypot(v.x,v.y,v.z)<CONTACT_EPS/2)continue;
    const pos=add(state.pos,v),key=[pos.x,pos.y,pos.z].map(n=>Math.round(n*1000)).join(':');
    if(seen.has(key))continue;seen.add(key);
    if(!this.recoverySegment(actor,state.pos,pos))continue;
    if(this.canStand(pos,actor.stance,actor.yaw,actor.id)){
     Object.assign(actor.pos,pos);actor.vy=0;actor.grounded=this.supported(actor);actor.collisionBlocked=false;
     actor.recoveryThisStep=true;this.diagnostics.recoveries++;this.diagnostics.recoveryDistance+=length;return true;
    }
    queue.push({pos,steps:state.steps+1,length});
   }
  }
  const safe=actor.lastSafePosition;
  if(safe&&dist(start,safe)<=maxDistance&&this.canStand(safe,actor.stance,actor.yaw,actor.id)&&this.recoverySegment(actor,start,safe)){
   Object.assign(actor.pos,safe);actor.vy=0;actor.grounded=this.supported(actor);actor.collisionBlocked=false;actor.recoveryThisStep=true;
   this.diagnostics.recoveries++;this.diagnostics.recoveryDistance+=dist(start,safe);return true;
  }
  actor.collisionBlocked=true;this.diagnostics.recoveryFailures++;return false;
 }
 /** Exact Y face sweep, including unwalkable rails and other actors. */
 sweepVertical(actor,targetY){
  const fromY=actor.pos.y,height=BODY_HEIGHT[actor.stance]||1.74,up=targetY>fromY;
  let result=targetY;
  const constrain=(bottom,top)=>{
   if(up&&fromY+height<=bottom+CONTACT_EPS&&result+height>bottom)result=Math.min(result,bottom-height);
   if(!up&&fromY>=top-CONTACT_EPS&&result<top)result=Math.max(result,top);
  };
  for(const q of bodyPoints(actor.pos,actor.stance,actor.yaw)){
   for(const b of [...this.index.point(q.x,q.z,BODY_RADIUS),...this.dynamic]){
    if(b.blocksMovement!==false&&xzBox(q,BODY_RADIUS,b))constrain(b.min.y,b.max.y);
   }
   for(const a of this.actors){
    if(a.id===actor.id||!alive(a))continue;
    for(const [i,p] of bodyPoints(a.pos,a.stance,a.yaw).entries()){
     const r=ACTOR_RADIUS+(a.stance==='prone'&&i===0?.48:.31);
     if(Math.hypot(q.x-p.x,q.z-p.z)<r-CONTACT_EPS)constrain(a.pos.y,a.pos.y+(BODY_HEIGHT[a.stance]||1.74));
    }
   }
   result=Math.max(result,this.terrain.height(q.x,q.z));
  }
  return result;
 }
 dynamicBlocked(a,b,r=.36){const steps=Math.max(1,Math.ceil(Math.hypot(a.x-b.x,a.z-b.z)/.65));for(const box of this.dynamic)for(let i=0;i<=steps;i++){const t=i/steps,x=a.x+(b.x-a.x)*t,z=a.z+(b.z-a.z)*t,y=(a.y??this.terrain.height(x,z))+((b.y??a.y??this.terrain.height(x,z))-(a.y??this.terrain.height(x,z)))*t;if(box.blocksMovement!==false&&footprintOverlap({x,z},r,box)&&y+1.65>box.min.y&&y<box.max.y)return true;}return false;}
 canWalk(a,b,r=.29){const length=Math.hypot(b.x-a.x,b.z-a.z),steps=Math.max(1,Math.ceil(length/.25)),stride=length/steps;let old=this.ground(a.x,a.z,a.y,r),oldNatural=this.terrain.height(a.x,a.z);for(let i=1;i<=steps;i++){const t=i/steps,x=a.x+(b.x-a.x)*t,z=a.z+(b.z-a.z)*t,y=this.ground(x,z,old,r),natural=this.terrain.height(x,z);const slope=Math.hypot(this.terrain.height(x+.08,z)-this.terrain.height(x-.08,z),this.terrain.height(x,z+.08)-this.terrain.height(x,z-.08))/.16;if((Math.abs(natural-oldNatural)>.012&&slope>1.02)||Math.abs(y-old)>.46||Math.abs(natural-oldNatural)>Math.max(.06,stride*1.02)||this.overlaps(v3(x,y+.03,z),1.65,r,false))return false;old=y;oldNatural=natural;}return true;}

 move(actor,dx,dz,dt){
  if(!finitePoint(actor.pos)||![dx,dz,dt,actor.vy??0].every(Number.isFinite)||dt<0)throw new LocalizedError('error.movement');
  actor.recoveryThisStep=false;
  if(!this.recover(actor))return false;
  const before={...actor.pos};
  // Normal simulation steps are <= .05 s. Bound pathological inputs without tunnelling.
  const requestedSteps=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dz))/.12),Math.ceil(dt/.025));
  const steps=Math.min(128,requestedSteps),fraction=steps/requestedSteps;
  dx*=fraction;dz*=fraction;dt*=fraction;
  for(let i=0;i<steps;i++){
   const pos=actor.pos,stepHeight=actor.grounded&&!(actor.vy>0)?.46:0;
   for(const [x,z] of [[dx/steps,0],[0,dz/steps]]){
    if(!x&&!z)continue;
    const next=v3(pos.x+x,pos.y,pos.z+z),floor=this.supportHeight(actor,next,stepHeight),rise=floor-pos.y;
    const naturalRise=this.terrain.height(next.x,next.z)-this.terrain.height(pos.x,pos.z);
    if(rise>stepHeight+CONTACT_EPS||actor.grounded&&actor.vy<=0&&naturalRise>Math.max(.025,Math.hypot(x,z)*1.08))continue;
    if(rise>0)next.y=floor;
    // A step may lift the body, but it cannot lift its head through an overhang.
    if(rise>0&&this.sweepVertical(actor,next.y)<next.y-CONTACT_EPS)continue;
    if(this.canStand(next,actor.stance,actor.yaw,actor.id))Object.assign(pos,next);
   }
   const floor=this.supportHeight(actor),subdt=dt/steps;
   if(Math.abs(pos.y-floor)<=CONTACT_EPS*3&&!(actor.vy>0)){
    const candidate={...pos,y:floor};
    if(this.canStand(candidate,actor.stance,actor.yaw,actor.id)){pos.y=floor;actor.vy=0;actor.grounded=true;continue;}
   }
   actor.vy=(actor.vy||0)-GRAVITY*subdt;
   const wanted=pos.y+actor.vy*subdt,allowed=this.sweepVertical(actor,wanted);
   if(allowed!==wanted)actor.vy=0;
   // The sweep already tests all crossed faces; retain a final whole-body assertion.
   const candidate={...pos,y:allowed};
   if(this.canStand(candidate,actor.stance,actor.yaw,actor.id))pos.y=allowed;else actor.vy=0;
   actor.grounded=this.supported(actor);
  }
  if(!actor.recoveryThisStep&&this.supported(actor))actor.lastSafePosition={...actor.pos};
  return Math.hypot(actor.pos.x-before.x,actor.pos.z-before.z)>CONTACT_EPS/10;
 }
 /** Swept start volume for grenades; ray-only start offsets can cross thin walls. */
 sweepSphere(from,to,radius=.09,actors=[],ignoreId=null){
  const length=dist(from,to),d=norm(sub(to,from));let result=null,best=length;
  for(const b of [...this.index.bounds(Math.min(from.x,to.x)-radius,Math.min(from.z,to.z)-radius,Math.max(from.x,to.x)+radius,Math.max(from.z,to.z)+radius),...this.dynamic]){
   if(b.blocksRay===false)continue;
   const t=rayShape(from,d,b,best,radius);if(t!==null&&t<=best){best=t;result={distance:t,kind:'solid',solid:b,point:add(from,mul(d,t))};}
  }
  for(const a of actors){if(a.id===ignoreId||!alive(a))continue;for(const sphere of hitSpheres(a)){
   const t=raySphere(from,d,sphere.c,sphere.r+radius,best);if(t!==null&&t<=best){best=t;result={distance:t,kind:'actor',actor:a,point:add(from,mul(d,t))};}
  }}
  const steps=Math.max(1,Math.ceil(length/.025));
  for(let i=0;i<=steps;i++){const t=length*i/steps;if(t>best)break;const p=add(from,mul(d,t));
   if(p.y-radius<this.terrain.height(p.x,p.z)){best=t;result={distance:t,kind:'terrain',point:p};break;}}
  return result;
 }
 ray(o,d,max=180,actors=[],ignoreId=null,options={}){let result=null,best=max;
  for(const b of [...this.index.segment(o,d,max),...this.dynamic]){if(b.blocksRay===false)continue;if(options.ignoreSolid!=null&&(b.id===options.ignoreSolid||b.owner===options.ignoreSolid))continue;const t=rayShape(o,d,b,best);if(t!==null&&t<best){best=t;result={distance:t,solid:b,point:add(o,mul(d,t)),kind:'solid'};}}
  // Sample the same triangular field rendered on screen; refine first intersection.
  for(let t=.035;t<best;t+=.34){const p=add(o,mul(d,t));if(p.y<this.terrain.height(p.x,p.z)+.018){let lo=Math.max(0,t-.34),hi=t;for(let i=0;i<5;i++){const m=(lo+hi)*.5,q=add(o,mul(d,m));if(q.y<this.terrain.height(q.x,q.z)+.018)hi=m;else lo=m;}best=hi;result={distance:best,point:add(o,mul(d,best)),kind:'terrain'};break;}}
  for(const a of actors){if(a.id===ignoreId||(a.hp??a.health?.hp)<=0)continue;for(const h of hitSpheres(a)){const t=raySphere(o,d,h.c,h.r,best);if(t!==null&&t<best){best=t;result={distance:t,actor:a,part:h.part,point:add(o,mul(d,t)),kind:'actor'};}}}
  return result;
 }
 visible(a,b){const delta=sub(b,a),length=dist(a,b);return !this.ray(a,norm(delta),Math.max(0,length-.2));}
}
