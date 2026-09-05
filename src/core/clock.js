/** A single owner of simulation time. Never catch up time spent in a hidden tab. */
export class FixedClock {
 constructor(step=1/60,maxSteps=5){this.step=step;this.maxSteps=maxSteps;this.accumulator=0;}
 advance(delta,active,tick){if(!active){this.accumulator=0;return 0;}this.accumulator+=Math.min(Math.max(delta,0),this.step*this.maxSteps);let n=0;while(this.accumulator+1e-10>=this.step&&n<this.maxSteps){tick(this.step);this.accumulator-=this.step;n++;}if(n===this.maxSteps)this.accumulator=0;return n;}
 reset(){this.accumulator=0;}
}
