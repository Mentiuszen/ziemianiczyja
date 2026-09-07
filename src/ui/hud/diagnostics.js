import {t,hasKey,number} from '../../i18n/index.js';
import {VERSION} from '../../version.js';
const n=(v,d=2)=>Number.isFinite(v)?number(v,d):'—';
const status=s=>hasKey(`gpu.${s}`)?t(`gpu.${s}`):t('gpu.waiting');
export function updateDiagnostics(ui,world,view,metrics){
 const series=metrics.series||{},stats=view.renderStats||{},timer=view.gpuTimer;
 const row=(name,s)=>`${name.padEnd(13)} ${n(s?.avg).padStart(7)} ${n(s?.p95).padStart(7)} ${n(s?.p99).padStart(7)}`;
 const lines=[`${t('debug.title')} · v${VERSION}`,t('debug.samples',{n:metrics.sampleCount||0,seconds:n((metrics.windowMs||0)/1000,1)}),
  t('debug.fpsSummary',{avg:n(metrics.fps,1),p95:n(metrics.fpsAtP95,1),p99:n(metrics.fpsAtP99,1)}),
  t('debug.columns'),row(t('debug.frameLabel'),series.frame),row('CPU',series.cpu),row('GPU',metrics.gpu),
  t('debug.maximum',{frame:n(series.frame?.max),cpu:n(series.cpu?.max),gpu:n(metrics.gpu?.max)}),
  t('debug.gpuSamples',{status:status(timer?.status),n:metrics.gpu?.n||0,rate:timer?.sampleEvery||4}),
  ((metrics.gpu?.n||0)<100||(series.frame?.n||0)<100)?t('debug.insufficient'):((metrics.gpu?.n||0)<1000?t('debug.smallSample'):''),
  '',row(t('debug.simLabel'),series.simulation),row('A*',series.nav),row(t('debug.audioLabel'),series.audio),row(t('debug.eventsLabel'),series.events),row(t('debug.sceneLabel'),series.scene),row(t('debug.renderLabel'),series.render),row('HUD',series.hud),row(t('debug.profilerLabel'),series.profiler),
  row('CPU / RAF',series.cpuRaf),row(t('debug.rafLabel'),series.raf),
  t('debug.stalls',{budget:n(metrics.budgetMs),a:metrics.stalls?.overBudget15||0,b:metrics.stalls?.overBudget2||0,long:metrics.stalls?.over33||0}),
  t('debug.excess',{a:n(metrics.stalls?.excess15),b:n(metrics.stalls?.excess2),n:metrics.stalls?.over16||0}),
  t('debug.steps',{steps:ui.app.clock?.lastSteps||0,dropped:n(ui.app.clock?.droppedMs)}),
  t('debug.navDetails',{queue:world.nav.requests.length+(world.nav.activeJob?1:0),calls:world.nav.metrics?.pathCalls||0,visited:world.nav.metrics?.visited||0,ms:n(world.nav.metrics?.pathMs)}),
  t('debug.draw',{draws:stats.drawCalls||0,triangles:stats.triangles||0}),t('debug.meshes',{meshes:stats.activeMeshes||0,casters:stats.shadowCasters||0}),
  t('debug.animations',{lods:stats.lodCounts?.join('/')||'—',animations:stats.activeAnimatables||0}),
  t('debug.fpsLiteral',{p95:n(metrics.fpsP95,1),p99:n(metrics.fpsP99,1)}),
  t('debug.simulation',{time:n(world.time,1),phase:world.director.phase}),
  ...world.tanks.map(tank=>t('debug.tank',{id:tank.id,state:hasKey(`state.${tank.state}`)?t(`state.${tank.state}`):tank.state,shells:tank.ammunition,mg:tank.mgAmmo})),
  t('debug.gun',{state:t(`state.${world.fieldGuns[0]?.operational?'operational':'disabled'}`),planes:world.air.planes.length}),
  t('debug.captureState',{state:t(ui.app.performance.capture?.active?'debug.recording':'debug.notRecording')}),t('debug.limits')];
 ui.text('debug-text',lines.filter(x=>x!==undefined).join('\n'));ui.text('debug-controls',t('debug.keys'));
 const canvas=ui.el['debug-graph'],g=canvas.getContext('2d');if(!g)return;
 ui.graphHistory??=new Float64Array(240);const count=ui.app.performance.copyFrameHistory(ui.graphHistory),w=canvas.width,h=canvas.height;
 g.clearRect(0,0,w,h);g.fillStyle='#132219';g.fillRect(0,0,w,h);
 let max=33.34;for(let i=0;i<count;i++)max=Math.max(max,ui.graphHistory[i]);
 g.strokeStyle='#bf6754';g.beginPath();const y=h-(metrics.budgetMs||6)*h/max;g.moveTo(0,y);g.lineTo(w,y);g.stroke();
 g.strokeStyle='#a8d6b3';g.beginPath();for(let i=0;i<count;i++){const x=i*w/Math.max(1,count-1),y=h-ui.graphHistory[i]*h/max;i?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();
}
