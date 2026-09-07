import test from 'node:test';
import assert from 'node:assert/strict';
import {hudMarkup} from '../src/ui/hud/hud.js';
import {arrangeHud,rectanglesOverlap} from '../src/ui/hud/layout.js';
import {setLanguage,message} from '../src/i18n/index.js';
const subtitles=await import('../src/ui/hud/subtitle.js').catch(()=>({}));

test('r2: HP has a number and medical cross, not a second health bar',()=>{
 const markup=hudMarkup();assert.ok(markup.includes('id="hp"'));assert.ok(markup.includes('health-cross'));
 assert.ok(!markup.includes('hp-fill'));assert.ok(!markup.includes('class="health-bar"'));
 assert.equal((markup.match(/class="stamina-bar"/g)||[]).length,1);
});
test('r2: stamina spans the full stance-to-HP row at independent scales',()=>{
 for(const stanceScale of [.5,1,1.5,2])for(const healthScale of [.5,1,1.5,2])for(const staminaScale of [.5,1,2]){
  const sizes={stance:{width:42*stanceScale,height:42*stanceScale},health:{width:76*healthScale,height:30*healthScale},stamina:{width:90*staminaScale,height:3*staminaScale}};
  const r=arrangeHud({width:1280,height:720},sizes).rects;
  assert.equal(r.stamina.left,r.stance.left);assert.equal(r.stamina.right,r.health.right);
  assert.ok(r.stamina.top>=Math.max(r.stance.bottom,r.health.bottom)+6);
  assert.ok(!rectanglesOverlap(r.stamina,r.health));assert.ok(!rectanglesOverlap(r.stamina,r.stance));
  assert.equal(r.stamina.height,3*staminaScale);
  assert.equal(r.stance.top+r.stance.height/2,r.health.top+r.health.height/2);
 }
});
test('r2: subtitle model resolves PL/EN, keeps names inline and clears expired messages',()=>{
 assert.equal(typeof subtitles.subtitleContent,'function');
 const caption={speaker:message('speaker.shaw'),text:message('briefing.line1')};
 setLanguage('en');const en=subtitles.subtitleContent(caption,'',0,0,true);
 assert.equal(en.visible,true);assert.ok(en.speaker.endsWith(': '));assert.ok(!en.speaker.includes('\n'));
 setLanguage('pl');const pl=subtitles.subtitleContent(caption,'',0,0,true);assert.notEqual(en.text,pl.text);
 assert.equal(subtitles.subtitleContent(caption,'',0,0,false).visible,false);
 const system=subtitles.subtitleContent(null,'Orders: move out',5,10,true);assert.equal(system.speaker,'');assert.equal(system.text,'Orders: move out');
 assert.equal(subtitles.subtitleContent(null,'expired',10,10,true).visible,false);
 assert.equal(subtitles.subtitleContent({speaker:'Shaw:',text:'Go'},'',0,0,true).speaker,'Shaw: ');
 setLanguage('en');
});
test('r2: subtitle updates preserve nodes and treat malicious text as text, not markup',()=>{
 assert.equal(typeof subtitles.updateSubtitle,'function');
 const speaker={textContent:'',hidden:true},body={textContent:''};
 const root={hidden:true,querySelector:q=>q==='.subtitle-speaker'?speaker:body};
 assert.equal(subtitles.updateSubtitle(root,{visible:true,speaker:'<img>: ',text:'<script>alert(1)</script>'}),true);
 assert.equal(speaker.textContent,'<img>: ');assert.equal(body.textContent,'<script>alert(1)</script>');assert.equal(speaker.hidden,false);
 assert.equal(subtitles.updateSubtitle(root,{visible:true,speaker:'<img>: ',text:'<script>alert(1)</script>'}),false);
 subtitles.updateSubtitle(root,{visible:true,speaker:'',text:'System'});assert.equal(speaker.hidden,true);
 subtitles.updateSubtitle(root,{visible:false,speaker:'',text:''});assert.equal(root.hidden,true);assert.equal(body.textContent,'');
});
