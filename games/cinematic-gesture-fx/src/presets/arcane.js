// Arcane — smoky magical sigils, violet + gold + ember-orange. Particles
// drift slowly with long lifetimes. Heavy vignette + more film grain.
export default {
  id: 'arcane',
  name: 'Arcane',
  description: 'Smoky magic: violet/gold/ember, slow particles, heavy grain.',

  overrides: {
    BLOOM_STRENGTH: 1.1,
    BLOOM_RADIUS: 0.9,         // soft wide bloom
    BLOOM_THRESHOLD: 0.18,
    FILM_GRAIN: 0.18,          // ~3× superhero
    CHROMATIC_ABERRATION: 0.0005,

    VIDEO_CONTRAST: 1.25,
    VIDEO_BRIGHTNESS: 0.35,
    VIDEO_SATURATION: 0.85,

    REPULSOR_CORE_COLOR: 0xffd47a,
    REPULSOR_GLOW_COLOR: 0x9a3bff,
    PORTAL_RING_COLOR: 0xffc96a,
    PORTAL_SPARK_COLOR: 0xffe08a,
    PORTAL_EMBER_COLOR: 0xff7a2a,
    LASER_CORE_COLOR: 0xffd47a,
    LASER_GLOW_COLOR: 0x9a3bff,
    JARVIS_COLOR: 0xffc96a,
    WEB_COLOR: 0xffd47a,
    WEB_RIM_COLOR: 0x9a3bff,
    LIGHTBEAM_COLOR: 0xffd47a,
    SWIPE_COLOR: 0xff9a4a,
    SHOCKWAVE_COLOR: 0xffd47a,
    ORB_COLOR: 0xffc96a,
    SHIELD_COLOR: 0xffc96a,
    WHIP_COLOR: 0xff7a2a,
    CHARGE_CORE_COLOR: 0xffd47a,
    CHARGE_RIM_COLOR: 0x9a3bff,
    PRAYER_PILLAR_COLOR: 0xffe08a,
    WARP_COLOR: 0x9a3bff,
    EBALL_COLOR_CORE: 0xffe08a,
    EBALL_COLOR_AURA: 0x9a3bff,

    PIXEL_ENABLED: false,
  },
  structural: {
    portalStyle: 'runic',
    laserStyle: 'smooth',
    crtShader: false,
    scanlines: false,
    particleSmoke: true,        // longer life, slower drift (honored by EnergyBall, etc.)
    vignette: 0.55,
  },
};
