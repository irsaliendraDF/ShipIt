'use client';

import { useEffect, useRef, useState } from 'react';

type Option = {
  id: string;
  label: string;
  votes: number;
};

const QUESTION = 'which feature should we ship next?';

const SEED_OPTIONS: Option[] = [
  { id: 'a', label: 'dark mode', votes: 23 },
  { id: 'b', label: 'mobile app', votes: 41 },
  { id: 'c', label: 'team plan', votes: 17 },
  { id: 'd', label: 'public api', votes: 14 },
];

/** Simulated audience votes drip in every tick to keep the chart alive. */
const TICK_MS = 900;

export function LiveVotingTemplate() {
  const [options, setOptions] = useState<Option[]>(SEED_OPTIONS);
  const [yourPick, setYourPick] = useState<string | null>(null);
  const [live, setLive] = useState(true);
  const tickRef = useRef<number | null>(null);

  // Drip simulated audience votes onto random options while live is on.
  useEffect(() => {
    if (!live) return;
    tickRef.current = window.setInterval(() => {
      setOptions((prev) => {
        const i = Math.floor(Math.random() * prev.length);
        return prev.map((o, idx) => (idx === i ? { ...o, votes: o.votes + 1 } : o));
      });
    }, TICK_MS);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, [live]);

  function vote(id: string) {
    if (yourPick !== null) return;
    setYourPick(id);
    setOptions((prev) =>
      prev.map((o) => (o.id === id ? { ...o, votes: o.votes + 1 } : o)),
    );
  }

  function reset() {
    setOptions(SEED_OPTIONS.map((o) => ({ ...o })));
    setYourPick(null);
    setLive(true);
  }

  const total = options.reduce((s, o) => s + o.votes, 0);
  const maxVotes = Math.max(...options.map((o) => o.votes), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start max-w-[1080px] mx-auto">
      {/* Poll */}
      <div className="bg-white border border-jet/15 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-3">
          <p className="font-pixel text-[10px] uppercase text-jet/60 tracking-[0.18em]">
            LIVE POLL
          </p>
          {live && (
            <span className="flex items-center gap-1.5 font-pixel text-[9px] uppercase text-jet tracking-[0.22em]">
              <span className="relative inline-flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-jet opacity-70 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-jet" />
              </span>
              LIVE
            </span>
          )}
        </div>
        <h3 className="font-display italic text-[26px] sm:text-[30px] text-jet leading-tight">
          {QUESTION}
        </h3>

        <div className="mt-7 space-y-4">
          {options.map((o) => {
            const pct = total > 0 ? Math.round((o.votes / total) * 100) : 0;
            const barWidth = (o.votes / maxVotes) * 100;
            const isYours = yourPick === o.id;
            const isLeader = o.votes === maxVotes && total > 0;
            return (
              <button
                key={o.id}
                onClick={() => vote(o.id)}
                disabled={yourPick !== null}
                className={[
                  'relative w-full text-left rounded-xl border px-4 py-3 transition-all overflow-hidden',
                  isYours
                    ? 'border-jet border-2'
                    : yourPick === null
                      ? 'border-jet/15 hover:border-jet/60'
                      : 'border-jet/10',
                ].join(' ')}
              >
                {/* The bar */}
                <div
                  aria-hidden="true"
                  className={[
                    'absolute inset-y-0 left-0 rounded-l-xl',
                    isLeader ? 'bg-jet/15' : 'bg-jet/8',
                  ].join(' ')}
                  style={{
                    width: `${barWidth}%`,
                    transition: 'width 0.55s cubic-bezier(0.22, 0.61, 0.36, 1)',
                  }}
                />
                <div className="relative flex items-center justify-between gap-3">
                  <div className="flex items-baseline gap-3 min-w-0">
                    <span className="font-pixel text-[10px] uppercase text-jet/45 tracking-[0.18em] flex-shrink-0">
                      {o.id.toUpperCase()}
                    </span>
                    <span className="font-sans text-[15px] text-jet truncate">
                      {o.label}
                    </span>
                    {isYours && (
                      <span className="font-pixel text-[8px] uppercase text-jet tracking-[0.18em] flex-shrink-0">
                        YOUR VOTE
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2 flex-shrink-0">
                    <span className="font-display italic text-[20px] text-jet tabular-nums">
                      {pct}%
                    </span>
                    <span className="font-pixel text-[9px] uppercase text-jet/55 tracking-[0.18em] tabular-nums">
                      {o.votes}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {yourPick === null ? (
          <p className="mt-6 font-sans text-[13px] text-jet/55 text-center">
            tap an option to cast your vote.
          </p>
        ) : (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setLive((v) => !v)}
              className="font-pixel text-[10px] uppercase text-jet/65 hover:text-jet tracking-[0.18em]"
            >
              {live ? '◼ pause live feed' : '▶ resume live feed'}
            </button>
            <button
              onClick={reset}
              className="font-pixel text-[10px] uppercase text-jet/65 hover:text-jet tracking-[0.18em]"
            >
              ↺ reset poll
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="bg-white border border-jet/15 rounded-2xl p-5">
        <p className="font-pixel text-[10px] uppercase text-jet/60 tracking-[0.18em]">
          ROOM TOTALS
        </p>
        <div className="mt-3">
          <p className="font-display italic text-[44px] text-jet leading-none tabular-nums">
            {total}
          </p>
          <p className="mt-1 font-sans text-[12px] text-jet/55">votes cast</p>
        </div>

        <div className="mt-5 pt-4 border-t border-jet/10">
          <p className="font-pixel text-[10px] uppercase text-jet/60 tracking-[0.18em]">
            CURRENT LEADER
          </p>
          {(() => {
            const leader = [...options].sort((a, b) => b.votes - a.votes)[0]!;
            return (
              <>
                <p className="mt-2 font-display italic text-[22px] text-jet leading-tight">
                  {leader.label}
                </p>
                <p className="mt-1 font-sans text-[12px] text-jet/55">
                  {leader.votes} votes · {Math.round((leader.votes / total) * 100)}%
                </p>
              </>
            );
          })()}
        </div>

        <div className="mt-5 pt-4 border-t border-jet/10">
          <p className="font-pixel text-[10px] uppercase text-jet/60 tracking-[0.18em]">
            YOUR PICK
          </p>
          <p className="mt-2 font-display italic text-[20px] text-jet leading-tight">
            {yourPick
              ? options.find((o) => o.id === yourPick)?.label
              : 'not yet…'}
          </p>
        </div>
      </div>
    </div>
  );
}
