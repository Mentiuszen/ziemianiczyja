import {clamp,flatDist,rng} from '../core/math.js';
/** Original procedural Foley and battlefield sound. No network audio or speech synthesis. */
export class BattlefieldAudio {
 constructor(settings){this.settings=settings;this.ctx=null;this.sources=new Set();this.sourceRecords=new Map();this.currentAction=null;this.resumeGeneration=0;this.resumeWanted=false;this.disposed=false;this.ambientNodes=[];this.nextAmbient=6;this.enabled=false;this.listener={x:0,y:0,z:0,yaw:0};}
 async resume(isCurrent=()=>true){if(this.disposed)throw Error('Kontekst audio został zamknięty.');const generation=++this.resumeGeneration;this.resumeWanted=true;if(!this.ctx){const C=window.AudioContext||window.webkitAudioContext;if(!C)throw Error('Web Audio jest niedostępne.');this.ctx=new C();this.master=this.ctx.createGain();this.master.connect(this.ctx.destination);this.noise=this.ctx.createBuffer(1,this.ctx.sampleRate*3,this.ctx.sampleRate);const data=this.noise.getChannelData(0),random=rng(407);for(let i=0;i<data.length;i++)data[i]=(random()-.5)*2;this.startAmbience();}const ctx=this.ctx;await ctx.resume();
  if(generation!==this.resumeGeneration||ctx!==this.ctx||!isCurrent()){
   if(generation===this.resumeGeneration)this.resumeWanted=false;
   if(ctx===this.ctx&&!this.resumeWanted){this.enabled=false;this.master.gain.value=0;if(ctx.state==='running')await ctx.suspend();}
   return false;
  }
  this.enabled=true;this.master.gain.value=this.settings.master;return true;}
 pause(){this.resumeGeneration++;this.resumeWanted=false;this.enabled=false;if(this.master)this.master.gain.value=0;if(this.ctx?.state==='running')this.ctx.suspend().catch(e=>console.warn('Audio pause:',e));}
 setSettings(settings){this.settings=settings;if(this.master)this.master.gain.setTargetAtTime(this.enabled?settings.master:0,this.ctx.currentTime,.03);if(this.ambientGain)this.ambientGain.gain.setTargetAtTime(settings.ambient*.11,this.ctx.currentTime,.1);}
 startAmbience(){const c=this.ctx,noise=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain();noise.buffer=this.noise;noise.loop=true;filter.type='lowpass';filter.frequency.value=360;gain.gain.value=this.settings.ambient*.11;noise.connect(filter);filter.connect(gain);gain.connect(this.master);noise.start();this.ambientGain=gain;this.ambientNodes=[noise,filter,gain];}
 route(pos,volume){const c=this.ctx,gain=c.createGain(),pan=c.createStereoPanner();let attenuation=1,panning=0;if(pos){const dx=pos.x-this.listener.x,dz=pos.z-this.listener.z,distance=Math.hypot(dx,dz);attenuation=Math.min(1,4/(2+distance*.55));panning=clamp((dx*Math.cos(this.listener.yaw)-dz*Math.sin(this.listener.yaw))/(distance||1),-1,1);if(distance>95)attenuation=0;}gain.gain.value=volume*attenuation*this.settings.effects;pan.pan.value=panning;gain.connect(pan);pan.connect(this.master);return{gain,pan};}
 trackSource(source,nodes){
  const record={nodes,action:this.currentAction&&{...this.currentAction}};
  this.sources.add(source);this.sourceRecords.set(source,record);
  source.onended=()=>this.releaseSource(source);
 }
 releaseSource(source,stop=false){
  if(stop){try{source.stop();}catch{/* Already ended. */}}
  const record=this.sourceRecords.get(source);this.sourceRecords.delete(source);this.sources.delete(source);
  if(record)for(const node of record.nodes){try{node.disconnect();}catch{/* Already disposed. */}}
 }
 pruneActions(world){
  for(const [source,{action}] of this.sourceRecords){
   if(!action)continue;
   const actor=world.actors.find(a=>a.id===action.owner),weapon=actor?.weapon;
   if(!actor||actor.hp<=0||!weapon||weapon.id!==action.weapon||weapon.reloadSerial!==action.actionId||weapon.reloadLeft<=0)this.releaseSource(source,true);
  }
 }
 burst(pos,{duration=.18,freq=1400,volume=.24,pitch=0,delay=0,lowpass=false}={}){if(!this.enabled||!this.ctx||this.sources.size>28)return;const c=this.ctx,t=c.currentTime+delay,source=c.createBufferSource(),filter=c.createBiquadFilter(),env=c.createGain(),route=this.route(pos,volume);source.buffer=this.noise;source.playbackRate.value=.8+Math.random()*.4;filter.type=lowpass?'lowpass':'highpass';filter.frequency.value=freq;env.gain.setValueAtTime(.0001,t);env.gain.exponentialRampToValueAtTime(1,t+.004);env.gain.exponentialRampToValueAtTime(.001,t+duration);source.connect(filter);filter.connect(env);env.connect(route.gain);this.trackSource(source,[source,filter,env,route.gain,route.pan]);source.start(t,Math.random());source.stop(t+duration+.03);if(pitch)this.tone(pos,pitch,duration*.8,volume*.55,delay);}
 tone(pos,freq,duration,volume,delay=0){if(!this.enabled||this.sources.size>28)return;const c=this.ctx,t=c.currentTime+delay,osc=c.createOscillator(),env=c.createGain(),route=this.route(pos,volume);osc.type='sine';osc.frequency.setValueAtTime(freq,t);osc.frequency.exponentialRampToValueAtTime(Math.max(20,freq*.37),t+duration);env.gain.setValueAtTime(.001,t);env.gain.exponentialRampToValueAtTime(.8,t+.006);env.gain.exponentialRampToValueAtTime(.001,t+duration);osc.connect(env);env.connect(route.gain);this.trackSource(osc,[osc,env,route.gain,route.pan]);osc.start(t);osc.stop(t+duration+.02);}
 event(e){const player=e.owner==='player';if(e.type==='shot'){const profile={smle:[.24,850,85],gewehr:[.28,1050,72],webley:[.13,1650,130],lewis:[.12,1300,100],mg08:[.15,700,83]}[e.weapon]||[.2,1200,100];this.burst(player?null:e.from,{duration:profile[0],freq:profile[1],volume:player?.35:.29,pitch:profile[2]});if(['smle','gewehr'].includes(e.weapon)){this.burst(player?null:e.from,{duration:.065,freq:2200,volume:.1,delay:.25});this.tone(player?null:e.from,870,.065,.04,.54);}}
  if(e.type==='whistle'){this.tone(null,1750,.8,.12);this.tone(null,1900,.7,.1,.18);}
  if(e.type==='air-warning'){this.tone(null,180,2.8,.13);this.burst(null,{duration:2.5,freq:350,volume:.15,lowpass:true});}
  if(e.type==='cannon')this.burst(e.pos,{duration:.65,freq:240,volume:.5,pitch:43,lowpass:true});
  if(e.type==='explosion'){this.burst(e.pos,{duration:.85,freq:780,volume:.5,pitch:48,lowpass:true});this.burst(e.pos,{duration:.55,freq:2200,volume:.13,delay:.12});}
  if(e.type==='impact')this.burst(e.pos,{duration:.055,freq:1800,volume:.075});
  if(e.type==='step')this.burst(null,{duration:e.surface==='wood'?.08:.12,freq:e.surface==='wood'?550:1200,volume:.10,pitch:e.surface==='wood'?140:0,lowpass:true});
  if(e.type==='reload'){
   this.currentAction=e.owner&&Number.isInteger(e.actionId)?{owner:e.owner,weapon:e.weapon,actionId:e.actionId}:null;
   try{this.burst(e.pos,{duration:.15,freq:1800,volume:.12});this.tone(e.pos,950,.08,.045,.8);this.burst(e.pos,{duration:.08,freq:2200,volume:.1,delay:1.6});}finally{this.currentAction=null;}
  }
  if(e.type==='pickup'||e.type==='objective'){this.tone(null,540,.22,.055);this.tone(null,720,.25,.045,.12);}
  if(e.type==='hurt')this.burst(null,{duration:.18,freq:350,volume:.15,lowpass:true});
  if(e.type==='grenade'||e.type==='melee'||e.type==='switch')this.burst(null,{duration:.12,freq:1300,volume:.11});
 }
 update(world,dt){this.pruneActions(world);this.listener={...world.player.pos,yaw:world.player.yaw};if(!this.enabled)return;this.nextAmbient-=dt;if(this.nextAmbient<=0){this.nextAmbient=7+Math.random()*7;this.burst({x:world.player.pos.x+(Math.random()-.5)*80,z:world.player.pos.z+65},{duration:1.5,freq:170,volume:this.settings.ambient*.7,pitch:36,lowpass:true});}
  this.airTimer=(this.airTimer||0)-dt;if(this.airTimer<=0){this.airTimer=.38;for(const p of world.air.planes)if(flatDist(p.pos,world.player.pos)<95){this.tone(p.pos,95,.6,.25);this.burst(p.pos,{duration:.5,freq:480,volume:.22,lowpass:true});}}
  this.trackTimer=(this.trackTimer||0)-dt;if(this.trackTimer<=0){this.trackTimer=.19;for(const tank of world.tanks)if(tank.moving&&flatDist(world.player.pos,tank.pos)<38){this.burst(tank.pos,{duration:.12,freq:360,volume:.10,lowpass:true});this.tone(tank.pos,65,.2,.10);}}
 }
 stop(){
  this.pause();for(const source of [...this.sources])this.releaseSource(source,true);
  this.sourceRecords.clear();this.currentAction=null;this.nextAmbient=6;this.airTimer=0;this.trackTimer=0;
 }
 dispose(){
  if(this.disposed)return;this.disposed=true;this.stop();
  for(const node of this.ambientNodes){try{node.stop?.();node.disconnect();}catch{/* Already closed. */}}
  this.ambientNodes=[];const ctx=this.ctx;this.ctx=null;this.master=null;this.ambientGain=null;this.noise=null;
  ctx?.close().catch(e=>console.warn('Audio close:',e));
 }
}
