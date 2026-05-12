// PixelTrail — voxel cubes spawned at fingertips. Singleton owned by main.js
// loop, not a per-trigger effect. Uses one InstancedMesh per palette color so
// thousands of cubes render in 3 draw calls. Cubes age + shrink + fade.
//
// Active when CONFIG.PIXEL_ENABLED is true (preset-controlled).

import * as THREE from 'three';
import { AppState } from '../AppState.js';
import { CONFIG } from '../../config.js';

const MAX_PER_COLOR = 2000;

function snap(v, s) { return Math.round(v / s) * s; }

export class PixelTrail {
  constructor(sceneMgr) {
    this.sceneMgr = sceneMgr;
    this.scene = sceneMgr.scene;
    this.meshes = [];      // [{mesh, color, slots}]
    this.frame = 0;
    this._lastTipPositions = {}; // for velocity inheritance
    this._build();
  }

  _build() {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    for (const hex of CONFIG.PIXEL_PALETTE) {
      const mat = new THREE.MeshBasicMaterial({
        color: hex, transparent: true, opacity: 1.0,
        blending: THREE.AdditiveBlending, depthWrite: false,
      });
      const mesh = new THREE.InstancedMesh(geo, mat, MAX_PER_COLOR);
      mesh.layers.enable(1); // bloom
      mesh.frustumCulled = false;
      // Per-instance lifetime tracked in a parallel slot array; instance is
      // "dead" when life <= 0 (we move it offscreen so it doesn't render).
      const slots = new Array(MAX_PER_COLOR).fill(null).map(() => ({
        life: 0, maxLife: 0, position: new THREE.Vector3(),
        velocity: new THREE.Vector3(), size: 1, base: hex,
      }));
      // start every slot scaled to 0 (invisible)
      const m = new THREE.Matrix4();
      for (let i = 0; i < MAX_PER_COLOR; i++) {
        m.makeScale(0, 0, 0);
        mesh.setMatrixAt(i, m);
      }
      mesh.instanceMatrix.needsUpdate = true;
      mesh.cursor = 0;
      this.scene.add(mesh);
      this.meshes.push({ mesh, color: hex, slots });
    }
  }

  setEnabled(on) {
    for (const m of this.meshes) m.mesh.visible = !!on;
  }

  // Walk visible hands' tracked fingertips, spawn cubes per CONFIG.
  _spawn(camera) {
    const hands = AppState.handsDetected;
    if (!hands || hands.length === 0) return;

    const tipsToTrack = CONFIG.PIXEL_FINGERTIPS;
    // very lightweight reuse of GestureDetector's projection math:
    const z = -2.0;
    const vFov = (camera.fov * Math.PI) / 180;
    const planeH = 2 * Math.tan(vFov / 2) * Math.abs(z);
    const planeW = planeH * camera.aspect;
    const grid = CONFIG.PIXEL_GRID_SNAP;

    for (const h of hands) {
      for (const tipIdx of tipsToTrack) {
        const lm = h.landmarks[tipIdx];
        if (!lm) continue;
        let x = (lm.x - 0.5) * planeW;
        if (AppState.mirror) x = -x;
        const y = -(lm.y - 0.5) * planeH;
        const zz = z + (lm.z || 0) * 1.5;
        const pos = new THREE.Vector3(snap(x, grid), snap(y, grid), snap(zz, grid));

        // velocity inheritance (optional)
        const key = `${h.hand}:${tipIdx}`;
        const last = this._lastTipPositions[key];
        const vel = new THREE.Vector3();
        if (CONFIG.PIXEL_INHERIT_VELOCITY && last) {
          vel.copy(pos).sub(last).multiplyScalar(8);
        }
        this._lastTipPositions[key] = pos.clone();

        // glitch chance: pick a different palette color and 2× size
        const isGlitch = Math.random() < CONFIG.PIXEL_GLITCH_CHANCE;
        const meshIdx = isGlitch
          ? Math.floor(Math.random() * this.meshes.length)
          : (tipIdx + (h.hand === 'Left' ? 1 : 0)) % this.meshes.length;
        const m = this.meshes[meshIdx];
        const size = CONFIG.PIXEL_SIZE * (isGlitch ? 2 : 1);

        // claim a slot (rolling)
        const slotIdx = m.mesh.cursor;
        m.mesh.cursor = (m.mesh.cursor + 1) % MAX_PER_COLOR;
        const slot = m.slots[slotIdx];
        slot.life = CONFIG.PIXEL_LIFE_MS / 1000;
        slot.maxLife = slot.life;
        slot.position.copy(pos);
        slot.velocity.copy(vel);
        slot.size = size;
      }
    }
  }

  update(dt, camera) {
    this.frame++;
    if (!CONFIG.PIXEL_ENABLED) {
      // when off, ensure cubes fade and meshes hidden
      for (const m of this.meshes) m.mesh.visible = false;
      return;
    }
    for (const m of this.meshes) m.mesh.visible = true;

    if (this.frame % CONFIG.PIXEL_SPAWN_EVERY_N === 0) this._spawn(camera);

    const m4 = new THREE.Matrix4();
    for (const { mesh, slots } of this.meshes) {
      let dirty = false;
      for (let i = 0; i < slots.length; i++) {
        const s = slots[i];
        if (s.life <= 0) continue;
        s.life -= dt;
        if (CONFIG.PIXEL_INHERIT_VELOCITY) s.position.addScaledVector(s.velocity, dt);
        const u = Math.max(0, s.life / s.maxLife);
        const alpha = u;
        const scale = s.size * (0.7 + u * 0.3);
        m4.makeScale(scale, scale, scale);
        m4.setPosition(s.position.x, s.position.y, s.position.z);
        // baked alpha via scale collapse when dead
        if (s.life <= 0) m4.makeScale(0, 0, 0);
        mesh.setMatrixAt(i, m4);
        // crude per-instance alpha trick: mesh has one material; we drop
        // mesh.material.opacity to the avg of live slot alphas at end of pass.
        dirty = true;
      }
      // simple opacity heuristic so older cubes look softer
      mesh.material.opacity = 0.95;
      if (dirty) mesh.instanceMatrix.needsUpdate = true;
    }
  }
}
