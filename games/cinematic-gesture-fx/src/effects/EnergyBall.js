// EnergyBall — three-phase effect: CHARGE, RELEASE/FLIGHT, IMPACT.
//
// trigger() is called every frame the cup-pose holds. The effect tracks
// palm separation and grows/shrinks accordingly. When trigger stops being
// called (gesture released) AND the hands had a high-velocity separation in
// the last few frames, we LAUNCH the ball along the average palm normal.
//
// While in flight: sinusoidal wobble path, orbiting particles, occasional
// crackle arcs. On impact (reaches max distance or hits z plane): big
// shockwave + particle burst + chromatic punch.

import * as THREE from 'three';
import { BaseEffect } from './BaseEffect.js';
import { Shockwave } from './Shockwave.js';
import { CONFIG } from '../../config.js';

const VERT = `
  varying vec3 vNormal; varying vec3 vV;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vV = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;
const AURA_FRAG = `
  precision mediump float;
  varying vec3 vNormal; varying vec3 vV;
  uniform vec3 uCore; uniform vec3 uAura; uniform float uTime; uniform float uPulse;
  // cheap 3D noise via hash
  float h(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
  void main() {
    vec3 V = normalize(vV);
    float fres = pow(1.0 - max(dot(V, vNormal), 0.0), 2.5);
    float n = h(vNormal * 6.0 + uTime * 0.5);
    float pulse = 0.85 + 0.15 * sin(uTime * 7.0);
    vec3 c = mix(uAura, uCore, fres) * (fres * 2.5 + n * 0.4) * pulse * uPulse;
    gl_FragColor = vec4(c, fres * 0.9 + 0.15);
  }
`;

const ARC_LIFE = 0.18; // crackle arc lifetime (sec)

export class EnergyBall extends BaseEffect {
  constructor(sceneMgr) {
    super(sceneMgr);
    this.phase = 'idle'; // idle | charge | flight | impact
    this.charge = 0;     // 0..1
    this.held = false;
    this.lastTriggerTs = 0;
    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.lifeLeft = 6.0;
    this.flightT = 0;
    this.crackles = [];
    this.orbits = [];
    this.lastSeparation = 0;
    this.separationVel = 0;
    this.dirHint = new THREE.Vector3(0, 0, -1);
  }

  // Fed from main.js while the EnergyBall gesture (cup-hands) holds. Anchor =
  // midpoint between palms, extra.separation = current world distance.
  trigger({ anchor, direction, extra }) {
    if (this.phase === 'flight' || this.phase === 'impact') return;
    if (!this._initialized) this._build();
    const now = performance.now();
    this.held = true;
    this.lastTriggerTs = now;
    this.phase = 'charge';
    this.position.copy(anchor);
    if (direction && direction.lengthSq() > 0.01) this.dirHint.copy(direction).normalize();

    // separation drives charge: closer hands = small dense ball; further apart = bigger.
    const sep = extra?.separation ?? 0.4;
    this.separationVel = (sep - this.lastSeparation) / Math.max(1e-3, (now - (this._lastSepTs || now)) / 1000);
    this.lastSeparation = sep;
    this._lastSepTs = now;

    // map separation 0.05..1.2 → charge 0..1 (closer = less charge)
    const target = THREE.MathUtils.clamp((sep - 0.05) / 1.15, 0, 1);
    // smooth ramp toward target
    this.charge = THREE.MathUtils.lerp(this.charge, target, 0.18);

    this._spawnInflowDust();
  }

  _build() {
    // --- core sphere (small, super bright) ---
    const coreGeo = new THREE.SphereGeometry(1, 28, 28);
    this.coreMat = new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: AURA_FRAG,
      uniforms: {
        uCore: { value: new THREE.Color(CONFIG.EBALL_COLOR_CORE) },
        uAura: { value: new THREE.Color(CONFIG.EBALL_COLOR_AURA) },
        uTime: { value: 0 }, uPulse: { value: 0.65 },  // was 1.4 — core reads as a sphere, not a white sun
      },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    this.core = new THREE.Mesh(coreGeo, this.coreMat);
    this.scene.add(this.core);
    this._track(this.core);

    // --- aura shell ---
    const auraGeo = new THREE.SphereGeometry(1, 28, 28);
    this.auraMat = new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: AURA_FRAG,
      uniforms: {
        uCore: { value: new THREE.Color(CONFIG.EBALL_COLOR_AURA) },
        uAura: { value: new THREE.Color(CONFIG.EBALL_COLOR_CORE) },
        uTime: { value: 0 }, uPulse: { value: 0.35 },  // was 0.7
      },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.BackSide,
    });
    this.aura = new THREE.Mesh(auraGeo, this.auraMat);
    this.scene.add(this.aura);
    this._track(this.aura);

    // --- inner nucleus: small solid sphere inside the core for structural
    // detail — you can see "something dense" at the middle of the orb
    const nucGeo = new THREE.SphereGeometry(1, 16, 16);
    this.nucMat = new THREE.MeshBasicMaterial({
      color: CONFIG.EBALL_COLOR_CORE, transparent: true, opacity: 0.75,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    this.nucleus = new THREE.Mesh(nucGeo, this.nucMat);
    this.scene.add(this.nucleus);
    this._track(this.nucleus);

    // --- equatorial ring: thin torus orbiting the ball, gives spatial depth
    const ringGeo = new THREE.TorusGeometry(1.2, 0.04, 8, 64);
    this.ringMat = new THREE.MeshBasicMaterial({
      color: CONFIG.EBALL_COLOR_AURA, transparent: true, opacity: 0.85,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    this.equatorialRing = new THREE.Mesh(ringGeo, this.ringMat);
    this.scene.add(this.equatorialRing);
    this._track(this.equatorialRing);

    // --- orbit particle ring (separate Points so they can spin around the ball) ---
    const N = Math.floor(CONFIG.EBALL_ORBIT_COUNT * (window.__perfScale || 1));
    const positions = new Float32Array(N * 3);
    const sizes = new Float32Array(N);
    const colors = new Float32Array(N * 3);
    const alphas = new Float32Array(N);
    this.orbits = new Array(N);
    const c = new THREE.Color(CONFIG.EBALL_COLOR_AURA);
    for (let i = 0; i < N; i++) {
      const r = 0.7 + Math.random() * 0.6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 1.5 + Math.random() * 2.5;
      this.orbits[i] = { r, theta, phi, speed,
                         precess: (Math.random() - 0.5) * 0.4 };
      positions[i*3+0] = positions[i*3+1] = positions[i*3+2] = 0;
      sizes[i] = 0.5 + Math.random() * 0.5;
      colors[i*3+0] = c.r; colors[i*3+1] = c.g; colors[i*3+2] = c.b;
      alphas[i] = 0.9;
    }
    const orbitGeo = new THREE.BufferGeometry();
    orbitGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    orbitGeo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    orbitGeo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    orbitGeo.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));
    orbitGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6);

    // reuse the global particle shader material (same look)
    const sharedMat = this.particles.mat.clone();
    this.orbitPoints = new THREE.Points(orbitGeo, sharedMat);
    this.orbitPoints.frustumCulled = false;
    this.orbitPoints.layers.enable(1);
    this.scene.add(this.orbitPoints);
    this._track(this.orbitPoints);
    this.orbitGeo = orbitGeo;
    this.orbitPositions = positions;

    this._initialized = true;
  }

  _spawnInflowDust() {
    if (Math.random() > 0.7) return;
    const r = 1.2 + Math.random() * 0.8;
    const t = Math.random() * Math.PI * 2, p = Math.acos(2 * Math.random() - 1);
    const start = this.position.clone().add(new THREE.Vector3(
      r * Math.sin(p) * Math.cos(t), r * Math.sin(p) * Math.sin(t), r * Math.cos(p),
    ));
    const dir = this.position.clone().sub(start).normalize();
    this.particles.spawn({
      pos: start, vel: dir.multiplyScalar(2.5 + this.charge * 4),
      color: new THREE.Color(CONFIG.EBALL_COLOR_AURA),
      size: 0.3 + Math.random() * 0.3,
      life: 0.35, alpha: 0.85, drag: 0.4,
    });
  }

  _spawnCrackle() {
    // procedural lightning: 3 segments fanning out from core center
    const baseColor = new THREE.Color(CONFIG.EBALL_COLOR_CORE);
    const dir = new THREE.Vector3(
      Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5,
    ).normalize();
    const len = (this.core.scale.x || 0.2) * 2.5;
    const a = this.position.clone();
    const b = a.clone().addScaledVector(dir, len * 0.45)
                  .add(new THREE.Vector3((Math.random()-0.5)*0.1, (Math.random()-0.5)*0.1, 0));
    const c = b.clone().addScaledVector(dir, len * 0.55)
                  .add(new THREE.Vector3((Math.random()-0.5)*0.15, (Math.random()-0.5)*0.15, 0));
    const geo = new THREE.BufferGeometry().setFromPoints([a, b, c]);
    const mat = new THREE.LineBasicMaterial({
      color: baseColor, transparent: true, opacity: 1.0,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const line = new THREE.Line(geo, mat);
    line.layers.enable(1);
    this.scene.add(line);
    this.crackles.push({ line, age: 0 });
  }

  release() {
    if (this.phase !== 'charge') return;
    this.phase = 'flight';
    this.flightT = 0;
    this.lifeLeft = 2.0;
    // launch direction: dirHint (palm normal) but force forward (-z)
    const v = this.dirHint.clone();
    if (v.z > -0.2) v.z = -1;
    v.normalize();
    this.velocity.copy(v).multiplyScalar(CONFIG.EBALL_LAUNCH_SPEED);
    this.sceneMgr.punch(0.7);
  }

  detonate() {
    if (this.phase === 'impact') return;
    this.phase = 'impact';
    this.lifeLeft = 0.05;
    const sw = new Shockwave(this.sceneMgr);
    sw.trigger({
      anchor: this.position.clone(),
      maxRadius: CONFIG.EBALL_IMPACT_RADIUS,
      life: 0.85,
      color: CONFIG.EBALL_COLOR_AURA,
      burstParticles: true,
    });
    this.sceneMgr.addEffect(sw);
    // particle burst
    const c1 = new THREE.Color(CONFIG.EBALL_COLOR_CORE);
    const c2 = new THREE.Color(CONFIG.EBALL_COLOR_AURA);
    const N = Math.floor(420 * (window.__perfScale || 1));
    for (let i = 0; i < N; i++) {
      const dir = new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5)
        .normalize().multiplyScalar(2 + Math.random() * 5);
      this.particles.spawn({
        pos: this.position.clone(), vel: dir,
        color: Math.random() < 0.5 ? c1 : c2,
        size: 0.5 + Math.random() * 0.7,
        life: 0.5 + Math.random() * 0.5,
        alpha: 1.0, drag: 0.4,
      });
    }
    this.sceneMgr.punch(2.5);
  }

  update(dt) {
    if (!this._initialized) return;
    const now = performance.now();
    const t = now / 1000;
    this.coreMat.uniforms.uTime.value = t;
    this.auraMat.uniforms.uTime.value = t;

    // CHARGE PHASE: detect release if main.js stopped calling trigger()
    // Window bumped to 500ms so brief tracking dropouts while you charge
    // don't cancel the pose.
    if (this.phase === 'charge') {
      const sinceTrigger = now - this.lastTriggerTs;
      if (sinceTrigger > 500) {
        if (this.charge > 0.25 && this.separationVel > 1.4) {
          this.release();
        } else if (sinceTrigger > 1200) {
          // fade out — no launch
          this.lifeLeft -= dt * 4;
          if (this.lifeLeft <= 0) { this.done = true; }
        }
      }
    }

    // FLIGHT PHASE: integrate position with wobble
    if (this.phase === 'flight') {
      this.flightT += dt;
      this.lifeLeft -= dt;
      // sinusoidal wobble perpendicular to velocity
      const v = this.velocity;
      const perp = new THREE.Vector3(-v.y, v.x, 0).normalize();
      const wobble = Math.sin(this.flightT * 8) * CONFIG.EBALL_WOBBLE_AMP;
      this.position.addScaledVector(this.velocity, dt);
      this.position.addScaledVector(perp, wobble * dt);
      // hit far plane?
      if (this.position.z < -8 || this.lifeLeft <= 0) {
        this.detonate();
      }
    }

    // visuals (run for charge + flight)
    const r = THREE.MathUtils.lerp(0.05, CONFIG.EBALL_MAX_CHARGE_RADIUS, this.charge);
    this.core.position.copy(this.position);
    this.core.scale.setScalar(r * 0.7);
    this.aura.position.copy(this.position);
    this.aura.scale.setScalar(r * 1.4);

    // nucleus — small solid sphere at center, pulses slightly with charge
    this.nucleus.position.copy(this.position);
    const nucleusPulse = 0.85 + 0.15 * Math.sin(t * 8);
    this.nucleus.scale.setScalar(r * 0.25 * nucleusPulse);
    this.nucMat.color.setHex(CONFIG.EBALL_COLOR_CORE);

    // equatorial ring — orbits the ball on a tilted axis, spins fast
    this.equatorialRing.position.copy(this.position);
    this.equatorialRing.rotation.x = 0.5 + Math.sin(t * 0.8) * 0.3;
    this.equatorialRing.rotation.z += dt * 2.2;
    this.equatorialRing.scale.setScalar(r * 1.1);
    this.ringMat.color.setHex(CONFIG.EBALL_COLOR_AURA);

    // pull color from current CONFIG (so preset cross-fade reflects live)
    this.coreMat.uniforms.uCore.value.setHex(CONFIG.EBALL_COLOR_CORE);
    this.coreMat.uniforms.uAura.value.setHex(CONFIG.EBALL_COLOR_AURA);
    this.auraMat.uniforms.uCore.value.setHex(CONFIG.EBALL_COLOR_AURA);
    this.auraMat.uniforms.uAura.value.setHex(CONFIG.EBALL_COLOR_CORE);

    // orbit particles
    const positions = this.orbitPositions;
    for (let i = 0; i < this.orbits.length; i++) {
      const o = this.orbits[i];
      o.theta += o.speed * dt;
      o.phi += o.precess * dt;
      const rr = o.r * r * 1.5;
      const x = rr * Math.sin(o.phi) * Math.cos(o.theta);
      const y = rr * Math.sin(o.phi) * Math.sin(o.theta);
      const z = rr * Math.cos(o.phi);
      positions[i*3+0] = this.position.x + x;
      positions[i*3+1] = this.position.y + y;
      positions[i*3+2] = this.position.z + z;
    }
    this.orbitGeo.attributes.position.needsUpdate = true;

    // crackle arcs — spawn at preset rate, age existing
    if (Math.random() < CONFIG.EBALL_CRACKLE_HZ * dt) this._spawnCrackle();
    for (let i = this.crackles.length - 1; i >= 0; i--) {
      const c = this.crackles[i];
      c.age += dt;
      const u = c.age / ARC_LIFE;
      c.line.material.opacity = Math.max(0, 1 - u);
      if (u >= 1) {
        this.scene.remove(c.line);
        c.line.geometry.dispose(); c.line.material.dispose();
        this.crackles.splice(i, 1);
      }
    }

    // mark untouched — main.js stops calling trigger when gesture lost
    this.held = false;

    if (this.lifeLeft <= 0 && this.phase !== 'flight') this.done = true;
  }

  dispose() {
    for (const c of this.crackles) {
      this.scene.remove(c.line);
      c.line.geometry.dispose(); c.line.material.dispose();
    }
    this.crackles = [];
    super.dispose();
  }
}
