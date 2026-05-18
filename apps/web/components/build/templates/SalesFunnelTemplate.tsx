'use client';

import { useState } from 'react';

type Stage = { label: string; value: number; tone: string };

const DEFAULT_STAGES: Stage[] = [
  { label: 'site visitors', value: 12000, tone: '#1a1a1a' },
  { label: 'newsletter signups', value: 3200, tone: '#3a3a3a' },
  { label: 'free trial starts', value: 880, tone: '#666666' },
  { label: 'qualified leads', value: 240, tone: '#9a9a9a' },
  { label: 'paying customers', value: 64, tone: '#c8c8c8' },
];

// Funnel geometry. Each tier's width is driven by its value relative to the
// top stage, so editing numbers reshapes the funnel live. MIN_WIDTH stops
// near-zero stages from collapsing into a sliver.
const FUNNEL_MAX_WIDTH = 580;
const FUNNEL_MIN_WIDTH = 80;
const FUNNEL_HEIGHT = 480;
const FUNNEL_PADDING_X = 40;
const SVG_WIDTH = FUNNEL_MAX_WIDTH + FUNNEL_PADDING_X * 2;
const CENTER_X = FUNNEL_PADDING_X + FUNNEL_MAX_WIDTH / 2;

function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'k';
  return n.toString();
}

function widthFor(value: number, topValue: number): number {
  if (topValue <= 0) return FUNNEL_MIN_WIDTH;
  const ratio = Math.max(0, Math.min(1, value / topValue));
  return FUNNEL_MIN_WIDTH + (FUNNEL_MAX_WIDTH - FUNNEL_MIN_WIDTH) * ratio;
}

function stagePath(topWidth: number, bottomWidth: number, topY: number, bottomY: number): string {
  return [
    `M ${CENTER_X - topWidth / 2} ${topY}`,
    `L ${CENTER_X + topWidth / 2} ${topY}`,
    `L ${CENTER_X + bottomWidth / 2} ${bottomY}`,
    `L ${CENTER_X - bottomWidth / 2} ${bottomY}`,
    'Z',
  ].join(' ');
}

export function SalesFunnelTemplate() {
  const [stages, setStages] = useState<Stage[]>(DEFAULT_STAGES);

  function bump(index: number, delta: number) {
    setStages((prev) =>
      prev.map((s, i) =>
        i === index ? { ...s, value: Math.max(0, Math.round(s.value + delta)) } : s,
      ),
    );
  }

  const total = stages.length;
  const tierHeight = FUNNEL_HEIGHT / total;
  const topValue = stages[0]?.value ?? 1;
  const tierWidths = stages.map((s) => widthFor(s.value, topValue));
  const overallRate = stages.length
    ? ((stages[stages.length - 1]!.value / stages[0]!.value) * 100).toFixed(2)
    : '0';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_300px] gap-8 items-start max-w-[1080px] mx-auto">
      <div className="relative mx-auto w-full">
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${FUNNEL_HEIGHT + 20}`}
          className="w-full max-w-[680px] mx-auto"
        >
          {stages.map((stage, i) => {
            const topY = i * tierHeight;
            const bottomY = topY + tierHeight;
            const midY = topY + tierHeight / 2;
            const topWidth = i === 0 ? tierWidths[0]! : tierWidths[i - 1]!;
            const bottomWidth = tierWidths[i]!;
            return (
              <g key={stage.label}>
                <path
                  d={stagePath(topWidth, bottomWidth, topY, bottomY)}
                  fill={stage.tone}
                  stroke="#ffffff"
                  strokeWidth="2"
                  style={{ transition: 'd 0.3s ease-out' }}
                />
                <text
                  x={CENTER_X}
                  y={midY - 4}
                  fill={i < 2 ? '#ffffff' : '#1a1a1a'}
                  fontSize="15"
                  fontFamily="'DM Sans', sans-serif"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {stage.label}
                </text>
                <text
                  x={CENTER_X}
                  y={midY + 18}
                  fill={i < 2 ? '#ffffff' : '#1a1a1a'}
                  fontSize="13"
                  fontFamily="'DM Sans', sans-serif"
                  fontWeight="400"
                  textAnchor="middle"
                  opacity="0.85"
                >
                  {formatNumber(stage.value)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="bg-white border border-jet/15 rounded-2xl p-5 sm:p-6">
        <p className="font-pixel text-[10px] uppercase text-jet/60 tracking-[0.18em]">
          STAGES · tune the numbers
        </p>

        <div className="mt-5 space-y-4">
          {stages.map((stage, i) => {
            const prev = i > 0 ? stages[i - 1]!.value : null;
            const rate = prev && prev > 0 ? ((stage.value / prev) * 100).toFixed(1) : null;
            return (
              <div key={stage.label}>
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-sans text-[14px] font-medium text-jet truncate">
                    {stage.label}
                  </p>
                  {rate !== null && (
                    <span className="font-pixel text-[9px] uppercase text-jet/55 tracking-[0.15em]">
                      {rate}%
                    </span>
                  )}
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <button
                    onClick={() => bump(i, -Math.max(1, Math.round(stage.value * 0.1)))}
                    className="w-7 h-7 rounded-md border border-jet/15 text-jet/70 hover:border-jet hover:text-jet font-sans text-[15px] leading-none transition-colors"
                    aria-label={`decrease ${stage.label}`}
                  >
                    −
                  </button>
                  <span className="font-display italic text-[18px] text-jet flex-1 text-center">
                    {stage.value.toLocaleString()}
                  </span>
                  <button
                    onClick={() => bump(i, Math.max(1, Math.round(stage.value * 0.1)))}
                    className="w-7 h-7 rounded-md border border-jet/15 text-jet/70 hover:border-jet hover:text-jet font-sans text-[15px] leading-none transition-colors"
                    aria-label={`increase ${stage.label}`}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-5 border-t border-jet/10">
          <p className="font-pixel text-[10px] uppercase text-jet/60 tracking-[0.18em]">
            END-TO-END
          </p>
          <p className="mt-2 font-display italic text-[28px] text-jet leading-none">
            {overallRate}%
          </p>
          <p className="mt-1 font-sans text-[12px] text-jet/60">
            of {stages[0]!.label} become {stages[stages.length - 1]!.label}.
          </p>
        </div>
      </div>
    </div>
  );
}
