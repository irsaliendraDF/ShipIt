'use client';

import { useState } from 'react';

type Tier = {
  label: string;
  detail: string;
  color: string;
};

const TIERS: Tier[] = [
  {
    label: 'self-actualization',
    detail: 'meaningful work, creative flow, the things you do because they matter to you.',
    color: '#1a1a1a',
  },
  {
    label: 'esteem',
    detail: 'recognition, mastery, confidence. earned, not borrowed.',
    color: '#4a4a4a',
  },
  {
    label: 'belonging',
    detail: 'family, friends, the people you choose to spend a tuesday with.',
    color: '#7a7a7a',
  },
  {
    label: 'safety',
    detail: 'a roof, a paycheque, knowing your body and bank account are okay.',
    color: '#b0b0b0',
  },
  {
    label: 'physiological',
    detail: 'food, water, sleep. the floor everything else is built on.',
    color: '#dcdcdc',
  },
];

const PYRAMID_WIDTH = 480;
const PYRAMID_HEIGHT = 360;
const TIER_HEIGHT = PYRAMID_HEIGHT / TIERS.length;
const APEX_X = PYRAMID_WIDTH / 2;

function tierPath(index: number): string {
  const topY = index * TIER_HEIGHT;
  const bottomY = topY + TIER_HEIGHT;
  const topWidth = (index / TIERS.length) * PYRAMID_WIDTH;
  const bottomWidth = ((index + 1) / TIERS.length) * PYRAMID_WIDTH;
  return [
    `M ${APEX_X - topWidth / 2} ${topY}`,
    `L ${APEX_X + topWidth / 2} ${topY}`,
    `L ${APEX_X + bottomWidth / 2} ${bottomY}`,
    `L ${APEX_X - bottomWidth / 2} ${bottomY}`,
    'Z',
  ].join(' ');
}

export function PyramidFrameworkTemplate() {
  const [active, setActive] = useState(0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-10 items-center max-w-[920px] mx-auto">
      <svg
        viewBox={`0 0 ${PYRAMID_WIDTH} ${PYRAMID_HEIGHT}`}
        className="w-[360px] sm:w-[440px] mx-auto drop-shadow-[0_8px_24px_rgba(26,26,26,0.18)]"
      >
        {TIERS.map((tier, i) => {
          const isActive = i === active;
          return (
            <g
              key={tier.label}
              onClick={() => setActive(i)}
              className="cursor-pointer"
              style={{ transition: 'opacity 0.3s' }}
            >
              <path
                d={tierPath(i)}
                fill={tier.color}
                stroke="#ffffff"
                strokeWidth="2"
                style={{
                  opacity: isActive ? 1 : 0.6,
                  filter: isActive ? 'brightness(1.05)' : 'none',
                  transition: 'opacity 0.3s, filter 0.3s',
                }}
              />
              <text
                x={APEX_X}
                y={i * TIER_HEIGHT + TIER_HEIGHT / 2 + 4}
                fill={i < 2 ? '#ffffff' : '#1a1a1a'}
                fontSize={i === 0 ? '10' : '13'}
                fontFamily="'DM Sans', sans-serif"
                fontWeight="600"
                textAnchor="middle"
                style={{ pointerEvents: 'none' }}
              >
                {tier.label}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="bg-white border border-jet/15 rounded-2xl p-6 sm:p-7 min-h-[200px]">
        <p className="font-pixel text-[10px] uppercase text-jet/60 tracking-[0.18em]">
          TIER {TIERS.length - active}
        </p>
        <h3 className="mt-3 font-display italic text-[26px] sm:text-[28px] text-jet leading-tight">
          {TIERS[active]!.label}
        </h3>
        <p className="mt-4 font-sans text-[15px] text-jet/75 leading-relaxed">
          {TIERS[active]!.detail}
        </p>
        <p className="mt-6 font-pixel text-[9px] uppercase text-jet/40 tracking-[0.18em]">
          ← click any tier to explore
        </p>
      </div>
    </div>
  );
}
