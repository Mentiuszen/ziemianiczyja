import {getHudScale} from './settings.js';
import {t} from '../../i18n/index.js';
/** Screen direction from camera yaw/pitch; behind the camera stays on the lower rim. */
export function grenadeDirection(point,camera){
 const dx=point.x-camera.pos.x,dy=point.y-camera.pos.y,dz=point.z-camera.pos.z;
 const right=dx*Math.cos(camera.yaw)-dz*Math.sin(camera.yaw),forward=dx*Math.sin(camera.yaw)+dz*Math.cos(camera.yaw);
 const up=dy*Math.cos(camera.pitch)+forward*Math.sin(camera.pitch),depth=forward*Math.cos(camera.pitch)-dy*Math.sin(camera.pitch);
 const roll=Number.isFinite(camera.roll)?camera.roll:0;
 let x=right*Math.cos(roll)+up*Math.sin(roll),y=right*Math.sin(roll)-up*Math.cos(roll);
 if(depth<=0)y=Math.abs(depth)+Math.max(0,y);
 if(Math.hypot(x,y)<.0001){x=0;y=depth<0?1:dy>0?-1:1;}
 const length=Math.hypot(x,y);return{x:x/length,y:y/length,behind:depth<0};
}
export function grenadeThreats(world,max=3){
 const p=world.player,chest={x:p.pos.x,y:p.pos.y+(p.stance==='prone'?.25:p.stance==='crouch'?.65:1.05),z:p.pos.z},out=[];
 for(const g of world.grenades){
  if(g.dead||!Number.isFinite(g.fuse)||g.fuse<=0||g.faction===p.faction)continue;
  const distance=Math.hypot(g.pos.x-chest.x,g.pos.y-chest.y,g.pos.z-chest.z);if(distance>8)continue;
  // The same blast origin offset and body sample as combat/ballistics.js.
  if(!world.collision.visible({x:g.pos.x,y:g.pos.y+.12,z:g.pos.z},chest))continue;
  out.push({id:g.id,grenade:g,distance,urgency:Math.floor(g.fuse*4),height:g.pos.y-chest.y});
 }
 out.sort((a,b)=>a.urgency-b.urgency||Math.round(a.distance*2)-Math.round(b.distance*2)||String(a.id).localeCompare(String(b.id)));
 return{items:out.slice(0,max),extra:Math.max(0,out.length-max)};
}
function intersects(a,b,pad=4){return a.left<b.right+pad&&a.right>b.left-pad&&a.top<b.bottom+pad&&a.bottom>b.top-pad;}
export function placeGrenade(point,direction,viewport,reserved=[],size=42){
 const half=size/2+8,cx=viewport.left+viewport.width/2,cy=viewport.top+viewport.height/2;
 const rect=(x,y)=>({left:x-size/2,right:x+size/2,top:y-size/2,bottom:y+size/2});
 const valid=(x,y)=>x>=viewport.left+half&&x<=viewport.left+viewport.width-half&&y>=viewport.top+half&&y<=viewport.top+viewport.height-half&&!reserved.some(r=>intersects(rect(x,y),r));
 let x=point.x,y=point.y,onscreen=point.visible&&!direction.behind;
 if(onscreen){
  // Keep a visible arrow pointing back to the exact projected point when displaced.
  for(const [ox,oy] of [[0,-size],[size,-size],[-size,-size],[size,0],[-size,0],[0,size],[size,size],[-size,size]])if(valid(x+ox,y+oy))return{x:x+ox,y:y+oy,targetX:x,targetY:y,onscreen:true};
 }
 const dx=direction.x,dy=direction.y;
 const max=Math.min((viewport.width/2-half)/Math.max(.0001,Math.abs(dx)),(viewport.height/2-half)/Math.max(.0001,Math.abs(dy)));
 for(let d=max;d>size;d-=size*.65){x=cx+dx*d;y=cy+dy*d;if(valid(x,y))return{x,y,targetX:onscreen?point.x:x+dx*size,targetY:onscreen?point.y:y+dy*size,onscreen};}
 // Extremely small viewport: essential warning wins over optional HUD panels.
 x=cx+dx*Math.max(0,max);y=cy+dy*Math.max(0,max);return{x,y,targetX:onscreen?point.x:x+dx*size,targetY:onscreen?point.y:y+dy*size,onscreen,compact:true};
}
export class GrenadeWarnings {
 constructor(host){
  this.host=host;this.nextSample=0;this.threats={items:[],extra:0};this.nodes=[];
  for(let i=0;i<3;i++){const n=document.createElement('div');n.className='grenade-marker';n.hidden=true;n.innerHTML='<span class="grenade-bearing">➤</span><svg viewBox="0 0 18 25" aria-hidden="true"><path d="M6 2h6v3H6zm-1 5h8l2 7-1 8-5 2-5-2-1-8z" fill="currentColor"/></svg><span class="grenade-distance"></span><span class="grenade-extra"></span>';host.appendChild(n);this.nodes.push(n);}
 }
 reset(){this.nextSample=0;this.threats={items:[],extra:0};for(const n of this.nodes)n.hidden=true;}
 update(world,view,settings,snapshot,now){
  if(now>=this.nextSample){this.nextSample=now+50;this.threats=grenadeThreats(world);}
  const camera=view.hudCamera?.()||{pos:view.cameraPosition(),yaw:world.player.yaw,pitch:world.player.pitch};
  const scale=getHudScale(settings,'grenadeWarning'),reserved=[...snapshot.reserved];
  for(let i=0;i<this.nodes.length;i++){
   const n=this.nodes[i],item=this.threats.items[i];
   if(!item||!world.grenades.includes(item.grenade)||item.grenade.dead||item.grenade.fuse<=0){n.hidden=true;continue;}
   const position=view.presentPosition?.(item.id,item.grenade.pos)||item.grenade.pos,q=view.projectPoint(position),d=grenadeDirection(position,camera);
   const placed=placeGrenade(q,d,snapshot.viewport,reserved,68*scale);
   n.hidden=false;n.style.left=placed.x+'px';n.style.top=placed.y+'px';n.style.setProperty('--warning-scale',scale);
   n.querySelector('.grenade-bearing').style.transform=`rotate(${Math.atan2(placed.targetY-placed.y,placed.targetX-placed.x)*180/Math.PI}deg)`;
   n.querySelector('.grenade-distance').textContent=`${Math.ceil(item.distance)} m${item.height>1?' ↑':item.height< -1?' ↓':''}`;
   n.querySelector('.grenade-extra').textContent=i===0&&this.threats.extra?`+${this.threats.extra}`:'';
   n.setAttribute('aria-label',t('hud.grenadeBearing',{distance:Math.ceil(item.distance)}));
   reserved.push({left:placed.x-34*scale,right:placed.x+34*scale,top:placed.y-34*scale,bottom:placed.y+34*scale});
  }
 }
 dispose(){this.host.replaceChildren();this.nodes.length=0;}
}
