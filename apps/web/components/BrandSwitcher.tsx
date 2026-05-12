'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Top strip showing the ShipIt! umbrella with two sister-brand tabs.
 * Lets the visitor flip between shipit.fun and shipit.build to compare.
 */
export function BrandSwitcher() {
  const pathname = usePathname() ?? '/';
  const onBuild = pathname.startsWith('/build');

  return (
    <div className="fixed top-0 inset-x-0 z-[60] bg-cream text-jet border-b border-jet/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-8 flex items-center justify-between text-[10px] font-pixel uppercase">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-jet group-hover:text-orange transition-colors">
            🚢 ShipIt!
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/build"
            aria-current={onBuild ? 'page' : undefined}
            className={[
              'px-3 py-1 transition-colors rounded-sm',
              onBuild
                ? 'bg-orange text-cream'
                : 'text-jet/65 hover:text-orange',
            ].join(' ')}
          >
            🛠️ .build
          </Link>
          <Link
            href="/"
            aria-current={!onBuild ? 'page' : undefined}
            className={[
              'px-3 py-1 transition-colors rounded-sm',
              !onBuild
                ? 'bg-bubblegum text-cream'
                : 'text-jet/65 hover:text-bubblegum',
            ].join(' ')}
          >
            🎨 .fun
          </Link>
        </div>
      </div>
    </div>
  );
}
