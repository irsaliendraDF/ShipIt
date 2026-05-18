import type { Metadata, Viewport } from 'next';
import { Fraunces, DM_Sans, Press_Start_2P } from 'next/font/google';
import { BrandSwitcher } from '@/components/BrandSwitcher';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

const pressStart = Press_Start_2P({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-pixel',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'shipit.fun. ship it for fun.',
  description:
    'a home for vibe coders building whimsical alternative entertainment together. canada-based. weirdness welcome.',
  metadataBase: new URL('https://shipit.fun'),
  openGraph: {
    title: 'shipit.fun',
    description: 'a home for vibe coders building whimsical alternative entertainment together.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#fde9c8',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable} ${pressStart.variable}`}>
      <body className="bg-bg text-jet font-sans antialiased min-h-screen flex flex-col">
        <div className="grain-overlay" aria-hidden="true" />
        <BrandSwitcher />
        <Nav />
        <main className="flex-1 relative z-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
