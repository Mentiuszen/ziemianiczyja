"""Render the actual game GLBs for visual review (optional Python/Playwright/Chromium).
Run with xvfb-run -a python tools/showroom_v02.py on a headless Linux machine.
Uses neutral gallery lighting; this is not a gameplay performance benchmark.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import mimetypes,urllib.parse,shutil,json
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'docs/v0.2-tests'
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=shutil.which('chromium'),headless=True,args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']);page=b.new_page(viewport={'width':1450,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('console',lambda e:print(e.type,e.text,flush=True) if e.type=='error' else None)
 def route(r):
  f=ROOT/urllib.parse.urlparse(r.request.url).path.lstrip('/');r.fulfill(status=200 if f.is_file() else 404,body=f.read_bytes() if f.is_file() else b'missing',headers={'Content-Type':mimetypes.guess_type(f)[0] or 'application/octet-stream','Access-Control-Allow-Origin':'*'})
 page.route('http://local.test/**',route)
 page.set_content('''<html><head><base href="http://local.test/"><style>body{margin:0;background:#263032}canvas{width:100vw;height:100vh;display:block}aside{position:absolute;top:32px;left:40px;color:#e4dcc5;font:16px monospace;letter-spacing:.15em}small{display:block;margin-top:12px;color:#abae99;font-size:11px}footer{position:absolute;bottom:28px;width:100%;display:flex;justify-content:space-around;color:#dbd2b8;font:14px monospace;letter-spacing:.1em}</style></head><body><canvas id="c"></canvas><aside>ZIEMIA NICZYJA / INFANTRY 0.2<small>Modele z gry · LOD 0 · oświetlenie podglądowe</small></aside><footer><span>BRITISH · BRODIE / WEBBING</span><span>GERMAN · M16 / FELDGRAU</span></footer><script type="module">
 import {Engine,Scene,TargetCamera,Vector3,Color3,Color4,HemisphericLight,DirectionalLight} from './src/render/babylon.js';import {Assets} from './src/render/assets.js';
 const engine=new Engine(document.querySelector('canvas'),true),scene=new Scene(engine);scene.clearColor=new Color4(.14,.18,.19,1);scene.detachControl();const camera=new TargetCamera('camera',new Vector3(.25,1.35,4.25),scene);camera.setTarget(new Vector3(0,.98,0));camera.fov=.59;
 const hemi=new HemisphericLight('hemi',new Vector3(0,1,0),scene);hemi.intensity=.72;hemi.groundColor=new Color3(.25,.23,.18);const sun=new DirectionalLight('sun',new Vector3(.5,-.55,-1),scene);sun.intensity=2.0;
 const assets=new Assets(scene);await assets.load(()=>{});window.models=[];for(const [id,x] of [['british',.6],['german',-.6]]){const m=assets.instantiate(id,'gallery-'+id);m.root.position.x=x;m.root.rotation.y=id==='german'?-.15:.14;for(const mesh of m.meshes)if(/lod[12]/.test(mesh.name))mesh.setEnabled(false);const a=m.animations.get('idle');a.start(false);a.pause();a.goToFrame(0);models.push(m);}scene.animationsEnabled=false;await scene.whenReadyAsync();window.gallery={engine,scene,camera,assets};engine.runRenderLoop(()=>{engine.beginFrame();scene.render();engine.endFrame();window.rendered=true;});
 </script></body></html>''',wait_until='networkidle')
 page.wait_for_function('window.rendered',timeout=60000);page.wait_for_timeout(1500);print('loaded',errors,flush=True);page.screenshot(path=str(OUT/'characters-front.png'))
 page.evaluate("() => {gallery.camera.position.set(.3,1.33,1.65);gallery.camera.setTarget(new (gallery.camera.position.constructor)(0,1.35,0));}");page.wait_for_timeout(500);page.screenshot(path=str(OUT/'characters-detail.png'))
 page.evaluate("() => {gallery.camera.position.set(.1,1.25,-4.4);gallery.camera.setTarget(new (gallery.camera.position.constructor)(0,.98,0));}");page.wait_for_timeout(500);page.screenshot(path=str(OUT/'characters-back.png'));print(page.evaluate("() => ({meshes:gallery.scene.getActiveMeshes().length,animatables:gallery.scene._activeAnimatables.length,materials:gallery.scene.materials.map(m=>({name:m.name,textures:m.getActiveTextures().length}))})"),flush=True);b.close()
