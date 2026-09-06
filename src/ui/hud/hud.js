import {PHASE} from '../../data/briefing.js';
import {damageFeedback} from '../damage-feedback.js';
import {t,text,hasKey,number} from '../../i18n/index.js';
import {html,keyLabel} from '../common.js';
import {VERSION} from '../../version.js';
import {updateWeaponIcon} from './weapon-icon.js';
const stateName=value=>hasKey(`state.${value}`)?t(`state.${value}`):String(value??'—');
const gpuStatus=status=>hasKey(`gpu.${status}`)?t(`gpu.${status}`):t('gpu.waiting');
export const hudMarkup=()=>`<div class="friendly-layer" id="friendly-layer" aria-hidden="true"></div><div class="damage-vignette" id="damage"></div><div class="damage-direction" id="damage-direction"><span></span></div><aside class="hud-tactical" id="hud-tactical"><div class="minimap-module"><div class="radar-dial"><canvas id="minimap" width="220" height="220"></canvas></div><div id="chapter-label" class="minimap-heading"></div></div><section class="hud-goal"><div class="hud-label" id="goal-label"></div><div class="hud-objective" id="objective"></div><div class="hud-hint" id="hint"></div><div class="hud-hold" id="hold"><div id="hold-fill"></div></div></section></aside><span class="sr-only" id="compass"></span><div class="crosshair" id="crosshair"></div><section class="health-panel"><div class="health-line"><svg class="health-cross" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 2h8v6h6v8h-6v6H8v-6H2V8h6Z" fill="currentColor"/></svg><span id="health-label" class="sr-only"></span><span id="hp"></span><div class="health-bar"><div id="hp-fill"></div></div></div><div class="stamina-bar"><div id="stamina-fill"></div></div><div class="stance-label" id="stance"></div></section><section class="ammo-panel"><div class="ammo-line"><img id="weapon-icon" class="weapon-icon" alt="" width="150" height="38"><div class="ammo-number"><span id="mag"></span><span class="reserve">/ <span id="reserve"></span></span></div><div class="grenade-stack"><svg class="grenade-icon" width="18" height="25" viewBox="0 0 18 25" aria-hidden="true"><path d="M6 2h6v3H6zm-1 5h8l2 7-1 8-5 2-5-2-1-8zM12 3l3 2 1 6" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M5 12h8M5 17h8M7 8v13m4-13v13" fill="none" stroke="currentColor" stroke-width=".7"/></svg><span id="grenade-count"></span><span id="grenades" class="sr-only"></span></div></div><div class="reload-status" id="reload"></div></section><div class="hud-messages"><div class="critical-health" id="critical-health"></div><div class="grenade-warning" id="grenade-warning" hidden></div><div class="interaction" id="interaction" hidden></div><div class="subtitle-box" id="subtitle" hidden></div></div><div class="objective-marker" id="marker"><div class="marker-diamond"></div><div class="marker-distance" id="distance"></div></div><div class="checkpoint-flash" id="checkpoint" hidden role="status"></div><div class="debug-panel" id="debug" hidden></div><div class="performance-overlay" id="performance" hidden></div>`;
export function updatePerformance(view,metrics,now){
  const e=this.el.performance,s=this.app.settings;e.hidden=!(s.showFps||s.showCpu||s.showGpu);
  if(e.hidden||now<this.nextPerformance)return;this.nextPerformance=now+250;const lines=[];
  if(s.showFps)lines.push(t('performance.fps',{fps:number(metrics.fps),frame:number(metrics.frame,1)}));
  if(s.showCpu)lines.push(t('performance.cpu',{cpu:number(metrics.cpu,2),simulation:number(metrics.simulation,2),render:number(metrics.render,2)}));
  if(s.showGpu){const timer=view.gpuTimer;lines.push(timer.milliseconds===null?`GPU — (${gpuStatus(timer.status)})`:`GPU ${number(timer.milliseconds,2)} ms`);}
  this.text('performance',lines.join('\n'));
 }
