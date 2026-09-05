"""Original low-poly prototype assets. No copied game, museum, or marketplace assets.
Regeneration: Python 3 + numpy + Pillow. Runtime requires only the resulting GLBs/PNGs.
Coordinate units: metres, Y up, +Z forward. Meshes have vertex colours and smooth normals.
"""
from pathlib import Path
import math,json,struct,sys
import numpy as np
from PIL import Image,ImageDraw,ImageFilter
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public/assets/models';TEX=ROOT/'public/assets/textures'
OUT.mkdir(parents=True,exist_ok=True);TEX.mkdir(parents=True,exist_ok=True)
RNG=np.random.default_rng(19171120)

def quat(rx=0,ry=0,rz=0):
 cx,sx=math.cos(rx/2),math.sin(rx/2);cy,sy=math.cos(ry/2),math.sin(ry/2);cz,sz=math.cos(rz/2),math.sin(rz/2)
 return [sx*cy*cz+cx*sy*sz,cx*sy*cz-sx*cy*sz,cx*cy*sz+sx*sy*cz,cx*cy*cz-sx*sy*sz]

class Model:
 def __init__(self):self.pos=[];self.norm=[];self.col=[];self.joints=[];self.idx=[]
 def add(self,points,faces,color,joint=0):
  points=np.array(points,dtype=float);faces=np.array(faces,dtype=int);norm=np.zeros_like(points)
  for face in faces:
   n=np.cross(points[face[1]]-points[face[0]],points[face[2]]-points[face[0]]);ln=np.linalg.norm(n)
   if ln>0:n/=ln
   for i in face:norm[i]+=n
  norm/=np.maximum(np.linalg.norm(norm,axis=1,keepdims=True),1e-8)
  start=len(self.pos);self.pos.extend(points.tolist());self.norm.extend(norm.tolist());self.idx.extend((faces+start).flatten().tolist())
  for p in points:
   noise=float(RNG.uniform(.91,1.06));self.col.append([min(1,max(0,c*noise)) for c in color]+[1]);self.joints.append([joint,0,0,0])
 def box(self,c,s,col,j=0):
  x,y,z=c;w,h,d=np.array(s)/2
  pts=[];faces=[]
  corners=[(-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),(-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]
  coords=[(x+a*w,y+b*h,z+c*d) for a,b,c in corners]
  for f in [(0,3,2,1),(4,5,6,7),(0,4,7,3),(1,2,6,5),(3,7,6,2),(0,1,5,4)]:
   k=len(pts);pts += [coords[i] for i in f];faces.extend([[k,k+1,k+2],[k,k+2,k+3]])
  self.add(pts,faces,col,j)
 def ellipsoid(self,c,scale,col,j=0,segments=12,rings=8,hemi=False):
  pts=[];faces=[]
  for r in range(rings+1):
   ph=r/rings*(math.pi/2 if hemi else math.pi)
   for k in range(segments):
    th=k/segments*math.tau;pts.append((c[0]+scale[0]*math.sin(ph)*math.cos(th),c[1]+scale[1]*math.cos(ph),c[2]+scale[2]*math.sin(ph)*math.sin(th)))
  for r in range(rings):
   for k in range(segments):
    a=r*segments+k;b=r*segments+(k+1)%segments;d=(r+1)*segments+k;e=(r+1)*segments+(k+1)%segments
    if r>0:faces.append([a,b,e])
    if hemi or r<rings-1:faces.append([a,e,d])
  # RH glTF: outward CCW. Do not apply Babylon native LH winding here.
  self.add(pts,faces,col,j)
 def cylinder(self,a,b,r0,r1,col,j=0,segments=10):
  a=np.array(a,float);b=np.array(b,float);axis=b-a;axis/=max(np.linalg.norm(axis),1e-10)
  helper=np.array([0,1,0]) if abs(axis[1])<.9 else np.array([1,0,0]);u=np.cross(axis,helper);u/=np.linalg.norm(u);v=np.cross(axis,u)
  pts=[]
  for p,r in [(a,r0),(b,r1)]:
   for k in range(segments):
    t=math.tau*k/segments;pts.append(p+r*(u*math.cos(t)+v*math.sin(t)))
  pts += [a,b];faces=[]
  for k in range(segments):
   n=(k+1)%segments;faces.extend([[k,n,segments+n],[k,segments+n,segments+k],[segments*2,n,k],[segments*2+1,segments+k,segments+n]])
  self.add(pts,faces,col,j)
 def lathe(self,rings,col,j=0,segments=16,center=(0,0,0)):
  pts=[];faces=[]
  for y,rx,rz in rings:
   for k in range(segments):
    t=math.tau*k/segments;pts.append((center[0]+rx*math.cos(t),center[1]+y,center[2]+rz*math.sin(t)))
  for r in range(len(rings)-1):
   for k in range(segments):
    a=r*segments+k;b=r*segments+(k+1)%segments;c=(r+1)*segments+(k+1)%segments;d=(r+1)*segments+k
    faces.extend([[a,c,b],[a,d,c]])
  self.add(pts,faces,col,j)
 def profile(self,x0,x1,yz,col,j=0):
  # Normalize the polygon orientation and extrusion direction. Negative-side tank
  # sponsons used to invert their faces when x0 > x1.
  x0,x1=sorted((x0,x1));yz=list(yz)
  area=sum(yz[i][0]*yz[(i+1)%len(yz)][1]-yz[(i+1)%len(yz)][0]*yz[i][1] for i in range(len(yz)))
  if area<0:yz.reverse()
  pts=[(x,y,z) for x in [x0,x1] for z,y in yz];n=len(yz);faces=[]
  # Ear clipping keeps concave butt stocks from filling their cutouts.
  remaining=list(range(n));tris=[]
  def cross2(a,b,c):return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
  while len(remaining)>3:
   found=False
   for k,i in enumerate(remaining):
    a=remaining[k-1];b=i;c=remaining[(k+1)%len(remaining)]
    if cross2(yz[a],yz[b],yz[c])<=1e-10:continue
    if any(cross2(yz[a],yz[b],yz[v])>=0 and cross2(yz[b],yz[c],yz[v])>=0 and cross2(yz[c],yz[a],yz[v])>=0 for v in remaining if v not in [a,b,c]):continue
    tris.append((a,b,c));remaining.pop(k);found=True;break
   if not found:raise ValueError('Non-simple or degenerate profile')
  tris.append(tuple(remaining))
  for a,b,c in tris:faces.extend([[a,b,c],[a+n,c+n,b+n]])
  for i in range(n):k=(i+1)%n;faces.extend([[i,n+k,k],[i,n+i,n+k]])
  self.add(pts,faces,col,j)

SKIN=[('Root',None,(0,0,0)),('Hips',0,(0,.9,0)),('Spine',1,(0,1.13,0)),('Chest',2,(0,1.39,0)),('Neck',3,(0,1.51,0)),('Head',4,(0,1.62,0)),('UpperArmL',3,(-.24,1.4,0)),('LowerArmL',6,(-.25,1.12,0)),('HandL',7,(-.25,.9,0)),('UpperArmR',3,(.24,1.4,0)),('LowerArmR',9,(.25,1.12,0)),('HandR',10,(.25,.9,0)),('ThighL',1,(-.105,.92,0)),('ShinL',12,(-.105,.50,0)),('FootL',13,(-.105,.1,.045)),('ThighR',1,(.105,.92,0)),('ShinR',15,(.105,.50,0)),('FootR',16,(.105,.1,.045)),('Rifle',3,(0,1.30,.24))]

def export_glb(name,model,skin=None,animations=None):
 binary=bytearray();views=[];access=[]
 def accessor(data,typ,component=5126,target=None,mins=False):
  dtype={5126:'<f4',5123:'<u2',5125:'<u4'}[component];arr=np.array(data,dtype=dtype)
  while len(binary)%4:binary.extend(b'\0')
  offset=len(binary);binary.extend(arr.tobytes());view={'buffer':0,'byteOffset':offset,'byteLength':arr.nbytes}
  if target:view['target']=target
  views.append(view);count=len(data);a={'bufferView':len(views)-1,'componentType':component,'count':count,'type':typ}
  if mins:a.update(min=arr.reshape(count,-1).min(0).tolist(),max=arr.reshape(count,-1).max(0).tolist())
  access.append(a);return len(access)-1
 attributes={'POSITION':accessor(model.pos,'VEC3',target=34962,mins=True),'NORMAL':accessor(model.norm,'VEC3',target=34962),'COLOR_0':accessor(model.col,'VEC4',target=34962)}
 if skin:
  attributes['JOINTS_0']=accessor(model.joints,'VEC4',5123,34962);attributes['WEIGHTS_0']=accessor([[1,0,0,0]]*len(model.pos),'VEC4',target=34962)
 indices=accessor(model.idx,'SCALAR',5125,34963)
 doc={'asset':{'version':'2.0','generator':'Ziemia Niczyja original prototype generator 0.1'},'scene':0,'scenes':[{'nodes':[0]}],'nodes':[{'name':name,'mesh':0}],'meshes':[{'name':name+'Mesh','primitives':[{'attributes':attributes,'indices':indices,'material':0}]}],'materials':[{'name':name+'Material','pbrMetallicRoughness':{'baseColorFactor':[1,1,1,1],'metallicFactor':.04,'roughnessFactor':.86},'doubleSided':True}],'buffers':[{'byteLength':0}],'bufferViews':views,'accessors':access}
 if skin:
  doc['nodes'][0]['skin']=0;doc['scenes'][0]['nodes'].append(1)
  for i,(bn,parent,pos) in enumerate(skin):
   tr=np.array(pos)-np.array(skin[parent][2] if parent is not None else (0,0,0));node={'name':bn,'translation':tr.tolist()}
   children=[k+1 for k,s in enumerate(skin) if s[1]==i]
   if children:node['children']=children
   doc['nodes'].append(node)
  matrices=[]
  for _,_,p in skin:
   mat=np.eye(4);mat[:3,3]=-np.array(p);matrices.append(mat.T.flatten())
  doc['skins']=[{'name':'InfantrySkeleton','inverseBindMatrices':accessor(matrices,'MAT4'),'joints':list(range(1,len(skin)+1)),'skeleton':1}]
  if animations:
   doc['animations']=[]
   for clip,duration,frames in animations:
    samplers=[];channels=[];times=np.linspace(0,duration,len(frames)).tolist();tin=accessor(times,'SCALAR',mins=True)
    for j in range(len(skin)):
     values=[quat(*f.get(j,(0,0,0))) for f in frames]
     samplers.append({'input':tin,'output':accessor(values,'VEC4'),'interpolation':'LINEAR'});channels.append({'sampler':len(samplers)-1,'target':{'node':j+1,'path':'rotation'}})
    doc['animations'].append({'name':clip,'samplers':samplers,'channels':channels})
 doc['buffers'][0]['byteLength']=len(binary);js=json.dumps(doc,separators=(',',':')).encode();js+=b' ' *((-len(js))%4);binary.extend(b'\0'*((-len(binary))%4))
 raw=struct.pack('<III',0x46546c67,2,12+8+len(js)+8+len(binary))+struct.pack('<II',len(js),0x4e4f534a)+js+struct.pack('<II',len(binary),0x004e4942)+binary
 (OUT/(name+'.glb')).write_bytes(raw);print(name,len(model.pos),'vertices',len(raw)//1024,'KiB')

WOOD=(.26,.105,.039);METAL=(.11,.13,.14);DARK=(.045,.05,.049);BRASS=(.48,.35,.13)
def rifle(m,kind='smle',offset=(0,0,0),j=0,scale=1):
 # A separate temporary mesh allows transforming the complete weapon consistently.
 q=Model();g=kind=='gewehr'
 q.profile(-.029,.029,[(-.44,-.14),(-.43,.005),(-.24,.035),(-.10,.07),(.20,.068),(.20,-.01),(-.17,-.012),(-.29,-.075)],WOOD)
 q.box((0,.027,.37),(.057,.067,.65 if g else .71),WOOD)
 q.cylinder((0,.075,-.12),(0,.075,.91 if g else .80),.015,.010,METAL,segments=12)
 q.box((0,.076,-.01),(.057,.028,.22),METAL)
 for z in [.25,.65 if g else .63]:q.box((0,.032,z),(.065,.085,.019),DARK)
 q.box((0,-.047,-.008),(.05,.095,.095 if not g else .05),METAL)
 q.cylinder((.018,.077,-.07),(.073,.039,-.06),.007,.007,METAL,segments=8);q.ellipsoid((.075,.036,-.06),(.013,.013,.013),METAL,segments=8,rings=5)
 q.box((0,.111,.09),(.044,.018,.055),METAL)
 q.box((-.021,.132,.09),(.008,.032,.018),DARK);q.box((.021,.132,.09),(.008,.032,.018),DARK)
 q.box((0,.12,.75 if not g else .86),(.008,.055,.018),DARK)
 q.box((-.02,.113,.755 if not g else .865),(.007,.051,.025),METAL);q.box((.02,.113,.755 if not g else .865),(.007,.051,.025),METAL)
 # Trigger guard, buttplate and sling.
 q.cylinder((-.012,-.027,-.115),(-.012,-.057,-.08),.004,.004,METAL,segments=6)
 q.box((0,-.068,-.10),(.039,.009,.08),METAL);q.box((0,-.064,-.435),(.064,.149,.012),DARK)
 q.cylinder((0,-.105,-.35),(0,-.083,.65),.005,.005,(.25,.20,.105),segments=6)
 pts=np.array(q.pos)*scale+np.array(offset);start=len(m.pos);m.pos+=pts.tolist();m.norm+=q.norm;m.col+=q.col;m.joints += [[j,0,0,0]]*len(q.pos);m.idx += [i+start for i in q.idx]

def make_weapon(name):
 m=Model()
 if name in ['smle','gewehr']:rifle(m,name)
 elif name=='webley':
  m.profile(-.03,.03,[(-.11,-.18),(-.04,-.2),(.005,-.02),(-.045,.035),(-.09,.0)],WOOD)
  m.box((0,.045,.04),(.071,.075,.20),METAL);m.cylinder((0,.065,.23),(0,.065,.46),.024,.018,METAL,segments=12)
  m.cylinder((0,.068,.025),(0,.068,.16),.058,.058,METAL,segments=18)
  for k in range(6):
   t=math.tau*k/6;m.cylinder((math.sin(t)*.037,.068+math.cos(t)*.037,.015),(math.sin(t)*.037,.068+math.cos(t)*.037,.028),.014,.014,BRASS,segments=8)
  m.box((0,.095,.43),(.008,.043,.018),DARK);m.box((0,.105,-.045),(.049,.022,.024),DARK)
  m.box((0,-.045,.04),(.041,.011,.10),DARK);m.box((0,-.021,.085),(.042,.042,.009),DARK)
 elif name=='lewis':
  m.profile(-.034,.034,[(-.43,-.12),(-.43,.005),(-.21,.04),(-.08,.045),(-.15,-.03),(-.32,-.09)],WOOD)
  m.box((0,.065,.02),(.085,.10,.28),METAL);m.cylinder((0,.084,.13),(0,.084,.78),.057,.051,METAL,segments=16)
  m.cylinder((0,.084,.78),(0,.084,.86),.018,.013,DARK,segments=10)
  m.cylinder((0,.134,.07),(0,.18,.07),.16,.16,METAL,segments=24)
  for k in range(12):
   t=k*math.tau/12;m.cylinder((0,.183,.07),(math.cos(t)*.147,.183,.07+math.sin(t)*.147),.004,.004,(.18,.19,.17),segments=5)
  m.box((0,-.025,-.055),(.048,.12,.062),WOOD);m.box((0,.145,.68),(.012,.085,.025),DARK)
  for x in [-.045,.045]:m.cylinder((x,.044,.58),(x*1.5,-.07,.21),.009,.009,DARK,segments=7)
 elif name=='hands':
  skin=(.58,.39,.27);cloth=(.31,.29,.20)
  for side in [-1,1]:
   palm=(side*.05,-.075,.37 if side<0 else -.065)
   elbow=(side*.21,-.30,-.15);back=(side*.36,-.53,-.4)
   m.cylinder(back,elbow,.095,.079,cloth);m.cylinder(elbow,palm,.078,.04,cloth)
   m.ellipsoid(palm,(.055,.035,.073),skin,segments=12,rings=8)
   for f in range(4):m.cylinder((palm[0]+side*.013,palm[1]-.01,palm[2]-.041+f*.021),(palm[0]-side*.04,palm[1]+.017,palm[2]-.041+f*.021),.012,.010,skin,segments=7)
   m.cylinder((palm[0]+side*.032,palm[1]+.017,palm[2]-.035),(palm[0]+side*.005,palm[1]+.043,palm[2]+.002),.014,.012,skin,segments=7)
 export_glb(name,m)

def soldier(faction):
 m=Model();uk=faction=='british';cloth=(.34,.31,.22) if uk else (.29,.34,.32);light=tuple(c*1.15 for c in cloth);skin=(.56,.38,.28);leather=(.18,.105,.059);web=(.44,.39,.25) if uk else (.19,.15,.11);metal=(.22,.24,.19) if uk else (.22,.28,.25)
 m.lathe([(.86,.19,.12),(1.03,.17,.13),(1.20,.195,.13),(1.39,.22,.12),(1.44,.175,.105)],cloth,2)
 m.lathe([(.76,.21,.133),(.92,.195,.13),(1.0,.174,.126)],cloth,1)
 m.lathe([(1.0,.179,.138),(1.048,.18,.138)],web,2)
 m.box((0,1.025,.141),(.043,.043,.012),(.45,.38,.21),2)
 m.cylinder((0,1.43,0),(0,1.56,0),.066,.062,skin,4)
 m.ellipsoid((0,1.625,.014),(.108,.134,.095),skin,5,segments=16,rings=12)
 m.ellipsoid((0,1.617,.105),(.019,.031,.027),skin,5,segments=8,rings=6)
 for x in [-.047,.047]:
  m.box((x,1.650,.098),(.025,.009,.005),(.07,.065,.05),5);m.box((x,1.666,.093),(.036,.009,.006),(.12,.085,.051),5)
  m.ellipsoid((x*2.18,1.62,0),(.015,.029,.017),skin,5,segments=8,rings=6)
 m.box((0,1.565,.099),(.043,.009,.007),(.31,.17,.11),5)
 # Brodie and M16 silhouettes, no WW2 insignia.
 if uk:
  m.lathe([(1.703,.02,.02),(1.712,.21,.22),(1.725,.212,.222),(1.727,.151,.164),(1.765,.127,.14),(1.801,.080,.086),(1.815,.003,.003)],metal,5,segments=24)
 else:
  m.lathe([(1.680,.181,.193),(1.697,.185,.203),(1.72,.154,.173),(1.782,.143,.156),(1.816,.093,.10),(1.833,.003,.003)],metal,5,segments=24,center=(0,0,-.027))
  for x in [-.153,.153]:m.ellipsoid((x,1.762,-.015),(.013,.013,.014),metal,5,segments=8,rings=5)
 for sign,upper,lower,hand,thigh,shin,foot in [(-1,6,7,8,12,13,14),(1,9,10,11,15,16,17)]:
  x=sign*.105;m.cylinder((x,.90,0),(x,.51,0),.101,.071,cloth,thigh,segments=12);m.cylinder((x,.5,0),(x,.16,.02),.077,.056,light,shin,segments=12)
  for yy in np.arange(.18,.46,.033):m.cylinder((x,yy,0),(x,yy+.014,0),.072,.069,tuple(c*.90 for c in light),shin,segments=10)
  m.ellipsoid((x,.078,.068),(.073,.078,.138),leather,foot,segments=12,rings=7);m.box((x,.023,.07),(.14,.028,.24),(.065,.050,.035),foot)
  ax=sign*.245;m.cylinder((ax,1.398,0),(ax,1.13,0),.076,.067,cloth,upper,segments=12);m.cylinder((ax,1.13,0),(ax,.918,0),.067,.045,cloth,lower,segments=12)
  m.ellipsoid((ax,.876,.01),(.045,.069,.04),skin,hand,segments=10,rings=8)
  m.box((sign*.107,1.095,.152),(.091,.108,.053),web,2);m.box((sign*.107,1.153,.162),(.099,.018,.061),web,2)
  m.cylinder((sign*.17,1.42,.11),(sign*.095,1.043,.151),.017,.017,web,2,segments=6)
  m.cylinder((sign*.14,1.37,-.11),(sign*.13,1.02,-.13),.015,.015,web,2,segments=6)
 m.box((0,1.22,-.179),(.27,.29,.115),web,2);m.box((0,1.38,-.181),(.30,.052,.135),web,3)
 m.cylinder((-.18,1.41,-.20),(.18,1.41,-.20),.068,.068,cloth,3,segments=12)
 m.box((-.205,.925,.026),(.088,.13,.11),web,1);m.ellipsoid((.20,.91,-.005),(.055,.098,.074),(.23,.24,.18),1,segments=10,rings=8)
 for yy in [1.18,1.27,1.36]:m.ellipsoid((0,yy,.135),(.009,.009,.004),(.33,.31,.20),2,segments=6,rings=4)
 rifle(m,'smle' if uk else 'gewehr',(0,1.26,.23),18,1)
 anim=[]
 for name,dur in [('idle',2),('walk',1.05),('run',.72),('crouch',1.4),('prone',1.7),('aim',1),('reload',3.3),('fire',.22),('hit',.45),('death',1.2),('vault',1.1),('grenade',.9),('melee',.6)]:
  frames=[]
  for i in range(25):
   t=i/24;s=math.sin(t*math.tau);pose={6:(-1.12,0,-.12),7:(-.37,0,.16),9:(-1.24,0,.17),10:(-.30,0,-.12),3:(.025*s,0,0)}
   if name in ['walk','run','crouch']:
    amp=.52 if name=='walk' else .76 if name=='run' else .30
    pose.update({12:(s*amp,0,0),15:(-s*amp,0,0),13:(max(0,-s)*.8,0,0),16:(max(0,s)*.8,0,0)})
   if name=='crouch':pose.update({1:(-.25,0,0),12:(-.85+s*.2,0,0),15:(-.85-s*.2,0,0),13:(1.1,0,0),16:(1.1,0,0)})
   if name=='prone':pose.update({1:(-math.pi/2,0,0),3:(.16,0,0),12:(s*.10,0,0),15:(-s*.10,0,0)})
   if name=='reload':pose.update({9:(-.74,.18,0),10:(-1.1+math.sin(t*math.tau*2)*.5,0,0),18:(.15,0,-.14)})
   if name=='fire':pose[18]=(-.1*math.sin(t*math.pi),0,0)
   if name=='hit':pose[3]=(.23*math.sin(t*math.pi),0,0)
   if name=='death':pose.update({1:(min(1,t*1.3)*1.42,0,.13*t),12:(-.25*t,0,0),15:(-.1*t,0,0),6:(-.3,0,-.4),9:(-.6,0,.6)})
   if name=='vault':pose.update({12:(-.9*math.sin(t*math.pi),0,0),15:(-.5*math.sin(t*math.pi),0,0),13:(1.1*math.sin(t*math.pi),0,0)})
   if name=='grenade':pose[9]=(-2.7+2*t,0,.2)
   if name=='melee':pose[18]=(0,-.5*math.sin(t*math.pi),0)
   frames.append(pose)
  anim.append((name,dur,frames))
 export_glb(faction,m,SKIN,anim)

def tank(build_only=False):
 m=Model();hull=(.29,.30,.21);dark=(.09,.10,.087);steel=(.16,.17,.14)
 profile=[(-3.8,.38),(-3.05,2.20),(2.15,2.66),(3.80,1.49),(3.43,.28),(-2.8,.13)]
 for side in [-1,1]:
  cx=side*1.3;m.profile(cx-.31,cx+.31,profile,dark)
  inside=[(-3.22,.63),(-2.74,1.95),(2.02,2.33),(3.29,1.38),(3.09,.56),(-2.67,.42)];m.profile(cx-.325,cx+.325,inside,hull)
  # Transverse shoes follow the full rhomboid track path.
  for k in range(len(profile)):
   a=np.array(profile[k]);b=np.array(profile[(k+1)%len(profile)]);L=np.linalg.norm(b-a);n=max(2,int(L/.21))
   for i in range(n):
    z,y=a+(b-a)*(i+.5)/n;m.box((cx,y,z),(.75,.11,.12),steel)
  for z in np.arange(-2.5,2.5,.36):m.ellipsoid((cx+side*.337,.74,z),(.025,.16,.16),steel,segments=8,rings=6)
 m.profile(-1.12,1.12,[(-2.5,.58),(-2.45,2.13),(1.8,2.31),(2.94,1.38),(2.40,.54)],hull)
 m.box((0,2.28,1.08),(1.42,.42,1.12),hull);m.box((0,2.33,1.66),(.57,.075,.025),DARK)
 m.box((0,2.525,.38),(.84,.08,.74),steel)
 for side in [-1,1]:
  m.profile(side*1.12,side*2.0,[(-.80,.70),(-.88,1.74),(.48,1.85),(1.03,1.42),(.86,.78)],hull)
  a=(side*1.76,1.38,.54);b=(side*2.85,1.40,1.28)
  m.cylinder(a,b,.085,.061,steel,segments=12);m.cylinder(b,(b[0]+side*.06,b[1],b[2]+.04),.065,.065,DARK,segments=12)
  m.ellipsoid(a,(.13,.18,.17),steel,segments=12,rings=7)
  m.box((side*1.99,1.25,-.45),(.02,.22,.22),DARK)
  for z in np.arange(-2.5,2.3,.42):
   for y in [1.1,1.8]:m.ellipsoid((side*1.14,y,z),(.024,.025,.024),(.38,.38,.29),segments=6,rings=4)
 m.cylinder((0,1.34,2.82),(0,1.36,3.21),.026,.02,DARK,segments=10)
 # Stowage, exhaust and fascine of wood lengths; no turret.
 m.cylinder((-.48,2.28,-1.63),(-.48,2.7,-1.63),.057,.047,DARK,segments=10)
 for zz,yy in [(-.9,2.48),(-.5,2.52),(-.7,2.81)]:
  for k in range(5):m.cylinder((-1.32,yy+(k%2)*.07,zz+k*.034),(1.32,yy+(k%2)*.07,zz+k*.034),.095,.09,(.28,.21,.125),segments=8)
 if build_only:return m
 export_glb('mark-iv',m)

def textures():
 n=512
 def noise(base,spread=12):
  a=RNG.normal(0,spread,(n,n,1));return np.clip(np.array(base)[None,None,:]+a,0,255).astype(np.uint8)
 im=Image.fromarray(noise([96,83,62],13));d=ImageDraw.Draw(im)
 for _ in range(7500):
  x,y=RNG.integers(0,n,2);r=int(RNG.integers(1,4));v=int(RNG.integers(48,133));d.ellipse((x,y,x+r*2,y+r),fill=(v,min(255,int(v*.92)),int(v*.73)))
 im.save(TEX/'earth.jpg',quality=90)
 im=Image.fromarray(noise([106,101,67],12));d=ImageDraw.Draw(im)
 for _ in range(5500):
  x,y=RNG.integers(0,n,2);ln=int(RNG.integers(3,19));v=int(RNG.integers(70,145));d.line((x,y,x+int(RNG.integers(-5,6)),y-ln),fill=(v,int(v*.96),int(v*.62)),width=1)
 im.save(TEX/'grass.jpg',quality=90)
 im=Image.fromarray(noise([86,68,44],8));d=ImageDraw.Draw(im)
 for yy in range(0,n,64):
  d.rectangle((0,yy,n,yy+3),fill=(35,31,23))
  for _ in range(100):
   y=yy+int(RNG.integers(4,60));x=int(RNG.integers(0,n));v=int(RNG.integers(49,113));d.line((x,y,x+int(RNG.integers(15,190)),y+int(RNG.integers(-2,3))),fill=(v,int(v*.8),int(v*.54)))
  for xx in range(16,n,125):d.ellipse((xx,yy+12,xx+4,yy+16),fill=(30,28,24))
 im.save(TEX/'wood.jpg',quality=92)
 im=Image.fromarray(noise([125,113,83],7));d=ImageDraw.Draw(im)
 for y in range(0,n,3):d.line((0,y,n,y),fill=(113,103,76))
 for x in range(0,n,3):d.line((x,0,x,n),fill=(129,117,87))
 im.save(TEX/'bags.jpg',quality=93)
 im=Image.fromarray(noise([93,91,83],9));d=ImageDraw.Draw(im)
 for _ in range(1200):
  x,y=RNG.integers(0,n,2);v=int(RNG.integers(50,145));d.ellipse((x,y,x+2,y+1),fill=(v,v,int(v*.92)))
 im.save(TEX/'concrete.jpg',quality=91)
 im=Image.new('RGB',(n,n),(93,88,75));d=ImageDraw.Draw(im)
 for y in range(-32,n,36):
  off=36 if (y//36)%2 else 0
  for x in range(-72,n,74):
   jitter=int(RNG.integers(-15,16));c=(104+jitter,65+jitter,47+jitter);d.rectangle((x+off+2,y+2,x+off+70,y+33),fill=c)
 a=np.array(im).astype(float)+RNG.normal(0,6,(n,n,1));Image.fromarray(np.clip(a,0,255).astype(np.uint8)).save(TEX/'brick.jpg',quality=92)
 # Soft particle texture (original alpha), no runtime canvas allocation per particle.
 yy,xx=np.mgrid[-1:1:128j,-1:1:128j];alpha=np.clip(1-np.sqrt(xx*xx+yy*yy),0,1)**1.65;rgba=np.ones((128,128,4),dtype=np.uint8)*255;rgba[:,:,3]=(alpha*240).astype(np.uint8);Image.fromarray(rgba).save(TEX/'smoke.png')

if __name__=='__main__':
 for name in ['smle','gewehr','webley','lewis','hands']:make_weapon(name)
 if '--keep-infantry' not in sys.argv:soldier('british');soldier('german')
 tank();textures()
