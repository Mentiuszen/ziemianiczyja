import test from 'node:test';
import assert from 'node:assert/strict';
import {requestGamePointerLock} from '../src/input/input.js';

function withDocument(run) {
  const previous = globalThis.document;
  globalThis.document = new EventTarget();
  return Promise.resolve().then(run).finally(() => {
    if (previous === undefined) delete globalThis.document;
    else globalThis.document = previous;
  });
}

test('legacy void Pointer Lock API waits for the successful lock event', () => withDocument(async () => {
  const canvas = {requestPointerLock() {
    queueMicrotask(() => { document.pointerLockElement=canvas; document.dispatchEvent(new Event('pointerlockchange')); });
  }};
  await requestGamePointerLock(canvas, 100);
  assert.equal(document.pointerLockElement, canvas);
}));
test('Promise Pointer Lock API rejection is surfaced instead of entering gameplay', () => withDocument(async () => {
  const canvas = {requestPointerLock() { return Promise.reject(new Error('Permission denied')); }};
  await assert.rejects(requestGamePointerLock(canvas, 100), /Permission denied/);
}));
test('missing pointer lock completion times out and does not treat a resolved API promise as success', () => withDocument(async () => {
  const canvas = {requestPointerLock() { return Promise.resolve(); }};
  await assert.rejects(requestGamePointerLock(canvas, 10), /oczekiwania/);
}));
test('an existing lock does not issue a second request', () => withDocument(async () => {
  let calls=0; const canvas={requestPointerLock(){ calls++; }};
  document.pointerLockElement=canvas;
  await requestGamePointerLock(canvas, 100);
  assert.equal(calls, 0);
}));
