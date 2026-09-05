import{S as r}from"./index-3iDVoJzw.js";import"./index-B5Zu_GVg.js";const t="hdrFilteringVertexShader",i=`attribute position: vec2f;varying direction: vec3f;uniform up: vec3f;uniform right: vec3f;uniform front: vec3f;
#define CUSTOM_VERTEX_DEFINITIONS
@vertex
fn main(input : VertexInputs)->FragmentInputs {
#define CUSTOM_VERTEX_MAIN_BEGIN
var view: mat3x3f= mat3x3f(uniforms.up,uniforms.right,uniforms.front);vertexOutputs.direction=view*vec3f(input.position,1.0);vertexOutputs.position= vec4f(input.position,0.0,1.0);
#define CUSTOM_VERTEX_MAIN_END
}`;r.ShadersStoreWGSL[t]||(r.ShadersStoreWGSL[t]=i);const g={name:t,shader:i};export{g as hdrFilteringVertexShaderWGSL};
