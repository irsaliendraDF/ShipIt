// StrangeSanctum — two portals open simultaneously at each hand's pinch
// location, connected by a faint energy link (line + drifting particles).
import * as THREE from 'three';
import { BaseEffect } from '../BaseEffect.js';
import { DrStrangePortal } from '../DrStrangePortal.js';
import { CONFIG } from '../../../config.js';

export class StrangeSanctum extends BaseEffect {
  trigger({ events }) {
    const [e1, e2] = events;
    const r = Math.max(e1.extra?.radius || 1.0, e2.extra?.radius || 1.0);

    const pA = new DrStrangePortal(this.sceneMgr);
    pA.trigger({ anchor: e1.anchor.clone(), radius: r });
    this.sceneMgr.addEffect(pA);
    const pB = new DrStrangePortal(this.sceneMgr);
    pB.trigger({ anchor: e2.anchor.clone(), radius: r });
    this.sceneMgr.addEffect(pB);

    // energy link: line between them + flowing spark particles
    const geo = new THREE.BufferGeometry().setFromPoints([e1.anchor, e2.anchor]);
    const mat = new THREE.LineBasicMaterial({
      color: CONFIG.PORTAL_SPARK_COLOR, transparent: true, opacity: 0.7,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    this.link = new THREE.Line(geo, mat);
    this.scene.add(this.link);
    this._track(this.link);

    this.a = e1.anchor.clone(); this.b = e2.anchor.clone();
    this.lifeLeft = 3.0;
    this.sceneMgr.punch(1.0);
  }
  update(dt) {
    this.lifeLeft -= dt;
    // flowing sparks along the link
    const col = new THREE.Color(CONFIG.PORTAL_SPARK_COLOR);
    const n = Math.floor(6 * (window.__perfScale || 1));
    for (let i = 0; i < n; i++) {
      const t = Math.random();
      const p = this.a.clone().lerp(this.b, t);
      p.x += (Math.random() - 0.5) * 0.1;
      p.y += (Math.random() - 0.5) * 0.1;
      const toward = this.b.clone().sub(this.a).normalize();
      this.particles.spawn({
        pos: p,
        vel: toward.multiplyScalar((Math.random() - 0.5) * 2.0),
        color: col, size: 0.3 + Math.random() * 0.3,
        life: 0.3 + Math.random() * 0.3,
        alpha: 0.9, drag: 0.8,
      });
    }
    this.link.material.opacity = Math.max(0, Math.min(0.7, this.lifeLeft / 2.5));
    if (this.lifeLeft <= 0) this.done = true;
  }
}
