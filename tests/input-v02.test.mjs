import test from 'node:test';
import assert from 'node:assert/strict';
import {Input} from '../src/input/input.js';
function setup(){
 globalThis.window=new EventTarget(); globalThis.document=new EventTarget();
 const canvas=new EventTarget();document.pointerLockElement=canvas;
 let pauses=0;const input=new Input(canvas,{keys:{forward:'KeyW',reload:'KeyR'},sensitivity:1},{pause(){pauses++;input.setActive(false);},debug(){},lockError(){}});input.setActive(true);
 const emit=(type,props={},target=document)=>{const e=new Event(type,{cancelable:true});Object.assign(e,props);target.dispatchEvent(e);return e;};
 return {input,emit,canvas,pauses:()=>pauses,close(){input.dispose();delete globalThis.document;delete globalThis.window;}};
}
test('Pointer Events fire even when engine suppresses compatibility mousedown',()=>{const s=setup();try{s.emit('pointerdown',{button:0,buttons:1,pointerType:'mouse'});s.emit('pointerup',{button:0,buttons:0,pointerType:'mouse'});assert.equal(s.input.consume().fire,true);assert.equal(s.input.consume().fire,false);}finally{s.close();}});
test('PPM then LPM uses chorded pointermove buttons mask, including release',()=>{const s=setup();try{s.emit('pointerdown',{button:2,buttons:2,pointerType:'mouse'});assert.equal(s.input.consume().aim,true);s.emit('pointermove',{button:0,buttons:3,pointerType:'mouse'});const both=s.input.consume();assert.equal(both.aim,true);assert.equal(both.fire,true);s.emit('pointermove',{button:0,buttons:2,pointerType:'mouse'});assert.equal(s.input.consume().fire,false);assert.equal(s.input.consume().aim,true);s.emit('pointerup',{button:2,buttons:0,pointerType:'mouse'});assert.equal(s.input.consume().aim,false);}finally{s.close();}});
test('compatibility mouse event does not enqueue a second shot',()=>{const s=setup();try{s.emit('pointerdown',{button:0,buttons:1});s.emit('mousedown',{button:0,buttons:1});assert.equal(s.input.consume().fire,true);s.emit('pointerup',{button:0,buttons:0});s.emit('mouseup',{button:0,buttons:0});assert.equal(s.input.consume().fire,false);}finally{s.close();}});
test('inactive or unlocked canvas does not arm a weapon',()=>{const s=setup();try{s.input.setActive(false);s.emit('pointerdown',{button:0,buttons:1});s.input.setActive(true);assert.equal(s.input.consume().fire,false);document.pointerLockElement=null;s.emit('pointerdown',{button:0,buttons:1});assert.equal(s.input.consume().fire,false);}finally{s.close();}});
test('pause and focus loss clear held buttons and queued shot',()=>{const s=setup();try{s.emit('pointerdown',{button:0,buttons:3});s.emit('blur',{},window);assert.equal(s.pauses(),1);s.input.setActive(true);const state=s.input.consume();assert.equal(state.fire,false);assert.equal(state.aim,false);}finally{s.close();}});
test('pointercancel clears state without leaving aim or fire held',()=>{const s=setup();try{s.emit('pointerdown',{button:0,buttons:3});s.emit('pointercancel',{buttons:0});const state=s.input.consume();assert.equal(state.fire,false);assert.equal(state.aim,false);}finally{s.close();}});
