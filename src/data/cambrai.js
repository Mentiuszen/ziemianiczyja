import {northZ} from './world-map.js';
export const CAMPAIGN=[
 {id:'somme',number:'01',title:'Pierwszy gwizdek',place:'Somma',date:'1 lipca 1916',available:false},
 {id:'flers',number:'02',title:'Żelazne bestie',place:'Flers-Courcelette',date:'15 września 1916',available:false},
 {id:'ypres',number:'03',title:'Morze błota',place:'Okolice Ypres',date:'Październik 1917',available:false},
 {id:'cambrai',number:'04',title:'Pęknięta linia',place:'Cambrai, Francja',date:'20 listopada 1917',available:true},
 {id:'amiens',number:'05',title:'Ostatnie lato',place:'Amiens',date:'8 sierpnia 1918',available:false}
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
 {id:'orders',title:'Odbierz rozkaz natarcia',hint:'Podejdź do skrzyni przy sierżancie Hughesie i naciśnij E.',x:3,z:3,radius:3,kind:'interact'},
 {id:'advance',title:'Przedrzyj się do pierwszej linii',hint:'Czołgi osłaniają drogę. Lewa flanka prowadzi do bocznego łącznika.',x:6,z:48,radius:13,kind:'zone'},
 {id:'machinegun',title:'Ucisz stanowisko MG 08',hint:'Traf obsługę albo obejdź schron i odetnij podawanie amunicji [E].',x:23,z:60,radius:3,kind:'gun'},
 {id:'rally',title:'Dotrzyj do punktu sanitarnego',hint:'Zabierz meldunek i uzupełnij zapasy [E]. Punkt zapisu.',x:-27,z:69,radius:3.3,kind:'interact'},
 {id:'telephone',title:'Przywróć łączność w ruinach',hint:'Dotrzyj do telefonu polowego w zrujnowanym domu [E]. Punkt zapisu.',x:4,z:159,radius:3.3,kind:'interact'},
 {id:'hold',title:'Utrzymaj punkt łączności',hint:'Broń ruin. Pozostań w pobliżu telefonu; posiłki wroga są ograniczone.',x:4,z:159,radius:22,kind:'hold',duration:55},
 {id:'complete',title:'Meldunek dostarczony',hint:'Utrzymano lokalny odcinek.',x:4,z:159,radius:22,kind:'complete'}
];
export const CHARACTERS={player:'Thomas Reed',sergeant:'Arthur Hughes',support:'William Ellis',medic:'George Bennett'};
/** Authored formations, not random infinite spawns. Coordinates are metres. */
export function initialSoldiers(){
 const units=[];
 const british=[[4.6,1.8],[-3,3],[5,1],[8,8],[12,13],[-12,0],[-17,1],[16,16],[-13,14],[1,9],[21,13],[-5,12]];
 british.forEach(([x,z],i)=>units.push({id:`uk-${i}`,faction:'uk',role:i===0?'leader':i===4?'support':'rifle',name:i===0?CHARACTERS.sergeant:i===4?CHARACTERS.support:i===5?CHARACTERS.medic:`Strzelec ${i+1}`,x,z,yaw:0,weapon:i===4?'lewis':'smle',group:'assault'}));
 const german=[[-36,47],[-18,47],[-7,47],[4,46],[19,46],[31,49],[39,54],[-38,66],[19,79],[31,90],[-10,89],[18,110],[-12,124],[24,126],[35,117]];
 german.forEach(([x,z],i)=>units.push({id:`de-${i}`,faction:'de',role:i===8?'support':'rifle',name:'Niemiecki piechur',x,z,yaw:Math.PI,weapon:'gewehr',group:i<8?'front':'village'}));
 units.push({id:'de-mg',faction:'de',role:'gunner',name:'Obsługa MG 08',x:23,z:60,yaw:Math.PI,weapon:'mg08',group:'front',fixed:true});
 return units.map(n=>({...n,z:northZ(n.z)}));
}
export const COUNTERATTACK=[[-22,143],[-16,145],[-8,147],[0,150],[18,145],[26,148],[31,143],[39,147]].map(([x,z],i)=>({id:`de-counter-${i}`,faction:'de',role:'rifle',name:'Niemiecki piechur',x,z:northZ(z),yaw:Math.PI,weapon:'gewehr',group:'counter'}));
export const TANK_ROUTES=[{id:'tank-1',x:13,z:15,endZ:137,name:'Mark IV · H21',immobilize:false},{id:'tank-2',x:-13,z:17,endZ:74,name:'Mark IV · H24',immobilize:true}];
const BASE_ITEMS=[
 {id:'aid-start',type:'medkit',x:-1,z:2},{id:'ammo-start',type:'ammo',x:3,z:4},
 {id:'aid-rally-1',type:'medkit',x:-27,z:66},{id:'aid-rally-2',type:'medkit',x:-28.5,z:69},{id:'ammo-rally',type:'ammo',x:-26,z:65},
 {id:'lewis-rally',type:'lewis',x:-26,z:66},
 {id:'aid-village',type:'medkit',x:5,z:120},{id:'ammo-village',type:'ammo',x:6,z:117}
];

export const INITIAL_ITEMS=BASE_ITEMS.map(item=>({...item,z:northZ(item.z)}));
