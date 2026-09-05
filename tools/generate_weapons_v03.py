"""Original textured viewmodels, metres +Z barrel direction. No third-party art."""
from pathlib import Path
import json, math, struct
import numpy as np
from generate_characters import Infantry, TEX, OUT


def loft(m,tile,sections,segments=20):
 """Closed, rounded stock with explicit CCW winding in glTF RH space."""
 pts=[];uv=[];faces=[]
 for i,(z,y,rx,ry) in enumerate(sections):
  for k in range(segments+1):
   a=math.tau*k/segments;pts.append((rx*math.cos(a),y+ry*math.sin(a),z));uv.append((k/segments,i/(len(sections)-1)))
 for i in range(len(sections)-1):
  for k in range(segments):
   a=i*(segments+1)+k;b=a+1;d=a+segments+1;faces.extend([(a,b,d+1),(a,d+1,d)])
 for end,flip in [(0,True),(len(sections)-1,False)]:
  z,y,_,_=sections[end];c=len(pts);pts.append((0,y,z));uv.append((.5,.5))
  for k in range(segments):
   a=end*(segments+1)+k;b=a+1;faces.append((c,b,a) if flip else (c,a,b))
 m.tile=tile;m.add(pts,faces,uv=uv)


def hoop(m,tile,center,ry,rz,r=.003,segments=24):
 x,y,z=center
 for k in range(segments):
  a=math.tau*k/segments;b=math.tau*(k+1)/segments
  m.tube(tile,(x,y+math.sin(a)*ry,z+math.cos(a)*rz),(x,y+math.sin(b)*ry,z+math.cos(b)*rz),r,r,seg=6)


