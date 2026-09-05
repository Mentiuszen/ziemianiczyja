"""Pixel regressions: native exterior-face winding and cutout vegetation.
Run: xvfb-run -a python tools/render_v03_contracts.py
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image
import mimetypes,urllib.parse,json,shutil
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'docs/v0.3-tests';OUT.mkdir(exist_ok=True,parents=True)
report={'renderer':'Chromium / SwiftShader','errors':[],'missing':[],'checks':{}}
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=shutil.which('chromium'),headless=True,args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']);page=b.new_page(viewport={'width':900,'height':700});report['browser']=b.version;page.on('pageerror',lambda e:report['errors'].append(str(e)))
 def route(r):
  f=ROOT/urllib.parse.urlparse(r.request.url).path.lstrip('/')
  if not f.is_file():report['missing'].append(str(f))
  r.fulfill(status=200 if f.is_file() else 404,body=f.read_bytes() if f.is_file() else b'?',headers={'Content-Type':mimetypes.guess_type(f)[0] or 'application/octet-stream','Access-Control-Allow-Origin':'*'})
 page.route('http://local.test/**',route)
 page.set_content('''<html><head><base href="http://local.test/"></head><body style="margin:0"><canvas style="width:100vw;height:100vh"></canvas><script type="module">
 import {Engine,Scene,Vector3,TargetCamera,Color3,Color4,HemisphericLight,StandardMaterial} from './src/render/babylon.js';import {materials} from './src/render/landscape.js';import {Geometry} from './src/render/geometry.js';
 const e=new Engine(document.querySelector('canvas'),true),s=new Scene(e);s.clearColor=new Color4(.2,.3,.4,1);let c=new TargetCamera('camera',new Vector3(0,0,-4),s);c.setTarget(Vector3.Zero());c.fov=.65;new HemisphericLight('light',new Vector3(0,1,0),s);
 const grass=materials(s).grass0;const mesh=new Geometry().quad([[-1,-1,0],[1,-1,0],[1,1,0],[-1,1,0]],[0,0,-1]).mesh('cutout',s,grass);const faces=[];
 for(const [name,z,n,color] of [['front',-.5,[0,0,-1],[1,0,0]],['back',.5,[0,0,1],[0,1,0]]]){const m=new StandardMaterial(name,s);m.diffuseColor=Color3.Black();m.emissiveColor=new Color3(...color);m.disableLighting=true;m.backFaceCulling=true;const f=new Geometry().quad([[-1,-1,z],[1,-1,z],[1,1,z],[-1,1,z]],n).mesh(name,s,m);f.setEnabled(false);faces.push(f);}
 window.test={e,s,c,grass,mesh,faces};await s.whenReadyAsync();e.runRenderLoop(()=>{e.beginFrame();s.render();e.endFrame();window.ready=true;});</script></body></html>''',wait_until='networkidle');page.wait_for_function('window.ready',timeout=45000);page.wait_for_timeout(700)
 path=OUT/'cutout-grass.png';page.screenshot(path=str(path));im=Image.open(path).convert('RGB');background=im.getpixel((10,10));corner=im.getpixel((210,115));assert max(abs(a-b) for a,b in zip(background,corner))<3,('Transparent corner is opaque',background,corner)
 assert page.evaluate('test.grass.needAlphaTesting() && !test.grass.needAlphaBlending()');report['checks']['grassTransparentCorner']={'background':background,'insideCardCorner':corner}
 page.evaluate('test.mesh.setEnabled(false);for(const f of test.faces)f.setEnabled(true)')
 for side,z in [('front',-4),('back',4)]:
  page.evaluate('z=>{test.c.position.z=z;test.c.setTarget(new (test.c.position.constructor)(0,0,0));}',z);page.wait_for_timeout(600);path=OUT/('native-face-'+side+'.png');page.screenshot(path=str(path));pixel=Image.open(path).convert('RGB').getpixel((450,350));channel=0 if side=='front' else 1;assert pixel[channel]>180 and pixel[1-channel]<40,(side,pixel);report['checks'][side]=pixel
 assert not report['errors'],report['errors'];assert not report['missing'],report['missing'];report['passed']=True;(OUT/'render-contracts.json').write_text(json.dumps(report,indent=2));print('PASS',report,flush=True);b.close()
