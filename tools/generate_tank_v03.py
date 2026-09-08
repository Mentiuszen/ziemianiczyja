"""Repair/export the existing Mark IV with the shared painted-metal/wood atlas."""
import numpy as np
from generate_assets import tank
from generate_characters import Infantry
from generate_weapons_v03 import export
q=tank(build_only=True);m=Infantry(0);points=np.asarray(q.pos);normals=np.asarray(q.norm);colors=np.asarray(q.col)
for face in np.asarray(q.idx).reshape(-1,3):
 c=colors[face].mean(0);n=normals[face].mean(0);axis=np.argmax(abs(n));axes=[i for i in range(3) if i!=axis]
 tile=10 if c[0]>c[1]*1.15 and c[1]>c[2]*1.2 else 5 if c[0]>.24 else 8
 start=len(m.pos)
 for index in face:
  p=points[index];m.pos.append(p.tolist());m.norm.append(normals[index].tolist());m.col.append([1,.99,.88,1] if tile==5 else [.82,.85,.82,1] if tile==8 else [1,1,1,1]);m.uv.append(((tile%4+.08+((p[axes[0]]+5)/12)*.84)/4,(tile//4+.08+((p[axes[1]]+5)/12)*.84)/4))
 m.idx.extend([start,start+1,start+2])
# Hinged access hatches, exhaust cap and towing eyes remain in a single draw call.
for side in [-1,1]:
 m.softbox(5,(side*1.15,1.70,-1.5),(.025,.42,.48));m.softbox(8,(side*1.17,1.68,-1.5),(.023,.055,.14))
 for z in [-2.95,2.75]:m.tube(8,(side*.75,.66,z),(side*.75,.85,z),.05,.05,seg=10)
 m.softbox(12,(side*1.641,1.08,-2.2),(.008,.035,.33))
m.tube(8,(-.48,2.70,-1.63),(-.48,2.72,-1.63),.062,.062,seg=16)
export('mark-iv',m)
