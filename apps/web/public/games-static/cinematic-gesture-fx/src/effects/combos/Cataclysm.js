// Cataclysm — full-screen reality warp + violent particle explosion. The
// nuclear option.
import * as THREE from 'three';
import { BaseEffect } from '../BaseEffect.js';
import { RealityWarp } from '../twohand/RealityWarp.js';
import { Shockwave } from '../Shockwave.js';
import { CONFIG } from '../../../config.js';

export class Cataclysm extends BaseEffect {
  trigger({ events }) {
    const anchor = events[events.length - 1].anchor.clone();
    this.lifeLeft = 1.8;

    // huge reality warp
    const w = new RealityWarp(this.sceneMgr);
    w.trigger({ anchor, scale: 8.0, life: 1.6, color: CONFIG.WARP_COLOR });
    this.sceneMgr.addEffect(w);

    // second warp inverted color for depth
    setTimeout(() => {
      const w2 = new RealityWarp(this.sceneMgr);
      w2.trigger({ anchor, scale: 5.5, life: 1.2, color: 0xff6aff });
      this.sceneMgr.addEffect(w2);
    }, 120);

    // slam shockwave
    const sw = new Shockwave(this.sceneMgr);
    sw.trigger({ anchor, maxRadius: 5.5, life: 1.3, color: 0xffffff, burstParticles: true });
    this.sceneMgr.addEffect(sw);

    // massive particle explosion
    const c = new THREE.Color(CONFIG.WARP_COLOR);
    const c2 = new THREE.Color(0xff6aff);
    const n = Math.floor(900 * (window.__perfScale || 1));
    for (let i = 0; i < n; i++) {
      const dir = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
      ).normalize().multiplyScalar(3 + Math.random() * 5);
      this.particles.spawn({
        pos: anchor.clone(),
        vel: dir,
        color: Math.random() < 0.7 ? c : c2,
        size: 0.5 + Math.random() * 0.9,
        life: 0.7 + Math.random() * 0.7,
        alpha: 1.0, drag: 0.3, gravityY: -0.5,
      });
    }
    this.sceneMgr.punch(3.5);
  }
  update(dt) {
    this.lifeLeft -= dt;
    if (this.lifeLeft <= 0) this.done = true;
  }
}
