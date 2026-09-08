"""Original v0.2 infantry; 3 explicit LODs, one atlas/material, weighted 19-bone skin.
Python 3 + numpy + Pillow. No downloaded photographs, meshes or training assets.
Metres, Y up, +Z forward. See docs/CHARACTER_ART.md for references and limits.
"""
from pathlib import Path
import io, json, math, struct
import numpy as np
from PIL import Image, ImageFilter
from generate_assets import Model, SKIN, rifle, quat
ROOT=Path(__file__).resolve().parents[1]; OUT=ROOT/'public/assets/models'; TEX=ROOT/'public/assets/textures'
TAU=math.tau
# 4x4 atlas: each original material has its own neutral, repeat-free UV island.
PALETTE=[(111,101,69),(88,98,86),(153,139,99),(64,47,33),(42,39,33),(65,76,64),(116,111,96),(167,120,89),(45,47,45),(159,129,68),(83,53,28),(40,34,30),(219,210,185),(58,69,52),(92,82,54),(160,143,109)]

def make_atlas():
 rng=np.random.default_rng(19172026); n=256
 yy,xx=np.mgrid[:n,:n]; albedo=np.zeros((1024,1024,3),np.uint8); normal=np.zeros_like(albedo); orm=np.zeros_like(albedo)
 for i,base in enumerate(PALETTE):
  cloth=i in [0,1,2,6,13,14,15]; leather=i in [3,4,11]; skin=i==7
  coarse=np.asarray(Image.fromarray(np.uint8(rng.uniform(25,225,(16,16)))).resize((n,n),Image.Resampling.BICUBIC),float)/255-.5
  micro=rng.normal(0,1,(n,n)); weave=(np.sin(xx*math.pi/2)+np.cos(yy*math.pi/2))*(1.7 if cloth else .3)
  grain=coarse*14+micro*(2.1 if cloth else 1.1)+weave
  if leather:grain+=np.sin(xx*.37+np.sin(yy*.23))*1.7
  if i==10:grain+=np.sin(xx*.19+np.sin(yy*.024)*2)*9+np.sin(xx*.73+np.sin(yy*.037))*3
  # Dirt collects toward panel bottoms and seams; not a global colour wash.
  dirt=np.clip((yy/n-.70)*2,0,.35)*np.clip(coarse+.6,0,1)*(14 if cloth else 5)
  rgb=np.clip(np.array(base)[None,None,:]+grain[...,None]-dirt[...,None],0,255)
  if skin:rgb[:,:,0]+=np.clip(coarse*5,-3,3)
  height=micro*(.18 if skin else .45)+weave*.55+coarse*2
  dx=np.roll(height,-1,1)-np.roll(height,1,1);dy=np.roll(height,-1,0)-np.roll(height,1,0)
  nm=np.stack([-dx*.035,-dy*.035,np.ones_like(dx)],-1);nm/=np.linalg.norm(nm,axis=2,keepdims=True)
  rough=.94 if cloth else .76 if leather else .75 if skin else .64 if i==5 else .48
  tileorm=np.stack([np.clip(247+coarse*10,0,255),np.clip(rough*255+micro*3,0,255),np.ones_like(dx)*(180 if i in [8,9] else 30 if i==5 else 0)],-1)
  y,x=(i//4)*n,(i%4)*n;albedo[y:y+n,x:x+n]=rgb;normal[y:y+n,x:x+n]=np.uint8((nm*.5+.5)*255);orm[y:y+n,x:x+n]=tileorm
 result=[]
 for name,data in [('infantry-color',albedo),('infantry-normal',normal),('infantry-orm',orm)]:
  path=TEX/(name+'.png');Image.fromarray(data).save(path,optimize=True);result.append(path.read_bytes());shared=OUT/'textures';shared.mkdir(exist_ok=True);(shared/(name+'.png')).write_bytes(path.read_bytes())
 return result

class Infantry(Model):
 def __init__(self,lod):
  super().__init__();self.uv=[];self.weights=[];self.tile=0;self.lod=lod;self.tint=(1,1,1);self.seg=[16,10,7][lod]
 def add(self,points,faces,color=(1,1,1),joint=0,uv=None):
  points=np.asarray(points,float);faces=np.asarray(faces,int);start=len(self.pos);n=len(points)
  # Smooth normals, with no random faceting or point-to-point colour noise.
  norms=np.zeros_like(points)
  for face in faces:
   v=np.cross(points[face[1]]-points[face[0]],points[face[2]]-points[face[0]])
   for k in face:norms[k]+=v
  norms/=np.maximum(np.linalg.norm(norms,axis=1,keepdims=True),1e-9)
  self.pos.extend(points.tolist());self.norm.extend(norms.tolist());self.idx.extend((faces+start).ravel().tolist())
  self.joints.extend([[joint,0,0,0]]*n);self.weights.extend([[1,0,0,0]]*n)
  if uv is None:
   spans=np.ptp(points,axis=0);axes=np.argsort(spans)[-2:];a,b=axes
   u=(points[:,a]-points[:,a].min())/max(spans[a],1e-6);v=(points[:,b]-points[:,b].min())/max(spans[b],1e-6);uv=np.stack([u,v],1)
  uv=np.asarray(uv);x=self.tile%4;y=self.tile//4
  # glTF texture origin is top-left. Guard pixels prevent mip bleeding.
  self.uv.extend(np.stack([(x+(uv[:,0]*.88+.06))/4,(y+(1-uv[:,1])*.88+.06)/4],1).tolist())
  tint=np.asarray(self.tint)*np.asarray(getattr(self,'skinTint',(1,1,1)) if self.tile==7 else (1,1,1))
  for p,normal in zip(points,norms):
   ao=.88+.12*max(0,normal[1]);self.col.append([min(1,c*t*ao) for c,t in zip(color,tint)]+[1])
 def part(self,tile,fn,*args,**kwargs):
  self.tile=tile;fn(*args,**kwargs)
 def ell(self,tile,c,s,j=0,seg=None,rings=None):
  self.tile=tile;self.ellipsoid(c,s,(1,1,1),j,segments=seg or self.seg,rings=rings or [9,6,4][self.lod])
 def tube(self,tile,a,b,r0,r1=None,j=0,seg=None):
  self.tile=tile;self.cylinder(a,b,r0,r0 if r1 is None else r1,(1,1,1),j,segments=seg or self.seg)
 def softbox(self,tile,c,s,j=0,bevel=.12):
  # Bevelled rectangular extrusion: flat readable panels, rounded silhouette.
  self.tile=tile
  if self.lod>0:
   self.box(c,s,(1,1,1),j);return
  x,y,z=c;w,h,d=np.asarray(s)/2;b=min(w,h,d)*bevel*2
  pts=[]
  ring=[(-w+b,-h), (w-b,-h),(w,-h+b),(w,h-b),(w-b,h),(-w+b,h),(-w,h-b),(-w,-h+b)]
  for zz,shrink in [(-d,.65),(-d+b,1),(d-b,1),(d,.65)]:
   for xx,yy in ring:pts.append((x+xx*shrink,y+yy*shrink,z+zz))
  faces=[]
  for row in range(3):
   for k in range(8):a=row*8+k;bb=row*8+(k+1)%8;faces.extend([(a,bb,bb+8),(a,bb+8,a+8)])
  for k in range(1,7):faces.extend([(0,k+1,k),(24,24+k,24+k+1)])
  self.add(pts,faces,joint=j)
 def rings(self,tile,levels,center=(0,0,0),j=0,segments=None,weights=None):
  self.tile=tile;seg=segments or self.seg;pts=[];uv=[]
  for r,(y,rx,rz) in enumerate(levels):
   for k in range(seg+1):
    a=TAU*k/seg;pts.append((center[0]+rx*math.cos(a),center[1]+y,center[2]+rz*math.sin(a)));uv.append((k/seg,r/max(1,len(levels)-1)))
  faces=[]
  for r in range(len(levels)-1):
   for k in range(seg):a=r*(seg+1)+k;d=a+seg+1;faces.extend([(a,d+1,a+1),(a,d,d+1)])
  start=len(self.pos);self.add(pts,faces,joint=j,uv=uv)
  if weights:
   for n,p in enumerate(pts):
    ji,we=weights(p);self.joints[start+n]=ji;self.weights[start+n]=we
 def ribbon(self,tile,points,width,j=0):
  self.tile=tile;pts=[]
  tangent=np.asarray(points[-1])-np.asarray(points[0]);offset=np.array([0,0,width/2]) if abs(tangent[0])>abs(tangent[1])+abs(tangent[2]) else np.array([width/2,0,0])
  for p in points:pts.extend([np.asarray(p)-offset,np.asarray(p)+offset])
  faces=[]
  for k in range(len(points)-1):a=k*2;faces.extend([(a,a+1,a+3),(a,a+3,a+2)])
  count=len(pts);faces+= [(a+count,c+count,b+count) for a,b,c in faces[:]]
  self.add(pts+pts,faces,joint=j)

def blend(y,a,b,lo,hi):
 t=float(np.clip((y-lo)/(hi-lo),0,1));return [a,b,0,0],[1-t,t,0,0]

def body(faction,lod,variant=0):
 m=Infantry(lod);m.variant=variant;m.skinTint=[(1,1,1),(.92,.82,.72),(1.02,.95,.88)][variant];m.tint=[(1,1,1),(.91,.95,.9),(1.04,1.01,.94)][variant];uk=faction=='british';cloth=0 if uk else 1;gear=2 if uk else 3;boot=3 if uk else 4;metal=5
 torso=[(.78,.155,.104),(.82,.179,.108),(.93,.179,.105),(1.015,.150,.100),(1.075,.151,.099),(1.14,.169,.102),(1.24,.189,.12),(1.32,.211,.122),(1.385,.207,.105),(1.435,.158,.075),(1.45,.081,.065)]
 if lod:torso=torso[::2]
 def torso_weights(p):return blend(p[1],1,2,.94,1.12) if p[1]<1.14 else blend(p[1],2,3,1.14,1.32)
 m.rings(cloth,torso,j=2,weights=torso_weights)
 # Collar has a neck opening instead of a solid rectangular block.
 m.rings(cloth if uk else 13,[(1.43,.079,.068),(1.48,.075,.065),(1.515,.064,.059)],j=4)
 m.tube(7,(0,1.485,0),(0,1.57,0),.054,.055,4,seg=10)
 # Separate sewn fall-collar wings and epaulettes.
 for sign in [-1,1]:
  m.tile=cloth if uk else 13
  collar=[(sign*.014,1.507,.063),(sign*.068,1.493,.055),(sign*.092,1.45,.085),(sign*.031,1.463,.105)]
  m.add(collar+collar,[(0,1,2),(0,2,3),(4,6,5),(4,7,6)],joint=4)
  m.ell(cloth,(sign*.194,1.36,0),(.073,.082,.094),3)
  m.softbox(cloth,(sign*.157,1.431,0),(.104,.016,.066),3)
  if lod<2:m.ell(9 if uk else 8,(sign*.119,1.444,.017),(.008,.004,.008),3,seg=6,rings=3)
 # Anatomical face: forehead, temples, cheekbones, jaw and chin.
 head=[(1.535,.048,.051),(1.552,.065,.066),(1.58,.075,.075),(1.615,.086,.081),(1.65,.086,.080),(1.69,.083,.083),(1.729,.066,.071),(1.746,.038,.045),(1.753,.002,.002)]
 if lod==2:head=head[::2]
 head=[(y,rx*(1+variant*.035),rz*(1-variant*.018)) for y,rx,rz in head]
 m.rings(7,head,center=(0,0,.013),j=5,segments=[22,12,8][lod])
 if lod<2:
  # Brow ridges, nose bridge and nostrils; eye whites deliberately small and muted.
  m.ell(7,(0,1.62,.099),(.015,.04,.020),5,seg=10,rings=6)
  m.ell(7,(0,1.595,.111),(.023,.013,.017),5,seg=10,rings=5)
  for sign in [-1,1]:
   m.ell(7,(sign*.081,1.62,.007),(.014,.03,.02),5,seg=10,rings=6)
   m.ell(12,(sign*.036,1.638,.091),(.017,.0055,.0035),5,seg=8,rings=4)
   m.ell(11,(sign*.036,1.638,.094),(.004,.004,.0025),5,seg=6,rings=3)
   m.tube(11,(sign*.023,1.65,.091),(sign*.054,1.651,.083),.0025,.002,5,seg=5)
   m.ell(11,(sign*.011,1.592,.122),(.005,.002,.002),5,seg=6,rings=3)
  m.ell(3,(0,1.566,.088),(.023,.0025,.003),5,seg=10,rings=3)
  m.ell(7,(0,1.56,.087),(.022,.003,.004),5,seg=10,rings=3)
 # Arms made from continuous sleeve rings with blended elbow weights.
 for sign,upper,lower,hand,thigh,shin,foot in [(-1,6,7,8,12,13,14),(1,9,10,11,15,16,17)]:
  arm=[(.924,.041,.042),(.95,.046,.047),(1.02,.053,.055),(1.085,.058,.061),(1.12,.062,.063),(1.148,.065,.067),(1.20,.066,.071),(1.29,.070,.074),(1.365,.076,.081),(1.425,.061,.065),(1.449,.024,.03)]
  if lod:arm=arm[::2]
  m.rings(cloth,arm,center=(sign*.245,0,0),j=upper,weights=lambda p,u=upper,l=lower:blend(p[1],l,u,1.08,1.17))
  m.rings(cloth,[(.931,.044,.045),(.957,.045,.046)],center=(sign*.25,0,0),j=lower)
  m.ell(7,(sign*.25,.887,.006),(.042,.060,.022),hand)
  if lod==0:
   for k in range(3):m.tube(3,(sign*.25-.025+k*.017,.872,.027),(sign*.25-.025+k*.017,.904,.027),.0012,.001,hand,seg=4)
   m.ell(7,(sign*.214,.895,.012),(.013,.026,.013),hand,seg=8,rings=5)
  trousers=cloth if uk else 6
  leg=[(.155,.047,.05),(.30,.061,.064),(.455,.068,.072),(.51,.073,.079),(.55,.083,.085),(.65,.088,.099),(.75,.094,.107),(.84,.096,.109),(.921,.087,.104)]
  if lod:leg=leg[::2]
  m.rings(trousers,leg,center=(sign*.105,0,0),j=thigh,weights=lambda p,t=thigh,s=shin:blend(p[1],s,t,.46,.56))
  # British cloth puttees, German taller leather marching boots.
  if uk:
   m.rings(14,[(.137,.05,.052),(.19,.052,.054),(.31,.061,.063),(.45,.067,.07)],center=(sign*.105,0,0),j=shin)
   if lod==0:
    for k in range(10):
     y=.15+k*.029;r=.050+(y-.14)*.055
     m.rings(0,[(y,r+.002,r+.004),(y+.004,r+.003,r+.005)],center=(sign*.105,0,0),j=shin,segments=12)
  else:m.rings(boot,[(.09,.056,.065),(.17,.053,.060),(.28,.060,.064),(.43,.069,.071),(.451,.073,.074)],center=(sign*.105,0,0),j=shin)
  m.ell(boot,(sign*.105,.075,.055),(.066,.072,.134),foot,seg=[14,10,7][lod],rings=[7,5,4][lod])
  m.softbox(4,(sign*.105,.022,.057),(.132,.033,.257),foot)
  if lod==0 and uk:
   for k in range(5):m.ribbon(11,[(sign*.105-.031,.134-k*.007,.01+k*.019),(sign*.105+.031,.134-k*.007,.01+k*.019)],.004,foot)
  if lod<2:
   # Seams and wrinkles are shape details, not hundreds of separate runtime meshes.
   m.ribbon(cloth,[(sign*.183,.60,.039),(sign*.194,.74,.039),(sign*.191,.87,.039)],.005,thigh)
 # Belt follows elliptical waist, and the buckle is shaped metal, not a stripe texture.
 m.rings(gear,[(1.015,.161,.108),(1.08,.161,.108)],j=2)
 m.softbox(9 if uk else 8,(0,1.047,.113),(.056,.048,.011),2)
 if lod<2:m.softbox(gear,(0,1.047,.122),(.039,.029,.008),2)
 # British 1902-style tunic pockets and visible fly; German concealed fly and skirt pockets.
 m.softbox(cloth,(0,1.25,.118),(.022,.294,.008),3)
 for sign in [-1,1]:
  if uk:
   m.softbox(cloth,(sign*.12,1.276,.114),(.11,.107,.025),3)
   m.softbox(cloth,(sign*.12,1.318,.133),(.118,.030,.009),3)
   if lod<2:m.softbox(14,(sign*.12,1.266,.130),(.010,.079,.005),3)
  m.softbox(cloth,(sign*.116,.897,.109),(.113,.111,.018),1)
  m.softbox(cloth,(sign*.116,.937,.124),(.119,.029,.009),1)
  if lod<2:
   for y,x,z in ([(1.32,.12,.141),(.937,.116,.132)] if uk else [(.937,.116,.132)]):m.ell(9 if uk else 8,(sign*x,y,z),(.006,.006,.003),3 if y>1 else 1,seg=6,rings=3)
 if uk and lod<2:
  for y in [1.41,1.33,1.245,1.16,.98]:m.ell(9,(0,y,.13 if y>1.1 else .116),(.007,.007,.004),3 if y>1.16 else 2,seg=6,rings=4)
 # Broad front braces, crossover at the back, passing OVER shoulders, not through neck.
 for sign in [-1,1]:
  m.ribbon(gear,[(sign*.115,1.07,.125),(sign*.15,1.24,.136),(sign*.15,1.40,.113),(sign*.15,1.446,.02),(sign*.15,1.415,-.10),(sign*-.11,1.08,-.12)],.045 if uk else .028,3)
  # Five British pockets (three lower, two upper), three German leather pouches each side.
  slots=[(-.047,1.09), (0,1.09),(.047,1.09),(-.025,1.165),(.025,1.165)] if uk else [(-.052,1.085),(0,1.085),(.052,1.085)]
  if lod==2:slots=[(0,1.115)]
  for off,y in slots:
   x=sign*.118+off;m.softbox(gear,(x,y,.143),(.041 if lod<2 else .143,.079 if uk else .099,.052),2)
   if lod<2:
    m.softbox(gear,(x,y+.028,.174),(.045,.024,.012),2)
    m.ell(9 if uk else 8,(x,y+.017,.184),(.004,.004,.002),2,seg=5,rings=3)
 # Small pack, bedroll, breadbag, felt canteen, entrenching tool and bayonet scabbard.
 if variant!=1:
  m.softbox(2 if uk else 14,(0,1.214,-.184),(.32,.34,.156),3)
  m.softbox(2 if uk else 3,(0,1.34,-.272),(.325,.091,.023),3)
  for sign in [-1,1]:m.ribbon(gear,[(sign*.098,1.05,-.268),(sign*.098,1.36,-.288)],.026,3)
  if lod<2:
   m.tube(6 if uk else 1,(-.17,1.43,-.19),(.17,1.43,-.19),.062,.062,3,seg=12)
   for x in [-.12,.12]:m.tube(gear,(x,1.43,-.19),(x+.013,1.43,-.19),.064,.064,3,seg=12)
 else:
  m.softbox(2 if uk else 14,(0,.97,-.164),(.27,.18,.13),1)
  m.ribbon(gear,[(-.14,1.4,-.12),(.12,1.06,-.15)],.04,3)
  if lod<2:
   m.tube(14,(-.14,1.08,-.19),(.14,1.08,-.19),.048,.048,2,seg=12)
 m.softbox(2 if uk else 14,(-.222,.936,-.045),(.13,.18,.13),1)
 m.ell(6,(.216,.935,-.035),(.068,.092,.041),1)
 m.ribbon(gear,[(.207,1.035,-.084),(.236,.917,-.07),(.209,.865,-.067)],.022,1)
 m.tube(8,(.216,1.018,-.035),(.216,1.057,-.035),.015,.015,1,seg=8)
 m.tube(3,(-.212,.835,-.071),(-.23,.54,-.09),.013,.007,1,seg=6)
 m.tube(10,(.08,.94,-.295),(.13,.59,-.26),.012,.015,1,seg=8)
 if lod<2:m.softbox(8,(.075,.944,-.3),(.12,.10,.022),1)
 if not uk:
  m.tube(5,(-.22,1.05,-.17),(-.22,.855,-.17),.045,.045,1,seg=12)
  if lod<2:
   for y in [.873,.889,.905,.922,.939,.956,1.034]:m.tube(8,(-.22,y,-.17),(-.22,y+.004,-.17),.046,.046,1,seg=12)
 # Three silhouettes: full equipment, assault/light equipment, NCO service cap.
 if variant==2:
  m.rings(cloth,[(1.693,.097,.113),(1.713,.101,.12),(1.719,.108,.127),(1.764,.116,.126),(1.785,.087,.094),(1.79,.001,.001)],center=(0,0,.0),j=5,segments=[28,16,10][lod])
  m.rings(3 if uk else 13,[(1.699,.099,.114),(1.715,.102,.119)],j=5)
  if uk:m.softbox(3,(0,1.691,.108),(.18,.012,.12),5)
  if lod<2:
   m.ell(9,(0,1.742,.127),(.012,.017,.003),5,seg=8,rings=4)
   for sign in [-1,1]:m.ell(11,(sign*.012,1.58,.108),(.018,.006,.004),5,seg=8,rings=4)
   m.softbox(3,(.21,.92,-.06),(.09,.20,.15),1)
   m.ribbon(gear,[(.17,1.42,.10),(-.16,1.05,.16)],.031,3)
   for y in [1.25,1.27,1.29]:
    m.ribbon(15,[(-.316,y+.015,-.022),(-.319,y,.016),(-.312,y+.015,.044)],.007,6)
 elif uk:
  m.rings(5,[(1.709,.164,.178),(1.715,.162,.176),(1.726,.112,.125),(1.745,.105,.118),(1.785,.085,.098),(1.812,.05,.059),(1.822,.001,.001)],center=(0,0,.006),j=5,segments=[28,16,10][lod])
  if lod==0:m.rings(8,[(1.708,.164,.178),(1.711,.165,.179)],center=(0,0,.006),j=5,segments=28)
 else:
  seg=[28,16,10][lod];pts=[];uv=[]
  levels=[(0,.132,.159),(1,.134,.160),(1.711,.119,.137),(1.747,.110,.129),(1.781,.087,.107),(1.809,.052,.068),(1.823,.001,.001)]
  if lod==2:levels=[levels[i] for i in [0,2,3,5,6]]
  for row,(y,rx,rz) in enumerate(levels):
   for k in range(seg+1):
    a=TAU*k/seg;f=float(np.clip((math.sin(a)-.15)/.46,0,1));f=f*f*(3-2*f)
    height=1.619+.086*f+(y*.003) if y in [0,1] else y
    pts.append((rx*math.cos(a),height,rz*math.sin(a)-.012));uv.append((k/seg,row/(len(levels)-1)))
  faces=[]
  for row in range(len(levels)-1):
   for k in range(seg):a=row*(seg+1)+k;d=a+seg+1;faces.extend([(a,d+1,a+1),(a,d,d+1)])
  m.tile=5;m.add(pts,faces,joint=5,uv=uv)
  if lod<2:
   for sign in [-1,1]:m.tube(5,(sign*.119,1.734,-.022),(sign*.139,1.734,-.022),.012,.009,5,seg=10)
 for sign in [-1,1]:m.ribbon(3,[(sign*.091,1.697,.006),(sign*.067,1.572,.058),(sign*.028,1.526,.074),(0,1.519,.067)],.010,5)
 # Merge the rifle into the same skinned draw call. Far LOD retains its silhouette.
 if lod==0:
  q=Model();rifle(q,'smle' if uk else 'gewehr',offset=(0,1.19,.28),j=18)
  start=len(m.pos);m.pos.extend(q.pos);m.norm.extend(q.norm);m.joints.extend(q.joints);m.weights.extend([[1,0,0,0]]*len(q.pos));m.idx.extend([i+start for i in q.idx])
  for p,c in zip(q.pos,q.col):
   tile=10 if c[0]>c[1]*1.45 else 8;m.uv.append(((tile%4+.1+(p[2]+.2)%1*.8)/4,(tile//4+.4)/4));m.col.append([.92,.92,.92,1])
 else:
  m.softbox(10,(0,1.20,.35),(.055,.075,.86),18)
  m.softbox(10,(0,1.15,-.043),(.06,.14,.22),18)
  m.tube(8,(0,1.26,.19),(0,1.26,1.11),.013,.010,18,seg=6)
 return m

def qmul(a,b):
 x,y,z,w=a;X,Y,Z,W=b;return np.array([w*X+x*W+y*Z-z*Y,w*Y-x*Z+y*W+z*X,w*Z+x*Y-y*X+z*W,w*W-x*X-y*Y-z*Z])
def qfrom(a,b):
 a=np.asarray(a,float);b=np.asarray(b,float);a/=np.linalg.norm(a);b/=np.linalg.norm(b);d=np.dot(a,b)
 if d<-.99999:return np.array([1.,0,0,0])
 q=np.r_[np.cross(a,b),1+d];return q/np.linalg.norm(q)
def arm_ik(sign,target):
 s=np.array([sign*.24,1.4,0]);d=np.array(target)-s;distance=np.linalg.norm(d);d/=distance;l1=.28;l2=.22;distance=min(distance,l1+l2-.001)
 a=(l1*l1-l2*l2+distance*distance)/(2*distance);h=math.sqrt(max(0,l1*l1-a*a));pole=np.array([sign*.42,1.075,.08])-s;pole-=d*np.dot(pole,d);pole/=np.linalg.norm(pole)
 e=s+d*a+pole*h;upper=qfrom([sign*.01,-.28,0],e-s);worldlower=qfrom([0,-.22,0],np.asarray(target)-e);inverse=upper*np.array([-1,-1,-1,1]);return upper,qmul(inverse,worldlower)

def animations():
 result=[];left=arm_ik(-1,(-.022,1.175,.485));right=arm_ik(1,(.028,1.164,.235))
 for name,duration in [('idle',2.4),('walk',1),('run',.7),('crouch',1.2),('prone',2),('aim',2),('fire',.25),('reload',2.6),('hit',.3),('death',1.2),('vault',.8),('grenade',1.1),('melee',.65)]:
  frames=[]
  for i in range(25):
   t=i/24;s=math.sin(t*TAU);q=[np.array([0.,0,0,1]) for _ in SKIN];q[6],q[7]=left;q[9],q[10]=right;q[3]=np.array(quat(.005*s,0,0))
   if name in ['walk','run']:
    amp=.48 if name=='walk' else .73;q[12]=quat(s*amp,0,0);q[15]=quat(-s*amp,0,0);q[13]=quat(max(0,-s)*.7,0,0);q[16]=quat(max(0,s)*.7,0,0)
   if name=='crouch':q[12]=quat(-1.02,0,-.08);q[15]=quat(-1.02,0,.08);q[13]=q[16]=quat(1.67,0,0);q[14]=q[17]=quat(-.65,0,0);q[3]=quat(.10,0,0)
   # Root posture is controlled by the renderer; do not counter-rotate the hips.
   if name=='prone':q[3]=quat(-.08,0,0);q[12]=quat(0,0,-.08);q[15]=quat(0,0,.08)
   if name=='fire':q[18]=quat(-.07*math.sin(math.pi*t),0,0)
   if name=='reload':q[9],q[10]=arm_ik(1,(.035,1.26+.02*s,.28));q[18]=quat(.05,0,-.08*math.sin(math.pi*t))
   if name=='hit':q[3]=quat(.16*math.sin(math.pi*t),0,.06*math.sin(math.pi*t))
   if name=='death':q[1]=quat(min(1,t*1.3)*1.53,0,.10*t);q[12]=quat(-.13*t,0,0);q[15]=quat(-.18*t,0,0);q[6]=quat(-.7,0,-.25);q[9]=quat(-.6,0,.25)
   if name=='vault':q[12]=quat(-.9*math.sin(math.pi*t),0,0);q[13]=quat(1.1*math.sin(math.pi*t),0,0)
   if name=='grenade':q[9]=quat(-2.6+2*t,0,.2);q[10]=quat(-.2,0,0)
   if name=='melee':q[3]=quat(0,-.3*math.sin(math.pi*t),0);q[18]=quat(0,-.15*math.sin(math.pi*t),0)
   q=[(np.asarray(v)/max(1e-9,np.linalg.norm(v))).tolist() for v in q];frames.append(q)
  result.append((name,duration,frames))
 return result

def export(name,models,images):
 blob=bytearray();views=[];access=[]
 def buffer(data,target=None):
  blob.extend(b'\0'*((-len(blob))%4));offset=len(blob);blob.extend(data);v={'buffer':0,'byteOffset':offset,'byteLength':len(data)}
  if target:v['target']=target
  views.append(v);return len(views)-1
 def accessor(data,typ,component=5126,target=None,bounds=False):
  a=np.asarray(data,dtype={5126:'<f4',5123:'<u2',5125:'<u4'}[component]);vi=buffer(a.tobytes(),target);d={'bufferView':vi,'componentType':component,'count':len(data),'type':typ}
  if bounds:d.update(min=a.reshape(len(data),-1).min(0).tolist(),max=a.reshape(len(data),-1).max(0).tolist())
  access.append(d);return len(access)-1
 doc={'asset':{'version':'2.0','generator':'Ziemia Niczyja original infantry authoring 0.3'},'scene':0,'scenes':[{'nodes':[0,1,2,3]}],'nodes':[],'meshes':[],'materials':[{'name':'InfantryAtlas','pbrMetallicRoughness':{'baseColorFactor':[1,1,1,1],'baseColorTexture':{'index':0},'metallicRoughnessTexture':{'index':2},'metallicFactor':1,'roughnessFactor':1},'normalTexture':{'index':1,'scale':.40},'occlusionTexture':{'index':2,'strength':.45},'doubleSided':False}],'textures':[{'sampler':0,'source':i} for i in range(3)],'samplers':[{'magFilter':9729,'minFilter':9987,'wrapS':33071,'wrapT':33071}],'images':[],'buffers':[{'byteLength':0}],'bufferViews':views,'accessors':access}
 for i,m in enumerate(models):
  attributes={k:accessor(v,t,c,34962,k=='POSITION') for k,v,t,c in [('POSITION',m.pos,'VEC3',5126),('NORMAL',m.norm,'VEC3',5126),('TEXCOORD_0',m.uv,'VEC2',5126),('COLOR_0',m.col,'VEC4',5126),('JOINTS_0',m.joints,'VEC4',5123),('WEIGHTS_0',m.weights,'VEC4',5126)]}
  doc['meshes'].append({'name':f'{name}:lod{i}','primitives':[{'attributes':attributes,'indices':accessor(m.idx,'SCALAR',5125,34963),'material':0}]});doc['nodes'].append({'name':f'{name}:lod{i}','mesh':i,'skin':0})
 for i,(bn,parent,p) in enumerate(SKIN):
  tr=np.asarray(p)-np.asarray(SKIN[parent][2] if parent is not None else [0,0,0]);node={'name':bn,'translation':tr.tolist()};children=[k+3 for k,s in enumerate(SKIN) if s[1]==i]
  if children:node['children']=children
  doc['nodes'].append(node)
 matrices=[]
 for _,_,p in SKIN:
  mat=np.eye(4);mat[:3,3]=-np.asarray(p);matrices.append(mat.T.ravel())
 doc['skins']=[{'name':'InfantrySkeleton','inverseBindMatrices':accessor(matrices,'MAT4'),'joints':list(range(3,3+len(SKIN))),'skeleton':3}]
 doc['animations']=[]
 for clip,duration,frames in animations():
  samplers=[];channels=[];tin=accessor(np.linspace(0,duration,len(frames)),'SCALAR',bounds=True)
  for j in range(len(SKIN)):
   samplers.append({'input':tin,'output':accessor([f[j] for f in frames],'VEC4'),'interpolation':'LINEAR'});channels.append({'sampler':j,'target':{'node':j+3,'path':'rotation'}})
  doc['animations'].append({'name':clip,'samplers':samplers,'channels':channels})
 for i,namepart in enumerate(['color','normal','orm']):doc['images'].append({'name':['Colour','Normal','ORM'][i],'uri':f'textures/infantry-{namepart}.png'})
 doc['buffers'][0]['byteLength']=len(blob);js=json.dumps(doc,separators=(',',':')).encode();js+=b' '*((-len(js))%4);blob.extend(b'\0'*((-len(blob))%4))
 raw=struct.pack('<III',0x46546c67,2,28+len(js)+len(blob))+struct.pack('<II',len(js),0x4e4f534a)+js+struct.pack('<II',len(blob),0x004e4942)+blob
 (OUT/(name+'.glb')).write_bytes(raw);return {'file':name+'.glb','bytes':len(raw),'lods':[{'vertices':len(m.pos),'triangles':len(m.idx)//3} for m in models]}

if __name__=='__main__':
 images=make_atlas();stats=[]
 for faction in ['british','german']:
  for variant in range(3):
   name=faction+('' if variant==0 else f'-v{variant}');models=[body(faction,i,variant) for i in range(3)];result=export(name,models,images);stats.append(result);print(result,flush=True)
 (ROOT/'docs/v0.3-tests').mkdir(parents=True,exist_ok=True)
 (ROOT/'docs/v0.3-tests/character-budgets.json').write_text(json.dumps(stats,indent=2))
