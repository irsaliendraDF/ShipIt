// Recorder — captures 30 normalized landmark snapshots over ~1 second from
// the currently visible primary hand, then computes mean + variance per coord
// and inverse-variance weights per landmark.
import { normalizeLandmarks } from './normalize.js';
import { AppState } from '../AppState.js';

export class Recorder {
  constructor({ frames = 30, durationMs = 1000 } = {}) {
    this.frames = frames;
    this.durationMs = durationMs;
    this.snapshots = [];
    this.active = false;
    this.startedAt = 0;
    this.handPreference = null; // 'Left' | 'Right' | null = first hand
  }

  start({ handPreference = null } = {}) {
    this.snapshots = [];
    this.active = true;
    this.startedAt = performance.now();
    this.handPreference = handPreference;
  }
  cancel() { this.active = false; this.snapshots = []; }

  // Call from main loop. Returns one of: 'collecting' | 'done' | 'idle'.
  tick() {
    if (!this.active) return 'idle';
    const elapsed = performance.now() - this.startedAt;
    const targetSamples = Math.min(this.frames, Math.ceil((elapsed / this.durationMs) * this.frames));
    while (this.snapshots.length < targetSamples) this._captureOne();
    if (elapsed >= this.durationMs && this.snapshots.length >= this.frames) {
      this.active = false;
      return 'done';
    }
    return 'collecting';
  }

  _captureOne() {
    const hands = AppState.handsDetected;
    if (!hands || hands.length === 0) return;
    let chosen = hands[0];
    if (this.handPreference) {
      const pref = hands.find(h => h.hand === this.handPreference);
      if (pref) chosen = pref;
    }
    this.snapshots.push({
      hand: chosen.hand,
      landmarks: normalizeLandmarks(chosen.landmarks),
    });
  }

  // After 'done': compute mean + variance + weights, return template body.
  finalize() {
    if (this.snapshots.length === 0) return null;
    const mean = new Float32Array(63);
    const variance = new Float32Array(63);
    const N = this.snapshots.length;
    for (const s of this.snapshots) {
      for (let i = 0; i < 63; i++) mean[i] += s.landmarks[i];
    }
    for (let i = 0; i < 63; i++) mean[i] /= N;
    for (const s of this.snapshots) {
      for (let i = 0; i < 63; i++) {
        const d = s.landmarks[i] - mean[i];
        variance[i] += d * d;
      }
    }
    for (let i = 0; i < 63; i++) variance[i] /= N;

    // per-landmark weight: 1 / (avg variance across x/y/z + epsilon)
    const weight = new Float32Array(21);
    for (let j = 0; j < 21; j++) {
      const v = (variance[j*3+0] + variance[j*3+1] + variance[j*3+2]) / 3;
      weight[j] = 1 / (v + 0.005);
    }
    // dominant hand
    const handCounts = { Left: 0, Right: 0 };
    for (const s of this.snapshots) handCounts[s.hand]++;
    const dominantHand = handCounts.Left > handCounts.Right ? 'Left' : 'Right';

    return { meanLandmarks: mean, variance, weight, dominantHand };
  }
}
