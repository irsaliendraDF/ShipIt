// Energy — Dragon Ball / Ki aesthetic. Vibrant yellows + electric cyans,
// heavier bloom, Energy Ball is the star. Portals become spherical rifts.
export default {
  id: 'energy',
  name: 'Energy',
  description: 'DBZ ki energy: yellows, cyans, big bloom, spherical portals.',

  overrides: {
    BLOOM_STRENGTH: 2.0,
    BLOOM_RADIUS: 0.75,
    BLOOM_THRESHOLD: 0.1,
    FILM_GRAIN: 0.04,
    CHROMATIC_ABERRATION: 0.0011, // +10% over superhero baseline

    VIDEO_CONTRAST: 1.35,
    VIDEO_BRIGHTNESS: 0.48,
    VIDEO_SATURATION: 1.1,

    REPULSOR_CORE_COLOR: 0xffffff,
    REPULSOR_GLOW_COLOR: 0xffe04a,
    PORTAL_RING_COLOR: 0xfff07a,
    PORTAL_SPARK_COLOR: 0xffffff,
    PORTAL_EMBER_COLOR: 0xffd84a,
    LASER_CORE_COLOR: 0xffffff,
    LASER_GLOW_COLOR: 0x66ffff,
    JARVIS_COLOR: 0xffeb5a,
    WEB_COLOR: 0xffffff,
    WEB_RIM_COLOR: 0xffe06a,
    LIGHTBEAM_COLOR: 0xffffff,
    SWIPE_COLOR: 0xffffff,
    SHOCKWAVE_COLOR: 0xfff6c8,
    ORB_COLOR: 0xffffff,
    SHIELD_COLOR: 0xffeb5a,
    WHIP_COLOR: 0xffff6a,
    CHARGE_CORE_COLOR: 0xffffff,
    CHARGE_RIM_COLOR: 0x00e6ff,
    PRAYER_PILLAR_COLOR: 0xffffff,
    WARP_COLOR: 0x66ffff,
    EBALL_COLOR_CORE: 0xffffff,
    EBALL_COLOR_AURA: 0xfff06a,
    EBALL_CRACKLE_HZ: 14,          // louder crackle
    EBALL_MAX_CHARGE_RADIUS: 0.75, // bigger charge ceiling
    PIXEL_ENABLED: false,
  },
  structural: {
    portalStyle: 'spherical',
    laserStyle: 'smooth',
    crtShader: false,
    scanlines: false,
    particleSmoke: false,
  },
};
