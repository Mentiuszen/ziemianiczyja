#!/usr/bin/env python3
"""0.4.3 language regressions adapted to 0.4.4 acceptance on a normal HTTP(S) origin, in isolated browser contexts.

Start npm run dev or preview, then run with --url and optionally --game.
No production language flag is forced; selection uses the real tiles and settings.
--game additionally loads the real GameView and checks paused/HUD/texture switching.
BLOCKED (missing browser/WebGL or navigation policy) exits 2, assertions exit 1.
"""
from __future__ import annotations
import argparse
import json
import sys
from pathlib import Path
from urllib.parse import urlsplit, urljoin

# Shared presentation tests: no simulation step, no replacement renderer in this file.
PRESENTATION_CASES = r'''async () => {
 const a=globalThis.__ZN_TEST__.app;
 const {message,text,t}=await globalThis.__znImport('src/i18n/index.js');
 const {BRIEFING_LINES}=await globalThis.__znImport('src/data/briefing.js');
 const check=(ok,label)=>{if(!ok)throw Error(label);};
 const w=a.world,v=a.view,original=JSON.stringify(w.snapshot()),checks=[];
 a.go('settings');
 a.settings.keys.interact='KeyF';
 a.ui.toast(message('pickup.ammo'),60);const toastDeadline=a.ui.toastUntil;
 a.ui.event({type:'checkpoint',name:'checkpoint.bennett',time:w.time});const checkpointDeadline=a.ui.checkpointUntil;
 for(const language of ['en','pl','en']){
  a.changeSetting('language',language);
  check(a.world===w&&a.view===v,'language reconstructed the mission');
  check(JSON.stringify(w.snapshot())===original,'language changed simulation snapshot');
  check(a.state==='settings','language left options');
  check(document.documentElement.lang===language,'document language did not update');
  check(a.ui.toastUntil===toastDeadline,'toast restarted');
  check(a.ui.checkpointUntil===checkpointDeadline,'checkpoint notification restarted');
  check(a.ui.toastNode.textContent===t('pickup.ammo'),'active toast is stale');
  check(a.ui.el.checkpoint.textContent===t('checkpoint.flash',{name:message('checkpoint.bennett')}),'checkpoint is stale');
  for(const state of ['main','campaign','settings','credits','loading','ready','paused','dead','complete','error']){
   a.errorMessage=message('error.assetMissing',{name:'test.glb'});a.ui.render(state);
   const content=a.ui.menu.textContent;
   check(!/\[object Object\]|undefined|\{[A-Za-z][A-Za-z0-9_]*\}/.test(content),`${language}/${state}: unresolved content`);
   if(language==='en')check(!/Ustawienia|Rozpocznij|Pęknięta|Zginąłeś|Aktualny cel|Naciśnij/.test(content),`${state}: Polish prose in English`);
   checks.push(`${language}/${state}`);
  }
  a.ui.render('playing');a.ui.nextHud=0;a.ui.nextDebug=0;a.ui.debug=true;a.ui.update(w,v,a.metrics);
  check(a.ui.el['health-label'].textContent===t('hud.health'),'health label stale');
  check(a.ui.el.objective.textContent===text(w.director.objective.title),'objective stale');
  check(a.ui.el.hint.textContent.includes('[F]'),'remapped key absent');
  check(!/\[object Object\]|undefined/.test(a.ui.hud.textContent),'HUD unresolved');
  for(let line=0,time=0;line<BRIEFING_LINES.length;line++){
   const savedTime=w.director.briefingTime;w.director.briefingTime=time+.1;a.ui.nextHud=0;a.ui.update(w,v,a.metrics);
   check(a.ui.el.subtitle.textContent.includes(text(BRIEFING_LINES[line].text)),`${language}/briefing/${line}`);
   w.director.briefingTime=savedTime;time+=BRIEFING_LINES[line].duration;
  }
  a.ui.loadMessage=message('loading.models',{current:3,total:15});a.ui.loadFraction=.4;a.ui.render('loading');
  check(document.querySelector('#load-text').textContent===t('loading.models',{current:3,total:15}),'loading label stale');
  check(document.querySelector('#load-progress').style.width==='40%','loading percentage changed');
  a.ui.render('settings');
 }
 check(JSON.stringify(w.snapshot())===original,'presentation tests changed restored snapshot');
 a.go('paused');return{screens:checks,briefingLines:BRIEFING_LINES.length,worldUnchanged:true};
}'''


