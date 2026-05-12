// Wide soft volumetric cone — "flashlight in fog" feel. Used by double-palms.
import * as THREE from 'three';
import { BaseEffect } from './BaseEffect.js';
import { VOLUMETRIC_VERT, VOLUMETRIC_FRAG } from '../shaders/ParticleShaders.js';
import { CONFIG } from '../../config.js';

export class LightBeam extends BaseEffect {
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

    // dust motes drifting through the cone
    const col = new THREE.Color(CONFIG.LIGHTBEAM_COLOR);
    const per = Math.floor(10 * (window.__perfScale || 1));
    for (let i = 0; i < per; i++) {
      const t = Math.random();
      const r = (Math.random() - 0.5) * (0.3 + t * 0.9);
      const perpA = new THREE.Vector3(1, 0, 0).cross(this.direction).normalize();
      const perpB = this.direction.clone().cross(perpA).normalize();
      const pos = this.anchor.clone()
        .addScaledVector(this.direction, t * 6)
        .addScaledVector(perpA, r)
        .addScaledVector(perpB, (Math.random() - 0.5) * (0.3 + t * 0.9));
      this.particles.spawn({
        pos,
        vel: new THREE.Vector3((Math.random() - 0.5) * 0.2, 0.1 + Math.random() * 0.1, 0),
        color: col,
        size: 0.4 + Math.random() * 0.5,
        life: 0.8 + Math.random() * 0.6,
        alpha: 0.5, drag: 0.95,
      });
    }
  }

  _build() {
    this.anchor = new THREE.Vector3();
    this.direction = new THREE.Vector3(0, 0, -1);

    const geo = new THREE.CylinderGeometry(1.3, 0.3, 6, 40, 1, true);
    this.mat = new THREE.ShaderMaterial({
      vertexShader: VOLUMETRIC_VERT,
      fragmentShader: VOLUMETRIC_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(CONFIG.LIGHTBEAM_COLOR) },
        uIntensity: { value: 0.9 },
        uLengthFade: { value: 0.8 },
      },
      transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    });
    this.cone = new THREE.Mesh(geo, this.mat);
    this._track(this.cone);
    this.scene.add(this.cone);

    // Lens flare disc at the source — a small bright disc facing the beam dir
    const flareGeo = new THREE.CircleGeometry(0.28, 32);
    const flareMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(CONFIG.LIGHTBEAM_COLOR).multiplyScalar(1.2),
      transparent: true, opacity: 0.75,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    });
    this.flare = new THREE.Mesh(flareGeo, flareMat);
    this.scene.add(this.flare);
    this._track(this.flare);

    // Bright rim ring at the beam source
    const rimGeo = new THREE.TorusGeometry(0.32, 0.012, 6, 40);
    this.rim = new THREE.Mesh(rimGeo, flareMat.clone());
    this.scene.add(this.rim);
    this._track(this.rim);

    this.initialized = true;
  }

  update(dt) {
    this.lifeLeft -= dt;
    this.mat.uniforms.uTime.value += dt;

    const mid = this.anchor.clone().addScaledVector(this.direction, 3.0);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), this.direction);
    this.cone.position.copy(mid);
    this.cone.quaternion.copy(q);

    // flare disc + rim ring at source, facing along beam
    const flareQ = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), this.direction);
    this.flare.position.copy(this.anchor);
    this.flare.quaternion.copy(flareQ);
    this.rim.position.copy(this.anchor);
    this.rim.quaternion.copy(flareQ);
    this.rim.rotateZ(performance.now() * 0.0012);
    // flare pulses
    const pulse = 0.85 + 0.15 * Math.sin(performance.now() * 0.006);
    this.flare.scale.setScalar(pulse);

    if (this.lifeLeft < 0.3) {
      const f = Math.max(0, this.lifeLeft / 0.3);
      this.mat.uniforms.uIntensity.value = 0.9 * f;
      if (this.lifeLeft <= 0) this.done = true;
    }
  }
}
