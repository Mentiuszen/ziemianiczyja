from browser_v044_ui import open_new
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,mimetypes,urllib.parse,shutil
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'docs/v0.4-tests';OUT.mkdir(exist_ok=True)
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path=shutil.which('chromium'),headless=False,args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']);page=b.new_page(viewport={'width':1280,'height':720});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 def route(r):
  f=ROOT/urllib.parse.urlparse(r.request.url).path.lstrip('/');r.fulfill(status=200 if f.is_file() else 404,body=f.read_bytes() if f.is_file() else b'missing',headers={'Content-Type':mimetypes.guess_type(f)[0] or 'application/octet-stream','Access-Control-Allow-Origin':'*'})
 page.route('http://local.test/**',route)
 page.set_content((ROOT/'index.html').read_text().replace('<head>','<head><base href="http://local.test/"><script>window.__ZN_TEST_MODE__=true</script>'),wait_until='networkidle');page.wait_for_function('window.ZiemiaNiczyja');page.locator('#choose-pl').click() if page.locator('#choose-pl').count() else None;page.evaluate("__ZN_TEST__.app.settings.quality='low'")
 open_new(page);page.wait_for_function("ZiemiaNiczyja.state==='ready'||ZiemiaNiczyja.state==='error'",timeout=65000);print('state',page.evaluate('ZiemiaNiczyja.state'),'errors',errors,flush=True)
 if page.evaluate('ZiemiaNiczyja.state')!='ready':print(page.evaluate('__ZN_TEST__.app.errorMessage'));b.close();raise SystemExit(1)
 page.locator('[data-action="enter"]').click();page.wait_for_function("ZiemiaNiczyja.state==='playing'")
 page.mouse.down(button='right');page.wait_for_function('__ZN_TEST__.app.world.player.ads');before=page.evaluate('__ZN_TEST__.app.world.player.yaw');page.mouse.move(620,330);page.mouse.move(780,355,steps=8);page.wait_for_timeout(300);after=page.evaluate('__ZN_TEST__.app.world.player.yaw');print('aim look delta',after-before,flush=True);page.mouse.up(button='right')
 page.keyboard.press('Escape');page.wait_for_function("ZiemiaNiczyja.state==='paused'")
 page.evaluate("() => {const a=__ZN_TEST__.app;a.world.player.yaw=0;a.world.player.pitch=.03;a.ui.menu.hidden=true;a.ui.hud.hidden=false;a.view.render(false);a.ui.update(a.world,a.view,a.metrics);}");page.screenshot(path=str(OUT/'briefing-first.png'))
 for x,y,z,yaw,pitch,name in [(34,1.8,114,3.14,.13,'fieldgun-rear'),(36,1.8,105,0,.10,'fieldgun-front'),(20,2,24,-.8,.06,'tank-start')]:
  page.evaluate("([x,y,z,yaw,pitch])=>{const a=__ZN_TEST__.app;a.world.player.pos={x,y,z};a.world.player.yaw=yaw;a.world.player.pitch=pitch;a.ui.hud.hidden=true;a.view.fpRoot.setEnabled(false);a.view.render(false)}",[x,y,z,yaw,pitch]);page.wait_for_timeout(80);page.screenshot(path=str(OUT/(name+'.png')))
 print('errors',errors,flush=True);(OUT/'probe.json').write_text(json.dumps({'errors':errors,'aimLookDelta':after-before,'inspect':page.evaluate('ZiemiaNiczyja.inspect()')},indent=2));b.close()
