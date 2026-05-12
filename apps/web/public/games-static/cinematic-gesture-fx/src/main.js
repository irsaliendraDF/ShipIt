// main.js — bootstrap + gesture/effect routing + combo engine + custom gestures
// + presets + UI panels + render loop.

import * as THREE from 'three';
import { AppState } from './AppState.js';
import { CONFIG } from '../config.js';
import { SceneManager } from './SceneManager.js';
import { HandTracker } from './HandTracker.js';
import { GestureDetector } from './GestureDetector.js';
import { DebugOverlay } from './DebugOverlay.js';
import { ComboEngine } from './ComboEngine.js';
import { ComboHUD } from './ComboHUD.js';
import { AudioBus } from './audio/AudioBus.js';

// quality
import { autoDetectTier, downshiftOnSlow, setCurrentTier, getCurrentTier } from './config/quality.js';

// preset system
import { PresetManager } from './presets/PresetManager.js';

// registries
import { EffectRegistry } from './fx/EffectRegistry.js';
import { BindingRegistry } from './gestures/BindingRegistry.js';

// trainer
import { GestureClassifier } from './trainer/GestureClassifier.js';
import { TemplateStore } from './trainer/TemplateStore.js';
import { TrainerPanel } from './ui/TrainerPanel.js';
import { Recorder } from './trainer/Recorder.js';
import { SettingsPanel } from './ui/SettingsPanel.js';

// effects
import { IronManRepulsor } from './effects/IronManRepulsor.js';
import { DrStrangePortal } from './effects/DrStrangePortal.js';
import { Laser } from './effects/Laser.js';
import { JarvisHUD } from './effects/JarvisHUD.js';
import { Shockwave } from './effects/Shockwave.js';
import { SpiderWeb } from './effects/SpiderWeb.js';
import { LightBeam } from './effects/LightBeam.js';
import { SwipeSlash } from './effects/SwipeSlash.js';
import { HoloOrb } from './effects/HoloOrb.js';
import { FistBurst } from './effects/FistBurst.js';
import { Shield } from './effects/twohand/Shield.js';
import { Whip } from './effects/twohand/Whip.js';
import { ChargeOrb } from './effects/twohand/ChargeOrb.js';
import { DoubleLaser } from './effects/twohand/DoubleLaser.js';
import { Pillar } from './effects/twohand/Pillar.js';
import { RealityWarp } from './effects/twohand/RealityWarp.js';
import { EnergyBall } from './effects/EnergyBall.js';
import { PixelTrail } from './effects/PixelTrail.js';
import { PalmAnchors } from './effects/PalmAnchors.js';

// combos
import { RepulsorBarrage } from './effects/combos/RepulsorBarrage.js';
import { PortalPunch } from './effects/combos/PortalPunch.js';
import { WebZip } from './effects/combos/WebZip.js';
import { StrangeSanctum } from './effects/combos/StrangeSanctum.js';
import { Unibeam } from './effects/combos/Unibeam.js';
import { JarvisBoot } from './effects/combos/JarvisBoot.js';
import { Cataclysm } from './effects/combos/Cataclysm.js';

window.__perfScale = 1.0;
window.AppState = AppState; // expose for SettingsPanel quick reads

// --- DOM refs ---
AppState.dom.threeCanvas = document.getElementById('three-canvas');
AppState.dom.debugCanvas = document.getElementById('debug-canvas');
AppState.dom.video       = document.getElementById('video');
AppState.dom.fpsEl       = document.getElementById('fps');
AppState.dom.gestureEl   = document.getElementById('gesture');
AppState.dom.handsEl     = document.getElementById('hands');
AppState.dom.helpEl      = document.getElementById('help');
AppState.dom.permEl      = document.getElementById('perm');

// --- quality bootstrap ---
const initialTier = autoDetectTier();
setCurrentTier(initialTier);
console.info('[quality] auto-detected tier:', initialTier.id);

// --- core ---
const sceneMgr = new SceneManager();
sceneMgr.init();

