import {LANDMARKS,northZ} from '../data/world-map.js';
import {OBJECTIVES,COUNTERATTACK} from '../data/cambrai.js';
import {flatDist} from '../core/math.js';
export class Director {
 constructor(){this.phase=0;this.events=[];this.hold=0;this.chapter=0;this.lastCheckpoint=null;this.checkpointPending=false;this.checkpointWait=0;}
 get objective(){return OBJECTIVES[this.phase];}
 once(id){if(this.events.includes(id))return false;this.events.push(id);return true;}
 advance(w){if(this.phase>=6)return;this.phase++;w.emit('objective',{phase:this.phase});
  const texts={1:'Hughes: Za czołgami! Przejście jest po prawej. Nie zatrzymujcie się na odkrytym terenie.',2:'Ellis: Karabin w schronie po prawej! Wezmę go pod ogień. Możesz obejść go od tyłu.',3:'Hughes: Linia pękła. Bennett czeka w punkcie sanitarnym, po lewej stronie.',4:'Bennett: Łącznik prowadzi pod ruiny. Telefon ocalał — przekaż meldunek, Reed.',5:'Łączność przywrócona. Niemiecki oddział zbliża się od północy. Utrzymaj punkt!',6:'Meldunek przyjęty. Utrzymaliście lokalny odcinek. Dalej front pozostaje niestabilny.'};
  if(texts[this.phase])w.emit('message',{text:texts[this.phase]});
  if(this.phase===1)this.once('assault');
  if(this.phase===4){this.checkpointPending=true;this.lastCheckpoint='Punkt sanitarny';}
  if(this.phase===5){if(this.once('counterattack')){for(const data of COUNTERATTACK)w.spawnSoldier(data);}this.checkpointPending=true;this.lastCheckpoint='Przed kontratakiem';}
  if(this.phase===6){this.once('finished');w.emit('complete',{});}
 }
 update(w,dt){const p=w.player.pos;
  if(this.phase===1&&p.z>44)this.advance(w);
  if(this.phase===2&&w.npcs.find(n=>n.id==='de-mg')?.hp<=0){this.once('mg-silenced');this.advance(w);}
  if(this.phase===5&&flatDist(p,LANDMARKS.telephone)<22){this.hold=Math.min(55,this.hold+dt);if(this.hold>=55)this.advance(w);}
  if(this.checkpointPending){this.checkpointWait+=dt;if(w.grenades.length===0&&w.shells.length===0&&w.player.hp>0&&w.player.health.delay<=0){this.checkpointPending=false;this.checkpointWait=0;w.emit('checkpoint',{name:this.lastCheckpoint});}}
 }
 interact(w){const o=this.objective,p=w.player.pos;
  if(o.kind==='gun'){if(p.z>60.5&&flatDist(p,{x:23,z:62})<3){const gun=w.npcs.find(n=>n.id==='de-mg');if(gun&&gun.hp>0){gun.fixed=false;gun.weapon.mag=0;gun.weapon.reserve=0;gun.weapon.cancelReload();gun.state='retreat';w.nav.request(gun,{x:31,y:0,z:northZ(87)});}this.once('mg-silenced');this.advance(w);return true;}return false;}
  if(o.kind==='interact'&&flatDist(p,{x:o.x,z:o.z})<o.radius){this.advance(w);return true;}return false;
 }
 snapshot(){return{phase:this.phase,events:[...this.events],hold:this.hold,chapter:this.chapter,lastCheckpoint:this.lastCheckpoint,checkpointPending:this.checkpointPending,checkpointWait:this.checkpointWait};}
 restore(s){Object.assign(this,s);this.events=[...s.events];}
}
export function validateObjectives(objectives=OBJECTIVES){const ids=new Set();for(const o of objectives){if(ids.has(o.id)||!o.title||!Number.isFinite(o.x)||!Number.isFinite(o.z))throw Error('Nieprawidłowa definicja celu');ids.add(o.id);}return true;}
