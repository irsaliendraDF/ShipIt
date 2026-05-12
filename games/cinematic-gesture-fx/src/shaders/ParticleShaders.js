// Custom shaders for the pooled GPU particle system.
// - Vertex shader: takes per-particle size, color, alpha as attributes, applies
//   size-attenuation so particles shrink with distance.
// - Fragment shader: soft circular falloff, additive blend.
//
// All effect-specific tinting is baked into the per-particle color attribute,
// so one material works for every effect.

export const PARTICLE_VERT = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  attribute float aAlpha;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = aColor;
    vAlpha = aAlpha;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    // 300.0 controls absolute pixel scale — tweak via aSize
    gl_PointSize = aSize * (300.0 / max(-mv.z, 0.001));
    gl_Position = projectionMatrix * mv;
  }
`;

export const PARTICLE_FRAG = /* glsl */ `
  precision mediump float;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // soft circular point, centered at gl_PointCoord (0..1)
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    // falloff curve — bright core, sharper edge drop-off so particles read
    // as distinct dots of color instead of fuzzy glowing blobs
    float core = smoothstep(0.5, 0.0, d);
    float soft = pow(core, 2.6);             // sharper falloff (was 2.2)
    vec3 c = vColor * (0.35 + 0.7 * soft);   // lower ambient add, more per-particle color
    gl_FragColor = vec4(c, vAlpha * soft);
  }
`;

// ---------------------------------------------------------------------------
// Volumetric beam shader — cylinder mesh with alpha-falloff radially from
// center line + scrolling noise to feel atmospheric. Used for repulsor cone,
// light beam, and laser glow. Tweak uIntensity / uColor per effect.
export const VOLUMETRIC_VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vLocal;
  void main() {
    vUv = uv;
    vLocal = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const VOLUMETRIC_FRAG = /* glsl */ `
  precision mediump float;
  varying vec2 vUv;
  varying vec3 vLocal;
  uniform float uTime;
  uniform vec3  uColor;
  uniform float uIntensity;
  uniform float uLengthFade;    // 0=no end fade, 1=fade toward far end

  // cheap 2D hash noise for smokey variation
  float hash(vec2 p) { return fract(sin(dot(p, vec2(27.619, 57.583))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f*f*(3.0 - 2.0*f);
    return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
  }

  void main() {
    // vUv.x runs along beam length (0=base,1=tip), vUv.y around circumference
    float radialFade = 1.0 - abs(vUv.y - 0.5) * 2.0;       // bright at center line
    radialFade = pow(radialFade, 2.5);
    float lengthFade = mix(1.0, 1.0 - vUv.x, uLengthFade); // optional taper
    float n = noise(vec2(vUv.y * 6.0, vUv.x * 8.0 - uTime * 1.8));
    float beam = radialFade * lengthFade * (0.65 + 0.4 * n);
    vec3 col = uColor * beam * uIntensity;
    gl_FragColor = vec4(col, beam * 0.85);
  }
`;

// ---------------------------------------------------------------------------
// Shockwave ring shader — a thin bright band that pulses outward on a disc.
// Tilt the disc in 3D so it faces the camera vector.
export const SHOCKWAVE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const SHOCKWAVE_FRAG = /* glsl */ `
  precision mediump float;
  varying vec2 vUv;
  uniform float uProgress;    // 0..1 life progress
  uniform vec3  uColor;

  void main() {
    // radial coord 0 at center, 1 at rim
    vec2 c = vUv - 0.5;
    float r = length(c) * 2.0;
    // the bright band sweeps from 0 -> 1 as uProgress advances
    float band = smoothstep(uProgress - 0.08, uProgress, r)
               * (1.0 - smoothstep(uProgress, uProgress + 0.05, r));
    // add a faint inner flash near the center early in life
    float flash = (1.0 - smoothstep(0.0, 0.35, r)) * (1.0 - smoothstep(0.0, 0.25, uProgress));
    float fade = 1.0 - uProgress;
    float a = (band * 1.0 + flash * 0.35) * fade;         // was 1.4 / 0.6
    gl_FragColor = vec4(uColor * (band * 1.1 + flash * 0.55), clamp(a, 0.0, 1.0));  // was 2.0 / 1.0
  }
`;
