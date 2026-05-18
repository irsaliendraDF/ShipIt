'use client';

import { useState } from 'react';

const PROMPTS = [
  'what made you laugh this week?',
  'share an unpopular opinion.',
  'describe yourself in 3 emojis.',
  'what is currently overhyped?',
  'biggest food crime you have committed?',
  'what would your billboard say?',
  'most embarrassing playlist track?',
  'best gift you have ever given?',
  'a tiny win from today.',
  'what would you teach a class on?',
  'rate your week as a weather forecast.',
  'who would you swap lives with for a day?',
];

export function RandomPickerTemplate() {
  const [pickedIndex, setPickedIndex] = useState<number | null>(null);
  const [shuffling, setShuffling] = useState(false);
  const [drawCount, setDrawCount] = useState(0);

  function draw() {
    if (shuffling) return;
    setShuffling(true);
    setPickedIndex(null);
    let ticks = 0;
    const flicker = window.setInterval(() => {
      setPickedIndex(Math.floor(Math.random() * PROMPTS.length));
      ticks += 1;
      if (ticks > 12) {
        window.clearInterval(flicker);
        setPickedIndex(Math.floor(Math.random() * PROMPTS.length));
        setShuffling(false);
        setDrawCount((c) => c + 1);
      }
    }, 70);
  }

  return (
    <div className="flex flex-col items-center gap-8 max-w-[720px] mx-auto">
      {/* The deck */}
      <div
        className="relative w-[300px] h-[420px] sm:w-[340px] sm:h-[470px]"
        aria-label="Card deck"
      >
        {/* Back stack — 4 cards offset behind the front one */}
        {[3, 2, 1].map((offset) => (
          <div
            key={offset}
            aria-hidden="true"
            className="absolute inset-0 rounded-2xl border border-jet/15 bg-white"
            style={{
              transform: `translate(${offset * 4}px, ${offset * 4}px) rotate(${offset * 1.2}deg)`,
              boxShadow: '0 2px 0 rgba(26,26,26,0.04)',
            }}
          />
        ))}

        {/* Front card — either the back design or the revealed prompt */}
        <div
          className="absolute inset-0 rounded-2xl border-2 border-jet bg-white flex flex-col items-center justify-center p-6 text-center"
          style={{
            boxShadow: '0 8px 24px rgba(26,26,26,0.12)',
            transition: 'transform 0.25s ease-out',
            transform: shuffling ? 'rotate(-2deg) scale(0.98)' : 'rotate(0deg) scale(1)',
          }}
          key={drawCount}
        >
          {pickedIndex === null ? (
            <>
              <div className="font-pixel text-[11px] uppercase text-jet/40 tracking-[0.28em]">
                THE DECK
              </div>
              <div
                aria-hidden="true"
                className="mt-6 w-24 h-24 border-2 border-jet rounded-2xl flex items-center justify-center"
              >
                <span className="font-display italic text-[40px] text-jet leading-none">?</span>
              </div>
              <p className="mt-6 font-sans text-[14px] text-jet/60 leading-snug">
                click below to draw a card.
              </p>
            </>
          ) : (
            <>
              <div className="font-pixel text-[10px] uppercase text-jet/45 tracking-[0.22em]">
                CARD {pickedIndex + 1} / {PROMPTS.length}
              </div>
              <div
                className="mt-5 font-display italic text-[24px] sm:text-[26px] text-jet leading-tight"
                style={{
                  opacity: shuffling ? 0.55 : 1,
                  transition: 'opacity 0.15s',
                }}
              >
                {PROMPTS[pickedIndex]}
              </div>
              {!shuffling && (
                <p className="mt-6 font-pixel text-[9px] uppercase text-jet/40 tracking-[0.22em]">
                  ▾ your prompt ▾
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <button
        onClick={draw}
        disabled={shuffling}
        className="font-sans font-semibold text-[16px] bg-jet text-cream rounded-full px-7 py-3 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-[1px] transition-all"
      >
        {shuffling ? 'shuffling…' : pickedIndex === null ? 'draw a card' : 'draw again'}
      </button>

      <p className="font-pixel text-[9px] uppercase text-jet/40 tracking-[0.22em]">
        DRAWS: {drawCount}
      </p>
    </div>
  );
}
