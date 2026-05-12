// Shield — Dr. Strange eldritch shield between hands. Ornate ring + inner
// heat-haze, oriented toward camera. Scales with palm separation.
import * as THREE from 'three';
import { BaseEffect } from '../BaseEffect.js';
import { CONFIG } from '../../../config.js';

const VERT = `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
const FRAG = `
  precision mediump float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uColor;
  float hash(vec2 p){return fract(sin(dot(p,vec2(27.619,57.583)))*43758.5453);}
  float noise(vec2 p){ vec2 i=floor(p),f=fract(p);
    float a=hash(i),b=hash(i+vec2(1,0)),c=hash(i+vec2(0,1)),d=hash(i+vec2(1,1));
    vec2 u=f*f*(3.0-2.0*f); return mix(a,b,u.x)+(c-a)*u.y*(1.0-u.x)+(d-b)*u.x*u.y; }
  void main(){
    vec2 c = vUv - 0.5;
    float r = length(c) * 2.0;
    if (r > 1.05) discard;
    float a = atan(c.y, c.x);
    // ornate runic ring: modulate rim by angular stripes + noise
    float stripes = 0.5 + 0.5 * sin(a * 24.0 + uTime * 1.4);
    float rim = smoothstep(1.05, 0.9, r) * (0.5 + stripes * 0.5);
    float inner = (1.0 - smoothstep(0.0, 0.9, r)) * (0.15 + 0.1 * noise(vec2(a*3.0, r*4.0 - uTime)));
    vec3 col = uColor * (rim * 2.0 + inner);
    gl_FragColor = vec4(col, clamp(rim * 1.3 + inner * 0.6, 0.0, 1.0));
  }
`;

export class Shield extends BaseEffect {
  constructor(sceneMgr) {
    super(sceneMgr);
    this.initialized = false;
    this.lifeLeft = 0;
  }

  trigger({ anchor, extra }) {
    if (!this.initialized) this._build();
    this.lifeLeft = CONFIG.HELD_EFFECT_FADE;
    const r = extra?.radius || 1.0;
    this.group.position.copy(anchor);
    this.group.scale.setScalar(r);
    // face camera
    const toCam = this.sceneMgr.camera.position.clone().sub(anchor).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), toCam);
    this.group.quaternion.copy(q);
  }

  _build() {
    // Parent group so shield + rune dots + secondary ring move together
    this.group = new THREE.Group();
    this.scene.add(this.group);

    const geo = new THREE.CircleGeometry(1.0, 96);
    this.mat = new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG,
      uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(CONFIG.SHIELD_COLOR) } },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    });
    this.mesh = new THREE.Mesh(geo, this.mat);
    this.group.add(this.mesh);

    // Secondary tilted inner ring (torus) — counter-rotates for dimensional depth
    const ringGeo = new THREE.TorusGeometry(0.75, 0.015, 8, 80);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(CONFIG.SHIELD_COLOR).multiplyScalar(1.3),
      transparent: true, opacity: 0.75,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    this.innerRing = new THREE.Mesh(ringGeo, ringMat);
    this.innerRing.rotation.x = 0.3;
    this.group.add(this.innerRing);

    // Four rune "pulse dots" at cardinal compass points
    this.runeDots = [];
    const dotMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(CONFIG.SHIELD_COLOR).multiplyScalar(1.6),
      transparent: true, opacity: 0.9,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const dotGeo = new THREE.SphereGeometry(0.05, 8, 8);
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.set(Math.cos(a), Math.sin(a), 0);
      this.group.add(dot);
      this.runeDots.push({ mesh: dot, phase: i * 0.8 });
    }

    this._track(this.group);
    this.initialized = true;
  }

  update(dt) {
    this.lifeLeft -= dt;
    this.mat.uniforms.uTime.value += dt;

    // inner ring counter-spins, rune dots pulse individually
    this.innerRing.rotation.z -= dt * 0.6;
    this.innerRing.rotation.y += dt * 0.3;
    const t = performance.now() * 0.003;
    for (const d of this.runeDots) {
      const pulse = 0.75 + 0.25 * Math.sin(t + d.phase);
      d.mesh.scale.setScalar(pulse);
      d.mesh.material.opacity = 0.7 + 0.3 * pulse;
    }

    if (this.lifeLeft < 0.4) {
      const f = Math.max(0, this.lifeLeft / 0.4);
      this.mat.uniforms.uColor.value.setHex(CONFIG.SHIELD_COLOR);
      if (this.lifeLeft <= 0) this.done = true;
    }
  }
}
