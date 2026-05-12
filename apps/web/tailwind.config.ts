import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './data/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  safelist: [
    // GlowMenu builds these classes from item config, so the JIT can't see them statically
    'text-accent',
    'text-warm',
    'text-lime',
    'group-hover:text-accent',
    'group-hover:text-warm',
    'group-hover:text-lime',
  ],
  theme: {
    extend: {
      colors: {
        // Sunset / mixtape palette (shipit.fun brand).
        // Token names (bg, accent, warm, lime) preserved from the v0 scaffold so
        // existing className references keep working; only the values change.
        bg: {
          DEFAULT: '#fde9c8',   // cream (page background)
          elevated: '#faf7f0',  // off-white (cards, content surfaces)
          surface: '#faf7f0',
          deep: '#f5e0b8',      // slightly deeper cream for contrast wells
        },
        accent: {
          DEFAULT: '#ff6fb5',   // bubblegum (primary pop)
          dim: '#e558a0',
        },
        warm: {
          DEFAULT: '#ff7a3d',   // sunset orange
          deep: '#e56a1f',
          glow: '#ffb377',
        },
        lime: {
          // Repurposed for riso purple in the sunset palette so existing
          // `text-lime` references still render as a brand color.
          DEFAULT: '#8b5cf6',
        },
        jet: {
          DEFAULT: '#1a1a1a',
        },
        cream: '#fde9c8',
        offwhite: '#faf7f0',
        bubblegum: '#ff6fb5',
        orange: '#ff7a3d',
        purple: '#8b5cf6',
      },
      fontFamily: {
        // `mono` now points at Fraunces (display serif). Most of the v0 components
        // use font-mono for headlines and labels; Fraunces gives them a warm
        // editorial feel that matches the mixtape aesthetic.
        mono: ['var(--font-display)', 'Fraunces', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Fraunces', 'Georgia', 'serif'],
        pixel: ['var(--font-pixel)', '"Press Start 2P"', 'monospace'],
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        meshDrift: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(2%, -2%) scale(1.05)' },
          '66%': { transform: 'translate(-2%, 1%) scale(0.98)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        marqueeBlink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0.35' },
        },
        flicker: {
          '0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100%': {
            opacity: '1',
          },
          '20%, 21.999%, 63%, 63.999%, 65%, 69.999%': {
            opacity: '0.85',
          },
        },
        recDot: {
          '0%, 100%': {
            transform: 'scale(1)',
            boxShadow: '0 0 0 0 rgba(255, 122, 61, 0.65), 0 0 8px rgba(255, 122, 61, 0.6)',
          },
          '50%': {
            transform: 'scale(1.18)',
            boxShadow: '0 0 0 6px rgba(255, 122, 61, 0), 0 0 14px rgba(255, 122, 61, 0.85)',
          },
        },
        liveBreath: {
          '0%, 100%': { opacity: '0.78', textShadow: '0 0 0 rgba(255, 122, 61, 0)' },
          '50%': { opacity: '1', textShadow: '0 0 12px rgba(255, 122, 61, 0.55)' },
        },
        gradientFlow: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        scanline: 'scanline 8s linear infinite',
        meshDrift: 'meshDrift 18s ease-in-out infinite',
        pulseDot: 'pulseDot 1.5s ease-in-out infinite',
        marqueeBlink: 'marqueeBlink 1s steps(1) infinite',
        flicker: 'flicker 4s linear infinite',
        recDot: 'recDot 1.6s ease-out infinite',
        liveBreath: 'liveBreath 2s ease-in-out infinite',
        gradientFlow: 'gradientFlow 8s ease infinite',
      },
    },
  },
  plugins: [],
};

export default config;
