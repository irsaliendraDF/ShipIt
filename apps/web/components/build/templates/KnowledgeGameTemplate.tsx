'use client';

import { useEffect, useRef, useState } from 'react';

type Question = {
  prompt: string;
  options: string[];
  correctIndex: number;
};

type Player = {
  name: string;
  avatar: string;
  score: number;
  /** Whether this is the human-controlled row. */
  you?: boolean;
};

const QUESTIONS: Question[] = [
  {
    prompt: 'which Canadian province has no provincial sales tax?',
    options: ['Nova Scotia', 'Alberta', 'Quebec', 'PEI'],
    correctIndex: 1,
  },
  {
    prompt: 'how many bones are in the adult human body?',
    options: ['190', '206', '224', '162'],
    correctIndex: 1,
  },
  {
    prompt: 'what is the smallest planet in our solar system?',
    options: ['Mercury', 'Mars', 'Pluto', 'Venus'],
    correctIndex: 0,
  },
  {
    prompt: 'which language has the most native speakers worldwide?',
    options: ['English', 'Spanish', 'Mandarin Chinese', 'Hindi'],
    correctIndex: 2,
  },
];

const PLAYERS: Player[] = [
  { name: 'you', avatar: 'Y', score: 0, you: true },
  { name: 'casey', avatar: 'C', score: 0 },
  { name: 'sam', avatar: 'S', score: 0 },
  { name: 'jordan', avatar: 'J', score: 0 },
  { name: 'morgan', avatar: 'M', score: 0 },
  { name: 'avery', avatar: 'A', score: 0 },
];

const QUESTION_DURATION_MS = 10_000;

type Phase = 'idle' | 'playing' | 'reveal' | 'finished';

