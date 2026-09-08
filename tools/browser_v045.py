#!/usr/bin/env python3
"""v0.4.5 HUD acceptance. Default: real HTTP + GameView. --memory-ui: transport-isolated
DOM tests using real UI/Simulation modules but an explicitly synthetic view (no GPU claim).
Run in a disposable browser profile; screenshots and JSON are written under --output.
"""
from pathlib import Path
import argparse,base64,json,mimetypes,posixpath,re

ROOT=Path(__file__).resolve().parents[1]

def data_url(path):
    return 'data:'+ (mimetypes.guess_type(path.name)[0] or 'application/octet-stream')+';base64,'+base64.b64encode(path.read_bytes()).decode()

def memory_ui(page):
    page.goto('about:blank')
    # Ensure foundational rules precede component overrides, as in style.css.
    names=['tokens','menus','settings','campaign','hud']
    css='\n'.join(re.sub(r'url\([\'\"]?([^\)\'\"]+)[\'\"]?\)',lambda m,p=ROOT/f'src/ui/styles/{name}.css':'url("'+data_url((p.parent/m[1]).resolve())+'")',(ROOT/f'src/ui/styles/{name}.css').read_text()) for name in names)
    page.set_content('<!doctype html><html><head><style>'+css+'</style></head><body><canvas id="game"></canvas><div id="menu"></div><div id="hud" hidden></div><div id="toast" role="status"></div></body></html>')
    modules={}
    assets={ './'+str(p.relative_to(ROOT)):data_url(p) for p in (ROOT/'public/assets/ui').rglob('*.svg') }
    for path in (ROOT/'src').rglob('*.js'):
        rel=path.relative_to(ROOT).as_posix();source=path.read_text()
        source=re.sub(r'((?:from\s*|import\s*(?:\(\s*)?))([\'\"])(\.[^\'\"]+\.js)\2',lambda m:m[1]+m[2]+'zn:'+posixpath.normpath(posixpath.join(posixpath.dirname(rel),m[3]))+m[2],source)
        source=source.replace('`./public/assets/ui/stance-${stance}.svg`','globalThis.__MEMORY_ASSETS__[`./public/assets/ui/stance-${stance}.svg`]')
        source=source.replace('`./public/assets/ui/weapons/${id}.svg`','globalThis.__MEMORY_ASSETS__[`./public/assets/ui/weapons/${id}.svg`]')
        for original,data in assets.items():source=source.replace(original,data)
        modules['zn:'+rel]=source
    page.evaluate('''({modules,assets})=>{globalThis.__MEMORY_ASSETS__=assets;const imports={};for(const [name,source] of Object.entries(modules))imports[name]=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));const script=document.createElement('script');script.type='importmap';script.textContent=JSON.stringify({imports});document.head.appendChild(script);}''',{'modules':modules,'assets':assets})
    page.evaluate('''async()=>{
      const [{UI},{Simulation},{normalizeSettings},{PerformanceMonitor},{FixedClock},i18n]=await Promise.all([import('zn:src/ui/ui.js'),import('zn:src/core/simulation.js'),import('zn:src/save/settings-schema.js'),import('zn:src/performance/monitor.js'),import('zn:src/core/clock.js'),import('zn:src/i18n/index.js')]);
      const app={settings:normalizeSettings({language:'en'}),state:'playing',performance:new PerformanceMonitor(),clock:new FixedClock(),world:new Simulation(),checkpointState:'none',navigation:{},store:{},action(){},changeSetting(k,v){this.settings[k]=v;this.ui.refreshHudOptions();}};
      i18n.setLanguage('en');app.ui=new UI(app);app.ui.ensureWorld(app.world);
      const view={canvas:document.querySelector('#game'),renderStats:{drawCalls:10,triangles:100,lodCounts:[1,2,3]},gpuTimer:{status:'unsupported',milliseconds:null,sampleEvery:4},viewport:()=>({left:0,top:0,width:innerWidth,height:innerHeight}),cameraPosition:()=>({...app.world.player.pos,y:app.world.player.pos.y+1.6}),projectPoint:p=>({x:innerWidth/2+(p.x-app.world.player.pos.x)*25,y:innerHeight/2-(p.y-app.world.player.pos.y-1)*25,visible:true}),marker:()=>({visible:false,x:0,y:0,distance:20})};
      app.view=view;app.metrics=app.performance.metrics;app.ui.render('playing');globalThis.__V045__={app,i18n,view};
    }''')

