import{S as o}from"./index-3iDVoJzw.js";import"./bakedVertexAnimation-DBCEMRHV.js";import"./instancesDeclaration-DA-_cKKE.js";import"./morphTargetsVertex--8CFnG9v.js";import"./index-B5Zu_GVg.js";const i="iblVoxelGridVertexShader",e=`attribute vec3 position;varying vec3 vNormalizedPosition;
#include<bonesDeclaration>
#include<bakedVertexAnimationDeclaration>
#include<instancesDeclaration>
#include<morphTargetsVertexGlobalDeclaration>
#include<morphTargetsVertexDeclaration>[0..maxSimultaneousMorphTargets]
uniform mat4 invWorldScale;uniform mat4 viewMatrix;void main(void) {vec3 positionUpdated=position;
#include<morphTargetsVertexGlobal>
#include<morphTargetsVertex>[0..maxSimultaneousMorphTargets]
#include<instancesVertex>
#include<bonesVertex>
#include<bakedVertexAnimation>
vec4 worldPos=finalWorld*vec4(positionUpdated,1.0);gl_Position=viewMatrix*invWorldScale*worldPos;vNormalizedPosition.xyz=gl_Position.xyz*0.5+0.5;
#ifdef IS_NDC_HALF_ZRANGE
gl_Position.z=gl_Position.z*0.5+0.5;
#endif
}`;o.ShadersStore[i]||(o.ShadersStore[i]=e);const D={name:i,shader:e};export{D as iblVoxelGridVertexShader};
