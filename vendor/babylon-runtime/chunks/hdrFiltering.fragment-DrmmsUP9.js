import{S as i}from"./index-3iDVoJzw.js";import"./helperFunctions-C61Rfu0Z.js";import"./hdrFilteringFunctions-DL1ESoq3.js";import"./pbrBRDFFunctions-BW4nFaH9.js";import"./index-B5Zu_GVg.js";const r="hdrFilteringPixelShader",t=`#include<helperFunctions>
#include<importanceSampling>
#include<pbrBRDFFunctions>
#include<hdrFilteringFunctions>
uniform alphaG: f32;var inputTextureSampler: sampler;var inputTexture: texture_cube<f32>;uniform vFilteringInfo: vec2f;uniform hdrScale: f32;varying direction: vec3f;@fragment
fn main(input: FragmentInputs)->FragmentOutputs {var color: vec3f=radiance(uniforms.alphaG,inputTexture,inputTextureSampler,input.direction,uniforms.vFilteringInfo);fragmentOutputs.color= vec4f(color*uniforms.hdrScale,1.0);}`;i.ShadersStoreWGSL[r]||(i.ShadersStoreWGSL[r]=t);const W={name:r,shader:t};export{W as hdrFilteringPixelShaderWGSL};
