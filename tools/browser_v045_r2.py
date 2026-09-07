#!/usr/bin/env python3
"""Rew2 acceptance: real UI + Simulation in Chromium, synthetic view, no GPU claim.
Reuses the transport-isolated module loader from browser_v045.py. Screenshots are
HUD previews, not captures of the rendered 3D mission. Requires playwright (test only).
"""
from pathlib import Path
import argparse,json
from browser_v045 import memory_ui,update

def run():
 from playwright.sync_api import sync_playwright
 ap=argparse.ArgumentParser(description=__doc__)
 ap.add_argument('--executable',default=None)
 ap.add_argument('--output',default='.local/v045-r2-browser')
 args=ap.parse_args();out=Path(args.output);out.mkdir(parents=True,exist_ok=True)
 report={'mode':'real DOM + Simulation, synthetic view (no WebGL)','checks':[],'layouts':[],'status':'RUNNING'}
 errors=[]
 try:
  with sync_playwright() as pw:
   browser=pw.chromium.launch(headless=True,**({'executable_path':args.executable} if args.executable else {}));report['browser']=browser.version
   page=browser.new_page(viewport={'width':1920,'height':1080});page.on('pageerror',lambda e:errors.append(str(e)));memory_ui(page)
   for language in ['en','pl']:
    for width,height in [(800,600),(1280,720),(1920,1080),(2560,1440)]:
     page.set_viewport_size({'width':width,'height':height})
     for scale in [.5,1,1.5,2]:
      page.evaluate('''({language,scale})=>{const {app,i18n}=__V045__;i18n.setLanguage(language);app.settings.language=language;app.settings.hudScale=scale;app.world.player.health.hp=100;app.ui.localizeHUD();app.ui.layout.invalidate();}''',{'language':language,'scale':scale});update(page)
      data=page.evaluate('''()=>{
       const rect=id=>document.querySelector(id).getBoundingClientRect(),hp=rect('#hp'),stance=rect('#stance-icon'),bar=rect('.stamina-bar'),weapon=rect('#weapon-icon'),ammo=rect('.ammo-number');
       const speaker=document.querySelector('.subtitle-speaker'),body=document.querySelector('.subtitle-text'),range=document.createRange();range.setStart(body.firstChild,0);range.setEnd(body.firstChild,1);
       const boxes=[...document.querySelectorAll('.hud-slot:not([hidden])')].map(n=>n.firstElementChild.getBoundingClientRect());
       const overlaps=boxes.some((a,i)=>boxes.slice(i+1).some(b=>a.left<b.right-.6&&a.right>b.left+.6&&a.top<b.bottom-.6&&a.bottom>b.top+.6));
       return {staminaLeft:bar.left-stance.left,staminaRight:bar.right-hp.right,ammoGap:ammo.left-weapon.right,overlaps,barCount:document.querySelectorAll('.health-panel .health-bar').length,speaker:speaker.textContent,inline:Math.abs(speaker.getBoundingClientRect().top-range.getBoundingClientRect().top)<3,background:getComputedStyle(document.querySelector('#subtitle')).backgroundColor,globalSkip:!document.querySelector('#interaction').hidden};
      }''')
      report['layouts'].append({'language':language,'width':width,'height':height,'scale':scale,**data})
      assert abs(data['staminaLeft'])<1 and abs(data['staminaRight'])<1,data
      assert abs(data['ammoGap']-10*scale)<1,data
      assert data['barCount']==0 and not data['overlaps'] and not data['globalSkip'],data
      # A subtitle may legitimately be hidden in compact mode. Normal screens must display it.
      if width>=1280:
       assert data['speaker'].endswith(': ') and data['inline'],data
       assert data['background']=='rgba(0, 0, 0, 0)',data
      if width==1920 and scale in [1,2]:page.screenshot(path=str(out/f'hud-{language}-{int(scale*100)}.png'))
   report['checks'].append('32 viewport/language/scale combinations: HP/stamina endpoints, compact ammo, transparent inline subtitles, no global skip')
   page.set_viewport_size({'width':1920,'height':1080})
   for weapon in ['smle','gewehr','webley','lewis','mg08']:
    page.evaluate('''async id=>{const {Weapon}=await import('zn:src/combat/weapon.js');const {app}=__V045__;app.world.player.weapons[0]=new Weapon(id);app.world.player.slot=0;app.settings.hudScale=1;app.ui.layout.invalidate();}''',weapon);update(page)
    assert page.locator('#weapon-icon').evaluate('e=>e.complete&&e.naturalWidth>0')
    gap=page.evaluate("document.querySelector('.ammo-number').getBoundingClientRect().left-document.querySelector('#weapon-icon').getBoundingClientRect().right")
    assert abs(gap-10)<1,(weapon,gap)
   for stance in ['stand','crouch','prone']:
    page.evaluate("stance=>{__V045__.app.world.player.stance=stance;}",stance);update(page)
    assert page.locator('#stance-icon').evaluate('e=>e.complete&&e.naturalWidth>0')
    assert page.locator('#stance-icon').get_attribute('data-stance')==stance
    page.locator('.health-panel').screenshot(path=str(out/f'health-{stance}.png'))
   report['checks'].append('all five weapon assets decode with a 10px gap; three filled stance silhouettes decode')
   for seed in range(12):
    page.evaluate('''seed=>{const {app}=__V045__;app.settings.hudScale=1;app.settings.hudStanceScale=[.5,1,2][seed%3];app.settings.hudHealthScale=[2,1,.5][Math.floor(seed/3)%3];app.settings.hudStaminaScale=[.5,2][seed%2];app.world.player.health.hp=seed%2?9:100;app.ui.layout.invalidate();}''',seed);update(page)
    assert page.evaluate('''()=>{const bar=document.querySelector('.stamina-bar').getBoundingClientRect(),a=document.querySelector('#stance-icon').getBoundingClientRect(),b=document.querySelector('#hp').getBoundingClientRect();return Math.abs(bar.left-a.left)<1&&Math.abs(bar.right-b.right)<1&&bar.top>Math.max(a.bottom,b.bottom);}''')
   report['checks'].append('12 independent stance/health/stamina scale combinations retain bar alignment')
   # Pause/language/expiry do not replace subtitle nodes or reinterpret message HTML.
   page.evaluate('''()=>{const {app}=__V045__;globalThis.__SUBTITLE_NODE__=app.ui.el.subtitle.firstElementChild;app.world.player.stance='stand';app.world.player.yaw=Math.PI/2;app.world.player.pos={x:37.6,y:app.world.briefingDoor.floor-.02,z:-7.8};app.ui.layout.invalidate();}''');update(page)
   assert page.locator('#interaction').is_visible();page.locator('#interaction').screenshot(path=str(out/'door-prompt.png'))
   page.evaluate('''()=>{const {app}=__V045__;app.world.interact();for(const e of app.world.consumeEvents())app.ui.event(e);}''');update(page)
   assert not page.locator('#interaction').is_visible()
   assert page.evaluate('__V045__.app.world.director.phase')==1
   assert page.locator('.subtitle-speaker').evaluate('e=>e.hidden')
   assert page.evaluate('__SUBTITLE_NODE__===__V045__.app.ui.el.subtitle.firstElementChild')
   page.evaluate('''()=>{const {app}=__V045__;app.ui.message='<img src=x onerror=alert(1)> literal message';app.ui.messageUntil=100;app.world.time=1;}''');update(page)
   assert page.locator('#subtitle img').count()==0
   assert '<img' in page.locator('.subtitle-text').inner_text()
   page.evaluate('__V045__.app.world.time=101');update(page)
   assert not page.locator('#subtitle').is_visible()
   report['checks'].append('near-door prompt/action, subtitle node identity, speakerless mission message, escaped text and expiry')
   assert not errors,errors;report['status']='PASS';browser.close()
 except Exception as e:
  report['status']='FAIL';report['error']=str(e)
 report['pageErrors']=errors
 (out/'result.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
 print(json.dumps({k:v for k,v in report.items() if k!='layouts'},ensure_ascii=False,indent=2))
 raise SystemExit(0 if report['status']=='PASS' else 1)
if __name__=='__main__':run()
