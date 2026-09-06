import {CAMPAIGN} from '../../data/cambrai.js';
import {MAP_POINTS,MAP_TOWNS,WHOLE_VIEW,campaignFrame,projectGeo} from '../../data/campaign-map.js';
import {t,message} from '../../i18n/index.js';
import {checkpointKey} from '../../i18n/legacy.js';
import {escape,html,tr,primary,quiet,button} from '../common.js';
import {CampaignTimeline} from '../campaign-timeline.js';
import {FrontTransition,FRONT_TRANSITION_SECONDS} from '../front-transition.js';
const path=points=>points.map(([x,y],i)=>`${i?'L':'M'}${x.toFixed(3)} ${y.toFixed(3)}`).join(' ');
const loc=p=>`${p.x} ${p.y}`;
const COUNTRIES=[['france',2.1,48.85],['belgium',4.62,50.91],['germany',7.5,50.42],['switzerland',7.24,47.12],['northSea',1.15,51.78]];
/** Details belong below the map and ordered chapter rail, never in a competing right column. */
export function campaignPanel(vm,app){
 const m=vm.mission;if(!m)return '';
 const playable=m.available,complete=vm.mode==='complete',busy=!!app.campaignDifficultyPending;
 const selectedDifficulty=app.pendingCampaignDifficultyId||vm.difficultyId;
 const notices=[app.checkpointState==='loading'?tr('campaign.reading'):'',app.checkpointState==='invalid'?tr('campaign.invalid'):'',app.sessionOnly?tr('campaign.session'):''].filter(Boolean);
 return `<div class="campaign-description"><div class="eyebrow">${tr('campaign.chapter',{number:m.number})} · ${html(m.date)}</div><h2>${html(m.title)}</h2><p class="chapter-context">${tr(`campaign.context.${m.id}`)}</p><p class="campaign-state">${tr(!playable?'campaign.unavailable':complete?'campaign.complete':vm.mode==='resume'?'action.campaignContinue':'campaign.newPreview')}</p>${vm.mode==='resume'?`<p class="checkpoint-summary">${tr('checkpoint.label',{name:message(checkpointKey(vm.checkpointLabel))})} · ${tr('mission.difficulty',{difficulty:message(`difficulty.${vm.difficultyId}`)})}</p>`:''}</div><div class="campaign-start-panel">${['new','resume'].includes(vm.mode)&&playable?`<label class="campaign-difficulty" for="campaign-difficulty">${tr('campaign.difficulty')}<select id="campaign-difficulty" data-setting="difficulty" ${busy||app.checkpointState==='loading'?'disabled':''} aria-busy="${busy}">${['recruit','soldier','veteran'].map(id=>`<option value="${id}" ${selectedDifficulty===id?'selected':''}>${tr(`difficulty.${id}`)}</option>`).join('')}</select></label>`:''}${busy?`<p role="status" class="compact-help">${tr('campaign.difficultySaving')}</p>`:''}${notices.length?`<p role="status" class="compact-error">${notices.join('<br>')}</p>`:''}<div class="campaign-actions">${vm.canStart?primary(vm.mode==='resume'?'action.campaignResume':'action.campaignStart',vm.mode==='resume'?'campaign-resume':'campaign-start',busy):complete?primary('action.campaignReplay','campaign-new'):!playable?`<span class="unavailable-label">${tr('campaign.unavailable')}</span>`:''}</div>${playable?`<span class="demo-scope">${tr('campaign.demoShort')}</span>`:''}</div>`;
}
function mapLayers(id){
 const frame=campaignFrame(id),p=MAP_POINTS;
 return `<g id="front-layer" data-front-mission="${id}" data-front-date="${frame.date}"><path id="front-shadow" d="${path(frame.front)}" class="front-shadow"/><path id="front-line" d="${path(frame.front)}" class="front-line"/><g id="campaign-attack">${CAMPAIGN.map(m=>`<g data-arrow-mission="${m.id}" opacity="${m.id===id?1:0}">${campaignFrame(m.id).arrows.map(points=>`<path d="${path(points)}" class="attack-arrow" marker-end="url(#attack-head)"/>`).join('')}</g>`).join('')}</g></g><path id="campaign-route" d="M${loc(p.ypres)} Q${p.ypres.x+45} ${p.ypres.y+35} ${loc(p.cambrai)}" pathLength="100" class="narrative-route" stroke-dasharray="100"/>`;
}
export function campaignMarkup(vm,app){
 const frame=campaignFrame(vm.missionId||'cambrai');
 return `<section class="screen campaign-screen"><div class="campaign-layout"><header class="campaign-heading"><h1>${tr('campaign.title')}</h1><span id="front-date">${tr('campaign.frontAsOf',{date:t(frame.dateKey)})}</span></header><div class="campaign-stage"><div class="map-toolbar">${button('campaign.front','map-front')}${button('campaign.selectedSector','map-current')}<button type="button" data-action="map-zoom-out" aria-label="${escape(t('campaign.zoomOut'))}">−</button><button type="button" data-action="map-zoom-in" aria-label="${escape(t('campaign.zoomIn'))}">+</button></div><svg class="campaign-map" id="campaign-map" viewBox="${WHOLE_VIEW.join(' ')}" role="img" aria-label="${escape(t('campaign.mapLabel'))}"><defs><marker id="attack-head" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse" markerUnits="strokeWidth"><path d="M0 1L9 5 0 9 2.5 5Z" fill="#e0c69c"/></marker><filter id="map-grain"><feTurbulence type="fractalNoise" baseFrequency=".25" numOctaves="2" seed="1917"/><feColorMatrix type="saturate" values="0"/></filter></defs><image href="./public/assets/ui/campaign-base.svg" x="0" y="0" width="1000" height="720"/><image href="./public/assets/ui/campaign-relief.webp" x="0" y="0" width="1000" height="720" class="campaign-relief"/><rect width="1000" height="720" class="map-grain" filter="url(#map-grain)"/><g id="military-layers">${mapLayers(frame.id)}</g><g class="geo-labels">${COUNTRIES.map(([key,lon,lat])=>{const p=projectGeo(lon,lat);return `<text x="${p.x}" y="${p.y}">${tr(`campaign.${key}`)}</text>`;}).join('')}</g><g class="towns">${MAP_TOWNS.map(p=>`<g><circle cx="${p.x}" cy="${p.y}" r="1"/><text x="${p.x+2}" y="${p.y-2}">${escape(p.name)}</text></g>`).join('')}</g>${CAMPAIGN.map(m=>{const p=MAP_POINTS[m.id];return `<g data-mission="${m.id}" class="map-point ${m.id===vm.missionId?'selected':''}"><circle cx="${p.x}" cy="${p.y}" r="2.5"/><circle class="point-ring" cx="${p.x}" cy="${p.y}" r="5"/><text x="${p.x+4}" y="${p.y-4}">${m.id==='cambrai'?'Cambrai':m.id==='ypres'?'Ypres':m.id==='flers'?'Flers-Courcelette':m.id==='amiens'?'Amiens':'Somme'}</text></g>`;}).join('')}</svg><div class="map-compass" aria-hidden="true">N<span>↑</span></div><div class="campaign-caption"><p id="campaign-caption">${tr('campaign.introCambrai')}</p>${quiet('action.skip','map-skip')}</div><div class="campaign-legend"><span class="front-key">${tr('campaign.frontLine')}</span><span class="route-key">${tr('campaign.attackDirection')}</span><small>${tr('campaign.geographicSchematic')}</small></div></div><nav class="chapter-nav" aria-label="${escape(t('campaign.title'))}">${CAMPAIGN.map(m=>`<button type="button" class="chapter-card chapter-${m.id}" data-action="campaign-select" data-mission-id="${m.id}" ${m.id===vm.missionId?'aria-current="step"':''}><span class="chapter-thumb" aria-hidden="true"></span><span class="chapter-copy"><span class="chapter-number">${m.number}</span><strong>${html(m.title)}</strong><span class="chapter-date">${html(m.date)}</span><span class="chapter-availability">${tr(m.available?'campaign.playableChapter':'campaign.unavailableShort')}</span></span></button>`).join('')}</nav><section class="campaign-detail" id="campaign-panel" aria-live="polite">${campaignPanel(vm,app)}</section><div class="campaign-bottom">${quiet('action.back','back')}${quiet('action.settings','settings')}</div></div></section>`;
}
/** One application UI tick owns the intro/transition. No setTimeout or extra RAF. */
export class CampaignScreen {
 constructor(intent='continue'){this.timeline=new CampaignTimeline(intent==='new');this.frameId='cambrai';this.front=new FrontTransition('cambrai');this.manualView=null;this.host=null;this.lastNow=null;this.mounted=false;this.reduced=false;this.viewTransition=null;}
 mount(host,vm,app,reducedMotion=false){
  this.host=host;this.app=app;this.vm=vm;this.frameId=vm.missionId||'cambrai';if(this.front.target!==this.frameId)this.front=new FrontTransition(this.frameId);host.innerHTML=campaignMarkup(vm,app);this.mounted=true;this.lastNow=null;this.paintedFinal=false;this.sizeKey=null;this.setReducedMotion(reducedMotion);this.paint();this.resizeObserver?.disconnect();if(typeof ResizeObserver!=='undefined'){this.resizeObserver=new ResizeObserver(()=>{this.paintedFinal=false;});this.resizeObserver.observe(host.querySelector('#campaign-map'));}
 }
 selectFrame(id){
  const frame=campaignFrame(id);const previous=this.displayedView||this.manualView||this.timeline.frame().view;
  this.front.select(id,this.reduced);this.frameId=id;this.timeline.skip();this.manualView=[...frame.view];this.viewTransition=this.reduced?null:{from:[...previous],to:[...frame.view],elapsed:0};this.paintedFinal=false;
 }
 update(vm,app){
  if(!this.mounted)return;const changed=vm.missionId!==this.frameId;this.vm=vm;this.app=app;
  if(changed)this.selectFrame(vm.missionId);
  const panel=this.host.querySelector('#campaign-panel');if(panel)panel.innerHTML=campaignPanel(vm,app);
  for(const e of this.host.querySelectorAll('[data-mission]'))e.classList.toggle('selected',e.dataset.mission===vm.missionId);
  for(const e of this.host.querySelectorAll('[data-mission-id]')){if(e.dataset.missionId===vm.missionId)e.setAttribute('aria-current','step');else e.removeAttribute('aria-current');}
  if(changed)this.paint();
 }
 tick(now,hidden=false){
  if(!this.mounted)return;if(hidden){this.lastNow=null;return;}
  const dt=this.lastNow===null?0:Math.max(0,now-this.lastNow)/1000;this.lastNow=now;this.timeline.advance(dt);this.front.advance(dt);
  if(this.viewTransition){this.viewTransition.elapsed+=dt;if(this.viewTransition.elapsed>=FRONT_TRANSITION_SECONDS)this.viewTransition=null;}
  if(!this.timeline.frame().done||!this.front.done||this.viewTransition||!this.paintedFinal){this.paint();this.paintedFinal=this.timeline.frame().done&&this.front.done&&!this.viewTransition;}
 }
 paint(){
  if(!this.host)return;const f=this.timeline.frame(),svg=this.host.querySelector('#campaign-map');let view=this.manualView||f.view;
  if(this.viewTransition){const a=this.viewTransition,v=Math.min(1,a.elapsed/FRONT_TRANSITION_SECONDS),u=v*v*(3-2*v);view=a.from.map((x,i)=>x+(a.to[i]-x)*u);}
  this.displayedView=[...view];
  const bounds=svg?.getBoundingClientRect(),ratio=bounds&&bounds.height>0?bounds.width/bounds.height:1.3889;
  let shown=view;
  if(view[2]<999){const height=view[2]/ratio;shown=[view[0],Math.max(0,Math.min(720-height,view[1]+view[3]/2-height/2)),view[2],height];}
  const scale=bounds?Math.min(bounds.width/shown[2],bounds.height/shown[3]):1;
  svg?.setAttribute('viewBox',shown.join(' '));svg?.style.setProperty('--geo-scale',String(1/Math.max(.1,scale)));
  const route=this.host.querySelector('#campaign-route');route?.setAttribute('stroke-dashoffset',String(100*(1-f.route)));route?.setAttribute('opacity',this.frameId==='cambrai'?'0.75':'0');
  this.host.querySelector('#campaign-attack')?.setAttribute('opacity',String(f.attack));
  const military=this.front.sample(),frontPath=path(military.front),selected=campaignFrame(this.frameId);
  this.host.querySelector('#front-line')?.setAttribute('d',frontPath);
  this.host.querySelector('#front-shadow')?.setAttribute('d',frontPath);
  for(const node of this.host.querySelectorAll('[data-arrow-mission]'))node.setAttribute('opacity',String(military.arrows[node.dataset.arrowMission]||0));
  const layer=this.host.querySelector('#front-layer');layer?.setAttribute('data-front-mission',this.frameId);layer?.setAttribute('data-front-date',military.done?selected.date:'transition');
  svg?.setAttribute('aria-busy',String(!military.done));
  const date=this.host.querySelector('#front-date');if(date)date.textContent=t(military.done?'campaign.frontAsOf':'campaign.frontTransition',{date:t(selected.dateKey)});
  const caption=this.host.querySelector('#campaign-caption');if(caption)caption.textContent=t(f.done?`campaign.mapSummary.${this.frameId}`:f.caption);
  const skip=this.host.querySelector('[data-action="map-skip"]');if(skip)skip.hidden=f.done;
 }
 action(action){
  const frame=campaignFrame(this.frameId);this.viewTransition=null;
  if(action==='map-skip'){this.front.finish();this.timeline.skip();this.manualView=[...frame.view];}
  else{this.timeline.skip();if(action==='map-front')this.manualView=[...WHOLE_VIEW];else if(action==='map-current')this.manualView=[...frame.view];else{const v=this.manualView||this.timeline.frame().view,factor=action==='map-zoom-in'?.8:1.25,width=Math.max(160,Math.min(1000,v[2]*factor)),height=width*.72;this.manualView=[Math.max(0,Math.min(1000-width,v[0]+v[2]/2-width/2)),Math.max(0,Math.min(720-height,v[1]+v[3]/2-height/2)),width,height];}}
  this.paint();this.paintedFinal=this.front.done;
 }
 setReducedMotion(value){this.reduced=value;this.timeline.setReducedMotion(value);if(value){this.front.finish();this.viewTransition=null;this.paint();}}
 unmount(){this.resizeObserver?.disconnect();this.resizeObserver=null;this.mounted=false;this.host=null;this.lastNow=null;}
}
