"""Offline Playwright + Chromium integration tests (optional developer tooling).
Real files are routed under a base URL because creation-environment admin policy
blocks navigation. Opaque origin means this does NOT verify persistent IndexedDB.
Run under Xvfb on headless Linux; --dist --prefix repo exercises a static subpath.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import argparse,json,mimetypes,urllib.parse,shutil
ap=argparse.ArgumentParser();ap.add_argument('--dist',action='store_true');ap.add_argument('--prefix',default='');ap.add_argument('--cycles',type=int,default=10);args=ap.parse_args()
PROJECT=Path(__file__).resolve().parents[1];ROOT=PROJECT/'dist' if args.dist else PROJECT;OUT=PROJECT/'docs/v0.4-tests/lifecycle';OUT.mkdir(parents=True,exist_ok=True)
base='http://local.test/'+(args.prefix.strip('/')+'/' if args.prefix else '')
report={'mode':'dist' if args.dist else 'source','prefix':args.prefix,'origin':'opaque document + routed actual files','renderer':'Chromium / SwiftShader (software)','cycles':[],'errors':[],'missing':[]}
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=shutil.which('chromium'),headless=False,args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 report['browser']=browser.version;page=browser.new_page(viewport={'width':960,'height':600});requests=[];fail_asset=False
 page.on('pageerror',lambda e:report['errors'].append(str(e)))
 page.on('request',lambda r:requests.append(r.url))
 def route(r):
  url=urllib.parse.urlparse(r.request.url);path=url.path[len(urllib.parse.urlparse(base).path):];f=ROOT/path
  if fail_asset and path.endswith('british.glb'):r.fulfill(status=404,body='Intentional test failure');return
  if f.is_file():r.fulfill(body=f.read_bytes(),headers={'Access-Control-Allow-Origin':'*','Content-Type':mimetypes.guess_type(f)[0] or 'application/octet-stream'})
  else:report['missing'].append(r.request.url);r.fulfill(status=404,body='missing')
 page.route('http://local.test/**',route)
 html=(ROOT/'index.html').read_text().replace('<head>',f'<head><base href="{base}"><script>window.__ZN_TEST_MODE__=true</script>')
 page.set_content(html,wait_until='networkidle');page.wait_for_function('window.ZiemiaNiczyja !== undefined');page.locator('#choose-pl').click() if page.locator('#choose-pl').count() else None
 report['menu']=page.evaluate('ZiemiaNiczyja.inspect()');report['menuRequests']=len(requests);assert report['menu']['missionScenes']==0 and report['menu']['npcs']==0;page.screenshot(path=str(OUT/'menu.png'))
 page.locator('[data-action="settings"]').click();page.locator('select[data-setting="quality"]').select_option('low');page.locator('[data-action="back"]').click()
 page.locator('[data-action="controls"]').click();page.locator('[data-action="bind"][data-key="crouch"]').click();page.keyboard.press('X');assert page.evaluate('__ZN_TEST__.app.settings.keys.crouch')=='KeyX';page.locator('[data-action="keys-reset"]').click();page.locator('[data-action="back"]').click();report['settingsAndRebind']=True
 cdp=page.context.new_cdp_session(page)
 for i in range(args.cycles):
  page.locator('[data-action="brief"]').click();page.locator('[data-action="start"]').click();page.wait_for_function("ZiemiaNiczyja.state==='ready'||ZiemiaNiczyja.state==='error'",timeout=60000)
  assert page.evaluate('ZiemiaNiczyja.state')=='ready',page.evaluate('__ZN_TEST__.app.errorMessage')
  loaded=page.evaluate('ZiemiaNiczyja.inspect()');assert loaded['npcs']==38 and loaded['missionScenes']==1
  page.locator('[data-action="enter"]').click();page.wait_for_function("ZiemiaNiczyja.state==='playing'",timeout=10000)
  if i==0:
   page.keyboard.press('KeyE');page.wait_for_timeout(650);page.mouse.click(480,300);page.wait_for_function('__ZN_TEST__.app.world.player.weapon.mag===9');assert page.evaluate('__ZN_TEST__.app.world.player.weapon.mag')==9
   page.keyboard.press('KeyC');page.wait_for_function("__ZN_TEST__.app.world.player.stance==='crouch'");assert page.evaluate('__ZN_TEST__.app.world.player.stance')=='crouch';page.keyboard.press('KeyC');page.keyboard.press('KeyG');page.wait_for_function('__ZN_TEST__.app.world.player.grenades===2');assert page.evaluate('__ZN_TEST__.app.world.player.grenades')==2;report['pointerLockAndInputs']=True
   page.screenshot(path=str(OUT/'game.png'));page.keyboard.press('Escape');page.wait_for_function("ZiemiaNiczyja.state==='paused'");paused=page.evaluate('ZiemiaNiczyja.inspect().time');page.wait_for_timeout(500);assert page.evaluate('ZiemiaNiczyja.inspect().time')==paused;report['pauseTimeFrozen']=True
   page.locator('[data-action="enter"]').click();page.wait_for_function("ZiemiaNiczyja.state==='playing'");page.evaluate("window.dispatchEvent(new Event('blur'))");page.wait_for_function("ZiemiaNiczyja.state==='paused'");report['blurPauses']=True
  else:page.keyboard.press('Escape');page.wait_for_function("ZiemiaNiczyja.state==='paused'")
  if i==1:
   page.evaluate("async () => {const a=__ZN_TEST__.app,{updateAirSupport}=await import('./src/vehicles/air-support.js');a.world.director.skipBriefing(a.world);a.world.time=19;updateAirSupport(a.world,.01);a.events();a.view.render(false);}");assert page.evaluate('__ZN_TEST__.app.view.support.planes.size')>0;report['aircraftResourcesCreatedAndDisposed']=True
  page.locator('[data-action="exit"]').click();page.wait_for_function("ZiemiaNiczyja.state==='main'");cdp.send('HeapProfiler.collectGarbage');unloaded=page.evaluate('ZiemiaNiczyja.inspect()')
  actual=page.evaluate(f"async()=>{{const {{Engine}}=await import('{base}src/render/babylon.js');return {{engines:Engine.Instances.length,scenes:Engine.Instances.reduce((a,e)=>a+e.scenes.length,0)}}}}")
  assert unloaded['missionScenes']==0 and unloaded['activeAudio']==0 and actual['engines']==0
  heap=cdp.send('Runtime.getHeapUsage');report['cycles'].append({'cycle':i+1,'loadedMeshes':loaded['meshes'],'enginesAfterExit':actual['engines'],'scenesAfterExit':actual['scenes'],'audioAfterExit':unloaded['activeAudio'],'heapUsedBytes':heap['usedSize']});print('cycle',i+1,report['cycles'][-1],flush=True)
 fail_asset=True;page.locator('[data-action="brief"]').click();page.locator('[data-action="start"]').click();page.wait_for_function("ZiemiaNiczyja.state==='error'",timeout=30000);report['assetErrorVisible']=page.evaluate('__ZN_TEST__.app.errorMessage');assert report['assetErrorVisible'];page.locator('[data-action="exit"]').click();fail_asset=False
 report['requests']=len(requests);report['externalRequests']=[url for url in requests if not url.startswith(base)];assert not report['missing'];assert not report['errors'];assert not report['externalRequests'];report['storageFallbackWarning']=page.evaluate('ZiemiaNiczyja.inspect().storageWarning');report['passed']=True
 filename=('dist-'+(args.prefix or 'root') if args.dist else 'source')+'.json';(OUT/filename).write_text(json.dumps(report,ensure_ascii=False,indent=2));print('PASS',filename,flush=True);browser.close()
