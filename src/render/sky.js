import {Mesh, VertexData, StandardMaterial, Color3, Texture} from './babylon.js';
import {assetURL} from './assets.js';
import {skyGeometry} from './sky-geometry.js';

export function makeSky(scene) {
  const material = new StandardMaterial('overcast-spherical-sky', scene);
  material.disableLighting = true;
  material.disableDepthWrite = true;
  material.backFaceCulling = false;
  material.fogEnabled = false;
  material.diffuseColor = Color3.Black();
  material.specularColor = Color3.Black();
  // StandardMaterial adds emissiveTexture to emissiveColor (not multiplies).
  material.emissiveColor = Color3.Black();
  material.emissiveTexture = new Texture(assetURL('textures/sky-v02.jpg'), scene);
  material.emissiveTexture.wrapU = Texture.WRAP_ADDRESSMODE;
  material.emissiveTexture.wrapV = Texture.CLAMP_ADDRESSMODE;
  const mesh = new Mesh('sky:sphere', scene);
  const source = skyGeometry();
  const data = new VertexData();
  Object.assign(data, source); data.applyToMesh(mesh);
  mesh.material = material;
  mesh.infiniteDistance = true;
  mesh.alwaysSelectAsActiveMesh = true;
  mesh.isPickable = false;
  mesh.receiveShadows = false;
  // Deliberately not returned as a world/shadow caster.
  return mesh;
}
