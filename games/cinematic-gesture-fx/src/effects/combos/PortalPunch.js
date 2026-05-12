// PortalPunch — portal opens, fist thrusts through, shockwave blows out the
// far side. Uses DrStrangePortal + a delayed Shockwave at +forward offset.
import * as THREE from 'three';
import { BaseEffect } from '../BaseEffect.js';
import { DrStrangePortal } from '../DrStrangePortal.js';
import { Shockwave } from '../Shockwave.js';
import { FistBurst } from '../FistBurst.js';
import { CONFIG } from '../../../config.js';

export class PortalPunch extends BaseEffect {
  trigger({ events }) {
    const pinch = events[0];
    const fist = events[1];
    // open portal at the pinch anchor
    const portal = new DrStrangePortal(this.sceneMgr);
    portal.trigger({ anchor: pinch.anchor.clone(), radius: pinch.extra?.radius || 1.2 });
    this.sceneMgr.addEffect(portal);

    // fist thrust particles traveling through
    const burst = new FistBurst(this.sceneMgr);
    burst.trigger({ anchor: pinch.anchor.clone() });
    this.sceneMgr.addEffect(burst);

    // shockwave on the FAR side: offset in -z direction
    this.farAnchor = pinch.anchor.clone().add(new THREE.Vector3(0, 0, -2.0));
    this.exitTimer = 0.25;
    this.lifeLeft = 1.2;
    this.sceneMgr.punch(1.4);
  }
  update(dt) {
    this.lifeLeft -= dt;
    if (this.exitTimer > 0) {
      this.exitTimer -= dt;
      if (this.exitTimer <= 0) {
        const sw = new Shockwave(this.sceneMgr);
        sw.trigger({
          anchor: this.farAnchor, maxRadius: 2.8, life: 0.9,
          color: CONFIG.PORTAL_RING_COLOR, burstParticles: true,
        });
        this.sceneMgr.addEffect(sw);
        this.sceneMgr.punch(1.8);
      }
    }
    if (this.lifeLeft <= 0) this.done = true;
  }
}
