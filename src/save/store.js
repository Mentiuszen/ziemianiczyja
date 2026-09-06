import {LocalizedError} from '../i18n/index.js';
import {message} from '../i18n/message.js';
import {validateSnapshot} from './schema.js';
import {DEFAULT_KEYS,DEFAULT_SETTINGS,normalizeSettings} from './settings-schema.js';
import {CAMPAIGN_KEY,validateProgress,reconcileCampaign,progressForCheckpoint,completeProgress} from './campaign.js';
export {DEFAULT_KEYS,DEFAULT_SETTINGS};
export class Store {
 constructor(warn=()=>{}){this.warn=warn;this.memory=null;this.progress=null;this.sessionOnly=false;this.dbPromise=null;this.warned=false;this.writeRevision=0;this.writeQueue=Promise.resolve();this.pendingTransaction=null;}
 warning(value){if(!this.warned){this.warned=true;this.warn(value);}}
 settings(){let raw={};try{raw=JSON.parse(localStorage.getItem('zn-settings-v1')||'{}');}catch{this.warning(message('storage.blocked'));}return normalizeSettings(raw);}
 saveSettings(settings){try{localStorage.setItem('zn-settings-v1',JSON.stringify(settings));return true;}catch{this.warning(message('storage.settingsFailed'));return false;}}
 db(){if(this.dbPromise)return this.dbPromise;this.dbPromise=new Promise((resolve,reject)=>{let request;try{request=indexedDB.open('ziemia-niczyja',1);}catch(e){reject(e);return;}request.onupgradeneeded=()=>request.result.createObjectStore('saves');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);request.onblocked=()=>reject(new LocalizedError('storage.busy'));});return this.dbPromise;}
 invalidatePending(){this.writeRevision++;if(this.pendingTransaction){try{this.pendingTransaction.abort();}catch{/* Already completed. */}this.pendingTransaction=null;}}
 async saveCampaign(snapshot,progress,{isCurrent=()=>true}={}){
  validateSnapshot(snapshot);validateProgress(progress,snapshot);
  const candidate=structuredClone(snapshot),metadata=structuredClone(progress);
  if(!isCurrent())return false;
  const revision=++this.writeRevision,current=()=>revision===this.writeRevision&&isCurrent();
  const accept=sessionOnly=>{this.memory=candidate;this.progress=metadata;this.sessionOnly=sessionOnly;};
  const write=async()=>{
   if(!current())return false;
   try{
    const db=await this.db();if(!current())return false;
    await new Promise((resolve,reject)=>{
     const tx=db.transaction('saves','readwrite');this.pendingTransaction=tx;
     const clean=()=>{if(this.pendingTransaction===tx)this.pendingTransaction=null;};
     tx.oncomplete=()=>{clean();accept(false);resolve();};tx.onerror=()=>{clean();reject(tx.error);};tx.onabort=()=>{clean();reject(tx.error||new LocalizedError('storage.cancelled'));};
     // These two records commit or abort together.
     try{tx.objectStore('saves').put(candidate,'checkpoint');tx.objectStore('saves').put(metadata,CAMPAIGN_KEY);}catch(error){try{tx.abort();}catch{}reject(error);}
    });
    return true;
   }catch(error){
    if(current()){accept(true);this.warning(message('storage.session',{type:error?.name||'Error'}));}return false;
   }
  };
  this.writeQueue=this.writeQueue.catch(()=>false).then(write);return this.writeQueue;
 }
 async save(snapshot,options={}){return this.saveCampaign(snapshot,progressForCheckpoint(snapshot,this.progress),options);}
 async loadCampaign(){
  const legacyCompleted=(()=>{try{return localStorage.getItem('zn-cambrai-complete')==='1';}catch{return false;}})();
  const inMemory=()=>({...reconcileCampaign(this.memory,this.progress,legacyCompleted),sessionOnly:this.sessionOnly});
  if(this.memory)return inMemory();
  const revision=this.writeRevision;let pair;
  try{
   const db=await this.db();
   if(revision!==this.writeRevision){await this.writeQueue;return inMemory();}
   pair=await new Promise((resolve,reject)=>{
    const tx=db.transaction('saves','readonly'),values={checkpoint:null,progress:null};
    tx.oncomplete=()=>resolve(values);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new LocalizedError('storage.cancelled'));
    const store=tx.objectStore('saves'),a=store.get('checkpoint'),b=store.get(CAMPAIGN_KEY);
    a.onsuccess=()=>{values.checkpoint=a.result;};b.onsuccess=()=>{values.progress=b.result;};
   });
  }catch{this.warning(message('storage.unavailable'));return inMemory();}
  if(revision!==this.writeRevision){await this.writeQueue;return inMemory();}
  const result=reconcileCampaign(pair.checkpoint,pair.progress,legacyCompleted);
  this.memory=result.checkpoint;this.progress=result.progress;
  if(result.metadataRepaired)this.warn(message('campaign.metadataRepaired'));
  return{...result,sessionOnly:false};
 }
 async load(){return(await this.loadCampaign()).checkpoint;}
 async completed({isCurrent=()=>true}={}){
  if(this.memory){const p=completeProgress(this.progress,this.memory);await this.saveCampaign(this.memory,p,{isCurrent});}
  if(!isCurrent())return;
  try{localStorage.setItem('zn-cambrai-complete','1');}catch{this.warning(message('storage.completeFailed'));}
 }
}
