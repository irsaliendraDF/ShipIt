// Swipe slash: a curved line of particles fired along the swipe direction,
// perpendicular to the movement to feel like a "cut".
import * as THREE from 'three';
import { BaseEffect } from './BaseEffect.js';
import { CONFIG } from '../../config.js';

export class SwipeSlash extends BaseEffect {
  trigger({ anchor, direction }) {
    const col = new THREE.Color(CONFIG.SWIPE_COLOR);
    const n = Math.floor(CONFIG.SWIPE_COUNT * (window.__perfScale || 1));
    // perpendicular to swipe direction, in screen plane
    const perp = new THREE.Vector3(-direction.y, direction.x, 0).normalize();
    for (let i = 0; i < n; i++) {
      const t = (i / n - 0.5) * 2; // -1..1
      const pos = anchor.clone().addScaledVector(perp, t * 1.4);
      pos.z += (Math.random() - 0.5) * 0.2;
      const speed = 3 + Math.random() * 2;
      const vel = direction.clone().multiplyScalar(speed)
        .addScaledVector(perp, (Math.random() - 0.5) * 0.5);
      this.particles.spawn({
        pos, vel, color: col,
        size: 0.5 + Math.random() * 0.6,
        life: 0.4 + Math.random() * 0.3,
        alpha: 1.0, drag: 0.55,
      });
    }

    // Bright core "edge" line — a crisp slash blade drawn across the particles
    const start = anchor.clone().addScaledVector(perp, -1.4);
    const end   = anchor.clone().addScaledVector(perp,  1.4);
    const geo = new THREE.BufferGeometry().setFromPoints([start, end]);
    const mat = new THREE.LineBasicMaterial({
      color: new THREE.Color(CONFIG.SWIPE_COLOR).multiplyScalar(1.4),
      transparent: true, opacity: 1.0,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    this.edge = new THREE.Line(geo, mat);
    this.scene.add(this.edge);
    this._track(this.edge);

    this.lifeLeft = 0.5;
  }
  update(dt) {
    this.lifeLeft -= dt;
    if (this.edge) this.edge.material.opacity = Math.max(0, this.lifeLeft / 0.4);
    if (this.lifeLeft <= 0) this.done = true;
  }
}