// hook PresetManager structural flags into SceneManager
PresetManager.onChange((preset) => {
  sceneMgr.setScanlines(preset.structural?.scanlines === true,
                        preset.structural?.scanlines ? 0.35 : 0,
                        preset.structural?.crtShader ? 0.06 : 0);
});
PresetManager.restoreFromStorage(); // applies persisted preset, fires onChange

const detector = new GestureDetector();
const comboEngine = new ComboEngine();
const classifier = new GestureClassifier();
const pixelTrail = new PixelTrail(sceneMgr);
const palmAnchors = new PalmAnchors(sceneMgr);
const debug = new DebugOverlay(comboEngine);
const comboHUD = new ComboHUD(comboEngine);

// --- effect registry / id → constructor ---
const EFFECTS = {
  repulsor: IronManRepulsor, portal: DrStrangePortal, laser: Laser,
  jarvis: JarvisHUD, shockwave: Shockwave, spiderweb: SpiderWeb,
  lightbeam: LightBeam, swipeslash: SwipeSlash, holoorb: HoloOrb,
  fistburst: FistBurst,
  shield: Shield, whip: Whip, chargeorb: ChargeOrb,
  doublelaser: DoubleLaser, pillar: Pillar, realitywarp: RealityWarp,
  energyball: EnergyBall,
};
for (const [id, ctor] of Object.entries(EFFECTS)) {
  EffectRegistry.register({ id, name: id, ctor });
}

// default bindings — built-in gesture name → effect id
// Lasers (PointIndex, DoublePoint) intentionally unbound per user request.
const DEFAULT_BINDINGS = {
  OpenPalmForward:    { effect: 'repulsor',     held: true,  hand: 'Any' },
  TwoHandsFramingBox: { effect: 'jarvis',       held: true,  hand: 'Both' },
  HoldOpenPalmUp:     { effect: 'holoorb',      held: true,  hand: 'Any' },
  DoubleOpenPalms:    { effect: 'lightbeam',    held: true,  hand: 'Both' },
  ShieldPose:         { effect: 'shield',       held: true,  hand: 'Both' },
  WhipPose:           { effect: 'whip',         held: true,  hand: 'Both' },
  ChargeUp:           { effect: 'chargeorb',    held: true,  hand: 'Both' },
  PrayerHands:        { effect: 'pillar',       held: true,  hand: 'Both' },
  CupHands:           { effect: 'energyball',   held: true,  hand: 'Both' },
  // one-shots
  FistToOpen:           { effect: 'fistburst',  held: false, hand: 'Any' },
  ClapOrHandsTogether:  { effect: 'shockwave',  held: false, hand: 'Both' },
  PinchAndPull:         { effect: 'portal',     held: false, hand: 'Any' },
  WebShooter:           { effect: 'spiderweb',  held: false, hand: 'Any' },
  SwipeHorizontal:      { effect: 'swipeslash', held: false, hand: 'Any' },
  CrossedArms:          { effect: 'realitywarp',held: false, hand: 'Both' },
};
for (const [g, b] of Object.entries(DEFAULT_BINDINGS)) {
  BindingRegistry.set(g, b.effect, { hand: b.hand });
}

// --- held-effect cache ---
const heldEffects = new Map();
const heldKey = (name, hand) => `${name}:${hand}`;
function spawnOrReuse(ctor, key, params) {
  let eff = heldEffects.get(key);
  if (!eff || eff.done) {
    eff = new ctor(sceneMgr);
    heldEffects.set(key, eff);
    sceneMgr.addEffect(eff);
  }
  eff.trigger(params);
  return eff;
}

