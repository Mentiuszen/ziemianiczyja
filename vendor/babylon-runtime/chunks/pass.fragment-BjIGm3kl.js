import{S as t}from"./index-3iDVoJzw.js";import"./index-B5Zu_GVg.js";const r="passPixelShader",e=`varying vUV: vec2f;var textureSamplerSampler: sampler;var textureSampler: texture_2d<f32>;
#define CUSTOM_FRAGMENT_DEFINITIONS
@fragment
fn main(input: FragmentInputs)->FragmentOutputs {fragmentOutputs.color=textureSample(textureSampler,textureSamplerSampler,input.vUV);}`;t.ShadersStoreWGSL[r]||(t.ShadersStoreWGSL[r]=e);const I={name:r,shader:e};export{I as passPixelShaderWGSL};