def update(page):
    page.evaluate('''()=>{const {app}=__V045__;if(__V045__.realRenderer){app.view.resetPresentation();app.view.render(true,{alpha:1,presentationDt:.016,look:{}});}app.ui.nextHud=0;app.ui.update(app.world,app.view,app.performance.metrics);}''')
    page.wait_for_timeout(80)
    page.evaluate('''()=>{const {app}=__V045__;app.ui.update(app.world,app.view,app.performance.metrics);}''')

def run():
    ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--url',default='http://127.0.0.1:5173/');ap.add_argument('--memory-ui',action='store_true');ap.add_argument('--executable');ap.add_argument('--output',default='.local/v045-browser');args=ap.parse_args()
    out=Path(args.output);out.mkdir(parents=True,exist_ok=True)
    report={'mode':'memory UI + real Simulation, synthetic view' if args.memory_ui else 'HTTP + GameView','checks':[],'layouts':[],'status':'RUNNING'}
    from playwright.sync_api import sync_playwright
    try:
      with sync_playwright() as pw:
        options={'headless':True}
        if args.executable:options['executable_path']=args.executable
        browser=pw.chromium.launch(**options);report['browser']=browser.version
        page=browser.new_page(viewport={'width':1920,'height':1080},device_scale_factor=1)
        errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        if args.memory_ui:memory_ui(page)
        else:
            page.add_init_script('globalThis.__ZN_TEST_MODE__=true;')
            page.goto(args.url,wait_until='networkidle');page.locator('#choose-en').click();page.locator('[data-action=campaign-new]').click()
            if page.locator('[data-action=map-skip]').is_visible():page.locator('[data-action=map-skip]').click()
            page.locator('[data-action=campaign-start]').click();page.wait_for_function("ZiemiaNiczyja.state==='ready'",timeout=90000);page.locator('[data-action=enter]').click();page.wait_for_function("ZiemiaNiczyja.state==='playing'")
            page.evaluate("async()=>{globalThis.__V045__={app:__ZN_TEST__.app,i18n:await import('./src/i18n/index.js'),view:__ZN_TEST__.app.view,realRenderer:true};cancelAnimationFrame(__ZN_TEST__.app.raf);__ZN_TEST__.app.alive=false;}")
        for language in ['en','pl']:
          page.evaluate("language=>{const {app,i18n}=__V045__;i18n.setLanguage(language);app.settings.language=language;app.ui.localizeHUD();}",language)
          for width,height in [(800,600),(1280,720),(1920,1080),(2560,1440),(3440,1440)]:
            page.set_viewport_size({'width':width,'height':height})
            for scale in [.5,1,1.5,2]:
              page.evaluate('''scale=>{const {app}=__V045__;app.settings.hudScale=scale;app.world.player.health.hp=19;app.world.player.ads=true;app.ui.message={key:'hud.critical'};app.ui.messageUntil=100;app.ui.layout.invalidate('test');}''',scale);update(page)
              check=page.evaluate('''()=>{
                const nodes=[...document.querySelectorAll('.hud-slot:not([hidden])')];const boxes=nodes.map(e=>({id:e.dataset.hudModule,r:e.firstElementChild.getBoundingClientRect().toJSON()}));const overlaps=[];
                for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i].r,b=boxes[j].r;if(a.left<b.right-.6&&a.right>b.left+.6&&a.top<b.bottom-.6&&a.bottom>b.top+.6)overlaps.push([boxes[i].id,boxes[j].id]);}
                const map=document.querySelector('#minimap'),r=map.getBoundingClientRect();return{overlaps,compact:__V045__.app.ui.layout.snapshot().compact,hidden:__V045__.app.ui.layout.snapshot().overflow,critical:!document.querySelector('#slot-critical').hidden,canvas:map.width,rendered:r.width,boxes};}''')
              report['layouts'].append({'language':language,'width':width,'height':height,'scale':scale,**check})
              assert not check['overlaps'],report['layouts'][-1]
              assert check['critical'],'Critical warning disappeared in packing'
              if width>=1280 and scale<=1.5:assert not check['hidden'],'Unnecessary compact layout: '+str(check['hidden'])
              for box in check['boxes']:
                r=box['r'];assert r['left']>=-.6 and r['top']>=-.6 and r['right']<=width+.6 and r['bottom']<=height+.6,box
              if check['rendered']>0:assert check['canvas']>=round(check['rendered'])-1,'Blurry minimap buffer'
              if width==1920 and scale in [1,2] and language=='en':page.screenshot(path=str(out/f'hud-{int(scale*100)}.png'))
        report['checks'].append('40 PL/EN viewport/scale combinations: measured transformed boxes do not overlap')
        page.set_viewport_size({'width':1920,'height':1080})
        for hp in [20,19,1,0]:
            page.evaluate('''hp=>{const {app}=__V045__;app.world.player.health.hp=hp;app.settings.damageEffects=0;app.ui.layout.invalidate();}''',hp);update(page)
            visible=page.locator('#critical-health').is_visible();assert visible==(0<hp<20),(hp,visible)
        report['checks'].append('critical threshold, death and damageEffects=0')
        for style in ['dot','cross','cross-dot','none']:
            page.evaluate('''style=>{const {app}=__V045__;app.settings.crosshairStyle=style;app.world.player.ads=true;app.ui.hitFeedback.reset(app.ui.sessionId);app.ui.event({type:'combat-feedback',feedbackId:1,time:app.world.time,killed:true});}''',style);update(page)
            assert page.locator('#hit-marker').evaluate("e=>getComputedStyle(e).opacity==='1'&&getComputedStyle(e).color==='rgb(255, 56, 56)'")
            assert page.locator('#crosshair').evaluate("e=>getComputedStyle(e).opacity==='0'")
        report['checks'].append('red hitmarker visible during ADS for every crosshair style including none')
        for stance in ['stand','crouch','prone']:
            page.evaluate('''stance=>{__V045__.app.world.player.stance=stance;}''',stance);update(page)
            assert page.locator('#stance-icon').get_attribute('data-stance')==stance
        report['checks'].append('three localized stance icons')
        # Mixed local scales stress independently sized modules rather than only one global slider.
        for seed in range(8):
            page.evaluate('''seed=>{const {app}=__V045__;app.settings.hudScale=1.5;const keys=Object.keys(app.settings).filter(k=>k.startsWith('hud')&&k!=='hudScale');keys.forEach((k,i)=>app.settings[k]=[.5,1,1.5,2][(i+seed)%4]);app.world.player.health.hp=19;app.ui.layout.invalidate();}''',seed);update(page)
            assert page.evaluate('''()=>{const boxes=[...document.querySelectorAll('.hud-slot:not([hidden])')].map(n=>n.firstElementChild.getBoundingClientRect());return boxes.every((a,i)=>boxes.slice(i+1).every(b=>!(a.left<b.right-.6&&a.right>b.left+.6&&a.top<b.bottom-.6&&a.bottom>b.top+.6)));}'''),'Mixed-scale overlap'
        page.evaluate('''()=>{const {app}=__V045__;for(const k of Object.keys(app.settings))if(k.startsWith('hud'))app.settings[k]=1;app.ui.layout.invalidate();}''');update(page)
        report['checks'].append('8 mixed global/local scaling layouts')
        page.evaluate('''()=>{const {app}=__V045__,p=app.world.player;app.world.grenades=Array.from({length:4},(_,i)=>({id:'qa-grenade-'+i,faction:'de',owner:'de-qa',fuse:1+i*.1,pos:{x:p.pos.x+Math.sin(i*Math.PI/2)*.8,y:p.pos.y+1.05,z:p.pos.z+Math.cos(i*Math.PI/2)*.8}}));app.ui.grenadeWarnings.nextSample=0;}''');update(page)
        assert page.locator('.grenade-marker:not([hidden])').count()==3,'Expected three enemy grenade markers'
        assert page.locator('.grenade-extra').first.inner_text()=='+1'
        page.evaluate('''()=>{__V045__.app.world.grenades.length=0;}''');update(page)
        assert page.locator('.grenade-marker:not([hidden])').count()==0,'Expired grenade markers survived'
        report['checks'].append('pooled grenade markers, extra threat count and immediate cleanup')
        update(page);stable=page.evaluate('__V045__.app.ui.layout.reflows')
        page.evaluate('''()=>{const {app}=__V045__;for(let i=0;i<60;i++)app.ui.update(app.world,app.view,app.performance.metrics);}''')
        assert page.evaluate('__V045__.app.ui.layout.reflows')==stable,'Stable HUD was remeasured every render'
        assert page.locator('#weapon-icon').evaluate('e=>e.complete&&e.naturalWidth>0'),'Weapon icon failed to load'
        report['checks'].append('stable layout cache and real weapon SVG decoding')
        page.evaluate('''()=>{const {app}=__V045__;app.world.player.health.hp=100;app.settings.hudScale=1;app.world.player.stance='stand';app.ui.debug=true;for(let i=0;i<200;i++)app.performance.record({frame:6,cpu:2,simulation:.8,render:.6,scene:.1,hud:.1,audio:.1,events:.1,profiler:.01},performance.now()+i*6);app.performance.publish(app.performance.lastNow);app.ui.nextDebug=0;app.ui.layout.invalidate();}''');update(page)
        size=page.locator('#debug').bounding_box();page.evaluate('''()=>{__V045__.app.settings.hudScale=2;__V045__.app.ui.layout.invalidate();}''');update(page)
        assert page.locator('#debug').bounding_box()==size,'HUD scale leaked into F3'
        assert 'p99' in page.locator('#debug-text').inner_text();assert page.evaluate('__V045__.app.performance.metrics.sampleCount')==200;assert page.evaluate('__V045__.app.performance.metrics.p99')==6;page.screenshot(path=str(out/'f3.png'))
        report['checks'].append('F3 percentiles and fixed diagnostic scale')
        page.evaluate('''()=>{const {app}=__V045__;app.state='settings';app.ui.render('settings');}''')
        assert page.locator('[data-setting=showCpu]').count()==0 and page.locator('[data-setting=showGpu]').count()==0
        assert page.locator('[data-setting=hudScale]').count()==1;assert page.locator('[data-crosshair-preview]').count()==1
        page.locator('.hud-settings details').evaluate('e=>e.open=true');page.screenshot(path=str(out/'options.png'))
        report['checks'].append('HUD settings, live preview and no CPU/GPU menu switches')
        if args.memory_ui:
            high=browser.new_page(viewport={'width':1920,'height':1080},device_scale_factor=2);high.on('pageerror',lambda e:errors.append(str(e)));memory_ui(high)
            high.evaluate('''()=>{__V045__.app.settings.hudScale=2;__V045__.app.ui.layout.invalidate();}''');update(high)
            pixels=high.locator('#minimap').evaluate('e=>({buffer:e.width,css:e.getBoundingClientRect().width,dpr:devicePixelRatio})')
            assert pixels['dpr']==2 and pixels['buffer']>=round(pixels['css']*2)-1,pixels;high.close();report['checks'].append('minimap 200% at DPR 2: full-resolution backing buffer')
        assert not errors,errors
        report['status']='PASS';browser.close()
    except Exception as error:
      report['status']='BLOCKED' if 'ERR_BLOCKED_BY_ADMINISTRATOR' in str(error) else 'FAIL';report['error']=str(error)
    (out/'result.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps({k:v for k,v in report.items() if k!='layouts'},ensure_ascii=False,indent=2))
    raise SystemExit(0 if report['status']=='PASS' else 1)
if __name__=='__main__':run()
