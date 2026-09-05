import{S as o}from"./index-3iDVoJzw.js";import"./index-B5Zu_GVg.js";const r="shadowMapFragmentSoftTransparentShadow",t=`#if SM_SOFTTRANSPARENTSHADOW==1
if ((bayerDither8(floor(((fragmentInputs.position.xy)%(8.0)))))/64.0>=uniforms.softTransparentShadowSM.x*alpha) {discard;}
#endif
`;o.IncludesShadersStoreWGSL[r]||(o.IncludesShadersStoreWGSL[r]=t);const x={name:r,shader:t};export{x as shadowMapFragmentSoftTransparentShadowWGSL};
