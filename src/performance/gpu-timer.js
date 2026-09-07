/** Bounded, asynchronous WebGL2 queries. No waiting loops or CPU-derived substitute. */
export class GpuTimer {
 constructor(gl,{sampleEvery=4,maxPending=4}={}){
  this.gl=gl;this.extension=gl?.getExtension('EXT_disjoint_timer_query_webgl2')||null;
  this.sampleEvery=sampleEvery;this.maxPending=maxPending;this.pending=[];this.completed=[];
  this.active=null;this.enabled=false;this.disposed=false;this.sessionId=0;this.sequence=0;this.nextSequence=0;this.samplePhase=0;
  this.samples=[];this.milliseconds=null;this.status='disabled';this.lastSampleAt=0;
 }
 setEnabled(enabled,sessionId=this.sessionId){
  if(this.disposed||(this.enabled===!!enabled&&sessionId===this.sessionId))return;
  this.clear();this.enabled=!!enabled;this.sessionId=sessionId;this.status=!enabled?'disabled':this.extension?'waiting':'unsupported';
 }
 begin(now=performance.now(),{frameId=0,sessionId=this.sessionId}={}){
  if(!this.enabled||!this.extension||this.disposed)return;
  if(sessionId!==this.sessionId){this.clear();this.sessionId=sessionId;}
  this.poll(now);if(this.status==='context-lost'||this.status==='disjoint'||this.active||this.pending.length>=this.maxPending)return;
  const sequence=this.sequence++;if(sequence<this.nextSequence)return;
  // Deterministic 3/4/5 spacing around the default cadence avoids a fixed 4-frame phase.
  this.nextSequence=sequence+Math.max(1,this.sampleEvery+(this.sampleEvery>1?(this.samplePhase++%3)-1:0));
  const query=this.gl.createQuery();if(!query)return;
  this.active={query,frameId,sessionId,submittedAt:now};this.gl.beginQuery(this.extension.TIME_ELAPSED_EXT,query);
 }
 end(){if(!this.active)return;this.gl.endQuery(this.extension.TIME_ELAPSED_EXT);this.pending.push(this.active);this.active=null;}
 poll(now=performance.now()){
  if(!this.enabled||!this.extension||this.disposed)return;
  if(this.gl.isContextLost?.()){this.clear();this.status='context-lost';return;}
  if(this.gl.getParameter(this.extension.GPU_DISJOINT_EXT)){this.clear();this.status='disjoint';return;}
  if(this.status==='disjoint'||this.status==='context-lost')this.status='waiting';
  // At most maxPending iterations; availability is checked before reading the result.
  for(let i=0;i<this.maxPending&&this.pending.length;i++){
   const item=this.pending[0];if(!this.gl.getQueryParameter(item.query,this.gl.QUERY_RESULT_AVAILABLE))break;
   this.pending.shift();const ns=this.gl.getQueryParameter(item.query,this.gl.QUERY_RESULT);this.gl.deleteQuery(item.query);
   if(item.sessionId!==this.sessionId||now-item.submittedAt>2500||!Number.isFinite(ns)||ns<0)continue;
   const milliseconds=ns/1e6;
   this.completed.push({frameId:item.frameId,sessionId:item.sessionId,submittedAt:item.submittedAt,milliseconds});
   if(this.completed.length>256)this.completed.shift();
   this.samples.push(milliseconds);if(this.samples.length>20)this.samples.shift();
   this.milliseconds=this.samples.reduce((a,b)=>a+b,0)/this.samples.length;this.lastSampleAt=now;this.status='ready';
  }
  if(this.lastSampleAt&&now-this.lastSampleAt>2500){this.samples.length=0;this.milliseconds=null;this.status='waiting';}
 }
 drainSamples(){if(!this.completed.length)return[];const out=this.completed;this.completed=[];return out;}
 clear(){
  if(this.active){if(!this.gl.isContextLost?.())this.gl.endQuery(this.extension.TIME_ELAPSED_EXT);this.gl.deleteQuery(this.active.query);this.active=null;}
  for(const item of this.pending)this.gl.deleteQuery(item.query);
  this.pending.length=this.samples.length=this.completed.length=0;
  this.milliseconds=null;this.lastSampleAt=0;this.sequence=this.nextSequence=this.samplePhase=0;this.samplePhase=0;
 }
 dispose(){if(this.disposed)return;this.clear();this.enabled=false;this.disposed=true;this.status='disposed';}
}
