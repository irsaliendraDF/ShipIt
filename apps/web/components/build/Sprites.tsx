/**
 * 16x16 pixel sprites used on the shipit.build page.
 *
 * Per spec, shipit.build only uses 4 of the 8 ShipIt sprites:
 * SHIP, BUILD, SPARK, BOLT. All rendered crisp (no anti-aliasing) using
 * the 6-color palette only.
 */

type SpriteProps = {
  size?: number;
  className?: string;
  rotate?: number;
};

const baseStyle = {
  imageRendering: 'pixelated' as const,
  shapeRendering: 'crispEdges' as const,
};

/** SHIP — small cargo ship sprite. Hull jet, deck cream, smokestack orange. */
export function ShipSprite({ size = 16, className, rotate = 0 }: SpriteProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      className={className}
      style={{ ...baseStyle, transform: rotate ? `rotate(${rotate}deg)` : undefined }}
      aria-hidden="true"
      shapeRendering="crispEdges"
    >
      {/* sky leftover transparent */}
      {/* smokestack */}
      <rect x="9" y="3" width="2" height="3" fill="#1a1a1a" />
      {/* smoke puff */}
      <rect x="11" y="2" width="2" height="2" fill="#fde9c8" />
      <rect x="13" y="1" width="1" height="2" fill="#fde9c8" />
      {/* cabin / deck */}
      <rect x="4" y="6" width="9" height="2" fill="#fde9c8" />
      <rect x="6" y="6" width="1" height="2" fill="#1a1a1a" />
      <rect x="10" y="6" width="1" height="2" fill="#1a1a1a" />
      {/* hull */}
      <rect x="2" y="8" width="13" height="3" fill="#ff7a3d" />
      <rect x="2" y="11" width="12" height="1" fill="#1a1a1a" />
      {/* hull stripe */}
      <rect x="2" y="9" width="13" height="1" fill="#ff6fb5" />
      {/* water */}
      <rect x="0" y="13" width="3" height="1" fill="#8b5cf6" />
      <rect x="5" y="13" width="4" height="1" fill="#8b5cf6" />
      <rect x="11" y="13" width="4" height="1" fill="#8b5cf6" />
      <rect x="2" y="14" width="3" height="1" fill="#8b5cf6" />
      <rect x="8" y="14" width="3" height="1" fill="#8b5cf6" />
      <rect x="13" y="14" width="2" height="1" fill="#8b5cf6" />
    </svg>
  );
}

/** BUILD — orange folder/toolbox sprite. */
export function BuildSprite({ size = 16, className, rotate = 0 }: SpriteProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      className={className}
      style={{ ...baseStyle, transform: rotate ? `rotate(${rotate}deg)` : undefined }}
      aria-hidden="true"
      shapeRendering="crispEdges"
    >
      {/* folder tab */}
      <rect x="2" y="3" width="6" height="2" fill="#ff7a3d" />
      <rect x="2" y="3" width="6" height="1" fill="#1a1a1a" />
      {/* folder body */}
      <rect x="1" y="5" width="14" height="9" fill="#ff7a3d" />
      <rect x="1" y="5" width="14" height="1" fill="#1a1a1a" />
      <rect x="1" y="13" width="14" height="1" fill="#1a1a1a" />
      <rect x="1" y="5" width="1" height="9" fill="#1a1a1a" />
      <rect x="14" y="5" width="1" height="9" fill="#1a1a1a" />
      {/* wrench */}
      <rect x="5" y="8" width="1" height="3" fill="#fde9c8" />
      <rect x="6" y="9" width="3" height="1" fill="#fde9c8" />
      <rect x="9" y="7" width="2" height="1" fill="#fde9c8" />
      <rect x="9" y="11" width="2" height="1" fill="#fde9c8" />
      <rect x="10" y="8" width="1" height="3" fill="#fde9c8" />
      {/* highlight */}
      <rect x="2" y="6" width="1" height="1" fill="#ff6fb5" />
      <rect x="13" y="6" width="1" height="1" fill="#ff6fb5" />
    </svg>
  );
}

