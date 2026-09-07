import {HUD_SETTING_KEYS,resetHud} from './ui/hud/settings.js';
import {MenuNavigation} from './ui/navigation.js';
import {OPTIONS_TABS,SETTINGS_SCHEMA,VALID_KEY,normalizeSetting,resetCategory} from './save/settings-schema.js';
import {createProgress,progressForCheckpoint,completeProgress} from './save/campaign.js';
import {campaignWithDifficulty} from './save/campaign-difficulty.js';
import {VERSION,UI_REVISION} from './version.js';
import {message,t,setLanguage,isLanguage,updateDocumentLanguage,LocalizedError} from './i18n/index.js';
import {validateSnapshot} from './save/schema.js';
import {FrameLimiter} from './performance/frame-limiter.js';
import {PerformanceMonitor} from './performance/monitor.js';
import {Store,DEFAULT_SETTINGS,DEFAULT_KEYS} from './save/store.js';
import {FixedClock} from './core/clock.js';
import {Input,requestGamePointerLock} from './input/input.js';
import {BattlefieldAudio} from './audio/audio.js';
import {UI,keyLabel} from './ui/ui.js';
export class Application {
 constructor(){this.canvas=document.querySelector('#game');this.navigation=new MenuNavigation();this.campaignIntent='continue';this.campaignSelection='cambrai';this.campaignProgress=null;this.campaignDifficultyPending=false;this.campaignDifficultySequence=0;this.pendingCampaignDifficultyId=null;this.checkpointState='loading';this.sessionOnly=false;this.completionPending=false;this.graphicsDirty=false;this.state='main';this.returnState='main';this.world=null;this.view=null;this.loadGeneration=0;this.enterSequence=0;this.enterPending=false;this.actionSequence=0;this.checkpoint=null;this.storageWarning='';this.errorMessage='';this.lockMessage='';this.store=new Store(message=>{this.storageWarning=message;if(this.settings?.language&&this.state!=='language-select')this.ui?.toast(message,9);});this.settings=this.store.settings();setLanguage(this.settings.language||'pl');this.state=this.settings.language?'main':'language-select';if(this.settings.language)updateDocumentLanguage();else document.documentElement.lang='en';this.checkpointLoadStarted=false;this.audio=new BattlefieldAudio(this.settings);this.clock=new FixedClock();this.ui=new UI(this);this.input=new Input(this.canvas,this.settings,{pause:()=>this.pause(),debug:()=>{this.ui.debug=!this.ui.debug;this.resetDiagnostics('F3');},diagnostics:key=>this.diagnosticKey(key),lockError:()=>this.lockError(),escape:()=>this.escapeMenu()});this.lastFrame=performance.now();this.performance=new PerformanceMonitor();this.metrics=this.performance.metrics;this.frame=0;this.alive=true;this.frameLimiter=new FrameLimiter();this.lastRender=this.lastFrame;this.pendingCpu=0;this.pendingSimulation=0;this.pendingAudio=0;this.pendingEvents=0;this.pendingNav=0;this.pendingSteps=0;this.pendingDropped=0;this.frameFlags=0;this.sampleReady=false;
  window.addEventListener('resize',()=>this.view?.resize());window.addEventListener('beforeunload',()=>{this.alive=false;this.disposeMission();this.audio.dispose();this.input.dispose();this.ui.dispose();});
  this.canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();this.disposeMission();this.errorMessage=message('error.context');this.go('error');});
  this.ui.render(this.state);if(this.storageWarning&&this.settings.language)this.ui.toast(this.storageWarning,9);
  // Do not load the checkpoint or expose a main-menu frame before the first choice.
  if(this.settings.language)this.loadCheckpoint();
  this.raf=requestAnimationFrame(now=>this.loop(now));
  // Read-only diagnostics are deliberately available for performance and lifecycle checks.
  const application=this;window.ZiemiaNiczyja={get state(){return application.state;},inspect:()=>this.inspect(),version:VERSION,uiRevision:UI_REVISION,diagnostics:Object.freeze({reset:()=>this.resetDiagnostics('operator'),start:metadata=>{this.performance.startCapture({...this.captureMetadata(),...metadata});this.resetDiagnostics('capture');},stop:()=>this.performance.stopCapture(),export:()=>this.performance.exportCapture(this.captureMetadata()),setTargetHz:hz=>this.performance.setBudget(hz,this.settings.maxFps)})};
 }
 loadCheckpoint(){
  if(this.checkpointLoadStarted||!isLanguage(this.settings.language))return;
  this.checkpointLoadStarted=true;this.checkpointState='loading';const generation=this.loadGeneration;
  this.store.loadCampaign().then(pair=>{
   if(generation!==this.loadGeneration||!this.alive)return;
   this.checkpoint=pair.checkpoint;this.campaignProgress=pair.progress;this.checkpointState=pair.checkpointState;this.sessionOnly=!!pair.sessionOnly;
   if(this.state==='main')this.ui.render('main');else this.ui.refreshCampaign?.();
  }).catch(error=>{
   if(generation!==this.loadGeneration||!this.alive)return;
   this.checkpointState='invalid';this.checkpoint=null;this.campaignProgress=null;
   this.ui.toast(message('error.bootSave',{error}),9);if(this.state==='main')this.ui.render('main');else this.ui.refreshCampaign?.();
  });
 }
 syncStoredCampaign(){
  if(!this.store.memory||!this.store.progress)return;
  this.checkpoint=structuredClone(this.store.memory);this.campaignProgress=structuredClone(this.store.progress);this.checkpointState='ready';this.sessionOnly=!!this.store.sessionOnly;
 }
 escapeMenu(){
  const action=this.navigation.escape({state:this.state,capture:!!this.input.capture,modal:!!this.ui.modal});
  if(action==='cancel-capture'){this.input.capture=null;this.ui.render('settings');}
  else if(action==='cancel-modal')this.ui.closeModal();else if(action==='pause')this.pause();else if(action==='back')this.action('back');
 }
 selectLanguage(value){
  if(!isLanguage(value))return false;
  const first=this.state==='language-select';this.input.capture=null;
  this.settings.language=value;setLanguage(value);updateDocumentLanguage();
  this.store.saveSettings(this.settings);
  if(first){
   this.go('main');this.loadCheckpoint();
   if(this.storageWarning)this.ui.toast(this.storageWarning,9);
  }else{this.view?.setLanguage?.(value);this.ui.refreshLanguage();}
  return true;
 }
 go(state){this.view?.resetPresentation?.();if(this.state==='campaign'&&state!=='campaign')this.cancelCampaignDifficulty();this.state=state;const active=state==='playing';if(!active){this.enterSequence++;this.enterPending=false;}this.input.capture=null;this.input.setActive(active);this.clock.reset();this.performance?.reset();if(this.performance)this.metrics=this.performance.metrics;if(!active)this.view?.setDiagnosticsEnabled(false);this.lastFrame=performance.now();this.lastRender=this.lastFrame;this.frameLimiter?.reset();this.clearFrameCounters();this.sampleReady=false;if(!active){this.audio.pause();if(document.pointerLockElement===this.canvas)document.exitPointerLock();}this.ui.render(state);}
 pause(){if(this.state==='playing')this.go('paused');}
 lockError(){
  // The pending request's promise owns its error; the global input listener must
  // not send an older loading/entry attempt back to the ready screen.
  if(this.enterPending||this.state!=='playing'||document.pointerLockElement===this.canvas)return;
  this.pause();this.lockMessage=message('error.lockClick');
 }
 loadRuntime(){return Promise.all([import('./core/simulation.js'),import('./render/view.js')]);}
 async enter(){
  if(!this.world||!this.view||this.enterPending||!['ready','paused'].includes(this.state))return;
  this.enterPending=true;this.lockMessage='';const generation=this.loadGeneration,world=this.world,sequence=++this.enterSequence;
  const current=()=>generation===this.loadGeneration&&sequence===this.enterSequence&&this.world===world&&this.alive;
  try{
   this.canvas.focus({preventScroll:true});const lock=requestGamePointerLock(this.canvas);
   this.audio.resume(current).catch(e=>{if(current())this.ui.toast(message('error.audio',{error:e}),6);});
   await lock;
   if(current()&&document.pointerLockElement===this.canvas)this.go('playing');
   else if(document.pointerLockElement===this.canvas&&this.state!=='playing'&&!this.enterPending)document.exitPointerLock();
  }catch(error){if(current()){this.lockMessage=message('error.lockRetry',{error});this.go('ready');}}
  finally{if(sequence===this.enterSequence)this.enterPending=false;}
 }
 async start(snapshot=null){
  if(this.campaignDifficultyPending)return;
  const generation=++this.loadGeneration;this.disposeMission(false);this.loadingNew=!snapshot;this.errorMessage='';this.ui.loadMessage=message('loading.initial');this.ui.loadFraction=0;this.go('loading');this.canvas.hidden=false;
  let view=null,world=null,timeout;
  const current=()=>generation===this.loadGeneration&&this.alive&&(!view||this.view===view)&&(!world||this.world===world);
  const prepare=async()=>{
   this.ui.progress(message('loading.runtime'),.03);
   const [{Simulation},{GameView}]=await this.loadRuntime();if(!current())return;
   this.ui.progress(message('loading.world'),.12);
   world=new Simulation(snapshot,this.settings.difficulty);this.world=world;
   view=new GameView(this.canvas,world,this.settings);this.view=view;
   await view.load((label,f)=>{if(current())this.ui.progress(label,.24+f*.72);});
   if(!current()){view.dispose();return;}
   const candidate=snapshot||world.snapshot();validateSnapshot(candidate);
   const progress=snapshot?progressForCheckpoint(candidate,this.campaignProgress):createProgress(candidate);
   if(!current())return;
   if(!snapshot)await this.store.saveCampaign(candidate,progress,{isCurrent:current});
   // A save is another asynchronous boundary, just like imports and model loads.
   if(!current()){view.dispose();return;}
   this.checkpoint=structuredClone(candidate);this.campaignProgress=progress;this.checkpointState='ready';this.sessionOnly=!!this.store.sessionOnly;this.loadingNew=false;this.ui.ensureWorld?.(world);
   this.ui.message='';this.ui.messageUntil=0;this.ui.checkpointUntil=0;this.go('ready');
  };
  try{
   await Promise.race([prepare(),new Promise((_,reject)=>{timeout=setTimeout(()=>reject(new LocalizedError('error.loadTimeout')),45000);})]);
  }catch(error){
   if(generation!==this.loadGeneration||!this.alive)return;
   console.error(error);this.disposeMission();this.errorMessage=error;this.go('error');
  }finally{clearTimeout(timeout);}
 }
 disposeMission(invalidate=true){
  if(invalidate)this.loadGeneration++;this.enterSequence++;this.enterPending=false;
  this.syncStoredCampaign();this.store.invalidatePending();this.completionPending=false;this.ui.releaseWorld?.();this.input.setActive(false);this.input.capture=null;this.audio.stop();
  this.view?.dispose();this.view=null;this.world=null;this.canvas.hidden=true;this.canvas.style.filter='none';this.clock.reset();this.ui.message='';
 }
 async action(action,button){
  if(action==='choose-language')return this.selectLanguage(button?.dataset.language);
  if(this.state==='language-select')return;
  const actionSequence=++this.actionSequence;
  if(this.campaignDifficultyPending&&!['back','exit','settings','credits'].includes(action))return;
  if(this.ui.modal&&!['cancel-modal','confirm-modal'].includes(action))return;
  if(action==='cancel-modal'){this.ui.closeModal();return;}
  if(action==='confirm-modal'){
   const modal=this.ui.modal;if(!modal)return;this.ui.closeModal();this.ui.modal=null;
   if(modal.kind==='reset'){
    this.input.capture=null;this.settings=resetCategory(this.settings,modal.tab);this.input.settings=this.settings;this.audio.setSettings(this.settings);this.store.saveSettings(this.settings);this.graphicsDirty=modal.tab==='graphics';if(this.view)this.view.settings=this.settings;this.ui.layout?.invalidate('reset');this.ui.applyMotion?.();this.ui.render('settings');
   }else if(modal.kind==='new-campaign'&&this.state==='campaign')return this.start();return;
  }
  if(action==='hud-reset'&&this.state==='settings'){this.settings=resetHud(this.settings);this.input.settings=this.settings;if(this.view)this.view.settings=this.settings;this.store.saveSettings(this.settings);this.ui.layout?.invalidate('reset');this.ui.render('settings');return;}
  if(action==='enter')return this.enter();
  if(action==='campaign-new'||action==='campaign-continue'){
   if(!['main','campaign'].includes(this.state))return;
   if(action==='campaign-continue'&&(this.checkpointState!=='ready'||!this.checkpoint))return;
   this.cancelCampaignDifficulty();this.campaignIntent=action==='campaign-new'?'new':'continue';this.campaignSelection='cambrai';this.ui.openCampaign(this.campaignIntent);this.go('campaign');return;
  }
  if(action==='campaign-select'&&this.state==='campaign'){
   const id=button?.dataset.missionId;if(!['somme','flers','ypres','cambrai','amiens'].includes(id))return;
   this.campaignSelection=id;this.ui.refreshCampaign?.();return;
  }
  if(['map-skip','map-front','map-current','map-zoom-in','map-zoom-out'].includes(action)&&this.state==='campaign'){this.ui.campaign?.action(action);return;}
  if(action==='campaign-start'){
   if(this.state!=='campaign'||this.campaignIntent!=='new'||this.campaignSelection!=='cambrai'||this.checkpointState==='loading')return;
   if(this.checkpoint||this.campaignProgress||this.checkpointState==='invalid'){this.ui.showModal({kind:'new-campaign'});return;}return this.start();
  }
  if(action==='campaign-resume'){
   if(this.state!=='campaign'||this.campaignIntent!=='continue'||this.campaignSelection!=='cambrai'||this.campaignProgress?.status==='complete'||this.checkpointState!=='ready'||!this.checkpoint)return;
   return this.start(this.checkpoint);
  }
  if(action==='checkpoint'){
   if(!['paused','dead'].includes(this.state))return;
   const generation=this.loadGeneration;
   try{const snapshot=this.checkpoint||await this.store.load();if(!snapshot){this.ui.toast(message('campaign.noCheckpoint'));return;}if(generation===this.loadGeneration&&actionSequence===this.actionSequence&&this.alive)return this.start(snapshot);}
   catch(error){if(generation===this.loadGeneration&&actionSequence===this.actionSequence){this.errorMessage=error;this.go('error');}}return;
  }
  if(action==='campaign-complete'){
   if(this.state!=='complete'||this.completionPending)return;
   this.disposeMission();this.campaignIntent='continue';this.campaignSelection='cambrai';this.ui.openCampaign('continue');this.go('campaign');return;
  }
  if(action==='retry'&&this.state==='error')return this.start(this.loadingNew?null:this.checkpoint);
  if(action==='cancel-loading'&&this.state==='loading'){this.disposeMission();this.go('campaign');return;}
  if(action==='exit'){if(this.state==='complete'&&this.completionPending)return;this.disposeMission();this.go('main');return;}
  if(action==='back'){
   this.input.capture=null;const parent=this.navigation.back(this.state);this.go(parent);return;
  }
  if(action==='settings'&&['main','campaign','paused'].includes(this.state)){this.go(this.navigation.openOptions(this.state));return;}
  if(action==='credits'&&['main','campaign','paused'].includes(this.state)){this.go(this.navigation.openCredits(this.state));return;}
  if(action==='options-tab'&&this.state==='settings'){
   const tab=button?.dataset.tab;if(!OPTIONS_TABS.includes(tab))return;this.input.capture=null;this.ui.optionsTab=tab;this.ui.render('settings');return;
  }
  if(action==='category-reset'&&this.state==='settings'){this.input.capture=null;this.ui.showModal({kind:'reset',tab:this.ui.optionsTab||'gameplay'});return;}
  if(action==='bind'&&this.state==='settings'&&this.ui.optionsTab==='controls'){
   const key=button.dataset.key;if(!Object.hasOwn(DEFAULT_KEYS,key))return;
   button.textContent=t('controls.capture');button.classList.add('capture');
   this.input.capture=code=>{
    if(this.state!=='settings'||this.ui.optionsTab!=='controls')return;
    if(code){if(!VALID_KEY.test(code)){this.ui.toast(message('controls.invalid'));this.ui.render('settings');return;}const used=Object.keys(this.settings.keys).find(k=>this.settings.keys[k]===code);if(used)this.settings.keys[used]=this.settings.keys[key];this.settings.keys[key]=code;this.store.saveSettings(this.settings);}this.ui.render('settings');
   };
  }
 }
 cancelCampaignDifficulty(){
  if(!this.campaignDifficultyPending)return;
  this.campaignDifficultySequence=(this.campaignDifficultySequence||0)+1;
  this.store.invalidatePending();this.syncStoredCampaign();
  this.campaignDifficultyPending=false;this.pendingCampaignDifficultyId=null;
 }
 async changeCampaignDifficulty(value){
  const choices=SETTINGS_SCHEMA.difficulty.values;
  if(this.state!=='campaign'||this.world||this.ui.modal||this.campaignSelection!=='cambrai'||this.checkpointState==='loading'||!choices.includes(value)||this.campaignDifficultyPending)return false;
  if(this.campaignIntent==='new'){
   this.settings.difficulty=value;this.store.saveSettings(this.settings);this.ui.refreshCampaign?.();return true;
  }
  if(this.campaignIntent!=='continue'||this.checkpointState!=='ready'||!this.checkpoint||this.campaignProgress?.status==='complete')return false;
  if(this.checkpoint.difficulty===value)return true;
  const sequence=this.campaignDifficultySequence=(this.campaignDifficultySequence||0)+1,generation=this.loadGeneration;
  const current=()=>this.alive&&this.state==='campaign'&&this.campaignIntent==='continue'&&this.loadGeneration===generation&&this.campaignDifficultySequence===sequence;
  this.campaignDifficultyPending=true;this.pendingCampaignDifficultyId=value;this.ui.refreshCampaign?.();
  try{
   const pair=campaignWithDifficulty(this.checkpoint,this.campaignProgress,value);
   await this.store.saveCampaign(pair.checkpoint,pair.progress,{isCurrent:current});
   if(!current())return false;
   this.syncStoredCampaign();
   if(this.checkpoint?.difficulty!==value||this.campaignProgress?.runId!==pair.progress.runId)return false;
   this.ui.toast(message(this.sessionOnly?'campaign.difficultySession':'campaign.difficultySaved',{difficulty:message(`difficulty.${value}`)}),5);
   return true;
  }catch(error){
   if(current())this.ui.toast(message('campaign.difficultyFailed'),8);
   return false;
  }finally{
   if(sequence===this.campaignDifficultySequence){this.campaignDifficultyPending=false;this.pendingCampaignDifficultyId=null;this.ui.refreshCampaign?.();}
  }
 }
 changeSetting(key,value){
  if(key==='language')return this.selectLanguage(value);
  if(key==='difficulty')return this.changeCampaignDifficulty(value);
  if(!Object.hasOwn(SETTINGS_SCHEMA,key))return;
  this.settings[key]=normalizeSetting(key,value);if(key==='maxFps')this.frameLimiter.reset();
  this.input.settings=this.settings;this.audio.setSettings(this.settings);this.store.saveSettings(this.settings);
  if(['quality','renderScale','fov'].includes(key))this.graphicsDirty=true;
  if(HUD_SETTING_KEYS.includes(key)||['showMinimap','showFps','subtitles'].includes(key))this.ui.refreshHudOptions?.();
  if(key==='uiAnimations'){this.ui.applyMotion?.();this.ui.campaign?.setReducedMotion(this.ui.reducedMotion());}
  // Campaign difficulty has its own validated checkpoint transaction above.
 }
 applyPendingGraphics(){
  if(!this.graphicsDirty)return;this.graphicsDirty=false;if(!this.view)return;
  try{this.view.applySettings(this.settings);if(this.state!=='playing')this.view.render(false);}
  catch(error){this.ui.toast(message('error.options',{error}),8);}
 }
 events(){
  const world=this.world;if(!world)return;
  const generation=this.loadGeneration,batch=world.consumeEvents(),dead=world.player.hp<=0||batch.some(e=>e.type==='dead');let complete=false;
  for(const e of batch){
   if(e.type==='checkpoint')this.frameFlags|=1;if(e.type==='explosion')this.frameFlags|=2;if(e.type==='breach')this.frameFlags|=4;
   if(this.world!==world||generation!==this.loadGeneration)break;
   if(e.type==='complete'&&dead)continue;
   if(e.type==='checkpoint'){
    if(dead)continue;
    if(!world.canCheckpoint()){world.director.checkpointPending=true;continue;}
    try{
     const candidate=world.snapshot();validateSnapshot(candidate);const progress=progressForCheckpoint(candidate,this.campaignProgress);
     const current=()=>generation===this.loadGeneration&&this.world===world&&this.alive;
     this.store.saveCampaign(candidate,progress,{isCurrent:current}).then(()=>{if(current())this.syncStoredCampaign();}).catch(error=>{if(current())this.ui.toast(message('error.checkpoint',{error}),8);});
    }catch(error){console.error(error);world.director.checkpointPending=true;this.ui.toast(message('error.checkpoint',{error}),8);continue;}
   }
   this.view?.event(e);this.audio.event(e);this.ui.event(e);
   if(e.type==='complete')complete=true;
  }
  if(this.world===world&&generation===this.loadGeneration){
   if(dead)this.go('dead');else if(complete){this.finishCampaign(world,generation);this.go('complete');}
  }
 }
 finishCampaign(world,generation){
  if(!this.checkpoint)return;
  this.completionPending=true;const cp=this.checkpoint,progress=completeProgress(this.campaignProgress,cp);
  const current=()=>generation===this.loadGeneration&&this.world===world&&this.alive;
  this.store.saveCampaign(cp,progress,{isCurrent:current}).then(()=>{
   if(!current())return;this.campaignProgress=progress;this.sessionOnly=!!this.store.sessionOnly;
  }).catch(error=>{if(current())this.ui.toast(message('error.checkpoint',{error}),8);}).finally(()=>{
   if(current()){this.completionPending=false;if(this.state==='complete')this.ui.render('complete');}
  });
 }
 clearFrameCounters(){this.pendingCpu=this.pendingSimulation=this.pendingAudio=this.pendingEvents=this.pendingNav=this.pendingSteps=this.pendingDropped=0;this.frameFlags=0;}
 resetDiagnostics(reason='operator'){if(!this.performance)return;this.performance.reset(reason);this.metrics=this.performance.metrics;this.clearFrameCounters();this.sampleReady=false;this.ui.nextDebug=0;}
 captureMetadata(){return{version:VERSION,baseCommit:'a567537c528e46b89fac0ff94555460f83bc864c',browser:globalThis.navigator?.userAgent||'unknown',device:'not declared',css:this.view?.viewport(),buffer:this.view?{width:this.view.engine.getRenderWidth(),height:this.view.engine.getRenderHeight()}:null,dpr:globalThis.devicePixelRatio||1,quality:this.settings.quality,renderScale:this.settings.renderScale,cap:this.settings.maxFps,targetHz:this.performance?.targetHz,gpuSampleEvery:this.view?.gpuTimer.sampleEvery||4,debugVisible:this.ui.debug};}
 diagnosticKey(key){
  if(!this.ui.debug)return;
  if(key==='F4')this.resetDiagnostics('operator');
  if(key==='F6'){if(this.performance.capture?.active)this.performance.stopCapture();else{this.performance.startCapture(this.captureMetadata());this.resetDiagnostics('capture');}}
  if(key==='F7'){
   const data=this.performance.exportCapture(this.captureMetadata()),blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
   a.href=url;a.download='ziemianiczyja-0.4.5-performance.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
 }
 loop(now){
  if(!this.alive)return;
  const started=performance.now(),delta=(now-this.lastFrame)/1000;this.lastFrame=now;this.ui.tickUI();this.applyPendingGraphics();
  if(this.state==='playing'&&this.world&&this.view){
   try{
    let input,first=true;
    this.clock.advance(delta,true,dt=>{
     if(this.state!=='playing')return;
     if(first)input=this.input.consume();
     this.view.beforeTick();
     const simStart=performance.now(),navBefore=this.world.nav.metrics?.pathMs||0;
     this.world.tick(dt,input);this.pendingSimulation+=performance.now()-simStart;this.pendingNav+=(this.world.nav.metrics?.pathMs||0)-navBefore;
     this.view.afterTick();
     const audioStart=performance.now();this.audio.update(this.world,dt);this.pendingAudio+=performance.now()-audioStart;
     const eventStart=performance.now();this.events();this.pendingEvents+=performance.now()-eventStart;
     if(first){input={...input,fire:input.fireHeld,lookX:0,lookY:0,crouch:false,prone:false,jump:false,interact:false,reload:false,grenade:false,melee:false,wheel:0};delete input.slot;first=false;}
    });
    this.pendingSteps+=this.clock.lastSteps;this.pendingDropped+=this.clock.lastDroppedMs;
    if(this.state==='playing'&&this.frameLimiter.due(now,this.settings.maxFps)){
     const frameId=this.frame+1,diagnostics=this.ui.debug||!!this.performance.capture?.active;
     this.performance.frameCap=this.settings.maxFps;
     this.view.setDiagnosticsEnabled(diagnostics,this.performance.sessionId);
     this.view.render(true,{alpha:this.clock.alpha,presentationDt:Math.min(.1,Math.max(0,(now-this.lastRender)/1000)),look:this.input.peekLook(),frameId,sessionId:this.performance.sessionId});
     for(const sample of this.view.gpuTimer.drainSamples())this.performance.recordGpu(sample);
     const gpuStatus=this.view.gpuTimer.status;if(gpuStatus!==this.lastGpuStatus&&gpuStatus!=='ready')this.performance.invalidateGpu();this.lastGpuStatus=gpuStatus;
     const hudStart=performance.now();this.ui.update(this.world,this.view,this.metrics);const hud=performance.now()-hudStart;
     const profilerStart=performance.now(),rafSample={frameId,interval:delta*1000,cpu:performance.now()-started,steps:this.clock.lastSteps,droppedMs:this.clock.lastDroppedMs};
     this.performance.recordRaf(rafSample,now);
     if(this.sampleReady){
      const slot=this.performance.record({frameId,frame:now-this.lastRender,cpu:this.pendingCpu+performance.now()-started,simulation:this.pendingSimulation,audio:this.pendingAudio,events:this.pendingEvents,nav:this.pendingNav,scene:this.view.renderTimings.scene,render:this.view.renderTimings.render,hud,steps:this.pendingSteps,droppedMs:this.pendingDropped,flags:this.frameFlags},now);
      this.performance.finishRecord(slot,this.pendingCpu+performance.now()-started,performance.now()-profilerStart);
     }
     this.sampleReady=true;this.lastRender=now;this.clearFrameCounters();this.metrics=this.performance.metrics;this.frame++;
    }else{
     const cpu=performance.now()-started;this.pendingCpu+=cpu;
     if(this.state==='playing')this.performance.recordRaf({frameId:this.frame,interval:delta*1000,cpu,steps:this.clock.lastSteps,droppedMs:this.clock.lastDroppedMs},now);
    }
   }catch(error){console.error(error);this.errorMessage=error;this.go('error');}
  }else this.clock.advance(delta,false,()=>{});
  this.raf=requestAnimationFrame(t=>this.loop(t));
 }
 inspect(){return{state:this.state,campaignStatus:this.campaignProgress?.status??null,optionsTab:this.ui.optionsTab,hud:{contacts:this.ui.contacts?.contacts?.size||0,minimapDraws:this.ui.minimap?.draws||0,minimapRebuilds:this.ui.minimap?.rebuilds||0,markerNodes:this.ui.markers?.nodes.size||0,markerRays:this.ui.markers?.model.rays||0,layoutReflows:this.ui.layout?.reflows||0,compact:this.ui.layout?.snapshot().compact},language:this.settings.language,missionScenes:this.view?1:0,meshes:this.view?.scene.meshes.length||0,activeAudio:this.audio.sources.size,time:this.world?.time||0,phase:this.world?.director.phase??null,npcs:this.world?.npcs.length||0,alive:this.world?.npcs.filter(n=>n.hp>0).length||0,tanks:this.world?.tanks.map(t=>({id:t.id,z:t.pos.z,state:t.state})),stats:this.world?{...this.world.stats}:null,navQueued:this.world?.nav.requests.length||0,navigation:this.world?{...this.world.nav.metrics}:null,contacts:this.world?{...this.world.collision.diagnostics}:null,difficulty:this.world?.difficultyId??this.settings.difficulty,framesRendered:this.frame,frameCap:this.settings.maxFps,fieldGuns:this.world?.fieldGuns.map(g=>({id:g.id,operational:g.operational,ammo:g.ammo})),aircraft:this.world?.air.planes.length,breaches:this.world?.destroyedObstacles,metrics:{...this.metrics,gpu:this.view?.gpuTimer.milliseconds??null,gpuStatus:this.view?.gpuTimer.status??'disabled',...this.view?.renderStats},checkpoint:!!this.checkpoint,storageWarning:this.storageWarning};}
}
// Importing the application in Node does not create a DOM or start a game.
if(typeof window!=='undefined'&&typeof document!=='undefined'){
 const app=new Application();
 if(globalThis.__ZN_TEST_MODE__===true)globalThis.__ZN_TEST__={app};
}
