export const CROSSHAIR_STYLES=Object.freeze(['dot','cross','cross-dot','none']);
export function crosshairGeometry(style='cross',crossScale=1,hitScale=1){
 const crossRadius=style==='none'?0:style==='dot'?1.6*crossScale:10*crossScale;
 const hitInnerRadius=Math.max(18*hitScale,crossRadius+5);
 return {crossRadius,hitInnerRadius,hitOuterRadius:hitInnerRadius+6*hitScale,hitThickness:2*hitScale};
}
export const crosshairMarkup=()=>'<i class="aim-arm aim-top"></i><i class="aim-arm aim-right"></i><i class="aim-arm aim-bottom"></i><i class="aim-arm aim-left"></i><i class="aim-dot"></i>';
export const hitMarkerMarkup=()=>'<svg viewBox="-64 -64 128 128" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-linecap="square"/></svg>';
export function updateCrosshair(cross,marker,style,crossScale,hitScale){
 if(!CROSSHAIR_STYLES.includes(style))style='cross';
 const signature=`${style}|${crossScale}|${hitScale}`;
 if(cross.dataset.geometry===signature)return crosshairGeometry(style,crossScale,hitScale);
 cross.dataset.geometry=signature;cross.dataset.style=style;cross.style.setProperty('--cross-scale',crossScale);
 const g=crosshairGeometry(style,crossScale,hitScale),a=g.hitInnerRadius/Math.SQRT2,b=g.hitOuterRadius/Math.SQRT2;
 const path=marker.querySelector('path');path.setAttribute('d',[-1,1].flatMap(x=>[-1,1].map(y=>`M${x*a},${y*a} L${x*b},${y*b}`)).join(' '));
 path.setAttribute('stroke-width',g.hitThickness);return g;
}
