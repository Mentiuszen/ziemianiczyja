"""Original offline sky panorama and ground normal map (numpy + Pillow)."""
from pathlib import Path
from PIL import Image, ImageFilter
import numpy as np
ROOT=Path(__file__).resolve().parents[1]/'public/assets/textures'
rng=np.random.default_rng(2041917);w,h=2048,768
cloud=np.zeros((h,w))
for scale,weight in [(16,.55),(32,.25),(64,.13),(128,.07)]:
 a=rng.random((max(2,h//scale),max(2,w//scale)))
 a[:,-1]=a[:,0]  # periodic horizontal boundary for the cylindrical sky
 im=Image.fromarray(np.uint8(a*255)).resize((w,h),Image.Resampling.BICUBIC).filter(ImageFilter.GaussianBlur(3))
 cloud+=np.array(im)/255*weight
v=np.linspace(0,1,h)[:,None,None];top=np.array([102,123,132])[None,None,:];bottom=np.array([183,185,169])[None,None,:]
base=np.broadcast_to(top*(1-v)+bottom*v,(h,w,3)).copy();mask=np.clip((cloud-.37)*3,0,1)*(.75-.45*v[:,:,0]);base=base*(1-mask[:,:,None])+np.array([192,192,179])[None,None,:]*mask[:,:,None]
# Blend the first/last 48 columns into one shared edge to hide the panorama seam.
edge=(base[:,0,:]+base[:,-1,:])*.5
for x in range(48):
 t=x/47
 base[:,x,:]=edge*(1-t)+base[:,x,:]*t
 base[:,-1-x,:]=edge*(1-t)+base[:,-1-x,:]*t
Image.fromarray(np.uint8(np.clip(base,0,255))).save(ROOT/'sky.jpg',quality=90)
a=np.asarray(Image.open(ROOT/'earth.jpg').convert('L'),dtype=float)/255;dy,dx=np.gradient(a);n=np.dstack([-dx*.9,-dy*.9,np.ones_like(a)]);n/=np.linalg.norm(n,axis=2,keepdims=True)
Image.fromarray(np.uint8((n*.5+.5)*255)).save(ROOT/'earth-normal.png')
