import{S as i}from"./index-3iDVoJzw.js";import"./helperFunctions-Ccu1eaGu.js";import"./hdrFilteringFunctions-_vkpP-Mg.js";import"./pbrBRDFFunctions-D3Xxmt7F.js";import"./index-B5Zu_GVg.js";const r="hdrFilteringPixelShader",o=`#include<helperFunctions>
#include<importanceSampling>
#include<pbrBRDFFunctions>
#include<hdrFilteringFunctions>
uniform float alphaG;uniform samplerCube inputTexture;uniform vec2 vFilteringInfo;uniform float hdrScale;varying vec3 direction;void main() {vec3 color=radiance(alphaG,inputTexture,direction,vFilteringInfo);gl_FragColor=vec4(color*hdrScale,1.0);}`;i.ShadersStore[r]||(i.ShadersStore[r]=o);const P={name:r,shader:o};export{P as hdrFilteringPixelShader};
