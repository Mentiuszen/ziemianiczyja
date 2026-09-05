import test from 'node:test';
import assert from 'node:assert/strict';
const module=await import('../src/render/geometry-data.js').catch(()=>null);
function assertExterior(g){
 for(let i=0;i<g.i.length;i+=3){const ids=g.i.slice(i,i+3),p=ids.map(id=>g.p.slice(id*3,id*3+3));const u=p[1].map((n,k)=>n-p[0][k]),v=p[2].map((n,k)=>n-p[0][k]);const cross=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],n=g.n.slice(ids[0]*3,ids[0]*3+3);assert.ok(Math.hypot(...cross)>1e-9,'no degenerate facets');assert.ok(cross.reduce((s,x,k)=>s+x*n[k],0)<-1e-9,'native LH winding must oppose mathematical cross product');}
}
test('native geometry is pure and testable without a GPU',()=>assert.ok(module?.GeometryData));
test('all six box faces use exterior LH winding',()=>{assert.ok(module);assertExterior(new module.GeometryData().box(0,0,0,2,3,4,.7));});
test('cylinders have closed caps and outward normals',()=>{assert.ok(module);const g=new module.GeometryData().cylinder([1,2,3],[2,4,5],.2,.1,12);assert.equal(g.i.length/3,48);assertExterior(g);});
test('rounded bags and stones have no zero-area poles',()=>{assert.ok(module);assertExterior(new module.GeometryData().ellipsoid(0,1,0,.6,.2,.4,12,8));});
