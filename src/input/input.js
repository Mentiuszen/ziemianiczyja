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

    window.addEventListener('keydown', event => {
      if (this.capture) {
        event.preventDefault();
        const capture = this.capture;
        this.capture = null;
        capture(event.code === 'Escape' ? null : event.code);
        return;
      }
      if (event.code === 'Escape') {
        if (this.enabled) this.callbacks.pause();
        return;
      }
      if (!this.enabled) return;
      if (event.code === 'F3') {
        event.preventDefault();
        if (!event.repeat) this.callbacks.debug();
        return;
      }
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
    canvas.addEventListener('contextmenu', event => event.preventDefault(), options);
    document.addEventListener('mousemove', event => {
      if (!this.enabled || document.pointerLockElement !== canvas) return;
      // Do not also accumulate pointermove deltas: those are the same physical motion.
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
    const failed = () => finish(new Error('Przeglądarka odmówiła blokady kursora.'));
    document.addEventListener('pointerlockchange', changed);
    document.addEventListener('pointerlockerror', failed);
    timer = setTimeout(() => finish(new Error('Przekroczono czas oczekiwania na blokadę kursora.')), timeoutMs);
    try {
      const result = canvas.requestPointerLock();
      if (result?.catch) result.catch(finish);
      changed();
    } catch (error) { finish(error); }
  });
}
