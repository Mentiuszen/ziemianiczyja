import{S as o}from"./index-3iDVoJzw.js";import"./index-B5Zu_GVg.js";const r="passPixelShader",t=`varying vec2 vUV;uniform sampler2D textureSampler;
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void) 
{gl_FragColor=texture2D(textureSampler,vUV);}`;o.ShadersStore[r]||(o.ShadersStore[r]=t);const I={name:r,shader:t};export{I as passPixelShader};