// One held effect per hand at a time — critically reduces visual clutter.
// Rule: only ONE held effect per hand, AND if a per-hand gesture fires it
// kills any 'Both' gesture (and vice-versa), because you can't meaningfully
// be casting a shield and a repulsor at the same time.
const activeHeldPerHand = new Map(); // hand ('Left'|'Right'|'Both') → effectId
function _killHeld(hand) {
  const id = activeHeldPerHand.get(hand);
  if (!id) return;
  const e = heldEffects.get(heldKey(id, hand));
  if (e && !e.done) e.done = true;
  activeHeldPerHand.delete(hand);
}
function switchHeldOnHand(hand, newEffectId) {
  const prevEffectId = activeHeldPerHand.get(hand);
  if (prevEffectId && prevEffectId !== newEffectId) {
    const prev = heldEffects.get(heldKey(prevEffectId, hand));
    if (prev && !prev.done) prev.done = true;
  }
  activeHeldPerHand.set(hand, newEffectId);
  // transitioning per-hand ↔ two-hand: wipe the other side
  if (hand !== 'Both') {
    _killHeld('Both');
  } else {
    _killHeld('Left'); _killHeld('Right');
  }
}

// One-shot effects with custom param shapes that don't match the generic `g`
function fireOneShotByEffect(effectId, g) {
  if (effectId === 'shockwave') {
    const e = new Shockwave(sceneMgr);
    e.trigger({ anchor: g.anchor, maxRadius: CONFIG.SHOCKWAVE_MAX_RADIUS * 1.3, life: 1.1, color: 0xfff2d1 });
    sceneMgr.addEffect(e); sceneMgr.punch(1.2);
    return;
  }
  if (effectId === 'portal') {
    const e = new DrStrangePortal(sceneMgr);
    e.trigger({ anchor: g.anchor, radius: g.extra?.radius || 1.2 });
    sceneMgr.addEffect(e);
    return;
  }
  if (effectId === 'realitywarp') {
    const e = new RealityWarp(sceneMgr);
    e.trigger({ anchor: g.anchor, scale: 3.0, life: 1.0 });
    sceneMgr.addEffect(e);
    return;
  }
  // generic one-shot
  const Ctor = EFFECTS[effectId];
  if (!Ctor) return;
  const e = new Ctor(sceneMgr); e.trigger(g); sceneMgr.addEffect(e);
}

function handleGesture(g) {
  const def = DEFAULT_BINDINGS[g.name];
  // resolve binding (custom gestures override via classifier with custom: true)
  const effectId = g.custom
    ? g.binding?.effectId
    : (def?.effect ?? null);
  if (!effectId) return;

  if (def?.held) {
    switchHeldOnHand(g.hand, effectId);
    spawnOrReuse(EFFECTS[effectId], heldKey(effectId, g.hand), g);
  } else {
    fireOneShotByEffect(effectId, g);
  }
  // Fist is special: feeds combos only, no effect
  if (g.name === 'Fist') return;

  AudioBus.play('gesture.' + g.name.toLowerCase());
}

// --- combo finishers ---
const COMBO_EFFECT_MAP = {
  RepulsorBarrage, PortalPunch, WebZip, StrangeSanctum, Unibeam, JarvisBoot, Cataclysm,
};
function fireCombo(def, events) {
  const Ctor = COMBO_EFFECT_MAP[def.name];
  if (!Ctor) return;
  const e = new Ctor(sceneMgr);
  e.trigger({ events });
  sceneMgr.addEffect(e);
  AudioBus.play('combo.' + def.name.toLowerCase());
}
function cancelHeldForEvent(ev) {
  for (const [k, e] of heldEffects.entries()) {
    if (k.includes(`:${ev.hand}`) || k.includes(':Both')) {
      if (e && !e.done) e.done = true;
    }
  }
}

const lastFiringAt = new Map();
function isNewFiring(ev, now) {
  const k = `${ev.name}:${ev.hand}`;
  const t = lastFiringAt.get(k) ?? 0;
  lastFiringAt.set(k, now);
  return now - t > CONFIG.NEW_FIRING_GAP_MS;
}

