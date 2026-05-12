// Quality tiers: preset bundles of performance-sensitive settings.
// Auto-detect: hardware concurrency + a 60-frame probe to estimate budget.
// User can override via SettingsPanel → General → Quality.

export const TIERS = {
  LOW: {
    id: 'LOW', name: 'Low',
    particleScale: 0.35,
    bloomStrength: 0.7,
    pixelRatioCap: 1,
    mediapipeComplexity: 0,
    captureFps: 30,
    maxMeasuredFps: 30,
  },
  MEDIUM: {
    id: 'MEDIUM', name: 'Medium',
    particleScale: 0.6,
    bloomStrength: 1.0,
    pixelRatioCap: 1.25,
    mediapipeComplexity: 1,
    captureFps: 30,
    maxMeasuredFps: 45,
  },
  HIGH: {
    id: 'HIGH', name: 'High',
    particleScale: 1.0,
    bloomStrength: 1.4,
    pixelRatioCap: 1.75,
    mediapipeComplexity: 1,
    captureFps: 60,
    maxMeasuredFps: 60,
  },
  ULTRA: {
    id: 'ULTRA', name: 'Ultra',
    particleScale: 1.3,
    bloomStrength: 1.65,
    pixelRatioCap: 2,
    mediapipeComplexity: 1,
    captureFps: 60,
    maxMeasuredFps: 60,
  },
};

// Rough auto-detect: cheap heuristic based on navigator.hardwareConcurrency.
// The 60-frame probe in main.js bumps this down if needed after initial run.
export function autoDetectTier() {
  const cores = navigator.hardwareConcurrency || 4;
  if (cores >= 12) return TIERS.ULTRA;
  if (cores >= 8)  return TIERS.HIGH;
  if (cores >= 4)  return TIERS.MEDIUM;
  return TIERS.LOW;
}

// Given a sustained FPS measurement, lower the tier one step if we're
// chronically below 40fps. Called from the main.js perf probe.
export function downshiftOnSlow(currentTier, measuredFps) {
  if (measuredFps >= 45) return currentTier;
  const order = ['LOW', 'MEDIUM', 'HIGH', 'ULTRA'];
  const idx = order.indexOf(currentTier.id);
  if (idx <= 0) return currentTier;
  return TIERS[order[idx - 1]];
}

export function applyTier(tier) {
  window.__perfScale = tier.particleScale;
  // other fields (bloomStrength, pixelRatioCap) are consumed by SceneManager
  // directly via getCurrentTier() below.
}

let _current = null;
export function setCurrentTier(tier) { _current = tier; applyTier(tier); }
export function getCurrentTier()    { return _current; }
