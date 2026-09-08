"""Original field gun and aircraft art for v0.4. Metres, +Z nose/muzzle.
Not a museum replica. No reference photo pixels or other game assets are copied.
Use python tools/generate_support_v04.py. numpy + Pillow are authoring-only.
"""
import math,json,struct
import numpy as np
from PIL import Image,ImageDraw,ImageFilter
from generate_assets import Model,export_glb,OUT,TEX
IRON=(.20,.245,.215);STEEL=(.16,.18,.17);WOOD=(.31,.22,.12);DARK=(.045,.052,.045);TIRE=(.105,.11,.09)

def ring(m,center,radius,thickness,col,axis='x',segments=32):
 x,y,z=center
 for i in range(segments):
  a=i/segments*math.tau;b=(i+1)/segments*math.tau
  if axis=='x':p=(x,y+math.cos(a)*radius,z+math.sin(a)*radius);q=(x,y+math.cos(b)*radius,z+math.sin(b)*radius)
  else:p=(x+math.cos(a)*radius,y+math.sin(a)*radius,z);q=(x+math.cos(b)*radius,y+math.sin(b)*radius,z)
  m.cylinder(p,q,thickness,thickness,col,segments=6)

def write(name,m,node,loc):
 export_glb(name,m)
 p=OUT/(name+'.glb');b=p.read_bytes();jl=struct.unpack_from('<I',b,12)[0];j=json.loads(b[20:20+jl]);binary=b[28+jl:]
 j['asset']['generator']='Ziemia Niczyja original support generator 0.4';j['materials'][0]['doubleSided']=False
 j['nodes'].append({'name':node,'translation':loc});j['nodes'][0]['children']=[1]
 js=json.dumps(j,separators=(',',':')).encode();js+=b' '*((-len(js))%4)
 raw=struct.pack('<III',0x46546c67,2,28+len(js)+len(binary))+struct.pack('<II',len(js),0x4e4f534a)+js+struct.pack('<II',len(binary),0x004e4942)+binary;p.write_bytes(raw)

def gun():
 m=Model()
 # Artillery wheels: wooden felloes and spokes, thin steel tyre, central hub.
 for x in [-.89,.89]:
  ring(m,(x,.65,0),.56,.045,WOOD);ring(m,(x,.65,0),.595,.022,TIRE)
  m.cylinder((x-.13,.65,0),(x+.13,.65,0),.095,.095,IRON,segments=16)
  for i in range(12):
   a=i/12*math.tau;m.cylinder((x,.65,0),(x,.65+.54*math.cos(a),.54*math.sin(a)),.025,.018,WOOD,segments=6)
 m.cylinder((-.94,.65,0),(.94,.65,0),.055,.055,STEEL,segments=12)
 # Closed shield with chamfered upper corners, sloped split trail and earth spade.
 shield=[(-.1,.49),(-.1,1.46),(.10,1.56),(.15,1.48),(.15,.49)]
 m.profile(-.90,.90,shield,IRON)
 m.box((0,.38,-.28),(.64,.23,1.05),IRON)
 for x in [-.30,.30]:m.cylinder((x,.50,-.30),(x*.48,.14,-2.38),.07,.065,IRON,segments=8)
 m.box((0,.15,-2.40),(.64,.18,.34),IRON)
 m.cylinder((0,1.05,-.65),(0,1.05,.22),.155,.125,STEEL,segments=16)
 m.cylinder((0,1.08,.18),(0,1.08,2.05),.079,.055,IRON,segments=20)
 m.cylinder((0,1.08,2.05),(0,1.08,2.09),.057,.057,DARK,segments=20)
 m.cylinder((0,.91,-.46),(0,.91,1.12),.045,.045,IRON,segments=12)
 m.box((0,1.08,-.78),(.31,.29,.31),STEEL)
 ring(m,(.42,.89,-.58),.15,.017,STEEL)
 m.cylinder((.12,.89,-.58),(.42,.89,-.58),.025,.025,STEEL,segments=8)
 for z in [-.25,-.57]:m.box((-.50,.48,z),(.32,.05,.34),WOOD)
 for x in [-.80,-.45,0,.45,.80]:
  for y in [.61,1.39]:m.ellipsoid((x,y,.158),(.018,.018,.008),STEEL,segments=8,rings=4)
 write('field-gun-77',m,'Breech',(0,1.08,-.78))

