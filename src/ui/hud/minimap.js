import {MAP,roadX} from '../../data/world-map.js';import {TRENCHES,RAMPS} from '../../data/cambrai.js';import {HUD} from '../../data/hud.js';import {worldToMinimap,worldToRadar,radarEdge} from './projection.js';
const active=a=>a&&a.active!==false&&a.dormant!==true&&(a.hp??100)>0;
export function gatherFriendlies(world){
 const faction=world.player.faction,result=[];
 for(const a of world.npcs)if(active(a)&&a.faction===faction&&a.id!==world.player.id)result.push({id:a.id,pos:a.pos,kind:'infantry'});
 for(const a of world.tanks)if(active(a)&&a.faction===faction&&a.state!=='destroyed')result.push({id:a.id,pos:a.pos,kind:a.state==='immobilized'?'immobilized':'tank'});
 for(const a of world.air.planes)if(active(a)&&a.faction===faction&&a.age<a.life)result.push({id:a.id,pos:a.pos,kind:'plane'});return result;
}
/** Cached tactical ground plan with a single 2D canvas; no WebGL camera or A*. */
export class Minimap {
 constructor(canvas){this.canvas=canvas;this.context=canvas.getContext('2d');this.world=null;this.background=null;this.nextDraw=0;this.draws=0;this.rebuilds=0;this.dpr=0;}
 setSize(finalSize,scale=1){if(!Number.isFinite(finalSize)||finalSize<=0)return;const logical=finalSize/scale;if(this.layoutSize!==logical||this.hudScale!==scale){this.layoutSize=logical;this.hudScale=scale;this.nextDraw=0;}}
 reset(){this.world=null;this.background=null;this.nextDraw=0;}
 build(world){
  const c=document.createElement('canvas');c.width=MAP.width*2;c.height=MAP.depth*2;const g=c.getContext('2d');
  g.fillStyle='#303531';g.fillRect(0,0,c.width,c.height);
  const point=(x,z)=>({x:(x-MAP.minX)*2,y:(MAP.minZ+MAP.depth-z)*2});
  // Sample once. Runtime decor, quality and LOD never influence this layer.
  for(let z=MAP.minZ;z<MAP.minZ+MAP.depth;z+=2)for(let x=MAP.minX;x<MAP.minX+MAP.width;x+=2){const h=world.terrain.height(x,z),v=Math.max(0,Math.min(12,Math.round(h*2)+6));g.fillStyle=`rgb(${41+v},${44+v},${41+v})`;const p=point(x,z);g.fillRect(p.x,p.y-4,4,4);}
  g.lineWidth=8;g.strokeStyle='#7c7660';g.beginPath();for(let z=MAP.minZ;z<=MAP.minZ+MAP.depth;z+=2){const p=point(roadX(z),z);z===MAP.minZ?g.moveTo(p.x,p.y):g.lineTo(p.x,p.y);}g.stroke();
  g.lineCap='round';for(const line of TRENCHES){g.strokeStyle='#1b251f';g.lineWidth=7;g.beginPath();line.forEach(([x,z],i)=>{const p=point(x,z);i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y);});g.stroke();g.strokeStyle='#6e756c';g.lineWidth=2;g.stroke();}
  for(const r of RAMPS){g.strokeStyle='#aca081';g.lineWidth=r.width*2;g.beginPath();const a=point(r.x,r.z0),b=point(r.x,r.z1);g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();}
  for(const b of world.collision.boxes){if(b.blocksMovement===false||b.kind==='duckboard')continue;const p=point(b.min.x,b.max.z),w=(b.max.x-b.min.x)*2,h=(b.max.z-b.min.z)*2;g.fillStyle=b.wire||b.kind==='fence'?'#8e8470':'#6d756c';g.globalAlpha=b.walkableTop===true?.5:.8;g.fillRect(p.x,p.y,Math.max(1,w),Math.max(1,h));}g.globalAlpha=1;
  this.background=c;this.world=world;this.breachCount=world.destroyedObstacles.length;this.rebuilds++;
 }
 draw(world,contacts,settings,now){
  this.canvas.hidden=settings.showMinimap===false;if(this.canvas.hidden||!this.context)return;
  if(now<this.nextDraw&&this.world===world&&this.breachCount===world.destroyedObstacles.length)return;
  const size=this.layoutSize||this.canvas.clientWidth||220,dpr=Math.min(HUD.maxDpr,globalThis.devicePixelRatio||1)*(this.hudScale||1);
  if(this.size!==size||this.dpr!==dpr){this.size=size;this.dpr=dpr;this.canvas.width=Math.round(size*dpr);this.canvas.height=Math.round(size*dpr);this.nextDraw=0;}
  if(this.world!==world||this.breachCount!==world.destroyedObstacles.length){this.build(world);this.nextDraw=0;}
  if(now<this.nextDraw)return;this.nextDraw=now+1000/HUD.minimapHz;this.draws++;
  const g=this.context,p=world.player.pos,R=HUD.range,S=size;g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,S,S);g.save();g.beginPath();g.arc(S/2,S/2,S/2-1.5,0,Math.PI*2);g.clip();g.fillStyle='#151c1d';g.fillRect(0,0,S,S);
  // Draw the whole cached background offset into the clipped viewport, including neutral off-map areas.
  const scale=S/(2*R),origin=worldToMinimap({x:MAP.minX,z:MAP.minZ+MAP.depth},p,S,R);
  g.drawImage(this.background,origin.x,origin.y,MAP.width*scale,MAP.depth*scale);
  for(const a of gatherFriendlies(world)){const q=worldToRadar(a.pos,p,S,R);if(!q.inside)continue;g.fillStyle='#82b2d0';g.strokeStyle='#13231b';g.lineWidth=1.4;
   g.beginPath();if(a.kind==='infantry')g.arc(q.x,q.y,2.8,0,Math.PI*2);else if(a.kind==='plane'){g.moveTo(q.x,q.y-5);g.lineTo(q.x+6,q.y+3);g.lineTo(q.x,q.y+1);g.lineTo(q.x-6,q.y+3);g.closePath();}else{g.rect(q.x-4,q.y-5,8,10);}g.fill();g.stroke();if(a.kind==='immobilized'){g.fillStyle='#26342a';g.fillRect(q.x-3,q.y-1,6,2);}}
  for(const c of contacts){const q=worldToRadar(c.pos,p,S,R);if(!q.inside)continue;g.globalAlpha=settings.uiAnimations===false?1:c.opacity;g.fillStyle='#d26458';g.strokeStyle='#21140f';g.lineWidth=1.2;g.beginPath();g.arc(q.x,q.y,3.2,0,Math.PI*2);g.fill();g.stroke();}g.globalAlpha=1;
  const objective=world.director.objective,q=worldToRadar(objective,p,S,R),edge=radarEdge(q,S,9),cx=edge.x,cy=edge.y;g.fillStyle='#e3c378';g.strokeStyle='#171d17';g.lineWidth=1.8;g.beginPath();g.moveTo(cx,cy-5);g.lineTo(cx+5,cy);g.lineTo(cx,cy+5);g.lineTo(cx-5,cy);g.closePath();g.fill();g.stroke();
  g.save();g.translate(S/2,S/2);g.rotate(world.player.yaw);g.fillStyle='#f1f1ea';g.strokeStyle='#17211b';g.lineWidth=1.4;g.beginPath();g.moveTo(0,-7);g.lineTo(5,6);g.lineTo(0,3);g.lineTo(-5,6);g.closePath();g.fill();g.stroke();g.restore();g.restore();
  // A fixed north-up rim, not another camera or a rotating screenshot of the scene.
  g.strokeStyle='#dddacb99';g.lineWidth=1;g.beginPath();g.arc(S/2,S/2,S/2-1,0,Math.PI*2);g.stroke();
  g.strokeStyle='#cecbb614';g.beginPath();g.arc(S/2,S/2,S/4,0,Math.PI*2);g.moveTo(S/2,16);g.lineTo(S/2,S-16);g.moveTo(16,S/2);g.lineTo(S-16,S/2);g.stroke();
  g.font='10px Arial';g.textAlign='center';g.fillStyle='#e5e5de';g.fillText('N',S/2,13);g.fillText('S',S/2,S-6);g.fillText('W',10,S/2+3);g.fillText('E',S-10,S/2+3);
 }
 dispose(){this.reset();this.context=null;this.canvas.width=this.canvas.height=1;}
}
