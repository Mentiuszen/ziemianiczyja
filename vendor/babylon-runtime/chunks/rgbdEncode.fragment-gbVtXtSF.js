import{S as t}from"./index-3iDVoJzw.js";import"./helperFunctions-C61Rfu0Z.js";import"./index-B5Zu_GVg.js";const r="rgbdEncodePixelShader",e=`varying vUV: vec2f;var textureSamplerSampler: sampler;var textureSampler: texture_2d<f32>;
#include<helperFunctions>
#define CUSTOM_FRAGMENT_DEFINITIONS
@fragment
fn main(input: FragmentInputs)->FragmentOutputs {fragmentOutputs.color=toRGBD(textureSample(textureSampler,textureSamplerSampler,input.vUV).rgb);}`;t.ShadersStoreWGSL[r]||(t.ShadersStoreWGSL[r]=e);const I={name:r,shader:e};export{I as rgbdEncodePixelShaderWGSL};
