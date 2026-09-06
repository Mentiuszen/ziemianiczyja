import test from 'node:test';
import assert from 'node:assert/strict';
import {UI} from '../src/ui/ui.js';
import {DIFFICULTIES} from '../src/data/weapons.js';
import {DEFAULT_SETTINGS} from '../src/save/store.js';

function screen(state,chosen='soldier',loaded=null){
 const ui=Object.create(UI.prototype);
 ui.menu={innerHTML:'',hidden:false};ui.hud={hidden:false};
 ui.app={settings:{...DEFAULT_SETTINGS,difficulty:chosen},checkpoint:null,
  world:loaded?{difficulty:DIFFICULTIES[loaded],director:{objective:{title:'Cel'}}}:null};
 ui.render(state);return ui.menu.innerHTML;
}
for(const [id,seconds,rate] of [['recruit',3,25],['soldier',4,20],['veteran',5,16]]){
 test(`death advice describes the selected ${id} regeneration`,()=>{
  const html=screen('dead',id);assert.ok(html.includes(`po ${seconds} s`));assert.ok(html.includes(`${rate} HP/s`));
 });
}
test('ready screen reports checkpoint difficulty rather than next-mission selection',()=>{
 assert.ok(screen('ready','recruit','veteran').includes('Trudność tej misji: Weteran'));
});
test('death advice uses the loaded mission profile',()=>{
 const html=screen('dead','recruit','veteran');assert.ok(html.includes('po 5 s'));assert.ok(html.includes('16 HP/s'));
});
test('options no longer expose difficulty while pause retains the loaded mission profile',()=>{
 const html=screen('settings','recruit','veteran');assert.doesNotMatch(html,/data-setting="difficulty"|Trudność nowej kampanii/);assert.ok(screen('paused','recruit','veteran').includes('Trudność tej misji: Weteran'));
});
