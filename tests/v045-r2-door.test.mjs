import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/core/simulation.js';
import {BRIEFING_DURATION,PHASE} from '../src/data/briefing.js';
import {HQ} from '../src/data/world-map.js';
import {eye} from '../src/world/collision.js';
import {setLanguage,text} from '../src/i18n/index.js';
const model=await import('../src/world/briefing-door.js').catch(()=>({}));
function approach(w,x=37.6){w.player.pos={x,y:w.terrain.height(HQ.x,HQ.z)+.2,z:HQ.z};w.player.yaw=Math.PI/2;w.player.pitch=0;w.player.grounded=true;w.player.vy=0;}
function open(w){w.director.skipBriefing(w);w.time+=1;w.refreshDynamic();}

test('r2: briefing prompt and action are absent at spawn, available only near the doorway',()=>{
 const w=new Simulation();assert.equal(w.director.interaction(w),null);
 assert.equal(w.director.interact(w),false);assert.equal(w.director.phase,0);
 approach(w);assert.equal(w.director.interaction(w)?.kind,'briefing-door');
 w.player.yaw=-Math.PI/2;assert.equal(w.director.interaction(w),null);
 w.player.yaw=Math.PI/2;assert.equal(w.director.interact(w),true);assert.equal(w.director.phase,1);
 assert.equal(w.director.interact(w),false);assert.equal(w.events.filter(e=>e.type==='whistle').length,1);
});
test('r2: the closed physical doorway blocks walking and bullets, open leaves clear the central exit',()=>{
 const w=new Simulation();approach(w);assert.ok(w.briefingDoor,'Simulation must own physical door state');
 const origin=eye(w.player),hit=w.collision.ray(origin,{x:1,y:0,z:0},5);
 assert.equal(hit?.solid?.kind,'briefing-door');
 assert.equal(w.collision.canStand({x:39.18,y:w.player.pos.y,z:HQ.z},'stand',Math.PI/2,'player'),false);
 assert.equal(w.collision.dynamicBlocked(w.player.pos,{x:41,y:w.player.pos.y,z:HQ.z}),true);
 open(w);assert.equal(w.briefingDoor.progress,1);
 assert.equal(w.collision.ray(origin,{x:1,y:0,z:0},4),null);
 assert.equal(w.collision.dynamicBlocked(w.player.pos,{x:41,y:w.player.pos.y,z:HQ.z}),false);
 for(let i=0;i<100;i++){w.briefingDoor.sync(w.director,w.time);w.player.update(w,1/60,{forward:true});}
 assert.ok(w.player.pos.x>40);assert.equal(w.player.collisionBlocked,false);
});
test('r2: door eligibility respects a real intervening obstruction and dead players',()=>{
 const w=new Simulation();approach(w);assert.ok(w.director.interaction(w));
 w.collision.boxes=[...w.collision.boxes,{id:'qa-obstruction',min:{x:38.2,y:-5,z:-10},max:{x:38.3,y:10,z:-5}}];
 assert.equal(w.director.interaction(w),null);assert.equal(w.director.interact(w),false);
 w.player.health.hp=0;assert.equal(w.director.interact(w),false);
});
test('r2: skip, natural finish and early alarm all open the same doors once',()=>{
 for(const mode of ['skip','natural','alarm']){
  const w=new Simulation();assert.ok(w.briefingDoor);w.consumeEvents();
  if(mode==='skip'){approach(w);w.interact();}
  if(mode==='natural'){w.time=BRIEFING_DURATION;w.director.update(w,BRIEFING_DURATION);}
  if(mode==='alarm')w.director.alert(w);
  assert.equal(w.director.phase,PHASE.ADVANCE);w.time+=1;w.refreshDynamic();assert.equal(w.briefingDoor.progress,1);
  assert.equal(w.events.filter(e=>e.type==='whistle').length,1);assert.equal(w.director.events.filter(e=>e==='assault').length,1);
 }
});
test('r2: opening follows simulation time, restores exactly and does not add a save version',()=>{
 const w=new Simulation();assert.ok(w.briefingDoor);const closed=w.snapshot();
 assert.equal(new Simulation(closed).briefingDoor.progress,0);
 w.director.skipBriefing(w);w.time=.25;w.refreshDynamic();const progress=w.briefingDoor.progress;
 assert.ok(progress>0&&progress<1);for(let i=0;i<20;i++)w.briefingDoor.sync(w.director,w.time);assert.equal(w.briefingDoor.progress,progress);
 const snap=w.snapshot(),restored=new Simulation(snap);assert.equal(restored.briefingDoor.progress,progress);
 assert.equal(snap.missionVersion,closed.missionVersion);assert.deepEqual(restored.briefingDoor.leaves,w.briefingDoor.leaves);
 open(restored);assert.equal(new Simulation(restored.snapshot()).briefingDoor.progress,1);
});
test('r2: render and collision share matching door leaf positions and dimensions',()=>{
 assert.equal(typeof model.BriefingDoor,'function');const door=new model.BriefingDoor({height:()=>0});
 for(const time of [0,.1,.25,.5,1]){
  door.sync({phase:1,assaultTime:0},time);
  for(const leaf of door.leaves){assert.equal(leaf.box.obb.x,leaf.pos.x);assert.equal(leaf.box.obb.z,leaf.pos.z);assert.equal(leaf.box.obb.yaw,leaf.yaw);assert.ok(leaf.box.max.y>leaf.box.min.y);}
 }
});
test('r2: localized objectives no longer advertise a global skip hotkey',()=>{
 for(const lang of ['pl','en']){setLanguage(lang);assert.ok(!text({key:'objective.orders.hint'}).includes('{interact}'));assert.ok(!text({key:'brief.step1'}).includes('{interact}'));}
});

