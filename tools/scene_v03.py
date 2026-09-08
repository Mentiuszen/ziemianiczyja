"""Actual renderer screenshots at explicit camera positions; not an FPS benchmark."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import mimetypes,urllib.parse,shutil,json,math
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'docs/v0.3-tests';OUT.mkdir(exist_ok=True)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=shutil.which('chromium'),headless=True,args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']);page=b.new_page(viewport={'width':1280,'height':720});err=[];missing=[];page.on('pageerror',lambda e:err.append(str(e)));page.on('console',lambda m: print(m.type,m.text[:350],flush=True) if m.type=='error' else None)
 def route(r):
  f=ROOT/urllib.parse.urlparse(r.request.url).path.lstrip('/')
  if not f.is_file():missing.append(str(f))
  r.fulfill(status=200 if f.is_file() else 404,body=f.read_bytes() if f.is_file() else b'missing',headers={'Content-Type':mimetypes.guess_type(f)[0] or 'application/octet-stream','Access-Control-Allow-Origin':'*'})
 page.route('http://local.test/**',route)
 page.set_content((ROOT/'index.html').read_text().replace('<head>','<head><base href="http://local.test/"><script>window.__ZN_TEST_MODE__=true</script>'),wait_until='networkidle');page.wait_for_function('window.__ZN_TEST__');page.evaluate("__ZN_TEST__.app.settings.quality='low';__ZN_TEST__.app.start()")
 page.wait_for_function("['ready','error'].includes(__ZN_TEST__.app.state)",timeout=100000);print('state',page.evaluate('ZiemiaNiczyja.state'),err,missing,flush=True)
 if page.evaluate('ZiemiaNiczyja.state')=='error':raise Exception(page.evaluate('__ZN_TEST__.app.errorMessage'))
 page.evaluate("() => {let a=__ZN_TEST__.app;a.ui.menu.hidden=true; a.ui.hud.hidden=true;document.querySelector('#toast').style.display='none';}")
 for x,z,yaw,pitch,name in [(1,3,0,-.06,'start'),(7,155,-.45,.03,'room'),(-61,148,-.45,.02,'farm'),(44,94,0,-.03,'field')]:
  page.evaluate("async ([x,z,yaw,pitch]) => {let a=__ZN_TEST__.app;a.world.player.pos={x,y:a.world.terrain.height(x,z),z};a.world.player.yaw=yaw;a.world.player.pitch=pitch;a.view.applySettings({...a.settings,quality:'high'});for(let i=0;i<6;i++){a.view.render(false);await new Promise(requestAnimationFrame);}}",[x,z,yaw,pitch]);page.wait_for_timeout(300);page.screenshot(path=str(OUT/f'v03-{name}.png'));print(name,page.evaluate('ZiemiaNiczyja.inspect().metrics'),flush=True)
 # A close first-person Lewis and a renderer-only timed blast review.
 page.evaluate("""async () => {const a=__ZN_TEST__.app,{Weapon}=await import('./src/combat/weapon.js');a.world.player.weapons[1]=new Weapon('lewis',47,94);a.world.player.slot=1;const p=a.world.player;p.pos={x:7,y:a.world.terrain.height(7,155),z:155};p.yaw=-.45;p.pitch=.03;a.view.render(false);}""")
 page.wait_for_timeout(350);page.screenshot(path=str(OUT/'v03-lewis.png'))
 page.evaluate("""() => {const a=__ZN_TEST__.app,p=a.world.player;p.slot=0;p.pos={x:44,y:a.world.terrain.height(44,94),z:94};p.yaw=0;p.pitch=.10;a.view.render(false);const pos={x:44,y:a.world.terrain.height(44,101)+.05,z:101};a.view.effects.event({type:'explosion',pos});a.view.effects.update(a.world,.045);a.view.render(false);}""");page.wait_for_timeout(300);page.screenshot(path=str(OUT/'v03-explosion-flash.png'))
 page.evaluate("() => {const a=__ZN_TEST__.app;a.view.effects.update(a.world,.28);a.view.render(false);}");page.wait_for_timeout(300);page.screenshot(path=str(OUT/'v03-explosion-dust.png'))
 print('errors',err,'missing',missing,flush=True);assert not err;assert not missing;b.close()
