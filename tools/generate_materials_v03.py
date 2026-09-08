"""Deterministic, original periodic material maps and alpha-tested grass, no downloads."""
from pathlib import Path
import math
import numpy as np
from PIL import Image,ImageDraw,ImageFilter
from scipy.ndimage import gaussian_filter
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'public/assets/textures';N=1024
r=np.random.default_rng(191703);yy,xx=np.mgrid[:N,:N];u=xx/N;v=yy/N

def noise(size):
 a=r.normal(0,1,(N,N));a=gaussian_filter(a,size,mode='wrap');return a/max(a.std(),1e-9)
coarse=noise(44);medium=noise(9);fine=noise(1.3);micro=r.normal(0,1,(N,N))

def save(name,rgb,h,rough=.9,strength=1):
 rgb=np.uint8(np.clip(rgb,0,255));Image.fromarray(rgb).save(OUT/(name+'.jpg'),quality=94,subsampling=0)
 dx=(np.roll(h,-1,1)-np.roll(h,1,1))*strength;dy=(np.roll(h,-1,0)-np.roll(h,1,0))*strength
 a=np.stack([-dx,-dy,np.ones_like(dx)],-1);a/=np.linalg.norm(a,axis=2,keepdims=True);Image.fromarray(np.uint8((a*.5+.5)*255)).save(OUT/(name+'-normal.png'),optimize=True)
 orm=np.stack([np.clip(244+fine*4,210,255),np.clip(rough*255+medium*9,0,255),np.zeros_like(h)],-1);Image.fromarray(np.uint8(orm)).save(OUT/(name+'-orm.png'),optimize=True)
 print(name,flush=True)

# Broad wet earth, small gravel and compressed mud; brown, not bright green turf.
h=coarse*.30+medium*.16+fine*.12+micro*.03
peb=np.clip((fine-1.1)*.8,0,1);wet=np.clip(-coarse*.15,0,.3)
rgb=np.array([101,90,69])+coarse[...,None]*7+medium[...,None]*4+fine[...,None]*5+peb[...,None]*17-wet[...,None]*24
save('earth',rgb,h,.91,2.2)
# Weathered longitudinal timber, long wavy grain, periodic knot distortion.
long=gaussian_filter(r.normal(0,1,(N,N)),(1.4,55),mode='wrap');long/=long.std()
short=gaussian_filter(r.normal(0,1,(N,N)),(.55,10),mode='wrap');short/=short.std()
gr=long*.65+short*.25+fine*.1
board=np.floor(yy/256);joint=(yy%256<3);woodh=gr*.06+micro*.012-joint*.12
rgb=np.array([108,99,80])+gr[...,None]*9+coarse[...,None]*4+fine[...,None]*1.5-board[...,None]%2*4-joint[...,None]*32
save('wood',rgb,woodh,.94,1.0)
# Chipped lime-mortar brick coursing with individually varied block values.
row=yy//85;bx=(xx+(row%2)*85)%N;col=bx//171;joint=((yy%85)<7)|((bx%171)<7)
brickvar=np.sin(row*9.12+col*13.7)*12;chips=np.clip(fine-1.35,0,1)
rgb=np.array([112,78,52])+brickvar[...,None]+medium[...,None]*4+fine[...,None]*3
rgb=np.where(joint[...,None],np.array([123,118,99])+fine[...,None]*5,rgb);h=np.where(joint,-.32,.1)+fine*.04-chips*.11
save('brick',rgb,h,.94,2.1)
# Burlap has aligned weaving rather than a flat brown block.
weave=(np.sin(xx*math.pi/2)+np.cos(yy*math.pi/2))
rgb=np.array([138,125,93])+coarse[...,None]*6+medium[...,None]*2+weave[...,None]*3+micro[...,None]*2
save('bags',rgb,coarse*.09+weave*.10+fine*.04,.97,.6)
rgb=np.array([121,121,108])+coarse[...,None]*10+medium[...,None]*7+fine[...,None]*7
save('concrete',rgb,medium*.12+fine*.11,.95,1.1)
# Alpha texture: individual dry grass blades, no rectangular opaque cards.
im=Image.new('RGBA',(256,256));d=ImageDraw.Draw(im)
for i in range(58):
 x=int(r.uniform(50,205));tip=int(r.uniform(5,190));lean=int(r.uniform(-60,60));w=int(r.integers(2,5));color=(int(r.integers(92,160)),int(r.integers(89,143)),int(r.integers(53,91)),255)
 d.polygon([(x-w,255),(x+w,255),(x+lean+1,tip+20),(x+lean,tip)],fill=color)
im.save(OUT/'grass-tuft.png',optimize=True)
# Soft granular blast puff / scorch footprint, transparent at borders.
for name,scorch in [('blast-smoke',False),('scorch',True)]:
 n=256;y,x=np.mgrid[:n,:n];dx=(x-128)/128;dy=(y-128)/128;rad=np.sqrt(dx*dx+dy*dy)
 a=np.clip(1-rad,0,1)**(1.5 if scorch else 1.1)
 grain=np.asarray(Image.fromarray(np.uint8(r.uniform(0,255,(32,32)))).resize((n,n),Image.Resampling.BICUBIC))/255
 a*=np.clip(.5+grain,0,1);a=np.uint8(a*(215 if scorch else 200));rgb=np.full((n,n,3),40 if scorch else 235,np.uint8)
 Image.fromarray(np.dstack([rgb,a])).save(OUT/(name+'.png'))
