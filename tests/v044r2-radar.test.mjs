import test from 'node:test';import assert from 'node:assert/strict';
import {TacticalContacts} from '../src/ui/hud/tactical-contacts.js';
const context={sessionId:1,playerFaction:'uk',playerPos:{x:0,y:0,z:0},difficultyId:'soldier'};
test('R2 round radar records shots within radius 60, not invisible square corners',()=>{
 const c=new TacticalContacts({sessionId:1});
 const shot=(x,z)=>({owner:'e',faction:'de',pos:{x,y:1,z},time:1});
 assert.equal(c.recordShot(shot(59,59),context),false);
 assert.equal(c.recordShot(shot(60,0),context),true);
});