def fuselage(m,sections,col):
 # Closed tapered oval section, normals averaged along the skin.
 points=[];sides=16
 for z,y,rx,ry in sections:
  for k in range(sides):a=k/sides*math.tau;points.append((rx*math.cos(a),y+ry*math.sin(a),z))
 faces=[]
 for row in range(len(sections)-1):
  for k in range(sides):a=row*sides+k;b=row*sides+(k+1)%sides;c=b+sides;d=a+sides;faces.extend([[a,b,c],[a,c,d]])
 # Determine exterior sign by comparing to local tube centre in XY.
 for f in faces:
  p=np.array([points[i] for i in f]);n=np.cross(p[1]-p[0],p[2]-p[0]);v=p.mean(0);mid=sum(s[1] for s in sections)/len(sections)
  if n[0]*v[0]+n[1]*(v[1]-mid)<0:f.reverse()
 for row in [0,len(sections)-1]:
  base=row*sides
  for k in range(1,sides-1):faces.append([base,base+k+(0 if row==0 else 1),base+k+(1 if row==0 else 0)])
 m.add(points,faces,col)

def roundel(m,x,y,z,r):
 for rr,c,dy in [(r,(.10,.18,.31),0),(r*.69,(.87,.86,.77),.006),(r*.35,(.55,.075,.045),.012)]:m.cylinder((x,y+dy,z),(x,y+dy+.006,z),rr,rr,c,segments=28)

def crossmark(m,x,y,z,r):
 for scale,col,dy in [(1.14,(.88,.87,.80),0),(1,DARK,.007)]:
  m.box((x,y+dy,z),(r*.32*scale,.01,r*1.35*scale),col);m.box((x,y+dy,z),(r*1.35*scale,.01,r*.32*scale),col)

