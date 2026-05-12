// JarvisBoot — HUD expands to near-full-screen: multiple rings, tick ladder,
// a full-width scan sweep, panel brackets at screen corners.
import * as THREE from 'three';
import { BaseEffect } from '../BaseEffect.js';
import { CONFIG } from '../../../config.js';

export class JarvisBoot extends BaseEffect {
  trigger({ events }) {
    const anchor = events[events.length - 1].anchor.clone();
    this.lifeLeft = 2.2;
    this.t = 0;
    const col = new THREE.Color(CONFIG.JARVIS_COLOR);

    this.group = new THREE.Group();
    this.group.position.copy(anchor);
    this.scene.add(this.group);

    // big concentric rings
    this.rings = [];
    for (let i = 0; i < 5; i++) {
      const r = 1.0 + i * 0.55;
      const geo = new THREE.TorusGeometry(r, 0.018, 8, 128);
      const mat = new THREE.MeshBasicMaterial({
        color: col, transparent: true, opacity: 0.85,
        blending: THREE.AdditiveBlending, depthWrite: false,
      });
      const m = new THREE.Mesh(geo, mat);
      m.rotation.x = (i - 2) * 0.35;
      m.rotation.y = i * 0.28;
      this.group.add(m);
      this.rings.push({ m, sx: 0.4 + i * 0.15, sy: 0.25 - i * 0.05 });
    }

    // tick ladder ring
    const tickMat = new THREE.MeshBasicMaterial({
      color: col, transparent: true, opacity: 0.7,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    this.tickGroup = new THREE.Group();
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2;
      const g = new THREE.BoxGeometry(0.03, 0.12, 0.01);
      const m = new THREE.Mesh(g, tickMat);
      const rad = 3.2;
      m.position.set(Math.cos(a) * rad, Math.sin(a) * rad, 0);
      m.rotation.z = a + Math.PI / 2;
      this.tickGroup.add(m);
    }
    this.group.add(this.tickGroup);

    // wide scan sweep (thin bar rotating across the full HUD)
    const sweepGeo = new THREE.PlaneGeometry(3.2, 0.04);
    const sweepMat = new THREE.MeshBasicMaterial({
      color: col, transparent: true, opacity: 0.55,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    });
    this.sweep = new THREE.Mesh(sweepGeo, sweepMat);
    this.group.add(this.sweep);

    // corner brackets — 4 L-shaped corner pieces at the HUD bounds
    const bg = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-0.3, 0, 0), new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -0.3, 0),
    ]);
    const lm = new THREE.LineBasicMaterial({
      color: col, transparent: true, opacity: 0.9,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const extents = 3.6;
    for (const [sx, sy, rot] of [
      [-1, 1, 0], [1, 1, -Math.PI / 2], [1, -1, Math.PI], [-1, -1, Math.PI / 2],
    ]) {
      const l = new THREE.Line(bg.clone(), lm.clone());
      l.position.set(sx * extents, sy * extents, 0);
      l.rotation.z = rot;
      this.group.add(l);
    }

    this._track(this.group);
    this.sceneMgr.punch(1.1);
  }
  update(dt) {
    this.t += dt;
    this.lifeLeft -= dt;
    for (const r of this.rings) {
      r.m.rotation.x += r.sx * dt;
      r.m.rotation.y += r.sy * dt;
    }
    this.tickGroup.rotation.z += 0.25 * dt;
    this.sweep.rotation.z += 3.5 * dt;

    // grow-in then hold then fade
    let s = 1.0;
    if (this.t < 0.35) s = this.t / 0.35;
    else if (this.lifeLeft < 0.6) s = Math.max(0, this.lifeLeft / 0.6);
    this.group.scale.setScalar(s);

    if (this.lifeLeft <= 0) this.done = true;
  }
}
