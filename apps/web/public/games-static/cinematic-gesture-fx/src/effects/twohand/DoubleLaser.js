// DoubleLaser — two parallel laser beams with an interference glow between
// them. Uses two core cylinders + a wider glow plane strip connecting them.
import * as THREE from 'three';
import { BaseEffect } from '../BaseEffect.js';
import { CONFIG } from '../../../config.js';

export class DoubleLaser extends BaseEffect {
  constructor(sceneMgr) {
    super(sceneMgr);
    this.initialized = false;
    this.lifeLeft = 0;
  }
  trigger({ direction, extra }) {
    if (!this.initialized) this._build();
    this.lifeLeft = CONFIG.HELD_EFFECT_FADE;
    this.direction.copy(direction.clone().normalize());
    if (extra?.leftTip) this.leftTip.copy(extra.leftTip);
    if (extra?.rightTip) this.rightTip.copy(extra.rightTip);

    // emit sparks at interference midpoint
    const mid = this.leftTip.clone().add(this.rightTip).multiplyScalar(0.5);
    const c = new THREE.Color(CONFIG.LASER_GLOW_COLOR);
    for (let i = 0; i < 4; i++) {
      this.particles.spawn({
        pos: mid.clone().addScaledVector(this.direction, Math.random() * 7),
        vel: new THREE.Vector3((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5, 0),
        color: c, size: 0.4 + Math.random() * 0.4,
        life: 0.25 + Math.random() * 0.2,
        alpha: 1.0, drag: 0.8,
      });
    }
  }
  _build() {
    this.direction = new THREE.Vector3(0, 0, -1);
    this.leftTip = new THREE.Vector3();
    this.rightTip = new THREE.Vector3();
    const len = 7;
    const geoA = new THREE.CylinderGeometry(0.02, 0.02, len, 8);
    const matA = new THREE.MeshBasicMaterial({
      color: CONFIG.LASER_CORE_COLOR, transparent: true, opacity: 1.0,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    this.beamL = new THREE.Mesh(geoA, matA);
    this.beamR = new THREE.Mesh(geoA.clone(), matA.clone());
    this.scene.add(this.beamL); this.scene.add(this.beamR);
    this._track(this.beamL); this._track(this.beamR);

    // interference: additive flat plane connecting the two beams, soft alpha
    const planeGeo = new THREE.PlaneGeometry(1, len);
    const planeMat = new THREE.MeshBasicMaterial({
      color: CONFIG.LASER_GLOW_COLOR, transparent: true, opacity: 0.25,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    });
    this.interference = new THREE.Mesh(planeGeo, planeMat);
    this.scene.add(this.interference);
    this._track(this.interference);

    this.len = len;
    this.initialized = true;
  }
  update(dt) {
    this.lifeLeft -= dt;
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), this.direction);
    const qPlane = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), this.direction);

    const midL = this.leftTip.clone().addScaledVector(this.direction, this.len * 0.5);
    const midR = this.rightTip.clone().addScaledVector(this.direction, this.len * 0.5);
    this.beamL.position.copy(midL); this.beamL.quaternion.copy(q);
    this.beamR.position.copy(midR); this.beamR.quaternion.copy(q);

    const midMid = midL.clone().add(midR).multiplyScalar(0.5);
    const width = this.leftTip.distanceTo(this.rightTip);
    this.interference.position.copy(midMid);
    this.interference.quaternion.copy(qPlane);
    this.interference.scale.set(Math.max(0.1, width), 1, 1);

    if (this.lifeLeft < 0.18) {
      const f = Math.max(0, this.lifeLeft / 0.18);
      this.beamL.material.opacity = f;
      this.beamR.material.opacity = f;
      this.interference.material.opacity = 0.25 * f;
      if (this.lifeLeft <= 0) this.done = true;
    }
  }
}
