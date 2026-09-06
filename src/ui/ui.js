import {DIFFICULTIES} from '../data/weapons.js';
import {PHASE} from '../data/briefing.js';
import {damageFeedback} from './damage-feedback.js';
import {mapSVG} from './map.js';
import {CAMPAIGN} from '../data/cambrai.js';
import {DEFAULT_KEYS} from '../save/store.js';
import {VERSION} from '../version.js';
import {t,text,message,getLanguage,hasKey,number,updateDocumentLanguage,translate} from '../i18n/index.js';
import {checkpointKey} from '../i18n/legacy.js';

const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Catalogues contain plain text, never markup. Escape AFTER parameter interpolation.
const html=(value,params={})=>escape(text(value,params)).replaceAll('\n','<br>');
const tr=(key,params={})=>html(message(key,params));
export const keyLabel=code=>hasKey(`key.${code}`)?t(`key.${code}`):String(code??'').replace(/^Key|^Digit/,'');
const primary=(key,action)=>`<button type="button" class="button-primary" data-action="${action}">${tr(key)}<span class="arrow" aria-hidden="true">→</span></button>`;
const quiet=(key,action)=>`<button type="button" class="button-quiet" data-action="${action}">${tr(key)}</button>`;
const secondary=(key,action,disabled=false)=>`<button type="button" class="button-secondary" data-action="${action}" ${disabled?'disabled':''}>${tr(key)}</button>`;
const back=()=>`<button type="button" class="button-quiet back" data-action="back">← ${tr('action.back')}</button>`;
const topbar=(neutral=false)=>`<header class="topbar"><div class="brand" lang="pl"><span class="roundel" aria-hidden="true">Z</span>ZIEMIA NICZYJA</div>${neutral?'':`<div>${tr('shell.front')} &nbsp; / &nbsp; 1916—1918</div>`}</header>`;
const footer=()=>`<footer class="bottom-bar"><span>${tr('shell.version',{version:VERSION})}</span><span>${tr('shell.singleplayer')}</span></footer>`;
const checkpoint=value=>message(checkpointKey(value));
const stateName=value=>hasKey(`state.${value}`)?t(`state.${value}`):String(value??'—');
const gpuStatus=status=>hasKey(`gpu.${status}`)?t(`gpu.${status}`):t('gpu.waiting');
const docLink=path=>getLanguage()==='en'?path.replace(/\.md$/,'.en.md'):path;

