import {getHudScale} from './settings.js';
const rectangle=(left,top,width,height)=>({left,top,width,height,right:left+width,bottom:top+height});
export function rectanglesOverlap(a,b,gap=0){return a.left<b.right+gap&&a.right>b.left-gap&&a.top<b.bottom+gap&&a.bottom>b.top-gap;}
/** Pure packing model, shared with tests. Sizes already include each module's scale. */
export function arrangeHud(viewport,sizes,centerRadius=44){
 const {left=0,top=0,width,height}=viewport,pad=Math.min(24,Math.max(10,width*.015)),gap=12;
 const minX=left+pad,maxX=left+width-pad,minY=top+pad,maxY=top+height-pad;
 const rects={},occupied=[rectangle(left+width/2-centerRadius,top+height/2-centerRadius,centerRadius*2,centerRadius*2)],overflow=[];
 const add=(id,x,y,override)=>{const s=override||sizes[id];if(!s)return;const r=rectangle(x,y,s.width,s.height);rects[id]=r;occupied.push(r);};
 const size=id=>sizes[id]||{width:0,height:0};
 const stance=size('stance'),health=size('health'),stamina=size('stamina'),ammo=size('ammo'),count=size('grenadeCount'),reload=size('reload');
 let healthWidth=stance.width+(stance.width?gap:0)+health.width;
 let healthHeight=Math.max(stance.height,health.height)+(stamina.height?gap+stamina.height:0);
 let ammoWidth=ammo.width+(count.width?gap:0)+count.width;
 let ammoHeight=Math.max(ammo.height,count.height)+(reload.height?gap+reload.height:0);
 const healthY=maxY-healthHeight,ammoY=healthWidth+ammoWidth+gap>maxX-minX?healthY-gap-ammoHeight:maxY-ammoHeight;
 const rowHeight=Math.max(stance.height,health.height);
 add('stance',minX,healthY+(rowHeight-stance.height)/2);
 add('health',minX+stance.width+(stance.width?gap:0),healthY+(rowHeight-health.height)/2);
 // The bar follows the whole measured row; its own scale controls thickness, not endpoints.
 if(sizes.stamina)add('stamina',minX,maxY-stamina.height,{width:healthWidth,height:stamina.height});
 // Equipment can wrap below the ammo module when an individual row cannot fit.
 if(ammoWidth>maxX-minX){
  ammoWidth=Math.max(ammo.width,count.width);ammoHeight=ammo.height+count.height+reload.height+2*gap;
  const y=healthY-gap-ammoHeight;
  add('ammo',maxX-ammo.width,y);add('grenadeCount',maxX-count.width,y+ammo.height+gap);add('reload',maxX-reload.width,y+ammo.height+count.height+2*gap);
 }else{add('ammo',maxX-ammoWidth,ammoY);add('grenadeCount',maxX-count.width,ammoY+Math.max(0,(ammo.height-count.height)/2));add('reload',maxX-reload.width,ammoY+Math.max(ammo.height,count.height)+gap);}
 function place(id,preferredX,preferredY){
  const s=sizes[id];if(!s)return null;
  const xs=[preferredX,minX,maxX-s.width,left+(width-s.width)/2];
  const ys=[preferredY,minY,maxY-s.height];
  for(const r of occupied){xs.push(r.right+gap,r.left-gap-s.width);ys.push(r.bottom+gap,r.top-gap-s.height);}
  const candidates=[];
  for(const x of xs)for(const y of ys){
   if(x<minX-.1||x+s.width>maxX+.1||y<minY-.1||y+s.height>maxY+.1)continue;
   const r=rectangle(x,y,s.width,s.height);if(occupied.some(o=>rectanglesOverlap(r,o,gap)))continue;
   candidates.push({r,cost:Math.abs(x-preferredX)+Math.abs(y-preferredY)*1.8});
  }
  if(!candidates.length){overflow.push(id);return null;}
  candidates.sort((a,b)=>a.cost-b.cost);const r=candidates[0].r;rects[id]=r;occupied.push(r);return r;
 }
 const lowTop=Math.min(...['health','stance','ammo','grenadeCount','reload'].filter(id=>rects[id]).map(id=>rects[id].top));
 place('fps',minX,minY);
 let noticeY=minY;
 for(const id of ['notification','toast']){const n=place(id,left+(width-size(id).width)/2,noticeY);if(n)noticeY=n.bottom+gap;}
 let messageBottom=lowTop-gap;
 for(const id of ['critical','subtitle','interaction']){const r=place(id,left+(width-size(id).width)/2,messageBottom-size(id).height);if(r)messageBottom=r.top-gap;}
 const map=place('minimap',maxX-size('minimap').width,minY);
 place('objective',maxX-size('objective').width,map?map.bottom+gap:minY);
 // No hidden overlap claim on physically impossible small viewports.
 const invalid=Object.values(rects).some(r=>r.left<minX-.1||r.right>maxX+.1||r.top<minY-.1||r.bottom>maxY+.1);
 return{viewport,rects,reserved:Object.values(rects),center:occupied[0],compact:overflow.length>0||invalid,overflow};
}
const baseWidths={stance:42,stamina:1,reload:220,fps:180};
const intrinsicModules=new Set(['health','ammo','grenadeCount']);
/** One geometry cache; a moving actor is not an invalidation reason. */
export class HudLayout {
 constructor(root,getSettings){
  this.root=root;this.getSettings=getSettings;this.slots=new Map();this.visible=new Map();this.dirty=true;this.reflows=0;
  this.state={viewport:{left:0,top:0,width:0,height:0},rects:{},reserved:[],compact:false,overflow:[]};
  for(const n of root.querySelectorAll('[data-hud-module]')){this.slots.set(n.dataset.hudModule,n);this.visible.set(n.dataset.hudModule,true);}
  this.resize=()=>this.invalidate('resize');globalThis.window?.addEventListener('resize',this.resize);
  if(typeof ResizeObserver!=='undefined'){this.observer=new ResizeObserver(()=>this.invalidate('content'));for(const n of this.slots.values())this.observer.observe(n.firstElementChild);}
  this.fontReady=()=>this.invalidate('font');document.fonts?.addEventListener?.('loadingdone',this.fontReady);
  this.onLoad=()=>this.invalidate('asset');root.addEventListener('load',this.onLoad,true);
 }
 invalidate(){this.dirty=true;}
 setVisible(id,visible){visible=!!visible;if(this.visible.get(id)!==visible){this.visible.set(id,visible);this.dirty=true;}}
 update(){
  if(!this.dirty||this.root.hidden)return this.state;
  this.dirty=false;this.reflows++;const settings=this.getSettings(),vp=this.root.getBoundingClientRect();
  const viewport={left:vp.left,top:vp.top,width:vp.width,height:vp.height};
  const available=Math.max(100,viewport.width-48),sizes={},scales={};
  // Write constraints together, then measure contents together, then position wrappers.
  for(const [id,slot] of this.slots){
   const visible=this.visible.get(id);slot.hidden=!visible;if(!visible)continue;
   const inner=slot.firstElementChild,scale=getHudScale(settings,id==='toast'?'notification':id);scales[id]=scale;
   let width=baseWidths[id];
   if(id==='minimap')width=viewport.height<570?135:viewport.height<770?178:Math.min(245,Math.max(178,viewport.height*.2));
   if(id==='objective')width=Math.max(200,Math.min(245,viewport.height*.2));
   if(['subtitle','critical','interaction','notification','toast'].includes(id))width=Math.min(id==='subtitle'?760:id==='interaction'?540:440,available/scale);
   width=Math.min(width||220,available/scale);
   const textModule=['subtitle','critical','interaction','notification','toast'].includes(id);
   if(id!=='stamina')inner.style.width=textModule||intrinsicModules.has(id)?'max-content':width+'px';
   inner.style.maxWidth=textModule?width+'px':intrinsicModules.has(id)?available/scale+'px':'none';inner.style.transform=`scale(${scale})`;inner.style.transformOrigin='top left';
   if(id==='minimap'){inner.style.setProperty('--map-side',width+'px');this.minimapSize=width*scale;}
  }
  for(const [id,slot] of this.slots){if(slot.hidden)continue;const inner=slot.firstElementChild;sizes[id]={width:inner.offsetWidth*scales[id],height:inner.offsetHeight*scales[id]};}
  const centerRadius=Math.max(38,18*getHudScale(settings,'hitMarker')+6*getHudScale(settings,'hitMarker')+8);
  this.state=arrangeHud(viewport,sizes,centerRadius);this.state.reserved.push(this.state.center);
  const stamina=this.state.rects.stamina;
  if(stamina)this.slots.get('stamina').firstElementChild.style.width=(stamina.width/scales.stamina)+'px';
  const parents=new Map();
  for(const [id,slot] of this.slots){const r=this.state.rects[id];slot.hidden=!r;if(!r)continue;const parent=slot.parentElement;
   if(parent!==this.root){const old=parents.get(parent);parents.set(parent,old?{left:Math.min(old.left,r.left),top:Math.min(old.top,r.top),right:Math.max(old.right,r.right),bottom:Math.max(old.bottom,r.bottom)}:{...r});}
  }
  for(const [p,r] of parents){p.style.left=(r.left-viewport.left)+'px';p.style.top=(r.top-viewport.top)+'px';p.style.width=(r.right-r.left)+'px';p.style.height=(r.bottom-r.top)+'px';}
  for(const [id,slot] of this.slots){const r=this.state.rects[id];if(!r)continue;const parent=parents.get(slot.parentElement)||viewport;
   slot.style.left=(r.left-parent.left)+'px';slot.style.top=(r.top-parent.top)+'px';slot.style.width=r.width+'px';slot.style.height=r.height+'px';
  }
  this.root.dataset.compact=String(this.state.compact);return this.state;
 }
 snapshot(){return this.state;}
 dispose(){globalThis.window?.removeEventListener('resize',this.resize);this.observer?.disconnect();document.fonts?.removeEventListener?.('loadingdone',this.fontReady);this.root.removeEventListener('load',this.onLoad,true);}
}
