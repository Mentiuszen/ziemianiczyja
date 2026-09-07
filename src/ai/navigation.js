import {MAP} from '../data/world-map.js';
import {v3,flatDist} from '../core/math.js';
/** Static 2 m graph uses the exact collision field. A small binary heap keeps A* bounded. */
class Heap {
 constructor(capacity=1024){this.ids=new Int32Array(capacity);this.scores=new Float64Array(capacity);this.length=0;}
 push(id,score){
  let i=this.length++;if(this.length>this.ids.length){const ids=new Int32Array(this.ids.length*2),scores=new Float64Array(this.scores.length*2);ids.set(this.ids);scores.set(this.scores);this.ids=ids;this.scores=scores;}
  while(i){const parent=(i-1)>>1;if(this.scores[parent]<=score)break;this.ids[i]=this.ids[parent];this.scores[i]=this.scores[parent];i=parent;}
  this.ids[i]=id;this.scores[i]=score;
 }
 pop(){const first=this.ids[0],last=this.ids[--this.length],score=this.scores[this.length];let i=0;
  while(i*2+1<this.length){let child=i*2+1;if(child+1<this.length&&this.scores[child+1]<this.scores[child])child++;if(score<=this.scores[child])break;this.ids[i]=this.ids[child];this.scores[i]=this.scores[child];i=child;}
  if(this.length){this.ids[i]=last;this.scores[i]=score;}return first;
 }
}
class Workspace {
 constructor(size){this.open=new Heap(Math.max(1024,size*2));this.cost=new Float32Array(size);this.prev=new Int32Array(size);this.closed=new Uint8Array(size);}
 reset(){this.open.length=0;this.cost.fill(Infinity);this.prev.fill(-1);this.closed.fill(0);}
}
export class Navigation {
 constructor(collision){this.collision=collision;this.step=2;this.minX=MAP.navMinX;this.minZ=MAP.navMinZ;this.nx=(MAP.navMaxX-MAP.navMinX)/2+1;this.nz=(MAP.navMaxZ-MAP.navMinZ)/2+1;this.nodes=[];this.requests=[];this.coverOwners=new Map();
  for(let z=0;z<this.nz;z++)for(let x=0;x<this.nx;x++){const px=this.minX+x*2,pz=this.minZ+z*2,p=v3(px,collision.ground(px,pz,collision.terrain.height(px,pz),.36),pz);this.nodes.push({id:z*this.nx+x,pos:p,valid:!collision.overlaps({...p,y:p.y+.04},1.65,.36,false),edges:null});}
  this.syncWorkspace=new Workspace(this.nodes.length);this.asyncWorkspace=new Workspace(this.nodes.length);this.activeJob=null;this.search=null;this.topologyVersion=0;
  this.cover=[];for(const b of collision.boxes.filter(b=>b.cover)){for(const side of [-1,1])for(const off of [-.25,.25]){const p=v3(b.x+b.w*off,0,b.z+side*(b.d/2+1.15));p.y=collision.terrain.height(p.x,p.z);if(!collision.overlaps({...p,y:p.y+.03},1.1,.35,false))this.cover.push({id:`${b.id}:${side}:${off}`,pos:p,side,owner:null});}}
 }
 invalidate(box){
  if(!box)return;this.topologyVersion++;
  for(const n of this.nodes){
   // An edge is only 2 m per axis. Invalidate endpoints and adjacent edge owners,
   // not every cached edge across the battlefield after a local wire breach.
   if(n.pos.x>=box.min.x-6&&n.pos.x<=box.max.x+6&&n.pos.z>=box.min.z-6&&n.pos.z<=box.max.z+6)n.edges=null;
   if(n.pos.x<box.min.x-4||n.pos.x>box.max.x+4||n.pos.z<box.min.z-4||n.pos.z>box.max.z+4)continue;
   n.pos.y=this.collision.ground(n.pos.x,n.pos.z,this.collision.terrain.height(n.pos.x,n.pos.z),.36);
   n.valid=!this.collision.overlaps({...n.pos,y:n.pos.y+.04},1.65,.36,false);
  }
 }
 nearest(p,reachable=false){let best=null,score=Infinity;const ix=Math.round((p.x-this.minX)/2),iz=Math.round((p.z-this.minZ)/2);for(let r=0;r<=5;r++){for(let dz=-r;dz<=r;dz++)for(let dx=-r;dx<=r;dx++){const x=ix+dx,z=iz+dz;if(x<0||z<0||x>=this.nx||z>=this.nz)continue;const n=this.nodes[z*this.nx+x];if(!n.valid||this.collision.dynamicBlocked(n.pos,n.pos))continue;const d=flatDist(p,n.pos);if(d<score&&(!reachable||this.collision.canWalk(p,n.pos,.36))){best=n;score=d;}}if(best&&score<r*2+.1)break;}return best;}
 edges(n){if(n.edges)return n.edges;n.edges=[];const x=n.id%this.nx,z=Math.floor(n.id/this.nx);for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dz)continue;const nx=x+dx,nz=z+dz;if(nx<0||nz<0||nx>=this.nx||nz>=this.nz)continue;const other=this.nodes[nz*this.nx+nx];if(other.valid&&this.collision.canWalk(n.pos,other.pos,.36))n.edges.push({id:other.id,cost:Math.hypot(dx,dz)*2+Math.abs(other.pos.y-n.pos.y)*.7});}return n.edges;}
 path(from,to,avoid=null){const started=performance.now();this.metrics??={pathCalls:0,pathMs:0,visited:0,maxQueue:0};this.metrics.pathCalls++;try{return this.findPath(from,to,avoid);}finally{this.metrics.pathMs+=performance.now()-started;}}
 beginSearch(from,to,avoid,workspace){
  const start=this.nearest(from,true),goal=this.nearest(to);workspace.reset();
  const state={...workspace,start,goal,from:{...from},avoid:avoid?{...avoid}:null,count:0,done:!start||!goal,found:false,version:this.topologyVersion};
  if(!state.done){state.cost[start.id]=0;state.open.push(start.id,0);}return state;
 }
 advanceSearch(s,budget){
  let used=0,work=0,cold=0;
  while(!s.done&&s.open.length&&s.count<12000&&work<budget){
   const id=s.open.pop();used++;s.count++;work++;
   if(s.closed[id])continue;if(id===s.goal.id){s.found=true;s.done=true;break;}s.closed[id]=1;
   if(!this.nodes[id].edges){work+=7;cold++;}
   for(const e of this.edges(this.nodes[id])){
    if(s.avoid&&flatDist(this.nodes[e.id].pos,s.avoid)<1.1&&e.id!==s.goal.id)continue;
    if(this.collision.dynamicBlocked(this.nodes[id].pos,this.nodes[e.id].pos))continue;
    const g=s.cost[id]+e.cost;if(g<s.cost[e.id]){s.cost[e.id]=g;s.prev[e.id]=id;s.open.push(e.id,g+flatDist(this.nodes[e.id].pos,s.goal.pos));}
   }
  }
  if(!s.open.length||s.count>=12000)s.done=true;s.lastWork=work;s.lastCold=cold;return used;
 }
 searchRoute(s){
  if(!s.found)return[];const result=[];
  for(let i=s.goal.id;i!==s.start.id&&i>=0;i=s.prev[i])result.push({...this.nodes[i].pos});
  result.reverse();if(flatDist(s.from,s.start.pos)>.15&&(!result.length||!this.collision.canWalk(s.from,result[0],.36)))result.unshift({...s.start.pos});return result;
 }
 findPath(from,to,avoid){
  this.syncWorkspace??=new Workspace(this.nodes.length);const state=this.beginSearch(from,to,avoid,this.syncWorkspace);
  while(!state.done)this.advanceSearch(state,12000);this.metrics.visited+=state.count;return this.searchRoute(state);
 }
 /** Runtime jobs are sliced by visited nodes, not merely by number of started paths. */
 processBudget(expansionBudget=32){
  if(!Number.isInteger(expansionBudget)||expansionBudget<1)throw new RangeError('Invalid navigation budget');
  this.metrics??={pathCalls:0,pathMs:0,visited:0,maxQueue:0};this.metrics.sliceVisits=0;this.metrics.sliceColdNodes=0;
  const started=performance.now();let remaining=expansionBudget,finished=0,starts=0;
  const valid=job=>job&&job.actor.hp>0&&job.generation===job.actor.pathGeneration;
  try{
   if(this.activeJob&&(!valid(this.activeJob)||this.search.version!==this.topologyVersion)){
    if(valid(this.activeJob))this.requests.push(this.activeJob);this.activeJob=null;this.search=null;
   }
   this.requests.sort((a,b)=>b.priority-a.priority);
   if(this.activeJob&&this.requests[0]?.priority>this.activeJob.priority){this.requests.push(this.activeJob);this.activeJob=null;this.search=null;}
   while(remaining>0&&finished<2){
    if(!this.activeJob){
     let job;while(this.requests.length&&!valid(job))job=this.requests.shift();if(!valid(job)||starts>=2){if(valid(job))this.requests.unshift(job);break;}
     this.activeJob=job;this.metrics.pathCalls++;starts++;
     this.search=this.beginSearch(job.actor.pos,job.target,job.actor.avoidWaypoint,this.asyncWorkspace);
    }
    const used=this.advanceSearch(this.search,remaining);remaining-=Math.max(1,this.search.lastWork);this.metrics.visited+=used;this.metrics.sliceVisits+=used;this.metrics.sliceColdNodes+=this.search.lastCold;
    if(!this.search.done)break;
    const job=this.activeJob;let route=this.searchRoute(this.search);
    if(valid(job)){
     // Check the current start and moving blockers again before committing a multi-tick result.
     let from=job.actor.pos;
     for(const point of route){if(this.collision.dynamicBlocked(from,point)){route=[];break;}from=point;}
     if(route.length&&!this.collision.canWalk(job.actor.pos,route[0],.36))route=[];
     this.commitRoute(job,route);
    }
    this.activeJob=null;this.search=null;finished++;
   }
  }finally{const ms=performance.now()-started;this.metrics.pathMs+=ms;this.metrics.sliceMs=ms;this.metrics.maxSliceMs=Math.max(this.metrics.maxSliceMs||0,ms);}
  return finished;
 }
 commitRoute({actor,target},route){
  actor.pathPending=false;actor.path=route;actor.pathIndex=0;actor.pathTarget={...target};
  if(!route.length){
   actor.repathLeft=Math.min(3,.5+(actor.pathFailures||0)*.5);actor.pathFailures=Math.min(5,(actor.pathFailures||0)+1);
   if(actor.coverId){actor.failedCoverId=actor.coverId;actor.coverRetryLeft=4;this.releaseCover(actor);}
  }else actor.pathFailures=0;
 }
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
  if(this.activeJob?.actor.id===actor.id){this.activeJob=null;this.search=null;}
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
