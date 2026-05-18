import type { Metadata } from 'next';
import { Code2, Box, User, Lock } from 'lucide-react';
import { ShipSprite, BuildSprite, SparkSprite, BoltSprite } from '@/components/build/Sprites';
import { ShippingLabel } from '@/components/build/ShippingLabel';
import { IntakeForm } from '@/components/build/IntakeForm';
import { BrandSwitcher } from '@/components/BrandSwitcher';
import { GradientButton } from '@/components/ui/gradient-button';
import {
  catalog,
  catalogByCategory,
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  type CatalogSprite,
  type CatalogTool,
} from '@/data/catalog';

// TODO: replace with real Cal.com URL
const BOOK_A_CALL_URL = 'https://cal.com/irene-shipit-build';

export const metadata: Metadata = {
  title: 'shipit.build, catalog of white-label vibe-coded tools for service businesses',
  description:
    'browse 12 pre-built tools (quizzes, knowledge games, frameworks, workshop activities) ready to be white-labeled and shipped in 2 days. fixed prices, no engineering hire required.',
  openGraph: {
    title: 'shipit.build',
    description: 'pick a tool. brand it. ship in two days.',
    type: 'website',
    images: ['/og-image.png'],
  },
};

function spriteFor(name: CatalogSprite, size = 18) {
  if (name === 'SHIP') return <ShipSprite size={size} />;
  if (name === 'BUILD') return <BuildSprite size={size} />;
  if (name === 'SPARK') return <SparkSprite size={size} />;
  return <BoltSprite size={size} />;
}

