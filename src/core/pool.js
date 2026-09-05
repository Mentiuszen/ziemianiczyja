/** Small ownership-aware pool; returning an object twice cannot duplicate it. */
export class BoundedPool {
  constructor(create,destroy,capacity=64){this.create=create;this.destroy=destroy;this.capacity=capacity;this.objects=new Set();this.free=[];this.idle=new Set();this.disposed=false;}
  acquire(){if(this.disposed)return null;if(this.free.length){const value=this.free.pop();this.idle.delete(value);return value;}if(this.objects.size>=this.capacity)return null;const value=this.create();this.objects.add(value);return value;}
  release(value){if(this.disposed||!this.objects.has(value)||this.idle.has(value))return;this.idle.add(value);this.free.push(value);}
  get available(){return this.free.length;}
  dispose(){if(this.disposed)return;this.disposed=true;for(const value of this.objects)this.destroy(value);this.objects.clear();this.free.length=0;this.idle.clear();}
}
