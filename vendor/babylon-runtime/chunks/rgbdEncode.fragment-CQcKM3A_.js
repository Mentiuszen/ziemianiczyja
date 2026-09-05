import{S as o}from"./index-3iDVoJzw.js";import"./helperFunctions-Ccu1eaGu.js";import"./index-B5Zu_GVg.js";const r="rgbdEncodePixelShader",t=`varying vec2 vUV;uniform sampler2D textureSampler;
#include<helperFunctions>
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void) 
{gl_FragColor=toRGBD(texture2D(textureSampler,vUV).rgb);}`;o.ShadersStore[r]||(o.ShadersStore[r]=t);const b={name:r,shader:t};export{b as rgbdEncodePixelShader};
