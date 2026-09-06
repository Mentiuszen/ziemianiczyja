import {MAP} from '../data/world-map.js';
import {v3,flatDist} from '../core/math.js';
/** Static 2 m graph uses the exact collision field. A small binary heap keeps A* bounded. */
class Heap{constructor(){this.a=[];}push(id,score){const a=this.a;let i=a.length;a.push({id,score});while(i){const p=(i-1)>>1;if(a[p].score<=score)break;a[i]=a[p];i=p;}a[i]={id,score};}pop(){const a=this.a,first=a[0],last=a.pop();if(a.length){let i=0;while(i*2+1<a.length){let c=i*2+1;if(c+1<a.length&&a[c+1].score<a[c].score)c++;if(last.score<=a[c].score)break;a[i]=a[c];i=c;}a[i]=last;}return first.id;}get length(){return this.a.length;}}
export class Navigation {
 constructor(collision){this.collision=collision;this.step=2;this.minX=MAP.navMinX;this.minZ=MAP.navMinZ;this.nx=(MAP.navMaxX-MAP.navMinX)/2+1;this.nz=(MAP.navMaxZ-MAP.navMinZ)/2+1;this.nodes=[];this.requests=[];this.coverOwners=new Map();
  for(let z=0;z<this.nz;z++)for(let x=0;x<this.nx;x++){const px=this.minX+x*2,pz=this.minZ+z*2,p=v3(px,collision.ground(px,pz,collision.terrain.height(px,pz),.36),pz);this.nodes.push({id:z*this.nx+x,pos:p,valid:!collision.overlaps({...p,y:p.y+.04},1.65,.36,false),edges:null});}
  this.cover=[];for(const b of collision.boxes.filter(b=>b.cover)){for(const side of [-1,1])for(const off of [-.25,.25]){const p=v3(b.x+b.w*off,0,b.z+side*(b.d/2+1.15));p.y=collision.terrain.height(p.x,p.z);if(!collision.overlaps({...p,y:p.y+.03},1.1,.35,false))this.cover.push({id:`${b.id}:${side}:${off}`,pos:p,side,owner:null});}}
 }
 invalidate(box){
  if(!box)return;
  for(const n of this.nodes){n.edges=null;if(n.pos.x<box.min.x-4||n.pos.x>box.max.x+4||n.pos.z<box.min.z-4||n.pos.z>box.max.z+4)continue;
   n.pos.y=this.collision.ground(n.pos.x,n.pos.z,this.collision.terrain.height(n.pos.x,n.pos.z),.36);
   n.valid=!this.collision.overlaps({...n.pos,y:n.pos.y+.04},1.65,.36,false);
  }
 }
 nearest(p,reachable=false){let best=null,score=Infinity;const ix=Math.round((p.x-this.minX)/2),iz=Math.round((p.z-this.minZ)/2);for(let r=0;r<=5;r++){for(let dz=-r;dz<=r;dz++)for(let dx=-r;dx<=r;dx++){const x=ix+dx,z=iz+dz;if(x<0||z<0||x>=this.nx||z>=this.nz)continue;const n=this.nodes[z*this.nx+x];if(!n.valid||this.collision.dynamicBlocked(n.pos,n.pos))continue;const d=flatDist(p,n.pos);if(d<score&&(!reachable||this.collision.canWalk(p,n.pos,.36))){best=n;score=d;}}if(best&&score<r*2+.1)break;}return best;}
 edges(n){if(n.edges)return n.edges;n.edges=[];const x=n.id%this.nx,z=Math.floor(n.id/this.nx);for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dz)continue;const nx=x+dx,nz=z+dz;if(nx<0||nz<0||nx>=this.nx||nz>=this.nz)continue;const other=this.nodes[nz*this.nx+nx];if(other.valid&&this.collision.canWalk(n.pos,other.pos,.36))n.edges.push({id:other.id,cost:Math.hypot(dx,dz)*2+Math.abs(other.pos.y-n.pos.y)*.7});}return n.edges;}
 path(from,to,avoid=null){const started=performance.now();this.metrics??={pathCalls:0,pathMs:0,visited:0,maxQueue:0};this.metrics.pathCalls++;try{return this.findPath(from,to,avoid);}finally{this.metrics.pathMs+=performance.now()-started;}}
 findPath(from,to,avoid){const start=this.nearest(from,true),goal=this.nearest(to);if(!start||!goal)return[];const open=new Heap(),cost=new Float32Array(this.nodes.length);cost.fill(Infinity);const prev=new Int32Array(this.nodes.length);prev.fill(-1);const closed=new Uint8Array(this.nodes.length);cost[start.id]=0;open.push(start.id,0);let count=0,found=false;while(open.length&&count++<12000){const id=open.pop();if(closed[id])continue;if(id===goal.id){found=true;break;}closed[id]=1;for(const e of this.edges(this.nodes[id])){if(avoid&&flatDist(this.nodes[e.id].pos,avoid)<1.1&&e.id!==goal.id)continue;if(this.collision.dynamicBlocked(this.nodes[id].pos,this.nodes[e.id].pos))continue;const g=cost[id]+e.cost;if(g<cost[e.id]){cost[e.id]=g;prev[e.id]=id;open.push(e.id,g+flatDist(this.nodes[e.id].pos,goal.pos));}}}this.metrics.visited+=count;if(!found)return[];const result=[];for(let i=goal.id;i!==start.id&&i>=0;i=prev[i])result.push({...this.nodes[i].pos});result.reverse();if(flatDist(from,start.pos)>.15&&(!result.length||!this.collision.canWalk(from,result[0],.36)))result.unshift({...start.pos});return result;}
 /** One coalesced job per actor; a request is owned by a movement intention. */
 request(actor,target,reason=actor.state||'move'){
  if(actor.hp<=0||!target||!Number.isFinite(target.x)||!Number.isFinite(target.z))return false;
  const point={x:target.x,y:Number.isFinite(target.y)?target.y:actor.pos.y,z:target.z};
  actor.pathGeneration=(actor.pathGeneration||0)+1;
  actor.moveGoal={...point};actor.moveReason=reason;actor.pathPending=true;
  actor.path=[];actor.pathIndex=0;actor.pathTarget={...point};
  const job={actor,target:point,generation:actor.pathGeneration,priority:reason==='evade'?2:reason==='retreat'?1:0};
  const index=this.requests.findIndex(j=>j.actor.id===actor.id);
  if(index<0)this.requests.push(job);else this.requests[index]=job;
  this.metrics??={pathCalls:0,pathMs:0,visited:0,maxQueue:0};
  this.metrics.maxQueue=Math.max(this.metrics.maxQueue,this.requests.length);return true;
 }
 cancel(actor,{releaseCover=true}={}){
  actor.pathGeneration=(actor.pathGeneration||0)+1;actor.pathPending=false;
  actor.path=[];actor.pathIndex=0;actor.pathTarget=null;actor.moveGoal=null;actor.moveReason=null;
  this.requests=this.requests.filter(j=>j.actor.id!==actor.id);
  if(releaseCover)this.releaseCover(actor);
 }
 process(limit=2){
  this.requests.sort((a,b)=>b.priority-a.priority);
  while(limit>0&&this.requests.length){
   const {actor,target,generation}=this.requests.shift();
   if(actor.hp<=0||generation!==actor.pathGeneration)continue;
   limit--;const route=this.path(actor.pos,target,actor.avoidWaypoint);
   if(actor.hp<=0||generation!==actor.pathGeneration)continue;
   actor.pathPending=false;actor.path=route;actor.pathIndex=0;actor.pathTarget={...target};
   if(!route.length){
    actor.repathLeft=Math.min(3,.5+(actor.pathFailures||0)*.5);actor.pathFailures=Math.min(5,(actor.pathFailures||0)+1);
    if(actor.coverId){actor.failedCoverId=actor.coverId;actor.coverRetryLeft=4;this.releaseCover(actor);}
   }else actor.pathFailures=0;
  }
 }
 reserveCover(actor,cover){
  if(!cover||(cover.owner&&cover.owner!==actor.id))return false;
  this.releaseCover(actor);cover.owner=actor.id;actor.coverId=cover.id;
  this.coverOwners??=new Map();this.coverOwners.set(actor.id,actor);return true;
 }
 chooseCover(actor,threat){
  // Reachability is checked by process(), never by an unbudgeted A* here.
  const origin=v3(threat.x,threat.y+1.4,threat.z);
  const candidates=this.cover.filter(c=>(!c.owner||c.owner===actor.id)&&!(actor.coverRetryLeft>0&&actor.failedCoverId===c.id))
   .map(c=>({c,d:flatDist(actor.pos,c.pos)})).filter(({d})=>d<=17&&d>=.5)
   .sort((a,b)=>(a.d+flatDist(a.c.pos,threat)*.04)-(b.d+flatDist(b.c.pos,threat)*.04));
  for(const {c} of candidates.slice(0,12)){
   if(this.collision.dynamicBlocked?.(c.pos,c.pos))continue;
   if(!this.collision.visible(v3(c.pos.x,c.pos.y+.8,c.pos.z),origin)&&this.reserveCover(actor,c))return c;
  }return null;
 }
 releaseCover(actorOrId){
  const id=typeof actorOrId==='string'?actorOrId:actorOrId.id;
  const actor=typeof actorOrId==='string'?this.coverOwners?.get(id):actorOrId;
  for(const c of this.cover||[])if(c.owner===id)c.owner=null;
  if(actor)actor.coverId=null;this.coverOwners?.delete(id);
 }
}
