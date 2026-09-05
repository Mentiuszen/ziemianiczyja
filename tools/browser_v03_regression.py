"""v0.3 real-Chromium regressions. Run: xvfb-run -a python tools/browser_v03_regression.py
Uses routed local files because the authoring environment blocks URL navigation.
Opaque origin is deliberate: storage persistence is NOT claimed by this test.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import argparse,json,mimetypes,urllib.parse,shutil,math
from PIL import Image,ImageStat
ap=argparse.ArgumentParser();ap.add_argument('--dist',action='store_true');ap.add_argument('--prefix',default='');args=ap.parse_args()
PROJECT=Path(__file__).resolve().parents[1];ROOT=PROJECT/'dist' if args.dist else PROJECT;OUT=PROJECT/'docs/v0.3-tests';OUT.mkdir(parents=True,exist_ok=True)
base='http://local.test/'+(args.prefix.strip('/')+'/' if args.prefix else '')
report={'mode':'dist' if args.dist else 'source','prefix':args.prefix,'renderer':'SwiftShader / software','origin':'opaque / routed actual files','layout':[],'errors':[],'missing':[],'checks':{}}
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=shutil.which('chromium'),headless=True,args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']);page=b.new_page(viewport={'width':1280,'height':720});report['browser']=b.version
 page.on('pageerror',lambda e:report['errors'].append(str(e)))
 def route(r):
  path=urllib.parse.urlparse(r.request.url).path[len(urllib.parse.urlparse(base).path):];f=ROOT/path
  if not f.is_file():report['missing'].append(path)
  r.fulfill(status=200 if f.is_file() else 404,body=f.read_bytes() if f.is_file() else b'missing',headers={'Content-Type':mimetypes.guess_type(f)[0] or 'application/octet-stream','Access-Control-Allow-Origin':'*'})
 page.route('http://local.test/**',route)
 page.set_content((ROOT/'index.html').read_text().replace('<head>',f'<head><base href="{base}"><script>window.__ZN_TEST_MODE__=true</script>'),wait_until='networkidle');page.wait_for_function('window.ZiemiaNiczyja')
 for width,height in [(320,568),(390,844),(800,400),(1024,600),(1280,720),(1366,768),(1920,1080),(2560,1440)]:
  page.set_viewport_size({'width':width,'height':height});page.evaluate("__ZN_TEST__.app.go('main')");page.wait_for_timeout(40)
  result=page.evaluate("""() => { const s=document.querySelector('.screen');return {viewport:[innerWidth,innerHeight],screen:[s.clientWidth,s.clientHeight,s.scrollWidth,s.scrollHeight],buttons:[...document.querySelectorAll('.menu-actions button')].map(e=>{const r=e.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {action:e.dataset.action,rect:[r.x,r.y,r.right,r.bottom],reachable:e===hit||e.contains(hit)};})}; }""")
  assert result['screen'][:2]==result['screen'][2:],result
  for button in result['buttons']:
   x,y,right,bottom=button['rect'];assert x>=0 and y>=0 and right<=width+1 and bottom<=height+1 and button['reachable'],(width,height,button)
  page.mouse.wheel(1800,1800);assert page.evaluate("document.querySelector('.screen').scrollTop+document.querySelector('.screen').scrollLeft")==0
  page.locator('[data-action="settings"]').click();page.locator('[data-action="back"]').scroll_into_view_if_needed();page.locator('[data-action="back"]').click();assert page.evaluate('ZiemiaNiczyja.state')=='main'
  report['layout'].append(result)
 print('LAYOUT PASS',len(report['layout']),flush=True)
 page.set_viewport_size({'width':1280,'height':720});page.screenshot(path=str(OUT/'menu-v03.png'))
 # Keep interaction tests affordable in a software renderer; this is not the benchmark.
 page.set_viewport_size({'width':960,'height':600});page.locator('[data-action="settings"]').click();page.locator('[data-setting="quality"]').select_option('low');page.locator('[data-setting="showCpu"]').check();page.locator('[data-setting="showGpu"]').check();page.locator('[data-action="back"]').click()
 page.locator('[data-action="brief"]').click();page.locator('[data-action="start"]').click();page.wait_for_function("ZiemiaNiczyja.state==='ready'||ZiemiaNiczyja.state==='error'",timeout=65000);assert page.evaluate('ZiemiaNiczyja.state')=='ready',page.evaluate('__ZN_TEST__.app.errorMessage')
 page.locator('[data-action="enter"]').click();page.wait_for_function("ZiemiaNiczyja.state==='playing'");assert page.evaluate("document.pointerLockElement===__ZN_TEST__.app.canvas")
 page.mouse.down(button='right');page.wait_for_function('__ZN_TEST__.app.world.player.ads');page.mouse.down(button='left');page.wait_for_function('__ZN_TEST__.app.world.player.weapon.mag===9');page.mouse.up(button='left');assert page.evaluate('__ZN_TEST__.app.world.player.ads');page.mouse.up(button='right');page.wait_for_function('!__ZN_TEST__.app.world.player.ads');report['checks']['rightThenLeftRealMouse']=True
 page.wait_for_function('__ZN_TEST__.app.world.player.weapon.cooldown<=0',timeout=20000)
 page.mouse.down(button='left');page.wait_for_function('__ZN_TEST__.app.world.player.weapon.mag===8');page.mouse.down(button='right');page.wait_for_function('__ZN_TEST__.app.world.player.ads');page.mouse.up(button='left');assert page.evaluate('__ZN_TEST__.app.world.player.ads');page.mouse.up(button='right');page.wait_for_function('!__ZN_TEST__.app.world.player.ads');report['checks']['leftThenRightRealMouse']=True
 page.wait_for_function("__ZN_TEST__.app.view.gpuTimer.status==='ready'",timeout=30000)
 gpu=page.evaluate('({ms:__ZN_TEST__.app.view.gpuTimer.milliseconds,pending:__ZN_TEST__.app.view.gpuTimer.pending.length,status:__ZN_TEST__.app.view.gpuTimer.status})');assert gpu['ms']>=0 and gpu['pending']<=4;report['gpuQuery']=gpu
 overlay=page.locator('.performance-overlay').inner_text();assert all(t in overlay for t in ['FPS','CPU','GPU']);report['overlay']=overlay
 # Pause while a button is held; resume must not inherit fire/aim.
 page.mouse.down(button='right');page.wait_for_function('__ZN_TEST__.app.world.player.ads');page.keyboard.press('Escape');page.wait_for_function("ZiemiaNiczyja.state==='paused'");paused=page.evaluate('ZiemiaNiczyja.inspect().time');page.mouse.up(button='right');page.wait_for_timeout(350);assert page.evaluate('ZiemiaNiczyja.inspect().time')==paused;assert page.evaluate('__ZN_TEST__.app.input.buttons.size')==0;assert page.evaluate('__ZN_TEST__.app.view.gpuTimer.pending.length')==0
 page.locator('[data-action="enter"]').click();page.wait_for_function("ZiemiaNiczyja.state==='playing'");page.wait_for_timeout(350);assert page.evaluate('__ZN_TEST__.app.world.player.weapon.mag')==8;assert not page.evaluate('__ZN_TEST__.app.world.player.ads');report['checks']['pauseResumeNoHeldInput']=True
 page.keyboard.press('F3');page.wait_for_timeout(450);assert page.evaluate('__ZN_TEST__.app.ui.debug');report['debugText']=page.locator('.debug-panel').inner_text();assert 'Draw calls' in report['debugText'];page.keyboard.press('F3')
 page.keyboard.press('Escape');page.wait_for_function("ZiemiaNiczyja.state==='paused'");page.locator('[data-action="checkpoint"]').click();page.wait_for_function("ZiemiaNiczyja.state==='ready'||ZiemiaNiczyja.state==='error'",timeout=65000);assert page.evaluate('ZiemiaNiczyja.state')=='ready';assert page.evaluate('ZiemiaNiczyja.inspect().npcs')==28;page.locator('[data-action="enter"]').click();page.wait_for_function("ZiemiaNiczyja.state==='playing'");page.mouse.down(button='right');page.mouse.click(480,300);page.wait_for_function('__ZN_TEST__.app.world.player.weapon.mag===9');assert page.evaluate('__ZN_TEST__.app.world.player.ads');page.mouse.up(button='right');report['checks']['checkpointThenAimAndFire']=True
 page.keyboard.press('Escape');page.wait_for_function("ZiemiaNiczyja.state==='paused'")
 # Render-only probes: separate from the real gameplay input tests above.
 page.evaluate("() => {const a=__ZN_TEST__.app;a.menuWas=a.state;a.ui.menu.hidden=true;a.ui.hud.hidden=true;}")
 sky=[]
 for yaw,pitch,name in [(0,-1.35,'zenith'),(math.pi/2,-.8,'east'),(math.pi,-.4,'south'),(3*math.pi/2,-1.3,'west-zenith')]:
  page.evaluate("([yaw,pitch])=>{const a=__ZN_TEST__.app;a.world.player.yaw=yaw;a.world.player.pitch=pitch;a.view.render(false);}",[yaw,pitch]);page.wait_for_timeout(180);path=OUT/('sky-'+name+'.png');page.screenshot(path=str(path));image=Image.open(path).convert('RGB');crop=image.crop((image.width//3,25,image.width*2//3,image.height//3));stat=ImageStat.Stat(crop);assert max(stat.mean)<238,(name,stat.mean);sky.append({'view':name,'mean':stat.mean,'stddev':stat.stddev})
 report['sky']=sky
 report['qualities']=[]
 for quality in ['medium','high','ultra','low']:
  result=page.evaluate("""async quality => {const a=__ZN_TEST__.app,v=a.view;a.world.player.pitch=-.05;a.world.player.yaw=0;v.applySettings({...a.settings,quality});for(let i=0;i<4;i++){v.render(false);await new Promise(requestAnimationFrame);}return {quality:v.quality,shadow:!!v.shadow,shadowSize:v.shadow?.getShadowMap().getSize().width||0,npcs:a.world.npcs.length,lodCounts:v.renderStats.lodCounts,activeMeshes:v.renderStats.activeMeshes,normalMap:!!v.mats.earth.bumpTexture};}""",quality)
  assert result['npcs']==28 and sum(result['lodCounts'])==28,result
  assert result['shadowSize']=={'low':0,'medium':1024,'high':2048,'ultra':4096}[quality],result
  assert result['normalMap']==(quality!='low'),result
  report['qualities'].append(result)
  page.screenshot(path=str(OUT/('quality-'+quality+'.png')))
 lod=page.evaluate("""() => { const a=__ZN_TEST__.app;a.world.player.pitch=0;a.world.player.yaw=0;a.view.render(false);return [...a.view.units.values()].map(m=>({level:m.lod,enabled:m.meshes.filter(x=>/lod[012]/.test(x.name)&&x.isEnabled()).length})); }""");assert all(m['enabled']==1 for m in lod);assert len(set(m['level'] for m in lod))==3;report['checks']['singleVisibleLODPerSoldier']=True
 # Cosmetic health feedback uses simulation time and can be disabled.
 health=page.evaluate("""() => {const a=__ZN_TEST__.app,p=a.world.player;a.world.damage(p,82/a.world.difficulty.incoming,{id:'de-probe',faction:'de',pos:{x:p.pos.x+Math.cos(p.yaw)*5,y:p.pos.y,z:p.pos.z-Math.sin(p.yaw)*5}});a.settings.damageEffects=1;a.ui.update(a.world,a.view,a.metrics);return {vignette:+document.querySelector('#damage').style.opacity,direction:+document.querySelector('#damage-direction').style.opacity,filter:a.canvas.style.filter,warning:!document.querySelector('#critical-health').hidden,rotation:document.querySelector('#damage-direction').style.transform,time:a.world.time};}""")
 assert 0<health['vignette']<=.78 and health['direction']>0 and health['warning'] and 'saturate' in health['filter'],health
 page.wait_for_timeout(300);assert page.evaluate('__ZN_TEST__.app.world.time')==health['time']
 page.evaluate("() => {const a=__ZN_TEST__.app;a.ui.hud.hidden=false;a.ui.menu.hidden=true;}");page.screenshot(path=str(OUT/'damage-feedback.png'))
 disabled=page.evaluate("""() => {const a=__ZN_TEST__.app;a.settings.damageEffects=0;a.ui.update(a.world,a.view,a.metrics);return {opacity:+document.querySelector('#damage').style.opacity,filter:a.canvas.style.filter,hidden:document.querySelector('#critical-health').hidden};}""")
 assert disabled=={'opacity':0,'filter':'none','hidden':True},disabled
 report['health']={'enabled':health,'disabled':disabled}
 page.evaluate("() => {const a=__ZN_TEST__.app;a.settings.damageEffects=1;a.world.player.health.hp=100;a.world.player.hurt=0;a.ui.update(a.world,a.view,a.metrics);a.ui.hud.hidden=true;}")
 variants=page.evaluate("() => ({loaded:[...__ZN_TEST__.app.view.assets.models.keys()].filter(k=>/british|german/.test(k)),used:[...new Set([...__ZN_TEST__.app.view.units.values()].map(m=>m.meshes.find(x=>x.getTotalVertices()>0)?.geometry?.id))]})")
 assert len(variants['loaded'])==6,variants;report['variants']=variants
 # Repeated switches must replace animation groups, not accumulate them.
 animation_counts=page.evaluate("""() => {const a=__ZN_TEST__.app,n=a.world.npcs[0],counts=[];for(let i=0;i<20;i++){a.world.time+=.2;n.moving=i%2===0;n.weapon.reloadLeft=i%3===0?1:0;n.hitTime=i%5===0?a.world.time:-10;a.view.render(false);counts.push(a.view.scene._activeAnimatables.length);}return counts;}""");assert max(animation_counts)<=28*19,animation_counts;report['animationCounts']=animation_counts
 page.evaluate("() => {const a=__ZN_TEST__.app;for(let i=0;i<250;i++)a.view.effects.event({type:'explosion',pos:{x:0,y:0,z:0}});a.view.effects.update(a.world,5);}")
 pools=page.evaluate("Object.fromEntries(Object.entries(__ZN_TEST__.app.view.effects.pools).map(([k,p])=>[k,{allocated:p.objects.size,capacity:p.capacity,available:p.available}]))");assert all(v['allocated']<=v['capacity'] for v in pools.values());report['pools']=pools
 page.evaluate("() => {const a=__ZN_TEST__.app;a.ui.menu.hidden=false;a.go('paused');}")
 page.locator('[data-action="settings"]').click();
 for key in ['showFps','showCpu','showGpu']:page.locator(f'[data-setting="{key}"]').uncheck()
 page.locator('[data-action="back"]').click();page.locator('[data-action="enter"]').click();page.wait_for_function("ZiemiaNiczyja.state==='playing'");page.wait_for_timeout(400);assert not page.locator('.performance-overlay').is_visible();assert not page.evaluate('__ZN_TEST__.app.view.gpuTimer.enabled');report['checks']['independentOverlaySettingsOff']=True
 page.keyboard.press('Escape');page.wait_for_function("ZiemiaNiczyja.state==='paused'");page.locator('[data-action="exit"]').click();assert page.evaluate('ZiemiaNiczyja.inspect().missionScenes')==0;assert not report['errors'],report['errors'];assert not report['missing'],report['missing'];report['passed']=True
 out=OUT/('regression-dist.json' if args.dist else 'regression-source.json');out.write_text(json.dumps(report,indent=2,ensure_ascii=False));print('PASS',out,flush=True);b.close()
