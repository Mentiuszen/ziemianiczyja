import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/core/simulation.js';
import {setLanguage} from '../src/i18n/index.js';
import {soldierSnapshot} from '../src/ai/soldier.js';
const state=w=>structuredClone({time:w.time,player:w.player.snapshot(),npcs:w.npcs.map(soldierSnapshot),tanks:w.tanks,fieldGuns:w.fieldGuns,air:w.air,director:w.director.snapshot(),grenades:w.grenades,shells:w.shells,stats:w.stats});
for(const difficulty of ['recruit','soldier','veteran'])test(`language does not change ${difficulty} simulation over 10 seconds`,()=>{
 const pl=new Simulation(null,difficulty,23),en=new Simulation(null,difficulty,23);pl.director.skipBriefing(pl);en.director.skipBriefing(en);
 for(let step=0;step<600;step++){
  setLanguage('pl');pl.tick(1/60,{});pl.consumeEvents();setLanguage('en');en.tick(1/60,{});en.consumeEvents();
 }
 assert.deepEqual(state(pl),state(en));setLanguage('pl');
});
