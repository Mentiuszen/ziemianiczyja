import {message} from './message.js';
// Explicit save migration only. Never use source-language sentences as translation keys.
const checkpointIds=Object.freeze({
 'Początek misji':'checkpoint.start',
 'Meldunek Bennetta':'checkpoint.bennett',
 'Punkt łączności':'checkpoint.telephone'
});
export function checkpointKey(value){
 if(value===null||value===undefined||value==='')return 'checkpoint.start';
 if(Object.hasOwn(checkpointIds,value))return checkpointIds[value];
 return ['checkpoint.start','checkpoint.bennett','checkpoint.telephone'].includes(value)?value:'checkpoint.saved';
}
/** Names from 0.4.x saves are normalized by stable identity, not by current language. */
export function soldierName(n){
 const names={'uk-0':'Arthur Hughes','uk-4':'William Ellis','uk-5':'George Bennett'};
 if(Object.hasOwn(names,n.id))return names[n.id];
 if(n.id==='uk-1')return message('speaker.officer');
 if(n.id==='de-mg')return message('speaker.mg');
 if(n.role==='artillery')return message('speaker.gun');
 if(n.faction==='de')return message('speaker.german');
 const match=/^uk-(\d+)$/.exec(n.id);
 return match?message('speaker.rifleman',{number:Number(match[1])+1}):message('speaker.orders');
}
