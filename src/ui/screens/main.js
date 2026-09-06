import {VERSION} from '../../version.js';
import {getLanguage,t} from '../../i18n/index.js';
import {button,escape} from '../common.js';
/** The menu is live HTML over a text-free backdrop; branding follows the selected interface language. */
export function mainScreen(app){
 const ready=app.checkpointState==='ready'||(app.checkpointState===undefined&&!!app.checkpoint);
 return `<section class="screen main-screen"><div class="main-art" aria-hidden="true"></div><main class="main-layout"><h1 class="main-logo" lang="${getLanguage()}"><span>${escape(t('app.title'))}</span><img src="./public/assets/ui/${getLanguage()==='en'?'logo-en.svg':'logo.svg'}" alt="" width="950" height="210"></h1><nav class="menu-actions main-actions" aria-label="${escape(t('main.navigation'))}">${button('action.campaignContinue','campaign-continue',{disabled:!ready,attributes:app.checkpointState==='loading'?'aria-busy="true"':''})}${button('action.campaignNew','campaign-new')}${button('action.settings','settings')}${button('action.credits','credits')}</nav><span class="main-version">v${escape(VERSION)}</span></main></section>`;
}
