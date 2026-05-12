/**
 * Pixel-font marquee on jet, per the shipit.fun "mixtape edition" brand spec.
 * One band of scrolling text alternating cream + bubblegum + orange accents.
 */
const tokens = [
  { text: 'SHIPPING FOR FUN SINCE 2026', tone: 'cream' as const },
  { text: '✦', tone: 'pink' as const },
  { text: "FORK MINE I'LL FORK YOURS", tone: 'cream' as const },
  { text: '✦', tone: 'orange' as const },
  { text: 'CANADA WIDE WEIRDNESS WELCOME', tone: 'cream' as const },
  { text: '✦', tone: 'pink' as const },
  { text: 'NO MRR JUST VIBES', tone: 'cream' as const },
  { text: '✦', tone: 'orange' as const },
];

const toneClass: Record<'cream' | 'pink' | 'orange', string> = {
  cream: 'text-cream',
  pink: 'text-bubblegum',
  orange: 'text-orange',
};

function Row() {
  return (
    <div className="flex items-center gap-8 shrink-0 px-4">
      {tokens.map((t, i) => (
        <span
          key={`${t.text}-${i}`}
          className={`font-pixel text-[11px] tracking-[0.22em] ${toneClass[t.tone]}`}
        >
          {t.text}
        </span>
      ))}
    </div>
  );
}

export function MarqueeStrip() {
  return (
    <div className="relative z-10 py-6">
      {/* Glowing halo behind the strip — bubblegum + orange wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-40 blur-3xl opacity-90"
        style={{
          background:
            'radial-gradient(ellipse at 20% 50%, rgba(139,92,246,0.7), transparent 55%), radial-gradient(ellipse at 80% 50%, rgba(139,92,246,0.7), transparent 55%), radial-gradient(ellipse at 50% 50%, rgba(255,111,181,0.5), transparent 60%)',
        }}
      />
      <div className="relative bg-jet overflow-hidden py-3 rounded-sm">
        <div className="flex animate-[scroll_30s_linear_infinite] whitespace-nowrap">
          <Row />
          <Row />
          <Row />
          <Row />
        </div>
      </div>
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
