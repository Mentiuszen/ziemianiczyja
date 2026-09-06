import {message} from '../i18n/message.js';
/** Balance values are gameplay choices, not claims about real weapon performance. */
export const WEAPONS=Object.freeze({
 smle:{name:'SMLE Mk III',short:'SMLE',capacity:10,cycle:1.1,reload:3.3,damage:94,spread:.013,adsSpread:.0018,recoil:.029,range:180,auto:false,model:'smle',sound:'rifle'},
 gewehr:{name:'Gewehr 98',short:'G 98',capacity:5,cycle:1.3,reload:3.1,damage:100,spread:.014,adsSpread:.002,recoil:.033,range:185,auto:false,model:'gewehr',sound:'gewehr'},
 webley:{name:'Webley Mk VI',short:'WEBLEY',capacity:6,cycle:.37,reload:2.8,damage:56,spread:.025,adsSpread:.008,recoil:.04,range:80,auto:false,model:'webley',sound:'pistol'},
 lewis:{name:'Lewis Mk I',short:'LEWIS',capacity:47,cycle:.135,reload:4.5,damage:58,spread:.025,adsSpread:.008,recoil:.012,range:150,auto:true,model:'lewis',sound:'lewis'},
 mg08:{name:'MG 08',short:'MG 08',capacity:100,cycle:.14,reload:5.2,damage:57,spread:.018,adsSpread:.007,recoil:.005,range:150,auto:true,model:'mg08',sound:'mg'}
});
// Player protection is separate from NPC damage and from physical weapon timings.
export const DIFFICULTIES=Object.freeze({
 recruit:Object.freeze({name:message('difficulty.recruit'),bulletIncoming:.25,explosionIncoming:.55,meleeIncoming:.58,regenDelay:3,regenRate:25,reactionMin:1,reactionMax:1.5,npcReactionScale:1.35,spread:1.6,burstMin:2,burstMax:4,burstPauseMin:1.2,burstPauseMax:1.8}),
 soldier:Object.freeze({name:message('difficulty.soldier'),bulletIncoming:.35,explosionIncoming:.75,meleeIncoming:.82,regenDelay:4,regenRate:20,reactionMin:.7,reactionMax:1.2,npcReactionScale:1,spread:1,burstMin:3,burstMax:5,burstPauseMin:.8,burstPauseMax:1.4}),
 veteran:Object.freeze({name:message('difficulty.veteran'),bulletIncoming:.65,explosionIncoming:1,meleeIncoming:1.15,regenDelay:5,regenRate:16,reactionMin:.45,reactionMax:.8,npcReactionScale:.72,spread:.7,burstMin:4,burstMax:6,burstPauseMin:.6,burstPauseMax:1.0})
});
