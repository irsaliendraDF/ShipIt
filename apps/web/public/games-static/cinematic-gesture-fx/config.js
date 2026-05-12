// config.js — tweak these to change the vibe. All colors are THREE.Color hex ints.
export const CONFIG = {
  // ---- Rendering ----
  MAX_PARTICLES: 6000,           // pool size (reused, no per-frame alloc)
  // Heavy-handed bloom was blowing effects into solid white blobs.
  // Now: low strength + tight radius + high threshold = only brightest
  // highlights bloom, and only softly — effect SHAPES stay visible.
  BLOOM_STRENGTH: 0.4,
  BLOOM_RADIUS: 0.3,
  BLOOM_THRESHOLD: 0.42,
  FILM_GRAIN: 0.06,
  CHROMATIC_ABERRATION: 0.0008,  // subtle color fringe on big hits
  AUTO_PERF_DROP: true,          // auto-halve particles if fps<35

  // ---- Webcam look ----
  VIDEO_CONTRAST: 1.3,           // >1 = punchier (hands stand out from background)
  VIDEO_BRIGHTNESS: 0.55,        // <1 = darker backdrop so effects pop
  VIDEO_SATURATION: 0.95,

  // ---- Camera / space ----
  WORLD_DEPTH: -2.0,             // z-plane where gestures emit (negative = into screen)
  VIDEO_PLANE_Z: -6.0,           // webcam background plane depth
  CAMERA_FOV: 55,

  // ---- Gesture detection ----
  GESTURE_STABLE_FRAMES: 2,      // frames a gesture must hold before firing (lower = snappier)
  GESTURE_MISS_GRACE: 4,         // frames a gesture can be "lost" before resetting (smoother tracking)
  HELD_EFFECT_FADE: 1.0,         // sec a held effect persists without re-trigger before fading
                                 // (bigger = effect stays attached through tracking dropouts)
  GESTURE_CONFIDENCE_MIN: 0.62,
  SWIPE_VELOCITY: 1.1,           // world-units/sec threshold for swipe
  HOLD_PALM_UP_MS: 1000,
  PINCH_DIST: 0.055,             // normalized — closer than this = pinched
  CLAP_DIST: 0.12,               // two hands closer than this = clap

  // ---- Effect: Iron Man repulsor ----
  REPULSOR_CORE_COLOR: 0xbfe9ff,
  REPULSOR_GLOW_COLOR: 0x3aa9ff,
  REPULSOR_LENGTH: 5.5,
  REPULSOR_RADIUS: 0.22,
  REPULSOR_SHAKE: 0.035,

  // ---- Effect: Dr. Strange portal ----
  // Green mystic-arts palette (Eye of Agamotto / Time Stone vibe).
  PORTAL_RING_COLOR: 0x2fff70,   // vibrant emerald ring
  PORTAL_SPARK_COLOR: 0xa0ffb0,  // bright lime sparks fanning outward
  PORTAL_EMBER_COLOR: 0x00d750,  // deeper green rising embers
  PORTAL_SPARK_RATE: 220,        // sparks/sec while open (was 140 — more dense, movie-like)

  // ---- Effect: Laser ----
  LASER_CORE_COLOR: 0xff3355,
  LASER_GLOW_COLOR: 0xff6688,
  LASER_THICKNESS: 0.018,

  // ---- Effect: JARVIS HUD ----
  JARVIS_COLOR: 0x7ae0ff,
  JARVIS_RING_COUNT: 3,
  JARVIS_SPIN_SPEED: 0.8,

  // ---- Effect: Spider web ----
  WEB_COLOR: 0xf2f9ff,
  WEB_RIM_COLOR: 0x8cc8ff,
  WEB_LIFE: 1.6,                 // seconds

  // ---- Effect: Light beam ----
  LIGHTBEAM_COLOR: 0xffefc4,
  LIGHTBEAM_DUSTMOTES: 120,

  // ---- Effect: Shockwave ----
  SHOCKWAVE_COLOR: 0xffffff,
  SHOCKWAVE_MAX_RADIUS: 3.4,
  SHOCKWAVE_LIFE: 0.9,

  // ---- Effect: Swipe slash ----
  SWIPE_COLOR: 0xffc061,
  SWIPE_COUNT: 220,

  // ---- Effect: Holo orb ----
  ORB_COLOR: 0x9be7ff,
  ORB_RADIUS: 0.18,

  // ---- Combo / two-hand ----
  COMBO_WINDOW_DEFAULT: 1200,
  COMBO_SHOW_HINTS: true,
  COMBO_BUFFER_MS: 2500,                 // how long gestures stay in the chain HUD / combo buffer
  TWO_HAND_STABILITY_FRAMES: 6,
  TWO_HAND_CONFIDENCE_MIN: 0.8,
  NEW_FIRING_GAP_MS: 220,                // gap of silence to count a held gesture as "re-fired"

  // Per-combo color overrides (used by combo finisher effects + HUD)
  COMBO_COLORS: {
    RepulsorBarrage: 0x3aa9ff,
    PortalPunch:     0xff8a1a,
    WebZip:          0xf2f9ff,
    StrangeSanctum:  0xff8a1a,
    Unibeam:         0xbfe9ff,
    JarvisBoot:      0x7ae0ff,
    Cataclysm:       0x9a3bff,
  },

  // ---- Two-hand effect tuning ----
  SHIELD_COLOR: 0xff8a1a,
  WHIP_COLOR: 0xff6a20,
  CHARGE_CORE_COLOR: 0xbfe9ff,
  CHARGE_RIM_COLOR: 0x3aa9ff,
  PRAYER_PILLAR_COLOR: 0xffeac0,
  WARP_COLOR: 0x9a3bff,

  // ---- Energy Ball ----
  EBALL_COLOR_CORE: 0xffffff,
  EBALL_COLOR_AURA: 0xffea4a,
  EBALL_ORBIT_COUNT: 40,
  EBALL_CRACKLE_HZ: 8,             // avg crackle arcs per second
  EBALL_MAX_CHARGE_RADIUS: 0.55,
  EBALL_LAUNCH_SPEED: 7.0,
  EBALL_WOBBLE_AMP: 0.08,
  EBALL_IMPACT_RADIUS: 3.2,

  // ---- Pixel trail ----
  PIXEL_ENABLED: false,            // preset-toggled
  PIXEL_SPAWN_EVERY_N: 2,
  PIXEL_SIZE: 0.035,
  PIXEL_GRID_SNAP: 0.035,
  PIXEL_LIFE_MS: 1500,
  PIXEL_INHERIT_VELOCITY: false,
  PIXEL_GLITCH_CHANCE: 0.033,
  PIXEL_FINGERTIPS: [8],           // default: index only; all-5 = [4,8,12,16,20]
  PIXEL_PALETTE: [0xff3cfa, 0x00f0ff, 0x4eff8a],

  // ---- Gesture smoothing ----
  ONE_EURO_MIN_CUTOFF: 1.5,
  ONE_EURO_BETA: 0.05,
  ONE_EURO_ENABLED: true,

  // ---- Custom gesture classifier ----
  CUSTOM_MATCH_STABILITY: 4,       // frames stable > threshold before firing
  CUSTOM_CONFIDENCE_DEFAULT: 0.70,

  // ---- Sharpening pass (unsharp mask on the final composite) ----
  SHARPEN_AMOUNT: 0.65,            // 0 = off, 0.4 subtle, 0.8 strong, >1 oversharp
};
