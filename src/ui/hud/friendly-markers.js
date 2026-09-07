import {getHudScale} from './settings.js';
import {hitSpheres} from '../../world/collision.js';import {HUD} from '../../data/hud.js';
export function headAnchor(actor){const head=hitSpheres(actor).find(s=>s.part==='head').c;return{x:head.x,y:head.y+.23,z:head.z};}
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
function relevantDynamics(world,eye,head){return(world.collision.dynamic||[]).filter(b=>['x','y','z'].every(k=>Math.max(eye[k],head[k])>=b.min[k]&&Math.min(eye[k],head[k])<=b.max[k])).map(b=>[b.id,b.min.x,b.min.y,b.min.z,b.max.x,b.max.y,b.max.z].join(':')).join('|');}
/** Geometry visibility and budgets are separate from DOM allocation. */
export class FriendlyMarkerModel {
 constructor(){this.reset();}
 reset(){this.cache=new Map();this.cursor=0;this.lastEye=null;this.lastTime=-Infinity;this.rays=0;}
 sample(world,view,now,reserved=[],scale=1){
  const eye=view.cameraPosition(),vp=view.viewport();this.rays=0;
  if(now<this.lastTime||(this.lastEye&&distance(eye,this.lastEye)>1.5))this.cache.clear();this.lastEye={...eye};this.lastTime=now;
  const candidates=[];
  for(const a of world.npcs){if(a.hp<=0||a.active===false||a.dormant===true||a.faction!==world.player.faction||a.id===world.player.id||distance(a.pos,eye)>HUD.markerRange)continue;
   const head=hitSpheres(a).find(h=>h.part==='head').c,q=view.projectPoint(headAnchor(view.presentationActor?.(a)||a));if(!q.visible||reserved.some(r=>q.x>=r.left-16*scale&&q.x<=r.right+16*scale&&q.y>=r.top-9*scale&&q.y<=r.bottom+9*scale))continue;
   candidates.push({id:a.id,head,q,dynamics:relevantDynamics(world,eye,head)});if(candidates.length>=HUD.maxMarkers)break;
  }
  const live=new Set(candidates.map(c=>c.id));for(const id of this.cache.keys())if(!live.has(id))this.cache.delete(id);
  if(candidates.length){const start=this.cursor%candidates.length;for(let i=0;i<Math.min(HUD.losPerFrame,candidates.length);i++){const c=candidates[(start+i)%candidates.length];this.cache.set(c.id,{time:now,visible:world.collision.visible(eye,c.head),head:{...c.head},dynamics:c.dynamics});this.rays++;}this.cursor=(start+HUD.losPerFrame)%candidates.length;}
  const visible=candidates.filter(c=>{const v=this.cache.get(c.id);return v?.visible&&now-v.time<=HUD.losAge&&distance(v.head,c.head)<.45&&v.dynamics===c.dynamics;}).map(c=>({id:c.id,x:c.q.x,y:c.q.y,opacity:.52,width:28}));
  const result=[];for(const marker of visible)if(!result.some(m=>Math.abs(m.x-marker.x)<30*scale&&Math.abs(m.y-marker.y)<18*scale))result.push(marker);return result;
 }
}
export class FriendlyMarkers {
 constructor(host){this.host=host;this.model=new FriendlyMarkerModel();this.nodes=new Map();this.free=[];}
 update(world,view,settings,reserved){
  if(settings.showAllyMarkers===false){this.host.hidden=true;return;}this.host.hidden=false;
  const markers=this.model.sample(world,view,world.time,reserved,getHudScale(settings,'allyMarker')),live=new Set(markers.map(m=>m.id));
  for(const [id,node] of this.nodes)if(!live.has(id)){node.hidden=true;this.nodes.delete(id);this.free.push(node);}
  for(const m of markers){let node=this.nodes.get(m.id);if(!node){node=this.free.pop();if(!node){if(this.nodes.size>=HUD.maxMarkers)continue;node=document.createElement('img');node.src='./public/assets/ui/ally-uk.svg';node.alt='';node.className='friendly-flag';node.draggable=false;node.setAttribute('aria-hidden','true');this.host.appendChild(node);}this.nodes.set(m.id,node);}node.hidden=false;node.style.transform=`translate(${m.x}px,${m.y}px) translate(-50%,-100%)`;node.style.opacity=m.opacity;node.style.width=(28*getHudScale(settings,'allyMarker'))+'px';node.style.height=(14*getHudScale(settings,'allyMarker'))+'px';}
 }
 reset(){this.model.reset();for(const node of this.nodes.values()){node.hidden=true;this.free.push(node);}this.nodes.clear();}
 dispose(){this.reset();this.host.replaceChildren();this.free.length=0;}
}
