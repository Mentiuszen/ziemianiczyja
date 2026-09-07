import {HUD_SCALE_KEYS,HUD_SETTING_KEYS,getHudScale} from '../hud/settings.js';
import {crosshairMarkup} from '../hud/crosshair.js';
import {SETTINGS_SCHEMA,OPTIONS_TABS,DEFAULT_KEYS} from '../../save/settings-schema.js';
import {t,number} from '../../i18n/index.js';
import {escape,tr,html,keyLabel,back,quiet,shell} from '../common.js';
export function settingValue(key,value){return key==='maxFps'?(value===0?t('options.unlimited'):String(value)):key==='fov'?`${Math.round(value)}°`:key==='sensitivity'?`${number(value,2)}×`:`${Math.round(value*100)}%`;}
export function stepChoice(key,value,direction){const d=SETTINGS_SCHEMA[key];if(d?.type!=='choice'||![-1,1].includes(direction))return undefined;const at=d.values.indexOf(value);return d.values[(Math.max(0,at)+direction+d.values.length)%d.values.length];}
export const switchValue=value=>t(value?'options.on':'options.off');
function row(key,s){
 const d=SETTINGS_SCHEMA[key],label=tr(`settings.${key}`),id=key==='language'?'language':`set-${key}`;
 let control='';
 if(d.type==='choice'){
  const option=value=>key==='language'?(value==='en'?'English':'Polski'):t(`${key==='quality'?'quality':key==='crosshairStyle'?'crosshair':'difficulty'}.${value}`);
  const arrow=(direction,icon)=>`<button type="button" id="choice-${key}-${direction<0?'prev':'next'}" class="choice-arrow" data-action="setting-step" data-setting-key="${key}" data-direction="${direction}" aria-label="${escape(t(direction<0?'options.previousValue':'options.nextValue',{setting:t(`settings.${key}`)}))}" aria-controls="${id}">${icon}</button>`;
  control=`<div class="choice-control">${arrow(-1,'‹')}<select id="${id}" data-setting="${key}">${d.values.map(v=>`<option value="${v}" ${s[key]===v?'selected':''}>${escape(option(v))}</option>`).join('')}</select>${arrow(1,'›')}</div>`;
 }else if(d.type==='boolean'){
  control=`<label class="switch-control" for="${id}"><span class="switch-value" aria-hidden="true">${escape(switchValue(s[key]))}</span><input type="checkbox" role="switch" id="${id}" data-setting="${key}" ${s[key]?'checked':''} aria-labelledby="label-${key}"><span class="switch-track" aria-hidden="true"></span></label>`;
 }else control=`<div class="range-box"><input type="${d.type==='number'?'number':'range'}" id="${id}" data-setting="${key}" min="${d.min}" max="${d.max}" step="${d.step}" value="${s[key]}" ${key==='maxFps'?'aria-describedby="fps-help"':''}><output class="value" for="${id}">${escape(settingValue(key,s[key]))}</output></div>`;
 const moduleId=Object.keys(HUD_SCALE_KEYS).find(id=>HUD_SCALE_KEYS[id]===key);
 const effective=moduleId?`<small class="hud-effective" data-hud-effective="${moduleId}"></small>`:'';
 return `<div class="setting"><label id="label-${key}" for="${id}">${label}${effective}</label>${control}</div>`;
}
export function settingsScreen(app,tab='gameplay'){
 if(!OPTIONS_TABS.includes(tab))tab='gameplay';
 const s=app.settings;let rows=Object.entries(SETTINGS_SCHEMA).filter(([k,d])=>d.category===tab&&!HUD_SETTING_KEYS.includes(k)).map(([k])=>row(k,s)).join('');
 if(tab==='gameplay')rows+=`<section class="hud-settings"><h2>${tr('options.hudTitle')}</h2>${row('hudScale',s)}${row('crosshairStyle',s)}<div class="crosshair-preview" role="img" aria-label="${escape(t('options.hudPreview'))}"><div class="crosshair" data-crosshair-preview data-style="${s.crosshairStyle}">${crosshairMarkup()}</div></div><details><summary>${tr('options.hudIndividual')}</summary>${Object.values(HUD_SCALE_KEYS).map(k=>row(k,s)).join('')}</details><p class="compact-help" id="hud-layout-status">${tr('options.hudLayoutHint')}</p>${quiet('options.hudReset','hud-reset')}</section>`;
 if(tab==='graphics')rows+=`<p class="compact-help" id="fps-help">${tr('options.fpsHint')}</p>`;
 if(tab==='controls')rows+=`${Object.keys(DEFAULT_KEYS).map(key=>`<div class="setting"><label for="bind-${key}">${tr(`control.${key}`)}</label><button type="button" id="bind-${key}" class="setting-button" data-action="bind" data-key="${key}">${html(keyLabel(s.keys[key]))}</button></div>`).join('')}<div class="fixed-controls">${[['options.fixedLook','options.mouse'],['options.fixedFire','options.buttons'],['options.fixedSwitch','options.wheel']].map(([label,key])=>`<div class="setting"><span>${tr(label)}</span><span>${tr(key)}</span></div>`).join('')}<div class="setting"><span>${tr('options.fixedSystem')}</span><span>Esc / F3</span></div></div>`;
 return shell(`<div class="screen-heading"><h1>${tr('action.settings')}</h1></div><div role="tablist" class="options-tabs" aria-label="${escape(t('action.settings'))}">${OPTIONS_TABS.map(id=>`<button type="button" role="tab" id="tab-${id}" data-action="options-tab" data-tab="${id}" aria-controls="options-content" aria-selected="${id===tab}" tabindex="${id===tab?0:-1}">${tr(`options.${id}`)}</button>`).join('')}</div><section class="options-content" role="tabpanel" id="options-content" aria-labelledby="tab-${tab}" tabindex="0">${rows}</section><div class="panel-actions options-footer">${back()}${quiet('action.resetCategory','category-reset')}${app.storageWarning?`<p class="compact-error" role="status">${html(app.storageWarning)}</p>`:''}</div>`,{variant:'settings-screen'});
}

export function refreshHudOptions(menu,settings,layout){
 for(const e of menu.querySelectorAll?.('[data-hud-effective]')||[]){const scale=getHudScale(settings,e.dataset.hudEffective);e.textContent=t(scale>=2?'options.hudLimit':'options.hudEffective',{scale:Math.round(scale*100)});}
 const preview=menu.querySelector?.('[data-crosshair-preview]');if(preview){preview.dataset.style=settings.crosshairStyle||'cross';preview.style.setProperty('--cross-scale',getHudScale(settings,'crosshair'));}
 const status=menu.querySelector?.('#hud-layout-status');if(status)status.textContent=t(layout?.compact?'options.hudCompact':'options.hudLayoutHint');
}
