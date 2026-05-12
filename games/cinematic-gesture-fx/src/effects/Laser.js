// Laser: very thin bright core cylinder + wider volumetric glow cylinder,
// extended from fingertip along finger direction until it hits the back plane.
// Dust motes drift through the beam; sparks pop where it "hits".
import * as THREE from 'three';
import { BaseEffect } from './BaseEffect.js';
import { VOLUMETRIC_VERT, VOLUMETRIC_FRAG } from '../shaders/ParticleShaders.js';
import { CONFIG } from '../../config.js';

export class Laser extends BaseEffect {
  constructor(sceneMgr) {
    super(sceneMgr);
    this.initialized = false;
    this.lifeLeft = 0;
  }

  trigger({ anchor, direction }) {
    if (!this.initialized) this._build();
    this.lifeLeft = CONFIG.HELD_EFFECT_FADE;
    this.anchor.copy(anchor);
    this.direction.copy(direction.clone().normalize());

    // emit dust motes and occasional impact sparks
    const col = new THREE.Color(CONFIG.LASER_GLOW_COLOR);
    const per = Math.floor(5 * (window.__perfScale || 1));
    for (let i = 0; i < per; i++) {
      const t = Math.random();
      const pos = this.anchor.clone().addScaledVector(this.direction, t * 8.0);
      pos.x += (Math.random() - 0.5) * 0.08;
      pos.y += (Math.random() - 0.5) * 0.08;
      this.particles.spawn({
        pos,
        vel: new THREE.Vector3((Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3, 0),
        color: col,
        size: 0.3 + Math.random() * 0.4,
        life: 0.3 + Math.random() * 0.4,
        alpha: 0.8, drag: 0.85,
      });
    }
    // impact sparks at the far end
    if (Math.random() < 0.4) {
      const hit = this.anchor.clone().addScaledVector(this.direction, 8.0);
      const sparks = Math.floor(6 * (window.__perfScale || 1));
      for (let i = 0; i < sparks; i++) {
        const dir = new THREE.Vector3(
          (Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5),
        ).normalize().multiplyScalar(2 + Math.random() * 2.5);
        this.particles.spawn({
          pos: hit.clone(), vel: dir, color: col,
          size: 0.5 + Math.random() * 0.5,
          life: 0.25 + Math.random() * 0.2,
          alpha: 1.0, drag: 0.4,
        });
      }
    }
  }

  _build() {
    this.anchor = new THREE.Vector3();
    this.direction = new THREE.Vector3(0, 0, -1);

    const length = 8.0;
    // thin core
    const coreGeo = new THREE.CylinderGeometry(
      CONFIG.LASER_THICKNESS, CONFIG.LASER_THICKNESS, length, 8, 1, true,
    );
    const coreMat = new THREE.MeshBasicMaterial({
      color: CONFIG.LASER_CORE_COLOR, transparent: true, opacity: 1.0,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    });
    this.core = new THREE.Mesh(coreGeo, coreMat);
    this._track(this.core);
    this.scene.add(this.core);

    // wider volumetric glow
    const glowGeo = new THREE.CylinderGeometry(0.08, 0.05, length, 16, 1, true);
    this.glowMat = new THREE.ShaderMaterial({
      vertexShader: VOLUMETRIC_VERT,
      fragmentShader: VOLUMETRIC_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(CONFIG.LASER_GLOW_COLOR) },
        uIntensity: { value: 1.0 },
        uLengthFade: { value: 0.3 },
      },
      transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    });
    this.glow = new THREE.Mesh(glowGeo, this.glowMat);
    this._track(this.glow);
    this.scene.add(this.glow);

    this.length = length;
    this.initialized = true;
  }

  update(dt) {
    if (!this.initialized) { this.done = true; return; }
    this.lifeLeft -= dt;
    this.glowMat.uniforms.uTime.value += dt;

    const mid = this.anchor.clone().addScaledVector(this.direction, this.length * 0.5);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), this.direction);
    this.core.position.copy(mid); this.core.quaternion.copy(q);
    this.glow.position.copy(mid); this.glow.quaternion.copy(q);

    // fade
    if (this.lifeLeft < 0.15) {
      const f = Math.max(0, this.lifeLeft / 0.15);
      this.core.material.opacity = f;
      this.glowMat.uniforms.uIntensity.value = f;
      if (this.lifeLeft <= 0) this.done = true;
    }
  }
}
