import {message} from '../i18n/message.js';
/** Metres. Equipment whitelist for the fictional Cambrai sector, 20 XI 1917. */
export const FIELD_GUNS=Object.freeze([
 {id:'fieldgun-1',name:message('equipment.fieldgun'),x:36,z:110,yaw:Math.PI,
  faction:'de',crewIds:['de-gun-0','de-gun-1'],model:'field-gun-77'}
]);
// One finite programme, relative to assault start. Models are simplified silhouettes.
export const AIR_SORTIES=Object.freeze([
 {id:'air-uk-scout',model:'dh5',faction:'uk',at:16,start:{x:-210,y:65,z:28},end:{x:240,y:77,z:188},speed:46},
 {id:'air-de-recon',model:'dfw',faction:'de',at:48,start:{x:225,y:85,z:180},end:{x:-235,y:77,z:12},speed:44},
 {id:'air-uk-strike',model:'dh5',faction:'uk',at:98,target:{x:-37,z:66},altitude:38,speed:47,heading:1.1,attack:true},
 {id:'air-de-strike',model:'dfw',faction:'de',at:148,target:{x:18,z:92},altitude:44,speed:42,heading:-1.4,attack:true},
 {id:'air-uk-cover',model:'dh5',faction:'uk',at:208,start:{x:-220,y:78,z:184},end:{x:225,y:85,z:82},speed:47}
]);