export class UI {
 constructor(app){
  this.app=app;this.menu=document.querySelector('#menu');this.hud=document.querySelector('#hud');this.toastNode=document.querySelector('#toast');
  this.toastUntil=0;this.toastMessage='';this.messageUntil=0;this.message='';this.checkpointUntil=0;this.checkpointName=null;
  this.loadMessage=message('loading.initial');this.loadFraction=0;this.debug=false;this.nextHud=0;this.nextDebug=0;this.nextPerformance=0;
  this.menu.addEventListener('click',e=>{const button=e.target.closest('[data-action]');if(button&&!button.disabled)this.app.action(button.dataset.action,button);});
  this.menu.addEventListener('input',e=>{
   const key=e.target.dataset.setting;if(!key)return;
   const value=e.target.type==='checkbox'?e.target.checked:['range','number'].includes(e.target.type)?Number(e.target.value):e.target.value;
   this.app.changeSetting(key,value);
   const output=e.target.closest('.setting')?.querySelector('.value');
   if(output)output.textContent=key==='fov'?Math.round(value)+'°':Math.round(value*100)+'%';
  });
  this.hud.innerHTML=`<div class="damage-vignette" id="damage"></div><div class="damage-direction" id="damage-direction"><span></span></div><div class="critical-health" id="critical-health"></div><div class="hud-goal"><div class="hud-label" id="goal-label"></div><div class="hud-objective" id="objective"></div><div class="hud-hint" id="hint"></div><div class="hud-hold" id="hold"><div id="hold-fill"></div></div></div><div class="compass" id="compass">· &nbsp; · &nbsp; <b>N</b> &nbsp; · &nbsp; ·</div><div class="hud-chapter" id="chapter-label"></div><div class="crosshair" id="crosshair"></div><div class="health-panel"><div class="health-value"><span id="health-label"></span><span id="hp"></span></div><div class="health-bar"><div id="hp-fill"></div></div><div class="stamina-bar"><div id="stamina-fill"></div></div><div class="stance-label" id="stance"></div></div><div class="ammo-panel"><div class="ammo-number"><span id="mag"></span><span class="reserve">/ <span id="reserve"></span></span></div><div class="ammo-name" id="weapon-name"></div><div class="grenades" id="grenades"></div><div class="reload-status" id="reload"></div></div><div class="interaction" id="interaction" hidden></div><div class="subtitle-box" id="subtitle" hidden></div><div class="objective-marker" id="marker"><div class="marker-diamond"></div><div class="marker-distance" id="distance"></div></div><div class="grenade-warning" id="grenade-warning" hidden></div><div class="checkpoint-flash" id="checkpoint" hidden></div><div class="debug-panel" id="debug" hidden></div><div class="performance-overlay" id="performance" hidden></div><div class="hud-footer" id="hud-footer"></div>`;
  this.el=Object.fromEntries([...this.hud.querySelectorAll('[id]')].map(e=>[e.id,e]));this.localizeHUD();
 }
 localizeHUD(){
  this.text('critical-health',t('hud.critical'));this.text('goal-label',t('hud.goal'));this.text('health-label',t('hud.health'));
  this.text('chapter-label',`CAMBRAI\n${t('hud.date')}`);this.text('grenade-warning',t('hud.grenadeWarning'));
  this.text('hud-footer',t('hud.footer',{version:VERSION}));this.el.performance.setAttribute('aria-label',t('hud.performance'));
  this.text('checkpoint',t('checkpoint.flash',{name:checkpoint(this.checkpointName)}));
 }
 /** Repaint text only. No simulation ticks, scene construction, audio resume or save restore. */
 refreshLanguage(){
  updateDocumentLanguage();
  const focused=document.activeElement?.id,scroll=this.menu.querySelector('.panel')?.scrollTop??0;
  this.localizeHUD();this.render(this.app.state);
  const panel=this.menu.querySelector('.panel');if(panel)panel.scrollTop=scroll;
  if(focused)document.getElementById(focused)?.focus({preventScroll:true});
  if(this.toastUntil>performance.now())this.toastNode.textContent=text(this.toastMessage);
  if(this.app.world&&this.app.view)this.update(this.app.world,this.app.view,this.app.metrics);
 }
 render(state){
  this.nextHud=this.nextDebug=this.nextPerformance=0;
  const app=this.app,s=app.settings,selected=DIFFICULTIES[s.difficulty]||DIFFICULTIES.soldier;
  const profile=state==='brief'?selected:(app.world?.difficulty||selected),keys=Object.fromEntries(Object.entries(s.keys).map(([key,code])=>[key,keyLabel(code)]));
  this.menu.hidden=state==='playing';this.hud.hidden=state!=='playing';if(state==='playing')return;
  if(state==='language-select'){
   this.menu.innerHTML=`<section class="screen language-screen">${topbar(true)}<main class="language-panel" aria-labelledby="language-title"><h1 id="language-title"><span lang="pl">${escape(translate('pl','language.heading'))}</span><span lang="en">${escape(translate('en','language.heading'))}</span></h1><div class="language-tiles"><button type="button" class="language-tile" id="choose-en" data-action="choose-language" data-language="en" lang="en"><span class="flag-frame"><img src="./public/assets/ui/flag-en.svg" width="320" height="180" alt="" aria-hidden="true"></span><span class="language-name">English</span></button><button type="button" class="language-tile" id="choose-pl" data-action="choose-language" data-language="pl" lang="pl"><span class="flag-frame"><img src="./public/assets/ui/flag-pl.svg" width="320" height="180" alt="" aria-hidden="true"></span><span class="language-name">Polski</span></button></div><p class="language-note"><span lang="pl">${escape(translate('pl','language.note'))}</span><span lang="en">${escape(translate('en','language.note'))}</span></p></main><footer class="bottom-bar"><span>ZIEMIA NICZYJA · ${VERSION}</span><span>PL / EN</span></footer></section>`;
   this.menu.querySelector?.('#choose-en')?.focus({preventScroll:true});return;
  }
  let body='',cls='panel-screen',narrow=false;
  if(state==='main'){
   this.menu.innerHTML=`<section class="screen main-screen">${topbar()}<div class="map-clip"><div class="map-wrap">${mapSVG()}</div></div><div class="map-vignette"></div><main class="main-content"><div class="eyebrow">${tr('main.eyebrow')}</div><h1 class="main-title" lang="pl">ZIEMIA<span>NICZYJA</span></h1><p class="subtitle">${tr('main.subtitle')}</p><div class="rule"></div><nav class="menu-actions">${primary('action.start','brief')}${secondary('action.continue','continue',!app.checkpoint)}${secondary('action.missions','missions')}${secondary('action.settings','settings')}${secondary('action.controls','controls')}${secondary('action.credits','credits')}</nav><div class="footnote">${tr('main.footnote',{version:VERSION})}</div></main><aside class="dossier"><div class="eyebrow">${tr('main.orders')}</div><span class="num">04</span><h2>${tr('campaign.cambrai.title')}</h2><p>${tr('campaign.cambrai.place')}<br>${tr('campaign.cambrai.date')}<br>${tr('main.soldier')}</p><span class="stamp">${tr('main.stamp')}</span></aside>${footer()}</section>`;return;
  }
  if(state==='missions')body=`<div class="eyebrow">${tr('missions.eyebrow')}</div><h1>${tr('missions.title')}</h1><p class="lead">${tr('missions.lead')}</p><div class="missions">${CAMPAIGN.map(m=>`<button type="button" class="mission-card" data-action="brief" ${m.available?'':'disabled'}><span class="number">${m.number}</span><div><h3>${html(m.title)}</h3><p>${html(m.place)} · ${html(m.date)}</p></div><span class="badge">${tr(m.available?'missions.playable':'missions.planned')}</span></button>`).join('')}</div>${back()}`;
  if(state==='brief')body=`<div class="eyebrow">${tr('brief.eyebrow')}</div><h1>${tr('campaign.cambrai.title')}</h1><p class="lead">${tr('campaign.cambrai.date')} · ${tr('campaign.cambrai.place')}<br><strong>${tr('brief.player')}</strong></p><div class="brief-grid"><div><p>${tr('brief.intro')}</p><ol class="brief-list"><li>${tr('brief.step1',{interact:keys.interact})}</li><li>${tr('brief.step2')}</li><li>${tr('brief.step3')}</li></ol></div><aside class="brief-card"><h3>${tr('brief.equipment')}</h3><p>${tr('brief.loadout')}</p><p>${tr('brief.health',{difficulty:selected.name,delay:selected.regenDelay,rate:selected.regenRate})}</p><div class="big-number">04</div></aside></div><p class="notice">${tr('brief.fiction')} ${app.checkpoint?tr('brief.overwrite'):''}</p><div class="panel-actions">${primary('action.enterBriefing','start')}${back()}</div>`;
  if(state==='settings'){
   const range=(key,min,max,step)=>`<div class="setting"><label for="set-${key}">${tr(`settings.${key}`)}</label><div class="range-box"><input id="set-${key}" data-setting="${key}" type="range" min="${min}" max="${max}" step="${step}" value="${s[key]}"><span class="value">${key==='fov'?Math.round(s[key])+'°':Math.round(s[key]*100)+'%'}</span></div></div>`;
   const checkbox=key=>`<div class="setting"><label for="set-${key}">${tr(`settings.${key}`)}</label><input type="checkbox" id="set-${key}" data-setting="${key}" ${s[key]?'checked':''}></div>`;
   body=`<div class="eyebrow">${tr('settings.eyebrow')}</div><h1>${tr('action.settings')}</h1><p class="lead">${tr('settings.lead')} ${app.world?tr('settings.loaded',{difficulty:profile.name}):''}</p><div class="settings-grid"><div class="setting language-setting"><label for="language">${tr('language.option')}</label><select id="language" data-setting="language"><option value="en" lang="en" ${getLanguage()==='en'?'selected':''}>English</option><option value="pl" lang="pl" ${getLanguage()==='pl'?'selected':''}>Polski</option></select></div><div class="setting"><label for="quality">${tr('settings.quality')}</label><select id="quality" data-setting="quality">${['low','medium','high','ultra'].map(v=>`<option value="${v}" ${s.quality===v?'selected':''}>${tr(`quality.${v}`)}</option>`).join('')}</select></div><div class="setting"><label for="difficulty">${tr('settings.difficulty')}</label><select id="difficulty" data-setting="difficulty">${['recruit','soldier','veteran'].map(v=>`<option value="${v}" ${s.difficulty===v?'selected':''}>${tr(`difficulty.${v}`)}</option>`).join('')}</select></div><div class="setting"><label for="set-maxFps">${tr('settings.fps')}</label><input id="set-maxFps" type="number" min="0" max="360" step="1" list="fps-values" data-setting="maxFps" value="${s.maxFps}"><datalist id="fps-values">${[0,30,60,90,120,144,165,240].map(v=>`<option value="${v}"></option>`).join('')}</datalist></div>${range('renderScale',.5,1.25,.05)}${range('fov',60,105,1)}${range('sensitivity',.2,3,.05)}${range('motion',0,1,.05)}${range('damageEffects',0,1,.05)}${range('master',0,1,.05)}${range('effects',0,1,.05)}${range('ambient',0,1,.05)}${checkbox('subtitles')}${['showFps','showCpu','showGpu'].map(checkbox).join('')}</div><p class="controls-note">${tr('settings.syncNote')}<br>${tr('settings.metricsNote')}</p><p class="notice">${tr('settings.notice')} ${app.storageWarning?html(app.storageWarning):''}</p><div class="panel-actions">${primary('action.applyBack','back')}${quiet('action.defaults','settings-reset')}</div>`;
  }
  if(state==='controls')body=`<div class="eyebrow">${tr('controls.eyebrow')}</div><h1>${tr('action.controls')}</h1><p class="lead">${tr('controls.lead')}</p><div class="settings-grid">${Object.keys(DEFAULT_KEYS).map(key=>`<div class="setting"><label for="bind-${key}">${tr(`control.${key}`)}</label><button type="button" id="bind-${key}" class="setting-button" data-action="bind" data-key="${key}">${html(keys[key])}</button></div>`).join('')}</div><p class="controls-note">${tr('controls.mouse')}<br>${tr('controls.fixed')}<br>${tr('controls.lock')}</p><div class="panel-actions">${back()}${quiet('action.resetKeys','keys-reset')}</div>`;
  if(state==='credits')body=`<div class="eyebrow">${tr('credits.eyebrow')}</div><h1>${tr('credits.title',{version:VERSION})}</h1><p class="lead">${tr('credits.lead',{version:VERSION})}</p><div class="brief-grid"><div><h3 class="eyebrow">${tr('credits.code')}</h3><p>${tr('credits.runtime')}</p><p>${tr('credits.assets')}</p></div><div><h3 class="eyebrow">${tr('credits.history')}</h3><p>${tr('credits.characters')}</p><p>${tr('credits.simplifications')}</p></div></div><p><a class="small-link" href="${docLink('./ASSET_LICENSES.md')}" target="_blank" rel="noopener">${tr('credits.licenses')}</a> &nbsp; · &nbsp; <a class="small-link" href="${docLink('./docs/HISTORY.md')}" target="_blank" rel="noopener">${tr('credits.historyLink')}</a> &nbsp; · &nbsp; <a class="small-link" href="${docLink('./docs/KNOWN_ISSUES.md')}" target="_blank" rel="noopener">${tr('credits.issues')}</a></p>${back()}`;
  if(state==='loading'){
   this.menu.innerHTML=`<section class="screen panel-screen">${topbar()}<div class="loading-block"><div class="eyebrow">${tr('campaign.cambrai.date')}</div><h1>${tr('campaign.cambrai.title')}</h1><div class="loading-title" id="load-text" role="status">${tr('loading.initial')}</div><div class="loading-track"><div id="load-progress"></div></div><p class="loading-tip">${tr('loading.tip')}</p>${quiet('action.cancelMenu','exit')}</div>${footer()}</section>`;
   if(typeof document!=='undefined')this.progress(this.loadMessage||message('loading.initial'),this.loadFraction||0);return;
  }
  if(['ready','paused','dead','complete'].includes(state)){
   cls='overlay-shade';narrow=state!=='complete';const w=app.world;
   if(state==='ready')body=`<div class="eyebrow">${tr('ready.eyebrow')}</div><h1>${tr('ready.title')}</h1><p class="lead">${tr('ready.lead')}</p><p>${tr('mission.difficulty',{difficulty:profile.name})}</p><p>${tr('ready.movement',keys)}<br>${tr('ready.keys',keys)}</p>${app.lockMessage?`<p class="notice">${html(app.lockMessage)}</p>`:''}<div class="panel-actions">${primary('action.enter','enter')}${quiet('action.exit','exit')}</div>`;
   if(state==='paused')body=`<div class="eyebrow">${tr('paused.eyebrow')}</div><h1>${tr('paused.title')}</h1><p class="lead">${html(w?.director.objective.title)}</p><p>${tr('mission.difficulty',{difficulty:profile.name})}</p><nav class="menu-actions">${primary('action.resume','enter')}${secondary('action.loadCheckpoint','checkpoint')}${secondary('action.settings','settings')}${secondary('action.controls','controls')}${secondary('action.exitMain','exit')}</nav><p class="saved-notice">${tr('checkpoint.label',{name:checkpoint(app.checkpoint?.director.lastCheckpoint)})}</p>`;
   if(state==='dead')body=`<div class="eyebrow">${tr('dead.eyebrow')}</div><h1>${tr('dead.title')}</h1><p class="lead">${tr('dead.advice',{difficulty:profile.name,delay:profile.regenDelay,rate:profile.regenRate})}</p><p>${tr('checkpoint.last',{name:checkpoint(app.checkpoint?.director.lastCheckpoint)})}</p><div class="panel-actions">${primary('action.respawn','checkpoint')}${quiet('action.main','exit')}</div>`;
   if(state==='complete'){
    const accuracy=w?.stats.playerShots?Math.round(w.stats.hits/w.stats.playerShots*100):0;
    const stats=[[`${Math.floor(w.time/60)}:${String(Math.floor(w.time%60)).padStart(2,'0')}`,'complete.time'],[w.stats.kills,'complete.kills'],[`${accuracy}%`,'complete.accuracy']];
    body=`<div class="eyebrow">${tr('complete.eyebrow')}</div><h1>${tr('complete.title')}</h1><p class="lead">${tr('complete.lead')}</p><div class="stats">${stats.map(([value,key])=>`<div><div class="stat-number">${html(value)}</div><div class="stat-label">${tr(key)}</div></div>`).join('')}</div><p>${tr('complete.history')}</p><p class="notice">${tr('complete.notice',{version:VERSION})}</p><div class="panel-actions">${primary('action.map','exit')}${quiet('action.replay','checkpoint')}</div>`;
   }
  }
  if(state==='error'){narrow=true;body=`<div class="eyebrow">${tr('error.eyebrow')}</div><h1>${tr('error.title')}</h1><p class="lead">${tr('error.lead')}</p><p class="error-detail">${html(app.errorMessage)}</p><div class="panel-actions">${primary('action.retry','retry')}${quiet('action.exit','exit')}</div>`;}
  this.menu.innerHTML=`<section class="screen ${cls}">${topbar()}<main class="panel ${narrow?'narrow':''}">${body}</main>${footer()}</section>`;
 }
 progress(value,fraction){
  this.loadMessage=value;this.loadFraction=fraction;
  const el=document.querySelector('#load-text'),bar=document.querySelector('#load-progress');
  if(el)el.textContent=text(value);if(bar)bar.style.width=Math.round(fraction*100)+'%';
 }
 toast(value,duration=6){this.toastMessage=value;this.toastNode.textContent=text(value);this.toastUntil=performance.now()+duration*1000;this.toastNode.classList.add('visible');}
 event(e){
  if(e.type==='message'||e.type==='air-warning'){this.message=e.text;this.messageUntil=e.time+8;}
  if(e.type==='toast'||e.type==='pickup')this.toast(e.text,3);
  if(e.type==='checkpoint'){this.checkpointUntil=e.time+5;this.checkpointName=e.name;this.text('checkpoint',t('checkpoint.flash',{name:checkpoint(e.name)}));}
 }
 tickUI(){if(this.toastUntil&&performance.now()>this.toastUntil){this.toastNode.classList.remove('visible');this.toastUntil=0;}}
 text(id,value){const node=this.el[id],result=String(value);if(node.textContent!==result)node.textContent=result;}
 updatePerformance(view,metrics,now){
  const e=this.el.performance,s=this.app.settings;e.hidden=!(s.showFps||s.showCpu||s.showGpu);
  if(e.hidden||now<this.nextPerformance)return;this.nextPerformance=now+250;const lines=[];
  if(s.showFps)lines.push(t('performance.fps',{fps:number(metrics.fps),frame:number(metrics.frame,1)}));
  if(s.showCpu)lines.push(t('performance.cpu',{cpu:number(metrics.cpu,2),simulation:number(metrics.simulation,2),render:number(metrics.render,2)}));
  if(s.showGpu){const timer=view.gpuTimer;lines.push(timer.milliseconds===null?`GPU — (${gpuStatus(timer.status)})`:`GPU ${number(timer.milliseconds,2)} ms`);}
  this.text('performance',lines.join('\n'));
 }
 update(world,view,metrics){
  const p=world.player,o=world.director.objective,e=this.el,now=performance.now(),s=this.app.settings;
  this.text('mag',String(p.weapon.mag).padStart(2,'0'));this.text('reserve',p.weapon.reserve);
  const crosshair='crosshair'+(p.ads?' ads':'')+(p.hitMarker>0?' hit':'');if(e.crosshair.className!==crosshair)e.crosshair.className=crosshair;
  const feedback=damageFeedback(p,world.time,s.damageEffects);
  e.damage.style.opacity=feedback.vignette;e['damage-direction'].style.opacity=feedback.directionOpacity;e['damage-direction'].style.transform=`translate(-50%,-50%) rotate(${feedback.rotation}deg)`;
  e['critical-health'].hidden=p.hp>=30||s.damageEffects===0;e['critical-health'].style.opacity=.5+feedback.pulse*.5;view.canvas.style.filter=feedback.saturation<.999?`saturate(${feedback.saturation})`:'none';
  this.updatePerformance(view,metrics,now);e.debug.hidden=!this.debug;if(now<this.nextHud)return;this.nextHud=now+50;
  this.text('objective',text(o.title));this.text('hint',text(o.hint,{interact:keyLabel(s.keys.interact)}));
  this.text('goal-label',t('hud.goalProgress',{current:Math.min(world.director.phase+1,7)}));
  this.text('hp',Math.ceil(p.hp));e['hp-fill'].style.width=p.hp+'%';e['hp-fill'].style.background=p.hp<30?'#c98468':'#e0d9b5';e['stamina-fill'].style.width=p.stamina/6*100+'%';
  this.text('stance',t(`hud.${p.stance}`));this.text('weapon-name',p.weapon.definition.name);
  this.text('grenades',t('hud.grenades',{count:p.grenades,key:keyLabel(s.keys.grenade)}));
  this.text('reload',p.weapon.reloadLeft>0?t('hud.reload'):p.weapon.mag===0?t('hud.empty'):p.weapon.cooldown>.28&&['smle','gewehr'].includes(p.weapon.id)?t('hud.bolt'):'');
  e.hold.hidden=world.director.phase!==PHASE.HOLD;if(world.director.contested)this.text('hint',t('hud.contested'));e['hold-fill'].style.width=world.director.hold/55*100+'%';
  const context=world.interaction();e.interaction.hidden=!context;
  if(context){const value=`<span class="keycap">${html(keyLabel(s.keys.interact))}</span>${html(context.label)}`;if(e.interaction.innerHTML!==value)e.interaction.innerHTML=value;}
  const caption=world.director.caption(world),subtitle=caption?`${text(caption.speaker)}\n${text(caption.text)}`:text(this.message);
  e.subtitle.hidden=!s.subtitles||(!caption&&(world.time>this.messageUntil||!subtitle));this.text('subtitle',subtitle);
  e.checkpoint.hidden=world.time>this.checkpointUntil;
  const marker=view.marker();e.marker.hidden=!marker.visible||marker.x<4||marker.x>96||marker.y<17||marker.y>85||marker.distance<6||(world.director.phase===PHASE.HOLD||world.director.phase===PHASE.BRIEFING);
  if(!e.marker.hidden){e.marker.style.left=marker.x+'%';e.marker.style.top=marker.y+'%';this.text('distance',Math.round(marker.distance)+' m');}
  e['grenade-warning'].hidden=!world.grenades.some(g=>Math.hypot(g.pos.x-p.pos.x,g.pos.z-p.pos.z)<8&&world.collision.visible({x:p.pos.x,y:p.pos.y+1,z:p.pos.z},g.pos));
  const dirs=['N','NE','E','SE','S','SW','W','NW'],dir=dirs[(Math.round(p.yaw/(Math.PI/4))%8+8)%8];
  if(this.lastCompass!==dir){this.lastCompass=dir;e.compass.innerHTML=`· &nbsp; · &nbsp; <b>${dir}</b> &nbsp; · &nbsp; ·`;}
  if(this.debug&&now>=this.nextDebug){
   this.nextDebug=now+250;const nearest=world.npcs.filter(n=>n.hp>0).sort((a,b)=>(a.pos.x-p.pos.x)**2+(a.pos.z-p.pos.z)**2-(b.pos.x-p.pos.x)**2-(b.pos.z-p.pos.z)**2).slice(0,6),stats=view.renderStats,gpu=view.gpuTimer.milliseconds;
   this.text('debug',[
    t('debug.title'),t('debug.frame',{fps:number(metrics.fps),p95:number(metrics.p95,1)}),
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
}
