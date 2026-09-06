/** A bounded parent context, not a growing history stack. */
export class MenuNavigation {
 constructor(){this.optionsParent='main';this.creditsParent='main';}
 openOptions(state){if(['main','campaign','paused'].includes(state))this.optionsParent=state;return 'settings';}
 openCredits(state){this.creditsParent=['main','campaign','paused'].includes(state)?state:'main';return 'credits';}
 back(state){return state==='settings'?this.optionsParent:state==='credits'?this.creditsParent:'main';}
 escape({state,capture=false,modal=false}){if(capture)return 'cancel-capture';if(modal)return 'cancel-modal';if(state==='playing')return 'pause';if(['settings','credits','campaign'].includes(state))return 'back';return null;}
}
