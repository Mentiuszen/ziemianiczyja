import {t} from '../../i18n/index.js';
export function updateStance(image,stance){
 if(!['stand','crouch','prone'].includes(stance))stance='stand';
 if(image.dataset.stance!==stance){image.dataset.stance=stance;image.src=`./public/assets/ui/stance-${stance}.svg`;}
 const label=t(`hud.${stance}`);if(image.alt!==label)image.alt=label;
}
