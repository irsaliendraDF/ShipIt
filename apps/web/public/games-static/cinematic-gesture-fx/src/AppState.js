// Single shared state container passed through the app.
import * as THREE from 'three';

export const AppState = {
  // DOM
  dom: {
    threeCanvas: null,
    debugCanvas: null,
    video: null,
    fpsEl: null,
    gestureEl: null,
    handsEl: null,
    helpEl: null,
    permEl: null,
  },

  // flags
  mirror: true,
  debugOverlay: false,
  helpVisible: false,
  paused: false,

  // camera / renderer
  scene: null,
  camera: null,
  renderer: null,
  composer: null,

  // hand tracking
  handsDetected: [],     // [{landmarks:[...], handedness:'Left'|'Right', world:[...], score:number}]
  lastHandsTs: 0,

  // gestures currently fired this frame (per hand) — filled by GestureDetector
  gesturesActive: [],    // [{name, hand, confidence, anchor, direction, extra}]

  // perf
  fps: 60,
  frameCount: 0,
  particleScale: 1.0,    // auto-lowered when slow

  // clock
  clock: new THREE.Clock(),
};
