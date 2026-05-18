'use client';

import { useState, type DragEvent } from 'react';

type QuadrantId = 'q1' | 'q2' | 'q3' | 'q4' | 'pool';

type Item = { id: string; label: string };

const QUADRANT_LABELS: Record<Exclude<QuadrantId, 'pool'>, string> = {
  q1: 'do now',
  q2: 'schedule',
  q3: 'delegate',
  q4: 'drop',
};

const QUADRANT_DESCRIPTIONS: Record<Exclude<QuadrantId, 'pool'>, string> = {
  q1: 'urgent + important',
  q2: 'important, not urgent',
  q3: 'urgent, not important',
  q4: 'neither',
};

const QUADRANT_COLOR: Record<Exclude<QuadrantId, 'pool'>, string> = {
  q1: '#8b5cf6',
  q2: '#a78bfa',
  q3: '#ff7a3d',
  q4: '#ffb377',
};

const DEFAULT_ITEMS: Item[] = [
  { id: 'i1', label: 'reply to client revision request' },
  { id: 'i2', label: 'plan q3 strategy' },
  { id: 'i3', label: 'sit in on someone else’s meeting' },
  { id: 'i4', label: 'reorganize the slack sidebar' },
  { id: 'i5', label: 'send the proposal that’s due tomorrow' },
  { id: 'i6', label: 'sketch the new tool idea' },
];

export function Matrix2x2Template() {
  const [placement, setPlacement] = useState<Record<string, QuadrantId>>(() =>
    Object.fromEntries(DEFAULT_ITEMS.map((i) => [i.id, 'pool' as QuadrantId])),
  );
  const [dragging, setDragging] = useState<string | null>(null);

  function handleDragStart(e: DragEvent<HTMLDivElement>, id: string) {
    setDragging(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>, target: QuadrantId) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || dragging;
    if (!id) return;
    setPlacement((prev) => ({ ...prev, [id]: target }));
    setDragging(null);
  }

  function allowDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function reset() {
    setPlacement(Object.fromEntries(DEFAULT_ITEMS.map((i) => [i.id, 'pool' as QuadrantId])));
  }

  function itemsIn(q: QuadrantId): Item[] {
    return DEFAULT_ITEMS.filter((i) => placement[i.id] === q);
  }

  const quadrants: Exclude<QuadrantId, 'pool'>[] = ['q1', 'q2', 'q3', 'q4'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 max-w-[1080px] mx-auto">
      <div className="relative">
        <p className="text-center font-pixel text-[10px] uppercase text-purple tracking-[0.18em] mb-2">
          ↑ important
        </p>
        <div className="grid grid-cols-2 gap-2">
          {quadrants.map((q) => {
            const items = itemsIn(q);
            return (
              <div
                key={q}
                onDragOver={allowDrop}
                onDrop={(e) => handleDrop(e, q)}
                className="relative bg-cream border-2 border-dashed border-jet/15 rounded-2xl p-4 min-h-[180px] transition-colors hover:border-jet/30"
                style={{ borderColor: dragging ? QUADRANT_COLOR[q] + '80' : undefined }}
              >
                <div className="flex items-baseline gap-2 mb-3">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ background: QUADRANT_COLOR[q] }}
                    aria-hidden="true"
                  />
                  <p className="font-display italic text-[18px] text-jet leading-none">
                    {QUADRANT_LABELS[q]}
                  </p>
                </div>
                <p className="font-pixel text-[8px] uppercase text-jet/45 tracking-[0.18em] mb-3">
                  {QUADRANT_DESCRIPTIONS[q]}
                </p>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item.id)}
                      className="font-sans text-[13px] text-jet bg-offwhite border border-jet/10 rounded-md px-2.5 py-1.5 cursor-grab active:cursor-grabbing hover:border-purple/50"
                    >
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between mt-3">
          <p className="font-pixel text-[10px] uppercase text-jet/55 tracking-[0.18em]">
            ← not urgent
          </p>
          <p className="font-pixel text-[10px] uppercase text-jet/55 tracking-[0.18em]">
            urgent →
          </p>
        </div>
      </div>

      <div
        onDragOver={allowDrop}
        onDrop={(e) => handleDrop(e, 'pool')}
        className="bg-cream border border-jet/10 rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <p className="font-pixel text-[10px] uppercase text-purple tracking-[0.18em]">
            ITEMS · drag to sort
          </p>
          <button
            onClick={reset}
            className="font-pixel text-[9px] uppercase text-jet/55 hover:text-purple tracking-[0.18em]"
          >
            reset
          </button>
        </div>
        <div className="space-y-2 min-h-[200px]">
          {itemsIn('pool').map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, item.id)}
              className="font-sans text-[14px] text-jet bg-offwhite border border-jet/10 rounded-md px-3 py-2 cursor-grab active:cursor-grabbing hover:border-purple/50"
            >
              {item.label}
            </div>
          ))}
          {itemsIn('pool').length === 0 && (
            <p className="font-sans italic text-[13px] text-jet/50">
              all sorted. drag any tile back here to remove it.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
