// Unibeam — wide horizontal beam sweeping forward. Max bloom, screen dims
// at edges via a vignette overlay.
import * as THREE from 'three';
import { BaseEffect } from '../BaseEffect.js';
import { VOLUMETRIC_VERT, VOLUMETRIC_FRAG } from '../../shaders/ParticleShaders.js';
import { Shockwave } from '../Shockwave.js';
import { CONFIG } from '../../../config.js';

const VIGN_FRAG = `
  precision mediump float; varying vec2 vUv;
  uniform float uAmount;
  void main() {
    vec2 c = vUv - 0.5;
    float r = length(c) * 2.0;
    float v = smoothstep(0.4, 1.0, r);
    gl_FragColor = vec4(0.0, 0.0, 0.0, v * uAmount);
  }
`;

export class Unibeam extends BaseEffect {
  trigger({ events }) {
    const first = events[0];
    this.anchor = first.anchor.clone();
    this.lifeLeft = 1.2;

    // one massive beam — flat cylinder, wide cross-section
    const geo = new THREE.CylinderGeometry(0.8, 0.25, 9.0, 32, 1, true);
    this.mat = new THREE.ShaderMaterial({
      vertexShader: VOLUMETRIC_VERT, fragmentShader: VOLUMETRIC_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(CONFIG.CHARGE_CORE_COLOR) },
        uIntensity: { value: 3.0 }, uLengthFade: { value: 0.3 },
      },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    });
    this.beam = new THREE.Mesh(geo, this.mat);
    const dir = new THREE.Vector3(0, 0, -1);
    const mid = this.anchor.clone().addScaledVector(dir, 4.5);
    this.beam.position.copy(mid);
    this.beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    this.scene.add(this.beam);
    this._track(this.beam);

    // tight bright core
    const coreGeo = new THREE.CylinderGeometry(0.15, 0.05, 9.0, 16);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff, transparent: true, opacity: 1.0,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    this.core = new THREE.Mesh(coreGeo, coreMat);
    this.core.position.copy(mid);
    this.core.quaternion.copy(this.beam.quaternion);
    this.scene.add(this.core);
    this._track(this.core);

    // screen-space vignette overlay (quad parented to the camera)
    const vignGeo = new THREE.PlaneGeometry(2, 2);
    this.vignMat = new THREE.ShaderMaterial({
      vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position,1.0);}`,
      fragmentShader: VIGN_FRAG,
      uniforms: { uAmount: { value: 0.0 } },
      transparent: true, depthWrite: false, depthTest: false,
    });
    this.vign = new THREE.Mesh(vignGeo, this.vignMat);
    this.vign.frustumCulled = false;
    this.vign.renderOrder = 9999;
    this.scene.add(this.vign);
    this._track(this.vign);

    // initial slam shockwave
    const sw = new Shockwave(this.sceneMgr);
    sw.trigger({ anchor: this.anchor, maxRadius: 3.5, life: 0.8, color: 0xbfe9ff });
    this.sceneMgr.addEffect(sw);
    this.sceneMgr.punch(3.0);
  }
  update(dt) {
    this.lifeLeft -= dt;
    this.mat.uniforms.uTime.value += dt;
    // beam fades out second half of life
    const t = Math.max(0, this.lifeLeft / 1.2);
    this.mat.uniforms.uIntensity.value = 3.0 * t;
    this.core.material.opacity = t;
    // vignette peaks in middle of life
    const vignT = 1 - Math.abs(t - 0.5) * 2;
    this.vignMat.uniforms.uAmount.value = Math.max(0, vignT) * 0.55;
    if (this.lifeLeft <= 0) this.done = true;
  }
}
