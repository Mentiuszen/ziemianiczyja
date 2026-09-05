import test from 'node:test';
import assert from 'node:assert/strict';
import {Input} from '../src/input/input.js';
function setup(pointer=true){
 globalThis.window=new EventTarget();globalThis.document=new EventTarget();
 if(pointer)window.PointerEvent=function PointerEvent(){};
 const canvas=new EventTarget();document.pointerLockElement=canvas;
 const input=new Input(canvas,{keys:{forward:'KeyW'},sensitivity:1},{pause(){input.setActive(false);},debug(){},lockError(){}});input.setActive(true);
 const emit=(type,props={})=>{const e=new Event(type,{cancelable:true});Object.assign(e,props);document.dispatchEvent(e);};
 return{input,emit,close(){input.dispose();delete globalThis.document;delete globalThis.window;}};
}
test('Firefox-compatible path: pointermove rotates while RMB suppresses compatibility mousemove',()=>{const s=setup();try{s.emit('pointerdown',{button:2,buttons:2,pointerType:'mouse'});s.emit('pointermove',{buttons:2,movementX:100,movementY:-30,pointerType:'mouse'});const i=s.input.consume();assert.equal(i.aim,true);assert.ok(i.lookX>.17);assert.ok(i.lookY<-.05);}finally{s.close();}});
test('pointer motion and compatibility motion must not double camera delta',()=>{const s=setup();try{s.emit('pointermove',{buttons:0,movementX:50,movementY:0,pointerType:'mouse'});s.emit('mousemove',{buttons:0,movementX:50,movementY:0});assert.ok(Math.abs(s.input.consume().lookX-.09)<1e-9);}finally{s.close();}});
test('chorded buttons retain look with both buttons then only RMB',()=>{const s=setup();try{s.emit('pointerdown',{button:2,buttons:2,pointerType:'mouse'});s.emit('pointermove',{button:0,buttons:3,movementX:20,movementY:4,pointerType:'mouse'});let i=s.input.consume();assert.ok(i.fire&&i.aim&&i.lookX>0);s.emit('pointermove',{button:0,buttons:2,movementX:-20,movementY:0,pointerType:'mouse'});i=s.input.consume();assert.ok(!i.fire&&i.aim&&i.lookX<0);s.input.setActive(false);s.input.setActive(true);i=s.input.consume();assert.equal(i.lookX,0);assert.equal(i.aim,false);}finally{s.close();}});
test('mouse-only fallback is still supported',()=>{const s=setup(false);try{s.emit('mousedown',{buttons:2,button:2});s.emit('mousemove',{buttons:2,movementX:50,movementY:0});const i=s.input.consume();assert.equal(i.aim,true);assert.ok(Math.abs(i.lookX-.09)<1e-9);}finally{s.close();}});
