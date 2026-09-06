import test from 'node:test';
import assert from 'node:assert/strict';
import {Store,DEFAULT_SETTINGS} from '../src/save/store.js';
import {UI} from '../src/ui/ui.js';
import {Application} from '../src/app.js';
import {Simulation} from '../src/core/simulation.js';
import {OBJECTIVES} from '../src/data/cambrai.js';
const locale=await import('../src/i18n/index.js').catch(()=>null);
const requireLocale=()=>{assert.ok(locale,'0.4.3 must provide the localization module');return locale;};
function storage(t,value){const original=Object.getOwnPropertyDescriptor(globalThis,'localStorage');const map=new Map(value===undefined?[]:[['zn-settings-v1',JSON.stringify(value)]]);Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)}});t.after(()=>{if(original)Object.defineProperty(globalThis,'localStorage',original);else delete globalThis.localStorage;});return map;}
function screen(state){const ui=Object.create(UI.prototype);ui.menu={innerHTML:'',hidden:false};ui.hud={hidden:false};ui.app={settings:{...DEFAULT_SETTINGS,keys:{...DEFAULT_SETTINGS.keys}},checkpoint:null,world:null};ui.render(state);return ui.menu.innerHTML;}

test('first run leaves language unselected rather than silently choosing Polish',t=>{storage(t);assert.equal(new Store(()=>{}).settings().language,null);});
test('older settings show the picker without losing controls or quality',t=>{storage(t,{quality:'high',keys:{interact:'KeyF'},fov:92});const s=new Store(()=>{}).settings();assert.equal(s.language,null);assert.equal(s.keys.interact,'KeyF');assert.equal(s.fov,92);assert.equal(s.quality,'high');});
for(const language of ['pl','en'])test(`validated ${language} choice survives settings save/load`,t=>{storage(t,{language});const store=new Store(()=>{}),s=store.settings();assert.equal(s.language,language);assert.equal(store.saveSettings(s),true);assert.equal(new Store(()=>{}).settings().language,language);});
for(const language of ['fr','EN','',true,{},42])test(`invalid language ${JSON.stringify(language)} returns to explicit choice`,t=>{storage(t,{language});assert.equal(new Store(()=>{}).settings().language,null);});
test('first-run screen contains two actionable language tiles, not the main menu',()=>{const html=screen('language-select');assert.match(html,/data-language="en"/);assert.match(html,/data-language="pl"/);assert.match(html,/>English</);assert.match(html,/>Polski</);assert.doesNotMatch(html,/data-action="start"|data-action="brief"/);});
test('English menu and settings are translated with a language selector',()=>{const l=requireLocale();l.setLanguage('en');try{assert.match(screen('main'),/New Campaign/);assert.match(screen('settings'),/Language/);assert.match(screen('settings'),/data-setting="language"/);assert.doesNotMatch(screen('main'),/Rozpocznij|Ustawienia|Pęknięta/);}finally{l.setLanguage('pl');}});
test('localized objective descriptors do not freeze into the selected language',()=>{const l=requireLocale();assert.equal(typeof OBJECTIVES[0].title,'object');l.setLanguage('pl');const pl=l.text(OBJECTIVES[0].title);l.setLanguage('en');const en=l.text(OBJECTIVES[0].title);assert.notEqual(pl,en);l.setLanguage('pl');});
test('switching language never changes gameplay snapshots',()=>{const l=requireLocale();l.setLanguage('pl');const world=new Simulation(),before=world.snapshot();l.setLanguage('en');assert.deepEqual(world.snapshot(),before);l.setLanguage('pl');});
test('message params are resolved on display, including a remapped interaction key',()=>{const l=requireLocale();l.setLanguage('en');const hint=l.text(OBJECTIVES[0].hint,{interact:'F'});assert.match(hint,/\[F\]/);assert.doesNotMatch(hint,/\[E\]|\{interact\}/);l.setLanguage('pl');});
test('application supports changing language without starting a mission',()=>{assert.equal(typeof Application.prototype.selectLanguage,'function');});
