"""Actual game renderer inspection. Scripted camera/model placement is explicitly not gameplay."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,mimetypes,urllib.parse,shutil
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'docs/v0.4-tests';OUT.mkdir(exist_ok=True)
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path=shutil.which('chromium'),headless=False,args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']);page=b.new_page(viewport={'width':1280,'height':720});errors=[];missing=[];page.on('pageerror',lambda e:errors.append(str(e)))
 def route(r):
  f=ROOT/urllib.parse.urlparse(r.request.url).path.lstrip('/')
  if not f.is_file():missing.append(str(f))
  r.fulfill(status=200 if f.is_file() else 404,body=f.read_bytes() if f.is_file() else b'missing',headers={'Content-Type':mimetypes.guess_type(f)[0] or 'application/octet-stream','Access-Control-Allow-Origin':'*'})
 page.route('http://local.test/**',route)
 page.set_content((ROOT/'index.html').read_text().replace('<head>','<head><base href="http://local.test/"><script>window.__ZN_TEST_MODE__=true</script>'),wait_until='networkidle');page.wait_for_function('window.__ZN_TEST__');page.locator('#choose-pl').click() if page.locator('#choose-pl').count() else None;page.evaluate("__ZN_TEST__.app.settings.quality='high';__ZN_TEST__.app.start()")
 page.wait_for_function("['ready','error'].includes(ZiemiaNiczyja.state)",timeout=65000);assert page.evaluate('ZiemiaNiczyja.state')=='ready'
 page.evaluate("() => {const a=__ZN_TEST__.app;a.ui.menu.hidden=true;a.ui.hud.hidden=true;document.querySelector('#toast').style.display='none';a.world.player.ads=false;a.settings.showFps=false;a.settings.showCpu=false;a.settings.showGpu=false;}")
 def shot(pos,target,name,hud=False):
  page.evaluate("""async ([pos,target,hud])=>{const a=__ZN_TEST__.app,p=a.world.player;p.pos=pos;p.yaw=Math.atan2(target.x-pos.x,target.z-pos.z);p.pitch=-Math.atan2(target.y-pos.y-1.61,Math.hypot(target.x-pos.x,target.z-pos.z));a.ui.menu.hidden=true;a.ui.hud.hidden=!hud;a.ui.update(a.world,a.view,a.metrics);for(let i=0;i<4;i++){a.view.render(false);await new Promise(requestAnimationFrame);}}""",[pos,target,hud]);page.wait_for_timeout(220);page.screenshot(path=str(OUT/(name+'.png')));print(name,flush=True)
 page.evaluate('__ZN_TEST__.app.world.director.briefingTime=2')
 shot({'x':32.4,'y':.3023477,'z':-9.65},{'x':33.4,'y':1.55,'z':-5.4},'briefing-high',True)
 page.evaluate('__ZN_TEST__.app.world.director.skipBriefing(__ZN_TEST__.app.world)')
 shot({'x':31,'y':1.4,'z':102.5},{'x':36,'y':2,'z':110},'artillery-high')
 # Place the real GLB support assets in an inspection pass, not an invented screenshot of normal flight.
 for model,name in [('dh5','dh5-inspection'),('dfw','dfw-inspection')]:
  page.evaluate("""model=>{const a=__ZN_TEST__.app;a.world.air.planes=[{id:'inspection-'+model,model,pos:{x:8,y:12,z:25},velocity:{x:0,y:0,z:45},age:1,life:20,yaw:-.3,bank:.02,faction:model==='dh5'?'uk':'de'}];a.world.player.slot=0;a.view.fpRoot.setEnabled(false);}""",model)
  shot({'x':14,'y':13,'z':33},{'x':8,'y':13.3,'z':25},name)
 page.evaluate('__ZN_TEST__.app.world.air.planes=[]')
 # Review both sides of an actual authored sandbag wall, including its full collider height.
 bags=page.evaluate("() => {const w=__ZN_TEST__.app.world;return w.layout.filter(b=>b.mat==='bags').slice(0,3).map(b=>({x:b.x,y:b.y,z:b.z,w:b.w,h:b.h,d:b.d}));}")
 assert bags,'No physical sandbag descriptors for visual review'
 print('sandbag descriptor',bags[:1],flush=True)
 if bags:
  b0=bags[0]
  for side in [-1,1]:shot({'x':b0['x']+1.1,'y':b0['y']-1.2,'z':b0['z']+side*3.6},{'x':b0['x'],'y':b0['y'],'z':b0['z']},'sandbags-'+('front' if side<0 else 'back'))
 assert not errors,errors;assert not missing,missing
 (OUT/'showcase.json').write_text(json.dumps({'errors':errors,'missing':missing,'quality':'high','note':'scripted inspection cameras; two aircraft temporarily placed for close model review'},indent=2));b.close()
