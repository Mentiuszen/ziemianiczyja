#!/usr/bin/env python3
"""CAM-01 integration regression on the actual application, GameView and renderer.

Start npm run dev (or preview), then:
  python tools/browser_v042_camera.py --url http://127.0.0.1:5173/ --headed
Requires Python 3.10+ and Playwright with an installed Chromium/Firefox browser.
The test uses a NEW isolated browser context, never a player's existing session.
Missing WebGL2 is BLOCKED (exit 2), not PASS. Assertion failures exit 1.
"""
from __future__ import annotations
import argparse
import json
import sys
from pathlib import Path
from urllib.parse import urlsplit

# Do not enable updateUpVectorFromRotation here. The production constructor owns it.
CASE = r"""async ({quality, motion, fps}) => {
 const {Vector3}=await import(new URL('src/render/babylon.js',location.href).href);
 const app=globalThis.__ZN_TEST__?.app;
 if(!app?.view||app.state!=='ready')throw Error('Expected a fresh ready GameView');
 const view=app.view,w=app.world,p=w.player,c=view.camera,rad=Math.PI/180;
 app.changeSetting('quality',quality);app.changeSetting('motion',motion);
 view.applySettings(app.settings);
 const read=()=>{const u=Vector3.TransformNormal(new Vector3(0,1,0),c.getViewMatrix());return Math.atan2(u.x,u.y)/rad;};
 const check=(label,expected=0)=>{
  const measured=read();
  if(!Number.isFinite(measured)||Math.abs(measured-expected)>.1)
   throw Error(`${label}: roll=${measured}, expected=${expected}, z=${c.rotation.z}`);
  return Math.abs(measured-expected);
 };
 let error=0,checks=0;
 p.recoil=0;p.moving=false;
 for(const pitch of [-60,-30,-12,0,12,30,60])for(const yaw of [0,90,180,270]){
  w.time=1;p.pitch=pitch*rad;p.yaw=yaw*rad;view.effects.trauma=.65;view.sync(0);
  error=Math.max(error,check('shake',c.rotation.z/rad));checks++;
  view.effects.trauma=0;view.sync(0);error=Math.max(error,check('shake ended'));checks++;
  p.pitch=0;p.yaw=(yaw+90)*rad;view.sync(0);error=Math.max(error,check('turn after shake'));checks++;
  view.render(false);error=Math.max(error,check('actual scene render'));checks++;
 }
 // Real explosion event and natural simulation-time decay, with changing yaw/pitch.
 w.time=2;p.pitch=30*rad;p.yaw=0;view.sync(0);
 view.event({type:'explosion',pos:{...p.pos},time:w.time});
 if(!(view.effects.trauma>0))throw Error('Explosion did not produce trauma');
 for(let frame=0;frame<Math.ceil(fps*.7);frame++){
  w.time+=1/fps;p.yaw+=1.7/fps;p.pitch=Math.sin(w.time)*.4;p.ads=frame%2===0;
  view.sync(1/fps);error=Math.max(error,check('natural decay',c.rotation.z/rad));checks++;
 }
 view.sync(0);if(view.effects.trauma!==0)throw Error('Trauma did not expire');
 error=Math.max(error,check('natural effect ended'));checks++;
 // Paused rerenders and settings changes must not revive the old basis.
 app.go('paused');view.render(false);error=Math.max(error,check('pause'));checks++;
 app.changeSetting('motion',0);view.applySettings(app.settings);view.render(false);
 error=Math.max(error,check('motion disabled'));checks++;
 app.go('ready');return{quality,motion,fps,checks,maxErrorDegrees:error};
}"""


def main() -> int:
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--url',default='http://127.0.0.1:5173/')
    parser.add_argument('--browser',choices=['chromium','firefox'],default='chromium')
    parser.add_argument('--executable',help='Optional path to installed browser')
    parser.add_argument('--headed',action='store_true')
    parser.add_argument('--output',default='.local/v0.4.2-tests/camera/result.json')
    args=parser.parse_args()
    if urlsplit(args.url).scheme not in ('http','https'):
        parser.error('--url must be an HTTP(S) game origin, not file://')
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print('BLOCKED: install Playwright: python -m pip install playwright',file=sys.stderr)
        return 2
    report={'status':'RUNNING','url':args.url,'browser':args.browser,'cases':[]}
    code=1
    try:
        with sync_playwright() as pw:
            options={'headless':not args.headed}
            if args.executable:
                options['executable_path']=args.executable
            browser=getattr(pw,args.browser).launch(**options)
            try:
                context=browser.new_context(viewport={'width':1280,'height':720})
                context.add_init_script('globalThis.__ZN_TEST_MODE__=true;')
                page=context.new_page()
                page.goto(args.url,wait_until='domcontentloaded')
                if not page.evaluate("!!document.createElement('canvas').getContext('webgl2')"):
                    report.update(status='BLOCKED',reason='WebGL2 unavailable in this browser environment')
                    code=2
                else:
                    page.wait_for_function('!!globalThis.__ZN_TEST__?.app')
                    if page.locator('#choose-pl').count():
                        page.locator('#choose-pl').click()
                    page.evaluate('async()=>{await globalThis.__ZN_TEST__.app.start();}')
                    page.wait_for_function("globalThis.__ZN_TEST__.app.state==='ready'",timeout=60000)
                    for quality in ['low','medium','high','ultra']:
                        for motion in [0,.45,1]:
                            for fps in [30,60,120,144]:
                                report['cases'].append(page.evaluate(CASE,{'quality':quality,'motion':motion,'fps':fps}))
                    # Actual checkpoint load creates a new GameView with the same contract.
                    page.evaluate('async()=>{const a=globalThis.__ZN_TEST__.app;await a.start(a.checkpoint);}')
                    report['checkpointCase']=page.evaluate(CASE,{'quality':'medium','motion':.45,'fps':60})
                    report['runtime']=page.evaluate('globalThis.ZiemiaNiczyja.version')
                    report['status']='PASS';code=0
                    page.evaluate('()=>{const a=globalThis.__ZN_TEST__.app;a.alive=false;a.disposeMission();a.audio.dispose();a.input.dispose();}')
                context.close()
            finally:
                browser.close()
    except Exception as error:
        blocked=any(text in str(error) for text in ('ERR_BLOCKED_BY_ADMINISTRATOR', "Executable doesn't exist"))
        report.update(status='BLOCKED' if blocked else 'FAIL',reason=f'{type(error).__name__}: {error}')
        code=2 if blocked else 1
    output=Path(args.output);output.parent.mkdir(parents=True,exist_ok=True)
    output.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(f"{report['status']}: {len(report['cases'])} cases; {output}")
    if 'reason' in report:
        print(report['reason'],file=sys.stderr)
    return code

if __name__=='__main__':
    raise SystemExit(main())
