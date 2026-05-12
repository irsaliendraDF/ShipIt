// Fist → Open burst: outward particle explosion + shockwave ring at the palm.
import * as THREE from 'three';
import { BaseEffect } from './BaseEffect.js';
import { Shockwave } from './Shockwave.js';
import { CONFIG } from '../../config.js';

export class FistBurst extends BaseEffect {
  trigger({ anchor }) {
    this.anchor = anchor.clone();
    this.lifeLeft = 1.0;
    this.secondaryFired = false;
    const col = new THREE.Color(0xffd27a);
    const n = Math.floor(260 * (window.__perfScale || 1));
    for (let i = 0; i < n; i++) {
      const dir = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
      ).normalize().multiplyScalar(2 + Math.random() * 4);
      this.particles.spawn({
        pos: anchor.clone(),
        vel: dir,
        color: col,
        size: 0.5 + Math.random() * 0.7,
        life: 0.5 + Math.random() * 0.4,
        alpha: 1.0, drag: 0.4, gravityY: -1.0,
      });
    }

    // smoke/dust ring — slower, dimmer particles forming a persistent haze
    const smokeCol = new THREE.Color(0x8a6a4a);
    const sn = Math.floor(60 * (window.__perfScale || 1));
    for (let i = 0; i < sn; i++) {
      const a = Math.random() * Math.PI * 2;
      const dir = new THREE.Vector3(Math.cos(a), 0.2 + Math.random() * 0.3, Math.sin(a));
      this.particles.spawn({
        pos: anchor.clone(),
        vel: dir.multiplyScalar(1.0 + Math.random()),
        color: smokeCol,
        size: 1.4 + Math.random() * 1.2,
        life: 1.0 + Math.random() * 0.6,
        alpha: 0.5, drag: 0.85, gravityY: 0.4,
      });
    }

    const sw = new Shockwave(this.sceneMgr);
    sw.trigger({ anchor, maxRadius: 1.8, life: 0.5, color: 0xfff2d1, burstParticles: false });
    this.sceneMgr.addEffect(sw);
    this.sceneMgr.punch(0.6);
  }
  update(dt) {
    this.lifeLeft -= dt;
    // secondary delayed burst at 0.25s — a smaller follow-up pop
    if (!this.secondaryFired && this.lifeLeft < 0.75) {
      this.secondaryFired = true;
      const col = new THREE.Color(0xffd27a);
      const n = Math.floor(100 * (window.__perfScale || 1));
      for (let i = 0; i < n; i++) {
        const dir = new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
        ).normalize().multiplyScalar(1.5 + Math.random() * 2.5);
        this.particles.spawn({
          pos: this.anchor.clone(), vel: dir, color: col,
          size: 0.4 + Math.random() * 0.5,
          life: 0.3 + Math.random() * 0.25,
          alpha: 0.9, drag: 0.5, gravityY: -0.8,
        });
      }
      const sw2 = new Shockwave(this.sceneMgr);
      sw2.trigger({ anchor: this.anchor, maxRadius: 1.0, life: 0.35, color: 0xfff2d1, burstParticles: false });
      this.sceneMgr.addEffect(sw2);
    }
    if (this.lifeLeft <= 0) this.done = true;
  }
}
