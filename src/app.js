import {FrameLimiter} from './performance/frame-limiter.js';
import {PerformanceMonitor} from './performance/monitor.js';
import {Store,DEFAULT_SETTINGS,DEFAULT_KEYS} from './save/store.js';
import {FixedClock} from './core/clock.js';
import {Input,requestGamePointerLock} from './input/input.js';
import {BattlefieldAudio} from './audio/audio.js';
import {UI,keyLabel} from './ui/ui.js';
class Application {
 constructor(){this.canvas=document.querySelector('#game');this.state='main';this.returnState='main';this.world=null;this.view=null;this.loadGeneration=0;this.checkpoint=null;this.storageWarning='';this.errorMessage='';this.lockMessage='';this.store=new Store(message=>{this.storageWarning=message;this.ui?.toast(message,9);});this.settings=this.store.settings();this.audio=new BattlefieldAudio(this.settings);this.clock=new FixedClock();this.ui=new UI(this);this.input=new Input(this.canvas,this.settings,{pause:()=>this.pause(),debug:()=>{this.ui.debug=!this.ui.debug;},lockError:()=>this.lockError()});this.lastFrame=performance.now();this.performance=new PerformanceMonitor();this.metrics=this.performance.metrics;this.frame=0;this.alive=true;this.frameLimiter=new FrameLimiter();this.lastRender=this.lastFrame;this.pendingCpu=0;this.pendingSimulation=0;
  window.addEventListener('resize',()=>this.view?.resize());window.addEventListener('beforeunload',()=>{this.alive=false;this.audio.dispose();this.view?.dispose();this.input.dispose();});
  this.canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();this.errorMessage='Utracono kontekst grafiki. Zmniejsz jakość i wczytaj ostatni checkpoint.';this.go('error');});
  this.ui.render('main');if(this.storageWarning)this.ui.toast(this.storageWarning,9);
  this.store.load().then(snapshot=>{this.checkpoint=snapshot;if(this.state==='main')this.ui.render('main');}).catch(error=>{this.ui.toast(`${error.message} Możesz bezpiecznie rozpocząć misję od nowa.`,9);});
  this.raf=requestAnimationFrame(now=>this.loop(now));
  // Read-only diagnostics are deliberately available for performance and lifecycle checks.
  window.ZiemiaNiczyja={get state(){return app.state;},inspect:()=>this.inspect(),version:'0.4.0'};
 }
 go(state){this.state=state;const active=state==='playing';this.input.setActive(active);this.clock.reset();this.performance?.reset();if(this.performance)this.metrics=this.performance.metrics;if(!active)this.view?.setDiagnosticsEnabled(false);this.lastFrame=performance.now();this.lastRender=this.lastFrame;this.frameLimiter?.reset();this.pendingCpu=this.pendingSimulation=0;if(!active){this.audio.pause();if(document.pointerLockElement===this.canvas)document.exitPointerLock();}this.ui.render(state);}
 pause(){if(this.state==='playing')this.go('paused');}
 lockError(){if(this.state==='playing')this.pause();this.lockMessage='Nie udało się zablokować kursora. Kliknij przycisk ponownie. Sprawdź uprawnienia strony i użyj przeglądarki na komputerze.';if(this.world&&this.state!=='loading'){this.go('ready');}}
 async enter(){
  if(!this.world||!this.view||this.enterPending)return;
  this.enterPending=true;this.lockMessage='';const generation=this.loadGeneration;
  try{
   this.canvas.focus({preventScroll:true});
   const lock=requestGamePointerLock(this.canvas);
   this.audio.resume().catch(e=>this.ui.toast(`Dźwięk niedostępny: ${e.message}`,6));
   await lock;
   if(generation===this.loadGeneration&&this.world&&document.pointerLockElement===this.canvas)this.go('playing');
  }catch(error){if(generation===this.loadGeneration&&this.world){this.lockMessage=`${error.message} Kliknij ponownie lub sprawdź uprawnienia strony.`;this.go('ready');}}
  finally{this.enterPending=false;}
 }
 async start(snapshot=null){const generation=++this.loadGeneration;this.disposeMission(false);this.errorMessage='';this.go('loading');this.canvas.hidden=false;let timeout;
  try{this.ui.progress('Ładowanie lokalnego silnika 3D',.03);const [{Simulation},{GameView}]=await Promise.all([import('./core/simulation.js'),import('./render/view.js')]);if(generation!==this.loadGeneration)return;this.ui.progress('Budowanie terenu, kolizji i grafu okopów',.12);this.world=new Simulation(snapshot,this.settings.difficulty);this.view=new GameView(this.canvas,this.world,this.settings);const view=this.view;
   await Promise.race([view.load((label,f)=>{if(generation===this.loadGeneration)this.ui.progress(label,.24+f*.72);}),new Promise((_,reject)=>{timeout=setTimeout(()=>reject(Error('Przekroczono 45 sekund przygotowania zasobów. Spróbuj ponownie.')),45000);})]);clearTimeout(timeout);if(generation!==this.loadGeneration){view.dispose();return;}
   if(!snapshot){this.checkpoint=this.world.snapshot();await this.store.save(this.checkpoint);}else this.checkpoint=snapshot;this.ui.message='';this.ui.messageUntil=0;this.ui.checkpointUntil=0;this.go('ready');
  }catch(error){clearTimeout(timeout);if(generation!==this.loadGeneration)return;console.error(error);this.errorMessage=error.message||String(error);this.go('error');}
 }
 disposeMission(invalidate=true){if(invalidate)this.loadGeneration++;this.input.setActive(false);this.audio.stop();this.view?.dispose();this.view=null;this.world=null;this.canvas.hidden=true;this.canvas.style.filter='none';this.clock.reset();this.ui.message='';}
 async action(action,button){
  if(action==='enter')return this.enter();
  if(action==='start')return this.start();
  if(action==='continue'||action==='checkpoint'){try{const snapshot=this.checkpoint||await this.store.load();return this.start(snapshot);}catch(e){this.errorMessage=e.message;this.go('error');}return;}
  if(action==='retry')return this.start(this.checkpoint);
  if(action==='exit'){this.disposeMission();this.go('main');return;}
  if(action==='back'){this.store.saveSettings(this.settings);this.view?.applySettings(this.settings);this.view?.render(false);this.go(this.world?'paused':'main');return;}
  if(['brief','missions','settings','controls','credits'].includes(action)){this.returnState=this.world?'paused':'main';this.go(action);return;}
  if(action==='settings-reset'){this.settings={...DEFAULT_SETTINGS,keys:{...this.settings.keys}};this.input.settings=this.settings;this.audio.setSettings(this.settings);this.store.saveSettings(this.settings);this.ui.render('settings');return;}
  if(action==='keys-reset'){this.settings.keys={...DEFAULT_KEYS};this.store.saveSettings(this.settings);this.ui.render('controls');return;}
  if(action==='bind'){const key=button.dataset.key;button.textContent='Naciśnij klawisz…';button.classList.add('capture');this.input.capture=code=>{if(code){if(!/^(Key[A-Z]|Digit[0-9]|Shift(Left|Right)|Control(Left|Right)|Alt(Left|Right)|Space|Arrow(Up|Down|Left|Right))$/.test(code)){this.ui.toast('Wybierz literę, cyfrę, strzałkę, Shift, Ctrl, Alt lub Spację.');this.ui.render('controls');return;}const used=Object.keys(this.settings.keys).find(k=>this.settings.keys[k]===code);if(used)this.settings.keys[used]=this.settings.keys[key];this.settings.keys[key]=code;this.store.saveSettings(this.settings);}this.ui.render('controls');};}
 }
 changeSetting(key,value){if(key==='maxFps'){value=Number.isFinite(Number(value))?Math.min(360,Math.max(0,Math.round(Number(value)))):0;this.frameLimiter.reset();}this.settings[key]=value;this.input.settings=this.settings;this.audio.setSettings(this.settings);this.store.saveSettings(this.settings);}
 events(){if(!this.world)return;for(const e of this.world.consumeEvents()){this.view?.event(e);this.audio.event(e);this.ui.event(e);if(e.type==='checkpoint'){try{this.checkpoint=this.world.snapshot();this.store.save(this.checkpoint).then(persistent=>this.ui.toast(persistent?'Zapisano checkpoint w tej przeglądarce.':'Checkpoint zapisany tylko w pamięci tej sesji.',4));}catch(error){console.error(error);this.ui.toast(`Checkpoint nie został zapisany: ${error.message}`,8);}}
   if(e.type==='dead')this.go('dead');if(e.type==='complete'){this.store.completed();this.go('complete');}}
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
   }catch(error){console.error(error);this.errorMessage=error.message||String(error);this.go('error');}
  }else this.clock.advance(delta,false,()=>{});
  this.raf=requestAnimationFrame(t=>this.loop(t));
 }
 inspect(){return{state:this.state,missionScenes:this.view?1:0,meshes:this.view?.scene.meshes.length||0,activeAudio:this.audio.sources.size,time:this.world?.time||0,phase:this.world?.director.phase??null,npcs:this.world?.npcs.length||0,alive:this.world?.npcs.filter(n=>n.hp>0).length||0,tanks:this.world?.tanks.map(t=>({id:t.id,z:t.pos.z,state:t.state})),stats:this.world?{...this.world.stats}:null,navQueued:this.world?.nav.requests.length||0,framesRendered:this.frame,frameCap:this.settings.maxFps,fieldGuns:this.world?.fieldGuns.map(g=>({id:g.id,operational:g.operational,ammo:g.ammo})),aircraft:this.world?.air.planes.length,breaches:this.world?.destroyedObstacles,metrics:{...this.metrics,gpu:this.view?.gpuTimer.milliseconds??null,gpuStatus:this.view?.gpuTimer.status??'disabled',...this.view?.renderStats},checkpoint:!!this.checkpoint,storageWarning:this.storageWarning};}
}
const app=new Application();
// Test harness is opt-in and never enabled by normal navigation.
if(globalThis.__ZN_TEST_MODE__===true)globalThis.__ZN_TEST__={app};
