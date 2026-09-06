#!/usr/bin/env python3
"""Revision-3 functional UI acceptance (high-resolution backdrops not delivered) on an actual HTTP origin. Uses an isolated browser profile.
--game also loads the real GameView. A policy block is BLOCKED, never a passing test.
"""
from pathlib import Path
from urllib.parse import urlsplit
import argparse,json,sys

def check(condition,message):
    if not condition:raise AssertionError(message)

def run():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--url',default='http://127.0.0.1:5173/')
    ap.add_argument('--browser',choices=['chromium','firefox','webkit'],default='chromium')
    ap.add_argument('--executable');ap.add_argument('--headed',action='store_true');ap.add_argument('--game',action='store_true')
    ap.add_argument('--output',default='.local/v0.4.4-r3-tests/browser/result.json')
    args=ap.parse_args()
    if urlsplit(args.url).scheme not in ('http','https'):ap.error('Use a real HTTP(S) game URL.')
    out=Path(args.output);out.parent.mkdir(parents=True,exist_ok=True)
    report={'status':'RUNNING','gameRequested':args.game,'checks':[]};code=1
    try:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as pw:
            options={'headless':not args.headed}
            if args.executable:options['executable_path']=args.executable
            browser=getattr(pw,args.browser).launch(**options)
            try:
                report['browserVersion']=browser.version
                context=browser.new_context(viewport={'width':1280,'height':720});context.add_init_script('globalThis.__ZN_TEST_MODE__=true;')
                page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
                page.goto(args.url,wait_until='networkidle');page.wait_for_function('!!globalThis.__ZN_TEST__?.app')
                check(page.evaluate('ZiemiaNiczyja.uiRevision')==3,'Not revision 3')
                check(page.evaluate('ZiemiaNiczyja.state')=='language-select','No first-run picker')
                for tile in page.locator('.language-tile').all():
                    check(tile.evaluate("e=>getComputedStyle(e).borderWidth==='0px'&&getComputedStyle(e).outlineWidth==='0px'"),'Language frame reappeared')
                page.screenshot(path=str(out.parent/'language.png'));page.locator('#choose-en').click()
                page.wait_for_function("__ZN_TEST__.app.checkpointState!=='loading'")
                check(page.locator('.main-actions button').count()==4,'Main action count')
                check(page.title()=='No Man’s Land · Cambrai 1917','English browser title')
                check('logo-en.svg' in page.locator('.main-logo img').get_attribute('src'),'English logo')
                page.screenshot(path=str(out.parent/'main-en.png'))
                page.locator('[data-action=settings]').click();page.locator('#choice-language-next').click()
                check(page.evaluate('__ZN_TEST__.app.settings.language')=='pl','Language arrow did not change language')
                check(page.evaluate('document.activeElement.id')=='choice-language-next','Language change lost keyboard focus')
                for tab in ['controls','audio','graphics','gameplay']:
                    page.locator('#tab-'+tab).click();check(page.locator('[role=tabpanel]').count()==1,'Duplicated option panels')
                    check(page.locator('[data-setting=difficulty]').count()==0,'Difficulty must not be in Options')
                page.screenshot(path=str(out.parent/'options-pl.png'));page.locator('[data-action=back]').click()
                page.locator('[data-action=campaign-new]').click();skip=page.locator('[data-action=map-skip]')
                if skip.is_visible():skip.click()
                expected={'somme':'1916-07-01','flers':'1916-09-15','ypres':'1917-10','cambrai':'1917-11-20','amiens':'1918-08-08'};paths=[]
                for mission,date in expected.items():
                    page.locator(f'[data-action=campaign-select][data-mission-id={mission}]').click();page.wait_for_function('(date)=>document.querySelector("#front-layer").getAttribute("data-front-date")===date',arg=date)
                    layer=page.locator('#front-layer');check(layer.get_attribute('data-front-date')==date,'Wrong front date');paths.append(page.locator('#front-line').get_attribute('d'))
                    check(page.locator('[data-action=campaign-start]').count()==(1 if mission=='cambrai' else 0),'Unavailable mission can start')
                    stage=page.locator('.campaign-stage').bounding_box();rail=page.locator('.chapter-nav').bounding_box();check(stage['y']+stage['height']<=rail['y']+1,'Chapter rail is not below map')
                    page.screenshot(path=str(out.parent/f'campaign-{mission}.png'))
                check(len(set(paths))==5,'Front path does not change across chapters')
                page.locator('[data-action=settings]').click();page.select_option('#language','en');page.locator('[data-action=back]').click()
                check(page.locator('#front-layer').get_attribute('data-front-mission')=='amiens','Options reset selected chapter')
                check(page.evaluate('__ZN_TEST__.app.world===null'),'Menu created a world')
                report['checks']+=['localized game title and SVG logo','difficulty absent from all Options tabs','front settles on each target date','frame-free picker','4 main actions','language arrows and focus','4 option tabs','chapter rail below map','5 dated front snapshots','options preserve selection','menus do not load world']
                if args.game:
                    page.locator('[data-mission-id=cambrai]').click();page.locator('[data-action=campaign-start]').click()
                    page.wait_for_function("['ready','error'].includes(ZiemiaNiczyja.state)",timeout=65000)
                    check(page.evaluate('ZiemiaNiczyja.state')=='ready',page.locator('#menu').inner_text())
                    page.locator('[data-action=enter]').click();page.wait_for_function("ZiemiaNiczyja.state==='playing'",timeout=15000)
                    page.wait_for_timeout(500);check(page.locator('#hud [data-action=back]').count()==0,'Back button in gameplay')
                    check(page.locator('#minimap').evaluate("c=>c.getContext('2d').getImageData(0,0,1,1).data[3]===0"),'Radar corners not transparent')
                    c=page.locator('#hud-tactical').bounding_box();ammo=page.locator('.ammo-panel').bounding_box();check(c['y']+c['height']<ammo['y'],'HUD overlap')
                    page.screenshot(path=str(out.parent/'gameview-hud.png'));page.keyboard.press('Escape')
                    page.wait_for_function("ZiemiaNiczyja.state==='paused'");before=page.evaluate('JSON.stringify(__ZN_TEST__.app.world.snapshot())')
                    page.locator('[data-action=settings]').click();page.locator('#tab-gameplay').click();page.select_option('#language','pl');page.locator('[data-action=back]').click()
                    check(page.evaluate('JSON.stringify(__ZN_TEST__.app.world.snapshot())')==before,'Language/settings changed gameplay')
                    report['checks']+=['real GameView loaded','circular radar alpha','no gameplay back button','HUD layout','pause/settings preserve world']
                    page.locator('[data-action=exit]').click();page.wait_for_function("ZiemiaNiczyja.state==='main'")
                    page.locator('[data-action=campaign-continue]').click()
                    before=page.evaluate('structuredClone(__ZN_TEST__.app.checkpoint)')
                    selected='recruit' if before['difficulty']=='veteran' else 'veteran'
                    page.select_option('#campaign-difficulty',selected)
                    page.wait_for_function("!__ZN_TEST__.app.campaignDifficultyPending")
                    after=page.evaluate('structuredClone(__ZN_TEST__.app.checkpoint)')
                    check(after['difficulty']==selected,'Continuation difficulty not changed')
                    after['difficulty']=before['difficulty'];check(after==before,'Difficulty altered other checkpoint fields')
                    page.reload(wait_until='networkidle');page.wait_for_function("__ZN_TEST__.app.checkpointState!=='loading'")
                    check(page.evaluate('__ZN_TEST__.app.checkpoint.difficulty')==selected,'Difficulty did not survive native reload')
                    check(page.evaluate('__ZN_TEST__.app.campaignProgress.checkpointRef.difficulty')==selected,'Native checkpoint/metadata mismatch')
                    report['checks']+=['continuation difficulty preserves non-difficulty fields','native difficulty and metadata survive reload']
                check(not errors,errors);report['status']='PASS';code=0
            finally:browser.close()
    except Exception as error:
        text=str(error);blocked=any(x in text for x in ['ERR_BLOCKED_BY_ADMINISTRATOR','Executable doesn'])
        report.update(status='BLOCKED' if blocked else 'FAIL',error=text);code=2 if blocked else 1
    out.write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n',encoding='utf-8');print(json.dumps(report,indent=2,ensure_ascii=False));return code
if __name__=='__main__':sys.exit(run())
