import test from 'node:test';
import assert from 'node:assert/strict';
test('sky is a complete spherical shell with matching seam and no planar lid', async()=>{
 const {skyGeometry}=await import('../src/render/sky-geometry.js');
 const g=skyGeometry(64,32,240);
 assert.equal(g.positions.length,(64+1)*(32+1)*3);
 for(let i=0;i<g.positions.length;i+=3)assert.ok(Math.abs(Math.hypot(...g.positions.slice(i,i+3))-240)<.001);
 for(let row=0;row<=32;row++)for(let axis=0;axis<3;axis++)assert.ok(Math.abs(g.positions[(row*65)*3+axis]-g.positions[(row*65+64)*3+axis])<.0001);
 assert.equal(g.uvs[1],1);assert.equal(g.uvs.at(-1),0);
 assert.ok(g.indices.every(i=>i>=0&&i<g.positions.length/3));
});
