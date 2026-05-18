'use client';

import { useState } from 'react';

type Stage = {
  name: string;
  icon: string;
  emotion: number; // -2 (frustrated) to +2 (delighted)
  touchpoints: string[];
  painPoints?: string[];
};

const STAGES: Stage[] = [
  {
    name: 'awareness',
    icon: '👀',
    emotion: 1,
    touchpoints: ['instagram ad', 'word of mouth', 'google search'],
  },
  {
    name: 'consideration',
    icon: '🤔',
    emotion: 0,
    touchpoints: ['website visit', 'pricing page', 'comparison reviews'],
    painPoints: ['pricing felt unclear'],
  },
  {
    name: 'purchase',
    icon: '🛒',
    emotion: -1,
    touchpoints: ['checkout form', 'discovery call', 'contract email'],
    painPoints: ['checkout asked for too much info', 'no instant confirmation'],
  },
  {
    name: 'onboarding',
    icon: '🛠️',
    emotion: 1,
    touchpoints: ['welcome email', 'kickoff call', 'in-app tour'],
  },
  {
    name: 'retention',
    icon: '💌',
    emotion: 2,
    touchpoints: ['monthly check-in', 'support chat', 'referral nudge'],
  },
];

const CURVE_WIDTH = 720;
const CURVE_HEIGHT = 140;
const CURVE_PADDING_X = 60;
const CURVE_PADDING_Y = 20;

function emotionToY(emotion: number): number {
  // map -2..+2 to bottom..top of curve area
  const normalized = (emotion + 2) / 4; // 0..1
  return CURVE_HEIGHT - CURVE_PADDING_Y - normalized * (CURVE_HEIGHT - CURVE_PADDING_Y * 2);
}

function stageX(index: number, total: number): number {
  const inner = CURVE_WIDTH - CURVE_PADDING_X * 2;
  return CURVE_PADDING_X + (index / (total - 1)) * inner;
}

export function CustomerJourneyTemplate() {
  const [active, setActive] = useState(0);

  const points = STAGES.map((s, i) => ({
    x: stageX(i, STAGES.length),
    y: emotionToY(s.emotion),
  }));

  // Smooth cubic curve through the points using simple midpoint control points.
  const curvePath = points
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = points[i - 1]!;
      const midX = (prev.x + p.x) / 2;
      return `C ${midX} ${prev.y} ${midX} ${p.y} ${p.x} ${p.y}`;
    })
    .join(' ');

  const focusedStage = STAGES[active]!;

  return (
    <div className="max-w-[1000px] mx-auto space-y-6">
      {/* Emotion curve */}
      <div className="bg-white border border-jet/15 rounded-2xl p-5 sm:p-6">
        <div className="flex items-baseline justify-between mb-3">
          <p className="font-pixel text-[10px] uppercase text-jet/60 tracking-[0.18em]">
            EMOTION CURVE
          </p>
          <p className="font-pixel text-[9px] uppercase text-jet/40 tracking-[0.18em]">
            ↕ delight to frustration
          </p>
        </div>
        <svg
          viewBox={`0 0 ${CURVE_WIDTH} ${CURVE_HEIGHT}`}
          className="w-full h-auto"
        >
          {/* Baseline */}
          <line
            x1={CURVE_PADDING_X}
            y1={CURVE_HEIGHT / 2}
            x2={CURVE_WIDTH - CURVE_PADDING_X}
            y2={CURVE_HEIGHT / 2}
            stroke="#1a1a1a"
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity="0.25"
          />
          {/* Curve */}
          <path d={curvePath} stroke="#1a1a1a" strokeWidth="2.5" fill="none" />
          {/* Points */}
          {points.map((p, i) => {
            const isActive = i === active;
            return (
              <g
                key={i}
                onClick={() => setActive(i)}
                className="cursor-pointer"
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isActive ? 9 : 6}
                  fill={isActive ? '#1a1a1a' : '#ffffff'}
                  stroke="#1a1a1a"
                  strokeWidth="2"
                  style={{ transition: 'r 0.2s, fill 0.2s' }}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Stage cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {STAGES.map((s, i) => {
          const isActive = i === active;
          return (
            <button
              key={s.name}
              onClick={() => setActive(i)}
              className={[
                'text-left bg-white rounded-xl px-3 py-3 border transition-all',
                isActive
                  ? 'border-jet border-2 -translate-y-[2px] shadow-[0_2px_0_rgba(26,26,26,0.06)]'
                  : 'border-jet/15 hover:border-jet/40',
              ].join(' ')}
            >
              <div className="flex items-center justify-between">
                <span className="text-[22px]">{s.icon}</span>
                {s.painPoints && (
                  <span
                    aria-label={`${s.painPoints.length} pain points`}
                    className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-jet text-cream text-[10px] font-bold"
                  >
                    !
                  </span>
                )}
              </div>
              <p className="mt-2 font-pixel text-[8px] uppercase text-jet/45 tracking-[0.15em]">
                STEP {i + 1}
              </p>
              <p className="mt-1 font-display italic text-[17px] text-jet leading-tight">
                {s.name}
              </p>
            </button>
          );
        })}
      </div>

      {/* Focused detail */}
      <div className="bg-white border border-jet/15 rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <span className="text-[28px]">{focusedStage.icon}</span>
          <div>
            <p className="font-pixel text-[10px] uppercase text-jet/55 tracking-[0.18em]">
              STAGE {active + 1} · {focusedStage.name}
            </p>
            <p className="font-display italic text-[20px] text-jet leading-tight">
              what happens here
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="font-pixel text-[9px] uppercase text-jet/50 tracking-[0.18em] mb-2">
              TOUCHPOINTS
            </p>
            <ul className="space-y-2">
              {focusedStage.touchpoints.map((t) => (
                <li
                  key={t}
                  className="flex items-start gap-2 font-sans text-[14px] text-jet"
                >
                  <span
                    aria-hidden="true"
                    className="mt-1.5 inline-block w-1.5 h-1.5 rounded-full bg-jet flex-shrink-0"
                  />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-pixel text-[9px] uppercase text-jet/50 tracking-[0.18em] mb-2">
              PAIN MARKERS
            </p>
            {focusedStage.painPoints ? (
              <ul className="space-y-2">
                {focusedStage.painPoints.map((p) => (
                  <li
                    key={p}
                    className="flex items-start gap-2 font-sans text-[14px] text-jet"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-jet text-cream text-[10px] font-bold flex-shrink-0"
                    >
                      !
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="font-sans italic text-[14px] text-jet/55">
                no pain points logged for this stage. customer sails through.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
