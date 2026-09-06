import {message} from '../i18n/message.js';
import {northZ} from './world-map.js';
import {FIELD_GUNS} from './support.js';
export const CAMPAIGN=[
 {id:'somme',number:'01',title:message('campaign.somme.title'),place:message('campaign.somme.place'),date:message('campaign.somme.date'),available:false},
 {id:'flers',number:'02',title:message('campaign.flers.title'),place:message('campaign.flers.place'),date:message('campaign.flers.date'),available:false},
 {id:'ypres',number:'03',title:message('campaign.ypres.title'),place:message('campaign.ypres.place'),date:message('campaign.ypres.date'),available:false},
 {id:'cambrai',number:'04',title:message('campaign.cambrai.title'),place:message('campaign.cambrai.place'),date:message('campaign.cambrai.date'),available:true},
 {id:'amiens',number:'05',title:message('campaign.amiens.title'),place:message('campaign.amiens.place'),date:message('campaign.amiens.date'),available:false}
];
const BASE_TRENCHES=[
 [[-44,0],[-18,0],[ -12,3],[2,3],[8,0],[36,0]],
 [[-44,50],[-27,50],[-23,54],[-8,54],[-3,50],[18,50],[23,55],[44,55]],
 [[-27,50],[-27,67],[-32,73],[-32,86],[-22,92],[-22,104],[-10,104]],
 [[-44,106],[-24,106],[-19,102],[3,102],[10,108],[35,108]],
 [[-20,0],[-20,-10]]
];
export const TRENCHES=BASE_TRENCHES.map(line=>line.map(([x,z])=>[x,northZ(z)]));
TRENCHES.push([[-60,-14],[-20,-14],[14,-14],[44,-14]], [[-55,-14],[-55,10],[-63,18]], [[-44,50],[-60,50],[-64,60],[-64,96],[-55,106],[-55,136],[-44,146]]);
const BASE_RAMPS=[
 {x:8,z0:0,z1:14,deepAtStart:true,width:4},
 {x:-27,z0:35,z1:51,deepAtStart:false,width:4},
 {x:6,z0:37,z1:52,deepAtStart:false,width:4.6},
 {x:6,z0:51,z1:65,deepAtStart:true,width:4.6},
 {x:-22,z0:104,z1:118,deepAtStart:true,width:4},
 {x:1,z0:102,z1:116,deepAtStart:true,width:4}
];
export const RAMPS=BASE_RAMPS.map(r=>({...r,z0:northZ(r.z0),z1:northZ(r.z1)}));
RAMPS.push({x:-63,z0:18,z1:32,deepAtStart:true,width:4.8},{x:-55,z0:136,z1:152,deepAtStart:true,width:4.8});
export const OBJECTIVES=[
 {id:'orders',title:message('objective.orders.title'),hint:message('objective.orders.hint'),x:33,z:-7,radius:12,kind:'briefing'},
 {id:'advance',title:message('objective.advance.title'),hint:message('objective.advance.hint'),x:6,z:48,radius:13,kind:'zone'},
 {id:'machinegun',title:message('objective.machinegun.title'),hint:message('objective.machinegun.hint'),x:23,z:60,radius:3,kind:'gun'},
 {id:'rally',title:message('objective.rally.title'),hint:message('objective.rally.hint'),x:-27,z:69,radius:3.3,kind:'interact'},
 {id:'fieldgun',title:message('objective.fieldgun.title'),hint:message('objective.fieldgun.hint'),x:36,z:110,radius:3.3,kind:'artillery'},
 {id:'telephone',title:message('objective.telephone.title'),hint:message('objective.telephone.hint'),x:4,z:159,radius:3.3,kind:'interact'},
 {id:'hold',title:message('objective.hold.title'),hint:message('objective.hold.hint'),x:4,z:159,radius:22,kind:'hold',duration:55},
 {id:'complete',title:message('objective.complete.title'),hint:message('objective.complete.hint'),x:4,z:159,radius:22,kind:'complete'}
];
export const CHARACTERS={player:'Thomas Reed',sergeant:'Arthur Hughes',support:'William Ellis',medic:'George Bennett'};
/** Authored formations, not random infinite spawns. Coordinates are metres. */
export function initialSoldiers(){
 const units=[];
 const british=[[4.6,1.8],[-3,3],[5,1],[8,8],[12,13],[-12,0],[-17,1],[16,16],[-13,14],[1,9],[21,13],[-5,12]];
 british.forEach(([x,z],i)=>units.push({id:`uk-${i}`,faction:'uk',role:i===0?'leader':i===4?'support':'rifle',name:i===0?CHARACTERS.sergeant:i===4?CHARACTERS.support:i===5?CHARACTERS.medic:message('speaker.rifleman',{number:i+1}),x,z,yaw:0,weapon:i===4?'lewis':'smle',group:'assault'}));
 const german=[[-36,47],[-18,47],[-7,47],[4,46],[19,46],[31,49],[39,54],[-38,66],[19,79],[31,90],[-10,89],[18,110],[-12,124],[24,126],[35,117]];
 german.forEach(([x,z],i)=>units.push({id:`de-${i}`,faction:'de',role:i===8?'support':'rifle',name:message('speaker.german'),x,z,yaw:Math.PI,weapon:'gewehr',group:i<8?'front':'village'}));
 units.push({id:'de-mg',faction:'de',role:'gunner',name:message('speaker.mg'),x:23,z:60,yaw:Math.PI,weapon:'mg08',group:'front',fixed:true});
 const result=units.map(n=>({...n,z:northZ(n.z)}));
 // A complete command-room group. The remaining men occupy protected forward posts.
 const room=[['uk-0',31.2,-5.1,Math.PI*.8],['uk-1',35.5,-4.8,Math.PI],['uk-4',35.6,-7.4,-1.1],['uk-2',29.3,-8.8,.8]];
 for(const [id,x,z,yaw] of room){const n=result.find(n=>n.id===id);Object.assign(n,{x,z,yaw,briefingRole:true});}
 Object.assign(result.find(n=>n.id==='uk-1'),{name:message('speaker.officer'),role:'leader'});
 for(const n of result)if(['uk-3','uk-8','de-0','de-4'].includes(n.id))n.sentry=true;
 for(const g of FIELD_GUNS)g.crewIds.forEach((id,i)=>result.push({id,faction:'de',role:'artillery',name:message('speaker.gun'),x:g.x+(i?1.15:-1.15),z:g.z+1.9,yaw:Math.PI,weapon:'gewehr',group:'gun-crew',gunId:g.id}));
 // Reserve already exists in the world. It moves forward on orders: no visible spawning.
 return result.concat(COUNTERATTACK.map(n=>({...n})));

}
export const COUNTERATTACK=[[-42,208],[-38,210],[-28,208],[-25,211],[25,210],[29,211],[39,208],[44,211]].map(([x,z],i)=>({id:`de-counter-${i}`,faction:'de',role:'rifle',name:message('speaker.german'),x,z,yaw:Math.PI,weapon:'gewehr',group:'counter'}));
export const TANK_ROUTES=[
 {id:'tank-1',faction:'uk',x:13,z:15,name:'Mark IV · H21',route:[{x:13,z:31},{x:13,z:57},{x:13,z:74,gate:'mg-silenced'},{x:13,z:108,gate:'fieldgun-silenced'},{x:13,z:149},{x:22,z:161},{x:24,z:168}]},
 {id:'tank-2',faction:'uk',x:-13,z:17,name:'Mark IV · H24',route:[{x:-13,z:31},{x:-13,z:58},{x:-13,z:74,gate:'mg-silenced'},{x:-13,z:108,gate:'fieldgun-silenced'},{x:-13,z:149},{x:-19,z:160}]}
];
const BASE_ITEMS=[
 {id:'aid-start',type:'medkit',x:-1,z:2},{id:'ammo-start',type:'ammo',x:3,z:4},
 {id:'aid-rally-1',type:'medkit',x:-27,z:66},{id:'aid-rally-2',type:'medkit',x:-28.5,z:69},{id:'ammo-rally',type:'ammo',x:-26,z:65},
 {id:'lewis-rally',type:'lewis',x:-26,z:66},
 {id:'aid-village',type:'medkit',x:5,z:120},{id:'ammo-village',type:'ammo',x:6,z:117}
];

export const INITIAL_ITEMS=BASE_ITEMS.map(item=>({...item,z:northZ(item.z)}));