export function KnowledgeGameTemplate() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_DURATION_MS);
  const [picked, setPicked] = useState<number | null>(null);
  const [players, setPlayers] = useState<Player[]>(PLAYERS);
  const tickRef = useRef<number | null>(null);
  const phaseRef = useRef<Phase>('idle');

  phaseRef.current = phase;

  const q = QUESTIONS[questionIndex]!;

  // Countdown
  useEffect(() => {
    if (phase !== 'playing') return;
    const startedAt = Date.now();
    tickRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, QUESTION_DURATION_MS - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        if (tickRef.current) window.clearInterval(tickRef.current);
        revealRound(null);
      }
    }, 100);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, questionIndex]);

  function start() {
    setPlayers(PLAYERS.map((p) => ({ ...p })));
    setQuestionIndex(0);
    setPicked(null);
    setTimeLeft(QUESTION_DURATION_MS);
    setPhase('playing');
  }

  function revealRound(pickedAt: number | null) {
    setPhase('reveal');
    // Score this round for everyone.
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.you) {
          if (pickedAt === q.correctIndex) {
            const speedBonus = Math.round((timeLeft / QUESTION_DURATION_MS) * 500);
            return { ...p, score: p.score + 1000 + speedBonus };
          }
          return p;
        }
        // Simulated players: ~70% correct, random speed.
        const right = Math.random() < 0.7;
        if (!right) return p;
        const bonus = Math.round(Math.random() * 500);
        return { ...p, score: p.score + 1000 + bonus };
      }),
    );
    window.setTimeout(() => {
      if (phaseRef.current !== 'reveal') return;
      if (questionIndex < QUESTIONS.length - 1) {
        setQuestionIndex((i) => i + 1);
        setPicked(null);
        setTimeLeft(QUESTION_DURATION_MS);
        setPhase('playing');
      } else {
        setPhase('finished');
      }
    }, 2500);
  }

  function answer(i: number) {
    if (phase !== 'playing' || picked !== null) return;
    setPicked(i);
    revealRound(i);
  }

  function reset() {
    setPhase('idle');
    setQuestionIndex(0);
    setPicked(null);
    setTimeLeft(QUESTION_DURATION_MS);
    setPlayers(PLAYERS.map((p) => ({ ...p })));
  }

  const timeRatio = timeLeft / QUESTION_DURATION_MS;
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start max-w-[1080px] mx-auto">
      {/* Main game */}
      <div className="bg-white border border-jet/15 rounded-2xl p-6 sm:p-8 min-h-[460px]">
        {phase === 'idle' && (
          <div className="flex flex-col items-center justify-center text-center py-12">
            <p className="font-pixel text-[10px] uppercase text-jet/55 tracking-[0.22em]">
              TRIVIA · 4 ROUNDS
            </p>
            <h3 className="mt-4 font-display italic text-[34px] text-jet leading-tight">
              ready to play?
            </h3>
            <p className="mt-4 font-sans text-[15px] text-jet/70 max-w-[440px]">
              {PLAYERS.length} players warming up. answer fast for bigger
              points. fastest correct answer wins the round.
            </p>
            <button
              onClick={start}
              className="mt-7 font-sans font-semibold text-[16px] bg-jet text-cream rounded-full px-7 py-3 hover:-translate-y-[1px] transition-all"
            >
              start the game →
            </button>
          </div>
        )}

        {(phase === 'playing' || phase === 'reveal') && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="font-pixel text-[10px] uppercase text-jet/60 tracking-[0.18em]">
                ROUND {questionIndex + 1} / {QUESTIONS.length}
              </p>
              <p className="font-pixel text-[10px] uppercase text-jet/60 tracking-[0.18em] tabular-nums">
                {Math.ceil(timeLeft / 1000)}s
              </p>
            </div>
            <div className="h-1.5 w-full bg-jet/10 rounded-full overflow-hidden mb-7">
              <div
                className="h-full bg-jet rounded-full"
                style={{
                  width: `${timeRatio * 100}%`,
                  transition: 'width 0.1s linear',
                }}
              />
            </div>

            <h3 className="font-display italic text-[24px] sm:text-[28px] text-jet leading-tight min-h-[80px]">
              {q.prompt}
            </h3>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {q.options.map((opt, i) => {
                const isPicked = picked === i;
                const showCorrect = phase === 'reveal' && i === q.correctIndex;
                const showWrong = phase === 'reveal' && isPicked && i !== q.correctIndex;
                return (
                  <button
                    key={opt}
                    onClick={() => answer(i)}
                    disabled={phase !== 'playing' || picked !== null}
                    className={[
                      'text-left font-sans text-[15px] px-4 py-3 rounded-xl border transition-all',
                      showCorrect
                        ? 'border-jet border-2 bg-jet/10 text-jet'
                        : showWrong
                          ? 'border-jet/40 bg-jet/5 text-jet line-through decoration-jet/40'
                          : isPicked
                            ? 'border-jet border-2 bg-jet/5 text-jet'
                            : phase === 'playing'
                              ? 'border-jet/15 hover:border-jet/60 hover:bg-jet/5 text-jet'
                              : 'border-jet/10 text-jet/55',
                    ].join(' ')}
                  >
                    <span className="mr-3 font-pixel text-[10px] text-jet/40">
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                    {showCorrect && <span className="ml-2 text-jet">✓</span>}
                    {showWrong && <span className="ml-2 text-jet/40">✗</span>}
                  </button>
                );
              })}
            </div>

            {phase === 'reveal' && (
              <p className="mt-5 font-pixel text-[10px] uppercase text-jet/55 tracking-[0.22em] text-center">
                {questionIndex < QUESTIONS.length - 1
                  ? '· next round in a moment ·'
                  : '· tallying final scores ·'}
              </p>
            )}
          </>
        )}

        {phase === 'finished' && (() => {
          const winner = sortedPlayers[0]!;
          const yourPos =
            sortedPlayers.findIndex((p) => p.you) + 1;
          return (
            <div className="text-center py-8">
              <p className="font-pixel text-[10px] uppercase text-jet/55 tracking-[0.22em]">
                GAME OVER
              </p>
              <h3 className="mt-4 font-display italic text-[34px] text-jet leading-tight">
                {winner.you ? 'you took the crown 👑' : `${winner.name} wins`}
              </h3>
              <p className="mt-3 font-sans text-[15px] text-jet/70">
                you finished {yourPos === 1 ? 'first' : `${ordinal(yourPos)}`} out of{' '}
                {sortedPlayers.length}.
              </p>
              <div className="mt-7 flex flex-col sm:flex-row gap-3 items-center justify-center">
                <button
                  onClick={start}
                  className="font-sans font-semibold text-[15px] bg-jet text-cream rounded-full px-6 py-2.5 hover:-translate-y-[1px] transition-all"
                >
                  play again
                </button>
                <button
                  onClick={reset}
                  className="font-sans font-semibold text-[15px] text-jet/70 hover:text-jet transition-colors px-4 py-2.5"
                >
                  back to lobby
                </button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Leaderboard */}
      <div className="bg-white border border-jet/15 rounded-2xl p-5">
        <p className="font-pixel text-[10px] uppercase text-jet/60 tracking-[0.18em]">
          LIVE LEADERBOARD
        </p>
        <ol className="mt-4 space-y-2">
          {sortedPlayers.map((p, i) => (
            <li
              key={p.name}
              className={[
                'flex items-center gap-3 px-3 py-2 rounded-lg border transition-colors',
                p.you ? 'border-jet bg-jet/5' : 'border-jet/10',
              ].join(' ')}
            >
              <span className="font-pixel text-[10px] uppercase text-jet/55 tracking-[0.18em] w-5">
                {i + 1}
              </span>
              <span
                aria-hidden="true"
                className={[
                  'w-7 h-7 rounded-full flex items-center justify-center font-display italic text-[14px] flex-shrink-0',
                  p.you ? 'bg-jet text-cream' : 'bg-jet/10 text-jet/75',
                ].join(' ')}
              >
                {p.avatar}
              </span>
              <span className="font-sans text-[14px] text-jet flex-1 truncate">
                {p.name}
                {p.you && (
                  <span className="ml-1 font-pixel text-[8px] uppercase text-jet/55 tracking-[0.18em]">
                    YOU
                  </span>
                )}
              </span>
              <span className="font-display italic text-[15px] text-jet tabular-nums">
                {p.score}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function ordinal(n: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd'] as const;
  const v = n % 100;
  return n + (suffixes[(v - 20) % 10] ?? suffixes[v] ?? suffixes[0]);
}
