import {buildSandbags} from './sandbags.js';
import {SpatialBatches} from './spatial-batches.js';
import {terrainMeshes} from './terrain-mesh.js';
import {makeSky} from './sky.js';
import {Mesh,VertexData,StandardMaterial,Color3,Texture,Vector3} from './babylon.js';
import {Geometry} from './geometry.js';
import {assetURL} from './assets.js';
import {northZ,roadX,MAP,HQ} from '../data/world-map.js';
import {rng,clamp} from '../core/math.js';
export function materials(scene){const result={};
 for(const [name,file,color] of [['earth','earth',[1,.98,.94]],['wood','wood',[.98,.95,.88]],['bags','bags',[1,.98,.91]],['concrete','concrete',[.93,.96,.96]],['brick','brick',[.95,.92,.89]],['crate','wood',[1,.94,.79]],['rubble','concrete',[.78,.73,.66]]]){
  const m=new StandardMaterial(name,scene);m.diffuseTexture=new Texture(assetURL(`textures/${file}.jpg`),scene);m.bumpTexture=new Texture(assetURL(`textures/${file}-normal.png`),scene);m.bumpTexture.level=name==='earth'?.48:.32;m._v03Normal=m.bumpTexture;m.diffuseColor=new Color3(...color);m.specularColor=new Color3(.045,.045,.04);m.specularPower=48;m.backFaceCulling=true;result[name]=m;
 }
 for(const [name,color] of [['iron',[.13,.155,.15]],['darkwood',[.25,.23,.175]],['paper',[.80,.77,.64]],['white',[.78,.8,.73]],['red',[.49,.10,.07]],['black',[.047,.052,.046]],['brass',[.49,.38,.17]],['rope',[.43,.37,.24]]]){const m=new StandardMaterial(name,scene);m.diffuseColor=new Color3(...color);m.specularColor=name==='iron'?new Color3(.18,.19,.18):Color3.Black();m.backFaceCulling=true;result[name]=m;}
 const grass=new StandardMaterial('alpha-tested-dry-grass',scene);grass.diffuseTexture=new Texture(assetURL('textures/grass-tuft.png'),scene);grass.diffuseTexture.hasAlpha=true;grass.useAlphaFromDiffuseTexture=true;grass.diffuseTexture.wrapU=grass.diffuseTexture.wrapV=Texture.CLAMP_ADDRESSMODE;grass.transparencyMode=1;grass.alphaCutOff=.4;grass.backFaceCulling=false;grass.twoSidedLighting=true;grass.emissiveColor=new Color3(.055,.052,.035);grass.diffuseColor=new Color3(.95,.96,.88);grass.specularColor=Color3.Black();for(let i=0;i<4;i++)result[`grass${i}`]=grass;
 const water=new StandardMaterial('shallow-puddle',scene);water.diffuseColor=new Color3(.17,.21,.21);water.specularColor=new Color3(.35,.40,.40);water.specularPower=96;water.emissiveColor=new Color3(.04,.05,.052);water.alpha=.76;water.backFaceCulling=false;result.water=water;
 return result;
}
export function makeLandscape(scene,world,mats){const terrain=world.terrain,random=rng(5619),batches=new SpatialBatches(32),get=name=>batches.writer(name);

 makeSky(scene);
 const data=new VertexData(),positions=[],uvs=[],colors=[],indices=[];for(let z=0;z<terrain.nz;z++)for(let x=0;x<terrain.nx;x++){const px=x+terrain.minX,pz=z+terrain.minZ,y=terrain.heights[z*terrain.nx+x],trench=terrain.trenchDistance(px,pz),noise=.87+random()*.16;positions.push(px,y,pz);uvs.push(px/3.3,pz/3.3);const muddy=trench<3.6||terrain.base(px,pz)-y>.25||Math.abs(px-roadX(pz))<3.5;colors.push((muddy?.81:1)*noise,(muddy?.80:.98)*noise,(muddy?.74:.84)*noise,1);}
 for(let z=0;z<terrain.nz-1;z++)for(let x=0;x<terrain.nx-1;x++){const a=z*terrain.nx+x,b=a+1,c=a+terrain.nx,d=c+1;indices.push(a,b,c,b,d,c);}const normals=[];VertexData.ComputeNormals(positions,indices,normals);const ground=terrainMeshes(scene,terrain,mats.earth,positions,normals,uvs,colors);
 for(const b of world.layout){if(b.breakable)continue;if(b.wire){const g=get('iron');for(let x=b.x-b.w/2;x<=b.x+b.w/2;x+=2.5){g.cylinder([x,b.y-.45,b.z],[x+.17,b.y+.8,b.z],.038,.025,5);}
  for(let layer=0;layer<3;layer++){for(let x=b.x-b.w/2;x<b.x+b.w/2;x+=.6){const y=b.y-.25+layer*.3;g.cylinder([x,y,b.z],[x+.6,y+.05,b.z+.12],.012,.012,4);g.cylinder([x,y-.08,b.z-.09],[x+.12,y+.11,b.z+.12],.012,.012,4);}}continue;}
  if(b.mat==='bags'){
   buildSandbags(get('bags'),b);
  }else if(b.kind==='stump'){
   get('darkwood').cylinder([b.x,b.min.y,b.z],[b.x+.11,b.max.y,b.z+.07],.31,.11,10);
   for(let j=0;j<3;j++){const h=b.min.y+b.h*(.45+j*.15),a=j*2.3;get('darkwood').cylinder([b.x,h,b.z],[b.x+Math.sin(a)*1.2,h+.65,b.z+Math.cos(a)*1.2],.10,.027,7);}
  }else{
   get(b.mat).box(b.x,b.y,b.z,b.w,b.h,b.d,b.yaw||0);
   if(b.kind==='rubble'){
    for(let k=0;k<10;k++){const xx=b.min.x+random()*b.w,zz=b.min.z+random()*b.d,yy=b.max.y+.05;get('brick').box(xx,yy,zz,.20+random()*.13,.08,.11+random()*.09,random()*Math.PI,[.78,.78,.75,1]);}
   }
   if(b.mat==='brick'&&b.h>1.5){
    // Mortar ledge, a few broken masonry units and a weather-darkened plinth.
    if(b.w>b.d){get('rubble').box(b.x,b.min.y+.08,b.z,b.w+.04,.16,b.d+.055);for(let j=0;j<Math.min(14,Math.floor(b.w/.35));j++)get('brick').box(b.min.x+(j+.5)*b.w/Math.min(14,Math.floor(b.w/.35)),b.max.y+.045,b.z,.22,.09,b.d*.91,j%3*.035);}
    else{get('rubble').box(b.x,b.min.y+.08,b.z,b.w+.055,.16,b.d+.04);for(let j=0;j<Math.min(14,Math.floor(b.d/.35));j++)get('brick').box(b.x,b.max.y+.045,b.min.z+(j+.5)*b.d/Math.min(14,Math.floor(b.d/.35)),b.w*.91,.09,.22,j%3*.035);}
   }
   if(b.mat==='crate'){
    for(const dx of [-b.w*.40,b.w*.40]){get('wood').box(b.x+dx,b.y,b.z,.075,b.h+.03,b.d+.025);for(const side of [-1,1])get('iron').box(b.x+dx,b.y+b.h*.3,b.z+side*(b.d*.5+.023),.038,.038,.010);}
    get('wood').box(b.x,b.y+b.h*.5+.02,b.z,b.w+.015,.035,b.d+.015);
    for(const side of [-1,1])for(let row=0;row<3;row++)get('darkwood').box(b.x,b.min.y+(row+1)*b.h/4,b.z+side*(b.d/2+.003),b.w,.008,.006);
    get('iron').box(b.x,b.y+.10,b.z-b.d*.5-.03,.15,.038,.028);
   }
  }
 }
 // Earth-filled crossings visibly explain why heavy vehicles can cross the trench.
 for(const x of [-13,13])for(const z of [51,146])for(let i=-3;i<=3;i++)get('darkwood').cylinder([x-2.5,terrain.height(x,z)+.1,z+i*.35],[x+2.5,terrain.height(x,z)+.1,z+i*.35],.14,.14,7);
 // Background trees are beyond the playable boundary. In-world trunks come from layout colliders.
 for(let i=0;i<44;i++){const x=i%2?99+random()*7:-99-random()*7,z=-12+random()*233,y=terrain.height(x,z),h=4+random()*4;get('darkwood').cylinder([x,y,z],[x+.2,y+h,z+.1],.24,.035,7);for(let j=0;j<2;j++){const by=y+h*(.5+j*.16),angle=random()*Math.PI*2;get('darkwood').cylinder([x,by,z],[x+Math.sin(angle)*1.6,by+1,z+Math.cos(angle)*1.6],.09,.018,6);}}
 // Four reproducible decorative layers; solid cover and NPCs NEVER disappear with a preset.
 for(let i=0;i<3700;i++){const x=(random()-.5)*181,z=-20+random()*228;if((Math.abs(x-HQ.x)<HQ.w/2+.8&&Math.abs(z-HQ.z)<HQ.d/2+.8)||terrain.trenchDistance(x,z)<3.7||Math.abs(x-13)<3||Math.abs(x+13)<3||Math.abs(x-roadX(z))<4)continue;const y=terrain.height(x,z),h=.20+random()*.47;if(terrain.base(x,z)-y>.35)continue;for(let j=0;j<2;j++){const yaw=random()*Math.PI;get(`grass${i%4}`).blade(x,y,z,.5,h,yaw,[.86+random()*.14,.87+random()*.13,.91,1]);}}
 // Small terrain-conforming water patches, low-cost specular only (no fake screen-space reflections).
 for(const crater of terrain.craters.slice(0,35)){const x=crater.x,z=crater.z;if(!Number.isFinite(x)||terrain.trenchDistance(x,z)<5)continue;const r=.5+random()*.65,y=terrain.height(x,z)+.025,g=get('water');for(let j=0;j<18;j++){const a=j/18*Math.PI*2,b=(j+1)/18*Math.PI*2;g.cylinder([x+Math.cos(a)*r,y,z+Math.sin(a)*r],[x+Math.cos(b)*r,y,z+Math.sin(b)*r],.007,.007,4);}const geom=batches.get('water',x,z);for(let j=0;j<18;j++){const a=j/18*Math.PI*2,b=(j+1)/18*Math.PI*2;geom.face([[x,y,z],[x+Math.cos(a)*r,y,z+Math.sin(a)*r],[x+Math.cos(b)*r,y,z+Math.sin(b)*r]],[[0,1,0],[0,1,0],[0,1,0]],[[.5,.5],[.5+Math.cos(a)*.5,.5+Math.sin(a)*.5],[.5+Math.cos(b)*.5,.5+Math.sin(b)*.5]]);}}
 // Telephone, ordnance boxes, trench sign and the starting field document.
 let y=terrain.height(4,159);get('darkwood').box(4,y+1.42,158.8,.58,.28,.32);get('black').box(4,y+1.445,158.62,.48,.19,.017);for(const x of [3.76,4.24])get('brass').box(x,y+1.44,158.60,.027,.21,.012);get('iron').cylinder([4.30,y+1.42,158.8],[4.40,y+1.42,158.8],.016,.016,8);get('iron').cylinder([4.40,y+1.42,158.8],[4.40,y+1.34,158.8],.016,.016,8);get('iron').cylinder([3.76,y+1.61,158.8],[4.24,y+1.61,158.8],.07,.07,8);get('paper').box(4.6,y+1.295,158.72,.34,.015,.26,.3);
 y=terrain.height(3,4);get('paper').box(3,y+.665,4,.42,.02,.3,.18);
 y=terrain.height(23,60);get('iron').cylinder([23,y+.2,59.5],[23,y+1.2,59.5],.06,.06,7);get('iron').box(23,y+1.3,59.5,.22,.24,.75);get('iron').cylinder([23,y+1.36,59.2],[23,y+1.36,57.85],.09,.075,10);get('wood').box(23.45,y+.28,59.1,.45,.42,.64);
 const props=batches.meshes(scene,mats);for(const mesh of props){if(mesh.material===mats.grass0){const tier=Number(mesh.name.match(/grass([0-3])/)?.[1]||0);mesh.metadata={...mesh.metadata,shadowCaster:false,detail:true,detailRank:(tier+.5)/4};}if(mesh.material===mats.water)mesh.metadata.shadowCaster=false;}return [...ground,...props];
}
