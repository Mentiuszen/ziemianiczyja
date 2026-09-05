"""glTF primitives must be outward-facing in right-handed object space."""
import unittest
import numpy as np
from generate_assets import Model
class WindingTests(unittest.TestCase):
 def test_ellipsoid_outward_and_non_degenerate(self):
  m=Model();m.ellipsoid((0,0,0),(1,1.5,.6),(1,1,1),segments=16,rings=9)
  p=np.array(m.pos);f=np.array(m.idx).reshape(-1,3)
  for tri in f:
   a,b,c=p[tri];n=np.cross(b-a,c-a)
   self.assertGreater(np.linalg.norm(n),1e-8)
   self.assertGreater(np.dot(n,(a+b+c)/3),0)
 def test_profile_handles_both_polygon_directions_and_reversed_x_extent(self):
  for x0,x1 in [(-1,1),(1,-1)]:
   for profile in [[(-1,-1),(1,-1),(1,1),(-1,1)],[(-1,1),(1,1),(1,-1),(-1,-1)]]:
    m=Model();m.profile(x0,x1,profile,(1,1,1));p=np.array(m.pos)
    for tri in np.array(m.idx).reshape(-1,3):
     a,b,c=p[tri];self.assertGreater(np.dot(np.cross(b-a,c-a),(a+b+c)/3),0)
if __name__=='__main__':unittest.main()
