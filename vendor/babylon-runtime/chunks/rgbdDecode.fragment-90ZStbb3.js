import{S as o}from"./index-3iDVoJzw.js";import"./helperFunctions-Ccu1eaGu.js";import"./index-B5Zu_GVg.js";const r="rgbdDecodePixelShader",t=`varying vec2 vUV;uniform sampler2D textureSampler;
#include<helperFunctions>
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void) 
{gl_FragColor=vec4(fromRGBD(texture2D(textureSampler,vUV)),1.0);}`;o.ShadersStore[r]||(o.ShadersStore[r]=t);const N={name:r,shader:t};export{N as rgbdDecodePixelShader};
