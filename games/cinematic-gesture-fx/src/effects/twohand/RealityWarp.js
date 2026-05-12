// RealityWarp — dark purple ripple radiating outward. Single large disc with
// a ripple shader. Used by CrossedArms pose and Cataclysm finisher.
import * as THREE from 'three';
import { BaseEffect } from '../BaseEffect.js';
import { CONFIG } from '../../../config.js';

const VERT = `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
const FRAG = `
  precision mediump float; varying vec2 vUv;
  uniform float uProgress; uniform vec3 uColor;
  void main(){
    vec2 c = vUv - 0.5;
    float r = length(c) * 2.0;
    if (r > 1.0) discard;
    // concentric ripples moving outward
    float waves = sin(r * 18.0 - uProgress * 12.0) * 0.5 + 0.5;
    float band = smoothstep(uProgress - 0.15, uProgress, r)
               * (1.0 - smoothstep(uProgress, uProgress + 0.2, r));
    float a = (band * 0.9 + waves * 0.15 * band) * (1.0 - uProgress);
    vec3 col = uColor * (band * 1.6 + waves * 0.3);
    gl_FragColor = vec4(col, a);
  }
`;

export class RealityWarp extends BaseEffect {
  trigger({ anchor, scale = 4.0, life = 1.4, color = CONFIG.WARP_COLOR }) {
    this.life = life; this.t = 0;
    const geo = new THREE.PlaneGeometry(scale * 2, scale * 2);
    this.mat = new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG,
      uniforms: { uProgress: { value: 0 }, uColor: { value: new THREE.Color(color) } },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geo, this.mat);
    mesh.position.copy(anchor);
    const toCam = this.sceneMgr.camera.position.clone().sub(anchor).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), toCam);
    mesh.quaternion.copy(q);
    this.scene.add(mesh);
    this._track(mesh);
    this.mesh = mesh;

    // Inner void — a darker disc at the center that reads as "reality tearing"
    const voidGeo = new THREE.CircleGeometry(scale * 0.18, 48);
    const voidMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color).multiplyScalar(0.4),
      transparent: true, opacity: 0.75,
      blending: THREE.NormalBlending, depthWrite: false, side: THREE.DoubleSide,
    });
    this.voidDisc = new THREE.Mesh(voidGeo, voidMat);
    this.voidDisc.position.copy(anchor);
    this.voidDisc.quaternion.copy(q);
    this.scene.add(this.voidDisc);
    this._track(this.voidDisc);

    // Debris — dust/spark particles flung outward along the ripple plane
    const basisX = new THREE.Vector3(1, 0, 0).applyQuaternion(q);
    const basisY = new THREE.Vector3(0, 1, 0).applyQuaternion(q);
    const debrisCol = new THREE.Color(color);
    const n = Math.floor(80 * (window.__perfScale || 1));
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const dir = basisX.clone().multiplyScalar(Math.cos(a))
        .add(basisY.clone().multiplyScalar(Math.sin(a)));
      const speed = 1.5 + Math.random() * 3;
      this.particles.spawn({
        pos: anchor.clone().addScaledVector(dir, 0.2),
        vel: dir.multiplyScalar(speed),
        color: debrisCol,
        size: 0.6 + Math.random() * 0.7,
        life: 0.7 + Math.random() * 0.5,
        alpha: 0.9, drag: 0.55, gravityY: -1.5,
      });
    }
  }
  update(dt) {
    this.t += dt;
    const p = Math.min(1, this.t / this.life);
    this.mat.uniforms.uProgress.value = p;
    // void disc: grows early then shrinks+fades at the end
    if (this.voidDisc) {
      const s = p < 0.5 ? (p / 0.5) : Math.max(0, (1 - p) / 0.5);
      this.voidDisc.scale.setScalar(s);
      this.voidDisc.material.opacity = 0.75 * s;
    }
    if (p >= 1) this.done = true;
  }
}
