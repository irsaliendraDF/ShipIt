// ComboEngine — tracks a rolling buffer of recent gesture events and matches
// ordered gesture sequences against it. On match, consumes those events so
// they can't be reused for another combo.
//
// Usage from main.js:
//   const combo = comboEngine.push(event);
//   if (combo) { fireCombo(combo.def, combo.events); cancelHeld(event); }
//   else       { handleGesture(event); }
//
// "Consume" means removing events from the buffer. The HUD reads the buffer
// directly so consumed events disappear from the chain strip immediately,
// replaced by the combo-name animation.

import { CONFIG } from '../config.js';

// Combo definitions. Each step in `sequence` is { name, sameHand?, hand? }.
// `sameHand: true` means "must be the same hand as the previous step".
// `hand: 'Left'|'Right'` means "must be exactly this hand".
// `requireAlternatingHands: true` means every adjacent pair must be different hands.
export const COMBO_DEFS = [
  {
    name: 'RepulsorBarrage',
    sequence: [
      { name: 'OpenPalmForward' },
      { name: 'OpenPalmForward', sameHand: true },
      { name: 'OpenPalmForward', sameHand: true },
    ],
    window: 1200,
    cooldown: 2000,
  },
  {
    name: 'PortalPunch',
    sequence: [
      { name: 'PinchAndPull' },
      { name: 'Fist', sameHand: true },
    ],
    window: 800,
    cooldown: 1200,
  },
  {
    name: 'WebZip',
    sequence: [
      { name: 'WebShooter' },
      { name: 'SwipeHorizontal', sameHand: true },
    ],
    window: 600,
    cooldown: 1000,
  },
  {
    name: 'StrangeSanctum',
    sequence: [
      { name: 'PinchAndPull' },
      { name: 'PinchAndPull' },
    ],
    window: 500,
    cooldown: 2000,
    requireAlternatingHands: true,
  },
  {
    name: 'Unibeam',
    sequence: [
      { name: 'ChargeUp' },       // held ≥1.5s (confidence gate in detector via extra.charge)
      { name: 'DoubleOpenPalms' },// the "snap outward" — hands become palms-forward after charging
    ],
    window: 1500,
    cooldown: 2500,
    requireChargeComplete: true, // custom flag: first step must have extra.charge >= 0.95
  },
  {
    name: 'JarvisBoot',
    sequence: [
      { name: 'TwoHandsFramingBox' },
      { name: 'DoubleOpenPalms' },
    ],
    window: 1000,
    cooldown: 2500,
  },
  {
    name: 'Cataclysm',
    sequence: [
      { name: 'ShieldPose' },
      { name: 'CrossedArms' },
    ],
    window: 2000,
    cooldown: 3500,
  },
];

export class ComboEngine {
  constructor() {
    this.buffer = [];                 // {name, hand, time, anchor, extra, consumed}
    this.lastFired = new Map();       // comboName -> timestamp
    this.session = { combosFired: 0, longestChain: 0, bestCombo: null };
    this.listeners = { fire: [] };    // fire listeners notified on combo fire
  }

  onFire(cb) { this.listeners.fire.push(cb); }

  // Push a new gesture event. Returns a matching combo descriptor if one
  // completes, else null. Expires old events silently (older than COMBO_BUFFER_MS).
  push(evt) {
    const now = performance.now();
    const entry = { ...evt, time: now, consumed: false };
    this.buffer.push(entry);

    // age out old
    this.buffer = this.buffer.filter(e => now - e.time < CONFIG.COMBO_BUFFER_MS);

    // try all combos — prefer longer sequences, then more recent
    let best = null;
    for (const def of COMBO_DEFS) {
      const match = this._match(def, now);
      if (!match) continue;
      const cd = this.lastFired.get(def.name) ?? 0;
      if (now - cd < def.cooldown) continue;
      // prefer combos with more steps so Cataclysm beats a shorter sub-match
      if (!best || def.sequence.length > best.def.sequence.length) {
        best = { def, match };
      }
    }
    if (!best) return null;

    // consume matched events
    for (const e of best.match.events) e.consumed = true;
    this.buffer = this.buffer.filter(e => !e.consumed);
    this.lastFired.set(best.def.name, now);

    // session stats
    this.session.combosFired++;
    this.session.longestChain = Math.max(this.session.longestChain, best.match.events.length);
    this.session.bestCombo = best.def.name;

    for (const cb of this.listeners.fire) cb(best.def, best.match.events);

    return { def: best.def, events: best.match.events, anchor: evt.anchor };
  }

  // Are we one gesture away from completing any combo? Used to show gold hints.
  getNearMatches() {
    if (!CONFIG.COMBO_SHOW_HINTS) return [];
    const now = performance.now();
    const out = [];
    for (const def of COMBO_DEFS) {
      // skip on cooldown
      const cd = this.lastFired.get(def.name) ?? 0;
      if (now - cd < def.cooldown) continue;
      // try to match sequence[0..-2] against buffer
      const partial = { ...def, sequence: def.sequence.slice(0, -1) };
      if (partial.sequence.length === 0) continue;
      if (this._match(partial, now)) {
        out.push({ name: def.name, nextStep: def.sequence[def.sequence.length - 1].name });
      }
    }
    return out;
  }

  getBuffer() { return this.buffer.slice(); }
  getSession() { return { ...this.session }; }

  _match(def, now) {
    const seq = def.sequence;
    if (this.buffer.length < seq.length) return null;
    // align to LAST seq.length entries in buffer (consumed filter already ran)
    const start = this.buffer.length - seq.length;
    const slice = this.buffer.slice(start);
    // time window check
    if (now - slice[0].time > def.window) return null;

    // step-by-step match
    for (let i = 0; i < seq.length; i++) {
      const step = seq[i];
      const ev = slice[i];
      if (ev.consumed) return null;
      if (step.name !== ev.name) return null;
      if (step.hand && ev.hand !== step.hand) return null;
      if (step.sameHand && i > 0 && slice[i - 1].hand !== ev.hand) return null;
    }
    if (def.requireAlternatingHands) {
      for (let i = 1; i < slice.length; i++) {
        if (slice[i].hand === slice[i - 1].hand) return null;
      }
    }
    if (def.requireChargeComplete) {
      const c = slice[0].extra?.charge ?? 0;
      if (c < 0.95) return null;
    }
    return { events: slice };
  }
}
