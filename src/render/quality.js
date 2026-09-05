/** Explicit rendering-only budgets. All four profiles preserve the same simulation. */
export const QUALITY=Object.freeze({
 low:Object.freeze({label:'Low',shadowSize:0,shadowRadius:0,shadowFilter:2,normals:false,anisotropy:2,lodNear:12,lodFar:36,detailDistance:38,detailFraction:.35,effectsLimit:72,dustCount:6,debrisCount:8,markLimit:8}),
 medium:Object.freeze({label:'Medium',shadowSize:1024,shadowRadius:32,shadowFilter:2,normals:true,anisotropy:4,lodNear:20,lodFar:54,detailDistance:64,detailFraction:.6,effectsLimit:128,dustCount:10,debrisCount:14,markLimit:16}),
 high:Object.freeze({label:'High',shadowSize:2048,shadowRadius:48,shadowFilter:1,normals:true,anisotropy:8,lodNear:30,lodFar:78,detailDistance:92,detailFraction:.85,effectsLimit:208,dustCount:15,debrisCount:22,markLimit:24}),
 ultra:Object.freeze({label:'Ultra',shadowSize:4096,shadowRadius:64,shadowFilter:0,normals:true,anisotropy:16,lodNear:42,lodFar:105,detailDistance:130,detailFraction:1,effectsLimit:320,dustCount:20,debrisCount:30,markLimit:32})
});
export function qualityProfile(name){return QUALITY[name]||QUALITY.medium;}
