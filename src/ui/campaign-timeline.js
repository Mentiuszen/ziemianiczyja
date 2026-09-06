import {WHOLE_VIEW,YPRES_VIEW,CAMBRAI_VIEW} from '../data/campaign-map.js';
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*Math.max(0,Math.min(1,t)));
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
export class CampaignTimeline {
 constructor(intro=false){this.elapsed=intro?0:7;}
 advance(seconds){if(Number.isFinite(seconds)&&seconds>0)this.elapsed=Math.min(7,this.elapsed+seconds);}
 skip(){this.elapsed=7;}
 setReducedMotion(enabled){if(enabled)this.skip();}
 frame(){
  const t=this.elapsed;let view=[...WHOLE_VIEW];
  if(t>=.6&&t<2)view=mix(WHOLE_VIEW,YPRES_VIEW,smooth((t-.6)/1.4));
  else if(t>=2&&t<4)view=[...YPRES_VIEW];
  else if(t>=4)view=mix(YPRES_VIEW,CAMBRAI_VIEW,smooth((t-4)/1.5));
  return{done:t>=7,view,route:Math.max(0,Math.min(1,(t-2)/2)),attack:Math.max(0,Math.min(1,(t-5.5)/1.5)),caption:t<.6?'campaign.introFront':t<2?'campaign.introYpres':t<4?'campaign.introTransfer':'campaign.introCambrai'};
 }
}
