'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Gamepad2, Home, Info, Users } from 'lucide-react';
import { MenuBar, type MenuItem } from '@/components/ui/glow-menu';

const items: MenuItem[] = [
  {
    icon: Home,
    label: 'Home',
    href: '/',
    gradient:
      'radial-gradient(circle, rgba(255,111,181,0.20) 0%, rgba(229,88,160,0.07) 50%, rgba(255,111,181,0) 100%)',
    iconColor: 'text-accent',
  },
  {
    icon: Gamepad2,
    label: 'Experiments',
    href: '/experiments',
    gradient:
      'radial-gradient(circle, rgba(255,122,61,0.20) 0%, rgba(229,106,31,0.07) 50%, rgba(255,122,61,0) 100%)',
    iconColor: 'text-warm',
  },
  {
    icon: Users,
    label: 'Crew',
    href: '/contributors',
    gradient:
      'radial-gradient(circle, rgba(139,92,246,0.20) 0%, rgba(124,58,237,0.07) 50%, rgba(139,92,246,0) 100%)',
    iconColor: 'text-lime',
  },
  {
    icon: Info,
    label: 'About',
    href: '/about',
    gradient:
      'radial-gradient(circle, rgba(255,111,181,0.20) 0%, rgba(229,88,160,0.07) 50%, rgba(255,111,181,0) 100%)',
    iconColor: 'text-accent',
  },
];

function activeLabelFor(pathname: string): string {
  if (pathname.startsWith('/experiments')) return 'Experiments';
  if (pathname.startsWith('/contributors')) return 'Crew';
  if (pathname.startsWith('/about')) return 'About';
  return 'Home';
}

/** News-style LIVE badge: filled orange pill with cream pulsing dot. */
function LiveBadge() {
  return (
    <div
      className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-warm font-mono"
      style={{
        boxShadow:
          '0 0 16px rgba(255, 122, 61, 0.55), 0 0 32px rgba(255, 122, 61, 0.25)',
      }}
      aria-label="shipit.fun is live"
    >
      <span className="relative inline-flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full rounded-full bg-cream opacity-80 animate-ping" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-cream" />
      </span>
      <span className="text-[10px] font-bold tracking-[0.28em] text-cream animate-flicker">
        LIVE
      </span>
    </div>
  );
}

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const active = activeLabelFor(pathname ?? '/');

  return (
    <header className="fixed top-8 inset-x-0 z-50 bg-cream/70 backdrop-blur-md border-b border-jet/10">
      <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
          <span className="font-mono text-accent text-base italic tracking-tight">
            <span className="inline-block w-2 h-2 bg-warm rounded-full mr-2 align-middle animate-pulseDot" />
            shipit.fun
          </span>
        </Link>

        {/* Menu absolutely centered in the navbar — independent of logo/LIVE widths */}
        <div className="hidden md:flex absolute inset-y-0 left-1/2 -translate-x-1/2 items-center pointer-events-none">
          <div className="pointer-events-auto">
            <MenuBar
              items={items}
              activeItem={active}
              onItemClick={(_label, item) => router.push(item.href)}
            />
          </div>
        </div>

        <LiveBadge />
      </nav>
    </header>
  );
}
