import {t} from '../../i18n/index.js';
export const WEAPON_ICONS=Object.freeze(Object.fromEntries(['smle','gewehr','webley','lewis','mg08'].map(id=>[id,`./public/assets/ui/weapons/${id}.svg`])));
export function updateWeaponIcon(image,weapon){const id=Object.hasOwn(WEAPON_ICONS,weapon.id)?weapon.id:'unknown';if(image.dataset.weapon!==id){image.dataset.weapon=id;image.src=WEAPON_ICONS[id]||'./public/assets/ui/weapons/unknown.svg';}image.alt=id==='unknown'?t('hud.unknownWeapon'):weapon.definition.name;}
