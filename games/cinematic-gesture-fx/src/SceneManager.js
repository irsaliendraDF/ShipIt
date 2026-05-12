// SceneManager — owns Three.js renderer, scene, camera, post-processing stack,
// the webcam background plane, the particle pool, and the render loop.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FilmPass } from 'three/addons/postprocessing/FilmPass.js';

import { CONFIG } from '../config.js';
import { AppState } from './AppState.js';
import { ParticlePool } from './effects/ParticlePool.js';

// Chromatic aberration pass — splits R/G/B by small UV offsets. Amount is
// driven from CONFIG + a transient boost fired by big hits.
const ChromaticShader = {
  uniforms: { tDiffuse: { value: null }, uAmount: { value: CONFIG.CHROMATIC_ABERRATION } },
  vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float uAmount; varying vec2 vUv;
    void main() {
      vec2 c = vUv - 0.5;
      vec2 offset = c * uAmount;
      float r = texture2D(tDiffuse, vUv - offset).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv + offset).b;
      gl_FragColor = vec4(r, g, b, 1.0);
    }
  `,
};

export class SceneManager {
  constructor() {
    this.effects = [];         // active effect instances
    this.videoMesh = null;
    this.cameraShake = { amount: 0, decay: 6 };
    this.chromaticBoost = 0;
  }

  init() {
    const canvas = AppState.dom.threeCanvas;
    const w = window.innerWidth, h = window.innerHeight;

    this.renderer = new THREE.WebGLRenderer({
      canvas, antialias: true, alpha: false, powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h, false);
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(CONFIG.CAMERA_FOV, w / h, 0.1, 100);
    this.camera.position.set(0, 0, 0);
    this.camera.lookAt(0, 0, -1);

    AppState.scene = this.scene;
    AppState.camera = this.camera;
    AppState.renderer = this.renderer;

    // ---- webcam background plane ----
    // Sized to fill camera frustum at VIDEO_PLANE_Z
    const z = CONFIG.VIDEO_PLANE_Z;
    const vFov = (CONFIG.CAMERA_FOV * Math.PI) / 180;
    const planeH = 2 * Math.tan(vFov / 2) * Math.abs(z);
    const planeW = planeH * (w / h);

    this.videoTexture = new THREE.VideoTexture(AppState.dom.video);
    this.videoTexture.colorSpace = THREE.SRGBColorSpace;
    this.videoTexture.minFilter = THREE.LinearFilter;
    this.videoTexture.magFilter = THREE.LinearFilter;
    this.videoTexture.generateMipmaps = false;
    this.videoTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy?.() || 1;

    const planeGeo = new THREE.PlaneGeometry(planeW, planeH);
    // Custom shader so we can boost contrast + darken the background slightly.
    // This keeps hands crisp and prevents bloom from nuking skin tones.
    this.videoMat = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: this.videoTexture },
        uContrast: { value: CONFIG.VIDEO_CONTRAST },
        uBrightness: { value: CONFIG.VIDEO_BRIGHTNESS },
        uSaturation: { value: CONFIG.VIDEO_SATURATION },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
      `,
      fragmentShader: `
        precision mediump float;
        varying vec2 vUv;
        uniform sampler2D map;
        uniform float uContrast;
        uniform float uBrightness;
        uniform float uSaturation;
        void main() {
          vec3 c = texture2D(map, vUv).rgb;
          // contrast around 0.5 midpoint
          c = (c - 0.5) * uContrast + 0.5;
          // brightness (multiplicative — values <1 darken overall)
          c *= uBrightness;
          // saturation via luminance blend
          float lum = dot(c, vec3(0.299, 0.587, 0.114));
          c = mix(vec3(lum), c, uSaturation);
          gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
        }
      `,
      depthWrite: false,
      toneMapped: false,
    });
    this.videoMesh = new THREE.Mesh(planeGeo, this.videoMat);
    this.videoMesh.position.z = z;
    this.videoMesh.scale.x = AppState.mirror ? -1 : 1; // mirror by flipping x
    this.scene.add(this.videoMesh);

    // ---- particle pool ----
    this.particles = new ParticlePool(this.scene, CONFIG.MAX_PARTICLES);

    // ---- SELECTIVE BLOOM ----
    // Two composers so the webcam never contributes to bloom:
    //   bloomComposer: dark-swaps non-bloom materials, then renders bloom to a texture
    //   finalComposer: renders the real scene, then additively mixes that bloom texture in
    // Any mesh/points/line whose `layers` flag has BLOOM_LAYER enabled will bloom.
    // Effects auto-mark themselves via BaseEffect._track; the video plane does not.
    this.BLOOM_LAYER = 1;
    this.bloomLayerMask = new THREE.Layers();
    this.bloomLayerMask.set(this.BLOOM_LAYER);
    this.darkMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    this._matBackup = new Map();

    const renderPassA = new RenderPass(this.scene, this.camera);
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(w, h),
      CONFIG.BLOOM_STRENGTH, CONFIG.BLOOM_RADIUS, CONFIG.BLOOM_THRESHOLD,
    );
    this.bloomComposer = new EffectComposer(this.renderer);
    this.bloomComposer.renderToScreen = false;
    this.bloomComposer.setSize(w, h);
    this.bloomComposer.addPass(renderPassA);
    this.bloomComposer.addPass(this.bloomPass);

    // Mix shader: base scene + bloom texture (additive)
    const MixShader = {
      uniforms: {
        baseTexture: { value: null },
        bloomTexture: { value: this.bloomComposer.renderTarget2.texture },
      },
      vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `
        uniform sampler2D baseTexture;
        uniform sampler2D bloomTexture;
        varying vec2 vUv;
        void main() {
          vec4 base = texture2D(baseTexture, vUv);
          vec4 bloom = texture2D(bloomTexture, vUv);
          gl_FragColor = vec4(base.rgb + bloom.rgb, 1.0);
        }
      `,
    };
    this.mixPass = new ShaderPass(
      new THREE.ShaderMaterial({
        uniforms: MixShader.uniforms,
        vertexShader: MixShader.vertexShader,
        fragmentShader: MixShader.fragmentShader,
      }),
      'baseTexture',
    );
    this.mixPass.needsSwap = true;

    const renderPassB = new RenderPass(this.scene, this.camera);
    this.chromaticPass = new ShaderPass(ChromaticShader);
    this.filmPass = new FilmPass(CONFIG.FILM_GRAIN, false);

    // Sharpen pass — unsharp mask. Big perceived-detail win on webcam pixels
    // without actually adding any. Cheap (5 texture taps).
    const SharpenShader = {
      uniforms: {
        tDiffuse: { value: null },
        uAmount: { value: CONFIG.SHARPEN_AMOUNT },
        uTexel:  { value: new THREE.Vector2(1 / w, 1 / h) },
      },
      vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader: `
        precision highp float;
        uniform sampler2D tDiffuse; uniform float uAmount; uniform vec2 uTexel;
        varying vec2 vUv;
        void main() {
          vec4 c = texture2D(tDiffuse, vUv);
          vec4 n = texture2D(tDiffuse, vUv + vec2(0.0, uTexel.y));
          vec4 s = texture2D(tDiffuse, vUv - vec2(0.0, uTexel.y));
          vec4 e = texture2D(tDiffuse, vUv + vec2(uTexel.x, 0.0));
          vec4 w_ = texture2D(tDiffuse, vUv - vec2(uTexel.x, 0.0));
          vec4 blur = (n + s + e + w_) * 0.25;
          // unsharp mask: original + amount * (original - blurred)
          vec3 sharp = c.rgb + (c.rgb - blur.rgb) * uAmount;
          gl_FragColor = vec4(sharp, c.a);
        }
      `,
    };
    this.sharpenPass = new ShaderPass(SharpenShader);

    // Scanline / CRT pass — disabled by default, toggled by preset (Pixel).
    // Cheap: applies horizontal scan darkening + slight barrel warp in UV.
    const ScanlineShader = {
      uniforms: { tDiffuse: { value: null }, uAmount: { value: 0 }, uCurve: { value: 0 } },
      vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader: `
        uniform sampler2D tDiffuse; uniform float uAmount; uniform float uCurve; varying vec2 vUv;
        void main() {
          vec2 uv = vUv;
          // subtle barrel distortion
          vec2 c = uv - 0.5;
          float r2 = dot(c, c);
          uv = 0.5 + c * (1.0 + uCurve * r2);
          vec4 col = texture2D(tDiffuse, uv);
          // scanlines
          float scan = 0.5 + 0.5 * cos(uv.y * 1400.0);
          col.rgb *= mix(1.0, scan, uAmount);
          gl_FragColor = col;
        }
      `,
    };
    this.scanPass = new ShaderPass(ScanlineShader);
    this.scanPass.enabled = false;

    this.finalComposer = new EffectComposer(this.renderer);
    this.finalComposer.setSize(w, h);
    this.finalComposer.addPass(renderPassB);
    this.finalComposer.addPass(this.mixPass);
    this.finalComposer.addPass(this.sharpenPass);  // sharpen BEFORE chromatic so we sharpen real detail, not fringe
    this.finalComposer.addPass(this.chromaticPass);
    this.finalComposer.addPass(this.scanPass);
    this.finalComposer.addPass(this.filmPass);

    AppState.composer = this.finalComposer;

    window.addEventListener('resize', () => this._onResize(), { passive: true });

    // world extents used by effects that need a hit-plane (e.g. laser impact)
    this.worldPlaneZ = CONFIG.WORLD_DEPTH - 1.5;
  }

  _onResize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
    this.bloomComposer.setSize(w, h);
    this.finalComposer.setSize(w, h);

    // rescale video plane
    const z = CONFIG.VIDEO_PLANE_Z;
    const vFov = (CONFIG.CAMERA_FOV * Math.PI) / 180;
    const planeH = 2 * Math.tan(vFov / 2) * Math.abs(z);
    const planeW = planeH * (w / h);
    this.videoMesh.geometry.dispose();
    this.videoMesh.geometry = new THREE.PlaneGeometry(planeW, planeH);
  }

  setMirror(on) {
    this.videoMesh.scale.x = on ? -1 : 1;
  }

  addEffect(effect) {
    this.effects.push(effect);
  }

  // Big hits call this to briefly boost chromatic aberration and camera shake.
  punch(amount = 1.0) {
    this.cameraShake.amount = Math.max(this.cameraShake.amount, CONFIG.REPULSOR_SHAKE * amount);
    this.chromaticBoost = Math.max(this.chromaticBoost, 0.008 * amount);
  }

  update(dt) {
    // update all active effects
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const e = this.effects[i];
      e.update(dt);
      if (e.done) {
        e.dispose();
        this.effects.splice(i, 1);
      }
    }
    this.particles.update(dt);

    // camera shake decay
    if (this.cameraShake.amount > 0) {
      const a = this.cameraShake.amount;
      this.camera.position.x = (Math.random() - 0.5) * a;
      this.camera.position.y = (Math.random() - 0.5) * a;
      this.cameraShake.amount = Math.max(0, a - this.cameraShake.decay * a * dt);
      if (this.cameraShake.amount < 0.001) { this.camera.position.x = 0; this.camera.position.y = 0; }
    }

    // chromatic aberration decay
    const target = CONFIG.CHROMATIC_ABERRATION + this.chromaticBoost;
    this.chromaticPass.uniforms.uAmount.value = target;
    this.chromaticBoost = Math.max(0, this.chromaticBoost - dt * 2.5);

    // sync live CONFIG values into uniforms so PresetManager cross-fades work
    this.bloomPass.strength = CONFIG.BLOOM_STRENGTH;
    this.bloomPass.radius = CONFIG.BLOOM_RADIUS;
    this.bloomPass.threshold = CONFIG.BLOOM_THRESHOLD;
    if (this.videoMat) {
      this.videoMat.uniforms.uContrast.value = CONFIG.VIDEO_CONTRAST;
      this.videoMat.uniforms.uBrightness.value = CONFIG.VIDEO_BRIGHTNESS;
      this.videoMat.uniforms.uSaturation.value = CONFIG.VIDEO_SATURATION;
    }
    // FilmPass nIntensity uniform — three.js naming
    if (this.filmPass?.uniforms?.intensity) {
      this.filmPass.uniforms.intensity.value = CONFIG.FILM_GRAIN;
    } else if (this.filmPass?.uniforms?.nIntensity) {
      this.filmPass.uniforms.nIntensity.value = CONFIG.FILM_GRAIN;
    }
    // Sharpen amount + texel size (in case window resized)
    if (this.sharpenPass) {
      this.sharpenPass.uniforms.uAmount.value = CONFIG.SHARPEN_AMOUNT;
      const w = this.renderer.domElement.width;
      const h = this.renderer.domElement.height;
      this.sharpenPass.uniforms.uTexel.value.set(1 / w, 1 / h);
    }
  }

  setScanlines(on, amount = 0.35, curve = 0.06) {
    this.scanPass.enabled = !!on;
    this.scanPass.uniforms.uAmount.value = amount;
    this.scanPass.uniforms.uCurve.value = curve;
  }

  // Selective-bloom render: swap non-bloom meshes to black, render bloom
  // into the offscreen target, restore materials, render the real scene with
  // the bloom texture mixed in on top.
  _darkenNonBloom(obj) {
    if ((obj.isMesh || obj.isPoints || obj.isLine) && !this.bloomLayerMask.test(obj.layers)) {
      this._matBackup.set(obj.uuid, obj.material);
      obj.material = this.darkMaterial;
    }
  }
  _restoreMaterial(obj) {
    if (this._matBackup.has(obj.uuid)) {
      obj.material = this._matBackup.get(obj.uuid);
      this._matBackup.delete(obj.uuid);
    }
  }

  render() {
    // pass 1: bloom (non-bloom objects rendered black so they don't glow)
    this.scene.traverse(o => this._darkenNonBloom(o));
    this.bloomComposer.render();
    this.scene.traverse(o => this._restoreMaterial(o));
    // pass 2: final scene + bloom texture + chromatic + grain
    this.finalComposer.render();
  }
}
