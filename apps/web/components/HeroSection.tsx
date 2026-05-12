'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { GradientButton } from '@/components/ui/gradient-button';

const headline = 'ship it for fun.';

export function HeroSection() {
  const router = useRouter();
  const words = headline.split(' ');

  return (
    <section className="relative overflow-hidden min-h-[100svh] flex items-center justify-center scanline-sweep crt-curve">
      <div className="scanlines" aria-hidden="true" />

      {/* Top corner labels */}
      <div className="absolute top-24 left-6 lg:left-10 z-10 hidden sm:block">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent/80">
          [ vibe_coder ]
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-warm/80 mt-1">
          credits: ∞
        </p>
      </div>
      <div className="absolute top-24 right-6 lg:right-10 z-10 hidden sm:block text-right">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-warm/80">
          high_score
        </p>
        <p className="font-mono text-xs tracking-widest text-jet/80 mt-1">
          1,000,000
        </p>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-10 text-center">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-mono text-[11px] uppercase tracking-[0.4em] text-warm mb-8"
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-warm mr-3 align-middle animate-pulseDot" />
          status: open / now accepting weird builds
        </motion.p>

        <h1 className="font-mono font-medium text-5xl sm:text-7xl md:text-8xl leading-[0.95] tracking-tight text-jet text-glow">
          {words.map((word, i) => (
            <motion.span
              key={`${word}-${i}`}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.25 + i * 0.12,
                ease: [0.2, 0.8, 0.2, 1],
              }}
              className="inline-block mr-4"
            >
              {word === 'fun.' ? (
                <span className="italic text-accent">{word}</span>
              ) : (
                word
              )}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-8 text-lg sm:text-xl text-jet/70 max-w-2xl mx-auto leading-relaxed"
        >
          a home for vibe coders building whimsical alternative entertainment together.
          canada-based. weirdness welcome.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.05 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5"
        >
          <GradientButton
            size="lg"
            onClick={() => router.push('/experiments')}
            ariaLabel="See what people are shipping"
          >
            ▶ See what's shipping
          </GradientButton>
          <GradientButton
            size="lg"
            onClick={() =>
              window.open(
                'https://github.com/irsaliendraDF/ShipIt/blob/main/CONTRIBUTING.md',
                '_blank',
                'noopener,noreferrer'
              )
            }
            ariaLabel="Become a Contributor"
          >
            Come ship something
          </GradientButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="mt-20 flex items-center justify-center gap-6 text-[10px] font-mono uppercase tracking-[0.3em] text-jet/45"
        >
          <span>// gesture</span>
          <span className="text-warm/70">// voice</span>
          <span>// body</span>
          <span className="text-warm/70">// ai</span>
        </motion.div>
      </div>

    </section>
  );
}
