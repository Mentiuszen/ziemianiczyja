import {LocalizedError} from '../i18n/index.js';
/** Stable, readable API over the vendored official Babylon.js 8.46.2 build.
 * The compiled distribution is pinned and accompanied by hashes and licences.
 */
export {bn as Engine,b as Scene,V as Vector3,C as Color3,b9 as Color4,M as Matrix,ao as Quaternion,m as Mesh,l as VertexData,bh as TransformNode,bK as TargetCamera,bl as DirectionalLight,T as Texture,ZNHemisphericLight as HemisphericLight} from '../../vendor/babylon-runtime/chunks/index-3iDVoJzw.js';
export {S as StandardMaterial} from '../../vendor/babylon-runtime/chunks/standardMaterial-8n2LZloV.js';
export {ShadowGenerator} from '../../vendor/babylon-runtime/chunks/shadowGenerator-CdOm82t1.js';
import '../../vendor/babylon-runtime/chunks/shadowGeneratorSceneComponent-CnoTnQCe.js';
import {GLTFFileLoader} from '../../vendor/babylon-runtime/chunks/glTFLoader-C46aNr9U.js';
/** glTF FileLoader consumes the documented parsed JSON + binary reader shape. */
export async function loadGLB(scene,url,signal){
 const response=await fetch(url,{signal});if(!response.ok)throw new LocalizedError('error.assetHttp',{url,status:response.status});
 const array=await response.arrayBuffer(),view=new DataView(array);if(view.getUint32(0,true)!==0x46546c67||view.getUint32(4,true)!==2)throw new LocalizedError('error.assetGLB',{url});
 let at=12,json,bin;while(at<array.byteLength){const size=view.getUint32(at,true),kind=view.getUint32(at+4,true);at+=8;if(kind===0x4e4f534a)json=JSON.parse(new TextDecoder().decode(new Uint8Array(array,at,size)));if(kind===0x004e4942)bin=new Uint8Array(array,at,size);at+=size;}
 if(!json||!bin)throw new LocalizedError('error.assetIncomplete',{url});
 const loader=new GLTFFileLoader();loader.validate=false;loader.animationStartMode=0;
 const data={json,bin:{byteLength:bin.byteLength,readAsync:(offset,length)=>Promise.resolve(bin.subarray(offset,offset+length))}};
 const container=await loader.loadAssetContainerAsync(scene,data,new URL('.',url).href,undefined,url.split('/').pop());container.populateRootNodes();return container;
}