export function updateHUD(world,view,metrics){
  this.ensureWorld(world);
  const p=world.player,o=world.director.objective,e=this.el,now=performance.now(),s=this.app.settings;
  this.minimap?.draw(world,this.contacts.sample(world.time),s,now);
  if(this.markers&&view.projectPoint&&this.app.state==='playing'){this.markers.update(world,view,s,this.reservedHudRects());}
  this.text('mag',String(p.weapon.mag).padStart(2,'0'));this.text('reserve',p.weapon.reserve);
  const crosshair='crosshair'+(p.ads?' ads':'')+(p.hitMarker>0?' hit':'');if(e.crosshair.className!==crosshair)e.crosshair.className=crosshair;
  const feedback=damageFeedback(p,world.time,s.damageEffects);
  e.damage.style.opacity=feedback.vignette;e['damage-direction'].style.opacity=feedback.directionOpacity;e['damage-direction'].style.transform=`translate(-50%,-50%) rotate(${feedback.rotation}deg)`;
  e['critical-health'].hidden=p.hp>=30||s.damageEffects===0;e['critical-health'].style.opacity=.5+feedback.pulse*.5;view.canvas.style.filter=feedback.saturation<.999?`saturate(${feedback.saturation})`:'none';
  this.updatePerformance(view,metrics,now);e.debug.hidden=!this.debug;if(now<this.nextHud)return;this.nextHud=now+50;
  this.text('objective',text(o.title));this.text('hint',text(o.hint,{interact:keyLabel(s.keys.interact)}));
  this.text('goal-label',t('hud.objectives',{current:Math.min(world.director.phase+1,7)}));
  this.text('hp',Math.ceil(p.hp));e['hp-fill'].style.width=p.hp+'%';e['hp-fill'].style.background=p.hp<30?'#d17d70':'#edece4';e['stamina-fill'].style.width=p.stamina/6*100+'%';
  this.text('stance',t(`hud.${p.stance}`));updateWeaponIcon(e['weapon-icon'],p.weapon);
  this.text('grenade-count',p.grenades);this.text('grenades',t('hud.grenades',{count:p.grenades,key:keyLabel(s.keys.grenade)}));
  this.text('reload',p.weapon.reloadLeft>0?t('hud.reload'):p.weapon.mag===0?t('hud.empty'):p.weapon.cooldown>.28&&['smle','gewehr'].includes(p.weapon.id)?t('hud.bolt'):'');
  e.hold.hidden=world.director.phase!==PHASE.HOLD;if(world.director.contested)this.text('hint',t('hud.contested'));e['hold-fill'].style.width=world.director.hold/55*100+'%';
  const context=world.interaction();e.interaction.hidden=!context;
  if(context){const value=`<span class="keycap">${html(keyLabel(s.keys.interact))}</span>${html(context.label)}`;if(e.interaction.innerHTML!==value)e.interaction.innerHTML=value;}
  const caption=world.director.caption(world),subtitle=caption?`${text(caption.speaker)}\n${text(caption.text)}`:text(this.message);
  e.subtitle.hidden=!s.subtitles||(!caption&&(world.time>this.messageUntil||!subtitle));this.text('subtitle',subtitle);
  e.checkpoint.hidden=!this.checkpointUntil||world.time>=this.checkpointUntil;
  this.toastNode.classList.toggle('checkpoint-active',!e.checkpoint.hidden);
  const marker=view.marker();e.marker.hidden=!marker.visible||marker.x<4||marker.x>96||marker.y<17||marker.y>85||marker.distance<6||(world.director.phase===PHASE.HOLD||world.director.phase===PHASE.BRIEFING);
  if(!e.marker.hidden){e.marker.style.left=marker.x+'%';e.marker.style.top=marker.y+'%';this.text('distance',Math.round(marker.distance)+' m');}
  e['grenade-warning'].hidden=!world.grenades.some(g=>Math.hypot(g.pos.x-p.pos.x,g.pos.z-p.pos.z)<8&&world.collision.visible({x:p.pos.x,y:p.pos.y+1,z:p.pos.z},g.pos));
  this.fitTacticalColumn();
  const dirs=['N','NE','E','SE','S','SW','W','NW'],dir=dirs[(Math.round(p.yaw/(Math.PI/4))%8+8)%8];
  if(this.lastCompass!==dir){this.lastCompass=dir;e.compass.innerHTML=`· &nbsp; · &nbsp; <b>${dir}</b> &nbsp; · &nbsp; ·`;}
  if(this.debug&&now>=this.nextDebug){
   this.nextDebug=now+250;const nearest=world.npcs.filter(n=>n.hp>0).sort((a,b)=>(a.pos.x-p.pos.x)**2+(a.pos.z-p.pos.z)**2-(b.pos.x-p.pos.x)**2-(b.pos.z-p.pos.z)**2).slice(0,6),stats=view.renderStats,gpu=view.gpuTimer.milliseconds;
   this.text('debug',[
    t('debug.title')+' · v'+VERSION,t('debug.frame',{fps:number(metrics.fps),p95:number(metrics.p95,1)}),
    `CPU ${number(metrics.cpu,2)} ms | GPU ${gpu===null?'— ('+gpuStatus(view.gpuTimer.status)+')':number(gpu,2)+' ms'}`,
    t('debug.cpu',{simulation:number(metrics.simulation,2),render:number(metrics.render,2)}),t('debug.draw',{draws:stats.drawCalls,triangles:stats.triangles}),
    t('debug.meshes',{meshes:stats.activeMeshes,casters:stats.shadowCasters||0}),t('debug.animations',{lods:stats.lodCounts?.join('/')||'—',animations:stats.activeAnimatables}),
    t('debug.simulation',{time:number(world.time,1),phase:world.director.phase}),`UK ${world.npcs.filter(n=>n.faction==='uk'&&n.hp>0).length} / DE ${world.npcs.filter(n=>n.faction==='de'&&n.hp>0).length}`,
    t('debug.queue',{queue:world.nav.requests.length,uk:world.stats.britishShots,de:world.stats.germanShots}),
    ...world.tanks.map(tank=>t('debug.tank',{id:tank.id,state:stateName(tank.state),shells:tank.ammunition,mg:tank.mgAmmo})),
    t('debug.gun',{state:stateName(world.fieldGuns[0]?.operational?'operational':'disabled'),planes:world.air.planes.length}),
    t('debug.damage',{hits:world.stats.tankHits,breaches:world.destroyedObstacles.length}),'',
    ...nearest.map(n=>t('debug.npc',{id:n.id,state:stateName(n.state),hp:Math.ceil(n.hp),target:n.targetId||'—',index:n.pathIndex,length:n.path.length}))
   ].join('\n'));
  }
 }