function CatalogCard({ tool }: { tool: CatalogTool }) {
  // Tools with an interactive template route to the preview page.
  // Others jump to the pick-a-tool form with ?tool=slug pre-selected.
  const href = tool.hasPreview
    ? `/build/preview/${tool.slug}`
    : `?tool=${tool.slug}#pick-a-tool`;
  return (
    <a
      href={href}
      className="group relative flex flex-col border border-purple/25 rounded-2xl p-5 min-h-[200px] hover:-translate-y-[3px] hover:border-purple/60 transition-all duration-200"
      style={{
        background:
          'linear-gradient(135deg, #ffffff 0%, rgba(139, 92, 246, 0.08) 100%)',
        boxShadow: '0 2px 0 rgba(139, 92, 246, 0.06)',
      }}
    >
      {tool.hasPreview && (
        <span className="absolute -top-2 -right-2 inline-flex items-center gap-1 font-pixel text-[8px] uppercase tracking-[0.18em] bg-purple text-cream rounded-full px-2.5 py-1">
          ▶ try it
        </span>
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-shrink-0">{spriteFor(tool.sprite)}</div>
        <span className="inline-flex items-center font-pixel text-[9px] uppercase tracking-[0.1em] bg-jet text-cream rounded-full px-2.5 py-1">
          CAD ${tool.price}
        </span>
      </div>
      <h3 className="mt-4 font-display text-[22px] font-normal text-jet leading-tight">
        {tool.name}
      </h3>
      <p className="mt-2 font-sans text-[14px] text-jet/70 leading-[1.45] flex-1">
        {tool.description}
      </p>
      <span className="mt-4 font-sans text-[13px] font-semibold text-purple group-hover:text-jet transition-colors self-end">
        {tool.hasPreview ? 'preview →' : 'pick this →'}
      </span>
    </a>
  );
}

export default function BuildHomePage() {
  const grouped = catalogByCategory();

  return (
    <div id="top" className="bg-offwhite text-jet min-h-screen scroll-smooth">
      {/* NAV */}
      <header className="sticky top-0 z-40 bg-offwhite/85 backdrop-blur-md border-b border-jet/8">
        <div className="max-w-[1080px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-shrink-0">
            <BrandSwitcher />
            <a href="#top" className="flex items-center gap-2.5">
              <ShipSprite size={24} />
              <span className="font-sans font-semibold text-jet text-[17px]">shipit.build</span>
            </a>
          </div>
          <nav className="flex items-center gap-2 sm:gap-4">
            <a
              href="#catalog"
              className="hidden sm:inline-flex font-sans text-[15px] text-jet hover:text-purple transition-colors px-3 py-2"
            >
              catalog
            </a>
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

      {/* HERO */}
      <section
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #faf7f0 0%, rgba(139, 92, 246, 0.08) 100%)',
          minHeight: '90vh',
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-20 w-[200px] h-[200px] rounded-full"
          style={{ background: 'rgba(139, 92, 246, 0.18)', filter: 'blur(40px)' }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -left-16 w-[140px] h-[140px] rounded-full"
          style={{ background: 'rgba(255, 122, 61, 0.22)', filter: 'blur(40px)' }}
        />

        <div className="relative max-w-[980px] mx-auto px-6 py-20 lg:py-0 lg:min-h-[90vh] flex flex-col justify-center">
          <p className="font-pixel text-[11px] uppercase text-orange tracking-[0.18em] leading-[1.2]">
            PRODUCTIZED VIBE-CODED TOOLS
          </p>

          <h1 className="mt-4 font-display font-normal text-jet text-[38px] sm:text-[48px] lg:text-[60px] leading-[1.05]">
            pick a tool. brand it.
            <br />
            <span className="italic">ship in two days.</span>
          </h1>

          <p className="mt-6 font-sans text-[17px] lg:text-[19px] text-jet/70 leading-relaxed max-w-[660px]">
            shipit.build is a catalog of pre-built vibe-coded tools (quizzes, knowledge
            games, frameworks, workshop activities) ready to be white-labeled and delivered
            to your clients. fixed prices. fast turnarounds. no engineering hire required.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row gap-4 sm:items-center">
            <GradientButton size="lg" variant="build" href="#catalog">
              ▶ Browse the catalog
            </GradientButton>
            <GradientButton
              size="lg"
              variant="build"
              href={BOOK_A_CALL_URL}
              target="_blank"
            >
              Book a discovery call
            </GradientButton>
          </div>

          <div
            aria-hidden="true"
            className="hidden lg:block absolute bottom-12 right-6"
            style={{ transform: 'rotate(6deg)' }}
          >
            <BuildSprite size={48} />
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="py-16 lg:py-24">
        <div className="max-w-[1080px] mx-auto px-6">
          <p className="font-pixel text-[11px] uppercase text-purple tracking-[0.18em]">
            SOUND FAMILIAR?
          </p>
          <h2 className="mt-4 font-display font-normal text-jet text-[28px] sm:text-[32px] leading-[1.15] max-w-[820px]">
            your clients keep asking for the same tools. you keep saying &ldquo;i&apos;ll
            get to it.&rdquo;
          </h2>

          <div className="mt-12 space-y-5 font-sans text-[17px] text-jet/75 leading-relaxed max-w-[580px]">
            <p>
              you&apos;ve sent the same Typeform link to the last six clients. you know they
              want something better. you also know you don&apos;t have time to learn React,
              hire a developer, or pay a $40K agency retainer.
            </p>
            <p>
              meanwhile the tool stays a Typeform. or a spreadsheet. or a thing you do
              manually every wednesday.
            </p>
            <p>
              shipit.build is the third option. browse the catalog, pick a tool, send your
              branding, and we ship it in two days. white-labeled, fixed price, yours to
              keep.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — pick, brand, ship */}
      <section className="py-16 lg:py-24 bg-offwhite border-t border-jet/8">
        <div className="max-w-[1080px] mx-auto px-6">
          <p className="font-pixel text-[11px] uppercase text-orange tracking-[0.18em]">
            THE PROCESS
          </p>
          <h2 className="mt-4 font-display font-normal text-jet text-[32px] sm:text-[36px] leading-[1.15] max-w-[820px]">
            three steps, two days, one tool you actually own.
          </h2>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
            <ShippingLabel
              tier="01"
              labelHeader="STEP 01 · PICK"
              title="browse the catalog, pick the tool that fits"
              body="12 pre-built tools to choose from. interactive quizzes, knowledge games, spinning wheels, animated frameworks, workshop activities. pick one, or pick three for the bundle price."
              sprite={<SparkSprite size={20} />}
            />
            <ShippingLabel
              tier="02"
              labelHeader="STEP 02 · BRAND"
              title="send us your branding and content"
              body="your colors, fonts, logo, and the content that goes inside (questions, prompts, framework labels, prizes, whatever the tool needs). we sign a quick contract, you pay, we start."
              sprite={<BuildSprite size={20} />}
            />
            <ShippingLabel
              tier="03"
              labelHeader="STEP 03 · SHIP"
              title="your tool ships in 48 hours"
              body="live, deployed, branded, yours. drop it on your domain or use ours. 30-day support window. full code handed over. use it forever, fork it, extend it, do whatever."
              sprite={<ShipSprite size={20} />}
            />
          </div>
        </div>
      </section>

      {/* THE CATALOG — main attraction */}
      <section id="catalog" className="py-16 lg:py-24 border-t border-jet/8 scroll-mt-24">
        <div className="max-w-[1080px] mx-auto px-6">
          <p className="font-pixel text-[11px] uppercase text-purple tracking-[0.18em]">
            THE CATALOG
          </p>
          <h2 className="mt-4 font-display font-normal text-jet text-[32px] sm:text-[36px] leading-[1.15] max-w-[820px]">
            {catalog.length} tools. pick one. pick three. or subscribe.
          </h2>
          <p className="mt-6 font-sans text-[17px] text-jet/70 leading-relaxed max-w-[600px]">
            every tool is pre-built and ready to be white-labeled. tap any card to start the
            customization flow, or pick three and we&apos;ll bundle them.
          </p>

          <div className="mt-12 space-y-12">
            {CATEGORY_ORDER.map((cat) => {
              const tools = grouped[cat];
              if (!tools.length) return null;
              return (
                <div key={cat}>
                  <p className="font-pixel text-[10px] uppercase text-orange/70 tracking-[0.22em] text-center mb-6">
                    · {CATEGORY_LABEL[cat]} ·
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {tools.map((tool) => (
                      <CatalogCard key={tool.slug} tool={tool} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRICING — 4 options */}
      <section className="py-16 lg:py-24 bg-offwhite border-t border-jet/8">
        <div className="max-w-[1080px] mx-auto px-6">
          <p className="font-pixel text-[11px] uppercase text-orange tracking-[0.18em]">
            THE MANIFEST
          </p>
          <h2 className="mt-4 font-display font-normal text-jet text-[32px] sm:text-[36px] leading-[1.15] max-w-[820px]">
            four ways to buy. zero &ldquo;depends on scope.&rdquo;
          </h2>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5">
            <ShippingLabel
              size="lg"
              tier="01"
              labelHeader="OPTION 01 · SINGLE"
              title="pick one tool"
              oneLiner="priced per tool. simple, single, shipped. CAD $300–$750."
              bullets={[
                'one tool from the catalog',
                'fully branded and customized to your business',
                '2-day turnaround from kickoff',
                '30-day support window',
              ]}
              cta={{ href: '#catalog', label: 'browse catalog →' }}
              sprite={<SparkSprite size={20} />}
            />
            <ShippingLabel
              size="lg"
              tier="02"
              labelHeader="OPTION 02 · BUNDLE"
              title="pick any three tools"
              oneLiner="any 3 from the catalog. CAD $1,500 flat. no math."
              bullets={[
                'any 3 tools from the catalog',
                'fully branded and customized to your business',
                '2-day turnaround per tool, delivered sequentially',
                '30-day support window across all 3',
              ]}
              cta={{ href: '#pick-a-tool', label: 'start picking three →' }}
              sprite={<BuildSprite size={20} />}
              pill={{ label: 'MOST POPULAR' }}
            />
            <ShippingLabel
              size="lg"
              tier="03"
              labelHeader="OPTION 03 · SUBSCRIPTION"
              title="monthly catalog access"
              oneLiner="for agencies running multiple client engagements. CAD $300–$500/mo."
              bullets={[
                '1-2 new tools per month',
                'first dibs on new catalog additions',
                'flexible swap-in / swap-out month-to-month',
                'dedicated support throughout',
              ]}
              cta={{ href: BOOK_A_CALL_URL, label: 'talk subscription →' }}
              sprite={<BoltSprite size={20} />}
            />
            <ShippingLabel
              size="lg"
              tier="04"
              labelHeader="OPTION 04 · CUSTOM"
              title="something not in the catalog"
              oneLiner="for when nothing in the catalog quite fits. CAD $3,500+."
              bullets={[
                '10-day turnaround from kickoff',
                'scoped on the discovery call',
                'fully custom tool, your specifications',
                '30-day support, plus 60-day bug fix window',
              ]}
              cta={{ href: BOOK_A_CALL_URL, label: 'book to scope →' }}
              sprite={<ShipSprite size={20} />}
            />
          </div>

          <p className="mt-10 text-center font-sans italic text-[13px] text-jet/60">
            all prices in CAD. all builds white-labeled. all code yours when we ship.
            catalog and bundle pricing locked. subscription and custom pricing finalized on
            the discovery call.
          </p>
        </div>
      </section>

      {/* CUSTOM BUILDS — escape hatch */}
      <section className="py-16 lg:py-24 border-t border-jet/8">
        <div className="max-w-[1080px] mx-auto px-6">
          <p className="font-pixel text-[11px] uppercase text-purple tracking-[0.18em]">
            NOT IN THE CATALOG?
          </p>
          <h2 className="mt-4 font-display font-normal text-jet text-[28px] sm:text-[32px] leading-[1.15] max-w-[820px]">
            we&apos;ll build something custom in 10 days.
          </h2>

          <div className="mt-8 space-y-5 font-sans text-[17px] text-jet/80 leading-relaxed max-w-[620px]">
            <p>
              the catalog covers the most common tools service businesses ask for. but
              every now and then, a client needs something specific: a custom workflow, a
              particular integration, a tool with logic the catalog doesn&apos;t have.
            </p>
            <p>
              that&apos;s what the custom build tier is for. we hop on a discovery call,
              scope what you need, agree on a fixed price, and ship it in 10 days. same
              vibe-coded speed, same white-label delivery, same fixed-price model. just
              more bespoke.
            </p>
          </div>

          <div className="mt-8">
            <GradientButton
              size="lg"
              variant="build"
              href={BOOK_A_CALL_URL}
              target="_blank"
            >
              Book a discovery call →
            </GradientButton>
          </div>
        </div>
      </section>

      {/* WHAT THIS IS NOT */}
      <section className="py-12 lg:py-16">
        <div className="max-w-[820px] mx-auto px-6">
          <div
            className="border-2 border-purple/25 rounded-2xl p-6 lg:p-8"
            style={{
              background:
                'linear-gradient(135deg, #ffffff 0%, rgba(139, 92, 246, 0.08) 100%)',
              boxShadow: '0 2px 0 rgba(139, 92, 246, 0.06)',
            }}
          >
            <p className="font-pixel text-[10px] uppercase text-purple tracking-[0.18em]">
              BEFORE YOU BOOK
            </p>
            <h2 className="mt-2 font-display font-normal text-jet text-[22px] sm:text-[24px] leading-tight">
              we should agree on what shipit.build isn&apos;t.
            </h2>

            <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <li className="flex items-start gap-3">
                <Box className="w-5 h-5 text-purple flex-shrink-0 mt-[3px]" aria-hidden="true" />
                <div>
                  <p className="font-sans font-semibold text-[15px] text-jet leading-snug">
                    not a SaaS product
                  </p>
                  <p className="font-sans text-[13px] text-jet/65 mt-1 leading-snug">
                    no subscriptions to use a tool. the monthly tier delivers new tools.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Code2 className="w-5 h-5 text-purple flex-shrink-0 mt-[3px]" aria-hidden="true" />
                <div>
                  <p className="font-sans font-semibold text-[15px] text-jet leading-snug">
                    not a no-code platform
                  </p>
                  <p className="font-sans text-[13px] text-jet/65 mt-1 leading-snug">
                    real code, yours when we ship. fork it, host it wherever.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <User className="w-5 h-5 text-purple flex-shrink-0 mt-[3px]" aria-hidden="true" />
                <div>
                  <p className="font-sans font-semibold text-[15px] text-jet leading-snug">
                    not a marketplace
                  </p>
                  <p className="font-sans text-[13px] text-jet/65 mt-1 leading-snug">
                    no other builders. you talk to irene. irene builds it.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-purple flex-shrink-0 mt-[3px]" aria-hidden="true" />
                <div>
                  <p className="font-sans font-semibold text-[15px] text-jet leading-snug">
                    not a freelance gig
                  </p>
                  <p className="font-sans text-[13px] text-jet/65 mt-1 leading-snug">
                    fixed scope, price, timeline. no &ldquo;it depends.&rdquo;
                  </p>
                </div>
              </li>
            </ul>

            <p className="mt-7 pt-5 border-t border-purple/15 font-sans italic text-[14px] text-jet/75 leading-relaxed">
              it&apos;s a productized service with a catalog. that&apos;s the whole thing.
            </p>
          </div>
        </div>
      </section>

      {/* ABOUT — two-person crew (preserved per Irene's earlier direction) */}
      <section id="about" className="py-16 lg:py-24 bg-offwhite border-t border-jet/8">
        <div className="max-w-[1080px] mx-auto px-6">
          <p className="font-pixel text-[11px] uppercase text-orange tracking-[0.18em]">
            WHO BUILDS THIS
          </p>
          <h2 className="mt-4 font-display font-normal text-jet text-[28px] sm:text-[32px] leading-[1.15] max-w-[820px]">
            built by a two-person crew.
          </h2>
          <p className="mt-6 font-sans text-[17px] text-jet/70 leading-relaxed max-w-[620px]">
            small team, no agency. you talk to the people doing the work. based in halifax,
            nova scotia. shipping across canada.
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <article
              className="border border-purple/25 rounded-2xl p-6 lg:p-7"
              style={{
                background:
                  'linear-gradient(135deg, #ffffff 0%, rgba(139, 92, 246, 0.08) 100%)',
                boxShadow: '0 2px 0 rgba(139, 92, 246, 0.06)',
              }}
            >
              <div className="flex items-center gap-4">
                {/* TODO: replace with real headshot at /public/team/irene.jpg */}
                <div
                  className="w-20 h-20 rounded-full flex-shrink-0 flex items-center justify-center font-display text-[28px] text-cream"
                  style={{ background: '#8b5cf6' }}
                  aria-label="Irene headshot placeholder"
                >
                  IS
                </div>
                <div>
                  <h3 className="font-display text-[22px] text-jet leading-tight">irene saliendra</h3>
                  <p className="mt-1 font-pixel text-[9px] uppercase text-purple tracking-[0.18em]">
                    SALES · STRATEGY · BUILDS
                  </p>
                </div>
              </div>
              <p className="mt-5 font-sans text-[15px] text-jet/80 leading-relaxed">
                a decade-plus in sales operations and revenue strategy across atlantic
                canada. runs the discovery calls, scopes the tool, picks the catalog item,
                writes the code that ships. founder of DigitalFlow Consulting and
                shipit.fun.
              </p>
            </article>

            <article
              className="border border-purple/25 rounded-2xl p-6 lg:p-7"
              style={{
                background:
                  'linear-gradient(135deg, #ffffff 0%, rgba(139, 92, 246, 0.08) 100%)',
                boxShadow: '0 2px 0 rgba(139, 92, 246, 0.06)',
              }}
            >
              <div className="flex items-center gap-4">
                {/* TODO: replace with real headshot at /public/team/chido.jpg */}
                <div
                  className="w-20 h-20 rounded-full flex-shrink-0 flex items-center justify-center font-display text-[28px] text-cream"
                  style={{ background: '#a78bfa' }}
                  aria-label="Chido headshot placeholder"
                >
                  C
                </div>
                <div>
                  <h3 className="font-display text-[22px] text-jet leading-tight">chido</h3>
                  <p className="mt-1 font-pixel text-[9px] uppercase text-purple tracking-[0.18em]">
                    MARKETING · BRAND · STORY
                  </p>
                </div>
              </div>
              <p className="mt-5 font-sans text-[15px] text-jet/80 leading-relaxed">
                {/* TODO: replace placeholder bio with real copy from Chido */}
                shapes how shipit.build shows up in the world. runs brand, copy, and
                positioning for the tools we ship. makes sure the work feels like it came
                from a team, not a faceless studio.
              </p>
            </article>
          </div>

          <p className="mt-10 font-sans text-[16px] text-jet/75 leading-relaxed max-w-[620px]">
            if any of this sounds like what you need, browse the catalog, fill the form
            below, or book a call. we read everything and reply within 24 hours.
          </p>
        </div>
      </section>

      {/* PICK-A-TOOL FLOW */}
      <section id="pick-a-tool" className="py-16 lg:py-24 border-t border-jet/8 scroll-mt-24">
        <div className="max-w-[1080px] mx-auto px-6">
          <p className="font-pixel text-[11px] uppercase text-purple tracking-[0.18em]">
            LET&apos;S START
          </p>
          <h2 className="mt-4 font-display font-normal text-jet text-[28px] sm:text-[32px] leading-[1.15] max-w-[820px]">
            tell me what you&apos;re picking and i&apos;ll send a quote.
          </h2>
          <p className="mt-6 font-sans text-[17px] text-jet/70 leading-relaxed max-w-[560px]">
            90 seconds. quote and contract back within 24 hours. tool ships 2 days after
            contract signed.
          </p>

          <div className="mt-12">
            <IntakeForm />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-cream text-jet border-t border-jet/10">
        <div className="max-w-[1080px] mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2.5">
              <ShipSprite size={32} />
              <span className="font-sans font-semibold text-jet text-[18px]">shipit.build</span>
            </div>
            <p className="mt-4 font-sans text-[13px] text-jet/55">© 2026 ShipIt!</p>
          </div>

          <div>
            <p className="font-pixel text-[9px] uppercase text-orange tracking-[0.18em]">
              family
            </p>
            <ul className="mt-4 space-y-2">
              <li>
                <a
                  href="https://shipit.fun"
                  className="font-sans text-[14px] text-jet hover:text-orange transition-colors"
                >
                  shipit.fun →
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-pixel text-[9px] uppercase text-orange tracking-[0.18em]">
              find me
            </p>
            <ul className="mt-4 space-y-2">
              <li>
                {/* TODO: replace with real LinkedIn URL */}
                <a
                  href="https://www.linkedin.com/in/irenesaliendra"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-sans text-[14px] text-jet hover:text-orange transition-colors"
                >
                  linkedin →
                </a>
              </li>
              <li>
                {/* TODO: confirm real contact email for footer */}
                <a
                  href="mailto:irene@digitalflowconsulting.ca"
                  className="font-sans text-[14px] text-jet hover:text-orange transition-colors"
                >
                  email →
                </a>
              </li>
              <li>
                <a
                  href={BOOK_A_CALL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-sans text-[14px] text-jet hover:text-orange transition-colors"
                >
                  book a call →
                </a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
