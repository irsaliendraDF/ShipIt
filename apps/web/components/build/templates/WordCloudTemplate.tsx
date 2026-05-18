'use client';

import { useState, type FormEvent } from 'react';

type Word = { text: string; count: number };

const SEED_WORDS: Word[] = [
  { text: 'curious', count: 12 },
  { text: 'energizing', count: 9 },
  { text: 'collaborative', count: 8 },
  { text: 'fast', count: 7 },
  { text: 'rigorous', count: 7 },
  { text: 'playful', count: 6 },
  { text: 'honest', count: 6 },
  { text: 'thoughtful', count: 5 },
  { text: 'warm', count: 5 },
  { text: 'sharp', count: 4 },
  { text: 'unhinged', count: 4 },
  { text: 'optimistic', count: 4 },
  { text: 'kind', count: 3 },
  { text: 'wry', count: 3 },
  { text: 'direct', count: 3 },
  { text: 'weird', count: 2 },
  { text: 'patient', count: 2 },
  { text: 'restless', count: 2 },
];

function fontSizeFor(count: number, maxCount: number): number {
  const ratio = maxCount > 0 ? count / maxCount : 0;
  return 14 + Math.round(ratio * 42); // 14px → 56px so the heaviest words really anchor
}

function opacityFor(count: number, maxCount: number): number {
  return 0.5 + (count / maxCount) * 0.5;
}

const ROTATION_RING = [0, 0, 0, 0, -12, 12, 90, -90, 0, 0, 0, -8, 8];

// Sunflower spiral placement. Heaviest word lands at center; each subsequent
// word steps outward by golden-angle increments so they spread organically
// instead of stacking. Positions are percentages of the cloud container.
function placeWords(sortedByWeight: Word[]) {
  return sortedByWeight.map((w, i) => {
    if (i === 0) {
      return { ...w, x: 50, y: 50, rotation: 0 };
    }
    const goldenAngle = i * 137.5077;
    const angleRad = (goldenAngle * Math.PI) / 180;
    // Square-root growth keeps inner words tight, outer words spread.
    const radius = Math.sqrt(i) * 9;
    const x = 50 + Math.cos(angleRad) * radius;
    const y = 50 + Math.sin(angleRad) * radius * 0.78; // slight vertical squash
    const rotation = ROTATION_RING[i % ROTATION_RING.length] ?? 0;
    return { ...w, x, y, rotation };
  });
}

export function WordCloudTemplate() {
  const [words, setWords] = useState<Word[]>(SEED_WORDS);
  const [input, setInput] = useState('');
  const [recent, setRecent] = useState<string[]>([]);

  function addWord(e: FormEvent) {
    e.preventDefault();
    const clean = input.trim().toLowerCase().slice(0, 24);
    if (!clean) return;
    setWords((prev) => {
      const existing = prev.find((w) => w.text === clean);
      if (existing) {
        return prev.map((w) =>
          w.text === clean ? { ...w, count: w.count + 1 } : w,
        );
      }
      return [...prev, { text: clean, count: 1 }];
    });
    setRecent((prev) => [clean, ...prev].slice(0, 5));
    setInput('');
  }

  function reset() {
    setWords(SEED_WORDS);
    setRecent([]);
  }

  const maxCount = Math.max(...words.map((w) => w.count));
  const sorted = [...words].sort((a, b) => b.count - a.count);
  const placed = placeWords(sorted);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start max-w-[1080px] mx-auto">
      {/* The cloud */}
      <div className="relative bg-white border border-jet/15 rounded-2xl overflow-hidden h-[460px] sm:h-[520px]">
        {placed.map((w) => (
          <span
            key={w.text}
            className="absolute font-display italic text-jet leading-none whitespace-nowrap select-none"
            style={{
              left: `${w.x}%`,
              top: `${w.y}%`,
              fontSize: `${fontSizeFor(w.count, maxCount)}px`,
              opacity: opacityFor(w.count, maxCount),
              transform: `translate(-50%, -50%) rotate(${w.rotation}deg)`,
              transition:
                'left 0.5s cubic-bezier(0.22, 0.61, 0.36, 1), top 0.5s cubic-bezier(0.22, 0.61, 0.36, 1), font-size 0.4s ease-out, opacity 0.4s ease-out, transform 0.5s cubic-bezier(0.22, 0.61, 0.36, 1)',
            }}
          >
            {w.text}
          </span>
        ))}
      </div>

      {/* Side controls */}
      <div className="bg-white border border-jet/15 rounded-2xl p-5">
        <p className="font-pixel text-[10px] uppercase text-jet/60 tracking-[0.18em]">
          ADD A WORD
        </p>
        <form onSubmit={addWord} className="mt-3 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="one word"
            maxLength={24}
            className="flex-1 font-sans text-[14px] text-jet bg-offwhite border border-jet/15 rounded-md px-3 py-2 focus:outline-none focus:border-jet"
          />
          <button
            type="submit"
            className="font-sans font-semibold text-[14px] bg-jet text-cream rounded-md px-3 py-2 hover:-translate-y-[1px] transition-all"
          >
            add
          </button>
        </form>
        <p className="mt-2 font-sans text-[12px] text-jet/55">
          your word joins the cloud. add it again to grow it.
        </p>

        {recent.length > 0 && (
          <div className="mt-5 pt-4 border-t border-jet/10">
            <p className="font-pixel text-[9px] uppercase text-jet/50 tracking-[0.18em]">
              YOUR RECENT
            </p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {recent.map((w, i) => (
                <li
                  key={`${w}-${i}`}
                  className="font-sans text-[12px] text-jet/80 bg-offwhite border border-jet/15 rounded-full px-2.5 py-0.5"
                >
                  {w}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-5 pt-4 border-t border-jet/10">
          <p className="font-pixel text-[10px] uppercase text-jet/60 tracking-[0.18em]">
            TOTALS
          </p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <div>
              <p className="font-display italic text-[24px] text-jet leading-none">
                {words.length}
              </p>
              <p className="font-sans text-[11px] text-jet/55">unique words</p>
            </div>
            <div>
              <p className="font-display italic text-[24px] text-jet leading-none">
                {words.reduce((sum, w) => sum + w.count, 0)}
              </p>
              <p className="font-sans text-[11px] text-jet/55">total entries</p>
            </div>
          </div>
        </div>

        <button
          onClick={reset}
          className="mt-5 font-pixel text-[9px] uppercase text-jet/55 hover:text-jet tracking-[0.18em]"
        >
          reset cloud
        </button>
      </div>
    </div>
  );
}
