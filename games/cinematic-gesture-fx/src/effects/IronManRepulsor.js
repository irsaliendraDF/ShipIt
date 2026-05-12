// Iron Man repulsor: bright core beam + wide volumetric cone + dust motes +
// a shockwave ring at the palm + brief camera shake.
// Held gesture: while trigger() keeps firing, we extend life and re-spawn motes.
import * as THREE from 'three';
import { BaseEffect } from './BaseEffect.js';
import { VOLUMETRIC_VERT, VOLUMETRIC_FRAG } from '../shaders/ParticleShaders.js';
import { CONFIG } from '../../config.js';
import { Shockwave } from './Shockwave.js';

export class IronManRepulsor extends BaseEffect {
  constructor(sceneMgr) {
    super(sceneMgr);
    this.lifeLeft = 0;
    this.initialized = false;
  }

  trigger({ anchor, direction }) {
    if (!this.initialized) this._build(anchor, direction);
    // each call while the gesture holds re-energizes the beam; long fade
    // means the beam stays attached through brief tracking dropouts
    this.lifeLeft = CONFIG.HELD_EFFECT_FADE;
    this.anchor.copy(anchor);
    this.direction.copy(direction);

    // dust motes along the beam
    const n = Math.floor(8 * (window.__perfScale || 1));
    const glow = new THREE.Color(CONFIG.REPULSOR_GLOW_COLOR);
    for (let i = 0; i < n; i++) {
      const t = Math.random();
      const off = this.direction.clone().multiplyScalar(t * CONFIG.REPULSOR_LENGTH);
      const jit = new THREE.Vector3(
        (Math.random() - 0.5) * CONFIG.REPULSOR_RADIUS * 1.5,
        (Math.random() - 0.5) * CONFIG.REPULSOR_RADIUS * 1.5,
        (Math.random() - 0.5) * CONFIG.REPULSOR_RADIUS * 0.5,
      );
      this.particles.spawn({
        pos: this.anchor.clone().add(off).add(jit),
        vel: this.direction.clone().multiplyScalar(6 + Math.random() * 2),
        color: glow,
        size: 0.4 + Math.random() * 0.6,
        life: 0.25 + Math.random() * 0.3,
        alpha: 0.9,
        drag: 0.7,
      });
    }
  }

  _build(anchor, direction) {
    this.anchor = anchor.clone();
    this.direction = direction.clone().normalize();

    // --- inner core beam (cylinder, very thin, bright core color) ---
    const coreGeo = new THREE.CylinderGeometry(
      CONFIG.REPULSOR_RADIUS * 0.25, CONFIG.REPULSOR_RADIUS * 0.1,
      CONFIG.REPULSOR_LENGTH, 12, 1, true,
    );
    const coreMat = new THREE.MeshBasicMaterial({
      color: CONFIG.REPULSOR_CORE_COLOR,
      transparent: true, opacity: 0.55,  // was 0.95 — reveals shape instead of white blob
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    });
    this.core = new THREE.Mesh(coreGeo, coreMat);
    this._track(this.core);
    this.scene.add(this.core);

    // --- INNER PLASMA FILAMENT: a very thin, hotter-colored line inside the
    // core cylinder. Gives the beam a distinct "hot line" reading.
    const filamentGeo = new THREE.CylinderGeometry(
      CONFIG.REPULSOR_RADIUS * 0.05, CONFIG.REPULSOR_RADIUS * 0.02,
      CONFIG.REPULSOR_LENGTH, 6, 1, true,
    );
    const filamentMat = new THREE.MeshBasicMaterial({
      color: 0xffffff, transparent: true, opacity: 0.7,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    });
    this.filament = new THREE.Mesh(filamentGeo, filamentMat);
    this._track(this.filament);
    this.scene.add(this.filament);

    // --- PALM APERTURE RING: a small bright torus at the palm, facing
    // forward (along the beam) — iconic Tony Stark repulsor detail.
    const apertureGeo = new THREE.TorusGeometry(
      CONFIG.REPULSOR_RADIUS * 0.55,   // radius
      CONFIG.REPULSOR_RADIUS * 0.07,   // thickness
      8, 48,
    );
    const apertureMat = new THREE.MeshBasicMaterial({
      color: CONFIG.REPULSOR_CORE_COLOR,
      transparent: true, opacity: 0.9,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    this.aperture = new THREE.Mesh(apertureGeo, apertureMat);
    this._track(this.aperture);
    this.scene.add(this.aperture);

    // --- outer volumetric cone (wider, fades along length) ---
    const coneGeo = new THREE.CylinderGeometry(
      CONFIG.REPULSOR_RADIUS * 1.2, CONFIG.REPULSOR_RADIUS * 0.3,
      CONFIG.REPULSOR_LENGTH, 24, 1, true,
    );
    this.coneMat = new THREE.ShaderMaterial({
      vertexShader: VOLUMETRIC_VERT,
      fragmentShader: VOLUMETRIC_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(CONFIG.REPULSOR_GLOW_COLOR) },
        uIntensity: { value: 0.55 },  // was 1.2 — cone reads as structure, not glow
        uLengthFade: { value: 0.6 },
      },
      transparent: true, depthWrite: false, side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    this.cone = new THREE.Mesh(coneGeo, this.coneMat);
    this._track(this.cone);
    this.scene.add(this.cone);

    // palm flash ring
    const flash = new Shockwave(this.sceneMgr);
    flash.trigger({
      anchor: anchor.clone(), maxRadius: 0.8,
      life: 0.35, color: CONFIG.REPULSOR_CORE_COLOR, burstParticles: false,
    });
    this.sceneMgr.addEffect(flash);

    this.sceneMgr.punch(0.8);
    this.initialized = true;
  }

  update(dt) {
    if (!this.initialized) { this.done = true; return; }
    this.lifeLeft -= dt;
    this.coneMat.uniforms.uTime.value += dt;

    // orient all cylinders along the direction vector
    const mid = this.anchor.clone().addScaledVector(this.direction, CONFIG.REPULSOR_LENGTH * 0.5);
    const up = new THREE.Vector3(0, 1, 0);
    const q = new THREE.Quaternion().setFromUnitVectors(up, this.direction);
    this.core.position.copy(mid); this.core.quaternion.copy(q);
    this.filament.position.copy(mid); this.filament.quaternion.copy(q);
    this.cone.position.copy(mid); this.cone.quaternion.copy(q);

    // Aperture torus sits AT the palm, normal aligned with beam direction.
    // The torus's default axis is +Z, so we rotate +Z to match the beam dir.
    this.aperture.position.copy(this.anchor);
    this.aperture.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), this.direction);
    // subtle spin on the aperture so it feels alive
    this.aperture.rotateZ(dt * 4.0);

    // fade out if gesture stopped firing
    if (this.lifeLeft < 0.2) {
      const f = Math.max(0, this.lifeLeft / 0.2);
      this.core.material.opacity = 0.55 * f;
      this.filament.material.opacity = 0.7 * f;
      this.aperture.material.opacity = 0.9 * f;
      this.coneMat.uniforms.uIntensity.value = 0.55 * f;
      if (this.lifeLeft <= 0) this.done = true;
    } else {
      this.core.material.opacity = 0.55;
      this.filament.material.opacity = 0.7;
      this.aperture.material.opacity = 0.9;
      this.coneMat.uniforms.uIntensity.value = 0.55;
    }
  }
}
