/** Fixed simulation ownership. Presentation alpha never changes simulation time. */
export class FixedClock {
 constructor(step=1/60,maxSteps=5){this.step=step;this.maxSteps=maxSteps;this.reset();}
 get alpha(){return Math.max(0,Math.min(1,this.accumulator/this.step));}
 advance(delta,active,tick){
  this.lastSteps=0;this.lastDroppedMs=0;
  if(!active){this.accumulator=0;return 0;}
  const elapsed=Number.isFinite(delta)?Math.max(0,delta):0,accepted=Math.min(elapsed,this.step*this.maxSteps);
  this.lastDroppedMs=(elapsed-accepted)*1000;this.accumulator+=accepted;
  while(this.accumulator+1e-10>=this.step&&this.lastSteps<this.maxSteps){tick(this.step);this.accumulator-=this.step;this.lastSteps++;}
  if(this.lastSteps===this.maxSteps){this.lastDroppedMs+=Math.max(0,this.accumulator)*1000;this.accumulator=0;}
  this.droppedMs+=this.lastDroppedMs;return this.lastSteps;
 }
 reset(){this.accumulator=0;this.lastSteps=0;this.lastDroppedMs=0;this.droppedMs=0;}
}
