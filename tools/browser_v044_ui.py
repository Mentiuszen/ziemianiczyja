#!/usr/bin/env python3
"""0.4.4 acceptance on a real HTTP origin; isolated contexts, never the player's profile.
Start npm run dev / preview first. --game constructs the actual GameView (no renderer stub).
No policy bypass: missing browser, blocked navigation or unavailable WebGL2 => BLOCKED/exit 2.
"""
from __future__ import annotations
import argparse,json,sys
from pathlib import Path
from urllib.parse import urlsplit


def require(condition, explanation):
    if not condition:
        raise AssertionError(explanation)


def open_new(page):
    """Click the normal new-campaign flow; callers may intentionally expect a load error."""
    page.locator('[data-action="campaign-new"]').click()
    skip=page.locator('[data-action="map-skip"]')
    if skip.is_visible(): skip.click()
    page.locator('[data-action="campaign-start"]').click()
    confirm=page.locator('[data-action="confirm-modal"]')
    if confirm.count(): confirm.click()


def start_new(page):
    open_new(page)
    page.wait_for_function("['ready','error'].includes(ZiemiaNiczyja.state)",timeout=65000)
    require(page.evaluate("ZiemiaNiczyja.state==='ready'"),page.locator('#menu').inner_text())


def run():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--url',default='http://127.0.0.1:5173/')
    ap.add_argument('--scenario',choices=['menus','campaign','hud','markers','all'],default='all')
    ap.add_argument('--game',action='store_true')
    ap.add_argument('--headed',action='store_true')
    ap.add_argument('--browser',choices=['chromium','firefox','webkit'],default='chromium')
    ap.add_argument('--executable')
    ap.add_argument('--output',default='.local/v0.4.4-tests/browser/result.json')
    args=ap.parse_args()
    if urlsplit(args.url).scheme not in ('http','https'): ap.error('Use an HTTP(S) game origin.')
    report={'status':'RUNNING','scenario':args.scenario,'gameRequested':args.game,'checks':[]}
    out=Path(args.output);out.parent.mkdir(parents=True,exist_ok=True);code=1
    try:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as pw:
            opts={'headless':not args.headed}
            if args.executable: opts['executable_path']=args.executable
            browser=getattr(pw,args.browser).launch(**opts)
            try:
                report['browserVersion']=browser.version
                ctx=browser.new_context(viewport={'width':1280,'height':720})
                ctx.add_init_script('globalThis.__ZN_TEST_MODE__=true;')
                page=ctx.new_page();errors=[];requests=[]
                page.on('pageerror',lambda e:errors.append(str(e)))
                page.on('request',lambda r:requests.append(r.url))
                page.goto(args.url,wait_until='networkidle');page.wait_for_function('!!globalThis.__ZN_TEST__?.app')
                require(page.evaluate("ZiemiaNiczyja.state==='language-select'"),'Missing first-run picker')
                page.keyboard.press('Escape')
                require(page.evaluate("ZiemiaNiczyja.state==='language-select'"),'Escape skipped language')
                for width,height in [(1280,720),(390,844),(844,390)]:
                    page.set_viewport_size({'width':width,'height':height})
                    for tile in page.locator('.language-tile').all():
                        box=tile.bounding_box();require(box and box['x']>=0 and box['x']+box['width']<=width and box['y']>=0 and box['y']+box['height']<=height,'Picker clipping')
                        require(tile.evaluate("n=>getComputedStyle(n).borderWidth==='0px'&&getComputedStyle(n).outlineWidth==='0px'"),'Picker has a frame')
                    page.screenshot(path=str(out.parent/f'language-{width}.png'))
                page.set_viewport_size({'width':1280,'height':720});page.locator('#choose-en').click()
                page.wait_for_function("__ZN_TEST__.app.checkpointState!=='loading'")
                require(not any('/vendor/' in u or '/render/view.js' in u for u in requests),'Menu eagerly loaded 3D runtime')
                require(page.locator('.main-actions button').count()==4,'Main does not have four actions')
                require(page.locator('.topbar,.bottom-bar,.dossier').count()==0,'Legacy menu chrome remains')
                require(page.locator('.main-logo img').evaluate('n=>n.complete&&n.naturalWidth>0'),'Logo did not load')
                require(page.locator('.main-version').inner_text()=='v0.4.4','Wrong menu version')
                page.screenshot(path=str(out.parent/'main-en.png'));report['checks'].append('picker/main/native locale save')
                page.reload(wait_until='networkidle');page.wait_for_function("ZiemiaNiczyja.state==='main'")
                require(page.evaluate("ZiemiaNiczyja.inspect().language==='en'"),'Native localStorage did not persist language')
                if args.scenario in ('menus','all'):
                    page.locator('[data-action="settings"]').click()
                    for tab in ['gameplay','controls','audio','graphics']:
                        page.locator('#tab-'+tab).click();require(page.locator('[role="tabpanel"]').count()==1,'Multiple active tab panels')
                        require(page.locator('#tab-'+tab).get_attribute('aria-selected')=='true','Tab not selected')
                        page.screenshot(path=str(out.parent/f'options-{tab}.png'))
                    page.locator('#tab-controls').click();page.locator('[data-action="bind"][data-key="crouch"]').click();page.keyboard.press('Escape')
                    require(page.evaluate("ZiemiaNiczyja.state==='settings'&&!__ZN_TEST__.app.input.capture"),'Capture Escape escaped options')
                    page.locator('#tab-gameplay').click();page.locator('#language').select_option('pl');require(page.locator('#tab-gameplay').inner_text()=='Rozgrywka','Tabs did not localize')
                    page.locator('#language').select_option('en');page.locator('[data-action="category-reset"]').click()
                    require(page.evaluate("document.activeElement.dataset.action==='cancel-modal'"),'Confirmation did not focus Cancel')
                    page.keyboard.press('Escape');require(page.locator('[role="dialog"]').count()==0,'Modal Escape failed')
                    page.locator('[data-action="back"]').click();report['checks'].append('options/tabs/capture/reset/PL-EN')
                if args.scenario in ('campaign','all'):
                    page.locator('[data-action="campaign-new"]').click();initial=page.locator('#campaign-map').get_attribute('viewBox')
                    page.wait_for_timeout(1500);changed=page.locator('#campaign-map').get_attribute('viewBox');require(initial!=changed,'Campaign intro did not pan/zoom')
                    page.locator('[data-action="map-skip"]').click();final=page.locator('#campaign-map').get_attribute('viewBox')
                    for chapter in ['somme','flers','ypres','amiens']:
                        page.locator(f'[data-mission-id="{chapter}"]').click();require(page.locator('[data-action="campaign-start"]').count()==0,'Unimplemented chapter has Start')
                    page.locator('[data-mission-id="cambrai"]').click();page.locator('[data-action="settings"]').click();page.keyboard.press('Escape')
                    require(page.evaluate("ZiemiaNiczyja.state==='campaign'"),'Options lost map parent')
                    require(page.locator('#campaign-map').get_attribute('viewBox')==final,'Intro replayed')
                    page.screenshot(path=str(out.parent/'campaign.png'));page.locator('[data-action="back"]').click();report['checks'].append('campaign/animation/skip/chapters/return')
                if args.game:
                    require(page.evaluate("ZiemiaNiczyja.state==='main'"),'Game start requires main')
                    if not page.evaluate("!!document.createElement('canvas').getContext('webgl2')"):raise RuntimeError('WebGL2 unavailable')
                    start_new(page)
                    # Actual renderer, frozen ready state: drawing HUD never ticks Simulation.
                    report['game']=page.evaluate(r'''async()=>{
                      const a=__ZN_TEST__.app,w=a.world,v=a.view;const before=JSON.stringify(w.snapshot());const check=(ok,m)=>{if(!ok)throw Error(m);};
                      v.render(false);a.ui.render('playing');a.ui.nextHud=0;a.ui.update(w,v,a.metrics);
                      check(v.scene&&v.camera,'Not a real GameView');check(a.ui.el.minimap.width>0,'Minimap not drawn');
                      const bounds=a.ui.el['hud-tactical'].getBoundingClientRect(),ammo=document.querySelector('.ammo-panel').getBoundingClientRect();check(bounds.bottom<ammo.top,'Tactical column overlaps ammo');
                      const img=a.ui.el['weapon-icon'];await img.decode();check(img.naturalWidth>0,'Weapon icon did not load');
                      a.ui.event({type:'shot',owner:'controlled-de-shot',faction:'de',from:{x:w.player.pos.x+10,y:w.player.pos.y+1,z:w.player.pos.z+20},time:w.time});const start=a.ui.contacts.sample(w.time);check(start.length===1,'Actual event dispatcher lost contact');
                      a.go('paused');await a.action('settings');a.changeSetting('language','pl');a.changeSetting('language','en');await a.action('back');check(a.state==='paused','Options auto resumed');check(JSON.stringify(w.snapshot())===before,'Options/HUD changed gameplay');check(a.ui.contacts.sample(w.time).length===1,'Pause/locale cleared contact');
                      // Validate projected points against the actual renderer's matrix. No replacement camera.
                      const {headAnchor}=await import(new URL('src/ui/hud/friendly-markers.js',location.href).href);let points=0;for(const n of w.npcs.filter(n=>n.faction===w.player.faction&&n.hp>0)){const q=v.projectPoint(headAnchor(n));check(Number.isFinite(q.x)&&Number.isFinite(q.y),'Non-finite marker projection');points++;}
                      a.ui.markers.model.reset();for(let i=0;i<20;i++){a.ui.markers.model.sample(w,v,w.time,[]);check(a.ui.markers.model.rays<=4,'LOS budget exceeded');}
                      return{realGameView:true,projectedAllies:points,worldUnchanged:true,occlusionStillNeedsVisualReview:true};
                    }''')
                    # Reload: native IndexedDB pair must remain valid, main -> campaign -> resume.
                    page.evaluate("()=>{const a=__ZN_TEST__.app;a.disposeMission();a.go('main');}")
                    page.reload(wait_until='networkidle');page.wait_for_function("__ZN_TEST__.app.checkpointState==='ready'")
                    require(page.evaluate("!!__ZN_TEST__.app.campaignProgress?.runId"),'No campaign metadata after reload')
                    page.locator('[data-action="campaign-continue"]').click();page.locator('[data-action="campaign-resume"]').click();page.wait_for_function("ZiemiaNiczyja.state==='ready'",timeout=65000)
                    report['checks'].append('actual GameView/HUD/native checkpoint reload')
                elif args.scenario in ('hud','markers'):
                    raise RuntimeError('HUD/marker integration requires --game and WebGL2')
                require(not errors,repr(errors));report['pageErrors']=errors;ctx.close();report['status']='PASS';code=0
            finally: browser.close()
    except Exception as e:
        blocked=any(x in str(e) for x in ['ERR_BLOCKED_BY_ADMINISTRATOR',"Executable doesn't exist",'WebGL2 unavailable','requires --game',"No module named 'playwright'"])
        report.update(status='BLOCKED' if blocked else 'FAIL',reason=str(e));code=2 if blocked else 1
    out.write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n',encoding='utf-8');print(json.dumps(report,indent=2,ensure_ascii=False));return code
if __name__=='__main__':sys.exit(run())