// --- manual triggers 1-9 ---
function manualTrigger(n) {
  const anchor = new THREE.Vector3(0, 0, CONFIG.WORLD_DEPTH);
  const dir = new THREE.Vector3(0, 0, -1);
  const params = { anchor, direction: dir };
  const map = [null,
    () => handleGesture({ name: 'OpenPalmForward', hand: 'Right', ...params }),
    () => { const e = new FistBurst(sceneMgr); e.trigger(params); sceneMgr.addEffect(e); },
    () => { const e = new DrStrangePortal(sceneMgr); e.trigger({ anchor, radius: 1.4 }); sceneMgr.addEffect(e); },
    () => { /* key 4 — was laser, removed */ },
    () => handleGesture({ name: 'TwoHandsFramingBox', hand: 'Both', ...params, extra: { size: 1.2 } }),
    () => { const e = new SpiderWeb(sceneMgr); e.trigger(params); sceneMgr.addEffect(e); },
    () => handleGesture({ name: 'DoubleOpenPalms', hand: 'Both', ...params }),
    () => { const e = new Shockwave(sceneMgr); e.trigger({ anchor, maxRadius: CONFIG.SHOCKWAVE_MAX_RADIUS * 1.3, life: 1.1, color: 0xfff2d1 }); sceneMgr.addEffect(e); sceneMgr.punch(1.2); },
    () => { const e = new SwipeSlash(sceneMgr); e.trigger({ anchor, direction: new THREE.Vector3(1, 0, 0) }); sceneMgr.addEffect(e); },
  ];
  map[n]?.();
}

// --- panels (created after handTracker so settings can reference it) ---
const tracker = new HandTracker({
  complexity: getCurrentTier().mediapipeComplexity,
  onReady: () => hidePermUI(),
  onError: (err) => {
    console.warn('Camera error:', err);
    showPermUI(err?.name === 'NotAllowedError'
      ? 'Camera permission was denied. Allow it in your browser, then retry.'
      : 'Could not access the camera: ' + (err?.message || 'unknown error'));
  },
});

const trainerPanel = new TrainerPanel({
  classifier,
  onTemplatesChanged: (templates) => {
    // (custom gestures don't need to register effect bindings here — the
    //  classifier emits events with `binding` attached, and handleGesture
    //  honors it via the g.custom branch.)
  },
});

const settingsPanel = new SettingsPanel({
  presetManager: PresetManager,
  sceneMgr, handTracker: tracker,
  openTrainer: () => trainerPanel.show(),
});

// Seed example custom gestures on first launch (so the trainer demo works
// before the user records anything). No-op if user already has gestures.
async function seedExampleGesturesIfEmpty() {
  const existing = await TemplateStore.list();
  if (existing.length > 0) return;
  // Three minimal seeds with hand-built mean landmark patterns. Variances
  // are loose so the classifier is forgiving.
  const seedTemplates = [
    {
      id: 'seed_open_palm',
      name: 'Open Palm (seed)',
      createdAt: Date.now(),
      meanLandmarks: makeOpenPalmTemplate(),
      variance: makeFlatVariance(0.05),
      weight: makeFlatWeight(),
      dominantHand: 'Right',
      binding: { effectId: 'repulsor', hand: 'Any', confidence: 0.65 },
    },
    {
      id: 'seed_thumbs_up',
      name: 'Thumbs Up (seed)',
      createdAt: Date.now(),
      meanLandmarks: makeThumbsUpTemplate(),
      variance: makeFlatVariance(0.05),
      weight: makeFlatWeight(),
      dominantHand: 'Right',
      binding: { effectId: 'shockwave', hand: 'Any', confidence: 0.7 },
    },
    {
      id: 'seed_l_shape',
      name: 'L Shape (seed)',
      createdAt: Date.now(),
      meanLandmarks: makeLShapeTemplate(),
      variance: makeFlatVariance(0.05),
      weight: makeFlatWeight(),
      dominantHand: 'Right',
      binding: { effectId: 'spiderweb', hand: 'Any', confidence: 0.7 },
    },
  ];
  for (const t of seedTemplates) await TemplateStore.put(t);
}

