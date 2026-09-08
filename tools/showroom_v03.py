"""Actual six GLBs, front/back/LOD views. Not a gameplay performance benchmark.
Run: xvfb-run -a python tools/showroom_v03.py
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import mimetypes,urllib.parse,shutil,json,math
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'docs/v0.3-tests';OUT.mkdir(parents=True,exist_ok=True)
report={'renderer':'Chromium / SwiftShader','lighting':'neutral asset inspection, not gameplay','errors':[],'missing':[],'views':[]}
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=shutil.which('chromium'),headless=True,args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']);page=b.new_page(viewport={'width':1500,'height':950});report['browser']=b.version
 page.on('pageerror',lambda e:report['errors'].append(str(e)))
 def route(r):
  f=ROOT/urllib.parse.urlparse(r.request.url).path.lstrip('/')
  if not f.is_file():report['missing'].append(str(f))
  r.fulfill(status=200 if f.is_file() else 404,body=f.read_bytes() if f.is_file() else b'missing',headers={'Content-Type':mimetypes.guess_type(f)[0] or 'application/octet-stream','Access-Control-Allow-Origin':'*'})
 page.route('http://local.test/**',route)
 page.set_content('''<html><head><base href="http://local.test/"><style>body{margin:0;background:#263032}canvas{width:100vw;height:100vh;display:block}aside{position:absolute;top:30px;left:40px;color:#e4dcc5;font:16px monospace;letter-spacing:.15em}small{display:block;margin-top:12px;color:#abae99;font-size:12px}footer{position:absolute;bottom:28px;width:100%;display:flex;justify-content:space-around;color:#dbd2b8;font:13px monospace;letter-spacing:.1em}</style></head><body><canvas id="c"></canvas><aside>ZIEMIA NICZYJA / 0.3<small id="label">Modele z gry · oświetlenie podglądowe</small></aside><footer><span>PEŁNE OPORZĄDZENIE</span><span>LŻEJSZY ZESTAW</span><span>PODOFICER</span></footer><script type="module">
 import {Engine,Scene,TargetCamera,Vector3,Color3,Color4,HemisphericLight,DirectionalLight} from './src/render/babylon.js';import {Assets} from './src/render/assets.js';
 const engine=new Engine(document.querySelector('canvas'),true),scene=new Scene(engine);scene.clearColor=new Color4(.14,.18,.19,1);scene.detachControl();const camera=new TargetCamera('camera',new Vector3(0,1.28,5.2),scene);camera.setTarget(new Vector3(0,.98,0));camera.fov=.52;
 const hemi=new HemisphericLight('hemi',new Vector3(0,1,0),scene);hemi.intensity=.85;hemi.groundColor=new Color3(.25,.23,.18);const sun=new DirectionalLight('sun',new Vector3(.5,-.55,-1),scene);sun.intensity=1.8;
 const assets=new Assets(scene);await assets.load(()=>{});window.models=[];for(const faction of ['british','german'])for(let i=0;i<3;i++){const id=faction+(i?'-v'+i:'');const m=assets.instantiate(id,'gallery-'+id);m.id=id;m.root.position.x=(1-i)*1.08;m.root.rotation.y=0;for(const mesh of m.meshes)if(/lod[12]/.test(mesh.name))mesh.setEnabled(false);const a=m.animations.get('idle');a.start(false);a.pause();a.goToFrame(0);m.root.setEnabled(faction==='british');models.push(m);}scene.animationsEnabled=false;await scene.whenReadyAsync();window.gallery={engine,scene,camera,assets,sun};engine.runRenderLoop(()=>{engine.beginFrame();scene.render();engine.endFrame();window.rendered=true;});
 </script></body></html>''',wait_until='networkidle')
 page.wait_for_function('window.rendered',timeout=60000)
 for faction in ['british','german']:
  for side in ['front','back']:
   page.evaluate("""([faction,side])=>{for(const m of models)m.root.setEnabled(m.id.startsWith(faction));gallery.camera.position.set(0,1.28,side==='front'?5.2:-5.2);gallery.camera.setTarget(new (gallery.camera.position.constructor)(0,.98,0));gallery.sun.direction.z=side==='front'?-1:1;document.querySelector('#label').textContent=(faction==='british'?'Brytyjczycy':'Niemcy')+' · LOD 0 · '+(side==='front'?'przód':'tył')+' · te same modele GLB co w grze';}""",[faction,side])
   page.wait_for_timeout(900);page.screenshot(path=str(OUT/f'characters-{faction}-{side}.png'));report['views'].append({'faction':faction,'side':side,'meshes':page.evaluate('gallery.scene.getActiveMeshes().length')})
 # Inspect actual lower LODs, not a fabricated LOD label.
 for lod in [1,2]:
  page.evaluate("""lod=>{gallery.camera.position.set(0,1.28,5.2);gallery.camera.setTarget(new (gallery.camera.position.constructor)(0,.98,0));gallery.sun.direction.z=-1;for(const m of models){m.root.setEnabled(m.id.startsWith('british'));for(const mesh of m.meshes){const match=mesh.name.match(/lod([012])/);if(match)mesh.setEnabled(+match[1]===lod);}}document.querySelector('#label').textContent='Brytyjczycy · LOD '+lod+' · widok kontrolny z bliska (w grze używany z dalszej odległości)';}""",lod)
  page.wait_for_timeout(600);page.screenshot(path=str(OUT/f'characters-lod{lod}.png'))
 assert not report['errors'],report['errors'];assert not report['missing'],report['missing'];report['passed']=True;(OUT/'showroom.json').write_text(json.dumps(report,indent=2,ensure_ascii=False));print(json.dumps(report,ensure_ascii=False),flush=True);b.close()
