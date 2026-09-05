import{S as t}from"./index-3iDVoJzw.js";import"./helperFunctions-C61Rfu0Z.js";import"./index-B5Zu_GVg.js";const r="rgbdDecodePixelShader",e=`varying vUV: vec2f;var textureSamplerSampler: sampler;var textureSampler: texture_2d<f32>;
#include<helperFunctions>
#define CUSTOM_FRAGMENT_DEFINITIONS
@fragment
fn main(input: FragmentInputs)->FragmentOutputs {fragmentOutputs.color=vec4f(fromRGBD(textureSample(textureSampler,textureSamplerSampler,input.vUV)),1.0);}`;t.ShadersStoreWGSL[r]||(t.ShadersStoreWGSL[r]=e);const I={name:r,shader:e};export{I as rgbdDecodePixelShaderWGSL};
