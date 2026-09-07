import {HudLayout} from './hud/layout.js';
import {HitFeedback} from './hud/hit-feedback.js';
import {CriticalHealth} from './damage-feedback.js';
import {GrenadeWarnings} from './hud/grenade-warning.js';
import {refreshHudOptions} from './screens/settings.js';
import {t,text,message,updateDocumentLanguage} from '../i18n/index.js';
import {checkpointKey} from '../i18n/legacy.js';
import {OPTIONS_TABS} from '../save/settings-schema.js';
import {html,tr,primary,quiet} from './common.js';
import {languageScreen} from './screens/language.js';
import {mainScreen} from './screens/main.js';
import {settingsScreen,settingValue,stepChoice,switchValue} from './screens/settings.js';
import {creditsScreen} from './screens/credits.js';
import {statusScreen} from './screens/status.js';
import {CampaignScreen} from './screens/campaign.js';
import {buildCampaignViewModel} from './campaign-model.js';
import {hudMarkup,updateHUD,updatePerformance} from './hud/hud.js';
import {TacticalContacts,normalizeShot} from './hud/tactical-contacts.js';
import {Minimap} from './hud/minimap.js';
import {FriendlyMarkers} from './hud/friendly-markers.js';
export {keyLabel} from './common.js';
/** Facade: screen ownership and events, not simulation or world-time integration. */
export class UI {
 constructor(app){
  this.app=app;this.menu=document.querySelector('#menu');this.hud=document.querySelector('#hud');this.toastNode=document.querySelector('#toast');
  this.optionsTab='gameplay';this.modal=null;this.screen=null;this.toastUntil=0;this.toastMessage='';this.messageUntil=0;this.message='';this.checkpointUntil=0;this.checkpointName=null;
  this.loadMessage=message('loading.initial');this.loadFraction=0;this.debug=false;this.nextHud=this.nextDebug=this.nextPerformance=0;
  this.world=null;this.sessionId=0;this.contacts=new TacticalContacts({sessionId:0});this.abort=new AbortController();const options={signal:this.abort.signal};
  this.menu.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(b&&!b.disabled&&!e.defaultPrevented){if(this.modal&&!b.closest('[role="dialog"]'))return;if(b.dataset.action==='setting-step'){const key=b.dataset.settingKey,value=stepChoice(key,this.app.settings[key],Number(b.dataset.direction));if(value!==undefined){this.app.changeSetting(key,value);const select=this.menu.querySelector(`[data-setting="${key}"]`);if(select)select.value=this.app.settings[key];}return;}this.app.action(b.dataset.action,b);}},options);
  this.menu.addEventListener('input',e=>{const key=e.target.dataset.setting;if(!key||this.modal)return;const value=e.target.type==='checkbox'?e.target.checked:['range','number'].includes(e.target.type)?Number(e.target.value):e.target.value;this.app.changeSetting(key,value);const output=e.target.closest('.setting')?.querySelector('.value');if(output)output.textContent=settingValue(key,this.app.settings[key]);const label=e.target.closest('.switch-control')?.querySelector('.switch-value');if(label)label.textContent=switchValue(this.app.settings[key]);},options);
  this.menu.addEventListener('keydown',e=>this.keydown(e),options);
  this.menu.addEventListener('error',e=>{if(e.target.matches?.('.main-logo img'))e.target.closest('.main-logo').classList.add('asset-failed');}, {...options,capture:true});
  this.motionQuery=window.matchMedia?.('(prefers-reduced-motion: reduce)');this.motionChanged=()=>{this.applyMotion();this.campaign?.setReducedMotion(this.reducedMotion());};this.motionQuery?.addEventListener?.('change',this.motionChanged,options);
  this.hud.innerHTML=hudMarkup();this.el=Object.fromEntries([...this.hud.querySelectorAll('[id]')].map(e=>[e.id,e]));
  this.minimap=new Minimap(this.el.minimap);this.markers=new FriendlyMarkers(this.el['friendly-layer']);this.hitFeedback=new HitFeedback();this.criticalHealth=new CriticalHealth();this.grenadeWarnings=new GrenadeWarnings(this.el['grenade-layer']);this.layout=new HudLayout(this.hud,()=>this.app.settings);this.toastHome=this.toastNode.parentNode;this.localizeHUD();
 }
 reducedMotion(){return this.app.settings.uiAnimations===false||!!this.motionQuery?.matches;}
 applyMotion(){this.menu.classList?.toggle('reduced-motion',this.reducedMotion());}
 ensureWorld(world){if(this.world===world)return;this.world=world;this.contacts.reset(++this.sessionId);this.hitFeedback?.reset(this.sessionId);this.criticalHealth?.reset();this.grenadeWarnings?.reset();this.layout?.invalidate('world');this.markers?.reset();this.minimap?.reset?.();this.nextHud=this.nextDebug=this.nextPerformance=0;}
 releaseWorld(){this.hitFeedback?.clear();this.criticalHealth?.reset();this.grenadeWarnings?.reset();this.layout?.invalidate('release');this.world=null;this.contacts?.reset(++this.sessionId);this.markers?.dispose();this.minimap?.reset();this.message='';this.messageUntil=this.checkpointUntil=0;this.toastUntil=0;this.toastNode?.classList.remove('visible','checkpoint-active');}
 reservedHudRects(){return this.layout?.snapshot().reserved||[];}
 refreshHudOptions(){refreshHudOptions(this.menu,this.app.settings,this.layout?.snapshot());this.layout?.invalidate('settings');}
 campaignModel(){return buildCampaignViewModel({checkpointState:this.app.checkpointState,checkpoint:this.app.checkpoint,progress:this.app.campaignProgress,intent:this.app.campaignIntent||'continue',selectedMissionId:this.app.campaignSelection||'cambrai',newDifficultyId:this.app.settings.difficulty});}
 openCampaign(intent){this.campaign?.unmount();this.campaign=new CampaignScreen(intent);}
 refreshCampaign(){if(this.app.state==='campaign')this.campaign?.update(this.campaignModel(),this.app);}
 localizeHUD(){this.text('critical-health',t('hud.critical'));this.text('goal-label',t('hud.goal'));this.text('health-label',t('hud.health'));this.text('chapter-label',`Cambrai\n${t('hud.date')}`);this.text('grenade-warning',t('hud.grenadeWarning'));this.el.performance.setAttribute('aria-label',t('hud.performance'));this.el.minimap.setAttribute('aria-label',t('hud.minimapLabel'));this.text('checkpoint',t('checkpoint.flash',{name:message(checkpointKey(this.checkpointName))}));}
 refreshLanguage(){
  updateDocumentLanguage();const focused=document.activeElement?.id,scroller=this.menu.querySelector('#options-content, .panel'),scroll=scroller?.scrollTop||0;this.localizeHUD();this.render(this.app.state);
  const next=this.menu.querySelector('#options-content, .panel');if(next)next.scrollTop=scroll;if(focused)document.getElementById(focused)?.focus({preventScroll:true});
  if(this.toastUntil>performance.now())this.toastNode.textContent=text(this.toastMessage);if(this.app.world&&this.app.view)this.update(this.app.world,this.app.view,this.app.metrics);
 }
 render(state){
  this.nextHud=this.nextDebug=this.nextPerformance=0;this.campaign?.unmount();this.screen=state;
  this.menu.hidden=state==='playing';this.hud.hidden=state!=='playing';this.toastNode?.classList.toggle('in-game',state==='playing');this.layout?.invalidate('screen');
  if(state==='playing'){this.el?.['game-toast-host']?.appendChild(this.toastNode);return;}
  this.hitFeedback?.clear();if(this.toastHome&&this.toastNode?.parentNode!==this.toastHome)this.toastHome.appendChild(this.toastNode);
  if(state==='language-select')this.menu.innerHTML=languageScreen();
  else if(state==='main')this.menu.innerHTML=mainScreen(this.app);
  else if(state==='settings')this.menu.innerHTML=settingsScreen(this.app,this.optionsTab||'gameplay');
  else if(state==='credits')this.menu.innerHTML=creditsScreen(this.app);
  else if(state==='campaign'){
   this.campaign??=new CampaignScreen(this.app.campaignIntent||'continue');this.campaign.mount(this.menu,this.campaignModel(),this.app,this.reducedMotion());
  }else this.menu.innerHTML=statusScreen(state,this.app);
  if(state==='settings')this.refreshHudOptions();
  this.applyMotion?.();if(state==='language-select')this.menu.querySelector?.('#choose-en')?.focus({preventScroll:true});
  if(state==='loading'&&typeof document!=='undefined')this.progress(this.loadMessage,this.loadFraction);
  if(this.modal)this.paintModal();
 }
 showModal(modal){this.modal=modal;this.modalFocus=document.activeElement?.id;this.paintModal();}
 paintModal(){
  this.menu.querySelector('.modal-backdrop')?.remove();const reset=this.modal.kind==='reset',title=reset?'options.resetTitle':'campaign.overwriteTitle',body=reset?'options.resetBody':'campaign.overwriteBody';
  const layer=document.createElement('div');layer.className='modal-backdrop';layer.innerHTML=`<section role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-body" class="confirmation"><h2 id="modal-title">${tr(title)}</h2><p id="modal-body">${tr(body)}</p><div class="panel-actions">${quiet('action.cancel','cancel-modal')}${primary('action.confirm','confirm-modal')}</div></section>`;
  for(const child of this.menu.children)child.inert=true;this.menu.appendChild(layer);layer.querySelector('[data-action="cancel-modal"]').focus({preventScroll:true});
 }
 closeModal(){this.modal=null;this.menu.querySelector('.modal-backdrop')?.remove();for(const child of this.menu.children)child.inert=false;if(this.modalFocus)document.getElementById(this.modalFocus)?.focus({preventScroll:true});}
 keydown(e){
  if(e.defaultPrevented)return;
  if(this.modal&&e.key==='Tab'){const nodes=[...this.menu.querySelectorAll('[role="dialog"] button')];if(!nodes.length)return;const at=nodes.indexOf(document.activeElement);e.preventDefault();nodes[(at+(e.shiftKey?-1:1)+nodes.length)%nodes.length].focus();return;}
  if(this.app.state!=='settings'||this.modal||e.target.getAttribute('role')!=='tab')return;
  const tab=this.optionsTab||'gameplay',at=OPTIONS_TABS.indexOf(tab);let next;
  if(e.key==='ArrowRight')next=(at+1)%4;else if(e.key==='ArrowLeft')next=(at+3)%4;else if(e.key==='Home')next=0;else if(e.key==='End')next=3;else return;
  e.preventDefault();this.app.action('options-tab',{dataset:{tab:OPTIONS_TABS[next]}});this.menu.querySelector(`#tab-${OPTIONS_TABS[next]}`)?.focus({preventScroll:true});
 }
 progress(value,fraction){this.loadMessage=value;this.loadFraction=fraction;const el=this.menu.querySelector?.('#load-text'),bar=this.menu.querySelector?.('#load-progress');if(el)el.textContent=text(value);if(bar){bar.style.width=Math.round(fraction*100)+'%';bar.parentElement?.setAttribute('aria-valuenow',String(Math.round(fraction*100)));}}
 toast(value,duration=6){this.toastMessage=value;this.toastNode.textContent=text(value);this.toastUntil=performance.now()+duration*1000;this.toastNode.classList.add('visible');this.layout?.invalidate('toast');}
 event(e){
  const world=this.app.world;if(world){this.ensureWorld(world);const shot=normalizeShot(e);if(shot)this.contacts.recordShot(shot,{sessionId:this.sessionId,playerFaction:world.player.faction,playerPos:world.player.pos,difficultyId:world.difficultyId});}
  if(e.type==='combat-feedback')this.hitFeedback?.accept(e,this.sessionId);
  if(e.type==='message'||e.type==='air-warning'){this.message=e.text;this.messageUntil=e.time+8;}
  if(e.type==='toast'||e.type==='pickup')this.toast(e.text,3);
  if(e.type==='checkpoint'){this.checkpointUntil=e.time+5;this.checkpointName=e.name;this.text('checkpoint',t('checkpoint.flash',{name:message(checkpointKey(e.name))}));}
 }
 tickUI(){const now=performance.now();if(this.toastUntil&&now>this.toastUntil){this.toastNode.classList.remove('visible');this.toastUntil=0;}if(this.app.state==='campaign')this.campaign?.tick(now,document.hidden);}
 text(id,value){const node=this.el[id],result=String(value);if(node&&node.textContent!==result){node.textContent=result;if(['objective','hint','subtitle','critical-health','checkpoint','goal-label','chapter-label'].includes(id))this.layout?.invalidate('text');}}
 updatePerformance(view,metrics,now){return updatePerformance.call(this,view,metrics,now);}
 update(world,view,metrics){return updateHUD.call(this,world,view,metrics);}
 dispose(){this.abort.abort();this.motionQuery?.removeEventListener?.('change',this.motionChanged);this.campaign?.unmount();this.releaseWorld();this.minimap?.dispose();this.layout?.dispose();this.grenadeWarnings?.dispose();}
}