def build(name):
 m=Infantry(0)
 if name in ['smle','gewehr']:
  g=name=='gewehr';end=.91 if g else .8
  loft(m,10,[(-.45,-.068,.029,.078),(-.415,-.066,.033,.078),(-.30,-.05,.028,.057),(-.20,-.023,.023,.033),(-.12,.014,.027,.031),(-.03,.026,.031,.038)])
  loft(m,10,[(-.045,.026,.030,.035),(.07,.028,.030,.033),(.33,.031,.025,.03),(.59,.028,.024,.026),(end-.035,.031,.019,.022)],16)
  m.softbox(8,(0,.070,-.02),(.063,.048,.23));m.tube(8,(0,.075,-.13),(0,.075,end),.016,.012,seg=28)
  m.tube(11,(0,.075,end+.001),(0,.075,end+.002),.009,.009,seg=20)
  # Receiver channel, cocking piece, bolt sleeve and bent handle.
  m.tube(8,(0,.086,-.152),(0,.086,.08),.022,.021,seg=20)
  m.tube(8,(.012,.093,-.064),(.074,.058,-.06),.005,.006,seg=10)
  m.ell(8,(.075,.057,-.06),(.012,.012,.012),seg=14,rings=8)
  m.softbox(11,(0,.103,.010),(.030,.005,.076))
  m.softbox(8,(0,-.025,.013),(.043,.082,.076 if not g else .034))
  for z in [.25,end-.16]:
   m.softbox(8,(0,.032,z),(.06,.08,.013));m.softbox(8,(0,-.012,z),(.022,.013,.026))
   m.tube(8,(-.035,.03,z),(.035,.03,z),.0035,.0035,seg=8)
  m.softbox(8,(0,.111,.12),(.035,.017,.07));m.softbox(11,(0,.123,.12),(.027,.004,.045))
  for z in [.095,.105,.115,.125,.135]:m.softbox(9,(0,.126,z),(.025,.001,.0018))
  m.softbox(8,(0,.115,end-.047),(.01,.065,.014))
  for x in [-.021,.021]:m.softbox(8,(x,.107,end-.049),(.006,.057,.03))
  hoop(m,8,(0,-.04,-.102),.027,.047,.0035)
  m.tube(8,(0,-.018,-.12),(0,-.043,-.105),.003,.003,seg=8)
  m.softbox(8,(0,-.068,-.451),(.06,.151,.009))
  for y in [-.115,-.028]:m.tube(8,(0,y,-.458),(0,y,-.460),.0038,.0038,seg=8)
  m.ribbon(3,[(0,-.111,-.35),(0,-.155,-.15),(0,-.135,.30),(0,-.042,end-.15)],.025)
  for z in [-.28,.22]:m.tube(8,(-.034,-.04 if z<0 else .02,z),(.034,-.04 if z<0 else .02,z),.004,.004,seg=8)
 elif name=='lewis':
  loft(m,10,[(-.45,-.067,.032,.078),(-.42,-.064,.037,.079),(-.31,-.045,.031,.062),(-.22,-.027,.026,.040),(-.13,.018,.026,.032)])
  m.softbox(8,(0,.063,-.015),(.082,.095,.30));m.softbox(11,(0,.095,.036),(.087,.017,.16))
  m.tube(8,(0,.08,.13),(0,.08,.77),.048,.045,seg=40)
  for z in [.15,.23,.60,.75]:m.tube(8,(0,.08,z),(0,.08,z+.009),.049,.049,seg=36)
  m.tube(8,(0,.08,.77),(0,.08,.855),.016,.013,seg=24)
  m.tube(11,(0,.08,.856),(0,.08,.857),.009,.009,seg=20)
  for k in range(12):
   a=math.tau*k/12;x=math.cos(a)*.046;y=.08+math.sin(a)*.046
   m.tube(11,(x,y,.58),(x,y,.732),.0015,.0015,seg=5)
  # Shallow stamped pan: thin pressed ribs, not enormous radial rods.
  m.tube(8,(0,.119,.065),(0,.153,.065),.137,.134,seg=64)
  m.tube(8,(0,.154,.065),(0,.161,.065),.126,.035,seg=64)
  m.tube(11,(0,.148,.065),(0,.152,.065),.138,.138,seg=64)
  m.tube(8,(0,.162,.065),(0,.166,.065),.026,.024,seg=28)
  for k in range(24):
   a=math.tau*k/24;c,s=math.cos(a),math.sin(a)
   m.tube(8,(c*.035,.161,.065+s*.035),(c*.126,.155,.065+s*.126),.0013,.0012,seg=5)
  m.softbox(10,(0,-.039,-.12),(.048,.135,.068));hoop(m,8,(0,-.022,-.052),.031,.047,.004)
  m.softbox(8,(0,.145,.66),(.009,.09,.025));m.softbox(11,(0,.19,.66),(.018,.004,.024))
  m.softbox(8,(0,.113,-.135),(.048,.039,.035))
  for x in [-.05,.05]:m.tube(8,(x,.049,.6),(x*1.5,-.055,.22),.007,.006,seg=12)
  m.tube(8,(.045,.08,-.09),(.085,.08,-.09),.006,.006,seg=10)
  m.softbox(8,(0,-.066,-.452),(.066,.15,.008))
 elif name=='webley':
  loft(m,3,[(-.11,-.13,.028,.077),(-.077,-.125,.032,.079),(-.021,-.068,.028,.069),(.015,-.015,.024,.039)],16)
  m.softbox(8,(0,.045,.04),(.069,.068,.195));m.tube(8,(0,.065,.21),(0,.065,.427),.022,.018,seg=24)
  m.tube(11,(0,.065,.428),(0,.065,.429),.010,.010,seg=20)
  m.tube(8,(0,.066,.003),(0,.066,.135),.050,.050,seg=48)
  for k in range(6):
   a=math.tau*k/6;x=math.sin(a)*.032;y=.066+math.cos(a)*.032
   m.tube(11,(x,y,-.001),(x,y,-.002),.012,.012,seg=16)
   m.tube(9,(x,y,-.003),(x,y,-.004),.009,.009,seg=14)
   m.tube(8,(math.sin(a)*.047,.066+math.cos(a)*.047,.025),(math.sin(a)*.047,.066+math.cos(a)*.047,.10),.002,.002,seg=6)
  m.softbox(8,(0,.117,-.014),(.026,.029,.035));m.softbox(8,(0,.098,.409),(.008,.03,.012))
  m.softbox(8,(0,.126,.0),(.04,.012,.036));m.softbox(8,(0,.079,-.078),(.015,.06,.025))
  hoop(m,8,(0,-.032,.047),.035,.045,.004);m.tube(8,(0,-.007,.032),(0,-.038,.042),.004,.003,seg=8)
  for x in [-.033,.033]:m.tube(9,(x,-.103,-.055),(x*1.02,-.103,-.055),.005,.005,seg=10)
 elif name=='hands':
  for side in [-1,1]:
   palm=np.array((side*.047,-.07,.37 if side<0 else -.066));elbow=(side*.21,-.30,-.15);back=(side*.36,-.53,-.4)
   m.tube(0,back,elbow,.09,.077,seg=24);m.tube(0,elbow,tuple(palm+np.array([side*.005,-.022,-.015])),.077,.039,seg=24)
   cuff=tuple(palm+np.array([side*.012,-.022,-.022]));m.ell(0,cuff,(.054,.042,.044),seg=20,rings=10)
   m.ell(7,tuple(palm),(.048,.029,.069),seg=24,rings=12)
   for f in range(4):
    a=palm+np.array([side*.018,-.01,-.041+f*.020]);b=palm+np.array([-side*.021,.016,-.041+f*.02]);c=b+np.array([-side*.013,-.004,.001])
    m.tube(7,tuple(a),tuple(b),.010,.009,seg=12);m.ell(7,tuple(b),(.010,.010,.010),seg=12,rings=7);m.tube(7,tuple(b),tuple(c),.009,.008,seg=12)
    m.ell(15,tuple(c+np.array([0,.006,0])),(.008,.002,.006),seg=8,rings=4)
   m.tube(7,tuple(palm+np.array([side*.034,.012,-.036])),tuple(palm+np.array([side*.005,.040,.002])),.014,.011,seg=12)
   m.ell(7,tuple(palm+np.array([side*.005,.04,.002])),(.013,.012,.014),seg=12,rings=7)
 return m


