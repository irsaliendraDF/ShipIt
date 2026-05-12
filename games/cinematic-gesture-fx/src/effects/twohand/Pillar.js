// Pillar — vertical light column shooting upward from pressed palms.
// Tall cylinder with volumetric shader + slow rotation + rising dust motes.
import * as THREE from 'three';
import { BaseEffect } from '../BaseEffect.js';
import { VOLUMETRIC_VERT, VOLUMETRIC_FRAG } from '../../shaders/ParticleShaders.js';
import { CONFIG } from '../../../config.js';

export class Pillar extends BaseEffect {
  constructor(sceneMgr) {
    super(sceneMgr);
    this.initialized = false;
    this.lifeLeft = 0;
  }
  trigger({ anchor }) {
    if (!this.initialized) this._build();
    this.lifeLeft = CONFIG.HELD_EFFECT_FADE;
    this.anchor.copy(anchor);
    // rising embers
    const col = new THREE.Color(CONFIG.PRAYER_PILLAR_COLOR);
    for (let i = 0; i < 6; i++) {
      this.particles.spawn({
        pos: anchor.clone().add(new THREE.Vector3(
          (Math.random() - 0.5) * 0.4, Math.random() * 2, (Math.random() - 0.5) * 0.4,
        )),
        vel: new THREE.Vector3(0, 1.5 + Math.random(), 0),
        color: col, size: 0.4 + Math.random() * 0.5,
        life: 0.7 + Math.random() * 0.5,
        alpha: 0.9, drag: 0.95,
      });
    }
  }
  _build() {
    this.anchor = new THREE.Vector3();
    const geo = new THREE.CylinderGeometry(0.3, 0.5, 6.0, 28, 1, true);
    this.mat = new THREE.ShaderMaterial({
      vertexShader: VOLUMETRIC_VERT, fragmentShader: VOLUMETRIC_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(CONFIG.PRAYER_PILLAR_COLOR) },
        uIntensity: { value: 1.0 }, uLengthFade: { value: 0.5 },
      },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    });
    this.cyl = new THREE.Mesh(geo, this.mat);
    this.scene.add(this.cyl);
    this._track(this.cyl);

    // Base ring — where the pillar originates (at the user's palms)
    const baseRingGeo = new THREE.TorusGeometry(0.55, 0.025, 8, 64);
    const baseRingMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(CONFIG.PRAYER_PILLAR_COLOR).multiplyScalar(1.4),
      transparent: true, opacity: 0.9,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    this.baseRing = new THREE.Mesh(baseRingGeo, baseRingMat);
    this.baseRing.rotation.x = Math.PI / 2; // horizontal
    this.scene.add(this.baseRing);
    this._track(this.baseRing);

    // Cap halo — at the top of the pillar, slightly wider
    const capRingGeo = new THREE.TorusGeometry(0.4, 0.02, 8, 48);
    this.capRing = new THREE.Mesh(capRingGeo, baseRingMat.clone());
    this.capRing.rotation.x = Math.PI / 2;
    this.scene.add(this.capRing);
    this._track(this.capRing);
    this.initialized = true;
  }
  update(dt) {
    this.lifeLeft -= dt;
    this.mat.uniforms.uTime.value += dt;
    // place: base at anchor, extending upward
    this.cyl.position.copy(this.anchor).add(new THREE.Vector3(0, 3.0, 0));
    this.cyl.rotation.y += 0.6 * dt;

    // base + cap rings track the pillar
    this.baseRing.position.copy(this.anchor);
    this.capRing.position.copy(this.anchor).add(new THREE.Vector3(0, 6.0, 0));
    // both rings spin slowly
    this.baseRing.rotation.z += dt * 0.8;
    this.capRing.rotation.z -= dt * 1.1;
    if (this.lifeLeft < 0.5) {
      const f = Math.max(0, this.lifeLeft / 0.5);
      this.mat.uniforms.uIntensity.value = f;
      if (this.lifeLeft <= 0) this.done = true;
    }
  }
}
