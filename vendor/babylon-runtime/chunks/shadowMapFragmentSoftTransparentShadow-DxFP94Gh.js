import{S as o}from"./index-3iDVoJzw.js";import"./index-B5Zu_GVg.js";const r="shadowMapFragmentSoftTransparentShadow",t=`#if SM_SOFTTRANSPARENTSHADOW==1
if ((bayerDither8(floor(mod(gl_FragCoord.xy,8.0))))/64.0>=softTransparentShadowSM.x*alpha) discard;
#endif
`;o.IncludesShadersStore[r]||(o.IncludesShadersStore[r]=t);const A={name:r,shader:t};export{A as shadowMapFragmentSoftTransparentShadow};
