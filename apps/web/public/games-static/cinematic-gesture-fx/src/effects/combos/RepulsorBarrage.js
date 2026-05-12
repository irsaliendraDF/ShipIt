// RepulsorBarrage — 3 sequential blasts from the same hand, each bigger than
// the last, final one with heavy camera shake and chromatic punch.
import * as THREE from 'three';
import { BaseEffect } from '../BaseEffect.js';
import { IronManRepulsor } from '../IronManRepulsor.js';
import { Shockwave } from '../Shockwave.js';
import { CONFIG } from '../../../config.js';

export class RepulsorBarrage extends BaseEffect {
  trigger({ events }) {
    // anchor/direction from the most recent event
    const last = events[events.length - 1];
    this.anchor = last.anchor.clone();
    this.direction = last.direction.clone();
    this.stage = 0;
    this.timer = 0;
    this.done_ = false;
    this.lifeLeft = 1.4;

    // fire blast 1 immediately
    this._fireBlast(1.0);
  }

  _fireBlast(intensity) {
    const r = new IronManRepulsor(this.sceneMgr);
    r.trigger({ anchor: this.anchor, direction: this.direction });
    this.sceneMgr.addEffect(r);
    // scale the effect by driving a Shockwave burst + chromatic punch
    const sw = new Shockwave(this.sceneMgr);
    sw.trigger({
      anchor: this.anchor,
      maxRadius: 1.2 * intensity,
      life: 0.35,
      color: CONFIG.REPULSOR_CORE_COLOR,
      burstParticles: true,
    });
    this.sceneMgr.addEffect(sw);
    this.sceneMgr.punch(0.9 + intensity);
  }

  update(dt) {
    this.timer += dt;
    this.lifeLeft -= dt;
    // blasts 2 and 3 staggered
    if (this.stage === 0 && this.timer > 0.32) { this._fireBlast(1.25); this.stage = 1; }
    if (this.stage === 1 && this.timer > 0.66) {
      this._fireBlast(1.7);
      // final super-shake + chromatic
      this.sceneMgr.punch(2.4);
      this.stage = 2;
    }
    if (this.lifeLeft <= 0) this.done = true;
  }
}
