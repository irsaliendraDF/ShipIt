// Dr. Strange portal — Avengers-style spark ring with a shimmering interior.
// Now a GREEN mystic-arts palette (Eye of Agamotto / Time Stone vibe).
//
// Visuals have been tuned to feel more like the Endgame portals:
//   - A dedicated bright TorusGeometry rim in addition to the disc shader
//     (makes the outline read even without bloom)
//   - Sparks that CIRCULATE around the rim (tangent velocity dominates) so
//     the ring visibly spins, plus the radial burst from the original
//   - Denser ember flow + a brief grow-in whip where the ring "draws" itself
//     from a point, to match Strange's drawing-a-circle motion
//   - Ring thickness pulses subtly

import * as THREE from 'three';
import { BaseEffect } from './BaseEffect.js';
import { CONFIG } from '../../config.js';

const PORTAL_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
// Inner disc: heat-haze — noise-modulated transparency so it looks like
// shimmering magic between the sparks. Additive with low alpha.
// The rim is drawn here AND as a real torus mesh so the silhouette is crisp.
const PORTAL_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uDraw;        // 0..1 — portal "drawing" sweep progress

  float hash(vec2 p){return fract(sin(dot(p,vec2(27.619,57.583)))*43758.5453);}
  float noise(vec2 p){
    vec2 i=floor(p); vec2 f=fract(p);
    float a=hash(i), b=hash(i+vec2(1,0)), c=hash(i+vec2(0,1)), d=hash(i+vec2(1,1));
    vec2 u=f*f*(3.0-2.0*f);
    return mix(a,b,u.x)+(c-a)*u.y*(1.0-u.x)+(d-b)*u.x*u.y;
  }

  void main(){
    vec2 c = vUv - 0.5;
    float r = length(c) * 2.0;
    if (r > 1.0) discard;
    // Draw-in effect: mask pixels whose angle hasn't been swept yet.
    // atan returns -PI..PI; normalize to 0..1.
    float ang = (atan(c.y, c.x) + 3.14159265) / 6.2831853;
    // portal "draws" counter-clockwise; uDraw=1 shows whole ring
    float drawMask = smoothstep(uDraw - 0.05, uDraw, 1.0 - ang);
    drawMask = uDraw >= 0.999 ? 1.0 : drawMask;

    // crisp bright rim
    float rim = smoothstep(1.0, 0.82, r);
    // inner shimmer
    float inner = 1.0 - smoothstep(0.0, 0.82, r);
    float haze = noise(vec2(ang * 6.0, r * 6.0 - uTime * 1.4));
    // swirling radial streaks (makes the interior feel "dimensional")
    float streaks = 0.5 + 0.5 * sin(ang * 36.0 + uTime * 2.0);
    streaks *= inner;

    float a = (rim * 1.6 + inner * 0.18 + haze * 0.25 * inner + streaks * 0.15) * drawMask;
    vec3 col = uColor * (rim * 1.9 + haze * 0.45 + streaks * 0.35);
    gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
  }
