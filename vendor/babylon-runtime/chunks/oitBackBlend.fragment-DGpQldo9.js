import{S as r}from"./index-3iDVoJzw.js";import"./index-B5Zu_GVg.js";const t="oitBackBlendPixelShader",o=`var uBackColor: texture_2d<f32>;@fragment
fn main(input: FragmentInputs)->FragmentOutputs {fragmentOutputs.color=textureLoad(uBackColor,vec2i(fragmentInputs.position.xy),0);if (fragmentOutputs.color.a==0.0) {discard;}}
`;r.ShadersStoreWGSL[t]||(r.ShadersStoreWGSL[t]=o);const G={name:t,shader:o};export{G as oitBackBlendPixelShaderWGSL};
