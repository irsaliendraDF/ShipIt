'use client';

import { useState } from 'react';

const WEDGES = [
  'free coffee',
  '10% off',
  'try again',
  'mystery prize',
  'free shipping',
  '$20 credit',
  'better luck',
  'big winner',
];

const PALETTE = [
  '#1a1a1a',
  '#e5e5e5',
  '#1a1a1a',
  '#e5e5e5',
  '#1a1a1a',
  '#e5e5e5',
  '#1a1a1a',
  '#e5e5e5',
];

const TEXT_PALETTE = [
  '#ffffff',
  '#1a1a1a',
  '#ffffff',
  '#1a1a1a',
  '#ffffff',
  '#1a1a1a',
  '#ffffff',
  '#1a1a1a',
];

const RADIUS = 160;
const CENTER = 180;
const SLICE_ANGLE = 360 / WEDGES.length;

function polar(angle: number, r: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) };
}

function slicePath(index: number): string {
  const start = polar(index * SLICE_ANGLE, RADIUS);
  const end = polar((index + 1) * SLICE_ANGLE, RADIUS);
  return [
    `M ${CENTER} ${CENTER}`,
    `L ${start.x} ${start.y}`,
    `A ${RADIUS} ${RADIUS} 0 0 1 ${end.x} ${end.y}`,
    'Z',
  ].join(' ');
}

export function SpinningWheelTemplate() {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  function spin() {
    if (spinning) return;
    setWinner(null);
    const spins = 5 + Math.floor(Math.random() * 3);
    const extra = Math.floor(Math.random() * 360);
    const next = rotation + spins * 360 + extra;
    setRotation(next);
    setSpinning(true);
    window.setTimeout(() => {
      const normalized = ((next % 360) + 360) % 360;
      const pointerAngle = (360 - normalized) % 360;
      const winningIndex = Math.floor(pointerAngle / SLICE_ANGLE) % WEDGES.length;
      setWinner(WEDGES[winningIndex] ?? null);
      setSpinning(false);
    }, 4200);
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <svg
          viewBox="0 0 360 360"
          className="w-[320px] h-[320px] sm:w-[360px] sm:h-[360px] drop-shadow-[0_8px_24px_rgba(26,26,26,0.18)]"
        >
          <g
            style={{
              transformOrigin: '180px 180px',
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.16, 0.99)' : 'none',
            }}
          >
            {WEDGES.map((label, i) => {
              const labelAngle = i * SLICE_ANGLE + SLICE_ANGLE / 2;
              const labelPos = polar(labelAngle, RADIUS * 0.62);
              return (
                <g key={label}>
                  <path d={slicePath(i)} fill={PALETTE[i]} stroke="#ffffff" strokeWidth="2" />
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    fill={TEXT_PALETTE[i]}
                    fontSize="13"
                    fontFamily="'DM Sans', sans-serif"
                    fontWeight="600"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${labelAngle}, ${labelPos.x}, ${labelPos.y})`}
                  >
                    {label}
                  </text>
                </g>
              );
            })}
          </g>
          <circle cx={CENTER} cy={CENTER} r="22" fill="#1a1a1a" />
          <circle cx={CENTER} cy={CENTER} r="14" fill="#ffffff" />
        </svg>
        <div
          aria-hidden="true"
          className="absolute left-1/2 -top-1 -translate-x-1/2"
          style={{
            width: 0,
            height: 0,
            borderLeft: '14px solid transparent',
            borderRight: '14px solid transparent',
            borderTop: '24px solid #1a1a1a',
            filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.2))',
          }}
        />
      </div>

      <button
        onClick={spin}
        disabled={spinning}
        className="font-sans font-semibold text-[16px] bg-jet text-cream rounded-full px-7 py-3 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-[1px] transition-all"
      >
        {spinning ? 'spinning…' : winner ? 'spin again' : 'spin the wheel'}
      </button>

      <div className="min-h-[48px] flex items-center">
        {winner && !spinning && (
          <p className="font-display italic text-[24px] text-jet">
            you got <span className="underline decoration-jet/40 decoration-2 underline-offset-4">{winner}</span> ✨
          </p>
        )}
      </div>
    </div>
  );
}
