import test from 'node:test';import assert from 'node:assert/strict';
import {sampleClipFrame} from '../src/render/animation-sampling.js';
test('imported 60 FPS animation uses seconds, not hardcoded 24 FPS',()=>{assert.equal(sampleClipFrame({from:0,to:120,fps:60},1),60);assert.equal(sampleClipFrame({from:0,to:48,fps:24},1),24);});
test('loop wraps but death/action clips clamp to final frame',()=>{assert.equal(sampleClipFrame({from:10,to:70,fps:60},1.5),40);assert.equal(sampleClipFrame({from:10,to:70,fps:60},1.5,{loop:false}),70);assert.equal(sampleClipFrame({from:10,to:70,fps:60},-1,{loop:false}),10);});
test('degenerate clip is stable and fixed duration overrides import rate',()=>{assert.equal(sampleClipFrame({from:2,to:2,fps:60},9),2);assert.equal(sampleClipFrame({from:0,to:24,fps:60},.6,{loop:false,duration:1.2}),12);});
