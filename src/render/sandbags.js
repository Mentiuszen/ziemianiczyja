/** Flattened sewn cushions, staggered courses, and a closed compressed fill.
 * Collider and opaque silhouette agree: seams do not expose false sight lines.
 */
export function buildSandbags(g,b){
 const rows=Math.max(1,Math.round(b.h/.29)),height=b.h/rows,cols=Math.max(1,Math.ceil(b.w/.86)),width=b.w/cols;
 g.box(b.x,b.y,b.z,b.w-.014,b.h-.014,b.d*.70,0,[.88,.88,.83,1]);
 for(let row=0;row<rows;row++){
  const shift=row%2?width*.5:0;
  for(let col=-1;col<cols;col++){
   const left=Math.max(b.min.x,b.min.x+col*width+shift),right=Math.min(b.max.x,b.min.x+(col+1)*width+shift);
   if(right-left<.015)continue;
   g.cushion((left+right)/2,b.min.y+(row+.5)*height,b.z,right-left+.012,height*1.06,b.d*1.015,0,[.94+(col%3)*.015,.94,.90,1]);
  }
 }
 return g;
}