def ensure(ok: bool, reason: str) -> None:
    if not ok:
        raise AssertionError(reason)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--url', default='http://127.0.0.1:5173/')
    parser.add_argument('--browser', choices=['chromium', 'firefox', 'webkit'], default='chromium')
    parser.add_argument('--executable', help='Installed browser executable, e.g. Edge')
    parser.add_argument('--headed', action='store_true')
    parser.add_argument('--game', action='store_true', help='Also load the real GameView')
    parser.add_argument('--output', default='.local/v0.4.4-tests/language-regression/result.json')
    args = parser.parse_args()
    if urlsplit(args.url).scheme not in ('http', 'https'):
        parser.error('--url must be HTTP(S), not file://')
    report = {'status':'RUNNING','browser':args.browser,'url':args.url,'checks':[],'gameRequested':args.game}
    code = 1
    try:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as pw:
            options={'headless':not args.headed}
            if args.executable:
                options['executable_path']=args.executable
            browser=getattr(pw,args.browser).launch(**options)
            try:
                report['browserVersion']=browser.version
                ctx=browser.new_context(viewport={'width':1280,'height':720})
                ctx.add_init_script("globalThis.__ZN_TEST_MODE__=true;globalThis.__znImport=path=>import(new URL(path,location.href).href);")
                page=ctx.new_page();errors=[];requests=[]
                page.on('pageerror',lambda error:errors.append(str(error)))
                page.on('request',lambda request:requests.append(request.url))
                page.goto(args.url,wait_until='networkidle');page.wait_for_function("!!globalThis.__ZN_TEST__?.app")
                ensure(page.evaluate("ZiemiaNiczyja.state==='language-select' && !__ZN_TEST__.app.world && !__ZN_TEST__.app.view"),'fresh start did not show only the picker')
                ensure(page.locator('[data-action="campaign-new"]').count()==0,'main menu is exposed before choosing')
                ensure(not any('/src/render/view.js' in x or '/vendor/' in x for x in requests),'runtime loaded before choosing')
                page.keyboard.press('Escape');ensure(page.evaluate("ZiemiaNiczyja.state==='language-select'"),'Escape skipped the choice')
                report['checks'].append('fresh picker, no menu/runtime, Escape gated')
                page.locator('#choose-en').click();page.wait_for_function("ZiemiaNiczyja.state==='main'")
                ensure(page.evaluate("document.documentElement.lang==='en' && JSON.parse(localStorage.getItem('zn-settings-v1')).language==='en'"),'English selection was not persisted')
                ensure('New Campaign' in page.locator('#menu').text_content(),'main menu not English')
                page.reload(wait_until='networkidle');page.wait_for_function("ZiemiaNiczyja.state==='main'")
                ensure(page.locator('#choose-en').count()==0,'picker returned after saved choice')
                report['checks'].append('English click, localStorage persistence, reload skips picker')
                page.locator('[data-action="settings"]').click();page.select_option('#language','pl')
                ensure(page.evaluate("document.documentElement.lang==='pl' && ZiemiaNiczyja.state==='settings'"),'settings did not change immediately')
                ensure('Opcje' in page.locator('#menu').text_content(),'Polish settings absent')
                page.locator('[data-action="category-reset"]').click();page.locator('[data-action="confirm-modal"]').click();ensure(page.locator('#language').input_value()=='pl','defaults cleared language')
                page.select_option('#language','en');page.locator('[data-action="back"]').click()
                report['checks'].append('settings live switch and language survives reset')
                page.locator('[data-action="credits"]').click()
                for link in page.locator('#menu a[href]').all():
                    href=link.get_attribute('href');ensure(href.endswith('.en.md'),'credits link not localized')
                    response=ctx.request.get(urljoin(args.url,href));ensure(response.ok,f'missing English document {href}')
                report['checks'].append('all three English credit documents available over HTTP')
                page.locator('[data-action="back"]').click()
                if args.game:
                    if not page.evaluate("!!document.createElement('canvas').getContext('webgl2')"):
                        report.update(status='BLOCKED',reason='Menus passed; WebGL2 unavailable for requested real GameView test');code=2
                    else:
                        page.evaluate("async()=>{await __ZN_TEST__.app.start();}")
                        ensure(page.evaluate("ZiemiaNiczyja.state==='ready'"),f'mission did not load: {page.locator("#menu").inner_text()}')
                        report['presentation']=page.evaluate(PRESENTATION_CASES)
                        ensure(page.evaluate("__ZN_TEST__.app.view.support.mapMaterial.diffuseTexture===__ZN_TEST__.app.view.support.mapTextures.en"),'world map did not switch to English')
                        report['checks'].append('real GameView: paused switching, world label, HUD, 30 screens, 21 subtitle samples')
                ensure(not errors,f'page errors: {errors}')
                ctx.close()
                for settings in [{'language':'pl'},{'language':'invalid','quality':'high','keys':{'interact':'KeyF'}}]:
                    ctx=browser.new_context();ctx.add_init_script('globalThis.__ZN_TEST_MODE__=true;localStorage.setItem("zn-settings-v1",'+json.dumps(json.dumps(settings))+');')
                    page=ctx.new_page();page.goto(args.url,wait_until='networkidle');page.wait_for_function('!!globalThis.__ZN_TEST__?.app')
                    expected='main' if settings['language']=='pl' else 'language-select'
                    ensure(page.evaluate('ZiemiaNiczyja.state')==expected,'stored language validation failed')
                    if expected=='language-select':
                        ensure(page.evaluate('__ZN_TEST__.app.settings.keys.interact')=='KeyF','old key binding was lost');page.locator('#choose-pl').focus();page.keyboard.press('Enter');ensure(page.evaluate('ZiemiaNiczyja.state')=='main','keyboard selection failed')
                    ctx.close()
                report['checks'].append('saved Polish skips picker, invalid locale keeps bindings, keyboard selects')
                ctx=browser.new_context();ctx.add_init_script("globalThis.__ZN_TEST_MODE__=true;Object.defineProperty(window,'localStorage',{configurable:true,get(){throw new DOMException('Storage denied','SecurityError');}});")
                page=ctx.new_page();page.goto(args.url,wait_until='networkidle');page.locator('#choose-en').click()
                ensure(page.evaluate("ZiemiaNiczyja.state==='main' && __ZN_TEST__.app.settings.language==='en'"),'storage denial blocked entry')
                ensure('browser is blocking local storage' in page.locator('#toast').text_content(),'storage warning was not English');ctx.close()
                report['checks'].append('denied localStorage keeps session choice and localized warning')
                if report['status']=='RUNNING':report['status']='PASS';code=0
            finally:
                browser.close()
    except Exception as error:
        blocked=isinstance(error,ImportError) or any(x in str(error) for x in ['ERR_BLOCKED_BY_ADMINISTRATOR',"Executable doesn't exist"])
        report.update(status='BLOCKED' if blocked else 'FAIL',reason=f'{type(error).__name__}: {error}');code=2 if blocked else 1
    output=Path(args.output);output.parent.mkdir(parents=True,exist_ok=True)
    output.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(f"{report['status']}: {len(report['checks'])} checks; {output}")
    if report.get('reason'):print(report['reason'],file=sys.stderr)
    return code

if __name__=='__main__':
    raise SystemExit(main())
