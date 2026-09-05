import {clamp} from '../core/math.js';
/** Babylon glTF animation sampling is typically 60 FPS; it isn't our simulation rate. */
export function sampleClipFrame({from=0,to=0,fps=60},elapsed,{loop=true,speed=1,duration}={}){
 const frames=to-from;if(frames<=0)return from;
 const seconds=duration??frames/Math.max(1,fps),phase=Math.max(0,elapsed)*speed/Math.max(.00001,seconds);
 return from+frames*(loop?phase%1:clamp(phase,0,1));
}
