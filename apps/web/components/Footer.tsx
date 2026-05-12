'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();
  // shipit.build (/build) has its own footer rendered inside the page.
  if ((pathname ?? '').startsWith('/build')) return null;

  return (
    <footer className="relative z-10 border-t border-jet/10 mt-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="col-span-2">
          <p className="font-mono text-accent text-base italic tracking-tight">shipit.fun</p>
          <p className="mt-4 text-jet/60 text-sm max-w-md leading-relaxed">
            a home for vibe coders building whimsical alternative entertainment together.
            founding contributor:{' '}
            <a
              href="https://digitalflowconsulting.ca"
              className="text-jet/80 hover:text-accent transition-colors"
              target="_blank"
              rel="noreferrer"
            >
              Digital Flow Consulting
            </a>
            .
          </p>
        </div>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-jet/45 mb-4">
            Site
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/experiments" className="text-jet/70 hover:text-accent">
                Experiments
              </Link>
            </li>
            <li>
              <Link href="/contributors" className="text-jet/70 hover:text-accent">
                Crew
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-jet/70 hover:text-accent">
                About
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-jet/45 mb-4">
            Build
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                href="https://github.com/irsaliendraDF/ShipIt"
                className="text-jet/70 hover:text-accent"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
            </li>
            <li>
              <a
                href="https://github.com/irsaliendraDF/ShipIt/blob/main/CONTRIBUTING.md"
                className="text-jet/70 hover:text-accent"
                target="_blank"
                rel="noreferrer"
              >
                Contribute
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-jet/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.2em] text-jet/40">
          <span>v0.1.0 / ship it for fun</span>
          <span>MIT</span>
        </div>
      </div>
    </footer>
  );
}
