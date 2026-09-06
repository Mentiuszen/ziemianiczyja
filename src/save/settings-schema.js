/** One source of truth for options, defaults and storage validation. */
export const DEFAULT_KEYS=Object.freeze({forward:'KeyW',back:'KeyS',left:'KeyA',right:'KeyD',sprint:'ShiftLeft',crouch:'KeyC',prone:'KeyZ',jump:'Space',interact:'KeyE',reload:'KeyR',grenade:'KeyG',melee:'KeyV',slot1:'Digit1',slot2:'Digit2'});
export const VALID_KEY=/^(Key[A-Z]|Digit[0-9]|Shift(Left|Right)|Control(Left|Right)|Alt(Left|Right)|Space|Arrow(Up|Down|Left|Right))$/;
const range=(category,value,min,max,step=.05)=>Object.freeze({category,type:'range',default:value,min,max,step});
const toggle=(category,value=true)=>Object.freeze({category,type:'boolean',default:value});
const choice=(category,value,values)=>Object.freeze({category,type:'choice',default:value,values:Object.freeze(values)});
export const OPTIONS_TABS=Object.freeze(['gameplay','controls','audio','graphics']);
export const SETTINGS_SCHEMA=Object.freeze({
 language:choice('gameplay',null,['pl','en']),difficulty:choice('campaign','soldier',['recruit','soldier','veteran']),
 subtitles:toggle('gameplay'),motion:range('gameplay',.45,0,1),damageEffects:range('gameplay',1,0,1),
 showMinimap:toggle('gameplay'),showAllyMarkers:toggle('gameplay'),uiAnimations:toggle('gameplay'),
 sensitivity:range('controls',1,.2,3),master:range('audio',.7,0,1),effects:range('audio',.85,0,1),ambient:range('audio',.35,0,1),
 quality:choice('graphics','medium',['low','medium','high','ultra']),maxFps:Object.freeze({...range('graphics',0,0,360,1),type:'number'}),
 renderScale:range('graphics',1,.5,1.5),fov:range('graphics',78,60,105,1),
 showFps:toggle('graphics'),showCpu:toggle('graphics',false),showGpu:toggle('graphics',false),
});
export const DEFAULT_SETTINGS=Object.freeze({...Object.fromEntries(Object.entries(SETTINGS_SCHEMA).map(([k,d])=>[k,d.default])),keys:DEFAULT_KEYS});
export function normalizeSetting(key,value){
 if(!Object.hasOwn(SETTINGS_SCHEMA,key))return undefined;
 const d=SETTINGS_SCHEMA[key];
 if(d.type==='choice')return d.values.includes(value)?value:d.default;
 if(d.type==='boolean')return typeof value==='boolean'?value:d.default;
 if(typeof value!=='number'||!Number.isFinite(value))return d.default;
 const clamped=Math.max(d.min,Math.min(d.max,value));return d.step===1?Math.round(clamped):clamped;
}
export function normalizeSettings(raw){
 const s={keys:{...DEFAULT_KEYS}};
 for(const key of Object.keys(SETTINGS_SCHEMA))s[key]=normalizeSetting(key,raw?.[key]);
 for(const key of Object.keys(DEFAULT_KEYS))if(typeof raw?.keys?.[key]==='string'&&VALID_KEY.test(raw.keys[key]))s.keys[key]=raw.keys[key];
 return s;
}
export function resetCategory(settings,category){
 if(!OPTIONS_TABS.includes(category))throw new RangeError('Unknown options category');
 const next=normalizeSettings(settings);
 for(const [key,d] of Object.entries(SETTINGS_SCHEMA))if(d.category===category&&key!=='language')next[key]=d.default;
 if(category==='controls')next.keys={...DEFAULT_KEYS};return next;
}