def plane(name):
 m=Model();g=name=='dfw';span=13.2 if g else 8.3;chord=1.7 if g else 1.28;length=7.9 if g else 6.5
 cloth=(.37,.37,.25) if g else(.27,.30,.20);underside=(.70,.68,.51);nose=(.42,.43,.34)
 fuselage(m,[(-length*.56,.87,.065,.11),(-length*.39,.91,.19,.22),(-1.5,1,.32,.35),(-.15,1.01,.40,.40),(1.5,1,.43,.40),(length*.39,1,.31,.32)],cloth)
 # DH.5 has negative stagger: the upper wing sits aft of the lower wing.
 zlow=.32;ztop=.65 if g else-.28
 for y,z in [(.80,zlow),(2.06,ztop)]:
  # Thin gently tapered airfoil segments, not one thick rectangular slab.
  for side in [-1,1]:
   for j in range(8):
    x0=span*.5*j/8;x1=span*.5*(j+1)/8;mid=(x0+x1)/2*side;tip=1-.14*j/8
    m.ellipsoid((mid,y,z),(span/32*1.03,.076,chord*.53*tip),cloth,segments=12,rings=6)
    m.box((mid,y-.036,z),(span/16,.016,chord*.82*tip),underside)
   for j in range(1,14):
    x=span*.48*j/14*side;m.cylinder((x,y+.079,z-chord*.39),(x,y+.079,z+chord*.35),.006,.006,(.47,.46,.33),segments=5)
  for side in [-1,1]:
   x=span*.35*side
   if g:crossmark(m,x,y+.09,z,.63)
   else:roundel(m,x,y+.09,z,.50)
 # Interplane struts and tension wires.
 for x in [-span*.33,span*.33]:
  for off in [-.42,.42]:m.cylinder((x,.87,zlow+off),(x,2.01,ztop+off),.035,.028,WOOD,segments=8)
  m.cylinder((x,.87,zlow-.42),(x,2.01,ztop+.42),.006,.006,STEEL,segments=5)
  m.cylinder((x,.87,zlow+.42),(x,2.01,ztop-.42),.006,.006,STEEL,segments=5)
 for side in [-1,1]:
  m.cylinder((side*.3,1.2,.18),(side*.60,2.03,ztop+.27),.022,.022,WOOD,segments=8)
  m.cylinder((side*.3,1.2,-.57),(side*.60,2.03,ztop-.34),.022,.022,WOOD,segments=8)
 # Tailplane/rudder, fixed landing gear, exposed cockpit/helmet silhouettes.
 tailz=-length*.46
 m.ellipsoid((0,1.0,tailz),(1.55 if g else 1.27,.05,.73),cloth,segments=16,rings=6)
 m.ellipsoid((0,1.47,tailz-.05),(.04,.61,.66),cloth,segments=16,rings=8)
 for x in [-.63,.63]:
  m.cylinder((x*.50,.92,.75),(x,.29,.75),.025,.025,STEEL,segments=8)
  m.cylinder((x*.5,.86,-.1),(x,.29,.75),.025,.025,STEEL,segments=8)
  ring(m,(x,.30,.75),.25,.054,TIRE,segments=24);m.cylinder((x-.025,.30,.75),(x+.025,.30,.75),.18,.18,(.41,.40,.30),segments=16)
 m.cylinder((-.67,.30,.75),(.67,.30,.75),.024,.024,STEEL,segments=8)
 m.cylinder((0,.81,tailz),(0,.19,tailz-.25),.025,.025,WOOD,segments=7)
 cockpits=[-.27,-1.27] if g else[-.38]
 for z in cockpits:
  m.ellipsoid((0,1.37,z),(.27,.05,.34),DARK,segments=16,rings=6)
  m.ellipsoid((0,1.48,z-.08),(.16,.16,.16),WOOD,segments=12,rings=8)
  m.box((0,1.55,z+.10),(.31,.065,.025),(.30,.32,.30))
 if g:m.cylinder((.15,1.65,-1.3),(.20,1.75,-2.3),.02,.018,STEEL,segments=8)
 else:m.cylinder((.22,1.35,.8),(.22,1.35,2.18),.022,.018,STEEL,segments=8)
 nosez=length*.39;m.cylinder((0,1,nosez-.18),(0,1,nosez+.05),.33,.33,nose,segments=20)
 m.cylinder((0,1,nosez+.05),(0,1,nosez+.14),.08,.06,STEEL,segments=12)
 write(name,m,'Propeller',(0,1,nosez+.17))

def map_texture():
 im=Image.new('RGB',(1024,768),(184,174,139));d=ImageDraw.Draw(im)
 for x in range(0,1024,64):d.line((x,0,x,768),fill=(143,145,117),width=1)
 for y in range(0,768,64):d.line((0,y,1024,y),fill=(143,145,117),width=1)
 for j in range(6):
  pts=[(x,130+j*91+int(25*math.sin(x*.009+j))) for x in range(0,1025,16)];d.line(pts,fill=(134,139,108),width=2)
 for z,c in [(560,(46,73,94)),(330,(129,61,40)),(220,(129,61,40))]:
  pts=[(60+i*60,z+(i%2)*27) for i in range(15)];d.line(pts,fill=c,width=6)
 for x in [440,570]:d.line([(x,655),(x-25,580),(x,450),(x+20,375),(x,290)],fill=(44,68,87),width=9);d.polygon([(x,275),(x-19,306),(x+21,302)],fill=(44,68,87))
 for x,y in [(714,188),(741,225),(795,210),(773,145),(689,235)]:d.rectangle((x,y,x+26,y+19),fill=(94,86,65))
 d.rectangle((15,15,1008,752),outline=(67,67,49),width=3)
 d.text((32,34),'CAMBRAI  /  20 XI 1917',fill=(44,46,36),stroke_width=1)
 d.text((33,705),'SEKTOR FIKCYJNY - PLAN ODDZIALU',fill=(44,46,36))
 im.save(TEX/'briefing-map.jpg',quality=93)

if __name__=='__main__':gun();plane('dh5');plane('dfw');map_texture()
