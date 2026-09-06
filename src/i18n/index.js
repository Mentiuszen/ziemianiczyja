import pl from './pl.js';
import en from './en.js';
import {isLanguage} from './message.js';
export {message,isLanguage,normalizeLanguage} from './message.js';
export const CATALOGUES=Object.freeze({pl,en});
let language='pl';
const formats=new Map();
export const getLanguage=()=>language;
export function setLanguage(value){
 if(!isLanguage(value))throw new RangeError(`Unsupported language: ${String(value)}`);
 language=value;
}
export const hasKey=key=>Object.hasOwn(pl,key)&&Object.hasOwn(en,key);
/** Strict lookup: tests/build reject missing keys and mismatched parameter contracts. */
export function translate(locale,key,params={}){
 if(!isLanguage(locale))throw new RangeError(`Unsupported language: ${String(locale)}`);
 const catalogue=CATALOGUES[locale];
 if(!Object.hasOwn(catalogue,key))throw new RangeError(`Missing translation: ${locale}/${key}`);
 return catalogue[key].replace(/\{([a-zA-Z][a-zA-Z0-9_]*)\}/g,(_,name)=>{
  if(!Object.hasOwn(params,name))throw new TypeError(`Missing parameter: ${key}/${name}`);
  return resolve(locale,params[name]);
 });
}
export const t=(key,params={})=>translate(language,key,params);
function resolve(locale,value,params={}){
 if(value&&typeof value==='object'&&typeof value.key==='string')return translate(locale,value.key,{...value.params,...params});
 if(value instanceof Error)return errorText(value,locale);
 if(value===null||value===undefined)return '';
 return String(value);
}
export const text=(value,params={})=>resolve(language,value,params);
export function number(value,digits=0){
 const key=`${language}:${digits}`;
 if(!formats.has(key))formats.set(key,new Intl.NumberFormat(language==='pl'?'pl-PL':'en-US',{useGrouping:false,minimumFractionDigits:digits,maximumFractionDigits:digits}));
 return formats.get(key).format(value);
}
export function errorText(error,locale=language){
 if(error&&hasKey(error.key))return translate(locale,error.key,error.params||{});
 const name=error?.name;
 // Browser/driver prose may use the OS language; show only a stable technical type.
 const type=typeof name==='string'&&/^[A-Za-z][A-Za-z0-9]*Error$/.test(name)?name:'Error';
 if(type==='AbortError')return translate(locale,'error.loadCancelled');
 return translate(locale,'error.unknown',{type});
}
/** Keeps the historical Polish diagnostic for existing tools; the UI uses key/params. */
export class LocalizedError extends Error {
 constructor(key,params={},name='LocalizedError'){
  super(translate('pl',key,params));
  this.name=name;this.key=key;this.params={...params};
 }
}
export function updateDocumentLanguage(doc=globalThis.document){
 if(!doc)return;
 doc.documentElement.lang=language;
 doc.querySelector('meta[name="description"]')?.setAttribute('content',t('page.description'));
 doc.querySelector('#game')?.setAttribute('aria-label',t('page.canvas'));
}
