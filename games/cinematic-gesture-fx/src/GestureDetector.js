// GestureDetector — per-frame classifier for all 10 gestures.
// Takes AppState.handsDetected (MediaPipe landmarks in 0..1 video space)
// and produces a list of stable, continuous gesture events with anchors
// projected into Three.js world coordinates.
//
// Approach: for each hand we compute a set of pose features (finger extension,
// pinch, palm normal, palm-forward alignment). Each gesture is a predicate
// over those features. Hysteresis: a gesture must be stable N frames before
// firing, then it keeps firing every frame while it holds (so beams/lasers
// stay on). "One-shot" gestures (transitions like fist→open, pinch→pull,
// swipe, clap) emit once per occurrence.

import * as THREE from 'three';
import { CONFIG } from '../config.js';
import { AppState } from './AppState.js';

// ---- MediaPipe landmark indices ----
const L = {
  WRIST: 0,
  THUMB_CMC: 1, THUMB_MCP: 2, THUMB_IP: 3, THUMB_TIP: 4,
  INDEX_MCP: 5, INDEX_PIP: 6, INDEX_DIP: 7, INDEX_TIP: 8,
  MIDDLE_MCP: 9, MIDDLE_PIP: 10, MIDDLE_DIP: 11, MIDDLE_TIP: 12,
  RING_MCP: 13, RING_PIP: 14, RING_DIP: 15, RING_TIP: 16,
  PINKY_MCP: 17, PINKY_PIP: 18, PINKY_DIP: 19, PINKY_TIP: 20,
};

// ---- Helpers ------------------------------------------------------------

function v(a) { return new THREE.Vector3(a.x, a.y, a.z || 0); }
function dist2D(a, b) { const dx = a.x - b.x, dy = a.y - b.y; return Math.hypot(dx, dy); }
function sub(a, b) { return v(a).sub(v(b)); }

// A finger is "extended" if the tip is further from the wrist than the PIP joint.
// For the thumb we compare the tip's x-offset from the MCP because thumbs
// don't curl the same way.
function fingerExtended(lm, tip, pip, wrist) {
  return dist2D(lm[tip], lm[wrist]) > dist2D(lm[pip], lm[wrist]) * 1.05;
}
function thumbExtended(lm, hand) {
  // thumb extended if tip is laterally further from the palm center
  const palm = lm[L.MIDDLE_MCP];
  return dist2D(lm[L.THUMB_TIP], palm) > dist2D(lm[L.THUMB_IP], palm) * 1.05;
}

// Compute a palm normal in mediapipe space (z negative = toward camera).
// wrist, index_mcp, pinky_mcp form a triangle; its normal approximates palm facing.
function palmNormal(lm) {
  const w = v(lm[L.WRIST]);
  const i = v(lm[L.INDEX_MCP]);
  const p = v(lm[L.PINKY_MCP]);
  const a = i.sub(w);
  const b = p.sub(w);
  return a.cross(b).normalize(); // points away from palm (toward fingers' back)
}

// Does the palm roughly face the camera? (normal.z < -0.2 means it points
// toward -z in mediapipe, which is toward the camera for their convention)
function palmFacesCamera(lm) {
  return palmNormal(lm).z < -0.15;
}
function palmFacesUp(lm) {
  return palmNormal(lm).y < -0.35; // normal points up-ish means palm faces up
}

// Project a normalized (0..1) landmark into Three.js world coordinates at
// CONFIG.WORLD_DEPTH. If mirror mode is on, flip X so what the user sees
// matches their hand's position on screen.
function toWorld(lm, camera, zOverride = null) {
  const z = zOverride ?? CONFIG.WORLD_DEPTH;
  const vFov = (camera.fov * Math.PI) / 180;
  const planeH = 2 * Math.tan(vFov / 2) * Math.abs(z);
  const planeW = planeH * camera.aspect;
  let x = (lm.x - 0.5) * planeW;
  if (AppState.mirror) x = -x;
  const y = -(lm.y - 0.5) * planeH;
  // landmark z is relative to wrist; scale it modestly so hands have parallax
  const zz = z + (lm.z || 0) * 1.5;
  return new THREE.Vector3(x, y, zz);
}

