import Link from 'next/link';
import { ShaderBackground } from '@/components/ui/shader-background';
import { HeroSection } from '@/components/HeroSection';
import { ExperimentCarousel } from '@/components/ExperimentCarousel';
import { SectionHeader } from '@/components/SectionHeader';
import { ContributorCard } from '@/components/ContributorCard';
import { BuiltWith } from '@/components/BuiltWith';
import { GradientButton } from '@/components/ui/gradient-button';
import { MarqueeStrip } from '@/components/MarqueeStrip';
import { StickerScatter } from '@/components/StickerScatter';
import { experiments } from '@/data/experiments';
import { contributors } from '@/data/contributors';

export default function HomePage() {
  return (
    <>
      <ShaderBackground />

      <HeroSection />

      {/* Translucent so the shader stays visible behind content as the user scrolls */}
      <div className="relative z-[5] bg-cream/80 backdrop-blur-sm">
        <MarqueeStrip />
        <section className="relative py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="flex items-end justify-between gap-8 mb-12">
              <SectionHeader
                eyebrow={`Shipping / ${experiments.length.toString().padStart(2, '0')}`}
                title="what people are shipping."
                description="actual builds from actual humans. fork freely. each one is open source, contributor-credited, and runs in your browser tab."
              />
              <Link
                href="/experiments"
                className="hidden sm:inline-flex font-mono text-[11px] uppercase tracking-[0.22em] text-jet/60 hover:text-accent transition-colors whitespace-nowrap pb-2"
              >
                View all →
              </Link>
            </div>

            <ExperimentCarousel experiments={experiments} />
          </div>
        </section>

        <section className="relative py-24 lg:py-32 border-t border-jet/10">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="flex items-end justify-between gap-8 mb-12">
              <SectionHeader
                eyebrow="Crew"
                title="built by humans."
                description="shipit.fun is open. anyone can ship. everyone gets credited."
              />
              <Link
                href="/contributors"
                className="hidden sm:inline-flex font-mono text-[11px] uppercase tracking-[0.22em] text-jet/60 hover:text-accent transition-colors whitespace-nowrap pb-2"
              >
                All crew →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {contributors.map((c, i) => (
                <ContributorCard key={c.handle} contributor={c} index={i} />
              ))}
            </div>
          </div>
        </section>

        <BuiltWith />

        <section className="relative py-20 lg:py-24 border-t border-jet/10">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <SectionHeader
              eyebrow="Stickers / vol. 01"
              title="the patch collection."
              description="weird little sprites that show up on cassettes, profile pages, and stickers. fork mine, i'll fork yours."
            />
            <div className="mt-10">
              <StickerScatter />
            </div>
          </div>
        </section>

        <section className="relative py-24 lg:py-32 border-t border-jet/10">
          <div className="max-w-4xl mx-auto px-6 lg:px-10 text-center">
            <SectionHeader
              align="center"
              eyebrow="Open call"
              title="ship something weird."
              description="if you build interactive web stuff, you belong here. open a PR, get credited, fork what others started."
            />
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <GradientButton
                href="https://github.com/irsaliendraDF/ShipIt/blob/main/CONTRIBUTING.md"
                target="_blank"
              >
                ▶ Contributor Guide
              </GradientButton>
              <GradientButton href="/about">About shipit.fun</GradientButton>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
