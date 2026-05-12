// HandTracker — MediaPipe wrapper + high-resolution camera acquisition +
// One-Euro landmark smoothing. Emits AppState.handsDetected per frame with
// smoothed landmarks so downstream gesture detection doesn't see jitter.

import { AppState } from './AppState.js';
import { CONFIG } from '../config.js';
import { HandSmoother } from './utils/OneEuroFilter.js';

// Try constraints in order of preference. First one that works wins.
const CAMERA_CANDIDATES = [
  { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 60 } },
  { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30 } },
  { width: { ideal: 1280 }, height: { ideal: 720 },  frameRate: { ideal: 60 } },
  { width: { ideal: 1280 }, height: { ideal: 720 },  frameRate: { ideal: 30 } },
  {}, // fallback: browser default
];

async function acquireStream(video) {
  for (const candidate of CAMERA_CANDIDATES) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', ...candidate },
        audio: false,
      });
      video.srcObject = stream;
      await new Promise(res => { video.onloadedmetadata = () => res(); });
      await video.play();
      const settings = stream.getVideoTracks()[0].getSettings();
      const resolution = {
        width: settings.width ?? video.videoWidth,
        height: settings.height ?? video.videoHeight,
        fps: settings.frameRate ?? null,
      };
      console.info('[camera] acquired', resolution, 'requested:', candidate);
      AppState.camera = AppState.camera || {};
      AppState.camera.actualResolution = resolution;
      return { stream, resolution };
    } catch (err) {
      console.debug('[camera] candidate failed', candidate, err?.name);
    }
  }
  throw new Error('No camera constraints worked');
}

export class HandTracker {
  constructor({ onReady, onError, complexity = 1 } = {}) {
    this.onReady = onReady;
    this.onError = onError;
    this.complexity = complexity;
    this.hands = null;
    this.camera = null;
    this.smoothers = {
      Left: new HandSmoother({ minCutoff: CONFIG.ONE_EURO_MIN_CUTOFF, beta: CONFIG.ONE_EURO_BETA }),
      Right: new HandSmoother({ minCutoff: CONFIG.ONE_EURO_MIN_CUTOFF, beta: CONFIG.ONE_EURO_BETA }),
    };
    this._lastSeen = { Left: 0, Right: 0 };
  }

  setSmoothingEnabled(on) {
    this.smoothers.Left.setEnabled(on);
    this.smoothers.Right.setEnabled(on);
  }

  setSmoothingParams({ minCutoff, beta }) {
    for (const s of [this.smoothers.Left, this.smoothers.Right]) {
      for (const f of s.filters) {
        if (minCutoff != null) f.minCutoff = minCutoff;
        if (beta != null) f.beta = beta;
      }
    }
  }

  async start() {
    if (!window.Hands || !window.Camera) {
      this.onError?.(new Error('MediaPipe failed to load'));
      return;
    }
    const video = AppState.dom.video;
    try {
      await acquireStream(video);
    } catch (err) {
      this.onError?.(err);
      return;
    }

    this.hands = new window.Hands({
      locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`,
    });
    this.hands.setOptions({
      maxNumHands: 2,
      modelComplexity: this.complexity,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
      selfieMode: false,
    });
    this.hands.onResults(r => this._onResults(r));

    this.camera = new window.Camera(video, {
      onFrame: async () => { await this.hands.send({ image: video }); },
      width: AppState.camera?.actualResolution?.width || 1280,
      height: AppState.camera?.actualResolution?.height || 720,
    });
    this.camera.start();
    this.onReady?.();
  }

  _onResults(res) {
    const tSec = performance.now() / 1000;
    const hands = [];
    const seenThisFrame = { Left: false, Right: false };

    if (res.multiHandLandmarks) {
      for (let i = 0; i < res.multiHandLandmarks.length; i++) {
        const lmRaw = res.multiHandLandmarks[i];
        const handednessRaw = res.multiHandedness?.[i]?.label || 'Right';
        const hand = AppState.mirror
          ? (handednessRaw === 'Left' ? 'Right' : 'Left')
          : handednessRaw;
        seenThisFrame[hand] = true;

        // One-Euro smoothing per-hand. If the hand disappeared and came back,
        // reset its filters so we don't interpolate from a stale position.
        const lastSeen = this._lastSeen[hand];
        if (lastSeen && (tSec - lastSeen) > 0.3) this.smoothers[hand].reset();
        this._lastSeen[hand] = tSec;

        const lm = this.smoothers[hand].smooth(lmRaw, tSec);
        hands.push({
          landmarks: lm,
          worldLandmarks: res.multiHandWorldLandmarks?.[i] || null,
          hand,
          score: res.multiHandedness?.[i]?.score || 0.5,
        });
      }
    }
    // reset filters for hands that disappeared this frame
    for (const k of ['Left', 'Right']) {
      if (!seenThisFrame[k]) this.smoothers[k].reset();
    }

    AppState.handsDetected = hands;
    AppState.lastHandsTs = performance.now();
  }
}
