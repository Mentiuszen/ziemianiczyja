/** Non-blocking WebGL2 GPU measurements. No gl.finish(), polling loops or CPU fallback.
 * The extension is optional (notably privacy settings may disable it).
 */
export class GpuTimer {
  constructor(gl, {sampleEvery = 4, maxPending = 4} = {}) {
    this.gl = gl;
    this.extension = gl?.getExtension('EXT_disjoint_timer_query_webgl2') || null;
    this.sampleEvery = sampleEvery;
    this.maxPending = maxPending;
    this.pending = [];
    this.active = null;
    this.enabled = false;
    this.disposed = false;
    this.sequence = 0;
    this.samples = [];
    this.milliseconds = null;
    this.status = 'disabled';
    this.lastSampleAt = 0;
  }
  setEnabled(enabled) {
    if(this.disposed || this.enabled === !!enabled) return;
    this.enabled = !!enabled;
    this.clear();
    this.status = !enabled ? 'disabled' : this.extension ? 'waiting' : 'unsupported';
  }
  begin(now = performance.now()) {
    if (!this.enabled || !this.extension || this.disposed) return;
    if(this.gl.isContextLost?.()) {this.clear();this.status='context-lost';return;}
    this.poll(now);
    if(this.status==='disjoint' || this.active || this.pending.length>=this.maxPending) return;
    if(this.sequence++ % this.sampleEvery !== 0) return;
    const query = this.gl.createQuery();
    if(!query) return;
    this.active = query;
    this.gl.beginQuery(this.extension.TIME_ELAPSED_EXT,query);
  }
  end() {
    if(!this.active) return;
    this.gl.endQuery(this.extension.TIME_ELAPSED_EXT);
    this.pending.push(this.active);
    this.active = null;
  }
  poll(now = performance.now()) {
    if(!this.enabled || !this.extension || this.disposed) return;
    if(this.gl.getParameter(this.extension.GPU_DISJOINT_EXT)) {
      this.clear();this.status='disjoint';return;
    }
    if(this.status==='disjoint') this.status='waiting';
    while(this.pending.length && this.gl.getQueryParameter(this.pending[0],this.gl.QUERY_RESULT_AVAILABLE)) {
      const query=this.pending.shift();
      const ns=this.gl.getQueryParameter(query,this.gl.QUERY_RESULT);
      this.gl.deleteQuery(query);
      if(Number.isFinite(ns) && ns>=0) {
        this.samples.push(ns/1e6);
        if(this.samples.length>20) this.samples.shift();
        this.milliseconds=this.samples.reduce((a,b)=>a+b,0)/this.samples.length;
        this.lastSampleAt=now;
        this.status='ready';
      }
    }
    if(this.lastSampleAt && now-this.lastSampleAt>2500) {
      this.milliseconds=null;this.samples.length=0;this.status='waiting';
    }
  }
  clear() {
    if(this.active) {
      this.gl.endQuery(this.extension.TIME_ELAPSED_EXT);
      this.gl.deleteQuery(this.active);this.active=null;
    }
    for(const query of this.pending) this.gl.deleteQuery(query);
    this.pending.length=0;this.samples.length=0;
    this.milliseconds=null;this.lastSampleAt=0;this.sequence=0;
  }
  dispose() {if(this.disposed)return;this.clear();this.enabled=false;this.disposed=true;this.status='disposed';}
}
