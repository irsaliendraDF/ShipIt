// JARVIS HUD: concentric rotating rings on different axes, tick marks, a
// scanning sweep line, and a grid of faint "glyph" sprites. All pale cyan,
// additive blend. Scales to the distance between the user's two hands.
import * as THREE from 'three';
import { BaseEffect } from './BaseEffect.js';
import { CONFIG } from '../../config.js';

export class JarvisHUD extends BaseEffect {
  constructor(sceneMgr) {
    super(sceneMgr);
    this.initialized = false;
    this.lifeLeft = 0;
  }

  trigger({ anchor, extra }) {
    if (!this.initialized) this._build();
    this.lifeLeft = CONFIG.HELD_EFFECT_FADE;
    this.group.position.copy(anchor);
    if (extra?.size) {
      const scale = THREE.MathUtils.clamp(extra.size * 1.2, 0.5, 3.0);
      this.group.scale.setScalar(scale);
    }
  }

  _build() {
    this.group = new THREE.Group();
    this.scene.add(this.group);
    const col = new THREE.Color(CONFIG.JARVIS_COLOR);

    // Concentric rings on different axes (torus geometry = real 3D rings)
    this.rings = [];
    for (let i = 0; i < CONFIG.JARVIS_RING_COUNT; i++) {
      const r = 0.5 + i * 0.22;
      const geo = new THREE.TorusGeometry(r, 0.012, 8, 96);
      const mat = new THREE.MeshBasicMaterial({
        color: col, transparent: true, opacity: 0.85,
        blending: THREE.AdditiveBlending, depthWrite: false,
      });
      const m = new THREE.Mesh(geo, mat);
      // offset each ring's base rotation so they sit on different axes
      m.rotation.x = (i - 1) * 0.55;
      m.rotation.y = i * 0.4;
      this.group.add(m);
      this.rings.push({ mesh: m, speedX: 0.4 + i * 0.2, speedY: 0.6 - i * 0.15 });
    }

    // Tick marks around the outer ring
    const tickCount = 36;
    const tickGeo = new THREE.BoxGeometry(0.02, 0.06, 0.01);
    const tickMat = new THREE.MeshBasicMaterial({
      color: col, transparent: true, opacity: 0.6,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    this.tickGroup = new THREE.Group();
    for (let i = 0; i < tickCount; i++) {
      const a = (i / tickCount) * Math.PI * 2;
      const t = new THREE.Mesh(tickGeo, tickMat);
      t.position.set(Math.cos(a) * 0.95, Math.sin(a) * 0.95, 0);
      t.rotation.z = a + Math.PI / 2;
      this.tickGroup.add(t);
    }
    this.group.add(this.tickGroup);

    // Scanning sweep line (thin rotating bar)
    const sweepGeo = new THREE.PlaneGeometry(0.9, 0.02);
    const sweepMat = new THREE.MeshBasicMaterial({
      color: col, transparent: true, opacity: 0.45,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    });
    this.sweep = new THREE.Mesh(sweepGeo, sweepMat);
    this.group.add(this.sweep);

    // Stub glyph sprites — simple crosshair sprites at random ring positions.
    // (Stubbed per spec; replace texture with actual glyph atlas later.)
    const glyphCanvas = document.createElement('canvas');
    glyphCanvas.width = glyphCanvas.height = 64;
    const ctx = glyphCanvas.getContext('2d');
    ctx.strokeStyle = '#9fefff'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(32, 8); ctx.lineTo(32, 56);
    ctx.moveTo(8, 32); ctx.lineTo(56, 32);
    ctx.arc(32, 32, 14, 0, Math.PI * 2);
    ctx.stroke();
    const glyphTex = new THREE.CanvasTexture(glyphCanvas);
    const glyphMat = new THREE.SpriteMaterial({
      map: glyphTex, color: col, transparent: true, opacity: 0.6,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    for (let i = 0; i < 6; i++) {
      const s = new THREE.Sprite(glyphMat);
      const a = (i / 6) * Math.PI * 2 + Math.random();
      s.position.set(Math.cos(a) * 0.55, Math.sin(a) * 0.55, 0);
      s.scale.setScalar(0.15);
      this.group.add(s);
    }

    // Central pulsing "data core" dot at the very center
    const coreGeo = new THREE.SphereGeometry(0.06, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({
      color: col, transparent: true, opacity: 0.95,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    this.dataCore = new THREE.Mesh(coreGeo, coreMat);
    this.group.add(this.dataCore);

    // Vertical "readout" column — short horizontal tick lines stacked,
    // like a JARVIS data feed. Tiny, subtle, adds technical detail.
    this.readoutGroup = new THREE.Group();
    const readoutMat = new THREE.LineBasicMaterial({
      color: col, transparent: true, opacity: 0.55,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    for (let i = 0; i < 8; i++) {
      const len = 0.08 + Math.random() * 0.12;
      const y = 0.15 + i * 0.05;
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-len * 0.5, y, 0),
        new THREE.Vector3( len * 0.5, y, 0),
      ]);
      this.readoutGroup.add(new THREE.Line(geo, readoutMat));
    }
    this.readoutGroup.position.x = 0.7;
    this.group.add(this.readoutGroup);

    // Track for disposal AND mark whole subtree bloomable (must be after
    // children are added so traverse covers all of them).
    this._track(this.group);
    this.initialized = true;
  }

  update(dt) {
    if (!this.initialized) { this.done = true; return; }
    this.lifeLeft -= dt;
    const s = CONFIG.JARVIS_SPIN_SPEED;

    for (const r of this.rings) {
      r.mesh.rotation.x += r.speedX * s * dt;
      r.mesh.rotation.y += r.speedY * s * dt;
    }
    this.tickGroup.rotation.z += 0.15 * dt;
    this.sweep.rotation.z += 2.2 * dt;

    // data core pulse (size + opacity)
    if (this.dataCore) {
      const pulse = 0.85 + 0.15 * Math.sin(performance.now() * 0.004);
      this.dataCore.scale.setScalar(pulse);
      this.dataCore.material.opacity = 0.7 + 0.25 * pulse;
    }
    // readout column flickers occasionally to feel "live"
    if (this.readoutGroup) {
      this.readoutGroup.children.forEach((line, i) => {
        line.material.opacity = 0.35 + 0.3 * Math.sin(performance.now() * 0.003 + i * 0.7);
      });
    }

    // fade out if gesture stopped firing
    if (this.lifeLeft < 0.35) {
      const f = Math.max(0, this.lifeLeft / 0.35);
      this.group.traverse(obj => {
        if (obj.material && 'opacity' in obj.material) {
          obj.material.opacity = Math.min(obj.material.opacity, 0.85 * f);
        }
      });
      if (this.lifeLeft <= 0) this.done = true;
    }
  }
}
