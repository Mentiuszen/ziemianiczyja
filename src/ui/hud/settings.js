/** Stable module IDs shared by options, layout and world-space markers. */
export const HUD_SCALE_KEYS=Object.freeze({
 minimap:'hudMinimapScale',objective:'hudObjectiveScale',health:'hudHealthScale',
 stamina:'hudStaminaScale',stance:'hudStanceScale',ammo:'hudAmmoScale',
 grenadeCount:'hudGrenadeCountScale',reload:'hudReloadScale',interaction:'hudInteractionScale',
 subtitle:'hudSubtitleScale',critical:'hudCriticalScale',notification:'hudNotificationScale',
 crosshair:'hudCrosshairScale',hitMarker:'hudHitMarkerScale',grenadeWarning:'hudGrenadeWarningScale',
 allyMarker:'hudAllyMarkerScale',objectiveMarker:'hudObjectiveMarkerScale',fps:'hudFpsScale'
});
export const HUD_SETTING_KEYS=Object.freeze(['hudScale',...Object.values(HUD_SCALE_KEYS),'crosshairStyle']);
const scale=value=>Number.isFinite(value)?Math.max(.5,Math.min(2,value)):1;
export function getHudScale(settings={},moduleId){
 return Math.max(.5,Math.min(2,scale(settings.hudScale)*scale(settings[HUD_SCALE_KEYS[moduleId]])));
}
export function resetHud(settings){const result={...settings};for(const key of HUD_SETTING_KEYS)result[key]=key==='crosshairStyle'?'cross':1;return result;}
