import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { BrandSwitcher } from '@/components/BrandSwitcher';
import { GradientButton } from '@/components/ui/gradient-button';
import { ShipSprite, BuildSprite, SparkSprite, BoltSprite } from '@/components/build/Sprites';
import { IntakeForm } from '@/components/build/IntakeForm';
import { TEMPLATE_REGISTRY } from '@/components/build/templates';
import { catalog, getCatalogTool, type CatalogSprite } from '@/data/catalog';

const BOOK_A_CALL_URL = 'https://cal.com/irene-shipit-build';

export function generateStaticParams() {
  return Object.keys(TEMPLATE_REGISTRY).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const tool = getCatalogTool(params.slug);
  if (!tool) return { title: 'preview not found · shipit.build' };
  return {
    title: `${tool.name} preview · shipit.build`,
    description: `live preview of the ${tool.name} template. white-labeled and customized for your business in 2 days.`,
  };
}

function spriteFor(name: CatalogSprite, size = 22) {
  if (name === 'SHIP') return <ShipSprite size={size} />;
  if (name === 'BUILD') return <BuildSprite size={size} />;
  if (name === 'SPARK') return <SparkSprite size={size} />;
  return <BoltSprite size={size} />;
}

export default function PreviewPage({ params }: { params: { slug: string } }) {
  const tool = getCatalogTool(params.slug);
  const Template = TEMPLATE_REGISTRY[params.slug];
  if (!tool || !Template) notFound();

  return (
    <div className="bg-offwhite text-jet min-h-screen">
      {/* NAV */}
      <header className="sticky top-0 z-40 bg-offwhite/85 backdrop-blur-md border-b border-jet/8">
        <div className="max-w-[1080px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-shrink-0">
            <BrandSwitcher />
            <Link href="/build" className="flex items-center gap-2.5">
              <ShipSprite size={24} />
              <span className="font-sans font-semibold text-jet text-[17px]">shipit.build</span>
            </Link>
          </div>
          <nav className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/build#catalog"
              className="hidden sm:inline-flex items-center gap-1.5 font-sans text-[14px] text-jet/70 hover:text-purple transition-colors px-2 py-2"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              back to catalog
            </Link>
            <GradientButton
              size="sm"
              variant="build"
              href={BOOK_A_CALL_URL}
              target="_blank"
              ariaLabel="Book a call"
            >
              Book a call
            </GradientButton>
          </nav>
        </div>
      </header>

      {/* PREVIEW BANNER */}
      <section
        className="relative overflow-hidden border-b border-jet/8"
        style={{
          background: 'linear-gradient(135deg, #faf7f0 0%, rgba(139, 92, 246, 0.10) 100%)',
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -right-16 w-[180px] h-[180px] rounded-full"
          style={{ background: 'rgba(139, 92, 246, 0.18)', filter: 'blur(40px)' }}
        />
        <div className="relative max-w-[1080px] mx-auto px-6 py-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
          <div>
            <p className="font-pixel text-[10px] uppercase text-purple tracking-[0.22em]">
              · LIVE PREVIEW ·
            </p>
            <div className="mt-3 flex items-center gap-3">
              {spriteFor(tool.sprite, 28)}
              <h1 className="font-display italic text-[34px] sm:text-[40px] text-jet leading-none">
                {tool.name}
              </h1>
            </div>
            <p className="mt-3 font-sans text-[15px] text-jet/70 max-w-[640px] leading-relaxed">
              {tool.description}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="font-pixel text-[10px] uppercase bg-jet text-cream rounded-full px-3 py-1.5 tracking-[0.1em]">
              CAD ${tool.price}
            </span>
            <span className="font-pixel text-[10px] uppercase bg-purple text-cream rounded-full px-3 py-1.5 tracking-[0.1em]">
              2-day ship
            </span>
          </div>
        </div>
      </section>

      {/* THE TEMPLATE */}
      <section className="py-14 sm:py-20">
        <div className="max-w-[1080px] mx-auto px-6">
          <div
            className="relative border-2 border-dashed border-jet/30 rounded-2xl bg-white px-6 py-10 sm:px-10 sm:py-14"
            style={{ boxShadow: '0 2px 0 rgba(26,26,26,0.04)' }}
          >
            <span className="absolute -top-3 left-6 inline-flex items-center gap-1.5 bg-jet text-cream font-pixel text-[9px] uppercase tracking-[0.22em] rounded-full px-3 py-1.5">
              ▾ DEMO TEMPLATE
            </span>
            <span className="absolute -top-3 right-6 inline-flex items-center gap-1.5 bg-cream text-jet/60 border border-jet/15 font-pixel text-[9px] uppercase tracking-[0.18em] rounded-full px-3 py-1.5">
              unbranded preview
            </span>
            <Template />
          </div>
        </div>
      </section>

      {/* WHAT YOU SEE / WHAT YOU GET */}
      <section className="py-10 border-t border-jet/8 bg-offwhite">
        <div className="max-w-[680px] mx-auto px-6">
          <div
            className="relative rounded-2xl border border-purple/30 px-6 py-6 sm:px-8 sm:py-7 text-center"
            style={{
              background:
                'linear-gradient(135deg, #ffffff 0%, rgba(139,92,246,0.10) 100%)',
              boxShadow:
                '0 0 32px rgba(139, 92, 246, 0.28), 0 0 64px rgba(139, 92, 246, 0.16), 0 2px 0 rgba(139, 92, 246, 0.08)',
            }}
          >
            <p className="font-pixel text-[10px] uppercase text-deep-purple tracking-[0.18em]">
              WHAT YOU&apos;RE LOOKING AT
            </p>
            <h2 className="mt-2 font-display italic text-[22px] sm:text-[26px] text-jet leading-tight">
              this is the working template. yours arrives branded.
            </h2>
            <p className="mt-3 font-sans text-[15px] text-jet/75 leading-relaxed">
              everything above is real, interactive code. fill the form below with your
              colors, logo, and content, and we ship the white-labeled version on your
              domain in 2 days.
            </p>
          </div>
        </div>
      </section>

      {/* CUSTOMIZE FORM */}
      <section id="customize" className="py-16 lg:py-24 border-t border-jet/8 scroll-mt-20">
        <div className="max-w-[1080px] mx-auto px-6">
          <p className="font-pixel text-[11px] uppercase text-purple tracking-[0.18em]">
            CUSTOMIZE THIS TEMPLATE
          </p>
          <h2 className="mt-4 font-display font-normal text-jet text-[28px] sm:text-[32px] leading-[1.15] max-w-[820px]">
            tell us about your business and we&apos;ll ship the branded version.
          </h2>
          <p className="mt-5 font-sans text-[17px] text-jet/70 leading-relaxed max-w-[560px]">
            90 seconds. quote and contract back within 24 hours. {tool.name.toLowerCase()} ships
            2 days after contract signed.
          </p>

          <div className="mt-10">
            <IntakeForm />
          </div>
        </div>
      </section>

      {/* OTHER TOOLS */}
      <section className="py-12 border-t border-jet/8 bg-offwhite">
        <div className="max-w-[1080px] mx-auto px-6">
          <p className="font-pixel text-[10px] uppercase text-purple tracking-[0.18em] text-center">
            OTHER TEMPLATES YOU CAN PREVIEW
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {catalog
              .filter((t) => t.hasPreview && t.slug !== tool.slug)
              .map((t) => (
                <Link
                  key={t.slug}
                  href={`/build/preview/${t.slug}`}
                  className="inline-flex items-center gap-2 bg-white border border-purple/25 rounded-full px-4 py-2 font-sans text-[14px] text-jet hover:border-purple hover:text-purple transition-colors"
                >
                  {spriteFor(t.sprite, 16)}
                  {t.name}
                </Link>
              ))}
          </div>
          <p className="mt-6 text-center">
            <Link
              href="/build#catalog"
              className="font-sans text-[14px] text-jet/65 hover:text-purple transition-colors"
            >
              ← see the full catalog
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
