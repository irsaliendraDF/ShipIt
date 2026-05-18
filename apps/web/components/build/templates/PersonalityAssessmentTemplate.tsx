'use client';

import { useState } from 'react';

type Archetype = 'explorer' | 'builder' | 'connector' | 'strategist';

type Choice = { label: string; archetype: Archetype };

type Question = {
  prompt: string;
  options: Choice[];
};

const QUESTIONS: Question[] = [
  {
    prompt: 'a free weekend lands in your lap. what wins?',
    options: [
      { label: 'a road trip with no plan', archetype: 'explorer' },
      { label: 'finally finishing the side project', archetype: 'builder' },
      { label: 'a long dinner with friends', archetype: 'connector' },
      { label: 'planning the next three months', archetype: 'strategist' },
    ],
  },
  {
    prompt: 'pick the workspace that energizes you most.',
    options: [
      { label: 'a window seat in a café you have never been to', archetype: 'explorer' },
      { label: 'a workshop with tools all over the bench', archetype: 'builder' },
      { label: 'a shared table with the people you love working with', archetype: 'connector' },
      { label: 'a quiet room with a whiteboard and a clear hour', archetype: 'strategist' },
    ],
  },
  {
    prompt: 'what is the first thing you do on a new project?',
    options: [
      { label: 'try things and see what feels right', archetype: 'explorer' },
      { label: 'sketch a rough version of the thing', archetype: 'builder' },
      { label: 'find the right people and start talking', archetype: 'connector' },
      { label: 'map the moving parts before touching anything', archetype: 'strategist' },
    ],
  },
  {
    prompt: 'how do you most often help your team?',
    options: [
      { label: 'bringing in ideas from outside the bubble', archetype: 'explorer' },
      { label: 'turning fuzzy plans into shipped work', archetype: 'builder' },
      { label: 'making sure everyone feels heard', archetype: 'connector' },
      { label: 'spotting the second-order consequences', archetype: 'strategist' },
    ],
  },
  {
    prompt: 'pick the compliment that lands hardest.',
    options: [
      { label: '"you see things nobody else sees."', archetype: 'explorer' },
      { label: '"you just get it done."', archetype: 'builder' },
      { label: '"you make people feel like they belong."', archetype: 'connector' },
      { label: '"you saved us from a wrong turn."', archetype: 'strategist' },
    ],
  },
];

const RESULTS: Record<
  Archetype,
  { title: string; tagline: string; detail: string }
> = {
  explorer: {
    title: 'The Explorer',
    tagline: 'curious, comfortable in the unknown.',
    detail:
      'you start with a question, not an answer. you notice the strange door at the back of the room and you walk through it. your superpower is showing your team a path they would not have found on their own.',
  },
  builder: {
    title: 'The Builder',
    tagline: 'happiest with hands on the work.',
    detail:
      'plans are nice but you want a draft. you would rather ship a rough thing today than a perfect thing in six weeks. your superpower is taking a fuzzy intention and turning it into something real this week.',
  },
  connector: {
    title: 'The Connector',
    tagline: 'the social glue and translator.',
    detail:
      'you make the introductions, hold the meeting that keeps things moving, and notice when someone has gone quiet. your superpower is turning a group of people into an actual team.',
  },
  strategist: {
    title: 'The Strategist',
    tagline: 'long-game thinker, careful planner.',
    detail:
      'you can hold the whole map in your head and notice when the route is about to lead off a cliff. your superpower is the question that makes the room go "wait, are we doing the right thing?"',
  },
};

export function PersonalityAssessmentTemplate() {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<Archetype, number>>({
    explorer: 0,
    builder: 0,
    connector: 0,
    strategist: 0,
  });
  const [done, setDone] = useState(false);

  const q = QUESTIONS[step]!;
  const progress = (step / QUESTIONS.length) * 100;

  function choose(arche: Archetype) {
    const next = { ...scores, [arche]: scores[arche] + 1 };
    setScores(next);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setDone(true);
    }
  }

  function reset() {
    setStep(0);
    setScores({ explorer: 0, builder: 0, connector: 0, strategist: 0 });
    setDone(false);
  }

  if (done) {
    const winner = (Object.keys(scores) as Archetype[]).reduce((a, b) =>
      scores[b] > scores[a] ? b : a,
    );
    const result = RESULTS[winner];
    return (
      <div className="bg-white border border-jet/15 rounded-2xl p-8 sm:p-10 max-w-[620px] mx-auto text-center">
        <p className="font-pixel text-[10px] uppercase text-jet/60 tracking-[0.22em]">
          YOUR ARCHETYPE
        </p>
        <h3 className="mt-4 font-display italic text-[44px] sm:text-[52px] text-jet leading-none">
          {result.title}
        </h3>
        <p className="mt-3 font-sans text-[16px] text-jet/70 italic">{result.tagline}</p>
        <p className="mt-6 font-sans text-[15px] text-jet/80 leading-relaxed">{result.detail}</p>

        <div className="mt-8 grid grid-cols-4 gap-2">
          {(Object.keys(RESULTS) as Archetype[]).map((a) => (
            <div key={a} className="text-left">
              <p className="font-pixel text-[8px] uppercase text-jet/45 tracking-[0.18em]">
                {a}
              </p>
              <div className="mt-2 h-1.5 w-full bg-jet/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-jet rounded-full"
                  style={{ width: `${(scores[a] / QUESTIONS.length) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 items-center justify-center">
          <button
            onClick={reset}
            className="font-sans font-semibold text-[15px] bg-jet text-cream rounded-full px-6 py-2.5 hover:-translate-y-[1px] transition-all"
          >
            retake the quiz
          </button>
          <button className="font-sans font-semibold text-[15px] text-jet/70 hover:text-jet transition-colors px-4 py-2.5">
            share my type →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-jet/15 rounded-2xl p-7 sm:p-9 max-w-[640px] mx-auto">
      <div className="flex items-center justify-between mb-4">
        <p className="font-pixel text-[10px] uppercase text-jet/60 tracking-[0.18em]">
          QUESTION {step + 1} / {QUESTIONS.length}
        </p>
        <p className="font-pixel text-[10px] uppercase text-jet/40 tracking-[0.18em]">
          no wrong answers
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
        {q.options.map((opt, i) => (
          <button
            key={opt.label}
            onClick={() => choose(opt.archetype)}
            className="w-full text-left font-sans text-[15px] text-jet px-4 py-3 rounded-xl border border-jet/15 hover:border-jet/60 hover:bg-jet/5 transition-all"
          >
            <span className="mr-3 font-pixel text-[10px] text-jet/40">
              {String.fromCharCode(65 + i)}
            </span>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
