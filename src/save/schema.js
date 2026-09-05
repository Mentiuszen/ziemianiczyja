import {MAP,MISSION_VERSION} from '../data/world-map.js';
import {WEAPONS} from '../data/weapons.js';
export const SAVE_VERSION=1;
const finite=(v,min=-100000,max=100000)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
function position(p){return p&&finite(p.x,MAP.minX,MAP.minX+MAP.width)&&finite(p.y,-20,40)&&finite(p.z,MAP.minZ,MAP.minZ+MAP.depth);}
export function validateSnapshot(s){
 if(!s||s.version!==SAVE_VERSION||s.mission!=='cambrai'||s.missionVersion!==MISSION_VERSION)throw Error('Niezgodna wersja punktu zapisu. Mapa v0.3 wymaga rozpoczęcia nowej misji; ustawienia zostały zachowane.');
 if(!finite(s.time,0,360000)||!position(s.player?.pos)||!finite(s.player?.health?.hp,0,100))throw Error('Uszkodzone dane gracza.');
 if(!Array.isArray(s.player.weapons)||s.player.weapons.length!==2)throw Error('Nieprawidłowy ekwipunek.');
 for(const w of s.player.weapons)if(!WEAPONS[w.id]||!Number.isInteger(w.mag)||w.mag<0||w.mag>WEAPONS[w.id].capacity||!Number.isInteger(w.reserve)||w.reserve<0||w.reserve>999||!finite(w.cooldown,0,60)||!finite(w.reloadLeft,0,60))throw Error('Uszkodzone dane amunicji.');
 if(!Number.isInteger(s.director?.phase)||s.director.phase<0||s.director.phase>6||!Array.isArray(s.director.events))throw Error('Uszkodzony przebieg misji.');
 if(!Array.isArray(s.npcs)||s.npcs.length>100||!Array.isArray(s.tanks)||s.tanks.length!==2||!Array.isArray(s.items)||s.items.length>150)throw Error('Uszkodzony stan świata.');
 const ids=new Set();for(const a of [...s.npcs,...s.tanks,...s.items]){if(typeof a.id!=='string'||ids.has(a.id)||!position(a.pos))throw Error('Nieprawidłowy identyfikator lub położenie obiektu.');ids.add(a.id);}
 for(const n of s.npcs){
  if(!finite(n.hp,0,100))throw Error('Nieprawidłowe zdrowie NPC.');
  const w=n.weapon;if(!w||!WEAPONS[w.id]||!Number.isInteger(w.mag)||w.mag<0||w.mag>WEAPONS[w.id].capacity||!Number.isInteger(w.reserve)||w.reserve<0||w.reserve>999||!finite(w.cooldown,0,60)||!finite(w.reloadLeft,0,60))throw Error('Uszkodzona broń NPC.');
  if(!finite(n.yaw)||!finite(n.think,-10,30)||!finite(n.suppression,0,10)||!finite(n.reaction,-100,360000)||!Array.isArray(n.path)||n.path.length>6500||n.path.some(p=>!position(p)))throw Error('Uszkodzony stan AI.');
 }
 if(!['stand','crouch','prone'].includes(s.player.stance)||!Number.isInteger(s.player.slot)||s.player.slot<0||s.player.slot>1||!Number.isInteger(s.player.grenades)||s.player.grenades<0||s.player.grenades>8||!finite(s.player.health.delay,0,6)||!finite(s.player.yaw)||!finite(s.player.pitch,-1.5,1.5)||!finite(s.player.stamina,0,6))throw Error('Nieprawidłowy stan gracza.');
 if(!finite(s.director.hold,0,55)||new Set(s.director.events).size!==s.director.events.length||s.director.events.some(id=>typeof id!=='string'))throw Error('Uszkodzone zdarzenia misji.');
 for(const tank of s.tanks)if(!['waiting','moving','holding','immobilized','destroyed'].includes(tank.state)||!finite(tank.weaponLeft,-360000,60)||!Number.isInteger(tank.ammunition)||tank.ammunition<0||tank.ammunition>30)throw Error('Uszkodzony stan pojazdu.');
 if(!s.stats||Object.values(s.stats).some(v=>!finite(v,0,10000000))||!Number.isInteger(s.random)||!Number.isInteger(s.nextId))throw Error('Nieprawidłowe dane symulacji.');
 if(s.grenades?.length)throw Error('Checkpoint nie może zawierać aktywnego granatu.');
 return s;
}
