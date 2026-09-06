import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/core/simulation.js';
import {DIFFICULTIES} from '../src/data/weapons.js';
import {Health} from '../src/combat/health.js';
function fixture(id){return Object.assign(Object.create(Simulation.prototype),{difficultyId:id,difficulty:DIFFICULTIES[id],time:1,director:{phase:1},stats:{},events:[],nav:{releaseCover(){},cancel(){}},emit(){}});}
for(const [id,bullet,explosion,delay,rate] of [['recruit',.25,.55,3,25],['soldier',.35,.75,4,20],['veteran',.65,1,5,16]]){
 test(`${id}: single typed head reduction and explosion origin`,()=>{const w=fixture(id),p={id:'player',faction:'uk',pos:{x:0,y:0,z:0},health:new Health(),get hp(){return this.health.hp;}};w.damage(p,40,{id:'de',faction:'de',pos:{x:10,z:0}},{kind:'bullet',hitPart:'head'});assert.ok(Math.abs(p.hp-(100-40*bullet*1.25))<1e-8);p.health.hp=100;w.damage(p,40,{id:'de',faction:'de',pos:{x:10,z:0}},{kind:'explosion',origin:{x:-10,y:0,z:0}});assert.equal(p.hp,100-40*explosion);assert.equal(p.damageYaw,-Math.PI/2);});
 test(`${id}: configured regeneration respects remaining portion`,()=>{const h=new Health();assert.equal(typeof h.configure,'function');h.configure(DIFFICULTIES[id]);h.damage(80);assert.equal(h.delay,delay);h.tick(delay+.5);assert.equal(h.hp,20+rate*.5);h.hp=0;h.tick(20);assert.equal(h.hp,0);});
}
test('NPC head/limb and friendly fire unchanged',()=>{const w=fixture('soldier'),n={id:'n',faction:'de',hp:100,pos:{},suppression:0};w.damage(n,20,{id:'player',faction:'uk'},{kind:'bullet',hitPart:'head'});assert.equal(n.hp,68);w.damage(n,100,{id:'de',faction:'de'},{kind:'explosion'});assert.equal(n.hp,68);w.damage(n,20,{id:'ally',faction:'uk'},{kind:'bullet',hitPart:'limb'});assert.ok(Math.abs(n.hp-(68-20*.57*.72))<1e-8);});
