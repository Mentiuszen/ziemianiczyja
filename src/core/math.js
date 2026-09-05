/** Small simulation-only math. Rendering objects never enter the save format. */
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const lerp=(a,b,t)=>a+(b-a)*t;
export const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);};
export const v3=(x=0,y=0,z=0)=>({x,y,z});
export const add=(a,b)=>v3(a.x+b.x,a.y+b.y,a.z+b.z);
export const sub=(a,b)=>v3(a.x-b.x,a.y-b.y,a.z-b.z);
export const mul=(a,s)=>v3(a.x*s,a.y*s,a.z*s);
export const dot=(a,b)=>a.x*b.x+a.y*b.y+a.z*b.z;
export const len=a=>Math.hypot(a.x,a.y,a.z);
export const norm=a=>mul(a,1/(len(a)||1));
export const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
export const flatDist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export const angleDiff=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
export const approachAngle=(a,b,s)=>a+clamp(angleDiff(b,a),-s,s);
export const direction=(yaw,pitch=0)=>v3(Math.sin(yaw)*Math.cos(pitch),-Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch));
export function rng(seed){let s=seed>>>0;const random=()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/4294967296;};random.state=()=>s>>>0;random.restore=n=>{s=n>>>0;};return random;}
export function segmentDistance(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],t=clamp(((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1),0,1);return Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t);}
/** Ray direction must be unit length. Returns distance or null. */
export function rayBox(o,d,b,max=Infinity){let lo=0,hi=max;for(const k of ['x','y','z']){if(Math.abs(d[k])<1e-9){if(o[k]<b.min[k]||o[k]>b.max[k])return null;}else{let t1=(b.min[k]-o[k])/d[k],t2=(b.max[k]-o[k])/d[k];if(t1>t2)[t1,t2]=[t2,t1];lo=Math.max(lo,t1);hi=Math.min(hi,t2);if(lo>hi)return null;}}return lo<=max?lo:null;}
export function raySphere(o,d,c,r,max=Infinity){const a=sub(o,c),b=dot(a,d),q=dot(a,a)-r*r,disc=b*b-q;if(disc<0)return null;const t=-b-Math.sqrt(disc);if(t<0)return q<=0?0:null;return t<=max?t:null;}
export function deepCopy(o){return JSON.parse(JSON.stringify(o));}
