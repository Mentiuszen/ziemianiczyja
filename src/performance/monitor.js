/** CPU timings mean measured JS/main-thread work, not 1000/FPS.
 * Frame time additionally contains GPU waiting, VSync and browser scheduling.
 */
export class PerformanceMonitor {
  constructor(capacity = 180, publishEveryMs = 250) {
    this.capacity = capacity;
    this.publishEveryMs = publishEveryMs;
    this.samples = Array.from({length:capacity}, () => ({frame:0,cpu:0,simulation:0,render:0}));
    this.reset();
  }
  reset() {
    this.count = this.cursor = 0;
    this.lastPublish = -Infinity;
    this.metrics = {fps:0,frame:0,p95:0,cpu:0,simulation:0,render:0};
  }
  record(sample, now = performance.now()) {
    if (!Number.isFinite(sample.frame) || sample.frame <= 0) return;
    const slot = this.samples[this.cursor];
    for (const key of ['frame','cpu','simulation','render']) slot[key] = Math.max(0,Number.isFinite(sample[key]) ? sample[key] : 0);
    this.cursor = (this.cursor + 1) % this.capacity;
    this.count = Math.min(this.capacity, this.count + 1);
    if (now - this.lastPublish < this.publishEveryMs) return;
    this.lastPublish = now;
    const metrics = {frame:0,cpu:0,simulation:0,render:0}, times=[];
    for (let i=0;i<this.count;i++) {
      for(const key of Object.keys(metrics)) metrics[key] += this.samples[i][key]/this.count;
      times.push(this.samples[i].frame);
    }
    times.sort((a,b)=>a-b);
    this.metrics = {...metrics,fps:1000/metrics.frame,p95:times[Math.max(0,Math.ceil(times.length*.95)-1)]};
  }
}
