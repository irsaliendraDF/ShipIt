// GestureClassifier — runs each frame against all stored templates. For each
// visible hand, normalizes the live landmarks the same way the template was,
// computes a weighted distance to every template, converts to a confidence
// score, and reports matches over each template's threshold (with hysteresis).
//
// Match event shape (matches main.js gesture event format):
// { name: 'custom:<id>', hand, confidence, anchor, direction, custom: true }

import * as THREE from 'three';
import { normalizeLandmarks } from './normalize.js';
import { CONFIG } from '../../config.js';
import { AppState } from '../AppState.js';

function weightedDistance(a, b, weight) {
  let sum = 0, totalW = 0;
  for (let i = 0; i < 21; i++) {
    const dx = a[i*3+0] - b[i*3+0];
    const dy = a[i*3+1] - b[i*3+1];
    const dz = a[i*3+2] - b[i*3+2];
    const d = Math.hypot(dx, dy, dz);
    sum += d * weight[i];
    totalW += weight[i];
  }
  return sum / Math.max(1e-4, totalW);
}

// Distance → confidence: 0 distance = 1.0 conf, distance ≥ 0.7 = ~0
function distanceToConfidence(d) {
  return Math.max(0, 1 - d / 0.7);
}

export class GestureClassifier {
  constructor() {
    this.templates = [];
    this.stable = new Map(); // key = `${id}:${hand}` -> stableFrames
    this.testCallback = null; // set by trainer for live "match %" meter
  }

  setTemplates(templates) { this.templates = templates; }

  setTestCallback(cb) { this.testCallback = cb; }

  // Returns events for any templates whose match >= threshold and stable.
  detect(camera) {
    const hands = AppState.handsDetected;
    const events = [];
    if (!hands || hands.length === 0 || this.templates.length === 0) {
      this.stable.clear();
      return events;
    }
    const _v = camera; // unused but kept for API symmetry

    for (const h of hands) {
      const norm = normalizeLandmarks(h.landmarks);
      let bestPerTemplate = null;

      for (const tmpl of this.templates) {
        const d = weightedDistance(norm, tmpl.meanLandmarks, tmpl.weight);
        const conf = distanceToConfidence(d);
        const threshold = tmpl.binding?.confidence ?? CONFIG.CUSTOM_CONFIDENCE_DEFAULT;
        const handOk = !tmpl.binding?.hand || tmpl.binding.hand === 'Any' || tmpl.binding.hand === h.hand;

        // tell trainer about live match scores for the test meter
        if (this.testCallback) this.testCallback(tmpl.id, h.hand, conf);

        if (!handOk) continue;
        if (conf < threshold) {
          this.stable.set(`${tmpl.id}:${h.hand}`, 0);
          continue;
        }
        const k = `${tmpl.id}:${h.hand}`;
        const cur = (this.stable.get(k) ?? 0) + 1;
        this.stable.set(k, cur);
        if (cur < CONFIG.CUSTOM_MATCH_STABILITY) continue;

        if (!bestPerTemplate || conf > bestPerTemplate.confidence) {
          bestPerTemplate = {
            name: `custom:${tmpl.id}`,
            templateId: tmpl.id,
            templateName: tmpl.name,
            binding: tmpl.binding,
            hand: h.hand,
            confidence: conf,
            anchor: this._anchor(h, camera),
            direction: this._direction(h, camera),
            custom: true,
          };
        }
      }
      if (bestPerTemplate) events.push(bestPerTemplate);
    }
    return events;
  }

  _anchor(h, camera) {
    const lm = h.landmarks;
    const palm = { x: (lm[0].x + lm[5].x + lm[17].x)/3, y: (lm[0].y + lm[5].y + lm[17].y)/3 };
    const z = -2.0;
    const vFov = (camera.fov * Math.PI) / 180;
    const planeH = 2 * Math.tan(vFov/2) * Math.abs(z);
    const planeW = planeH * camera.aspect;
    let x = (palm.x - 0.5) * planeW;
    if (AppState.mirror) x = -x;
    const y = -(palm.y - 0.5) * planeH;
    return new THREE.Vector3(x, y, z);
  }
  _direction() { return new THREE.Vector3(0, 0, -1); }
}
