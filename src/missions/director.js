import {checkpointKey} from '../i18n/legacy.js';
import {LocalizedError} from '../i18n/index.js';
import {message} from '../i18n/message.js';
import {LANDMARKS,HQ} from '../data/world-map.js';
import {OBJECTIVES} from '../data/cambrai.js';
import {PHASE,BRIEFING_DURATION,briefingLine} from '../data/briefing.js';
import {isFieldGunNeutralized} from '../vehicles/field-gun.js';
import {canReach} from '../core/interaction.js';
import {flatDist} from '../core/math.js';

/** Mission state, never a substitute for NPC perception or damage. All clocks are simulated. */
export class Director {
 constructor(){
  this.phase=PHASE.BRIEFING;this.events=[];this.hold=0;this.chapter=0;
  this.lastCheckpoint=null;this.checkpointPending=false;this.checkpointWait=0;
  this.briefingTime=0;this.assaultTime=null;this.contested=false;this.holdThreats=0;
 }
 get objective(){return OBJECTIVES[this.phase];}
 once(id){if(this.events.includes(id))return false;this.events.push(id);return true;}
 caption(w){
  if(this.phase!==PHASE.BRIEFING)return null;
  const line=briefingLine(this.briefingTime);if(!line)return null;
  const speaker=w.npcs.find(n=>n.id===line.actor&&n.hp>0);
  return {...line,speaker:speaker?line.speaker:(w.npcs.find(n=>n.briefingRole&&n.hp>0)?.name||message('speaker.orders'))};
 }
 skipBriefing(w){if(this.phase!==PHASE.BRIEFING)return false;this.briefingTime=BRIEFING_DURATION;this.startAssault(w);return true;}
 startAssault(w){
  if(this.phase!==PHASE.BRIEFING)return;
  this.assaultTime=w.time;this.advance(w);
  for(const n of w.npcs){n.think=0;w.nav.cancel(n);}
  w.emit('whistle',{pos:{...w.player.pos}});
 }
 alert(w,text=message('message.alarm')){
  if(this.phase!==PHASE.BRIEFING)return;
  this.once('early-alarm');this.startAssault(w);w.emit('message',{text});
 }
 checkpoint(name){this.lastCheckpoint=name;this.checkpointPending=true;this.checkpointWait=0;}
 advance(w){
  if(w.player.hp<=0||this.phase>=PHASE.COMPLETE)return;
  this.phase++;for(const n of w.npcs){w.nav.cancel(n);n.think=0;}w.emit('objective',{phase:this.phase});
  const texts={
   1:message('message.advance'),
   2:message('message.mg'),
   3:message('message.rally'),
   4:message('message.artillery'),
   5:message('message.telephone'),
   6:message('message.hold'),
   7:message('message.complete')
  };
  w.emit('message',{text:texts[this.phase]});
  if(this.phase===PHASE.ADVANCE){this.once('assault');if(this.assaultTime===null)this.assaultTime=w.time;}
  if(this.phase===PHASE.ARTILLERY)this.checkpoint('checkpoint.bennett');
  if(this.phase===PHASE.HOLD){this.once('counterattack');for(const n of w.npcs.filter(n=>n.group==='counter')){n.think=0;n.pathTarget=null;}this.checkpoint('checkpoint.telephone');}
  if(this.phase===PHASE.COMPLETE){this.once('finished');w.emit('complete',{});}
 }
 update(w,dt){
  if(w.player.hp<=0||this.phase===PHASE.COMPLETE)return;
  const p=w.player.pos;
  if(this.phase===PHASE.BRIEFING){
   this.briefingTime=Math.min(BRIEFING_DURATION,this.briefingTime+dt);
   if(p.z>21)this.alert(w,message('message.early'));
   else if(this.briefingTime>=BRIEFING_DURATION)this.startAssault(w);
  }
  if(this.phase===PHASE.ADVANCE&&p.z>44)this.advance(w);
  if(this.phase===PHASE.MG){const gun=w.npcs.find(n=>n.id==='de-mg');if(!gun||gun.hp<=0||this.events.includes('mg-silenced')){this.once('mg-silenced');this.advance(w);}}
  if(this.phase===PHASE.ARTILLERY&&w.fieldGuns.every(g=>isFieldGunNeutralized(w,g))){this.once('fieldgun-silenced');this.advance(w);}
  if(this.phase===PHASE.HOLD){
   // Close enemies contest; a lost distant soldier never prevents victory.
   this.holdThreats=w.npcs.filter(n=>n.hp>0&&n.faction==='de'&&flatDist(n.pos,LANDMARKS.telephone)<15).length;
   this.contested=this.holdThreats>0;
   if(flatDist(p,LANDMARKS.telephone)<22){
    if(this.contested)this.hold=Math.max(0,this.hold-dt*.20);
    else this.hold=Math.min(55,this.hold+dt);
    if(this.hold>=55&&!this.contested)this.advance(w);
   }
  }
  if(this.checkpointPending){
   this.checkpointWait+=dt;
   if(w.canCheckpoint()){
    this.checkpointPending=false;this.checkpointWait=0;w.emit('checkpoint',{name:this.lastCheckpoint});
   }
  }
 }
 interaction(w){
  const p=w.player.pos,o=this.objective;if(w.player.hp<=0||this.phase===PHASE.COMPLETE)return null;
  if(this.phase===PHASE.BRIEFING)return{key:'interact',kind:'briefing',label:message('interaction.briefing')};
  for(const gun of w.fieldGuns){
   const point={x:gun.pos.x,y:gun.pos.y+1.05,z:gun.pos.z+.5};
   if(!isFieldGunNeutralized(w,gun)&&p.z>gun.pos.z+.4&&canReach(w,point,3.3,gun.id))return{key:'interact',kind:'fieldgun',id:gun.id,label:message('interaction.fieldgun')};
  }
  if(o.kind==='gun'&&p.z>60.5&&canReach(w,{x:23,y:w.terrain.height(23,62)+1,z:62},3))return{key:'interact',kind:'mg',label:message('interaction.mg')};
  if(o.kind==='interact'&&canReach(w,{x:o.x,y:w.terrain.height(o.x,o.z)+1.35,z:o.z},o.radius))return{key:'interact',kind:'objective',label:this.phase===PHASE.RALLY?message('interaction.dispatch'):message('interaction.telephone')};
  return null;
 }
 interact(w){
  const action=this.interaction(w);if(!action)return false;
  if(action.kind==='briefing')return this.skipBriefing(w);
  if(action.kind==='mg'){
   const gun=w.npcs.find(n=>n.id==='de-mg');
   if(gun&&gun.hp>0){gun.fixed=false;gun.weapon.mag=0;gun.weapon.reserve=0;gun.weapon.cancelReload();gun.state='retreat';w.nav.request(gun,{x:31,y:0,z:127},'retreat');}
   this.once('mg-silenced');this.advance(w);return true;
  }
  if(action.kind==='fieldgun'){
   const gun=w.fieldGuns.find(g=>g.id===action.id);gun.operational=false;gun.disabled=true;gun.neutralized=true;
   this.once('fieldgun-silenced');w.emit('message',{text:message('message.disabled')});w.emit('gun-disabled',{id:gun.id,pos:{...gun.pos}});return true;
  }
  if(action.kind==='objective'){this.advance(w);return true;}return false;
 }
 snapshot(){return{phase:this.phase,events:[...this.events],hold:this.hold,chapter:this.chapter,lastCheckpoint:this.lastCheckpoint,checkpointPending:this.checkpointPending,checkpointWait:this.checkpointWait,briefingTime:this.briefingTime,assaultTime:this.assaultTime,contested:this.contested,holdThreats:this.holdThreats};}
 restore(s){Object.assign(this,s);this.events=[...s.events];if(this.lastCheckpoint!==null)this.lastCheckpoint=checkpointKey(this.lastCheckpoint);}
}
export function validateObjectives(objectives=OBJECTIVES){const ids=new Set();for(const o of objectives){if(ids.has(o.id)||!o.title||!Number.isFinite(o.x)||!Number.isFinite(o.z))throw new LocalizedError('error.objective');ids.add(o.id);}return true;}
