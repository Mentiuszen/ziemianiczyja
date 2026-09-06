import {HUD,CONTACT_DURATION} from '../../data/hud.js';
const point=p=>p&&['x','y','z'].every(k=>Number.isFinite(p[k]));
export function normalizeShot(e){
 if(!e||!['shot','cannon'].includes(e.type))return null;
 const p=e.type==='shot'?e.from:e.pos;
 return p?{owner:e.owner,faction:e.faction,pos:{x:p.x,y:p.y,z:p.z},time:e.time}:null;
}
/** A bounded snapshot of firing positions, never a live tracker of actors. */
export class TacticalContacts {
 constructor({sessionId,maxContacts=HUD.maxContacts}={}){this.maxContacts=Math.max(1,Math.min(HUD.maxContacts,Math.floor(maxContacts)||HUD.maxContacts));this.reset(sessionId);}
 reset(sessionId){this.sessionId=sessionId;this.contacts=new Map();this.overflow=0;this.now=-Infinity;}
 recordShot(e,c){
  if(!e||!c||c.sessionId!==this.sessionId||typeof e.owner!=='string'||!e.owner||e.owner.length>160||!['uk','de'].includes(e.faction)||e.faction===c.playerFaction||!point(e.pos)||!point(c.playerPos)||!Number.isFinite(e.time)||e.time<0)return false;
  const ttl=CONTACT_DURATION[c.difficultyId]??CONTACT_DURATION.soldier;
  if(e.time+ttl<=this.now||Math.hypot(e.pos.x-c.playerPos.x,e.pos.z-c.playerPos.z)>HUD.range)return false;
  const previous=this.contacts.get(e.owner);if(previous&&e.time<=previous.shotAt)return false;
  this.contacts.set(e.owner,{owner:e.owner,pos:{...e.pos},shotAt:e.time,expiresAt:e.time+ttl});
  if(this.contacts.size>this.maxContacts){let victim;for(const contact of this.contacts.values())if(!victim||contact.expiresAt<victim.expiresAt)victim=contact;this.contacts.delete(victim.owner);this.overflow++;}
  return true;
 }
 sample(now){
  if(!Number.isFinite(now))return [];this.now=Math.max(this.now,now);
  const out=[];for(const [id,c] of this.contacts){if(this.now>=c.expiresAt){this.contacts.delete(id);continue;}if(c.shotAt>now)continue;out.push({...c,pos:{...c.pos},opacity:Math.min(1,(c.expiresAt-now)/((c.expiresAt-c.shotAt)*.25))});}return out;
 }
}
