import {campaignFrame,FRONT_SNAPSHOTS} from '../data/campaign-map.js';
export const FRONT_TRANSITION_SECONDS=.9;
const clone=points=>points.map(p=>[...p]);
const ease=value=>value*value*(3-2*value);
function stations(points){
 const values=[0];let total=0;
 for(let i=1;i<points.length;i++){total+=Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]);values.push(total);}
 return total?values.map(v=>v/total):values.map(()=>0);
}
function interpolateAt(points,marks,t){
 if(t<=0)return [...points[0]];if(t>=1)return [...points.at(-1)];
 let i=1;while(i<marks.length-1&&marks[i]<t)i++;
 const span=marks[i]-marks[i-1],u=span?(t-marks[i-1])/span:0;
 return points[i-1].map((v,k)=>v+(points[i][k]-v)*u);
}
function correspond(from,to){
 const a=stations(from),b=stations(to);
 // Include corners from BOTH polylines so the first frame keeps the displayed shape.
 // Bound accumulated vertices during very rapid retargeting; no unbounded event history.
 let marks=[...new Set([...a,...b])].sort((x,y)=>x-y);
 if(marks.length>512)marks=Array.from({length:512},(_,i)=>i/511);
 return {from:marks.map(t=>interpolateAt(from,a,t)),to:marks.map(t=>interpolateAt(to,b,t))};
}
/** Presentation-only morph. Intermediate lines are a transition, NOT historical snapshots.
 * No timers or world state: the screen supplies visible, unpaused UI time.
 */
export class FrontTransition {
 constructor(id='cambrai'){
  campaignFrame(id);this.target=id;this.elapsed=FRONT_TRANSITION_SECONDS;this.source=null;this.geometry=null;
 }
 select(id,reducedMotion=false){
  campaignFrame(id);if(id===this.target){if(reducedMotion)this.finish();return false;}
  this.source=this.sample();this.target=id;this.elapsed=0;
  this.geometry=correspond(this.source.front,campaignFrame(id).front);
  if(reducedMotion)this.finish();return true;
 }
 get done(){return this.elapsed>=FRONT_TRANSITION_SECONDS;}
 advance(seconds){if(Number.isFinite(seconds)&&seconds>0)this.elapsed=Math.min(FRONT_TRANSITION_SECONDS,this.elapsed+seconds);}
 finish(){this.elapsed=FRONT_TRANSITION_SECONDS;this.geometry=null;this.source=null;}
 sample(){
  const progress=Math.max(0,Math.min(1,this.elapsed/FRONT_TRANSITION_SECONDS)),done=progress===1;
  const frame=campaignFrame(this.target),weights=Object.fromEntries(Object.keys(FRONT_SNAPSHOTS).map(id=>[id,id===this.target?1:0]));
  if(done||!this.source)return {front:clone(frame.front),arrows:weights,progress:1,done:true,target:this.target};
  const u=ease(progress),front=progress===0?clone(this.source.front):this.geometry.from.map((p,i)=>p.map((v,k)=>v+(this.geometry.to[i][k]-v)*u));
  for(const id of Object.keys(weights))weights[id]=this.source.arrows[id]+(weights[id]-this.source.arrows[id])*u;
  return {front,arrows:weights,progress,done:false,target:this.target};
 }
}
