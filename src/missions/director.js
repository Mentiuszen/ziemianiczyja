import {LANDMARKS,HQ} from '../data/world-map.js';
import {OBJECTIVES} from '../data/cambrai.js';
import {PHASE,BRIEFING_DURATION,briefingLine} from '../data/briefing.js';
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
  return {...line,speaker:speaker?line.speaker:(w.npcs.find(n=>n.briefingRole&&n.hp>0)?.name||'Rozkaz operacyjny')};
 }
 skipBriefing(w){if(this.phase!==PHASE.BRIEFING)return false;this.briefingTime=BRIEFING_DURATION;this.startAssault(w);return true;}
 startAssault(w){
  if(this.phase!==PHASE.BRIEFING)return;
  this.assaultTime=w.time;this.advance(w);
  for(const n of w.npcs){n.think=0;n.path=[];n.pathTarget=null;}
  w.emit('whistle',{pos:{...w.player.pos}});
 }
 alert(w,text='Przeciwnik zaalarmowany! Oddział wychodzi ze stanowisk.'){
  if(this.phase!==PHASE.BRIEFING)return;
  this.once('early-alarm');this.startAssault(w);w.emit('message',{text});
 }
 checkpoint(name){this.lastCheckpoint=name;this.checkpointPending=true;this.checkpointWait=0;}
 advance(w){
  if(this.phase>=PHASE.COMPLETE)return;
  this.phase++;w.emit('objective',{phase:this.phase});
  const texts={
   1:'Hughes: Ruszamy! H21 otworzy drut. Trzymaj odstęp i wykorzystuj zagłębienia!',
   2:'Ellis: Schron po prawej! Przycisnę obsługę. Reed, obejdź stanowisko!',
   3:'Hughes: Pierwsza linia pękła. Bennett ma meldunek w schronie po lewej.',
   4:'Bennett: Działo za łącznikiem ostrzeliwuje nasze czołgi. Podejdź z flanki. Meldunek masz przy sobie.',
   5:'Działo uciszone. Dotrzyj do telefonu w ruinach i przekaż meldunek.',
   6:'Łączność działa. Niemcy ruszają z północy. Oczyść budynek i utrzymaj pozycję!',
   7:'Meldunek przyjęty. Utrzymaliście ten odcinek — dalszy wynik ofensywy pozostaje niepewny.'
  };
  w.emit('message',{text:texts[this.phase]});
  if(this.phase===PHASE.ADVANCE){this.once('assault');if(this.assaultTime===null)this.assaultTime=w.time;}
  if(this.phase===PHASE.ARTILLERY)this.checkpoint('Meldunek Bennetta');
  if(this.phase===PHASE.HOLD){this.once('counterattack');for(const n of w.npcs.filter(n=>n.group==='counter')){n.think=0;n.pathTarget=null;}this.checkpoint('Punkt łączności');}
  if(this.phase===PHASE.COMPLETE){this.once('finished');w.emit('complete',{});}
 }
 update(w,dt){
  const p=w.player.pos;
  if(this.phase===PHASE.BRIEFING){
   this.briefingTime=Math.min(BRIEFING_DURATION,this.briefingTime+dt);
   if(p.z>21)this.alert(w,'Hughes: Reed ruszył naprzód. Wszyscy na pozycje, zaczynamy!');
   else if(this.briefingTime>=BRIEFING_DURATION)this.startAssault(w);
  }
  if(this.phase===PHASE.ADVANCE&&p.z>44)this.advance(w);
  if(this.phase===PHASE.MG){const gun=w.npcs.find(n=>n.id==='de-mg');if(!gun||gun.hp<=0||this.events.includes('mg-silenced')){this.once('mg-silenced');this.advance(w);}}
  if(this.phase===PHASE.ARTILLERY&&w.fieldGuns.every(g=>!g.operational)){this.once('fieldgun-silenced');this.advance(w);}
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
   if(!w.grenades.length&&!w.shells.length&&!(w.air?.bombs.length)&&w.player.hp>0&&w.player.health.delay<=0){
    this.checkpointPending=false;this.checkpointWait=0;w.emit('checkpoint',{name:this.lastCheckpoint});
   }
  }
 }
 interact(w){
  const p=w.player.pos,o=this.objective;
  if(this.phase===PHASE.BRIEFING)return this.skipBriefing(w);
  if(o.kind==='gun'){
   if(p.z>60.5&&flatDist(p,{x:23,z:62})<3){
    const gun=w.npcs.find(n=>n.id==='de-mg');if(gun&&gun.hp>0){gun.fixed=false;gun.weapon.mag=0;gun.weapon.reserve=0;gun.weapon.cancelReload();gun.state='retreat';w.nav.request(gun,{x:31,y:0,z:127});}
    this.once('mg-silenced');this.advance(w);return true;
   }return false;
  }
  // Rear breech is available early too. No hidden requirement for the player's final hit.
  const gun=w.fieldGuns.find(g=>g.operational&&p.z>g.pos.z+.4&&flatDist(p,g.pos)<3.3);
  if(gun){gun.operational=false;gun.disabled=true;this.once('fieldgun-silenced');w.emit('message',{text:'Zamek wyłączony. To działo już nie wystrzeli.'});w.emit('gun-disabled',{id:gun.id,pos:{...gun.pos}});return true;}
  if(o.kind==='interact'&&flatDist(p,{x:o.x,z:o.z})<o.radius){this.advance(w);return true;}
  return false;
 }
 snapshot(){return{phase:this.phase,events:[...this.events],hold:this.hold,chapter:this.chapter,lastCheckpoint:this.lastCheckpoint,checkpointPending:this.checkpointPending,checkpointWait:this.checkpointWait,briefingTime:this.briefingTime,assaultTime:this.assaultTime,contested:this.contested,holdThreats:this.holdThreats};}
 restore(s){Object.assign(this,s);this.events=[...s.events];}
}
export function validateObjectives(objectives=OBJECTIVES){const ids=new Set();for(const o of objectives){if(ids.has(o.id)||!o.title||!Number.isFinite(o.x)||!Number.isFinite(o.z))throw Error('Nieprawidłowa definicja celu');ids.add(o.id);}return true;}
