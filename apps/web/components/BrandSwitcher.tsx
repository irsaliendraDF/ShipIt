'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Floating vertical brand switcher pinned to the left edge.
 * Two logo tiles let the visitor flip between shipit.fun and shipit.build.
 */
export function BrandSwitcher() {
  const pathname = usePathname() ?? '/';
  const onBuild = pathname.startsWith('/build');

  return (
    <aside
      aria-label="ShipIt brand switcher"
      className="fixed left-3 sm:left-4 top-1/2 -translate-y-1/2 z-[60] flex flex-col items-center gap-2"
    >
      <Link
        href="/"
        aria-label="shipit.fun"
        aria-current={!onBuild ? 'page' : undefined}
        className={[
          'group relative flex flex-col items-center justify-center',
          'w-14 h-14 rounded-2xl border transition-all',
          !onBuild
            ? 'bg-bubblegum text-cream border-bubblegum scale-105 shadow-[0_4px_0_rgba(26,26,26,0.12)]'
            : 'bg-cream text-jet/70 border-jet/15 hover:border-bubblegum hover:text-bubblegum hover:-translate-y-[1px]',
        ].join(' ')}
      >
        <span className="text-xl leading-none">🎨</span>
        <span className="mt-1 font-pixel text-[8px] uppercase tracking-[0.1em] leading-none">
          .fun
        </span>
      </Link>

      <Link
        href="/build"
        aria-label="shipit.build"
        aria-current={onBuild ? 'page' : undefined}
        className={[
          'group relative flex flex-col items-center justify-center',
          'w-14 h-14 rounded-2xl border transition-all',
          onBuild
            ? 'bg-orange text-cream border-orange scale-105 shadow-[0_4px_0_rgba(26,26,26,0.12)]'
            : 'bg-cream text-jet/70 border-jet/15 hover:border-orange hover:text-orange hover:-translate-y-[1px]',
        ].join(' ')}
      >
        <span className="text-xl leading-none">🛠️</span>
        <span className="mt-1 font-pixel text-[8px] uppercase tracking-[0.1em] leading-none">
          .build
        </span>
      </Link>
    </aside>
  );
}
