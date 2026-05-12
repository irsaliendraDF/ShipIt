// PresetManager — owns the active preset, cross-fades numeric CONFIG values
// over a transition window, and exposes structural flags (read-only snapshots
// used by effects at spawn-time).
//
// How the cross-fade works: at apply(), we snapshot the current CONFIG numeric
// values for every overridden key as `fromValues`, and the incoming preset
// values as `toValues`. Each frame we lerp and write back to CONFIG so that
// effects reading CONFIG.* see a smoothly-shifting value.
//
// Structural flags (portalStyle, laserStyle, crtShader, ...) swap instantly
// because they'd be expensive to morph — new effects spawned during the
// transition use the new flag values.

import { CONFIG } from '../../config.js';
import superhero from './superhero.js';
import energy from './energy.js';
import pixel from './pixel.js';
import arcane from './arcane.js';

const PRESETS = { superhero, energy, pixel, arcane };

// We interpolate hex colors as RGB components, then reassemble.
function lerp(a, b, t) { return a + (b - a) * t; }
function isColorKey(k, v) { return typeof v === 'number' && v >= 0 && v <= 0xffffff && /COLOR|COLOUR|TINT/i.test(k); }
function lerpColor(a, b, t) {
  const ar = (a >> 16) & 0xff, ag = (a >> 8) & 0xff, ab = a & 0xff;
  const br = (b >> 16) & 0xff, bg = (b >> 8) & 0xff, bb = b & 0xff;
  const r = Math.round(lerp(ar, br, t));
  const g = Math.round(lerp(ag, bg, t));
  const bl = Math.round(lerp(ab, bb, t));
  return (r << 16) | (g << 8) | bl;
}

class _PresetManager {
  constructor() {
    this.presets = { ...PRESETS };
    this.current = superhero;
    this.structural = { ...superhero.structural };
    this._transition = null;        // {from, to, t, dur, keys}
    this.listeners = [];
  }

  list() { return Object.values(this.presets); }
  get(id) { return this.presets[id]; }
  onChange(cb) { this.listeners.push(cb); }

  register(preset) { this.presets[preset.id] = preset; }

  // Apply a preset by id. During transitionMs, CONFIG numeric values lerp
  // from their current value toward the preset's override values. Structural
  // flags + PIXEL_* arrays swap instantly.
  apply(id, { transitionMs = 600 } = {}) {
    const next = this.presets[id];
    if (!next) { console.warn('unknown preset', id); return; }

    const keys = Object.keys(next.overrides);
    const from = {}, to = {};
    for (const k of keys) {
      from[k] = CONFIG[k];
      to[k] = next.overrides[k];
    }

    // Instant-swap for booleans and arrays (can't lerp them smoothly).
    for (const k of keys) {
      const v = to[k];
      if (typeof v === 'boolean' || Array.isArray(v)) {
        CONFIG[k] = v;
        delete from[k]; delete to[k];
      }
    }

    this._transition = { from, to, t: 0, dur: Math.max(16, transitionMs) };
    this.current = next;
    this.structural = { ...next.structural };

    try { localStorage.setItem('fx_preset', id); } catch {}

    for (const cb of this.listeners) cb(next);
  }

  update(dtMs) {
    if (!this._transition) return;
    const tr = this._transition;
    tr.t = Math.min(tr.dur, tr.t + dtMs);
    const u = tr.t / tr.dur;
    for (const k of Object.keys(tr.to)) {
      const a = tr.from[k], b = tr.to[k];
      if (isColorKey(k, b)) CONFIG[k] = lerpColor(a, b, u);
      else CONFIG[k] = lerp(a, b, u);
    }
    if (tr.t >= tr.dur) this._transition = null;
  }

  restoreFromStorage() {
    try {
      const id = localStorage.getItem('fx_preset');
      if (id && this.presets[id]) this.apply(id, { transitionMs: 0 });
    } catch {}
  }

  cycleNext() {
    const ids = Object.keys(this.presets);
    const i = ids.indexOf(this.current.id);
    const next = ids[(i + 1) % ids.length];
    this.apply(next);
    return this.presets[next];
  }
}

export const PresetManager = new _PresetManager();
