'use client';

import { useState } from 'react';

type Question = {
  prompt: string;
  options: string[];
  correctIndex: number;
};

const QUESTIONS: Question[] = [
  {
    prompt: 'what year did your business open its doors?',
    options: ['2018', '2020', '2022', '2024'],
    correctIndex: 1,
  },
  {
    prompt: 'which of these is your favourite local coffee spot?',
    options: ['the bakery on main', 'java jungle', 'tide & grind', 'cup & saucer'],
    correctIndex: 2,
  },
  {
    prompt: 'what does our most-loved service help you do?',
    options: [
      'save time on repeat work',
      'plan a special day',
      'find a new home',
      'fix something broken',
    ],
    correctIndex: 0,
  },
  {
    prompt: 'which icon represents our brand?',
    options: ['🌊 wave', '🌲 tree', '⚙️ gear', '🚢 ship'],
    correctIndex: 3,
  },
  {
    prompt: 'what city did we start in?',
    options: ['halifax', 'st. john’s', 'fredericton', 'charlottetown'],
    correctIndex: 0,
  },
];

export function InteractiveQuizTemplate() {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const q = QUESTIONS[step]!;
  const progress = ((step + (picked === null ? 0 : 1)) / QUESTIONS.length) * 100;

  function choose(i: number) {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.correctIndex) setScore((s) => s + 1);
  }

  function next() {
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
      setPicked(null);
    } else {
      setDone(true);
    }
  }

  function reset() {
    setStep(0);
    setScore(0);
    setPicked(null);
    setDone(false);
  }

  if (done) {
    const pct = Math.round((score / QUESTIONS.length) * 100);
    return (
      <div className="bg-white border border-jet/15 rounded-2xl p-8 sm:p-10 text-center max-w-[560px] mx-auto">
        <p className="font-pixel text-[10px] uppercase text-jet/60 tracking-[0.18em]">YOUR SCORE</p>
        <p className="mt-4 font-display italic text-[56px] leading-none text-jet">
          {score} <span className="text-jet/40">/</span> {QUESTIONS.length}
        </p>
        <p className="mt-3 font-sans text-[17px] text-jet/75">
          {pct >= 80
            ? 'you really know your stuff. share this with a friend who thinks they know better.'
            : pct >= 50
              ? 'solid showing. one or two trip-ups, easy comeback.'
              : 'tougher than it looked, hey? try again with a fresh round.'}
        </p>
        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="font-sans font-semibold text-[15px] bg-jet text-cream rounded-full px-6 py-2.5 hover:-translate-y-[1px] transition-all"
          >
            take it again
          </button>
          <button className="font-sans font-semibold text-[15px] text-jet/70 hover:text-jet transition-colors px-4 py-2.5">
            share my score →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-jet/15 rounded-2xl p-7 sm:p-9 max-w-[640px] mx-auto">
      <div className="flex items-center justify-between mb-5">
        <p className="font-pixel text-[10px] uppercase text-jet/60 tracking-[0.18em]">
          QUESTION {step + 1} / {QUESTIONS.length}
        </p>
        <p className="font-pixel text-[10px] uppercase text-jet/55 tracking-[0.18em]">
          SCORE {score}
        </p>
      </div>
      <div className="h-1.5 w-full bg-jet/10 rounded-full overflow-hidden mb-7">
        <div
          className="h-full bg-jet rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <h3 className="font-display italic text-[24px] sm:text-[28px] text-jet leading-tight">
        {q.prompt}
      </h3>

      <div className="mt-6 space-y-3">
        {q.options.map((opt, i) => {
          const isPicked = picked === i;
          const isCorrect = picked !== null && i === q.correctIndex;
          const isWrong = isPicked && i !== q.correctIndex;
          return (
            <button
              key={opt}
              onClick={() => choose(i)}
              disabled={picked !== null}
              className={[
                'w-full text-left font-sans text-[15px] px-4 py-3 rounded-xl border transition-all',
                picked === null
                  ? 'border-jet/15 hover:border-jet/50 hover:bg-jet/5'
                  : isCorrect
                    ? 'border-jet bg-jet/10 text-jet'
                    : isWrong
                      ? 'border-jet/40 bg-jet/5 text-jet line-through decoration-jet/40'
                      : 'border-jet/10 text-jet/55',
              ].join(' ')}
            >
              <span className="mr-3 font-pixel text-[10px] text-jet/40">
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
              {isCorrect && <span className="ml-2 text-jet">✓</span>}
              {isWrong && <span className="ml-2 text-jet/40">✗</span>}
            </button>
          );
        })}
      </div>

      <div className="mt-7 flex justify-end">
        <button
          onClick={next}
          disabled={picked === null}
          className="font-sans font-semibold text-[15px] bg-jet text-cream rounded-full px-6 py-2.5 disabled:opacity-30 disabled:cursor-not-allowed hover:-translate-y-[1px] transition-all"
        >
          {step < QUESTIONS.length - 1 ? 'next →' : 'see my score →'}
        </button>
      </div>
    </div>
  );
}