`;

export class DrStrangePortal extends BaseEffect {
  trigger({ anchor, radius = 1.0 }) {
    this.anchor = anchor.clone();
    this.radius = Math.max(0.6, radius);
    this.age = 0;
    this.holdTime = 3.5;

    // ---- shader disc (heat-haze interior + rim glow) ----
    const geo = new THREE.CircleGeometry(this.radius, 96);
    this.discMat = new THREE.ShaderMaterial({
      vertexShader: PORTAL_VERT,
      fragmentShader: PORTAL_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uDraw: { value: 0 },
        uColor: { value: new THREE.Color(CONFIG.PORTAL_RING_COLOR) },
      },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geo, this.discMat);
    mesh.position.copy(anchor);

    // face the camera
    const camPos = this.sceneMgr.camera.position;
    const toCam = camPos.clone().sub(anchor).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), toCam);
    mesh.quaternion.copy(q);
    this.quat = q;

    this.scene.add(mesh);
    this._track(mesh);
    this.disc = mesh;

    // ---- crisp torus rim ring (real geometry, so the outline reads even
    //      without bloom — key to the Endgame-style look) ----
    const ringGeo = new THREE.TorusGeometry(this.radius, this.radius * 0.035, 12, 128);
    this.ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(CONFIG.PORTAL_RING_COLOR).multiplyScalar(1.5),
      transparent: true, opacity: 1.0,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    this.ring = new THREE.Mesh(ringGeo, this.ringMat);
    this.ring.position.copy(anchor);
    this.ring.quaternion.copy(q);
    this.scene.add(this.ring);
    this._track(this.ring);

    // ---- INNER rune ring at 75% radius, rotates opposite the outer rim
    //      and is segmented (8 dashes around the circle) for a runic feel
    const innerRingGeo = new THREE.TorusGeometry(this.radius * 0.72, this.radius * 0.022, 8, 64);
    this.innerRingMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(CONFIG.PORTAL_SPARK_COLOR),
      transparent: true, opacity: 0.65,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    this.innerRing = new THREE.Mesh(innerRingGeo, this.innerRingMat);
    this.innerRing.position.copy(anchor);
    this.innerRing.quaternion.copy(q);
    this.scene.add(this.innerRing);
    this._track(this.innerRing);

    // ---- 8 small "rune dots" around the rim — like glyphs in Strange's portal
    this.runeDots = [];
    const basisX = new THREE.Vector3(1, 0, 0).applyQuaternion(q);
    const basisY = new THREE.Vector3(0, 1, 0).applyQuaternion(q);
    const dotMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(CONFIG.PORTAL_RING_COLOR).multiplyScalar(1.8),
      transparent: true, opacity: 0.95,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const dotGeo = new THREE.SphereGeometry(this.radius * 0.045, 8, 8);
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.copy(anchor)
        .addScaledVector(basisX, Math.cos(a) * this.radius * 1.05)
        .addScaledVector(basisY, Math.sin(a) * this.radius * 1.05);
      this.scene.add(dot);
      this._track(dot);
      this.runeDots.push({ mesh: dot, angle: a });
    }
    this._basisX = basisX; this._basisY = basisY;

    this._spawnSparkBurst(260);
  }

  _spawnSparkBurst(n) {
    const spark = new THREE.Color(CONFIG.PORTAL_SPARK_COLOR);
    const basisX = new THREE.Vector3(1, 0, 0).applyQuaternion(this.quat);
    const basisY = new THREE.Vector3(0, 1, 0).applyQuaternion(this.quat);
    const count = Math.floor(n * (window.__perfScale || 1));
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const radial = basisX.clone().multiplyScalar(Math.cos(a))
        .add(basisY.clone().multiplyScalar(Math.sin(a)));
      const tangent = basisX.clone().multiplyScalar(-Math.sin(a))
        .add(basisY.clone().multiplyScalar(Math.cos(a)));
      const pos = this.anchor.clone().addScaledVector(radial, this.radius);
      // tangent-dominant velocity so sparks visibly CIRCULATE around the rim
      // like Strange's portals — the small radial offset gives the outward
      // flicker so they shed outward over time.
      const tSpeed = 2.5 + Math.random() * 3.5;
      const rSpeed = (Math.random() - 0.2) * 1.8; // biased outward
      const dir = tangent.clone().multiplyScalar(tSpeed)
        .addScaledVector(radial, rSpeed);
      this.particles.spawn({
        pos, vel: dir, color: spark,
        size: 0.55 + Math.random() * 0.8,
        life: 0.45 + Math.random() * 0.55,
        alpha: 1.0, drag: 0.45, gravityY: -0.8,
      });
    }
  }

  update(dt) {
    this.age += dt;
    this.discMat.uniforms.uTime.value += dt;

    // draw-in sweep: 0→1 over the first 0.35s so the portal visibly "draws"
    // itself open, matching Strange's drawing-a-circle gesture in the films
    const drawT = Math.min(1, this.age / 0.35);
    this.discMat.uniforms.uDraw.value = drawT;

    // LIVE color sync (preset cross-fade picks up here)
    this.discMat.uniforms.uColor.value.setHex(CONFIG.PORTAL_RING_COLOR);
    this.ringMat.color.setHex(CONFIG.PORTAL_RING_COLOR);
    this.ringMat.color.multiplyScalar(1.5);

    // continuous sparks while portal is open
    if (this.age < this.holdTime) {
      const rate = CONFIG.PORTAL_SPARK_RATE * (window.__perfScale || 1);
      const n = Math.floor(rate * dt);
      if (n > 0) this._spawnSparkBurst(n);

      // rising embers from inside the disc
      const ember = new THREE.Color(CONFIG.PORTAL_EMBER_COLOR);
      const count = Math.floor(26 * dt * (window.__perfScale || 1));
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * this.radius * 0.9;
        const basisX = new THREE.Vector3(1, 0, 0).applyQuaternion(this.quat);
        const basisY = new THREE.Vector3(0, 1, 0).applyQuaternion(this.quat);
        const pos = this.anchor.clone()
          .addScaledVector(basisX, Math.cos(a) * r)
          .addScaledVector(basisY, Math.sin(a) * r);
        this.particles.spawn({
          pos, vel: new THREE.Vector3((Math.random() - 0.5) * 0.3, 0.5 + Math.random() * 0.7, 0),
          color: ember,
          size: 0.4 + Math.random() * 0.4,
          life: 0.85 + Math.random() * 0.5,
          alpha: 0.85, drag: 0.8,
        });
      }
    }

    // grow-in pop (matches disc's uDraw) and end fade-out
    let s = 1.0;
    if (this.age < 0.35) s = this.age / 0.35;
    else if (this.age > this.holdTime - 0.4) {
      const t = Math.max(0, (this.holdTime - this.age) / 0.4);
      s = t;
    }
    this.disc.scale.setScalar(s);
    this.ring.scale.setScalar(s);
    this.innerRing.scale.setScalar(s);
    // subtle ring thickness pulse for drama
    this.ring.material.opacity = s * (0.85 + 0.15 * Math.sin(this.age * 7));
    this.innerRing.material.opacity = s * (0.5 + 0.25 * Math.sin(this.age * 4 + 1));
    // inner ring rotates opposite to outer
    this.innerRing.rotateZ(-dt * 0.8);

    // rune dots orbit slowly with their own rhythm + scale pop with portal
    for (const d of this.runeDots) {
      d.angle += dt * 0.4;
      d.mesh.position.copy(this.anchor)
        .addScaledVector(this._basisX, Math.cos(d.angle) * this.radius * 1.05)
        .addScaledVector(this._basisY, Math.sin(d.angle) * this.radius * 1.05);
      d.mesh.scale.setScalar(s * (0.85 + 0.15 * Math.sin(this.age * 5 + d.angle)));
    }

    if (this.age >= this.holdTime) this.done = true;
  }
}
