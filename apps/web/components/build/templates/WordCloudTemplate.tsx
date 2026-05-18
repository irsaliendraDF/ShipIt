'use client';

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react';

type Word = { text: string; count: number };

type Placed = Word & {
  x: number;
  y: number;
  rotation: number;
  fontSize: number;
  left: number;
  top: number;
  right: number;
  bottom: number;
};

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

const ROTATION_RING = [0, 0, 0, -12, 12, 0, 0, 90, 0, 0, -12, 0, 0, 12, -90];
const MIN_FONT = 14;
const MAX_FONT = 54;
const BOX_PADDING = 8;

function fontSizeFor(count: number, maxCount: number): number {
  const ratio = maxCount > 0 ? count / maxCount : 0;
  return MIN_FONT + Math.round(ratio * (MAX_FONT - MIN_FONT));
}

function opacityFor(count: number, maxCount: number): number {
  return 0.55 + (count / maxCount) * 0.45;
}

function rotationFor(index: number): number {
  return ROTATION_RING[index % ROTATION_RING.length] ?? 0;
}

/**
 * Place each word along an Archimedean spiral outward from the center.
 * Each candidate position is rejected if its bounding box overlaps any
 * already-placed word or falls outside the container. If no position
 * works at the chosen font size, the word shrinks and tries again.
 */
function layoutCloud(
  sortedWords: Word[],
  maxCount: number,
  width: number,
  height: number,
): Placed[] {
  if (width <= 0 || height <= 0) return [];
  const cx = width / 2;
  const cy = height / 2;
  const placed: Placed[] = [];

  for (let idx = 0; idx < sortedWords.length; idx++) {
    const word = sortedWords[idx]!;
    const rotation = rotationFor(idx);
    let fontSize = fontSizeFor(word.count, maxCount);
    let result: Placed | null = null;

    while (fontSize >= MIN_FONT && !result) {
      const rad = (rotation * Math.PI) / 180;
      // Approximate text box for italic Fraunces at this font size.
      const baseW = word.text.length * fontSize * 0.5;
      const baseH = fontSize * 0.95;
      const cosR = Math.abs(Math.cos(rad));
      const sinR = Math.abs(Math.sin(rad));
      const boxW = baseW * cosR + baseH * sinR + BOX_PADDING;
      const boxH = baseW * sinR + baseH * cosR + BOX_PADDING;

      for (let i = 0; i < 600; i++) {
        const t = i * 0.32;
        const r = i * 1.6;
        const x = cx + r * Math.cos(t);
        const y = cy + r * Math.sin(t) * 0.85; // squash vertically a hair
        const left = x - boxW / 2;
        const top = y - boxH / 2;
        const right = x + boxW / 2;
        const bottom = y + boxH / 2;
        if (left < 4 || right > width - 4 || top < 4 || bottom > height - 4) {
          continue;
        }
        let overlaps = false;
        for (const p of placed) {
          if (
            left < p.right &&
            right > p.left &&
            top < p.bottom &&
            bottom > p.top
          ) {
            overlaps = true;
            break;
          }
        }
        if (!overlaps) {
          result = {
            ...word,
            x,
            y,
            rotation,
            fontSize,
            left,
            top,
            right,
            bottom,
          };
          break;
        }
      }
      if (!result) fontSize -= 4;
    }

    if (result) placed.push(result);
  }

  return placed;
}

export function WordCloudTemplate() {
  const [words, setWords] = useState<Word[]>(SEED_WORDS);
  const [input, setInput] = useState('');
  const [recent, setRecent] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  // Measure the cloud container once it mounts, and again whenever the
  // viewport resizes (the container's own width scales with the grid).
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setSize({ w: rect.width, h: rect.height });
  }, []);

  useEffect(() => {
    function measure() {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setSize((prev) =>
        prev.w === rect.width && prev.h === rect.height
          ? prev
          : { w: rect.width, h: rect.height },
      );
    }
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

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
  const sorted = useMemo(
    () => [...words].sort((a, b) => b.count - a.count),
    [words],
  );
  const layout = useMemo(
    () => layoutCloud(sorted, maxCount, size.w, size.h),
    [sorted, maxCount, size.w, size.h],
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start max-w-[1080px] mx-auto">
      {/* The cloud */}
      <div
        ref={containerRef}
        className="relative bg-white border border-jet/15 rounded-2xl overflow-hidden h-[460px] sm:h-[520px]"
      >
        {layout.map((w) => (
          <span
            key={w.text}
            className="absolute font-display italic text-jet leading-none whitespace-nowrap select-none"
            style={{
              left: `${w.x}px`,
              top: `${w.y}px`,
              fontSize: `${w.fontSize}px`,
              opacity: opacityFor(w.count, maxCount),
              transform: `translate(-50%, -50%) rotate(${w.rotation}deg)`,
              transition:
                'left 0.55s cubic-bezier(0.22, 0.61, 0.36, 1), top 0.55s cubic-bezier(0.22, 0.61, 0.36, 1), font-size 0.45s ease-out, opacity 0.45s ease-out, transform 0.55s cubic-bezier(0.22, 0.61, 0.36, 1)',
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
