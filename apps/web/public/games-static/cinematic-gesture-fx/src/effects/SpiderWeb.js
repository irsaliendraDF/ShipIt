// Spider web: a line from the wrist outward along palm direction, sagging
// slightly via a catenary curve. White with faint blue rim (we simulate the
// rim by drawing a thicker low-opacity line behind the white line).
import * as THREE from 'three';
import { BaseEffect } from './BaseEffect.js';
import { CONFIG } from '../../config.js';

export class SpiderWeb extends BaseEffect {
  trigger({ anchor, direction }) {
    this.age = 0;
    this.life = CONFIG.WEB_LIFE;

    const start = anchor.clone();
    const end = anchor.clone().addScaledVector(direction.clone().normalize(), 5.0);

    // catenary sag — midpoint drops relative to length
    const points = [];
    const segments = 32;
    const sagAmount = start.distanceTo(end) * 0.08;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const p = start.clone().lerp(end, t);
      // simple parabolic sag
      const sag = -Math.sin(t * Math.PI) * sagAmount;
      p.y += sag;
      points.push(p);
    }

    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const coreMat = new THREE.LineBasicMaterial({
      color: CONFIG.WEB_COLOR, transparent: true, opacity: 0.95,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    this.core = new THREE.Line(geo, coreMat);
    this._track(this.core);
    this.scene.add(this.core);

    // rim: second line slightly offset + wider-ish via a thicker LineBasicMaterial.
    // WebGL LineBasicMaterial line width is clamped to 1 on most platforms,
    // so we fake a rim by duplicating the line with different color/alpha.
    const rimMat = new THREE.LineBasicMaterial({
      color: CONFIG.WEB_RIM_COLOR, transparent: true, opacity: 0.5,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    this.rim = new THREE.Line(geo.clone(), rimMat);
    this._track(this.rim);
    this.scene.add(this.rim);

    // Anchor node — bright sphere at the wrist where the web originates
    const nodeGeo = new THREE.SphereGeometry(0.04, 10, 10);
    const nodeMat = new THREE.MeshBasicMaterial({
      color: CONFIG.WEB_COLOR, transparent: true, opacity: 0.95,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    this.anchorNode = new THREE.Mesh(nodeGeo, nodeMat);
    this.anchorNode.position.copy(start);
    this.scene.add(this.anchorNode);
    this._track(this.anchorNode);

    // Cross-strands — small perpendicular line segments at 1/3, 1/2, 2/3
    // along the web, giving it the lattice/cobweb look
    this.crossStrands = [];
    const strandMat = new THREE.LineBasicMaterial({
      color: CONFIG.WEB_COLOR, transparent: true, opacity: 0.6,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const webLen = start.distanceTo(end);
    const webDir = end.clone().sub(start).normalize();
    // perp = pick any perpendicular (use world Y as reference)
    const perp = new THREE.Vector3(0, 1, 0).cross(webDir).normalize();
    if (perp.lengthSq() < 0.01) perp.set(1, 0, 0); // web was vertical
    for (const t of [0.3, 0.5, 0.7]) {
      const center = start.clone().lerp(end, t);
      // sag applied
      center.y -= Math.sin(t * Math.PI) * webLen * 0.08;
      const half = 0.08;
      const strandGeo = new THREE.BufferGeometry().setFromPoints([
        center.clone().addScaledVector(perp, -half),
        center.clone().addScaledVector(perp,  half),
      ]);
      const strand = new THREE.Line(strandGeo, strandMat);
      this.scene.add(strand);
      this._track(strand);
      this.crossStrands.push(strand);
    }
  }

  update(dt) {
    this.age += dt;
    const t = this.age / this.life;
    const fade = Math.max(0, 1 - t);
    this.core.material.opacity = 0.95 * fade;
    this.rim.material.opacity = 0.5 * fade;
    if (this.anchorNode) this.anchorNode.material.opacity = 0.95 * fade;
    for (const s of this.crossStrands) s.material.opacity = 0.6 * fade;
    if (this.age >= this.life) this.done = true;
  }
}
