import {loadGLB,TransformNode} from './babylon.js';
export const assetURL=path=>new URL(`../../public/assets/${path}`,import.meta.url).href;
export class Assets {
 constructor(scene){this.scene=scene;this.models=new Map();this.abort=new AbortController();}
 async load(progress){const names=['british','british-v1','british-v2','german','german-v1','german-v2','smle','gewehr','webley','lewis','hands','mark-iv','field-gun-77','dh5','dfw'];for(let i=0;i<names.length;i++){const name=names[i];progress(`Wczytywanie modeli · ${i+1}/${names.length}`,i/names.length);const c=await loadGLB(this.scene,assetURL(`models/${name}.glb`),this.abort.signal);this.models.set(name,c);for(const m of c.materials){for(const texture of m.getActiveTextures())texture.anisotropicFilteringLevel=2;}}}
 applyQuality(profile){for(const c of this.models.values())for(const m of c.materials){if(m._v03Normal===undefined)m._v03Normal=m.bumpTexture||null;m.bumpTexture=profile.normals?m._v03Normal:null;for(const texture of m.getActiveTextures())texture.anisotropicFilteringLevel=profile.anisotropy;}}
 instantiate(name,id){const c=this.models.get(name);if(!c)throw Error(`Brak zasobu ${name}`);const entry=c.instantiateModelsToScene(n=>`${id}:${n}`,false,{doNotInstantiate:true});const root=new TransformNode(id,this.scene);for(const r of entry.rootNodes)r.parent=root;for(const a of entry.animationGroups)a.stop();return{root,entry,meshes:root.getChildMeshes(),animations:new Map(entry.animationGroups.map(a=>[a.name.split(':').pop(),a]))};}
 dispose(){this.abort.abort();for(const c of this.models.values())c.dispose();this.models.clear();}
}
