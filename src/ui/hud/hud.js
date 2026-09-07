import {PHASE} from '../../data/briefing.js';
import {damageFeedback} from '../damage-feedback.js';
import {t,text,number} from '../../i18n/index.js';
import {html,keyLabel} from '../common.js';
import {getHudScale} from './settings.js';
import {crosshairMarkup,hitMarkerMarkup,updateCrosshair} from './crosshair.js';
import {updateStance} from './stance.js';
import {subtitleContent,updateSubtitle} from './subtitle.js';
import {updateDiagnostics} from './diagnostics.js';
import {updateWeaponIcon} from './weapon-icon.js';
const slot=(id,content)=>`<div id="slot-${id}" class="hud-slot" data-hud-module="${id}"><div class="hud-content">${content}</div></div>`;
export const hudMarkup=()=>`<div class="damage-vignette" id="damage"></div><div class="damage-direction" id="damage-direction"><span></span></div><div class="friendly-layer" id="friendly-layer" aria-hidden="true"></div><div class="grenade-layer" id="grenade-layer"></div>
<aside class="hud-tactical" id="hud-tactical">${slot('minimap','<div class="minimap-module"><div class="radar-dial"><canvas id="minimap" width="220" height="220"></canvas></div><div id="chapter-label" class="minimap-heading"></div></div>')}${slot('objective','<section class="hud-goal"><div class="hud-label" id="goal-label"></div><div class="hud-objective" id="objective"></div><div class="hud-hint" id="hint"></div><div class="hud-hold" id="hold"><div id="hold-fill"></div></div></section>')}</aside>
<span class="sr-only" id="compass"></span><div class="crosshair" id="crosshair" aria-hidden="true">${crosshairMarkup()}</div><div class="hit-marker" id="hit-marker" aria-hidden="true">${hitMarkerMarkup()}</div>
<section class="health-panel">${slot('stance','<img class="stance-icon" id="stance-icon" width="42" height="42" alt=""><span class="sr-only" id="stance"></span>')}${slot('health','<div class="health-line"><svg class="health-cross" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 2h8v6h6v8h-6v6H8v-6H2V8h6Z" fill="currentColor"/></svg><span id="health-label" class="sr-only"></span><span id="hp"></span></div>')}${slot('stamina','<div class="stamina-bar"><div id="stamina-fill"></div></div>')}</section>
<section class="ammo-panel">${slot('ammo','<div class="ammo-line"><img id="weapon-icon" class="weapon-icon" alt="" width="150" height="38"><div class="ammo-number"><span id="mag"></span><span class="reserve">/ <span id="reserve"></span></span></div></div>')}${slot('grenadeCount','<div class="grenade-stack"><svg class="grenade-icon" width="18" height="25" viewBox="0 0 18 25" aria-hidden="true"><path d="M6 2h6v3H6zm-1 5h8l2 7-1 8-5 2-5-2-1-8zM12 3l3 2 1 6" fill="none" stroke="currentColor" stroke-width="1.8"/></svg><span id="grenade-count"></span><span id="grenades" class="sr-only"></span></div>')}${slot('reload','<div class="reload-status" id="reload"></div>')}</section>
<div class="hud-messages">${slot('critical','<div class="critical-health" id="critical-health" hidden></div>')}${slot('interaction','<div class="interaction" id="interaction" hidden></div>')}${slot('subtitle','<div class="subtitle-box" id="subtitle" hidden><span class="subtitle-speaker" hidden></span><span class="subtitle-text"></span></div>')}</div>
<div class="objective-marker" id="marker"><div class="marker-diamond"></div><div class="marker-distance" id="distance"></div></div>
${slot('notification','<div class="checkpoint-flash" id="checkpoint" hidden role="status"></div>')}${slot('toast','<div id="game-toast-host"></div>')}${slot('fps','<div class="performance-overlay" id="performance"></div>')}
<div class="debug-panel" id="debug" hidden><pre id="debug-text"></pre><canvas id="debug-graph" width="480" height="72" aria-hidden="true"></canvas><div class="debug-controls" id="debug-controls"></div></div><span id="critical-announcement" class="sr-only" role="status" aria-live="polite"></span>`;
export function updatePerformance(view,metrics,now){
 const e=this.el.performance,s=this.app.settings;e.hidden=!s.showFps;
 this.layout?.setVisible('fps',!e.hidden);
 if(e.hidden||now<this.nextPerformance)return;this.nextPerformance=now+250;
 this.text('performance',t('performance.fps',{fps:number(metrics.fps),frame:number(metrics.frame,1)}));
}
export function updateHUD(world,view,metrics){
  this.ensureWorld(world);
  const p=world.player,o=world.director.objective,e=this.el,now=performance.now(),s=this.app.settings;
  this.text('mag',String(p.weapon.mag).padStart(2,'0'));this.text('reserve',p.weapon.reserve);
  updateCrosshair(e.crosshair,e['hit-marker'],s.crosshairStyle,getHudScale(s,'crosshair'),getHudScale(s,'hitMarker'));
  e.crosshair.classList.toggle('ads',p.ads);
  const hit=this.hitFeedback.sample(world.time);e['hit-marker'].dataset.state=hit.state;e['hit-marker'].style.opacity=hit.opacity;
  const feedback=damageFeedback(p,world.time,s.damageEffects,this.reducedMotion());
  e.damage.style.opacity=feedback.vignette;e['damage-direction'].style.opacity=feedback.directionOpacity;e['damage-direction'].style.transform=`translate(-50%,-50%) rotate(${feedback.rotation}deg)`;
  const critical=this.criticalHealth.update(p.hp);e['critical-health'].hidden=!critical.visible;e['critical-health'].style.opacity=this.reducedMotion()?'1':String(.8+feedback.pulse*.2);
  if(critical.announce)this.text('critical-announcement',t('hud.critical'));else if(!critical.visible)this.text('critical-announcement','');
  // Keep damage compositing off the full WebGL canvas; the edge layer supplies feedback.
  if(view.canvas.style.filter!=='none')view.canvas.style.filter='none';
  this.updatePerformance(view,metrics,now);e.debug.hidden=!this.debug;
  this.layout.setVisible('critical',critical.visible);
  if(now>=this.nextHud){this.nextHud=now+50;
  this.text('objective',text(o.title));this.text('hint',text(o.hint,{interact:keyLabel(s.keys.interact)}));
  this.text('goal-label',t('hud.objectives',{current:Math.min(world.director.phase+1,7)}));
  this.text('hp',Math.ceil(p.hp));e['stamina-fill'].style.width=p.stamina/6*100+'%';
  this.text('stance',t(`hud.${p.stance}`));updateStance(e['stance-icon'],p.stance);updateWeaponIcon(e['weapon-icon'],p.weapon);
  this.text('grenade-count',p.grenades);this.text('grenades',t('hud.grenades',{count:p.grenades,key:keyLabel(s.keys.grenade)}));
  this.text('reload',p.weapon.reloadLeft>0?t('hud.reload'):p.weapon.mag===0?t('hud.empty'):p.weapon.cooldown>.28&&['smle','gewehr'].includes(p.weapon.id)?t('hud.bolt'):'');
  e.hold.hidden=world.director.phase!==PHASE.HOLD;if(world.director.contested)this.text('hint',t('hud.contested'));e['hold-fill'].style.width=world.director.hold/55*100+'%';
  const context=world.interaction();e.interaction.hidden=!context;
  if(context){const value=`<span class="keycap">${html(keyLabel(s.keys.interact))}</span>${html(context.label)}`;if(e.interaction.innerHTML!==value){e.interaction.innerHTML=value;this.layout.invalidate('interaction');}}
  const subtitle=subtitleContent(world.director.caption(world),this.message,world.time,this.messageUntil,s.subtitles);
  if(updateSubtitle(e.subtitle,subtitle))this.layout.invalidate('subtitle');
  e.checkpoint.hidden=!this.checkpointUntil||world.time>=this.checkpointUntil;
  this.toastNode.classList.toggle('checkpoint-active',!e.checkpoint.hidden);
  this.layout.setVisible('interaction',!e.interaction.hidden);this.layout.setVisible('subtitle',!e.subtitle.hidden);this.layout.setVisible('notification',!e.checkpoint.hidden);
  this.layout.setVisible('minimap',s.showMinimap!==false);
  }
  this.layout.setVisible('toast',this.toastNode.classList.contains('visible'));
  // Packing may hide the wrapper, never its measured canvas content. Otherwise the
  // next pass measures only the map caption and can oscillate into overlapping panels.
  e.minimap.hidden=s.showMinimap===false;
  const snapshot=this.layout.update();
  this.minimap?.setSize(this.layout.minimapSize,getHudScale(s,'minimap'));
  if(snapshot.rects.minimap)this.minimap?.draw(world,this.contacts.sample(world.time),s,now);
  if(this.markers&&view.projectPoint&&this.app.state==='playing')this.markers.update(world,view,s,snapshot.reserved);
  this.grenadeWarnings.update(world,view,s,snapshot,now);
  const marker=view.marker(),vp=snapshot.viewport,mx=vp.left+marker.x*vp.width/100,my=vp.top+marker.y*vp.height/100,ms=getHudScale(s,'objectiveMarker');
  e.marker.hidden=!marker.visible||marker.distance<6||world.director.phase===PHASE.HOLD||world.director.phase===PHASE.BRIEFING||snapshot.reserved.some(r=>mx>=r.left-12*ms&&mx<=r.right+12*ms&&my>=r.top-18*ms&&my<=r.bottom+18*ms);
  if(!e.marker.hidden){e.marker.style.left=(mx-vp.left)+'px';e.marker.style.top=(my-vp.top)+'px';e.marker.style.transform=`translate(-50%,-50%) scale(${ms})`;this.text('distance',Math.round(marker.distance)+' m');}
  const dirs=['N','NE','E','SE','S','SW','W','NW'],dir=dirs[(Math.round(p.yaw/(Math.PI/4))%8+8)%8];
  if(this.lastCompass!==dir){this.lastCompass=dir;e.compass.innerHTML=`· &nbsp; · &nbsp; <b>${dir}</b> &nbsp; · &nbsp; ·`;}
  if(this.debug&&now>=this.nextDebug){this.nextDebug=now+250;updateDiagnostics(this,world,view,metrics);}
}
