'use client';

import { useState } from 'react';

type Axis = 'process' | 'people' | 'tools' | 'strategy';

type Question = {
  prompt: string;
  axis: Axis;
};

const QUESTIONS: Question[] = [
  { prompt: 'we document repeatable work before it scales.', axis: 'process' },
  { prompt: 'handoffs between teams rarely drop things.', axis: 'process' },
  { prompt: 'people know what they own and how it ties to a goal.', axis: 'people' },
  { prompt: 'we hire ahead of the work, not behind it.', axis: 'people' },
  { prompt: 'our tools talk to each other without manual stitching.', axis: 'tools' },
  { prompt: 'no one is rebuilding the same dashboard in three places.', axis: 'tools' },
  { prompt: 'we can describe what we are betting on this quarter in one sentence.', axis: 'strategy' },
  { prompt: 'when priorities change, we say so out loud and re-plan.', axis: 'strategy' },
];

const AXIS_LABEL: Record<Axis, string> = {
  process: 'Process',
  people: 'People',
  tools: 'Tools',
  strategy: 'Strategy',
};

const AXIS_RECOMMENDATIONS: Record<Axis, string> = {
  process:
    'document one repeatable workflow this week. start with the one your team asks the most questions about.',
  people:
    'pair each owner with the one outcome they are accountable for. write it down and revisit at your next 1:1.',
  tools:
    'audit your stack for double-entry. anywhere you copy data from one system to another is an integration opportunity.',
  strategy:
    'write a 1-page bet for this quarter. one sentence on what you are doing, why now, and what you will stop doing.',
};

const SCALE = [1, 2, 3, 4, 5];
const SCALE_LABELS: Record<number, string> = {
  1: 'strongly disagree',
  2: 'disagree',
  3: 'neutral',
  4: 'agree',
  5: 'strongly agree',
};

export function DiagnosticScorecardTemplate() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [done, setDone] = useState(false);

  const q = QUESTIONS[step]!;
  const progress = (step / QUESTIONS.length) * 100;

  function answer(value: number) {
    const next = { ...answers, [step]: value };
    setAnswers(next);
    if (step < QUESTIONS.length - 1) {
      window.setTimeout(() => setStep(step + 1), 180);
    } else {
      window.setTimeout(() => setDone(true), 180);
    }
  }

  function reset() {
    setStep(0);
    setAnswers({});
    setDone(false);
  }

  if (done) {
    const axisScores: Record<Axis, { sum: number; count: number }> = {
      process: { sum: 0, count: 0 },
      people: { sum: 0, count: 0 },
      tools: { sum: 0, count: 0 },
      strategy: { sum: 0, count: 0 },
    };
    QUESTIONS.forEach((question, i) => {
      const v = answers[i] ?? 3;
      axisScores[question.axis].sum += v;
      axisScores[question.axis].count += 1;
    });

    const normalized = (Object.keys(axisScores) as Axis[]).map((a) => {
      const { sum, count } = axisScores[a];
      const score = count > 0 ? (sum / count / 5) * 100 : 0;
      return { axis: a, score: Math.round(score) };
    });
    const lowest = normalized.reduce((a, b) => (b.score < a.score ? b : a));
    const overall = Math.round(
      normalized.reduce((sum, s) => sum + s.score, 0) / normalized.length,
    );

    return (
      <div className="bg-white border border-jet/15 rounded-2xl p-8 sm:p-10 max-w-[720px] mx-auto">
        <div className="text-center">
          <p className="font-pixel text-[10px] uppercase text-jet/60 tracking-[0.22em]">
            YOUR SCORECARD
          </p>
          <p className="mt-4 font-display italic text-[64px] text-jet leading-none">
            {overall}
            <span className="text-jet/40 text-[40px]">/100</span>
          </p>
          <p className="mt-2 font-sans text-[14px] text-jet/70">
            {overall >= 80
              ? 'rock-solid foundation. you are mostly compounding.'
              : overall >= 60
                ? 'in good shape with clear room to grow.'
                : overall >= 40
                  ? 'workable but leaking energy in a few places.'
                  : 'major rework opportunity. you know where to start.'}
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {normalized.map(({ axis, score }) => (
            <div key={axis}>
              <div className="flex items-baseline justify-between mb-1.5">
                <p className="font-sans text-[15px] text-jet font-medium">
                  {AXIS_LABEL[axis]}
                </p>
                <p className="font-pixel text-[11px] uppercase text-jet/65 tracking-[0.18em]">
                  {score}
                </p>
              </div>
              <div className="h-3 w-full bg-jet/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-jet rounded-full transition-all duration-500"
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-5 border-2 border-dashed border-jet/30 rounded-xl">
          <p className="font-pixel text-[10px] uppercase text-jet/60 tracking-[0.18em]">
            START HERE: {AXIS_LABEL[lowest.axis].toUpperCase()}
          </p>
          <p className="mt-3 font-sans text-[15px] text-jet leading-relaxed">
            {AXIS_RECOMMENDATIONS[lowest.axis]}
          </p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 items-center justify-center">
          <button className="font-sans font-semibold text-[15px] bg-jet text-cream rounded-full px-6 py-2.5 hover:-translate-y-[1px] transition-all">
            download as PDF →
          </button>
          <button
            onClick={reset}
            className="font-sans font-semibold text-[15px] text-jet/70 hover:text-jet transition-colors px-4 py-2.5"
          >
            retake the diagnostic
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-jet/15 rounded-2xl p-7 sm:p-9 max-w-[680px] mx-auto">
      <div className="flex items-center justify-between mb-4">
        <p className="font-pixel text-[10px] uppercase text-jet/60 tracking-[0.18em]">
          QUESTION {step + 1} / {QUESTIONS.length}
        </p>
        <p className="font-pixel text-[10px] uppercase text-jet/40 tracking-[0.18em]">
          {AXIS_LABEL[q.axis]}
        </p>
      </div>
      <div className="h-1.5 w-full bg-jet/10 rounded-full overflow-hidden mb-7">
        <div
          className="h-full bg-jet rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <h3 className="font-display italic text-[24px] sm:text-[26px] text-jet leading-tight">
        {q.prompt}
      </h3>

      <div className="mt-7">
        <div className="grid grid-cols-5 gap-2">
          {SCALE.map((v) => {
            const picked = answers[step] === v;
            return (
              <button
                key={v}
                onClick={() => answer(v)}
                className={[
                  'h-14 rounded-xl border font-display italic text-[22px] transition-all',
                  picked
                    ? 'border-jet border-2 bg-jet text-cream'
                    : 'border-jet/15 text-jet hover:border-jet/60 hover:bg-jet/5',
                ].join(' ')}
                aria-label={SCALE_LABELS[v]}
              >
                {v}
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex items-center justify-between font-pixel text-[9px] uppercase text-jet/45 tracking-[0.18em]">
          <span>strongly disagree</span>
          <span>strongly agree</span>
        </div>
      </div>
    </div>
  );
}
