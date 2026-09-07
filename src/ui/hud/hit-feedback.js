/** One small simulation-time state; no DOM allocation, gameplay mutation or wall-clock timers. */
export class HitFeedback {
 constructor(){this.reset(0);}
 reset(sessionId=0){this.sessionId=sessionId;this.lastId=-1;this.until=0;this.state='none';this.output={state:'none',opacity:0};}
 clear(){this.until=0;this.state='none';}
 accept(event,sessionId=this.sessionId){
  if(sessionId!==this.sessionId||!Number.isFinite(event.feedbackId)||event.feedbackId<=this.lastId||!Number.isFinite(event.time))return false;
  this.lastId=event.feedbackId;
  if(event.killed){this.state='kill';this.until=event.time+.26;}
  else if(this.state!=='kill'||event.time>=this.until){this.state='hit';this.until=event.time+.16;}
  return true;
 }
 sample(time){
  const remaining=this.until-time;
  this.output.state=remaining>0?this.state:'none';
  this.output.opacity=remaining>0?Math.min(1,remaining/.05):0;
  return this.output;
 }
}
