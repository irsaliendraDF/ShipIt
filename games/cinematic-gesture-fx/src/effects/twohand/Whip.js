// Whip — two trailing energy whips from each fist. Each whip is a sequence
// of segment points with simple spring-follow physics; rendered as a line.
// Every update the segments chase the wrist position with lag, producing a
// cracked/trailing look when the user moves.
import * as THREE from 'three';
import { BaseEffect } from '../BaseEffect.js';
import { CONFIG } from '../../../config.js';

const SEGMENTS = 14;

function makeWhip(scene, color) {
  const positions = new Float32Array(SEGMENTS * 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.LineBasicMaterial({
    color, transparent: true, opacity: 0.95,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const line = new THREE.Line(geo, mat);
  scene.add(line);
  return { line, positions, geo, segs: new Array(SEGMENTS).fill(0).map(() => new THREE.Vector3()) };
}

export class Whip extends BaseEffect {
  constructor(sceneMgr) {
    super(sceneMgr);
    this.initialized = false;
    this.lifeLeft = 0;
    this.targetL = new THREE.Vector3();
    this.targetR = new THREE.Vector3();
  }

  trigger({ extra }) {
    if (!this.initialized) this._build();
    this.lifeLeft = CONFIG.HELD_EFFECT_FADE;
    if (extra?.leftWrist) this.targetL.copy(extra.leftWrist);
    if (extra?.rightWrist) this.targetR.copy(extra.rightWrist);
    if (!this._seeded) {
      // seed whip segments at the wrists so first frame doesn't flash from origin
      for (let i = 0; i < SEGMENTS; i++) {
        this.whipL.segs[i].copy(this.targetL);
        this.whipR.segs[i].copy(this.targetR);
      }
      this._seeded = true;
    }
  }

  _build() {
    const col = new THREE.Color(CONFIG.WHIP_COLOR);
    this.whipL = makeWhip(this.scene, col);
    this.whipR = makeWhip(this.scene, col);
    this._track(this.whipL.line);
    this._track(this.whipR.line);

    // Bright tip-glow spheres at the end of each whip
    const tipMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(CONFIG.WHIP_COLOR).multiplyScalar(1.8),
      transparent: true, opacity: 0.95,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const tipGeo = new THREE.SphereGeometry(0.08, 10, 10);
    this.tipL = new THREE.Mesh(tipGeo, tipMat);
    this.tipR = new THREE.Mesh(tipGeo, tipMat.clone());
    this.scene.add(this.tipL); this.scene.add(this.tipR);
    this._track(this.tipL); this._track(this.tipR);

    this.initialized = true;
  }

  // spring-follow: segment 0 chases the wrist, each subsequent segment chases
  // the segment in front with a slower lerp. Produces nice whippy trails.
  _integrate(whip, target, dt) {
    whip.segs[0].lerp(target, Math.min(1, dt * 24));
    for (let i = 1; i < SEGMENTS; i++) {
      whip.segs[i].lerp(whip.segs[i - 1], Math.min(1, dt * (18 - i * 0.9)));
    }
    for (let i = 0; i < SEGMENTS; i++) {
      whip.positions[i * 3 + 0] = whip.segs[i].x;
      whip.positions[i * 3 + 1] = whip.segs[i].y;
      whip.positions[i * 3 + 2] = whip.segs[i].z;
    }
    whip.geo.attributes.position.needsUpdate = true;
    whip.geo.computeBoundingSphere();
  }

  update(dt) {
    this.lifeLeft -= dt;
    this._integrate(this.whipL, this.targetL, dt);
    this._integrate(this.whipR, this.targetR, dt);

    // tip glow spheres track the last segment of each whip, pulsing
    const pulse = 0.85 + 0.15 * Math.sin(performance.now() * 0.012);
    this.tipL.position.copy(this.whipL.segs[SEGMENTS - 1]);
    this.tipR.position.copy(this.whipR.segs[SEGMENTS - 1]);
    this.tipL.scale.setScalar(pulse);
    this.tipR.scale.setScalar(pulse);

    // sparks trailing off the whip tip each frame
    const col = new THREE.Color(CONFIG.WHIP_COLOR);
    const tips = [this.whipL.segs[SEGMENTS - 1], this.whipR.segs[SEGMENTS - 1]];
    for (const tip of tips) {
      for (let i = 0; i < 2; i++) {
        this.particles.spawn({
          pos: tip.clone(),
          vel: new THREE.Vector3((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, 0),
          color: col, size: 0.4 + Math.random() * 0.4,
          life: 0.25 + Math.random() * 0.25,
          alpha: 1.0, drag: 0.4,
        });
      }
    }

    if (this.lifeLeft <= 0) {
      // fade out by dropping opacity
      this.whipL.line.material.opacity *= 0.7;
      this.whipR.line.material.opacity *= 0.7;
      if (this.whipL.line.material.opacity < 0.05) this.done = true;
    }
  }
}
