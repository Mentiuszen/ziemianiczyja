import test from 'node:test';import assert from 'node:assert/strict';
import {BoundedPool} from '../src/core/pool.js';
test('pool reuses objects and never allocates past capacity',()=>{let created=0,destroyed=0;const p=new BoundedPool(()=>({id:++created}),()=>destroyed++,2);const a=p.acquire(),b=p.acquire();assert.equal(p.acquire(),null);p.release(a);assert.equal(p.acquire(),a);assert.equal(created,2);p.release(b);p.release(b);assert.equal(p.available,1);p.dispose();assert.equal(destroyed,2);assert.equal(p.acquire(),null);});
test('pool ignores foreign objects and disposal is idempotent',()=>{let count=0;const p=new BoundedPool(()=>({}),()=>count++,4);p.acquire();p.release({});assert.equal(p.available,0);p.dispose();p.dispose();assert.equal(count,1);});
