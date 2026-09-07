import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeSettings,resetCategory} from '../src/save/settings-schema.js';
import {damageFeedback} from '../src/ui/damage-feedback.js';
import {PerformanceMonitor} from '../src/performance/monitor.js';
import {Simulation} from '../src/core/simulation.js';
import {FixedClock} from '../src/core/clock.js';
import {Input} from '../src/input/input.js';
const optional = async path => import(path).catch(()=>({}));
const settings = await optional('../src/ui/hud/settings.js');
const hit = await optional('../src/ui/hud/hit-feedback.js');
const presentation = await optional('../src/render/presentation-state.js');
const projection = await optional('../src/ui/hud/grenade-warning.js');
const crosshair = await optional('../src/ui/hud/crosshair.js');
const layout = await optional('../src/ui/hud/layout.js');

test('v045: existing preferences migrate without CPU/GPU toggles or lost bindings',()=>{
 const s=normalizeSettings({showCpu:true,showGpu:true,language:'en',renderScale:1.4,keys:{interact:'KeyF'},hudScale:9,hudMinimapScale:NaN,crosshairStyle:'legacy'});
 assert.equal(s.hudScale,2);assert.equal(s.hudMinimapScale,1);assert.equal(s.crosshairStyle,'cross');
 assert.ok(!('showCpu' in s)&&!('showGpu' in s));assert.equal(s.renderScale,1.4);assert.equal(s.keys.interact,'KeyF');
 assert.equal(resetCategory(s,'audio').hudScale,2);
});
test('v045: every functional HUD module is clamped at effective 200 percent',()=>{
 assert.equal(typeof settings.getHudScale,'function');
 assert.equal(settings.getHudScale({hudScale:1.5,hudMinimapScale:1.5},'minimap'),2);
 assert.equal(settings.getHudScale({hudScale:.5,hudMinimapScale:.5},'minimap'),.5);
 assert.equal(settings.getHudScale({hudScale:1.5,hudMinimapScale:1},'minimap'),1.5);
 assert.equal(Object.keys(settings.HUD_SCALE_KEYS).length,18);
 for(const id of Object.keys(settings.HUD_SCALE_KEYS))assert.equal(settings.getHudScale({hudScale:2,[settings.HUD_SCALE_KEYS[id]]:2},id),2);
});
test('v045: critical HP is strictly below 20 percent even with visual effects off',()=>{
 for(const [hp,expected] of [[100,false],[20,false],[19,true],[1,true],[0,false]]){
  const f=damageFeedback({hp,hurt:.65},5,0,true);assert.equal(f.critical,expected);assert.equal(f.vignette,0);
 }
 const a=damageFeedback({hp:10,hurt:.65},1,1,true),b=damageFeedback({hp:10,hurt:.65},2,1,true);
 assert.equal(a.pulse,b.pulse);
});
test('v045: confirmed kills originate from actual committed damage, once',()=>{
 const s=new Simulation(null,'soldier'),target=s.npcs.find(n=>n.faction==='de');s.consumeEvents();target.hp=5;
 s.damage(target,100,s.player,{kind:'bullet',hitPart:'torso'});
 const e=s.consumeEvents().filter(e=>e.type==='combat-feedback');assert.equal(e.length,1);assert.equal(e[0].damage,5);assert.equal(e[0].killed,true);assert.equal(e[0].targetId,target.id);
 s.damage(target,100,s.player,{kind:'melee'});assert.equal(s.consumeEvents().filter(e=>e.type==='combat-feedback').length,0);
});
test('v045: feedback includes player grenades/melee but not NPC kills or friendly fire',()=>{
 const s=new Simulation(),a=s.npcs.find(n=>n.faction==='de'),ally=s.npcs.find(n=>n.faction==='uk');s.consumeEvents();
 s.damage(a,1,{id:'player',faction:'uk'},{kind:'explosion'});s.damage(a,1,s.player,{kind:'melee'});s.damage(ally,99,s.player,{kind:'bullet'});
 assert.deepEqual(s.consumeEvents().filter(e=>e.type==='combat-feedback').map(e=>e.kind),['explosion','melee']);
 s.damage(a,1000,ally,{kind:'bullet'});assert.equal(s.consumeEvents().filter(e=>e.type==='combat-feedback').length,0);
});
test('v045: red kill feedback has priority, expires and resets between worlds',()=>{
 assert.equal(typeof hit.HitFeedback,'function');const f=new hit.HitFeedback();f.reset(1);
 assert.ok(f.accept({feedbackId:1,time:1,killed:true},1));f.accept({feedbackId:2,time:1.01,killed:false},1);
 assert.equal(f.sample(1.1).state,'kill');assert.equal(f.sample(1.3).state,'none');
 assert.equal(f.accept({feedbackId:2,time:1.3,killed:true},1),false);f.reset(2);
 assert.equal(f.accept({feedbackId:3,time:2,killed:true},1),false);assert.equal(f.sample(2).state,'none');
});
test('v045: crosshair styles never hide hitmarker and enlarged geometry has a clear gap',()=>{
 assert.equal(typeof crosshair.crosshairGeometry,'function');
 for(const style of ['dot','cross','cross-dot','none'])for(const cs of [.5,1,2])for(const hs of [.5,1,2]){
  const g=crosshair.crosshairGeometry(style,cs,hs);assert.ok(g.hitInnerRadius>g.crossRadius+3);assert.ok(g.hitOuterRadius>g.hitInnerRadius);
 }
});
test('v045: frame nearest-rank p95/p99, literal FPS and invalid samples are distinct',()=>{
 const m=new PerformanceMonitor(8192,0);for(let i=1;i<=100;i++)m.record({frame:i,cpu:i/2,simulation:1,render:1},i*10);
 assert.equal(m.metrics.p95,95);assert.equal(m.metrics.p99,99);assert.equal(m.metrics.series.cpu.p95,47.5);assert.equal(m.metrics.series.cpu.p99,49.5);
 assert.equal(m.metrics.fpsAtP99,1000/99);assert.notEqual(m.metrics.fpsP99,m.metrics.fpsAtP99);
 m.record({frame:NaN,cpu:2},1001);assert.equal(m.count,100);
});
test('v045: samples are time bounded; stalls are retained; small p99 is unavailable',()=>{
 const m=new PerformanceMonitor(8192,0);m.record({frame:50,cpu:2},1);assert.equal(m.metrics.series.frame.p99,null);
 for(let i=1;i<=1650;i++)m.record({frame:1000/165,cpu:NaN},1+i*1000/165);
 assert.ok(m.count>1600);assert.equal(m.metrics.series.cpu.n,1);assert.equal(m.metrics.series.frame.max,50);
 m.record({frame:6,cpu:3},11000);assert.ok(m.metrics.series.frame.max<50);assert.ok(m.metrics.windowMs<=10000);
});
test('v045: interpolated transforms move between ticks but never mutate simulation',()=>{
 assert.equal(typeof presentation.PresentationState,'function');
 const a={id:'player',pos:{x:0,y:0,z:0},yaw:0,pitch:0,distance:0};const world={player:a,npcs:[],tanks:[],fieldGuns:[],grenades:[],shells:[],air:{planes:[],bombs:[]}};
 const p=new presentation.PresentationState(world);p.beforeTick(world);a.pos.x=1;p.afterTick(world);p.sample(.25);
 assert.equal(p.get('player').pos.x,.25);assert.equal(a.pos.x,1);p.sample(.75);assert.equal(p.get('player').pos.x,.75);
 p.reset(world);p.sample(.2);assert.equal(p.get('player').pos.x,1);
});
test('v045: peekLook does not consume input and clock reports alpha/dropped time',()=>{
 const input=Object.create(Input.prototype);input.mx=.1;input.my=.2;assert.equal(typeof input.peekLook,'function');
 assert.deepEqual(input.peekLook(),{lookX:.1,lookY:.2});assert.equal(input.mx,.1);
 const c=new FixedClock();c.advance(1/120,true,()=>{});assert.equal(c.alpha,.5);c.advance(1,true,()=>{});assert.ok(c.droppedMs>900);c.reset();assert.equal(c.alpha,0);
});
test('v045: grenade directions handle behind, above and side without mirroring',()=>{
 assert.equal(typeof projection.grenadeDirection,'function');const camera={pos:{x:0,y:0,z:0},yaw:0,pitch:0};
 assert.ok(projection.grenadeDirection({x:2,y:0,z:1},camera).x>0);
 assert.ok(projection.grenadeDirection({x:-2,y:0,z:1},camera).x<0);
 assert.ok(projection.grenadeDirection({x:0,y:0,z:-2},camera).y>0);
 assert.ok(projection.grenadeDirection({x:0,y:3,z:1},camera).y<0);
});
test('v045: layout produces disjoint reserved rectangles in standard viewports',()=>{
 assert.equal(typeof layout.arrangeHud,'function');
 for(const [width,height] of [[1280,720],[1920,1080],[2560,1440],[3440,1440]]){
  const boxes={health:{width:225,height:30},stance:{width:35,height:40},stamina:{width:90,height:4},ammo:{width:280,height:38},grenadeCount:{width:50,height:30},reload:{width:280,height:16},minimap:{width:220,height:265},objective:{width:220,height:140},subtitle:{width:650,height:65},critical:{width:360,height:20},interaction:{width:300,height:40},fps:{width:160,height:25}};
  const result=layout.arrangeHud({left:0,top:0,width,height},boxes,50);
  const r=Object.values(result.rects);for(let i=0;i<r.length;i++)for(let j=i+1;j<r.length;j++)assert.ok(!(r[i].left<r[j].right-.5&&r[i].right>r[j].left+.5&&r[i].top<r[j].bottom-.5&&r[i].bottom>r[j].top+.5),`${width}x${height}: ${i}/${j}`);
 }
});
