/**
 * Sticker collage per the shipit.fun "mixtape edition" brand spec:
 * a handful of 16x16-feeling pixel sprites scattered at 5-20deg rotations,
 * background purple at 12% with a dashed orange border. Pure decoration.
 */

function Ship() {
  return (
    <svg viewBox="0 0 16 16" className="w-12 h-12" style={{ imageRendering: 'pixelated' }}>
      <rect x="6" y="2" width="1" height="8" fill="#1a1a1a" />
      <polygon points="7,3 13,6 7,7" fill="#fde9c8" />
      <polygon points="7,8 13,9 7,9" fill="#fde9c8" />
      <rect x="11" y="2" width="1" height="2" fill="#ff6fb5" />
      <rect x="2" y="10" width="12" height="2" fill="#1a1a1a" />
      <rect x="3" y="12" width="10" height="1" fill="#1a1a1a" />
      <rect x="2" y="14" width="2" height="1" fill="#8b5cf6" opacity="0.7" />
      <rect x="7" y="14" width="2" height="1" fill="#8b5cf6" opacity="0.7" />
      <rect x="12" y="14" width="2" height="1" fill="#8b5cf6" opacity="0.7" />
    </svg>
  );
}

function Tiara() {
  return (
    <svg viewBox="0 0 16 16" className="w-10 h-10" style={{ imageRendering: 'pixelated' }}>
      <rect x="3" y="10" width="10" height="2" fill="#1a1a1a" />
      <polygon points="3,10 5,5 7,9" fill="#ff7a3d" />
      <polygon points="6,9 8,4 10,9" fill="#ff7a3d" />
      <polygon points="9,9 11,5 13,10" fill="#ff7a3d" />
      <rect x="7" y="3" width="2" height="2" fill="#ff6fb5" />
      <rect x="4" y="5" width="1" height="1" fill="#8b5cf6" />
      <rect x="11" y="5" width="1" height="1" fill="#8b5cf6" />
    </svg>
  );
}

function GlitchHeart() {
  return (
    <svg viewBox="0 0 16 16" className="w-10 h-10" style={{ imageRendering: 'pixelated' }}>
      <path
        d="M3 5 L3 8 L8 13 L13 8 L13 5 L10 5 L10 7 L8 7 L8 5 L6 5 L6 7 L4 7 L4 5 Z"
        fill="#ff6fb5"
      />
      <rect x="7" y="6" width="1" height="3" fill="#8b5cf6" />
      <rect x="9" y="9" width="1" height="1" fill="#8b5cf6" />
    </svg>
  );
}

function RiotKitty() {
  return (
    <svg viewBox="0 0 16 16" className="w-10 h-10" style={{ imageRendering: 'pixelated' }}>
      <polygon points="3,4 4,7 6,5" fill="#1a1a1a" />
      <polygon points="13,4 12,7 10,5" fill="#1a1a1a" />
      <rect x="3" y="6" width="10" height="6" fill="#1a1a1a" />
      <rect x="5" y="8" width="1" height="1" fill="#8b5cf6" />
      <rect x="10" y="8" width="1" height="1" fill="#8b5cf6" />
      <rect x="7" y="10" width="2" height="1" fill="#ff6fb5" />
      <rect x="4" y="6" width="2" height="1" fill="#ff7a3d" />
    </svg>
  );
}

function Mixtape() {
  return (
    <svg viewBox="0 0 16 16" className="w-12 h-12" style={{ imageRendering: 'pixelated' }}>
      <rect x="2" y="4" width="12" height="8" fill="#1a1a1a" />
      <rect x="3" y="5" width="10" height="2" fill="#fde9c8" />
      <circle cx="5" cy="9" r="1.5" fill="#fde9c8" />
      <circle cx="11" cy="9" r="1.5" fill="#fde9c8" />
      <rect x="6" y="9" width="4" height="0.5" fill="#fde9c8" />
      <rect x="4" y="6" width="0.5" height="0.5" fill="#ff6fb5" />
      <rect x="12" y="6" width="0.5" height="0.5" fill="#ff7a3d" />
    </svg>
  );
}

type StickerProps = { angle: number; offsetX: number; offsetY: number };

const sprites = [
  { El: Ship, name: 'ship' },
  { El: Tiara, name: 'tiara' },
  { El: RiotKitty, name: 'riot-kitty' },
  { El: GlitchHeart, name: 'glitch-heart' },
  { El: Mixtape, name: 'mixtape' },
];

const positions: StickerProps[] = [
  { angle: -12, offsetX: 0, offsetY: 0 },
  { angle: 8, offsetX: 30, offsetY: 10 },
  { angle: -5, offsetX: -10, offsetY: 25 },
  { angle: 17, offsetX: 18, offsetY: -8 },
  { angle: -18, offsetX: -25, offsetY: -5 },
];

export function StickerScatter() {
  return (
    <div
      className="relative px-6 py-10 lg:py-14"
      style={{
        background: 'rgba(139, 92, 246, 0.12)',
        border: '1px dashed rgba(255, 122, 61, 0.55)',
      }}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 items-center justify-items-center gap-4">
        {sprites.map(({ El, name }, i) => {
          const pos = positions[i % positions.length]!;
          return (
            <div
              key={name}
              style={{
                transform: `rotate(${pos.angle}deg) translate(${pos.offsetX}px, ${pos.offsetY}px)`,
              }}
              className="inline-block"
              aria-hidden="true"
            >
              <El />
            </div>
          );
        })}
      </div>
      <p className="mt-6 text-center font-pixel text-[10px] uppercase tracking-[0.3em] text-jet/55">
        ✦ patch collection vol. 01 ✦
      </p>
    </div>
  );
}