def export(name,m):
 blob=bytearray();views=[];access=[]
 def put(data,typ,component=5126,target=34962,bounds=False):
  arr=np.asarray(data,dtype={5126:'<f4',5125:'<u4'}[component]);blob.extend(b'\0'*((-len(blob))%4));at=len(blob);blob.extend(arr.tobytes());views.append({'buffer':0,'byteOffset':at,'byteLength':arr.nbytes,'target':target});a={'bufferView':len(views)-1,'componentType':component,'count':len(data),'type':typ}
  if bounds:a.update(min=arr.reshape(len(data),-1).min(0).tolist(),max=arr.reshape(len(data),-1).max(0).tolist())
  access.append(a);return len(access)-1
 attrs={k:put(v,t,bounds=k=='POSITION') for k,v,t in [('POSITION',m.pos,'VEC3'),('NORMAL',m.norm,'VEC3'),('TEXCOORD_0',m.uv,'VEC2'),('COLOR_0',m.col,'VEC4')]};indices=put(m.idx,'SCALAR',5125,34963)
 doc={'asset':{'version':'2.0','generator':'Ziemia Niczyja original viewmodel 0.3'},'scene':0,'scenes':[{'nodes':[0]}],'nodes':[{'name':name,'mesh':0}],'meshes':[{'name':name,'primitives':[{'attributes':attrs,'indices':indices,'material':0}]}],'materials':[{'name':'WoodSteelCloth','pbrMetallicRoughness':{'baseColorTexture':{'index':0},'metallicRoughnessTexture':{'index':2},'metallicFactor':1,'roughnessFactor':1},'normalTexture':{'index':1,'scale':.25},'doubleSided':False}],'textures':[{'sampler':0,'source':i} for i in range(3)],'samplers':[{'magFilter':9729,'minFilter':9987,'wrapS':33071,'wrapT':33071}],'images':[{'uri':f'textures/infantry-{part}.png'} for part in ['color','normal','orm']],'buffers':[{'byteLength':len(blob)}],'bufferViews':views,'accessors':access}
 js=json.dumps(doc,separators=(',',':')).encode();js+=b' '*((-len(js))%4);blob+=b'\0'*((-len(blob))%4);raw=struct.pack('<III',0x46546c67,2,28+len(js)+len(blob))+struct.pack('<II',len(js),0x4e4f534a)+js+struct.pack('<II',len(blob),0x004e4942)+blob;(OUT/f'{name}.glb').write_bytes(raw);print(name,len(m.idx)//3,'triangles',len(raw)//1024,'KiB',flush=True)
if __name__=='__main__':
 for name in ['smle','gewehr','webley','lewis','hands']:export(name,build(name))