// ---- Pose feature extraction for one hand --------------------------------
function extractFeatures(h, camera) {
  const lm = h.landmarks;
  const wrist = lm[L.WRIST];

  const fingers = {
    thumb: thumbExtended(lm),
    index: fingerExtended(lm, L.INDEX_TIP, L.INDEX_PIP, L.WRIST),
    middle: fingerExtended(lm, L.MIDDLE_TIP, L.MIDDLE_PIP, L.WRIST),
    ring: fingerExtended(lm, L.RING_TIP, L.RING_PIP, L.WRIST),
    pinky: fingerExtended(lm, L.PINKY_TIP, L.PINKY_PIP, L.WRIST),
  };
  const extendedCount = Object.values(fingers).filter(Boolean).length;

  const pinchDist = dist2D(lm[L.THUMB_TIP], lm[L.INDEX_TIP]);
  const pn = palmNormal(lm);

  // hand size = wrist to middle_mcp in normalized units (used for scale normalization)
  const handSize = dist2D(lm[L.WRIST], lm[L.MIDDLE_MCP]) || 0.1;

  const palmCenter2D = {
    x: (lm[L.INDEX_MCP].x + lm[L.PINKY_MCP].x + wrist.x) / 3,
    y: (lm[L.INDEX_MCP].y + lm[L.PINKY_MCP].y + wrist.y) / 3,
    z: (lm[L.INDEX_MCP].z + lm[L.PINKY_MCP].z + wrist.z) / 3,
  };
  const palmCenterWorld = toWorld(palmCenter2D, camera);
  const wristWorld = toWorld(wrist, camera);
  const indexTipWorld = toWorld(lm[L.INDEX_TIP], camera);
  const thumbTipWorld = toWorld(lm[L.THUMB_TIP], camera);

  // Direction vector in world space: palm's forward points INTO the scene (-z),
  // so "palm forward" effects should shoot toward -z from palm center.
  // We approximate with the palm normal, flipped/transformed into world.
  // In mediapipe: normal.z<0 = palm toward camera. In our world: camera at +z looking -z.
  // So palm forward (from user's perspective, away from them) is world direction:
  //   x = mirror ? -pn.x : pn.x
  //   y = -pn.y
  //   z = -pn.z
  // (We negate because we want the direction the palm pushes AWAY from user.)
  // Raw palm normal in world coords (keeps sign — so we can tell palm-faces-up vs
  // palm-faces-down, palms-face-each-other vs palms-face-camera, etc.)
  const palmNormalW = new THREE.Vector3(
    AppState.mirror ? pn.x : -pn.x,
    pn.y,
    pn.z,
  ).normalize();
  // palmFwd = copy of palm normal, forced to point into the scene (so beams/blasts
  // always shoot AWAY from user regardless of palm orientation)
  const palmFwd = palmNormalW.clone();
  if (palmFwd.z > 0) palmFwd.z = -Math.abs(palmFwd.z);

  // Index finger pointing direction (tip - mcp), in world space
  const indexDir = indexTipWorld.clone().sub(toWorld(lm[L.INDEX_MCP], camera)).normalize();

  return {
    lm, fingers, extendedCount, pinchDist, palmNormal: pn,
    palmFacesCamera: palmFacesCamera(lm),
    palmFacesUp: palmFacesUp(lm),
    handSize,
    wristWorld, palmCenterWorld, indexTipWorld, thumbTipWorld,
    palmFwd, palmNormalW, indexDir,
    // raw 2D palm pos for velocity tracking
    palm2D: palmCenter2D,
  };
}

// ---- GestureDetector class ----------------------------------------------
export class GestureDetector {
  constructor() {
    // per-hand state (keyed by 'Left'/'Right')
    this.state = {
      Left: this._freshHandState(),
      Right: this._freshHandState(),
    };
    // two-hand gestures tracked separately. Counter per gesture name (hysteresis).
    // bothHandsStable = frames where BOTH hands have been seen with high confidence;
    // required before any two-hand gesture fires.
    this.twoHand = {
      bothStable: 0,
      framingBox: 0, doublePalms: 0, clap: 0, clapFired: 0,
      shield: 0, whip: 0, charge: 0, doublePoint: 0, prayer: 0, crossed: 0,
      chargeStart: 0,
    };
  }

