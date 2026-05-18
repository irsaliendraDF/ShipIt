'use client';

import { useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react';

/**
 * GradientButton — CSS-only animated gradient CTA.
 *
 * Smooth flowing bubblegum → sunset orange → riso purple gradient with a
 * mouse-reactive radial highlight, animated SVG border, and soft outer glow.
 * No WebGL, no heavy deps, no flicker.
 *
 * Polymorphic: pass `href` to render as an <a>, otherwise renders <button>.
 */

type Size = 'sm' | 'md' | 'lg';
type Variant = 'fun' | 'build';

type Props = {
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  size?: Size;
  /**
   * Color scheme. `'fun'` (default) = bubblegum + sunset orange (shipit.fun).
   * `'build'` = riso purple + light orange (shipit.build).
   */
  variant?: Variant;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
  ariaLabel?: string;
  // Anchor mode
  href?: string;
  target?: string;
  rel?: string;
};

const sizeStyles: Record<Size, string> = {
  sm: 'h-9 px-5 text-[11px]',
  md: 'h-12 px-7 text-xs',
  lg: 'h-14 px-9 text-sm',
};

type VariantPalette = {
  gradient: string;
  shadowIdle: string;
  shadowHover: string;
  haloBackground: string;
  borderStops: [string, string, string];
  borderAnim: [string, string, string];
};

const variantPalettes: Record<Variant, VariantPalette> = {
  fun: {
    gradient:
      'linear-gradient(120deg, #ff6fb5 0%, #e558a0 22%, #ff7a3d 50%, #ffb377 70%, #e558a0 88%, #ff6fb5 100%)',
    shadowIdle: '0 0 14px rgba(255, 111, 181, 0.20)',
    shadowHover:
      '0 0 32px rgba(255, 122, 61, 0.35), 0 0 60px rgba(255, 111, 181, 0.25)',
    haloBackground:
      'radial-gradient(circle at var(--mx) var(--my), rgba(255,122,61,0.45), rgba(255,111,181,0.30) 40%, transparent 70%)',
    borderStops: ['#ff6fb5', '#ff7a3d', '#e558a0'],
    borderAnim: [
      '#ff6fb5;#ff7a3d;#e558a0;#ff6fb5',
      '#ff7a3d;#e558a0;#ff6fb5;#ff7a3d',
      '#e558a0;#ff6fb5;#ff7a3d;#e558a0',
    ],
  },
  build: {
    gradient:
      'linear-gradient(120deg, #8b5cf6 0%, #a78bfa 22%, #ffb377 50%, #ffc69e 70%, #a78bfa 88%, #8b5cf6 100%)',
    shadowIdle: '0 0 14px rgba(139, 92, 246, 0.22)',
    shadowHover:
      '0 0 32px rgba(255, 179, 119, 0.35), 0 0 60px rgba(139, 92, 246, 0.28)',
    haloBackground:
      'radial-gradient(circle at var(--mx) var(--my), rgba(255,179,119,0.45), rgba(139,92,246,0.30) 40%, transparent 70%)',
    borderStops: ['#8b5cf6', '#ffb377', '#a78bfa'],
    borderAnim: [
      '#8b5cf6;#ffb377;#a78bfa;#8b5cf6',
      '#ffb377;#a78bfa;#8b5cf6;#ffb377',
      '#a78bfa;#8b5cf6;#ffb377;#a78bfa',
    ],
  },
};

export function GradientButton({
  children,
  onClick,
  size = 'md',
  variant = 'fun',
  className = '',
  disabled = false,
  type = 'button',
  ariaLabel,
  href,
  target,
  rel,
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mouse, setMouse] = useState({ x: 50, y: 50 });
  const palette = variantPalettes[variant];
  const gradientId = `gb-border-${variant}`;

  const handleMove = (e: MouseEvent<HTMLElement>) => {
    if (disabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMouse({ x, y });
  };

  const styleVars: CSSProperties & Record<'--mx' | '--my', string> = {
    '--mx': `${mouse.x}%`,
    '--my': `${mouse.y}%`,
    boxShadow: isHovered ? palette.shadowHover : palette.shadowIdle,
  };

  const sharedClassName = [
    'group relative inline-flex items-center justify-center overflow-hidden',
    'font-mono uppercase tracking-[0.18em] font-bold text-cream',
    'rounded-md select-none no-underline',
    'transition-all duration-300',
    'hover:scale-[1.04] active:scale-[0.97]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
    disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
    sizeStyles[size],
    className,
  ].join(' ');

  const innerLayers = (
    <>
      {/* Animated flowing gradient. Wide background-size + animated position = smooth liquid flow. */}
      <span
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none animate-[gradientFlow_8s_ease_infinite]"
        style={{
          background: palette.gradient,
          backgroundSize: '300% 300%',
        }}
      />

      {/* Mouse-reactive radial highlight. Follows the cursor on hover. */}
      <span
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 mix-blend-screen"
        style={{
          opacity: isHovered ? 1 : 0,
          background:
            'radial-gradient(circle 140px at var(--mx) var(--my), rgba(255,255,255,0.35), transparent 70%)',
        }}
      />

      {/* Soft outer halo bloom that intensifies under cursor */}
      <span
        aria-hidden="true"
        className="absolute -inset-2 pointer-events-none rounded-md transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: palette.haloBackground,
          filter: 'blur(20px)',
        }}
      />

      {/* Animated SVG border that draws on hover */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={palette.borderStops[0]}>
              <animate
                attributeName="stop-color"
                values={palette.borderAnim[0]}
                dur="4s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="50%" stopColor={palette.borderStops[1]}>
              <animate
                attributeName="stop-color"
                values={palette.borderAnim[1]}
                dur="4s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor={palette.borderStops[2]}>
              <animate
                attributeName="stop-color"
                values={palette.borderAnim[2]}
                dur="4s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>
        </defs>
        <rect
          x="1"
          y="1"
          width="98"
          height="98"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="2"
          strokeDasharray="400"
          strokeDashoffset={isHovered ? 0 : 400}
          rx="6"
          ry="6"
          style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
        />
      </svg>

      {/* Text */}
      <span
        className="relative z-10 inline-flex items-center gap-2 transition-[letter-spacing] duration-300"
        style={{
          letterSpacing: isHovered ? '0.22em' : '0.18em',
          textShadow: '0 1px 0 rgba(26,26,26,0.25), 0 0 6px rgba(26,26,26,0.18)',
        }}
      >
        {children}
      </span>
    </>
  );

  if (href) {
    return (
      <a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        target={target}
        rel={rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined)}
        aria-label={ariaLabel}
        aria-disabled={disabled || undefined}
        onMouseEnter={() => !disabled && setIsHovered(true)}
        onMouseLeave={() => !disabled && setIsHovered(false)}
        onMouseMove={handleMove}
        onClick={(e) => {
          if (disabled) {
            e.preventDefault();
            return;
          }
          onClick?.(e);
        }}
        className={sharedClassName}
        style={styleVars}
      >
        {innerLayers}
      </a>
    );
  }

  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type={type}
      aria-label={ariaLabel}
      disabled={disabled}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => !disabled && setIsHovered(false)}
      onMouseMove={handleMove}
      onClick={onClick}
      className={sharedClassName}
      style={styleVars}
    >
      {innerLayers}
    </button>
  );
}

export default GradientButton;