// Tiny landmark templates in normalized space — wrist at origin, scale 1.
// These are approximations; users should re-record for accuracy.
function makeFlatVariance(v) { const a = new Float32Array(63); a.fill(v); return a; }
function makeFlatWeight() { const a = new Float32Array(21); a.fill(1); return a; }
function makeOpenPalmTemplate() {
  const a = new Float32Array(63);
  // wrist 0 / mcp9 along +y / fingers spread upward — built in canonical space
  // y-up, fingers pointing up. Just fan out.
  const tips = [4, 8, 12, 16, 20];
  const mcps = [2, 5, 9, 13, 17];
  for (let i = 0; i < 21; i++) { a[i*3+0] = 0; a[i*3+1] = i / 21 * 1.2; a[i*3+2] = 0; }
  // spread fingers along x by index
  mcps.forEach((m, k) => { a[m*3+0] = (k - 2) * 0.18; a[m*3+1] = 0.5; });
  tips.forEach((t, k) => { a[t*3+0] = (k - 2) * 0.28; a[t*3+1] = 1.4; });
  return a;
}
function makeThumbsUpTemplate() {
  const a = new Float32Array(63);
  // fist with thumb up: fingers curled near wrist, thumb extends along +y
  for (let i = 0; i < 21; i++) { a[i*3+0] = 0.05; a[i*3+1] = 0.4; a[i*3+2] = 0; }
  // thumb chain extends upward
  [1,2,3,4].forEach((t, k) => { a[t*3+0] = -0.4; a[t*3+1] = 0.3 + k * 0.3; });
  return a;
}
function makeLShapeTemplate() {
  const a = new Float32Array(63);
  // index extended upward, thumb extended sideways, others curled
  for (let i = 0; i < 21; i++) { a[i*3+0] = 0.05; a[i*3+1] = 0.4; a[i*3+2] = 0; }
  [1,2,3,4].forEach((t, k) => { a[t*3+0] = -0.4 - k * 0.15; a[t*3+1] = 0.4; });
  [5,6,7,8].forEach((t, k) => { a[t*3+0] = 0.05; a[t*3+1] = 0.5 + k * 0.3; });
  return a;
}

await seedExampleGesturesIfEmpty();
await trainerPanel.load();

// --- camera permission flow ---
function showPermUI(msg) {
  AppState.dom.permEl.style.display = 'flex';
  document.getElementById('perm-msg').textContent = msg;
}
function hidePermUI() { AppState.dom.permEl.style.display = 'none'; }
document.getElementById('perm-retry').addEventListener('click', () => {
  hidePermUI();
  tracker.start();
});

// --- keyboard ---
window.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  // typing into form inputs? skip global shortcuts
  const tag = (e.target?.tagName || '').toLowerCase();
  if (tag === 'input' || tag === 'select' || tag === 'textarea') return;

  if (e.key === 'Escape') { trainerPanel.hide(); settingsPanel.hide(); return; }
  if (e.key === 'h' || e.key === 'H') {
    AppState.helpVisible = !AppState.helpVisible;
    AppState.dom.helpEl.style.display = AppState.helpVisible ? 'block' : 'none';
  } else if (e.key === 'd' || e.key === 'D') {
    AppState.debugOverlay = !AppState.debugOverlay;
  } else if (e.key === 'm' || e.key === 'M') {
    AppState.mirror = !AppState.mirror;
    sceneMgr.setMirror(AppState.mirror);
  } else if (e.key === 's' || e.key === 'S') {
    comboHUD.toggleStats();
  } else if (e.key === 'P' || (e.key === 'p' && !e.shiftKey)) {
    const next = PresetManager.cycleNext();
    flashPresetName(next.name);
  } else if (e.key === ',') {
    settingsPanel.toggle();
  } else if (e.key === 'T' && e.shiftKey) {
    trainerPanel.quickRecord();
  } else if (e.key === 't' || e.key === 'T') {
    trainerPanel.toggle();
  } else if (e.key === 'C' || (e.key === 'c' && e.shiftKey)) {
    const defs = Object.keys(COMBO_EFFECT_MAP);
    const name = defs[Math.floor(Math.random() * defs.length)];
    const fake = { anchor: new THREE.Vector3(0, 0, CONFIG.WORLD_DEPTH),
                   direction: new THREE.Vector3(0, 0, -1), extra: { radius: 1.2, charge: 1.0 } };
    fireCombo({ name, sequence: [] }, [fake, fake, fake]);
  } else if (e.key >= '1' && e.key <= '9') {
    manualTrigger(parseInt(e.key, 10));
  }
});

