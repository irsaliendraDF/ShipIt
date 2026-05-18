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

// Everything reads horizontally. Variation comes from font size and
// opacity, not rotation — tilted words made the cloud look jumbled.
const ROTATION_RING = [0];
const MIN_FONT = 13;
const MAX_FONT = 48;
const CHAR_WIDTH_RATIO = 0.62; // generous estimate for italic Fraunces
const BOX_PADDING = 14;

// Cloud silhouette as a union of overlapping circles / ellipses, all in
// container-relative units (0..1). Used both to mask the placement search
// and to render the background shape.
type Shape =
  | { type: 'ellipse'; cx: number; cy: number; rx: number; ry: number }
  | { type: 'circle'; cx: number; cy: number; r: number };

const CLOUD_SHAPES: Shape[] = [
  { type: 'ellipse', cx: 0.50, cy: 0.66, rx: 0.46, ry: 0.26 },
  { type: 'circle', cx: 0.50, cy: 0.30, r: 0.20 },
  { type: 'circle', cx: 0.30, cy: 0.42, r: 0.16 },
  { type: 'circle', cx: 0.70, cy: 0.40, r: 0.17 },
  { type: 'circle', cx: 0.17, cy: 0.58, r: 0.13 },
  { type: 'circle', cx: 0.84, cy: 0.56, r: 0.13 },
];

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

function isInsideCloud(x: number, y: number, W: number, H: number): boolean {
  for (const s of CLOUD_SHAPES) {
    if (s.type === 'ellipse') {
      const dx = (x - s.cx * W) / (s.rx * W);
      const dy = (y - s.cy * H) / (s.ry * H);
      if (dx * dx + dy * dy <= 1) return true;
    } else {
      const minDim = Math.min(W, H);
      const radius = s.r * minDim;
      const dx = x - s.cx * W;
      const dy = y - s.cy * H;
      if (dx * dx + dy * dy <= radius * radius) return true;
    }
  }
  return false;
}

/**
 * Place each word along an Archimedean spiral from the cloud's centroid.
 * Each candidate position is rejected if its bounding box overlaps any
 * already-placed word, falls outside the container, or has any corner
 * outside the cloud silhouette. Words shrink and retry if they cannot fit.
 */
function layoutCloud(
  sortedWords: Word[],
  maxCount: number,
  width: number,
  height: number,
): Placed[] {
  if (width <= 0 || height <= 0) return [];
  // Spiral seed: center of the cloud's main body (slightly above geometric
  // center because the bumps live up top).
  const cx = width * 0.5;
  const cy = height * 0.48;
  const placed: Placed[] = [];

  for (let idx = 0; idx < sortedWords.length; idx++) {
    const word = sortedWords[idx]!;
    const rotation = rotationFor(idx);
    let fontSize = fontSizeFor(word.count, maxCount);
    let result: Placed | null = null;

    while (fontSize >= MIN_FONT && !result) {
      const rad = (rotation * Math.PI) / 180;
      const baseW = word.text.length * fontSize * CHAR_WIDTH_RATIO;
      const baseH = fontSize * 1.0;
      const cosR = Math.abs(Math.cos(rad));
      const sinR = Math.abs(Math.sin(rad));
      const boxW = baseW * cosR + baseH * sinR + BOX_PADDING;
      const boxH = baseW * sinR + baseH * cosR + BOX_PADDING;

      for (let i = 0; i < 900; i++) {
        // Tighter spiral steps so we never skip a viable slot.
        const t = i * 0.22;
        const r = i * 1.1;
        const x = cx + r * Math.cos(t);
        const y = cy + r * Math.sin(t) * 0.78;
        const left = x - boxW / 2;
        const top = y - boxH / 2;
        const right = x + boxW / 2;
        const bottom = y + boxH / 2;
        if (left < 2 || right > width - 2 || top < 2 || bottom > height - 2) {
          continue;
        }
        // All four bbox corners + center must sit inside the cloud silhouette.
        if (
          !isInsideCloud(left, top, width, height) ||
          !isInsideCloud(right, top, width, height) ||
          !isInsideCloud(left, bottom, width, height) ||
          !isInsideCloud(right, bottom, width, height) ||
          !isInsideCloud(x, y, width, height)
        ) {
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
      if (!result) fontSize -= 3;
    }

    if (result) placed.push(result);
  }

  return placed;
}

function CloudSilhouette({ width, height }: { width: number; height: number }) {
  if (width <= 0 || height <= 0) return null;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
    >
      {CLOUD_SHAPES.map((s, i) => {
        if (s.type === 'ellipse') {
          return (
            <ellipse
              key={i}
              cx={s.cx * width}
              cy={s.cy * height}
              rx={s.rx * width}
              ry={s.ry * height}
              fill="#f4f4f4"
            />
          );
        }
        const minDim = Math.min(width, height);
        return (
          <circle
            key={i}
            cx={s.cx * width}
            cy={s.cy * height}
            r={s.r * minDim}
            fill="#f4f4f4"
          />
        );
      })}
    </svg>
  );
}

export function WordCloudTemplate() {
  const [words, setWords] = useState<Word[]>(SEED_WORDS);
  const [input, setInput] = useState('');
  const [recent, setRecent] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  // Bumped to re-trigger layout after the display font finishes loading
  // (text metrics differ from the system fallback).
  const [fontReady, setFontReady] = useState(false);

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

  useEffect(() => {
    if (typeof document === 'undefined' || !document.fonts) return;
    document.fonts.ready.then(() => setFontReady(true));
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
    // fontReady triggers a relayout once the display font's real metrics
    // are available.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sorted, maxCount, size.w, size.h, fontReady],
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start max-w-[1080px] mx-auto">
      {/* The cloud */}
      <div
        ref={containerRef}
        className="relative bg-white border border-jet/15 rounded-2xl overflow-hidden h-[460px] sm:h-[520px]"
      >
        <CloudSilhouette width={size.w} height={size.h} />
        {layout.map((w) => (
          <span
            key={w.text}
            className="absolute font-display italic text-jet leading-none whitespace-nowrap select-none z-10"
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
