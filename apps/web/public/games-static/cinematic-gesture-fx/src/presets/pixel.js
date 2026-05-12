// Pixel — Tron/8-bit neon. Magenta + cyan + lime. Pixel trails on ALL
// fingertips, grid-snap heavy. Scanlines + tight-radius bloom.
export default {
  id: 'pixel',
  name: 'Pixel',
  description: '8-bit neon: magenta/cyan/lime, pixel trails everywhere, scanlines.',

  overrides: {
    BLOOM_STRENGTH: 1.8,
    BLOOM_RADIUS: 0.3,       // tighter
    BLOOM_THRESHOLD: 0.22,
    FILM_GRAIN: 0.09,
    CHROMATIC_ABERRATION: 0.0014,

    VIDEO_CONTRAST: 1.4,
    VIDEO_BRIGHTNESS: 0.42,
    VIDEO_SATURATION: 1.2,

    REPULSOR_CORE_COLOR: 0x00f0ff,
    REPULSOR_GLOW_COLOR: 0xff3cfa,
    PORTAL_RING_COLOR: 0xff3cfa,
    PORTAL_SPARK_COLOR: 0x4eff8a,
    PORTAL_EMBER_COLOR: 0x00f0ff,
    LASER_CORE_COLOR: 0x4eff8a,
    LASER_GLOW_COLOR: 0xff3cfa,
    JARVIS_COLOR: 0x00f0ff,
    WEB_COLOR: 0x4eff8a,
    WEB_RIM_COLOR: 0xff3cfa,
    LIGHTBEAM_COLOR: 0xff3cfa,
    SWIPE_COLOR: 0x00f0ff,
    SHOCKWAVE_COLOR: 0x4eff8a,
    ORB_COLOR: 0xff3cfa,
    SHIELD_COLOR: 0x00f0ff,
    WHIP_COLOR: 0xff3cfa,
    CHARGE_CORE_COLOR: 0x4eff8a,
    CHARGE_RIM_COLOR: 0xff3cfa,
    PRAYER_PILLAR_COLOR: 0x00f0ff,
    WARP_COLOR: 0xff3cfa,
    EBALL_COLOR_CORE: 0x00f0ff,
    EBALL_COLOR_AURA: 0xff3cfa,

    PIXEL_ENABLED: true,
    PIXEL_FINGERTIPS: [4, 8, 12, 16, 20], // all 10 fingers
    PIXEL_GRID_SNAP: 0.06,                // chunky quantization
    PIXEL_SIZE: 0.05,
    PIXEL_GLITCH_CHANCE: 0.08,
    PIXEL_INHERIT_VELOCITY: false,
  },
  structural: {
    portalStyle: 'wireframe',
    laserStyle: 'pixelated',
    crtShader: true,
    scanlines: true,
    particleSmoke: false,
  },
};
