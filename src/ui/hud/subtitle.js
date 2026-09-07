import {text} from '../../i18n/index.js';

/** Dialogue is structured data. System messages are never parsed as "name: text". */
export function subtitleContent(caption, message, time, until, enabled=true){
 if(!enabled)return {visible:false,speaker:'',text:''};
 const line=caption?text(caption.text):time<until?text(message):'';
 if(!line)return {visible:false,speaker:'',text:''};
 const name=caption?text(caption.speaker).trim().replace(/:\s*$/,''):'';
 return {visible:true,speaker:name?`${name}: `:'',text:line};
}

/** Update persistent spans using textContent, including user-visible localized names. */
export function updateSubtitle(root,content){
 const speaker=root.querySelector('.subtitle-speaker'),body=root.querySelector('.subtitle-text');
 let changed=root.hidden!==!content.visible;
 root.hidden=!content.visible;
 const name=content.visible?content.speaker:'',line=content.visible?content.text:'';
 if(speaker.textContent!==name){speaker.textContent=name;changed=true;}
 if(body.textContent!==line){body.textContent=line;changed=true;}
 if(speaker.hidden!==!name){speaker.hidden=!name;changed=true;}
 return changed;
}
