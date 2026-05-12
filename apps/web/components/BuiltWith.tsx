'use client';

import { motion } from 'framer-motion';
import { SectionHeader } from './SectionHeader';

type Tool = {
  name: string;
  /** Either a slug from simple-icons CDN, or 'custom' to render the inline SVG below. */
  iconSlug?: string;
  custom?: boolean;
  url: string;
  /** Short tag describing where it's used in the lab. */
  used: string;
};

const tools: Tool[] = [
  {
    name: 'MediaPipe',
    custom: true,
    url: 'https://google.github.io/mediapipe/',
    used: 'Hand + pose tracking',
  },
  {
    name: 'Three.js',
    iconSlug: 'threedotjs',
    url: 'https://threejs.org',
    used: '3D rendering',
  },
  {
    name: 'Next.js',
    iconSlug: 'nextdotjs',
    url: 'https://nextjs.org',
    used: 'Lab platform',
  },
  {
    name: 'React',
    iconSlug: 'react',
    url: 'https://react.dev',
    used: 'UI components',
  },
  {
    name: 'TypeScript',
    iconSlug: 'typescript',
    url: 'https://www.typescriptlang.org',
    used: 'Type safety',
  },
  {
    name: 'Tailwind CSS',
    iconSlug: 'tailwindcss',
    url: 'https://tailwindcss.com',
    used: 'Styling',
  },
  {
    name: 'Vite',
    iconSlug: 'vite',
    url: 'https://vitejs.dev',
    used: 'Experiment builds',
  },
  {
    name: 'Framer Motion',
    iconSlug: 'framer',
    url: 'https://www.framer.com/motion/',
    used: 'Page motion',
  },
  {
    name: 'Anthropic',
    iconSlug: 'anthropic',
    url: 'https://anthropic.com',
    used: 'AI synthesis',
  },
  {
    name: 'Vercel',
    iconSlug: 'vercel',
    url: 'https://vercel.com',
    used: 'Hosting',
  },
];

function ToolLogo({ tool }: { tool: Tool }) {
  if (tool.custom && tool.name === 'MediaPipe') {
    // Stylized hand-landmarks mark: 5 fingertip dots + wrist + connecting lines
    return (
      <svg
        viewBox="0 0 24 24"
        className="w-8 h-8"
        fill="currentColor"
        aria-hidden="true"
      >
        <g stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5">
          <line x1="12" y1="20" x2="6" y2="11" />
          <line x1="12" y1="20" x2="9" y2="6" />
          <line x1="12" y1="20" x2="13" y2="4" />
          <line x1="12" y1="20" x2="17" y2="6" />
          <line x1="12" y1="20" x2="20" y2="10" />
        </g>
        <circle cx="6" cy="11" r="1.6" />
        <circle cx="9" cy="6" r="1.6" />
        <circle cx="13" cy="4" r="1.8" />
        <circle cx="17" cy="6" r="1.6" />
        <circle cx="20" cy="10" r="1.6" />
        <circle cx="12" cy="20" r="2.2" />
      </svg>
    );
  }
  // simple-icons CDN serves single-color SVGs. We render at white and tint with opacity.
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={`https://cdn.simpleicons.org/${tool.iconSlug}/1a1a1a`}
      alt=""
      className="w-8 h-8 object-contain"
      loading="lazy"
    />
  );
}

export function BuiltWith() {
  return (
    <section className="relative py-24 lg:py-32 border-t border-jet/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <SectionHeader
          eyebrow="// stack"
          title="Built with."
          description="The browser-native tools that make these experiments possible. Open standards, open source, runs in any modern browser."
        />

        <div className="mt-14 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
          {tools.map((tool, i) => (
            <motion.a
              key={tool.name}
              href={tool.url}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              className="group relative bg-bg-elevated border border-jet/8 hover:border-accent/40 transition-all duration-300 p-5 hud-corners overflow-hidden"
            >
              <div
                aria-hidden
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(circle at 30% 30%, rgba(255,111,181,0.14), transparent 70%)',
                }}
              />
              <div className="relative flex flex-col items-start gap-3">
                <div className="text-jet/70 group-hover:text-accent transition-colors duration-300">
                  <ToolLogo tool={tool} />
                </div>
                <div>
                  <p className="font-mono text-sm font-bold text-jet group-hover:text-accent transition-colors">
                    {tool.name}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-jet/40 mt-1">
                    {tool.used}
                  </p>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.3em] text-jet/35 text-center">
          // and a lot of late nights
        </p>
      </div>
    </section>
  );
}
