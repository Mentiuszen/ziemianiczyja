const FRAME_FIELDS=Object.freeze(['frame','cpu','simulation','audio','events','scene','render','hud','profiler','nav','steps','droppedMs']);
const RAF_FIELDS=Object.freeze(['interval','cpu','steps','droppedMs']);
const GPU_FIELDS=Object.freeze(['milliseconds']);
/** Fixed-size storage; invalid metric samples remain NaN, never fabricated zeroes. */
class SampleRing {
 constructor(capacity,fields){this.capacity=capacity;this.fields=fields;this.slots=Array.from({length:capacity},()=>Object.fromEntries(['now','frameId','sessionId','flags',...fields].map(k=>[k,NaN])));this.reset();}
 reset(){this.cursor=0;this.count=0;}
 push(value,now,sessionId){const slot=this.slots[this.cursor];slot.now=now;slot.frameId=value.frameId??0;slot.sessionId=sessionId;slot.flags=value.flags??0;for(const key of this.fields)slot[key]=Number.isFinite(value[key])&&value[key]>=0?value[key]:NaN;this.cursor=(this.cursor+1)%this.capacity;this.count=Math.min(this.capacity,this.count+1);return slot;}
 trim(before){while(this.count&&this.at(0).now<before)this.count--;}
 at(index){return this.slots[(this.cursor-this.count+index+this.capacity)%this.capacity];}
 export(){return Array.from({length:this.count},(_,i)=>({...this.at(i)}));}
}
const empty=()=>({n:0,avg:null,p50:null,p95:null,p99:null,max:null,smallSample:true});
function summarize(ring,key,scratch,transform=null){
 let n=0,total=0;
 for(let i=0;i<ring.count;i++){let v=ring.at(i)[key];if(!Number.isFinite(v))continue;if(transform)v=transform(v);if(!Number.isFinite(v))continue;scratch[n++]=v;total+=v;}
 if(!n)return empty();const sorted=scratch.subarray(0,n);sorted.sort();const at=q=>sorted[Math.max(0,Math.ceil(q*n)-1)];
 return{n,avg:total/n,p50:at(.5),p95:at(.95),p99:n>=100?at(.99):null,max:sorted[n-1],smallSample:n<1000};
}
export class PerformanceMonitor {
 constructor(capacity=8192,publishEveryMs=250,windowMs=10000){
  if(!Number.isInteger(capacity)||capacity<1)throw new RangeError('Invalid sample capacity');
  this.capacity=capacity;this.publishEveryMs=publishEveryMs;this.windowMs=windowMs;
  this.frames=new SampleRing(capacity,FRAME_FIELDS);this.rafs=new SampleRing(capacity,RAF_FIELDS);this.gpus=new SampleRing(capacity,GPU_FIELDS);
  this.scratch=new Float64Array(capacity);this.samples=this.frames.slots;this.capture=null;this.targetHz=null;this.frameCap=0;this.reset();
 }
 get count(){return this.frames.count;}
 get cursor(){return this.frames.cursor;}
 reset(reason='reset'){
  this.frames.reset();this.rafs.reset();this.gpus.reset();this.sessionId=(this.sessionId||0)+1;this.lastPublish=-Infinity;this.lastNow=-Infinity;
  this.metrics={fps:0,frame:0,p95:0,p99:null,cpu:0,simulation:0,render:0,series:{},sampleCount:0,windowMs:0,gpu:empty()};
  if(this.capture)this.capture.segments.push({sessionId:this.sessionId,reason});
 }
 setBudget(targetHz=null,cap=0){this.targetHz=Number.isFinite(targetHz)&&targetHz>0?targetHz:null;this.frameCap=Number.isFinite(cap)&&cap>0?cap:0;}
 get budgetMs(){const period=this.targetHz?1000/this.targetHz:(this.metrics?.series?.raf?.p50||this.metrics?.series?.frame?.p50||1000/60);return Math.max(this.frameCap?1000/this.frameCap:0,period);}
 recordRaf(sample,now=performance.now()){
  this.rafs.push(sample,now,this.sessionId);this.rafs.trim(now-this.windowMs);
  if(this.capture?.active)this.capture.rafs.push(sample,now,this.sessionId);
 }
 recordGpu(sample){
  if(sample.sessionId!==this.sessionId||!Number.isFinite(sample.milliseconds)||sample.milliseconds<0||!Number.isFinite(sample.submittedAt))return false;
  this.gpus.push(sample,sample.submittedAt,this.sessionId);if(Number.isFinite(this.lastNow))this.gpus.trim(this.lastNow-this.windowMs);
  if(this.capture?.active)this.capture.gpus.push(sample,sample.submittedAt,this.sessionId);return true;
 }
 invalidateGpu(){this.gpus.reset();}
 record(sample,now=performance.now()){
  if(!Number.isFinite(sample.frame)||sample.frame<=0||!Number.isFinite(now))return null;
  if(now<this.lastNow)this.reset('clock-reversed');this.lastNow=now;
  const slot=this.frames.push(sample,now,this.sessionId);this.frames.trim(now-this.windowMs);this.gpus.trim(now-this.windowMs);
  this.lastCaptureSlot=this.capture?.active?this.capture.frames.push(sample,now,this.sessionId):null;
  if(now-this.lastPublish>=this.publishEveryMs){this.lastPublish=now;this.publish(now);}
  return slot;
 }
 /** Close CPU measurement after the profiler itself has run. Next publication sees this correction. */
 finishRecord(slot,cpu,profiler){if(!slot)return;slot.cpu=cpu;slot.profiler=profiler;if(this.lastCaptureSlot){this.lastCaptureSlot.cpu=cpu;this.lastCaptureSlot.profiler=profiler;}}
 publish(now=this.lastNow){
  const series={};for(const key of FRAME_FIELDS)series[key]=summarize(this.frames,key,this.scratch);
  series.raf=summarize(this.rafs,'interval',this.scratch);series.cpuRaf=summarize(this.rafs,'cpu',this.scratch);
  const fps=summarize(this.frames,'frame',this.scratch,v=>1000/v),gpu=summarize(this.gpus,'milliseconds',this.scratch),budget=this.budgetMs;
  const stalls={overBudget15:0,overBudget2:0,over16:0,over33:0,excess15:0,excess2:0};
  for(let i=0;i<this.frames.count;i++){const f=this.frames.at(i).frame;if(f>budget*1.5){stalls.overBudget15++;stalls.excess15+=f-budget*1.5;}if(f>budget*2){stalls.overBudget2++;stalls.excess2+=f-budget*2;}if(f>1000/60)stalls.over16++;if(f>1000/30)stalls.over33++;}
  const frame=series.frame;
  this.metrics={series,gpu,stalls,budgetMs:budget,sampleCount:this.frames.count,sessionId:this.sessionId,
   windowMs:this.frames.count?Math.max(0,now-this.frames.at(0).now):0,
   fps:frame.avg?1000/frame.avg:0,frame:frame.avg??0,p95:frame.p95??0,p99:frame.p99,
   fpsAtP95:frame.p95?1000/frame.p95:null,fpsAtP99:frame.p99?1000/frame.p99:null,fpsP95:fps.p95,fpsP99:fps.p99,
   cpu:series.cpu.avg??0,simulation:series.simulation.avg??0,render:series.render.avg??0,
   capture:this.capture?.active??false,captureTruncated:!!this.capture&&(this.capture.frames.count===this.capture.frames.capacity)};
 }
 copyFrameHistory(out){const count=Math.min(out.length,this.frames.count);for(let i=0;i<count;i++)out[i]=this.frames.at(this.frames.count-count+i).frame;return count;}
 startCapture(metadata={}){
  // Explicit allocation, only on operator request; ordinary play keeps a 10-second window.
  this.capture={active:true,metadata:{...metadata},segments:[],frames:new SampleRing(65536,FRAME_FIELDS),rafs:new SampleRing(65536,RAF_FIELDS),gpus:new SampleRing(32768,GPU_FIELDS)};
  this.reset('capture-start');return this.sessionId;
 }
 stopCapture(){if(this.capture)this.capture.active=false;return this.exportCapture();}
 exportCapture(metadata={}){
  const source=this.capture||{frames:this.frames,rafs:this.rafs,gpus:this.gpus,segments:[]};
  return{schema:1,metadata:{...source.metadata,...metadata},definitions:{frame:'render callback interval, milliseconds',cpu:'measured application main-thread work; summed between renders',gpu:'raw asynchronous WebGL query; identified by submitted frame',percentile:'nearest rank; p99 omitted below 100 valid samples',fpsAtP99:'1000 / frame-time p99, NOT a mean 1% low'},segments:source.segments,
   truncated:[source.frames,source.rafs,source.gpus].some(r=>r.count===r.capacity),frames:source.frames.export(),rafs:source.rafs.export(),gpu:source.gpus.export()};
 }
}
