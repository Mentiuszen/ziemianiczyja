/** Repeatable CPU-only workload. No claimed GPU/frame-pacing result. */
import {pathToFileURL} from 'node:url';import {resolve} from 'node:path';import {writeFile} from 'node:fs/promises';
const root=process.argv[2]||new URL('../',import.meta.url).pathname,out=process.argv[3];
const {Simulation}=await import(pathToFileURL(resolve(root,'src/core/simulation.js')));
const summary=values=>{const s=[...values].sort((a,b)=>a-b);const p=q=>s[Math.ceil(s.length*q)-1];return{n:s.length,avg:s.reduce((a,b)=>a+b,0)/s.length,p95:p(.95),p99:p(.99),max:s.at(-1)};};
const runs=[];
for(let run=0;run<3;run++){
 const world=new Simulation(null,'recruit',112017),frames=[],nav=[],paths=[];
 for(let step=0;step<900&&world.player.hp>0;step++){
  const previous=world.nav.metrics?.pathMs||0,start=performance.now();
  world.tick(1/60,{interact:step===0,forward:step>60&&step<600});const elapsed=performance.now()-start;
  frames.push(elapsed);nav.push((world.nav.metrics?.pathMs||0)-previous);world.consumeEvents();
 }
 // Real map paths, alternating cached and long routes, no artificial blocker removal.
 const endpoints=[{x:23,y:0,z:62},{x:36,y:0,z:113},{x:4,y:0,z:160},{x:33,y:0,z:-6}];
 for(let i=0;i<60;i++){const start=performance.now(),route=world.nav.path(endpoints[i%4],endpoints[(i+1)%4]);paths.push({ms:performance.now()-start,n:route.length,first:route[0],last:route.at(-1)});}
 runs.push({frames:summary(frames),nav:summary(nav.filter(x=>x>0)),paths:summary(paths.map(x=>x.ms)),raw:{frames,nav,paths},state:{time:world.time,hp:world.player.hp,stats:world.stats}});
}
const report={kind:'Node CPU workload; not a physical GPU or browser benchmark',node:process.version,root,runs};
if(out)await writeFile(out,JSON.stringify(report,null,2));console.log(JSON.stringify({...report,runs:runs.map(({raw,...r})=>r)},null,2));