test('r2: detailed door geometry is batched into three materials per leaf, with valid LH faces',async()=>{
 const geometry=await import('../src/render/briefing-door-geometry.js').catch(()=>({}));
 assert.equal(typeof geometry.makeDoorLeafGeometry,'function');
 for(const sign of [-1,1]){
  const batches=geometry.makeDoorLeafGeometry(sign);assert.deepEqual(Object.keys(batches).sort(),['darkwood','iron','wood']);
  let triangles=0;
  for(const g of Object.values(batches)){
   assert.ok(g.p.length>0);assert.ok(g.p.every(Number.isFinite));assert.equal(g.n.length,g.p.length);triangles+=g.i.length/3;
   for(let at=0;at<g.i.length;at+=3){
    const [a,b,c]=g.i.slice(at,at+3).map(i=>g.p.slice(i*3,i*3+3));
    const u=b.map((x,k)=>x-a[k]),v=c.map((x,k)=>x-a[k]),cross=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],n=g.n.slice(g.i[at]*3,g.i[at]*3+3);
    assert.ok(cross.reduce((sum,x,k)=>sum+x*n[k],0)<-1e-10);
   }
  }
  assert.ok(triangles<300,'Do not create an expensive door prop');
 }
});

test('r2: walking into the doors while they open never leaves the player embedded',()=>{
 for(const stance of ['stand','crouch','prone']){
  const w=new Simulation();approach(w);w.player.stance=stance;
  w.npcs=[];w.actors=[w.player];w.collision.actors=w.actors;
  assert.ok(w.collision.canStand(w.player.pos,stance,w.player.yaw,'player'));
  w.tick(1/60,{interact:true});assert.equal(w.director.phase,PHASE.ADVANCE);
  for(let i=0;i<360;i++){w.tick(1/60,{forward:true});assert.equal(w.player.collisionBlocked,false);}
  assert.ok(w.player.pos.x>41,stance+' could not leave through the opened door');
 }
});
test('r2: outward-opening leaves do not trap an actor waiting outside the threshold',()=>{
 const w=new Simulation();w.npcs=[];w.actors=[w.player];w.collision.actors=w.actors;
 let checked=0;
 for(const x of [39.65,40.05,40.5])for(const z of [HQ.z-.65,HQ.z,HQ.z+.65]){
  w.time=0;w.director.phase=PHASE.BRIEFING;w.director.assaultTime=null;w.refreshDynamic();
  w.player.pos={x,y:w.terrain.height(x,z),z};w.player.yaw=-Math.PI/2;w.player.lastSafePosition=null;w.player.vy=0;
  if(!w.collision.canStand(w.player.pos,'stand',w.player.yaw,'player'))continue;
  checked++;w.director.startAssault(w);
  for(let i=0;i<60;i++){w.tick(1/60,{});assert.equal(w.player.collisionBlocked,false,`outside ${x}/${z}`);}
  assert.ok(w.collision.canStand(w.player.pos,'stand',w.player.yaw,'player'));
 }
 assert.ok(checked>=6,'Insufficient exterior opening coverage');
});
