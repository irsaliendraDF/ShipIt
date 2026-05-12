// Holographic orb — a sphere with an additive rim shader, bobbing above the palm.
import * as THREE from 'three';
import { BaseEffect } from './BaseEffect.js';
import { CONFIG } from '../../config.js';

const ORB_VERT = /* glsl */ `
  varying vec3 vNormal; varying vec3 vViewPos;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewPos = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;
const ORB_FRAG = /* glsl */ `
  precision mediump float;
  varying vec3 vNormal; varying vec3 vViewPos;
  uniform vec3 uColor; uniform float uTime;
  void main() {
    vec3 V = normalize(vViewPos);
    float fres = pow(1.0 - max(dot(V, vNormal), 0.0), 3.0);
    float pulse = 0.8 + 0.2 * sin(uTime * 3.0);
    vec3 col = uColor * (fres * 1.8 + 0.15) * pulse;
    gl_FragColor = vec4(col, fres * 0.9 + 0.15);
  }
`;

export class HoloOrb extends BaseEffect {
  constructor(sceneMgr) {
    super(sceneMgr);
    this.initialized = false;
    this.lifeLeft = 0;
  }
  trigger({ anchor }) {
    if (!this.initialized) this._build();
    this.lifeLeft = CONFIG.HELD_EFFECT_FADE;
    this.target.copy(anchor);
    this.target.y += 0.35; // hover above palm
  }
  _build() {
    const geo = new THREE.SphereGeometry(CONFIG.ORB_RADIUS, 32, 32);
    this.mat = new THREE.ShaderMaterial({
      vertexShader: ORB_VERT, fragmentShader: ORB_FRAG,
      uniforms: {
        uColor: { value: new THREE.Color(CONFIG.ORB_COLOR) },
        uTime: { value: 0 },
      },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    this.orb = new THREE.Mesh(geo, this.mat);
    this._track(this.orb);
    this.scene.add(this.orb);

    // Inner nucleus — small bright dot at the orb center
    const nucGeo = new THREE.SphereGeometry(CONFIG.ORB_RADIUS * 0.25, 12, 12);
    const nucMat = new THREE.MeshBasicMaterial({
      color: 0xffffff, transparent: true, opacity: 0.85,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    this.nucleus = new THREE.Mesh(nucGeo, nucMat);
    this.scene.add(this.nucleus);
    this._track(this.nucleus);

    // Orbiting ring around the orb (tilted, rotates)
    const ringGeo = new THREE.TorusGeometry(CONFIG.ORB_RADIUS * 1.4, 0.005, 6, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: CONFIG.ORB_COLOR, transparent: true, opacity: 0.7,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    this.ring = new THREE.Mesh(ringGeo, ringMat);
    this.scene.add(this.ring);
    this._track(this.ring);

    this.target = new THREE.Vector3();
    this.pos = new THREE.Vector3();
    this.t = 0;
    this.initialized = true;
  }
  update(dt) {
    this.t += dt;
    this.lifeLeft -= dt;
    this.mat.uniforms.uTime.value = this.t;

    // smooth follow + bob
    this.pos.lerp(this.target, Math.min(1, dt * 8));
    this.orb.position.copy(this.pos);
    this.orb.position.y += Math.sin(this.t * 2.5) * 0.03;

    // nucleus + ring track the orb
    this.nucleus.position.copy(this.orb.position);
    this.nucleus.scale.setScalar(0.9 + 0.1 * Math.sin(this.t * 6));
    this.ring.position.copy(this.orb.position);
    this.ring.rotation.x = 0.6 + Math.sin(this.t * 0.6) * 0.25;
    this.ring.rotation.z += dt * 1.5;

    // gentle dust motes
    if (Math.random() < 0.5) {
      const c = new THREE.Color(CONFIG.ORB_COLOR);
      const a = Math.random() * Math.PI * 2;
      const r = CONFIG.ORB_RADIUS * 1.5;
      const pos = this.orb.position.clone().add(new THREE.Vector3(
        Math.cos(a) * r, Math.sin(a) * r, (Math.random() - 0.5) * r,
      ));
      this.particles.spawn({
        pos, vel: new THREE.Vector3(0, 0.2, 0), color: c,
        size: 0.3 + Math.random() * 0.3,
        life: 0.5 + Math.random() * 0.3, alpha: 0.7, drag: 0.9,
      });
    }

    if (this.lifeLeft < 0.4) {
      const f = Math.max(0, this.lifeLeft / 0.4);
      this.orb.scale.setScalar(f);
      if (this.lifeLeft <= 0) this.done = true;
    } else {
      this.orb.scale.setScalar(1);
    }
  }
}
