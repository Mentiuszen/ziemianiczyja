const fields=['yaw','pitch','distance','trackPhase','age','bank'];
const pose=()=>({pos:{x:0,y:0,z:0},yaw:0,pitch:0,distance:0,trackPhase:0,age:0,bank:0});
function copy(out,source){for(const k of ['x','y','z'])out.pos[k]=source.pos[k];for(const k of fields)out[k]=Number.isFinite(source[k])?source[k]:0;}
function each(world,fn){fn(world.player);for(const key of ['npcs','tanks','fieldGuns','grenades','shells'])for(const a of world[key]||[])fn(a);for(const key of ['planes','bombs'])for(const a of world.air?.[key]||[])fn(a);}
/** Transform-only double buffer. Objects are reused; no checkpoints or HP are interpolated. */
export class PresentationState {
 constructor(world){this.records=new Map();this.poses=new Map();this.generation=0;if(world)this.reset(world);}
 reset(world){this.records.clear();this.poses.clear();this.afterTick(world);for(const r of this.records.values())copy(r.previous,r.current);this.sample(1);}
 beforeTick(){for(const r of this.records.values())copy(r.previous,r.current);}
 afterTick(world){
  const generation=++this.generation;
  each(world,a=>{
   if(!a?.id||!a.pos)return;let r=this.records.get(a.id);
   if(!r){r={previous:pose(),current:pose(),render:pose(),generation};copy(r.previous,a);this.records.set(a.id,r);this.poses.set(a.id,r.render);}
   copy(r.current,a);r.generation=generation;
   const d=Math.hypot(r.current.pos.x-r.previous.pos.x,r.current.pos.y-r.previous.pos.y,r.current.pos.z-r.previous.pos.z);
   if(a.recoveryThisStep||d>4)copy(r.previous,r.current);
  });
  for(const [id,r] of this.records)if(r.generation!==generation){this.records.delete(id);this.poses.delete(id);}
 }
 sample(alpha){
  alpha=Number.isFinite(alpha)?Math.max(0,Math.min(1,alpha)):1;
  for(const r of this.records.values()){
   const a=r.previous,b=r.current,o=r.render;
   for(const k of ['x','y','z'])o.pos[k]=a.pos[k]+(b.pos[k]-a.pos[k])*alpha;
   for(const k of fields)o[k]=a[k]+(b[k]-a[k])*alpha;
   o.yaw=a.yaw+Math.atan2(Math.sin(b.yaw-a.yaw),Math.cos(b.yaw-a.yaw))*alpha;
  }return this.poses;
 }
 get(id){return this.poses.get(id);}
}
