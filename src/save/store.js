import {validateSnapshot} from './schema.js';
export const DEFAULT_KEYS={forward:'KeyW',back:'KeyS',left:'KeyA',right:'KeyD',sprint:'ShiftLeft',crouch:'KeyC',prone:'KeyZ',jump:'Space',interact:'KeyE',reload:'KeyR',grenade:'KeyG',melee:'KeyV',slot1:'Digit1',slot2:'Digit2'};
export const DEFAULT_SETTINGS={quality:'medium',maxFps:0,renderScale:1,fov:78,sensitivity:1,motion:.45,damageEffects:1,master:.7,effects:.85,ambient:.35,subtitles:true,showFps:true,showCpu:false,showGpu:false,difficulty:'soldier',keys:DEFAULT_KEYS};
export class Store {
 constructor(warn){this.warn=warn;this.memory=null;this.dbPromise=null;this.warned=false;this.writeRevision=0;this.writeQueue=Promise.resolve();this.pendingTransaction=null;}
 warning(message){if(!this.warned){this.warned=true;this.warn(message);}}
 settings(){let raw={};try{raw=JSON.parse(localStorage.getItem('zn-settings-v1')||'{}');}catch(e){this.warning('Przeglądarka blokuje pamięć lokalną. Ustawienia i postęp mogą nie przetrwać zamknięcia strony.');}
  const s={...DEFAULT_SETTINGS,keys:{...DEFAULT_KEYS}};for(const key of ['maxFps','renderScale','fov','sensitivity','motion','damageEffects','master','effects','ambient'])if(typeof raw?.[key]==='number'&&Number.isFinite(raw[key]))s[key]=raw[key];s.maxFps=Math.max(0,Math.min(360,Math.round(s.maxFps)));s.renderScale=Math.max(.5,Math.min(1.5,s.renderScale));s.fov=Math.max(60,Math.min(105,s.fov));s.sensitivity=Math.max(.2,Math.min(3,s.sensitivity));for(const k of ['motion','damageEffects','master','effects','ambient'])s[k]=Math.max(0,Math.min(1,s[k]));if(['low','medium','high','ultra'].includes(raw?.quality))s.quality=raw.quality;if(['recruit','soldier','veteran'].includes(raw?.difficulty))s.difficulty=raw.difficulty;for(const key of ['subtitles','showFps','showCpu','showGpu'])if(typeof raw?.[key]==='boolean')s[key]=raw[key];for(const key of Object.keys(DEFAULT_KEYS))if(typeof raw?.keys?.[key]==='string'&&/^(Key[A-Z]|Digit[0-9]|Shift(Left|Right)|Control(Left|Right)|Alt(Left|Right)|Space|Arrow(Up|Down|Left|Right))$/.test(raw.keys[key]))s.keys[key]=raw.keys[key];return s;
 }
 saveSettings(settings){try{localStorage.setItem('zn-settings-v1',JSON.stringify(settings));return true;}catch(e){this.warning('Nie udało się zapisać ustawień. Obecne ustawienia działają do zamknięcia strony.');return false;}}
 db(){if(this.dbPromise)return this.dbPromise;this.dbPromise=new Promise((resolve,reject)=>{let request;try{request=indexedDB.open('ziemia-niczyja',1);}catch(e){reject(e);return;}request.onupgradeneeded=()=>request.result.createObjectStore('saves');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);request.onblocked=()=>reject(Error('Baza danych jest zajęta przez inną kartę.'));});return this.dbPromise;}
 invalidatePending(){
  this.writeRevision++;
  if(this.pendingTransaction){try{this.pendingTransaction.abort();}catch{/* It may have already committed. */}this.pendingTransaction=null;}
 }
 async save(snapshot,{isCurrent=()=>true}={}){
  // Validate first: rejecting a corrupt candidate must not discard a good pending write.
  validateSnapshot(snapshot);const candidate=structuredClone(snapshot);
  if(!isCurrent())return false;
  const revision=++this.writeRevision;this.memory=candidate;
  const current=()=>revision===this.writeRevision&&isCurrent();
  const write=async()=>{
   if(!current())return false;
   try{
    const db=await this.db();if(!current())return false;
    await new Promise((resolve,reject)=>{
     const tx=db.transaction('saves','readwrite');this.pendingTransaction=tx;
     const clean=()=>{if(this.pendingTransaction===tx)this.pendingTransaction=null;};
     tx.oncomplete=()=>{clean();resolve();};
     tx.onerror=()=>{clean();reject(tx.error);};
     tx.onabort=()=>{clean();reject(tx.error||Error('Zapis przerwany'));};
     tx.objectStore('saves').put(candidate,'checkpoint');
    });
    return current();
   }catch(e){
    if(current())this.warning(`Zapis działa tylko w tej sesji. Przeglądarka odmówiła trwałego zapisu (${e?.name||'błąd pamięci'}).`);
    return false;
   }
  };
  // IndexedDB transactions never complete out of our accepted candidate order.
  this.writeQueue=this.writeQueue.catch(()=>false).then(write);return this.writeQueue;
 }
 async load(){
  if(this.memory)return structuredClone(this.memory);
  const revision=this.writeRevision;let value;
  try{
   const db=await this.db();
   if(revision!==this.writeRevision)return this.memory?structuredClone(this.memory):null;
   value=await new Promise((resolve,reject)=>{const q=db.transaction('saves').objectStore('saves').get('checkpoint');q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);});
  }catch(e){this.warning('Trwały zapis niedostępny. Checkpointy będą przechowywane w pamięci tej sesji.');return this.memory?structuredClone(this.memory):null;}
  if(revision!==this.writeRevision)return this.memory?structuredClone(this.memory):null;
  if(!value)return null;return validateSnapshot(value);
 }
 async completed(){try{localStorage.setItem('zn-cambrai-complete','1');}catch(e){this.warning('Nie udało się trwale zapisać ukończenia misji.');}}
}
