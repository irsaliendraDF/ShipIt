// Superhero — the default. Marvel/DC movie lighting. Warm hero colors,
// bright cool cores, balanced post-processing.
export default {
  id: 'superhero',
  name: 'Superhero',
  description: 'Marvel/DC cinematic: orange portals, blue-white repulsors, cyan JARVIS.',

  // config keys override CONFIG.* on apply (cross-faded numeric values)
  overrides: {
    // post
    BLOOM_STRENGTH: 0.4,
    BLOOM_RADIUS: 0.3,
    BLOOM_THRESHOLD: 0.42,
    FILM_GRAIN: 0.05,
    CHROMATIC_ABERRATION: 0.0006,

    // video
    VIDEO_CONTRAST: 1.3,
    VIDEO_BRIGHTNESS: 0.55,
    VIDEO_SATURATION: 0.95,

    // effect colors
    REPULSOR_CORE_COLOR: 0xbfe9ff,
    REPULSOR_GLOW_COLOR: 0x3aa9ff,
    // Green mystic-arts portal (Avengers: Endgame / Eye of Agamotto)
    PORTAL_RING_COLOR: 0x2fff70,
    PORTAL_SPARK_COLOR: 0xa0ffb0,
    PORTAL_EMBER_COLOR: 0x00d750,
    LASER_CORE_COLOR: 0xff3355,
    LASER_GLOW_COLOR: 0xff6688,
    JARVIS_COLOR: 0x7ae0ff,
    WEB_COLOR: 0xf2f9ff,
    WEB_RIM_COLOR: 0x8cc8ff,
    LIGHTBEAM_COLOR: 0xffefc4,
    SWIPE_COLOR: 0xffc061,
    SHOCKWAVE_COLOR: 0xffffff,
    ORB_COLOR: 0x9be7ff,
    SHIELD_COLOR: 0xff8a1a,
    WHIP_COLOR: 0xff6a20,
    CHARGE_CORE_COLOR: 0xbfe9ff,
    CHARGE_RIM_COLOR: 0x3aa9ff,
    PRAYER_PILLAR_COLOR: 0xffeac0,
    WARP_COLOR: 0x9a3bff,
    EBALL_COLOR_CORE: 0xffffff,
    EBALL_COLOR_AURA: 0xffd47a,

    // Pixel off by default for Superhero
    PIXEL_ENABLED: false,
  },

  // Structural flags read by specific effects (not cross-faded; swap instantly)
  structural: {
    portalStyle: 'ring',        // ring | spherical | wireframe | runic
    laserStyle: 'smooth',        // smooth | pixelated
    crtShader: false,
    scanlines: false,
    particleSmoke: false,        // slow long-life particles (arcane)
  },
};
