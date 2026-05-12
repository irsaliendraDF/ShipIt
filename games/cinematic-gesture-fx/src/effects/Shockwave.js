// Shockwave — 3D disc that expands outward, tilted so its normal points
// toward the camera-to-impact vector (with a small jitter for drama).
// Shader draws a bright travelling ring band + central flash, fades with life.
import * as THREE from 'three';
import { BaseEffect } from './BaseEffect.js';
import { SHOCKWAVE_VERT, SHOCKWAVE_FRAG } from '../shaders/ParticleShaders.js';
import { CONFIG } from '../../config.js';

export class Shockwave extends BaseEffect {
  trigger({ anchor, maxRadius = CONFIG.SHOCKWAVE_MAX_RADIUS, life = CONFIG.SHOCKWAVE_LIFE,
            color = CONFIG.SHOCKWAVE_COLOR, burstParticles = true }) {
    this.anchor = anchor.clone();
    this.maxRadius = maxRadius;
    this.life = life;
    this.t = 0;

    const geo = new THREE.PlaneGeometry(maxRadius * 2, maxRadius * 2);
    this.mat = new THREE.ShaderMaterial({
      vertexShader: SHOCKWAVE_VERT,
      fragmentShader: SHOCKWAVE_FRAG,
      uniforms: {
        uProgress: { value: 0 },
        uColor: { value: new THREE.Color(color) },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geo, this.mat);
    mesh.position.copy(this.anchor);

    // orient the disc so its normal points toward the camera, with a small tilt
    const camPos = this.sceneMgr.camera.position;
    const toCam = camPos.clone().sub(this.anchor).normalize();
    // jitter the facing slightly so it doesn't feel flat
    toCam.x += (Math.random() - 0.5) * 0.25;
    toCam.y += (Math.random() - 0.5) * 0.25;
    toCam.normalize();
    // align +Z of the plane to toCam
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), toCam);
    mesh.quaternion.copy(q);

    this.scene.add(mesh);
    this._track(mesh);

    // optional particle burst tangent to ring + debris trailing outward
    if (burstParticles) {
      const count = Math.floor(80 * (window.__perfScale || 1));
      const c = new THREE.Color(color);
      const basisX = new THREE.Vector3(1, 0, 0).applyQuaternion(q);
      const basisY = new THREE.Vector3(0, 1, 0).applyQuaternion(q);
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const dir = basisX.clone().multiplyScalar(Math.cos(a))
          .add(basisY.clone().multiplyScalar(Math.sin(a)));
        const speed = 2.5 + Math.random() * 3.5;
        this.particles.spawn({
          pos: this.anchor.clone().addScaledVector(dir, 0.15),
          vel: dir.multiplyScalar(speed),
          color: c,
          size: 0.6 + Math.random() * 0.8,
          life: 0.4 + Math.random() * 0.5,
          alpha: 1.0,
          drag: 0.35,
        });
      }
      // DEBRIS — slower, bigger, gravity-affected chunks that give the
      // shockwave weight (like dust kicked up by the impact).
      const debrisCount = Math.floor(24 * (window.__perfScale || 1));
      const debrisCol = new THREE.Color(color).multiplyScalar(0.55); // dimmer so it reads as dust
      for (let i = 0; i < debrisCount; i++) {
        const a = Math.random() * Math.PI * 2;
        const dir = basisX.clone().multiplyScalar(Math.cos(a))
          .add(basisY.clone().multiplyScalar(Math.sin(a)));
        dir.y += 0.25; // arc upward slightly
        this.particles.spawn({
          pos: this.anchor.clone().addScaledVector(dir, 0.1),
          vel: dir.multiplyScalar(1.3 + Math.random() * 1.2),
          color: debrisCol,
          size: 1.1 + Math.random() * 0.9,
          life: 0.7 + Math.random() * 0.6,
          alpha: 0.65, drag: 0.55, gravityY: -3.2,
        });
      }
    }

    // ECHO RING — a second, dimmer shockwave that trails slightly behind
    // the primary. Adds the double-ring feel you see in movie explosions.
    if (burstParticles) {
      this._echoFor = { maxRadius: maxRadius * 0.8, life: life * 0.8, color, delay: 0.12 };
    }
  }

  update(dt) {
    this.t += dt;
    const p = Math.min(1, this.t / this.life);
    this.mat.uniforms.uProgress.value = p;
    // gentle pulse in scale: slight overshoot then settle
    const s = 0.2 + p * 1.0 + Math.sin(p * Math.PI * 6) * 0.01;
    this.objects[0].scale.setScalar(s);

    // Fire the echo ring after the configured delay. One-shot guard.
    if (this._echoFor && this.t >= this._echoFor.delay) {
      const e = new Shockwave(this.sceneMgr);
      e.trigger({
        anchor: this.anchor.clone(),
        maxRadius: this._echoFor.maxRadius,
        life: this._echoFor.life,
        color: this._echoFor.color,
        burstParticles: false, // echo has no debris — just the ring
      });
      this.sceneMgr.addEffect(e);
      this._echoFor = null;
    }

    if (p >= 1) this.done = true;
  }
}
