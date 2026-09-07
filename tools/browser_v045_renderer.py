#!/usr/bin/env python3
"""Offline full-renderer integration, for environments without a local HTTP transport.
Reads the exact bundled modules/assets. Only module/asset URLs are adapted to Blob URLs;
GLB embedded-resource base URL becomes empty. Production GameView/Simulation code runs.
This is a Chromium/SwiftShader functional test, NOT physical-GPU performance acceptance.
"""
from pathlib import Path
import argparse,base64,json,posixpath,re,mimetypes
from browser_v045 import ROOT,memory_ui,update

def run():
    from playwright.sync_api import sync_playwright
    ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--executable',default=None);ap.add_argument('--output',default='.local/v045-renderer');args=ap.parse_args()
    out=Path(args.output);out.mkdir(parents=True,exist_ok=True);report={'status':'RUNNING','mode':'offline real GameView + Simulation; bundled modules and assets; software WebGL'}
    try:
      with sync_playwright() as pw:
        browser=pw.chromium.launch(**({'executable_path':args.executable} if args.executable else {}),headless=True,args=['--enable-unsafe-swiftshader','--use-angle=swiftshader-webgl'])
        page=browser.new_page(viewport={'width':1280,'height':720});page.set_default_timeout(120000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        report['browser']=browser.version
        if not page.evaluate("!!document.createElement('canvas').getContext('webgl2')"):
          raise RuntimeError('WebGL not supported: WebGL2 unavailable in this browser environment')
        memory_ui(page)
        # All embedded glTF images are read from the original binary files.
        page.evaluate('globalThis.__RENDER_ASSETS__={}')
        for folder in ['models','textures']:
          for path in (ROOT/'public/assets'/folder).rglob('*'):
            if not path.is_file() or path.suffix not in ['.glb','.png','.jpg','.webp']:continue
            page.evaluate('''({name,bytes,type})=>{const raw=atob(bytes),a=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)a[i]=raw.charCodeAt(i);__RENDER_ASSETS__[name]=URL.createObjectURL(new Blob([a],{type}));}''',{'name':path.relative_to(ROOT/'public/assets').as_posix(),'bytes':base64.b64encode(path.read_bytes()).decode(),'type':mimetypes.guess_type(path.name)[0] or 'application/octet-stream'})
        modules={}
        # A separate module namespace avoids changing import maps after their resolution.
        for base in ['src','vendor']:
          for path in (ROOT/base).rglob('*.js'):
            rel=path.relative_to(ROOT).as_posix();source=path.read_text()
            source=re.sub(r'((?:from\s*|import\s*(?:\(\s*)?))([\'\"])(\.[^\'\"]+\.js)\2',lambda m:m[1]+m[2]+'zr:'+posixpath.normpath(posixpath.join(posixpath.dirname(rel),m[3]))+m[2],source)
            if rel=='src/render/assets.js':source=source.replace('new URL(`../../public/assets/${path}`,import.meta.url).href','globalThis.__RENDER_ASSETS__[path]')
            if rel=='src/render/babylon.js':source=source.replace("new URL('.',url).href","''")
            modules['zr:'+rel]=source
        page.evaluate('''modules=>{const imports={};for(const [key,s] of Object.entries(modules))imports[key]=URL.createObjectURL(new Blob([s],{type:'text/javascript'}));const m=document.createElement('script');m.type='importmap';m.textContent=JSON.stringify({imports});document.head.appendChild(m);}''',modules)
        result=page.evaluate('''async()=>{
          const {GameView}=await import('zr:src/render/view.js');const {app}=__V045__;
          app.settings.quality='low';app.settings.renderScale=.5;app.settings.hudScale=1;app.settings.damageEffects=1;
          const view=new GameView(app.view.canvas,app.world,app.settings);app.view=view;__V045__.view=view;
          await view.load(()=>{});view.resetPresentation();view.resize();
          const results={webGL:view.engine.webGLVersion,meshes:view.scene.meshes.length,checks:[]};
          const assert=(ok,msg)=>{if(!ok)throw Error(msg);results.checks.push(msg);};
          view.beforeTick();app.world.tick(1/60,{forward:true,lookX:.08,lookY:.02});view.afterTick();app.world.consumeEvents();
          const original=JSON.stringify(app.world.player.snapshot());
          const pending={lookX:.04,lookY:-.01};view.render(true,{alpha:.2,presentationDt:1/165,look:pending,frameId:1,sessionId:app.performance.sessionId});
          const a=view.camera.position.clone();view.render(true,{alpha:.8,presentationDt:1/165,look:pending,frameId:2,sessionId:app.performance.sessionId});const b=view.camera.position.clone();
          assert(Math.hypot(a.x-b.x,a.z-b.z)>1e-4,'camera changes across renders without another simulation step');
          assert(JSON.stringify(app.world.player.snapshot())===original,'render does not mutate authoritative player state');
          assert(Math.abs(view.camera.rotation.y-(app.world.player.yaw+pending.lookX))<1e-8,'pending mouse delta appears once in camera yaw');
          const heldYaw=view.camera.rotation.y;view.beforeTick();app.world.tick(1/60,pending);view.afterTick();view.render(true,{alpha:.5,presentationDt:1/165,look:{lookX:0,lookY:0},frameId:3,sessionId:app.performance.sessionId});
          assert(Math.abs(view.camera.rotation.y-heldYaw)<1e-8,'consuming pending mouse delta causes no extra rotation');
          app.world.player.ads=true;app.ui.hitFeedback.accept({type:'combat-feedback',feedbackId:1,time:app.world.time,damage:20,killed:true},app.ui.sessionId);
          app.ui.nextHud=0;app.ui.update(app.world,view,app.performance.metrics);
          assert(getComputedStyle(app.ui.el['hit-marker']).opacity!=='0','kill marker appears over real ADS GameView');
          const npc=app.world.npcs[0];const p=view.presentPosition(npc.id,npc.pos);const q=view.projectPoint({...p,y:p.y+1.6});assert(Number.isFinite(q.x)&&Number.isFinite(q.y),'world marker projection uses a finite real camera matrix');
          for(const stance of ['crouch','prone','stand']){app.world.player.stance=stance;view.resetPresentation();view.render(true,{alpha:1,presentationDt:.016,look:{},frameId:4,sessionId:app.performance.sessionId});}
          assert(Math.abs(view.camera.upVector.x)<1e-7&&Math.abs(view.camera.upVector.z)<1e-7,'zero-trauma camera has no residual roll after stance changes');
          results.draws=view.renderStats.drawCalls;results.triangles=view.renderStats.triangles;globalThis.__RENDER_TEST_VIEW__=view;return results;
        }''')
        report.update(result);page.screenshot(path=str(out/'real-game.png'))
        cleanup=page.evaluate('''()=>{const v=__RENDER_TEST_VIEW__;v.dispose();return{disposed:v.disposed,units:v.units.size,items:v.items.size,queries:v.gpuTimer.pending.length};}''');assert cleanup['disposed'] and cleanup['units']==0 and cleanup['items']==0 and cleanup['queries']==0
        report['cleanup']=cleanup;assert not errors,errors;report['status']='PASS';report['browser']=browser.version;browser.close()
    except Exception as error:report['status']='BLOCKED' if 'WebGL not supported' in str(error) else 'FAIL';report['error']=str(error)
    (out/'result.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False,indent=2));raise SystemExit(0 if report['status']=='PASS' else 1)
if __name__=='__main__':run()