  _freshHandState() {
    return {
      lastFeatures: null,
      stable: {},
      wasFist: false,
      fistOpenedAt: 0,
      wasPinched: false,
      pinchStart: null,
      pinchPullFired: false,
      palmUpStart: 0,
      lastPalm2D: null,
      palmVel: 0,
      palmVelDir: new THREE.Vector3(),
      lastSwipeAt: 0,
    };
  }

  // Main per-frame entry point. Returns an array of gesture events.
  detect(camera) {
    const hands = AppState.handsDetected;
    const now = performance.now();
    const events = [];
    if (!hands || hands.length === 0) {
      // decay all stable counters
      for (const k of ['Left', 'Right']) {
        this.state[k].stable = {};
        this.state[k].lastFeatures = null;
      }
      return events;
    }

    const featuresByHand = {};
    for (const h of hands) {
      const f = extractFeatures(h, camera);
      featuresByHand[h.hand] = { h, f };
    }

    // --- per-hand gestures ---
    for (const key of Object.keys(featuresByHand)) {
      const { h, f } = featuresByHand[key];
      const s = this.state[key];

      // palm velocity tracking (normalized/sec)
      if (s.lastPalm2D) {
        const dx = f.palm2D.x - s.lastPalm2D.x;
        const dy = f.palm2D.y - s.lastPalm2D.y;
        const dt = Math.max(0.001, (now - (s.lastPalm2DTs || now)) / 1000);
        s.palmVel = Math.hypot(dx, dy) / dt;
        s.palmVelDir.set(AppState.mirror ? -dx : dx, -dy, 0).normalize();
      }
      s.lastPalm2D = { x: f.palm2D.x, y: f.palm2D.y };
      s.lastPalm2DTs = now;

      // ===== HELD POSES (mutually exclusive — only the most specific fires) =====
      // We check each pose with TIGHT conditions so they don't overlap, then
      // collect all matches and emit only the highest-priority one.
      const candidates = [];

      // POINT — index extended, ALL OTHER FINGERS curled (including thumb).
      // Specificity: 5 finger constraints. Highest priority because it's
      // visually unambiguous (one finger up).
      const pointing = !f.fingers.thumb && f.fingers.index
        && !f.fingers.middle && !f.fingers.ring && !f.fingers.pinky;
      if (this._hysteresis(s, 'point', pointing)) {
        candidates.push({ priority: 100, evt: {
          name: 'PointIndex', hand: key, confidence: 0.9,
          anchor: f.indexTipWorld, direction: f.indexDir,
        }});
      }

      // WEB SHOOTER — thumb + index + middle extended, ring + pinky curled.
      // Specificity: 5 finger constraints. Disambiguated from open palm by
      // requiring ring + pinky to be CLEARLY curled.
      const webShooter = f.fingers.thumb && f.fingers.index && f.fingers.middle
        && !f.fingers.ring && !f.fingers.pinky;
      if (this._hysteresis(s, 'web', webShooter)) {
        candidates.push({ priority: 90, evt: {
          name: 'WebShooter', hand: key, confidence: 0.85,
          anchor: f.wristWorld, direction: f.palmFwd,
        }});
      }

      // OPEN PALM FORWARD — STRICT: all 5 fingers extended + palm faces camera.
      // Was loose (>=4 extended); now requires all 5 so it doesn't false-fire
      // when one finger is mid-curl during a transition.
      const allFive = f.fingers.thumb && f.fingers.index && f.fingers.middle
        && f.fingers.ring && f.fingers.pinky;
      const openPalm = allFive && f.palmFacesCamera;
      if (this._hysteresis(s, 'openPalmFwd', openPalm)) {
        candidates.push({ priority: 60, evt: {
          name: 'OpenPalmForward', hand: key, confidence: 0.85,
          anchor: f.palmCenterWorld, direction: f.palmFwd,
        }});
      }

      // HOLD OPEN PALM UP — all 5 extended + palm faces UP (different from
      // openPalmFwd because palm orientation is different; mutually exclusive).
      const palmUp = allFive && f.palmFacesUp;
      if (palmUp) {
        if (!s.palmUpStart) s.palmUpStart = now;
        if (now - s.palmUpStart >= CONFIG.HOLD_PALM_UP_MS) {
          candidates.push({ priority: 70, evt: {
            name: 'HoldOpenPalmUp', hand: key, confidence: 0.9,
            anchor: f.palmCenterWorld, direction: new THREE.Vector3(0, 1, 0),
          }});
        }
      } else {
        s.palmUpStart = 0;
      }

      // FIST — all 5 fingers curled. (Lowest priority of the held poses since
      // it's the "default" closed-hand state.)
      const isFist = !f.fingers.thumb && !f.fingers.index && !f.fingers.middle
        && !f.fingers.ring && !f.fingers.pinky;
      const isOpen = allFive;
      if (isFist && this._hysteresis(s, 'fist', true)) {
        candidates.push({ priority: 40, evt: {
          name: 'Fist', hand: key, confidence: 0.85,
          anchor: f.palmCenterWorld, direction: f.palmFwd,
        }});
      } else if (!isFist) {
        s.stable.fist = 0;
      }

      // emit only the highest-priority held pose for this hand this frame
      if (candidates.length > 0) {
        candidates.sort((a, b) => b.priority - a.priority);
        events.push(candidates[0].evt);
      }

      // ===== ONE-SHOT EVENTS (transitions / motions — fire freely) =====

      // ---- Fist → Open transition within ~300ms ----
      if (isFist) { s.wasFist = true; s.fistOpenedAt = 0; }
      if (s.wasFist && isOpen && !s.fistOpenedAt) {
        s.fistOpenedAt = now;
        events.push({
          name: 'FistToOpen', hand: key, confidence: 0.88,
          anchor: f.palmCenterWorld, direction: f.palmFwd,
        });
        s.wasFist = false;
        // Brief cooldown: after the burst, force held poses on this hand to
        // rebuild their stability counter before they can fire. This prevents
        // the burst from immediately layering a repulsor/laser on top.
        s.stable.openPalmFwd = -14;  // ~230ms @ 60fps
        s.stable.point = -14;
        s.stable.web = -14;
      }

      // ---- PinchAndPull (Dr. Strange portal) ----
      // Pinch thumb+index together, then "draw" the portal open by moving your
      // hand. The wider you move, the bigger the portal. Lowered threshold
      // (0.35 world units was 0.5) + slightly looser pinch distance so the
      // gesture fires reliably on first try.
      // Also: after the portal fires, if the user keeps pinching AND moves
      // even further, we let a second portal fire after re-release so you
      // can open multiple portals in a row.
      const pinched = f.pinchDist < CONFIG.PINCH_DIST * 1.25;
      if (pinched && !s.wasPinched) {
        s.wasPinched = true;
        s.pinchStart = f.thumbTipWorld.clone();
        s.pinchPullFired = false;
      }
      if (pinched && s.pinchStart && !s.pinchPullFired) {
        const pulled = f.thumbTipWorld.distanceTo(s.pinchStart);
        if (pulled > 0.35) {
          const mid = s.pinchStart.clone().add(f.thumbTipWorld).multiplyScalar(0.5);
          events.push({
            name: 'PinchAndPull', hand: key, confidence: 0.85,
            anchor: mid,
            direction: f.thumbTipWorld.clone().sub(s.pinchStart),
            extra: { radius: Math.max(0.6, pulled * 1.1) },
          });
          s.pinchPullFired = true;
        }
      }
      if (!pinched && s.wasPinched) {
        s.wasPinched = false;
        s.pinchStart = null;
        s.pinchPullFired = false;
      }

      // ---- Swipe (open palm moving fast horizontally) ----
      const swipeCandidate = f.extendedCount >= 4 && s.palmVel > CONFIG.SWIPE_VELOCITY;
      if (swipeCandidate && now - s.lastSwipeAt > 450) {
        const dir = s.palmVelDir.clone();
        if (Math.abs(dir.x) > 0.6) { // mostly horizontal
          events.push({
            name: 'SwipeHorizontal', hand: key, confidence: 0.75,
            anchor: f.palmCenterWorld, direction: dir,
          });
          s.lastSwipeAt = now;
        }
      }

      s.lastFeatures = f;
    }

    // --- two-hand gestures ---
    // Require BOTH hands visible with score > confidence_min for TWO_HAND_STABILITY_FRAMES
    // before any two-hand gesture is allowed to fire. When a hand disappears we
    // wipe the stability counter so re-entering doesn't instantly fire anything.
    const L_ = featuresByHand.Left, R_ = featuresByHand.Right;
    if (L_ && R_
        && L_.h.score >= CONFIG.TWO_HAND_CONFIDENCE_MIN
        && R_.h.score >= CONFIG.TWO_HAND_CONFIDENCE_MIN) {
      this.twoHand.bothStable++;
    } else {
      // wipe all two-hand state (except fired-at timestamps used for cooldowns)
      this.twoHand.bothStable = 0;
      this.twoHand.framingBox = this.twoHand.doublePalms = this.twoHand.clap = 0;
      this.twoHand.shield = this.twoHand.whip = this.twoHand.charge = 0;
      this.twoHand.doublePoint = this.twoHand.prayer = this.twoHand.crossed = 0;
      this.twoHand.chargeStart = 0;
    }

    const twoHandReady = L_ && R_ && this.twoHand.bothStable >= CONFIG.TWO_HAND_STABILITY_FRAMES;
    if (twoHandReady) {
      const fl = L_.f, fr = R_.f;
      const midpoint = () => fl.palmCenterWorld.clone().add(fr.palmCenterWorld).multiplyScalar(0.5);
      const separation = fl.palmCenterWorld.distanceTo(fr.palmCenterWorld);
      // symmetry: how mirrored are the two hand poses? (0..1)
      const ycDiff = Math.abs(fl.palmCenterWorld.y - fr.palmCenterWorld.y);
      const symmetry = THREE.MathUtils.clamp(1 - ycDiff / 1.5, 0, 1);
      const baseExtra = { separation, symmetry };

      // ---- DoubleOpenPalms (both palms forward) ----
      const dp = fl.extendedCount >= 4 && fr.extendedCount >= 4
        && fl.palmFacesCamera && fr.palmFacesCamera;
      if (this._hysteresisTwoHand('doublePalms', dp)) {
        events.push({
          name: 'DoubleOpenPalms', hand: 'Both', confidence: 0.85,
          anchor: midpoint(),
          direction: fl.palmFwd.clone().add(fr.palmFwd).normalize(),
          extra: baseExtra,
        });
      }

      // ---- TwoHandsFramingBox (both "L" shapes) ----
      const lShape = (f) => f.fingers.thumb && f.fingers.index
        && !f.fingers.middle && !f.fingers.ring && !f.fingers.pinky;
      const framing = lShape(fl) && lShape(fr);
      if (this._hysteresisTwoHand('framingBox', framing)) {
        const center = fl.indexTipWorld.clone().add(fr.indexTipWorld).multiplyScalar(0.5);
        events.push({
          name: 'TwoHandsFramingBox', hand: 'Both', confidence: 0.82,
          anchor: center,
          direction: fr.indexTipWorld.clone().sub(fl.indexTipWorld),
          extra: { ...baseExtra, size: fl.indexTipWorld.distanceTo(fr.indexTipWorld) },
        });
      }

      // ---- Clap (two hands very close while both open) — one-shot ----
      const dBetween = fl.palmCenterWorld.distanceTo(fr.palmCenterWorld);
      const openBoth = fl.extendedCount >= 3 && fr.extendedCount >= 3;
      const clapping = openBoth && dBetween < 0.45;
      if (clapping && now - this.twoHand.clapFired > 600) {
        events.push({
          name: 'ClapOrHandsTogether', hand: 'Both', confidence: 0.9,
          anchor: midpoint(), direction: new THREE.Vector3(0, 0, 1),
          extra: baseExtra,
        });
        this.twoHand.clapFired = now;
      }

      // ---- ShieldPose: both palms forward, hands at similar height, fingers
      // slightly curled (2..3 extended — STRICT upper bound so it doesn't
      // overlap DoubleOpenPalms which requires all 5 extended).
      const shieldPose = fl.palmFacesCamera && fr.palmFacesCamera
        && fl.extendedCount >= 2 && fl.extendedCount <= 3
        && fr.extendedCount >= 2 && fr.extendedCount <= 3
        && Math.abs(fl.palmCenterWorld.y - fr.palmCenterWorld.y) < 0.5
        && dBetween < 1.6;
      if (this._hysteresisTwoHand('shield', shieldPose)) {
        events.push({
          name: 'ShieldPose', hand: 'Both', confidence: 0.82,
          anchor: midpoint(), direction: new THREE.Vector3(0, 0, -1),
          extra: { ...baseExtra, radius: 0.7 + dBetween * 0.4 },
        });
      }

      // ---- WhipPose: both fists, arms far apart (high separation) ----
      const whipPose = fl.extendedCount <= 1 && fr.extendedCount <= 1 && dBetween > 1.4;
      if (this._hysteresisTwoHand('whip', whipPose)) {
        events.push({
          name: 'WhipPose', hand: 'Both', confidence: 0.78,
          anchor: midpoint(),
          direction: fr.palmCenterWorld.clone().sub(fl.palmCenterWorld).normalize(),
          extra: { ...baseExtra, leftWrist: fl.wristWorld.clone(), rightWrist: fr.wristWorld.clone() },
        });
      }

      // ---- ChargeUp: both open palms facing EACH OTHER (palm normals point inward on x axis). ----
      // left palm normal.x > 0.3 (points right) and right palm normal.x < -0.3 (points left)
      const chargeUp = fl.extendedCount >= 4 && fr.extendedCount >= 4
        && fl.palmNormalW.x > 0.25 && fr.palmNormalW.x < -0.25
        && dBetween < 1.2;
      if (this._hysteresisTwoHand('charge', chargeUp)) {
        if (!this.twoHand.chargeStart) this.twoHand.chargeStart = now;
        events.push({
          name: 'ChargeUp', hand: 'Both', confidence: 0.8,
          anchor: midpoint(), direction: new THREE.Vector3(0, 0, -1),
          extra: { ...baseExtra, charge: Math.min(1, (now - this.twoHand.chargeStart) / 1500) },
        });
      } else {
        this.twoHand.chargeStart = 0;
      }

      // ---- DoublePoint: both index extended (others curled), pointing same direction ----
      const pointingBoth = fl.fingers.index && !fl.fingers.middle && !fl.fingers.ring && !fl.fingers.pinky
        && fr.fingers.index && !fr.fingers.middle && !fr.fingers.ring && !fr.fingers.pinky
        && fl.indexDir.dot(fr.indexDir) > 0.85;
      if (this._hysteresisTwoHand('doublePoint', pointingBoth)) {
        const center = fl.indexTipWorld.clone().add(fr.indexTipWorld).multiplyScalar(0.5);
        events.push({
          name: 'DoublePoint', hand: 'Both', confidence: 0.85,
          anchor: center,
          direction: fl.indexDir.clone().add(fr.indexDir).normalize(),
          extra: { ...baseExtra, leftTip: fl.indexTipWorld.clone(), rightTip: fr.indexTipWorld.clone() },
        });
      }

      // ---- PrayerHands: palms pressed together (palms face each other + close + fingers up) ----
      const prayer = fl.palmNormalW.x > 0.25 && fr.palmNormalW.x < -0.25
        && dBetween < 0.45
        && fl.extendedCount >= 3 && fr.extendedCount >= 3;
      if (this._hysteresisTwoHand('prayer', prayer)) {
        events.push({
          name: 'PrayerHands', hand: 'Both', confidence: 0.85,
          anchor: midpoint(), direction: new THREE.Vector3(0, 1, 0),
          extra: baseExtra,
        });
      }

      // ---- CupHands: palms facing each other, fingers curled (semi-fist),
      // hands close together. Drives EnergyBall charging.
      // STRICT: extendedCount <= 2 so it doesn't overlap PrayerHands (>= 3).
      const cupHands = fl.palmNormalW.x > 0.15 && fr.palmNormalW.x < -0.15
        && fl.extendedCount <= 2 && fr.extendedCount <= 2
        && dBetween < 1.4;
      if (this._hysteresisTwoHand('cupHands', cupHands)) {
        const fwd = fl.palmFwd.clone().add(fr.palmFwd).normalize();
        events.push({
          name: 'CupHands', hand: 'Both', confidence: 0.78,
          anchor: midpoint(),
          direction: fwd.lengthSq() < 0.1 ? new THREE.Vector3(0, 0, -1) : fwd,
          extra: { ...baseExtra, separation: dBetween },
        });
      }

      // ---- CrossedArms: each wrist on the opposite side of the other ----
      // In world coords: left hand's wrist.x > right hand's wrist.x means they're crossed.
      const crossed = fl.wristWorld.x > fr.wristWorld.x
        && Math.abs(fl.wristWorld.x - fr.wristWorld.x) > 0.25;
      if (this._hysteresisTwoHand('crossed', crossed)) {
        events.push({
          name: 'CrossedArms', hand: 'Both', confidence: 0.78,
          anchor: midpoint(), direction: new THREE.Vector3(0, 0, -1),
          extra: baseExtra,
        });
      }
    }

    // ===== CONFLICT RESOLUTION =====
    // Two-hand gestures take priority over conflicting per-hand gestures so
    // you don't get three effects firing from one two-handed pose (e.g. both
    // palms forward used to fire repulsor-left + repulsor-right + light-beam).
    const names = new Set(events.map(e => e.name));
    const suppressIfPresent = [
      // two-hand name → per-hand names to drop
      ['DoubleOpenPalms', ['OpenPalmForward']],
      ['DoublePoint',     ['PointIndex']],
      ['ShieldPose',      ['OpenPalmForward']],
      ['ChargeUp',        ['OpenPalmForward']],
      ['CupHands',        ['Fist']],
      ['WhipPose',        ['Fist']],
      ['PrayerHands',     ['OpenPalmForward']],
      ['TwoHandsFramingBox', ['PointIndex']],
    ];
    let filtered = events;
    for (const [twoHand, drop] of suppressIfPresent) {
      if (names.has(twoHand)) {
        filtered = filtered.filter(e => !drop.includes(e.name));
      }
    }

    return filtered;
  }

