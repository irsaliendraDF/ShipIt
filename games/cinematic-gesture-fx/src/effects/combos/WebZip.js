// WebZip — a web line rips horizontally across screen with trailing motion
// particles, as if the user just zipped across. Long line, lots of particles
// streaked behind it.
import * as THREE from 'three';
import { BaseEffect } from '../BaseEffect.js';
import { CONFIG } from '../../../config.js';

export class WebZip extends BaseEffect {
  trigger({ events }) {
    const web = events[0];
    const swipe = events[1];
    this.lifeLeft = 1.4;
    const swipeDir = swipe.direction.clone().normalize();

    // zip line: from swipe anchor back toward -swipeDir (source), forward toward +swipeDir
    const start = swipe.anchor.clone().addScaledVector(swipeDir, -4.0);
    const end   = swipe.anchor.clone().addScaledVector(swipeDir,  4.0);

    const points = [start, end];
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color: CONFIG.WEB_COLOR, transparent: true, opacity: 1.0,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    this.line = new THREE.Line(geo, mat);
    this.scene.add(this.line);
    this._track(this.line);

    // motion-blur particle trail: spawn many particles along the line, all
    // moving along swipeDir (fast), leaving streaks due to particle motion
    const col = new THREE.Color(CONFIG.WEB_RIM_COLOR);
    const n = Math.floor(380 * (window.__perfScale || 1));
    for (let i = 0; i < n; i++) {
      const t = Math.random();
      const p = start.clone().lerp(end, t);
      p.x += (Math.random() - 0.5) * 0.15;
      p.y += (Math.random() - 0.5) * 0.15;
      this.particles.spawn({
        pos: p,
        vel: swipeDir.clone().multiplyScalar(4 + Math.random() * 3),
        color: col,
        size: 0.5 + Math.random() * 0.5,
        life: 0.4 + Math.random() * 0.4,
        alpha: 1.0, drag: 0.6,
      });
    }
    this.sceneMgr.punch(0.8);
  }
  update(dt) {
    this.lifeLeft -= dt;
    // fade the line quickly
    this.line.material.opacity = Math.max(0, this.lifeLeft / 1.0);
    if (this.lifeLeft <= 0) this.done = true;
  }
}
