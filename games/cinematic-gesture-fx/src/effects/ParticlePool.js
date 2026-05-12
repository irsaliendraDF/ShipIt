// GPU particle pool: one big THREE.Points object, custom shader material.
// Emitters grab a slice of the pool and write position/velocity/life for
// each particle they own. Update integrates motion every frame.

import * as THREE from 'three';
import { PARTICLE_VERT, PARTICLE_FRAG } from '../shaders/ParticleShaders.js';
import { CONFIG } from '../../config.js';

export class ParticlePool {
  constructor(scene, maxParticles = CONFIG.MAX_PARTICLES) {
    this.scene = scene;
    this.max = Math.floor(maxParticles * (window.__perfScale || 1));
    this.count = this.max;

    // buffers
    this.positions = new Float32Array(this.max * 3);
    this.velocities = new Float32Array(this.max * 3);
    this.colors = new Float32Array(this.max * 3);
    this.sizes = new Float32Array(this.max);
    this.alphas = new Float32Array(this.max);
    this.lives = new Float32Array(this.max);    // current remaining life
    this.maxLives = new Float32Array(this.max); // initial life (for fade)
    this.drag = new Float32Array(this.max);     // per-particle drag (0..1/sec)
    this.gravityY = new Float32Array(this.max); // optional per-particle gravity

    // start all particles dead (alpha=0, life=0)
    for (let i = 0; i < this.max; i++) {
      this.alphas[i] = 0;
      this.lives[i] = 0;
      // stash dead particles far away so they never affect bounds
      this.positions[i * 3 + 2] = -9999;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    geo.setAttribute('aColor', new THREE.BufferAttribute(this.colors, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(this.sizes, 1));
    geo.setAttribute('aAlpha', new THREE.BufferAttribute(this.alphas, 1));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6);

    const mat = new THREE.ShaderMaterial({
      vertexShader: PARTICLE_VERT,
      fragmentShader: PARTICLE_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.points = new THREE.Points(geo, mat);
    this.points.frustumCulled = false;
    this.points.layers.enable(1); // bloom layer — particles always bloom
    scene.add(this.points);

    this.geo = geo;
    this.mat = mat;
    this.cursor = 0; // rolling allocator
  }

  // Allocate one particle slot. Rolls over, overwriting oldest.
  allocate() {
    const idx = this.cursor;
    this.cursor = (this.cursor + 1) % this.max;
    return idx;
  }

  // Spawn a single particle.
  spawn({
    pos, vel, color, size = 1.0, life = 1.0, alpha = 1.0,
    drag = 0.9, gravityY = 0.0,
  }) {
    const i = this.allocate();
    const i3 = i * 3;
    this.positions[i3 + 0] = pos.x;
    this.positions[i3 + 1] = pos.y;
    this.positions[i3 + 2] = pos.z;
    this.velocities[i3 + 0] = vel.x;
    this.velocities[i3 + 1] = vel.y;
    this.velocities[i3 + 2] = vel.z;
    this.colors[i3 + 0] = color.r;
    this.colors[i3 + 1] = color.g;
    this.colors[i3 + 2] = color.b;
    this.sizes[i] = size;
    this.alphas[i] = alpha;
    this.lives[i] = life;
    this.maxLives[i] = life;
    this.drag[i] = drag;
    this.gravityY[i] = gravityY;
    return i;
  }

  // Integrate motion + fade. Call once per frame.
  update(dt) {
    const dtc = Math.min(dt, 0.05); // clamp for stability on stutter
    const pos = this.positions, vel = this.velocities, alp = this.alphas;
    const lives = this.lives, maxL = this.maxLives, drag = this.drag, gy = this.gravityY;
    for (let i = 0; i < this.max; i++) {
      if (lives[i] <= 0) {
        if (alp[i] !== 0) alp[i] = 0;
        continue;
      }
      lives[i] -= dtc;
      const i3 = i * 3;
      // motion
      pos[i3 + 0] += vel[i3 + 0] * dtc;
      pos[i3 + 1] += vel[i3 + 1] * dtc;
      pos[i3 + 2] += vel[i3 + 2] * dtc;
      // gravity
      vel[i3 + 1] += gy[i] * dtc;
      // drag (exponential decay)
      const d = Math.pow(drag[i], dtc);
      vel[i3 + 0] *= d;
      vel[i3 + 1] *= d;
      vel[i3 + 2] *= d;
      // fade by remaining life fraction
      const t = lives[i] / Math.max(maxL[i], 1e-4);
      // ease-out fade
      alp[i] = Math.max(0, t * t);
      if (lives[i] <= 0) {
        alp[i] = 0;
        pos[i3 + 2] = -9999;
      }
    }
    this.geo.attributes.position.needsUpdate = true;
    this.geo.attributes.aAlpha.needsUpdate = true;
    this.geo.attributes.aSize.needsUpdate = true;
    this.geo.attributes.aColor.needsUpdate = true;
  }

  dispose() {
    this.scene.remove(this.points);
    this.geo.dispose();
    this.mat.dispose();
  }
}
