// PalmAnchors — persistent soft glow placed at each detected palm. Gives the
// user constant "my hand is being tracked" feedback and makes held effects
// feel physically attached because the glow moves with the hand in real time.
// Singleton owned by main.js.

import * as THREE from 'three';
import { AppState } from '../AppState.js';
import { CONFIG } from '../../config.js';

function makeGlowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0.0, 'rgba(200, 240, 255, 1.0)');
  g.addColorStop(0.3, 'rgba(120, 200, 255, 0.55)');
  g.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export class PalmAnchors {
  constructor(sceneMgr) {
    this.sceneMgr = sceneMgr;
    const tex = makeGlowTexture();
    this.sprites = {};
    for (const hand of ['Left', 'Right']) {
      const mat = new THREE.SpriteMaterial({
        map: tex, transparent: true, depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const s = new THREE.Sprite(mat);
      s.scale.setScalar(0.4);
      s.visible = false;
      s.layers.enable(1); // bloom layer
      sceneMgr.scene.add(s);
      this.sprites[hand] = s;
    }
  }

  update(camera) {
    const hands = AppState.handsDetected;
    const seen = { Left: false, Right: false };

    for (const h of hands) {
      seen[h.hand] = true;
      const lm = h.landmarks;
      // palm center from wrist + index_mcp + pinky_mcp, projected to WORLD_DEPTH
      const palmX = (lm[0].x + lm[5].x + lm[17].x) / 3;
      const palmY = (lm[0].y + lm[5].y + lm[17].y) / 3;
      const z = CONFIG.WORLD_DEPTH;
      const vFov = (camera.fov * Math.PI) / 180;
      const planeH = 2 * Math.tan(vFov / 2) * Math.abs(z);
      const planeW = planeH * camera.aspect;
      let x = (palmX - 0.5) * planeW;
      if (AppState.mirror) x = -x;
      const y = -(palmY - 0.5) * planeH;
      const sp = this.sprites[h.hand];
      sp.position.set(x, y, z + 0.05);
      sp.visible = true;
      // gentle breathing scale — makes the anchor feel alive
      const t = performance.now() / 1000;
      sp.scale.setScalar(0.36 + Math.sin(t * 3 + (h.hand === 'Left' ? 0 : 1.5)) * 0.02);
    }

    if (!seen.Left)  this.sprites.Left.visible  = false;
    if (!seen.Right) this.sprites.Right.visible = false;
  }
}
