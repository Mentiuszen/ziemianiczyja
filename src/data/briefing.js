/** Fictional local orders, not words attributed to a historical soldier. */
export const PHASE=Object.freeze({BRIEFING:0,ADVANCE:1,MG:2,RALLY:3,ARTILLERY:4,TELEPHONE:5,HOLD:6,COMPLETE:7});
export const BRIEFING_LINES=Object.freeze([
 {actor:'uk-1',speaker:'Porucznik Shaw',duration:6,text:'Podejdźcie do mapy. Nasz odcinek jest tutaj. Pierwszą linię przełamujemy razem z czołgami.'},
 {actor:'uk-0',speaker:'Sierżant Hughes',duration:6,text:'Reed, idziesz ze mną. H21 otworzy przejście przez drut. Nie skupiajcie się za jedną maszyną.'},
 {actor:'uk-1',speaker:'Porucznik Shaw',duration:7,text:'Karabin w schronie osłania drogę. Jeśli nas zatrzyma, obejdź go lewym łącznikiem albo od tyłu.'},
 {actor:'uk-4',speaker:'William Ellis',duration:5,text:'Ja przycisnę obsługę. Reed, wykorzystaj ten moment. Nie wychodź przed lufę Lewisa.'},
 {actor:'uk-1',speaker:'Porucznik Shaw',duration:7,text:'Za pierwszą linią rozpoznano działo polowe. Bez jego uciszenia czołgi nie osłonią wejścia do zabudowań.'},
 {actor:'uk-0',speaker:'Sierżant Hughes',duration:6,text:'U Bennetta odbierzesz meldunek. Potem telefon w ruinach. Zabezpieczamy łączność i odpieramy kontratak.'},
 {actor:'uk-1',speaker:'Porucznik Shaw',duration:5,text:'To wszystko. Sprawdźcie amunicję. Hughes, wyprowadź ludzi. Ruszamy na sygnał!'}
]);
export const BRIEFING_DURATION=BRIEFING_LINES.reduce((sum,line)=>sum+line.duration,0);
export function briefingLine(time){let at=0;for(const line of BRIEFING_LINES){at+=line.duration;if(time<at)return line;}return null;}
