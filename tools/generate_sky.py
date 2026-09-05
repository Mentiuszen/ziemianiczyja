"""Original, seamless spherical overcast. No downloads; numpy + Pillow only.
Noise is evaluated on a 3D unit sphere, so the zenith, nadir and seam agree.
The runtime costs one ordinary texture sample, not raymarching or live noise.
"""
from pathlib import Path
import numpy as np
from PIL import Image
root = Path(__file__).resolve().parents[1]
w, h = 2048, 1024
lat = np.linspace(0, np.pi, h, dtype=np.float32)[:, None]
lon = np.linspace(0, 2*np.pi, w, dtype=np.float32)[None, :]
x = np.sin(lat)*np.sin(lon)
y = np.broadcast_to(np.cos(lat), (h,w))
z = np.sin(lat)*np.cos(lon)

def noise(x,y,z):
    ix, iy, iz = np.floor(x), np.floor(y), np.floor(z)
    fx, fy, fz = x-ix, y-iy, z-iz
    fx, fy, fz = [a*a*(3-2*a) for a in (fx,fy,fz)]
    out = np.zeros_like(x)
    for a in (0,1):
        for b in (0,1):
            for c in (0,1):
                v = np.sin((ix+a)*127.1+(iy+b)*311.7+(iz+c)*74.7)*43758.5453
                v -= np.floor(v)
                out += v*(fx if a else 1-fx)*(fy if b else 1-fy)*(fz if c else 1-fz)
    return out
n = np.zeros_like(x)
for freq, weight in ((3.2,.52),(7.1,.27),(15.7,.14),(35,.07)):
    n += noise(x*freq+13.7,y*freq+3.1,z*freq-9.5)*weight
height = np.clip(y,0,1)[...,None]
zenith = np.array([108,128,141], np.float32)
horizon = np.array([178,182,171], np.float32)
base = horizon + (zenith-horizon)*np.power(height,.48)
cloud = np.clip((n-.31)/.42,0,1)
cloud = cloud*cloud*(3-2*cloud)
color = base*.80 + np.array([174,182,181])*cloud[...,None]*.30
sun = np.exp(-((x+.45)**2+(y-.32)**2+(z-.83)**2)/.075)
color += sun[...,None]*np.array([20,18,11])
# Lower hemisphere fades to the same horizon rather than an unrelated brown floor.
color = np.where((y<0)[...,None], np.array([164,172,169])+np.clip(-y,0,1)[...,None]*np.array([-16,-13,-10]), color)
image=np.uint8(np.clip(color,0,255)); image[:,-1]=image[:,0]
for row in (0,-1):image[row]=image[row,0]
path=root/'public/assets/textures/sky-v02.jpg'
Image.fromarray(image).save(path, quality=94, subsampling=0)
print(path, path.stat().st_size)