/** SPARK — 4-point sparkle/diamond, riso purple core with orange + bubblegum accents. */
export function SparkSprite({ size = 16, className, rotate = 0 }: SpriteProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      className={className}
      style={{ ...baseStyle, transform: rotate ? `rotate(${rotate}deg)` : undefined }}
      aria-hidden="true"
      shapeRendering="crispEdges"
    >
      {/* vertical axis */}
      <rect x="7" y="1" width="2" height="2" fill="#ff7a3d" />
      <rect x="7" y="3" width="2" height="2" fill="#ff6fb5" />
      <rect x="7" y="5" width="2" height="2" fill="#8b5cf6" />
      <rect x="7" y="9" width="2" height="2" fill="#8b5cf6" />
      <rect x="7" y="11" width="2" height="2" fill="#ff6fb5" />
      <rect x="7" y="13" width="2" height="2" fill="#ff7a3d" />
      {/* horizontal axis */}
      <rect x="1" y="7" width="2" height="2" fill="#ff7a3d" />
      <rect x="3" y="7" width="2" height="2" fill="#ff6fb5" />
      <rect x="5" y="7" width="2" height="2" fill="#8b5cf6" />
      <rect x="9" y="7" width="2" height="2" fill="#8b5cf6" />
      <rect x="11" y="7" width="2" height="2" fill="#ff6fb5" />
      <rect x="13" y="7" width="2" height="2" fill="#ff7a3d" />
      {/* center */}
      <rect x="7" y="7" width="2" height="2" fill="#fde9c8" />
    </svg>
  );
}

/** BOLT — lightning bolt, orange with jet outline. */
export function BoltSprite({ size = 16, className, rotate = 0 }: SpriteProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      className={className}
      style={{ ...baseStyle, transform: rotate ? `rotate(${rotate}deg)` : undefined }}
      aria-hidden="true"
      shapeRendering="crispEdges"
    >
      {/* upper arm of bolt */}
      <rect x="8" y="1" width="3" height="1" fill="#1a1a1a" />
      <rect x="7" y="2" width="3" height="1" fill="#ff7a3d" />
      <rect x="10" y="2" width="1" height="1" fill="#1a1a1a" />
      <rect x="6" y="3" width="3" height="1" fill="#ff7a3d" />
      <rect x="9" y="3" width="1" height="1" fill="#1a1a1a" />
      <rect x="5" y="4" width="3" height="1" fill="#ff7a3d" />
      <rect x="8" y="4" width="1" height="1" fill="#1a1a1a" />
      <rect x="4" y="5" width="4" height="1" fill="#ff7a3d" />
      <rect x="8" y="5" width="1" height="1" fill="#1a1a1a" />
      <rect x="3" y="6" width="6" height="1" fill="#ff7a3d" />
      <rect x="9" y="6" width="1" height="1" fill="#1a1a1a" />
      <rect x="3" y="7" width="7" height="1" fill="#ff7a3d" />
      <rect x="10" y="7" width="1" height="1" fill="#1a1a1a" />
      {/* middle zig */}
      <rect x="5" y="8" width="5" height="1" fill="#1a1a1a" />
      <rect x="5" y="8" width="4" height="1" fill="#ff7a3d" />
      {/* lower arm */}
      <rect x="5" y="9" width="3" height="1" fill="#ff7a3d" />
      <rect x="4" y="9" width="1" height="1" fill="#1a1a1a" />
      <rect x="8" y="9" width="1" height="1" fill="#1a1a1a" />
      <rect x="5" y="10" width="2" height="1" fill="#ff7a3d" />
      <rect x="4" y="10" width="1" height="1" fill="#1a1a1a" />
      <rect x="7" y="10" width="1" height="1" fill="#1a1a1a" />
      <rect x="5" y="11" width="2" height="1" fill="#ff7a3d" />
      <rect x="4" y="11" width="1" height="1" fill="#1a1a1a" />
      <rect x="7" y="11" width="1" height="1" fill="#1a1a1a" />
      <rect x="5" y="12" width="1" height="1" fill="#ff7a3d" />
      <rect x="4" y="12" width="1" height="1" fill="#1a1a1a" />
      <rect x="6" y="12" width="1" height="1" fill="#1a1a1a" />
      <rect x="4" y="13" width="2" height="1" fill="#1a1a1a" />
      {/* highlight on upper bolt */}
      <rect x="7" y="3" width="1" height="1" fill="#fde9c8" />
      <rect x="6" y="4" width="1" height="1" fill="#fde9c8" />
    </svg>
  );
}