// preset name flash (top-center, fades)
let presetFlashEl = null;
function flashPresetName(name) {
  if (!presetFlashEl) {
    presetFlashEl = document.createElement('div');
    Object.assign(presetFlashEl.style, {
      position: 'fixed', top: '14%', left: '0', right: '0',
      textAlign: 'center', pointerEvents: 'none', zIndex: 18,
      fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
      fontSize: '24px', letterSpacing: '8px', color: '#7ae0ff',
      textShadow: '0 0 16px #7ae0ff', opacity: '0',
      transition: 'opacity 300ms ease',
    });
    document.body.appendChild(presetFlashEl);
  }
  presetFlashEl.textContent = name.toUpperCase();
  presetFlashEl.style.opacity = '1';
  clearTimeout(presetFlashEl._t);
  presetFlashEl._t = setTimeout(() => { presetFlashEl.style.opacity = '0'; }, 1100);
}

// --- start camera ---
tracker.start();

// --- render loop ---
let fpsFrames = 0, fpsAcc = 0, fpsCheckCount = 0;
let lastFrameTs = performance.now();
function loop() {
  const now = performance.now();
  const dt = AppState.clock.getDelta();
  const dtMs = now - lastFrameTs; lastFrameTs = now;

  AppState.frameCount++;
  fpsAcc += dt; fpsFrames++;
  if (fpsAcc >= 0.5) {
    const fps = fpsFrames / fpsAcc;
    AppState.fps = fps;
    AppState.dom.fpsEl.textContent = `${fps.toFixed(0)}  [${getCurrentTier().id}]`;
    if (CONFIG.AUTO_PERF_DROP && fps < 35 && window.__perfScale > 0.5) window.__perfScale = 0.5;
    // 60-frame probe: after first 5 buckets, downshift if slow
    if (++fpsCheckCount === 5 && fps < 40) {
      const lower = downshiftOnSlow(getCurrentTier(), fps);
      if (lower.id !== getCurrentTier().id) {
        console.info('[quality] downshifting due to fps', fps, '→', lower.id);
        setCurrentTier(lower);
      }
    }
    fpsFrames = 0; fpsAcc = 0;
  }

  // gestures
  const builtin = detector.detect(sceneMgr.camera);
  const custom  = classifier.detect(sceneMgr.camera);
  const events = [...builtin, ...custom];

  // route effects + combos
  for (const g of events) {
    handleGesture(g);
    if (!isNewFiring(g, now)) continue;
    if (g.name === 'ChargeUp' && (g.extra?.charge ?? 0) < 0.95) continue;
    const combo = comboEngine.push(g);
    if (combo) {
      for (const ev of combo.events) cancelHeldForEvent(ev);
      fireCombo(combo.def, combo.events);
    }
  }

  AppState.dom.gestureEl.textContent = events.length
    ? events.map(e => `${e.templateName || e.name}(${e.hand})`).slice(0, 2).join(', ')
    : 'none';
  AppState.dom.handsEl.textContent = String(AppState.handsDetected.length);

  PresetManager.update(dtMs);
  sceneMgr.update(dt);
  palmAnchors.update(sceneMgr.camera);
  pixelTrail.update(dt, sceneMgr.camera);
  sceneMgr.render();
  debug.render();
  comboHUD.update();
  trainerPanel.refreshMeters();

  // sync One-Euro toggle live (cheap)
  tracker.setSmoothingEnabled(CONFIG.ONE_EURO_ENABLED);

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
