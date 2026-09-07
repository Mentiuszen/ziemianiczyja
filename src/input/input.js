import {LocalizedError} from '../i18n/index.js';
const EDGE_ACTIONS = ['crouch', 'prone', 'jump', 'interact', 'reload', 'grenade', 'melee', 'slot1', 'slot2'];

/** A single input owner. Pointer Events are authoritative, mouse events are a fallback.
 * In particular, pressing LMB while RMB is already down is a POINTERMOVE, not a
 * second pointerdown. Always read the buttons bitmask, never toggle from button.
 */
export class Input {
  constructor(canvas, settings, callbacks) {
    Object.assign(this, { canvas, settings, callbacks });
    this.down = new Set();
    this.edges = new Set();
    this.buttons = new Set();
    this.mx = this.my = this.wheel = 0;
    this.fireQueued = false;
    this.enabled = false;
    this.capture = null;
    this.abort = new AbortController();
    const options = { signal: this.abort.signal, capture: true };
    // Cancelling pointerdown can suppress compatibility mousemove in Firefox.
    // Never mix pointer buttons with a mouse-only motion owner.
    this.pointerMotion = typeof window.PointerEvent === 'function';

    window.addEventListener('keydown', event => {
      if (this.capture) {
        event.preventDefault();
        const capture = this.capture;
        this.capture = null;
        capture(event.code === 'Escape' ? null : event.code);
        return;
      }
      if (event.code === 'Escape') {
        event.preventDefault();
        if (this.enabled) this.callbacks.pause();else this.callbacks.escape?.();
        return;
      }
      if (!this.enabled) return;
      if (event.code === 'F3') {
        event.preventDefault();
        if (!event.repeat) this.callbacks.debug();
        return;
      }
      if (['F4','F6','F7'].includes(event.code)) { event.preventDefault();if(!event.repeat)this.callbacks.diagnostics?.(event.code);return; }
      if (Object.values(this.settings.keys).includes(event.code)) event.preventDefault();
      if (!this.down.has(event.code)) this.edges.add(event.code);
      this.down.add(event.code);
    }, options);
    window.addEventListener('keyup', event => this.down.delete(event.code), options);

    const syncButtons = event => {
      if (!this.enabled || document.pointerLockElement !== canvas) return;
      if (event.pointerType && event.pointerType !== 'mouse') return;
      if (!Number.isFinite(event.buttons)) return;
      const primaryWasDown = this.buttons.has(0);
      this.buttons.clear();
      if (event.buttons & 1) this.buttons.add(0);
      if (event.buttons & 2) this.buttons.add(2);
      if (event.buttons & 4) this.buttons.add(1);
      if (!primaryWasDown && this.buttons.has(0)) this.fireQueued = true;
      if (event.cancelable && !event.type.endsWith('move')) event.preventDefault();
    };
    for (const type of ['pointerdown', 'pointermove', 'pointerup', 'mousedown', 'mouseup']) {
      document.addEventListener(type, syncButtons, options);
    }
    // Canvas fallback also permits independent Input tests and older integrations.
    canvas.addEventListener('mousedown', event => {
      if (Number.isFinite(event.buttons)) return syncButtons(event);
      if (!this.enabled || document.pointerLockElement !== canvas) return;
      if (event.button === 0 && !this.buttons.has(0)) this.fireQueued = true;
      this.buttons.add(event.button);
      event.preventDefault();
    }, options);
    window.addEventListener('mouseup', event => {
      if (Number.isFinite(event.buttons)) syncButtons(event);
      else this.buttons.delete(event.button);
    }, options);
    document.addEventListener('pointercancel', () => this.clear(), options);
    document.addEventListener('contextmenu', event => {
      if (document.pointerLockElement === canvas || event.target === canvas) event.preventDefault();
    }, options);
    document.addEventListener(this.pointerMotion ? 'pointermove' : 'mousemove', event => {
      if (!this.enabled || document.pointerLockElement !== canvas) return;
      if (event.pointerType && event.pointerType !== 'mouse') return;
      // Exactly one motion stream: compatibility mouse events are never added twice.
      const sensitivity = .0018 * this.settings.sensitivity;
      this.mx += (event.movementX || 0) * sensitivity;
      this.my += (event.movementY || 0) * sensitivity;
      syncButtons(event);
    }, options);
    canvas.addEventListener('wheel', event => {
      if (this.enabled && document.pointerLockElement === canvas) {
        event.preventDefault();
        this.wheel = event.deltaY;
      }
    }, { ...options, passive: false });
    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement !== canvas) {
        this.clear();
        if (this.enabled) this.callbacks.pause();
      }
    }, options);
    document.addEventListener('pointerlockerror', () => this.callbacks.lockError(), options);
    window.addEventListener('blur', () => {
      this.clear();
      if (this.enabled) this.callbacks.pause();
    }, options);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.clear();
        if (this.enabled) this.callbacks.pause();
      }
    }, options);
  }

  clear() {
    this.down.clear(); this.edges.clear(); this.buttons.clear();
    this.mx = this.my = this.wheel = 0;
    this.fireQueued = false;
  }
  setActive(active) { this.clear(); this.enabled = active; }
  peekLook() { return {lookX:this.mx,lookY:this.my}; }
  consume() {
    const state = {}, keys = this.settings.keys;
    for (const action of ['forward', 'back', 'left', 'right', 'sprint']) state[action] = this.down.has(keys[action]);
    for (const action of EDGE_ACTIONS) state[action] = this.edges.has(keys[action]);
    if (state.slot1) state.slot = 0;
    if (state.slot2) state.slot = 1;
    state.fireHeld = this.buttons.has(0);
    state.fire = state.fireHeld || this.fireQueued;
    state.aim = this.buttons.has(2);
    state.lookX = this.mx; state.lookY = this.my; state.wheel = this.wheel;
    this.fireQueued = false;
    this.mx = this.my = this.wheel = 0;
    this.edges.clear();
    return state;
  }
  held() {
    const state = this.consume();
    state.lookX = state.lookY = state.wheel = 0;
    for (const action of EDGE_ACTIONS) state[action] = false;
    delete state.slot;
    return state;
  }
  dispose() { this.abort.abort(); this.capture = null; this.clear(); }
}

/** Promise and pre-Promise Pointer Lock implementations both finish via the event.
 * Must be called synchronously inside the user's activation handler.
 */
export function requestGamePointerLock(canvas, timeoutMs = 2500) {
  if (document.pointerLockElement === canvas) return Promise.resolve();
  return new Promise((resolve, reject) => {
    let timer;
    const finish = error => {
      clearTimeout(timer);
      document.removeEventListener('pointerlockchange', changed);
      document.removeEventListener('pointerlockerror', failed);
      error ? reject(error) : resolve();
    };
    const changed = () => { if (document.pointerLockElement === canvas) finish(); };
    const failed = () => finish(new LocalizedError('error.lockDenied'));
    document.addEventListener('pointerlockchange', changed);
    document.addEventListener('pointerlockerror', failed);
    timer = setTimeout(() => finish(new LocalizedError('error.lockTimeout')), timeoutMs);
    try {
      const result = canvas.requestPointerLock();
      if (result?.catch) result.catch(finish);
      changed();
    } catch (error) { finish(error); }
  });
}
