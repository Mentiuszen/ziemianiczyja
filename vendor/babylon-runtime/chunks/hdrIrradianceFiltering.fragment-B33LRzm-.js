import{S as i}from"./index-3iDVoJzw.js";import"./helperFunctions-C61Rfu0Z.js";import"./hdrFilteringFunctions-DL1ESoq3.js";import"./pbrBRDFFunctions-BW4nFaH9.js";import"./index-B5Zu_GVg.js";const r="hdrIrradianceFilteringPixelShader",e=`#include<helperFunctions>
#include<importanceSampling>
#include<pbrBRDFFunctions>
#include<hdrFilteringFunctions>
var inputTextureSampler: sampler;var inputTexture: texture_cube<f32>;
#ifdef IBL_CDF_FILTERING
var icdfTextureSampler: sampler;var icdfTexture: texture_2d<f32>;
#endif
uniform vFilteringInfo: vec2f;uniform hdrScale: f32;varying direction: vec3f;@fragment
fn main(input: FragmentInputs)->FragmentOutputs {var color: vec3f=irradiance(inputTexture,inputTextureSampler,input.direction,uniforms.vFilteringInfo,0.0,vec3f(1.0),input.direction
#ifdef IBL_CDF_FILTERING
,icdfTexture,icdfTextureSampler
#endif
);fragmentOutputs.color= vec4f(color*uniforms.hdrScale,1.0);}`;i.ShadersStoreWGSL[r]||(i.ShadersStoreWGSL[r]=e);const G={name:r,shader:e};export{G as hdrIrradianceFilteringPixelShaderWGSL};
