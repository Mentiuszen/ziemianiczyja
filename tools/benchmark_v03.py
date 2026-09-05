"""A/B rendering benchmark. Run alone (no concurrent browser/generator/test jobs).
xvfb-run -a python tools/benchmark_v03.py --baseline /path/to/ziemia-niczyja-v0.2.0
Uses real vendored engines and assets, matching scripted inputs and camera positions; the v0.3 world is expanded,
viewport, camera and Medium preset. New preset's optimizations are deliberately included.
Software numbers describe THIS environment, not an RTX/Intel/AMD hardware benchmark.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import argparse,json,mimetypes,urllib.parse,shutil,statistics,platform,math
ap=argparse.ArgumentParser();ap.add_argument('--baseline',type=Path,required=True);ap.add_argument('--samples',type=int,default=45);args=ap.parse_args()
PROJECT=Path(__file__).resolve().parents[1];OUT=PROJECT/'docs/v0.3-tests';base='http://local.test/'
report={'viewport':[1280,720],'quality':'medium','renderScale':1,'samples':args.samples,'warmup':10,'renderer':'Chromium / ANGLE SwiftShader (software)','platform':platform.platform(),'method':'Same seed and input schedule, but v0.3 has a different, larger map and physics; this compares releases, NOT an isolated optimization. One 1/60 s simulation tick per measured frame; GPU/compositor paced requestAnimationFrame. CPU = tick + render submission, excludes HUD. Not a 60 FPS gameplay claim. Per-frame draw-counter differences, not accumulated engine counters.','runs':[]}
with sync_playwright() as p:
 for scene_name in ['trench-start','battle-25-seconds']:
  for label,root in [('v0.2',args.baseline),('v0.3',PROJECT)]:
   errors=[];b=p.chromium.launch(executable_path=shutil.which('chromium'),headless=True,args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']);page=b.new_page(viewport={'width':1280,'height':720});report['browser']=b.version;page.on('pageerror',lambda e:errors.append(str(e)))
   def route(r):
    f=root/urllib.parse.urlparse(r.request.url).path.lstrip('/');r.fulfill(status=200 if f.is_file() else 404,body=f.read_bytes() if f.is_file() else b'missing',headers={'Content-Type':mimetypes.guess_type(f)[0] or 'application/octet-stream','Access-Control-Allow-Origin':'*'})
   page.route('http://local.test/**',route)
   page.set_content((root/'index.html').read_text().replace('<head>',f'<head><base href="{base}"><script>window.__ZN_TEST_MODE__=true</script>'),wait_until='networkidle');page.wait_for_function('window.ZiemiaNiczyja')
   page.evaluate("() => {const a=__ZN_TEST__.app;a.settings.quality='medium';a.settings.renderScale=1;a.start();}");page.wait_for_function("ZiemiaNiczyja.state==='ready'||ZiemiaNiczyja.state==='error'",timeout=65000);assert page.evaluate('ZiemiaNiczyja.state')=='ready',page.evaluate('__ZN_TEST__.app.errorMessage')
   page.evaluate("""(battle) => {const a=__ZN_TEST__.app;a.alive=false;cancelAnimationFrame(a.raf);a.ui.menu.hidden=true;a.ui.hud.hidden=true;a.view.setDiagnosticsEnabled?.(false);const w=a.world;if(battle){w.tick(1/60,{interact:true});for(let i=0;i<1500;i++)w.tick(1/60,{});w.consumeEvents();w.player.pos.x=-8;w.player.pos.z=29;w.player.pos.y=w.terrain.height(-8,29);}w.player.yaw=0;w.player.pitch=battle?-.035:0;a.view.render(false);} """,scene_name!='trench-start')
   page.evaluate("""(samples) => {const a=__ZN_TEST__.app,v=a.view,w=a.world;window.benchmark={done:false,rows:[]};let frame=0,last;function run(now){const before=performance.now(),draws=v.engine._drawCalls.current;w.tick(1/60,{});for(const e of w.consumeEvents())v.event(e);const sim=performance.now()-before;v.render(true);const cpu=performance.now()-before;const row={frameMs:last?now-last:0,cpuMs:cpu,simulationMs:sim,renderMs:cpu-sim,drawCalls:v.engine._drawCalls.current-draws,triangles:v.scene.getActiveIndices()/3,activeMeshes:v.scene.getActiveMeshes().length,animatables:v.scene._activeAnimatables.length};last=now;if(frame++>=10)benchmark.rows.push(row);if(benchmark.rows.length<samples)requestAnimationFrame(run);else{benchmark.state={time:w.time,phase:w.director.phase,alive:w.npcs.filter(n=>n.hp>0).length,stats:w.stats};benchmark.geometry={};for(const mesh of v.scene.getActiveMeshes().data.slice(0,v.scene.getActiveMeshes().length)){const cat=mesh.name.startsWith('terrain')?'terrain':mesh.name.startsWith('static:')||mesh.name.startsWith('batch-')?'static':/uk-|de-/.test(mesh.name)?'infantry':mesh.name;benchmark.geometry[cat]=(benchmark.geometry[cat]||0)+mesh.getTotalIndices()/3;}benchmark.done=true;}}requestAnimationFrame(run);} """,args.samples)
   page.wait_for_function('benchmark.done',timeout=150000);data=page.evaluate('benchmark');assert not errors,errors
   summary={};rows=data['rows']
   for key in rows[0]:
    values=sorted(row[key] for row in rows);summary[key]={'mean':statistics.mean(values),'p95':values[min(len(values)-1,math.ceil(len(values)*.95)-1)]}
   summary['fps']=1000/summary['frameMs']['mean'];run={'version':label,'scene':scene_name,'summary':summary,'state':data['state'],'geometry':data['geometry'],'samples':rows};report['runs'].append(run);(OUT/'benchmark-ab.json').write_text(json.dumps(report,indent=2));print(label,scene_name,json.dumps(summary),flush=True)
   page.screenshot(path=str(OUT/f'benchmark-{label}-{scene_name}.png'));b.close()
 report['completed']=True;(OUT/'benchmark-ab.json').write_text(json.dumps(report,indent=2));print('BENCHMARK COMPLETE',flush=True)
