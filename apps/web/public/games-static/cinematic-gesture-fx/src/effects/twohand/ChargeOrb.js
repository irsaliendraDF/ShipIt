// ChargeOrb — glowing sphere between hands, grows with charge progress.
// Orbiting sparks, inward dust inflow particles. Does NOT auto-detonate;
// release/snap-outward is handled by the Unibeam combo.
import * as THREE from 'three';
import { BaseEffect } from '../BaseEffect.js';
import { CONFIG } from '../../../config.js';

const VERT = `
  varying vec3 vNormal; varying vec3 vV;
  void main(){ vNormal=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vV=-mv.xyz;
    gl_Position=projectionMatrix*mv; }
`;
const FRAG = `
  precision mediump float; varying vec3 vNormal; varying vec3 vV;
  uniform vec3 uCore; uniform vec3 uRim; uniform float uTime; uniform float uCharge;
  void main(){
    vec3 V=normalize(vV);
    float fres=pow(1.0-max(dot(V,vNormal),0.0), 2.0);
    float pulse = 0.8 + 0.2 * sin(uTime * 6.0);
    vec3 col = mix(uCore, uRim, fres) * (fres * 2.4 + 0.25) * pulse * (0.6 + uCharge);
    gl_FragColor = vec4(col, fres * 0.9 + 0.2);
  }
`;

export class ChargeOrb extends BaseEffect {
  constructor(sceneMgr) {
    super(sceneMgr);
    this.initialized = false;
    this.lifeLeft = 0;
    this.charge = 0;
  }
  trigger({ anchor, extra }) {
    if (!this.initialized) this._build();
    this.lifeLeft = CONFIG.HELD_EFFECT_FADE;
    this.orb.position.copy(anchor);
    this.charge = extra?.charge ?? 0;
    this.mat.uniforms.uCharge.value = this.charge;
    const s = 0.1 + this.charge * 0.45;
    this.orb.scale.setScalar(s);

    // inflow dust toward the orb
    const c = new THREE.Color(CONFIG.CHARGE_RIM_COLOR);
    const n = Math.floor(4 * (window.__perfScale || 1));
    for (let i = 0; i < n; i++) {
      const dir = new THREE.Vector3(
        Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5,
      ).normalize();
      const pos = anchor.clone().addScaledVector(dir, 0.6 + Math.random() * 0.8);
      const vel = dir.multiplyScalar(-(2 + this.charge * 3));
      this.particles.spawn({
        pos, vel, color: c,
        size: 0.3 + Math.random() * 0.3,
        life: 0.3, alpha: 0.9, drag: 0.3,
      });
    }
  }
  _build() {
    const geo = new THREE.SphereGeometry(1.0, 32, 32);
    this.mat = new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG,
      uniforms: {
        uCore: { value: new THREE.Color(CONFIG.CHARGE_CORE_COLOR) },
        uRim: { value: new THREE.Color(CONFIG.CHARGE_RIM_COLOR) },
        uTime: { value: 0 }, uCharge: { value: 0 },
      },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    this.orb = new THREE.Mesh(geo, this.mat);
    this.scene.add(this.orb);
    this._track(this.orb);

    // Inner nucleus — small solid bright sphere at center
    const nucGeo = new THREE.SphereGeometry(0.25, 16, 16);
    const nucMat = new THREE.MeshBasicMaterial({
      color: 0xffffff, transparent: true, opacity: 0.85,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    this.nucleus = new THREE.Mesh(nucGeo, nucMat);
    this.scene.add(this.nucleus);
    this._track(this.nucleus);

    // Spark crown — 6 small sprites arranged around the orb that pulse
    this.sparks = [];
    const sparkMat = new THREE.MeshBasicMaterial({
      color: CONFIG.CHARGE_RIM_COLOR, transparent: true, opacity: 0.8,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    for (let i = 0; i < 6; i++) {
      const sGeo = new THREE.SphereGeometry(0.06, 8, 8);
      const s = new THREE.Mesh(sGeo, sparkMat);
      this.scene.add(s);
      this._track(s);
      this.sparks.push({ mesh: s,
        theta: Math.random() * Math.PI * 2,
        phi: Math.acos(2 * Math.random() - 1),
        speed: 1 + Math.random() * 1.5,
      });
    }
    this.initialized = true;
  }
  update(dt) {
    this.lifeLeft -= dt;
    this.mat.uniforms.uTime.value += dt;

    // nucleus tracks orb + pulses
    if (this.nucleus && this.orb) {
      this.nucleus.position.copy(this.orb.position);
      const r = this.orb.scale.x;
      const pulse = 0.9 + 0.1 * Math.sin(performance.now() * 0.008);
      this.nucleus.scale.setScalar(r * pulse);
    }

    // spark crown orbits with charge-dependent radius
    const r = this.orb?.scale.x || 0.1;
    for (const sp of this.sparks) {
      sp.theta += sp.speed * dt;
      sp.phi += sp.speed * 0.3 * dt;
      const rad = r * (1.25 + 0.15 * Math.sin(performance.now() * 0.004 + sp.theta));
      sp.mesh.position.copy(this.orb.position)
        .add(new THREE.Vector3(
          rad * Math.sin(sp.phi) * Math.cos(sp.theta),
          rad * Math.sin(sp.phi) * Math.sin(sp.theta),
          rad * Math.cos(sp.phi),
        ));
      sp.mesh.scale.setScalar(r * 0.8);
    }

    if (this.lifeLeft < 0.2) {
      const f = Math.max(0, this.lifeLeft / 0.2);
      this.orb.scale.multiplyScalar(f > 0 ? 1 : 0);
      if (this.lifeLeft <= 0) this.done = true;
    }
  }
}
