/** Render scheduling only. The fixed-step simulation continues on each rAF.
 * A cap of 0 removes the application's limit; it does NOT disable browser VSync.
 */
export class FrameLimiter {
 constructor(){this.reset();}
 reset(){this.next=null;this.cap=null;}
 due(now,requested=0){
  const cap=Number.isFinite(Number(requested))?Math.max(0,Math.min(360,Math.round(Number(requested)))):0;
  if(!Number.isFinite(now))return false;
  if(cap!==this.cap){this.cap=cap;this.next=null;}
  if(!cap)return true;
  const interval=1000/cap;
  if(this.next===null)this.next=now;
  if(now+1e-6<this.next)return false;
  // Preserve the fractional deadline on high-refresh displays, discard stale debt.
  this.next+=interval*Math.max(1,Math.floor((now-this.next+1e-6)/interval)+1);
  return true;
 }
}