  // Returns true when a gesture has been stably true for CONFIG.GESTURE_STABLE_FRAMES,
  // and continues returning true every frame while it remains true.
  //
  // GRACE PERIOD: once a gesture has fired, we tolerate up to GESTURE_MISS_GRACE
  // frames where the pose check drops out (e.g. a finger momentarily misclassified
  // during fast movement) without resetting the stable counter. This keeps held
  // effects following the hand smoothly instead of flickering on/off.
  _hysteresis(s, key, active) {
    s.miss = s.miss || {};
    if (active) {
      s.stable[key] = (s.stable[key] || 0) + 1;
      s.miss[key] = 0;
      return s.stable[key] >= CONFIG.GESTURE_STABLE_FRAMES;
    }
    s.miss[key] = (s.miss[key] || 0) + 1;
    if (s.miss[key] >= CONFIG.GESTURE_MISS_GRACE) {
      s.stable[key] = 0;
      return false;
    }
    // during grace: keep reporting active IF we'd previously hit threshold
    return (s.stable[key] || 0) >= CONFIG.GESTURE_STABLE_FRAMES;
  }

  _hysteresisTwoHand(key, active) {
    this.twoHand._miss = this.twoHand._miss || {};
    if (active) {
      this.twoHand[key] = (this.twoHand[key] || 0) + 1;
      this.twoHand._miss[key] = 0;
      return this.twoHand[key] >= CONFIG.TWO_HAND_STABILITY_FRAMES;
    }
    this.twoHand._miss[key] = (this.twoHand._miss[key] || 0) + 1;
    if (this.twoHand._miss[key] >= CONFIG.GESTURE_MISS_GRACE) {
      this.twoHand[key] = 0;
      return false;
    }
    return (this.twoHand[key] || 0) >= CONFIG.TWO_HAND_STABILITY_FRAMES;
  }
}
