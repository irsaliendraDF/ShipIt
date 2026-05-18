'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Compact inline brand switcher. Rendered inside each header next to the
 * page logo. Two small chips let the visitor flip between shipit.fun and
 * shipit.build.
 */
export function BrandSwitcher() {
  const pathname = usePathname() ?? '/';
  const onBuild = pathname.startsWith('/build');

  return (
    <div
      role="tablist"
      aria-label="ShipIt brand"
      className="inline-flex items-center gap-1 p-1 rounded-full border border-jet/15 bg-cream/80 backdrop-blur-sm"
    >
      <Link
        href="/"
        role="tab"
        aria-selected={!onBuild}
        aria-current={!onBuild ? 'page' : undefined}
        className={[
          'inline-flex items-center gap-1 px-2.5 py-1 rounded-full',
          'font-pixel text-[9px] uppercase tracking-[0.1em] leading-none transition-all',
          !onBuild
            ? 'bg-bubblegum text-cream shadow-[0_1px_0_rgba(26,26,26,0.12)]'
            : 'text-jet/65 hover:text-bubblegum',
        ].join(' ')}
      >
        <span className="text-[12px] leading-none">🎨</span>
        <span>.fun</span>
      </Link>

      <Link
        href="/build"
        role="tab"
        aria-selected={onBuild}
        aria-current={onBuild ? 'page' : undefined}
        className={[
          'inline-flex items-center gap-1 px-2.5 py-1 rounded-full',
          'font-pixel text-[9px] uppercase tracking-[0.1em] leading-none transition-all',
          onBuild
            ? 'bg-purple text-cream shadow-[0_1px_0_rgba(26,26,26,0.12)]'
            : 'text-jet/65 hover:text-purple',
        ].join(' ')}
      >
        <span className="text-[12px] leading-none">🛠️</span>
        <span>.build</span>
      </Link>
    </div>
  );
}
