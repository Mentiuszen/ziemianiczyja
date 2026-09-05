import {rng} from '../core/math.js';
/** Cosmetic random stream is local; it never advances the simulation RNG. */
export function explosionParticles(profile,seed=1){const random=rng(seed),result=[];
 for(let i=0;i<profile.dustCount;i++){const angle=random()*Math.PI*2,speed=1+random()*2.5;result.push({kind:'dust',x:Math.cos(angle)*.5,y:.22+random()*.4,z:Math.sin(angle)*.5,vx:Math.cos(angle)*speed,vy:.8+random()*1.8,vz:Math.sin(angle)*speed,size:.6+random()*.8,life:1.5+random()*1.5});}
 for(let i=0;i<profile.debrisCount;i++){const angle=random()*Math.PI*2,speed=1+random()*5;result.push({kind:'debris',x:0,y:.20,z:0,vx:Math.cos(angle)*speed,vy:2+random()*5,vz:Math.sin(angle)*speed,size:.5+random()*1.7,life:.8+random()*1.2});}
 return result;
}
