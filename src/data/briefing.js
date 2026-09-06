import {message} from '../i18n/message.js';
/** Fictional local orders, not words attributed to a historical soldier. */
export const PHASE=Object.freeze({BRIEFING:0,ADVANCE:1,MG:2,RALLY:3,ARTILLERY:4,TELEPHONE:5,HOLD:6,COMPLETE:7});
export const BRIEFING_LINES=Object.freeze([
 {actor:'uk-1',speaker:message('speaker.shaw'),duration:6,text:message('briefing.line1')},
 {actor:'uk-0',speaker:message('speaker.hughes'),duration:6,text:message('briefing.line2')},
 {actor:'uk-1',speaker:message('speaker.shaw'),duration:7,text:message('briefing.line3')},
 {actor:'uk-4',speaker:message('speaker.ellis'),duration:5,text:message('briefing.line4')},
 {actor:'uk-1',speaker:message('speaker.shaw'),duration:7,text:message('briefing.line5')},
 {actor:'uk-0',speaker:message('speaker.hughes'),duration:6,text:message('briefing.line6')},
 {actor:'uk-1',speaker:message('speaker.shaw'),duration:5,text:message('briefing.line7')}
]);
export const BRIEFING_DURATION=BRIEFING_LINES.reduce((sum,line)=>sum+line.duration,0);
export function briefingLine(time){let at=0;for(const line of BRIEFING_LINES){at+=line.duration;if(time<at)return line;}return null;}
