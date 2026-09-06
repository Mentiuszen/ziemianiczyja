import {VERSION} from './version.js';
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
 constructor(){this.canvas=document.querySelector('#game');this.state='main';this.returnState='main';this.world=null;this.view=null;this.loadGeneration=0;this.enterSequence=0;this.enterPending=false;this.actionSequence=0;this.checkpoint=null;this.storageWarning='';this.errorMessage='';this.lockMessage='';this.store=new Store(message=>{this.storageWarning=message;if(this.settings?.language&&this.state!=='language-select')this.ui?.toast(message,9);});this.settings=this.store.settings();setLanguage(this.settings.language||'pl');this.state=this.settings.language?'main':'language-select';if(this.settings.language)updateDocumentLanguage();else document.documentElement.lang='en';this.checkpointLoadStarted=false;this.audio=new BattlefieldAudio(this.settings);this.clock=new FixedClock();this.ui=new UI(this);this.input=new Input(this.canvas,this.settings,{pause:()=>this.pause(),debug:()=>{this.ui.debug=!this.ui.debug;},lockError:()=>this.lockError()});this.lastFrame=performance.now();this.performance=new PerformanceMonitor();this.metrics=this.performance.metrics;this.frame=0;this.alive=true;this.frameLimiter=new FrameLimiter();this.lastRender=this.lastFrame;this.pendingCpu=0;this.pendingSimulation=0;
  window.addEventListener('resize',()=>this.view?.resize());window.addEventListener('beforeunload',()=>{this.alive=false;this.disposeMission();this.audio.dispose();this.input.dispose();});
  this.canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();this.disposeMission();this.errorMessage=message('error.context');this.go('error');});
  this.ui.render(this.state);if(this.storageWarning&&this.settings.language)this.ui.toast(this.storageWarning,9);
  // Do not load the checkpoint or expose a main-menu frame before the first choice.
  if(this.settings.language)this.loadCheckpoint();
  this.raf=requestAnimationFrame(now=>this.loop(now));
  // Read-only diagnostics are deliberately available for performance and lifecycle checks.
  const application=this;window.ZiemiaNiczyja={get state(){return application.state;},inspect:()=>this.inspect(),version:VERSION};
 }
 loadCheckpoint(){
  if(this.checkpointLoadStarted||!isLanguage(this.settings.language))return;
  this.checkpointLoadStarted=true;const generation=this.loadGeneration;
  this.store.load().then(snapshot=>{
   if(generation!==this.loadGeneration||!this.alive)return;
   this.checkpoint=snapshot;if(this.state==='main')this.ui.render('main');
  }).catch(error=>{
   if(generation===this.loadGeneration&&this.alive)this.ui.toast(message('error.bootSave',{error}),9);
  });
 }
 selectLanguage(value){
  if(!isLanguage(value))return false;
  const first=this.state==='language-select';
  this.settings.language=value;setLanguage(value);updateDocumentLanguage();
  this.store.saveSettings(this.settings);
  if(first){
   this.go('main');this.loadCheckpoint();
   if(this.storageWarning)this.ui.toast(this.storageWarning,9);
  }else{this.view?.setLanguage?.(value);this.ui.refreshLanguage();}
  return true;
 }
 go(state){this.state=state;const active=state==='playing';if(!active){this.enterSequence++;this.enterPending=false;}if(state!=='controls')this.input.capture=null;this.input.setActive(active);this.clock.reset();this.performance?.reset();if(this.performance)this.metrics=this.performance.metrics;if(!active)this.view?.setDiagnosticsEnabled(false);this.lastFrame=performance.now();this.lastRender=this.lastFrame;this.frameLimiter?.reset();this.pendingCpu=this.pendingSimulation=0;if(!active){this.audio.pause();if(document.pointerLockElement===this.canvas)document.exitPointerLock();}this.ui.render(state);}
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
  const generation=++this.loadGeneration;this.disposeMission(false);this.errorMessage='';this.ui.loadMessage=message('loading.initial');this.ui.loadFraction=0;this.go('loading');this.canvas.hidden=false;
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
   if(!current())return;this.checkpoint=structuredClone(candidate);
   if(!snapshot)await this.store.save(candidate,{isCurrent:current});
   // A save is another asynchronous boundary, just like imports and model loads.
   if(!current()){view.dispose();return;}
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
  this.store.invalidatePending();this.input.setActive(false);this.input.capture=null;this.audio.stop();
  this.view?.dispose();this.view=null;this.world=null;this.canvas.hidden=true;this.canvas.style.filter='none';this.clock.reset();this.ui.message='';
 }
 async action(action,button){
  if(action==='choose-language')return this.selectLanguage(button?.dataset.language);
  if(this.state==='language-select')return;
  const actionSequence=++this.actionSequence;
  if(action==='enter')return this.enter();
  if(action==='start')return this.start();
  if(action==='continue'||action==='checkpoint'){
   const generation=this.loadGeneration;
   try{const snapshot=this.checkpoint||await this.store.load();if(generation===this.loadGeneration&&actionSequence===this.actionSequence&&this.alive)return this.start(snapshot);}
   catch(e){if(generation===this.loadGeneration&&actionSequence===this.actionSequence){this.errorMessage=e;this.go('error');}}return;
  }
  if(action==='retry')return this.start(this.checkpoint);
  if(action==='exit'){this.disposeMission();this.go('main');return;}
  if(action==='back'){this.store.saveSettings(this.settings);this.view?.applySettings(this.settings);this.view?.render(false);this.go(this.world?'paused':'main');return;}
  if(['brief','missions','settings','controls','credits'].includes(action)){this.returnState=this.world?'paused':'main';this.go(action);return;}
  if(action==='settings-reset'){this.settings={...DEFAULT_SETTINGS,language:this.settings.language,keys:{...this.settings.keys}};this.input.settings=this.settings;this.audio.setSettings(this.settings);this.store.saveSettings(this.settings);this.ui.render('settings');return;}
  if(action==='keys-reset'){this.settings.keys={...DEFAULT_KEYS};this.store.saveSettings(this.settings);this.ui.render('controls');return;}
  if(action==='bind'){const key=button.dataset.key;button.textContent=t('controls.capture');button.classList.add('capture');this.input.capture=code=>{if(code){if(!/^(Key[A-Z]|Digit[0-9]|Shift(Left|Right)|Control(Left|Right)|Alt(Left|Right)|Space|Arrow(Up|Down|Left|Right))$/.test(code)){this.ui.toast(message('controls.invalid'));this.ui.render('controls');return;}const used=Object.keys(this.settings.keys).find(k=>this.settings.keys[k]===code);if(used)this.settings.keys[used]=this.settings.keys[key];this.settings.keys[key]=code;this.store.saveSettings(this.settings);}this.ui.render('controls');};}
 }
 changeSetting(key,value){if(key==='language')return this.selectLanguage(value);if(key==='maxFps'){value=Number.isFinite(Number(value))?Math.min(360,Math.max(0,Math.round(Number(value)))):0;this.frameLimiter.reset();}this.settings[key]=value;this.input.settings=this.settings;this.audio.setSettings(this.settings);this.store.saveSettings(this.settings);}
 events(){
  const world=this.world;if(!world)return;
  const generation=this.loadGeneration,batch=world.consumeEvents(),dead=world.player.hp<=0||batch.some(e=>e.type==='dead');let complete=false;
  for(const e of batch){
   if(this.world!==world||generation!==this.loadGeneration)break;
   if(e.type==='complete'&&dead)continue;
   if(e.type==='checkpoint'){
    if(dead)continue;
    if(!world.canCheckpoint()){world.director.checkpointPending=true;continue;}
    try{
     const candidate=world.snapshot();validateSnapshot(candidate);this.checkpoint=structuredClone(candidate);
     const current=()=>generation===this.loadGeneration&&this.world===world&&this.alive;
     this.store.save(candidate,{isCurrent:current}).then(persistent=>{if(current())this.ui.toast(message(persistent?'storage.saved':'storage.savedSession'),4);}).catch(error=>{if(current())this.ui.toast(message('error.checkpoint',{error}),8);});
    }catch(error){console.error(error);world.director.checkpointPending=true;this.ui.toast(message('error.checkpoint',{error}),8);continue;}
   }
   this.view?.event(e);this.audio.event(e);this.ui.event(e);
   if(e.type==='complete')complete=true;
  }
  if(this.world===world&&generation===this.loadGeneration){
   if(dead)this.go('dead');else if(complete){this.store.completed();this.go('complete');}
  }
 }
 loop(now){
  if(!this.alive)return;
  const started=performance.now(),delta=(now-this.lastFrame)/1000;this.lastFrame=now;this.ui.tickUI();
  if(this.state==='playing'&&this.world&&this.view){
   try{
    const simulationStart=performance.now();let input,first=true;
    this.clock.advance(delta,true,dt=>{
     if(this.state!=='playing')return;
     if(first)input=this.input.consume();
     this.world.tick(dt,input);this.audio.update(this.world,dt);this.events();
     if(first){input={...input,fire:input.fireHeld,lookX:0,lookY:0,crouch:false,prone:false,jump:false,interact:false,reload:false,grenade:false,melee:false,wheel:0};delete input.slot;first=false;}
    });
    const simulation=performance.now()-simulationStart;
    this.pendingSimulation+=simulation;
    if(this.frameLimiter.due(now,this.settings.maxFps)){
     const renderStart=performance.now();
     this.view.setDiagnosticsEnabled(this.state==='playing'&&(this.settings.showGpu||this.ui.debug));
     this.view.render(this.state==='playing');
     const render=performance.now()-renderStart;
     this.ui.update(this.world,this.view,this.metrics);
     this.performance.record({frame:now-this.lastRender,cpu:this.pendingCpu+performance.now()-started,simulation:this.pendingSimulation,render},now);
     this.lastRender=now;this.pendingCpu=this.pendingSimulation=0;this.metrics=this.performance.metrics;this.frame++;
    }else this.pendingCpu+=performance.now()-started;
   }catch(error){console.error(error);this.errorMessage=error;this.go('error');}
  }else this.clock.advance(delta,false,()=>{});
  this.raf=requestAnimationFrame(t=>this.loop(t));
 }
 inspect(){return{state:this.state,language:this.settings.language,missionScenes:this.view?1:0,meshes:this.view?.scene.meshes.length||0,activeAudio:this.audio.sources.size,time:this.world?.time||0,phase:this.world?.director.phase??null,npcs:this.world?.npcs.length||0,alive:this.world?.npcs.filter(n=>n.hp>0).length||0,tanks:this.world?.tanks.map(t=>({id:t.id,z:t.pos.z,state:t.state})),stats:this.world?{...this.world.stats}:null,navQueued:this.world?.nav.requests.length||0,navigation:this.world?{...this.world.nav.metrics}:null,contacts:this.world?{...this.world.collision.diagnostics}:null,difficulty:this.world?.difficultyId??this.settings.difficulty,framesRendered:this.frame,frameCap:this.settings.maxFps,fieldGuns:this.world?.fieldGuns.map(g=>({id:g.id,operational:g.operational,ammo:g.ammo})),aircraft:this.world?.air.planes.length,breaches:this.world?.destroyedObstacles,metrics:{...this.metrics,gpu:this.view?.gpuTimer.milliseconds??null,gpuStatus:this.view?.gpuTimer.status??'disabled',...this.view?.renderStats},checkpoint:!!this.checkpoint,storageWarning:this.storageWarning};}
}
// Importing the application in Node does not create a DOM or start a game.
if(typeof window!=='undefined'&&typeof document!=='undefined'){
 const app=new Application();
 if(globalThis.__ZN_TEST_MODE__===true)globalThis.__ZN_TEST__={app};
}
