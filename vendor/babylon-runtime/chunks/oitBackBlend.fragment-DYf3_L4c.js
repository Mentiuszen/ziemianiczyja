import{S as r}from"./index-3iDVoJzw.js";import"./index-B5Zu_GVg.js";const o="oitBackBlendPixelShader",i=`precision highp float;uniform sampler2D uBackColor;void main() {glFragColor=texelFetch(uBackColor,ivec2(gl_FragCoord.xy),0);if (glFragColor.a==0.0) { 
discard;}}`;r.ShadersStore[o]||(r.ShadersStore[o]=i);const u={name:o,shader:i};export{u as oitBackBlendPixelShader};
