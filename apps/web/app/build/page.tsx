import type { Metadata } from 'next';
import Link from 'next/link';
import { ShipSprite, BuildSprite, SparkSprite, BoltSprite } from '@/components/build/Sprites';
import { ShippingLabel } from '@/components/build/ShippingLabel';
import { IntakeForm } from '@/components/build/IntakeForm';

// TODO: replace with real Cal.com URL
const BOOK_A_CALL_URL = 'https://cal.com/irene-shipit-build';

export const metadata: Metadata = {
  title: 'shipit.build, custom vibe-coded tools for service businesses',
  description:
    'productized, white-label, vibe-coded tools shipped in weeks. snack, meal, or feast pricing tiers. fixed scope. no surprise invoices.',
  openGraph: {
    title: 'shipit.build',
    description:
      'the tool your clients keep asking for, shipped by tuesday.',
    type: 'website',
    images: ['/og-image.png'],
  },
};

// Section 6 example tools
const exampleTools: { title: string; description: string; sprite: 'BUILD' | 'SPARK' | 'SHIP' }[] = [
  {
    title: 'intake forms',
    description:
      'branded forms with conditional logic, smart routing, and your visual identity.',
    sprite: 'BUILD',
  },
  {
    title: 'client assessments',
    description:
      'quizzes, diagnostics, and assessments with results pages and email capture.',
    sprite: 'SPARK',
  },
  {
    title: 'custom dashboards',
    description:
      'lightweight CRM-style dashboards for tracking what your clients actually care about.',
    sprite: 'BUILD',
  },
  {
    title: 'AI assistants',
    description:
      "custom AI assistants tuned to your voice, your data, and your client's needs.",
    sprite: 'SHIP',
  },
  {
    title: 'pipeline visualizers',
    description:
      'visual tools for coaches and consultants to show clients where they are.',
    sprite: 'SPARK',
  },
  {
    title: 'onboarding flows',
    description: 'branded multi-step onboarding for SMBs and service businesses.',
    sprite: 'BUILD',
  },
  {
    title: 'lead magnets',
    description:
      'interactive lead-gen tools that capture better leads than a PDF download.',
    sprite: 'SPARK',
  },
  {
    title: 'client portals',
    description: 'simple shared spaces for project files, updates, and deliverables.',
    sprite: 'SHIP',
  },
];

function ToolSprite({ name }: { name: 'BUILD' | 'SPARK' | 'SHIP' }) {
  if (name === 'BUILD') return <BuildSprite size={20} />;
  if (name === 'SPARK') return <SparkSprite size={20} />;
  return <ShipSprite size={20} />;
}

export default function BuildHomePage() {
  return (
    <div id="top" className="bg-offwhite text-jet min-h-screen scroll-smooth">
      {/* SECTION 1 — NAV */}
      <header className="sticky top-8 z-40 bg-offwhite/85 backdrop-blur-md border-b border-jet/8">
        <div className="max-w-[1080px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <a href="#top" className="flex items-center gap-2.5 flex-shrink-0">
            <ShipSprite size={24} />
            <span className="font-sans font-semibold text-jet text-[17px]">shipit.build</span>
          </a>
          <nav className="flex items-center gap-2 sm:gap-4">
            <a
              href="#about"
              className="hidden sm:inline-flex font-sans text-[15px] text-jet hover:text-purple transition-colors px-3 py-2"
            >
              about
            </a>
            <a
              href={BOOK_A_CALL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-sans font-semibold text-[15px] bg-jet text-cream rounded-full px-5 py-2.5 hover:-translate-y-[1px] hover:shadow-[0_4px_0_rgba(26,26,26,0.15)] transition-all"
            >
              book a call
            </a>
          </nav>
        </div>
      </header>

      {/* SECTION 2 — HERO */}
      <section
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #faf7f0 0%, rgba(139, 92, 246, 0.08) 100%)',
          minHeight: '90vh',
        }}
      >
        {/* decorative blurred circles */}
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
            the tool your clients keep asking for,
            <br />
            <span className="italic">shipped by tuesday.</span>
          </h1>

          <p className="mt-6 font-sans text-[17px] lg:text-[19px] text-jet/70 leading-relaxed max-w-[640px]">
            shipit.build delivers custom, white-label, vibe-coded tools for service businesses
            who can&apos;t justify a full engineering hire. fixed scope. fixed price. shipped
            fast.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row gap-3 sm:items-center">
            <a
              href={BOOK_A_CALL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center font-sans font-semibold text-[16px] bg-jet text-cream rounded-full px-6 py-3.5 hover:-translate-y-[1px] hover:shadow-[0_4px_0_rgba(26,26,26,0.15)] transition-all"
            >
              book a discovery call
            </a>
            <a
              href="#intake"
              className="inline-flex items-center justify-center font-sans font-semibold text-[16px] bg-transparent text-purple border border-purple rounded-full px-[23px] py-[13px] hover:bg-purple/10 transition-colors"
            >
              tell me about your tool problem
            </a>
          </div>

          {/* decorative BUILD sprite accent, bottom-right of hero */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute bottom-12 right-6"
            style={{ transform: 'rotate(6deg)' }}
          >
            <div className="relative">
              <div
                className="absolute"
                style={{
                  top: '8px',
                  left: '8px',
                  opacity: 0.25,
                }}
              >
                <BuildSprite size={48} />
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'rgba(139, 92, 246, 0.85)',
                    mixBlendMode: 'multiply',
                  }}
                />
              </div>
              <BuildSprite size={48} />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — THE PROBLEM */}
      <section className="py-16 lg:py-24">
        <div className="max-w-[1080px] mx-auto px-6">
          <p className="font-pixel text-[11px] uppercase text-purple tracking-[0.18em]">
            SOUND FAMILIAR?
          </p>
          <h2 className="mt-4 font-display font-normal text-jet text-[28px] sm:text-[32px] leading-[1.15] max-w-[820px]">
            your clients keep asking for the same tool. you keep saying &ldquo;i&apos;ll get
            to it.&rdquo;
          </h2>

          <div className="mt-12 space-y-5 font-sans text-[17px] text-jet/75 leading-relaxed max-w-[580px]">
            <p>
              you&apos;ve sent the same Typeform link to the last six clients. you know they
              need something better. you also know you don&apos;t have time to learn React,
              hire a developer, or pay a $40K agency retainer.
            </p>
            <p>
              meanwhile the tool stays a Typeform. or a spreadsheet. or a thing you do
              manually every wednesday.
            </p>
            <p>
              shipit.build is the third option. vibe-coded, white-labeled, fixed-price, and
              shipped in weeks not quarters.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 4 — HOW IT WORKS */}
      <section className="py-16 lg:py-24 bg-offwhite border-t border-jet/8">
        <div className="max-w-[1080px] mx-auto px-6">
          <p className="font-pixel text-[11px] uppercase text-orange tracking-[0.18em]">
            THE PROCESS
          </p>
          <h2 className="mt-4 font-display font-normal text-jet text-[32px] sm:text-[36px] leading-[1.15] max-w-[820px]">
            three steps, three weeks, one tool you actually own.
          </h2>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
            <ShippingLabel
              tier="01"
              labelHeader="STEP 01 · INTAKE"
              title="you tell me what your clients keep asking for"
              body="30-minute discovery call. we scope the tool, agree on a tier, and lock the timeline. you get a fixed quote within 48 hours."
              sprite={<SparkSprite size={20} />}
            />
            <ShippingLabel
              tier="02"
              labelHeader="STEP 02 · BUILD"
              title="i vibe-code it in your branding"
              body='you get progress updates twice a week. you see the build live as it takes shape. no surprises, no scope creep, no "per-hour" billing.'
              sprite={<BuildSprite size={20} />}
            />
            <ShippingLabel
              tier="03"
              labelHeader="STEP 03 · SHIP"
              title="it ships, you own it, your clients use it"
              body="deployed to your domain (or yours-on-mine if you prefer). full code handed over. 30-day support window included. fork it, extend it, do whatever you want with it."
              sprite={<ShipSprite size={20} />}
            />
          </div>
        </div>
      </section>

      {/* SECTION 5 — PRICING MANIFEST */}
      <section className="py-16 lg:py-24 border-t border-jet/8">
        <div className="max-w-[1080px] mx-auto px-6">
          <p className="font-pixel text-[11px] uppercase text-purple tracking-[0.18em]">
            THE MANIFEST
          </p>
          <h2 className="mt-4 font-display font-normal text-jet text-[32px] sm:text-[36px] leading-[1.15] max-w-[820px]">
            three tiers. fixed prices. no &ldquo;depends on scope.&rdquo;
          </h2>
          <p className="mt-6 font-sans text-[17px] text-jet/70 leading-relaxed max-w-[640px]">
            pick the tier that matches what your clients need. if you&apos;re between tiers,
            we&apos;ll figure it out on the call.
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
            <ShippingLabel
              size="lg"
              tier="01"
              labelHeader="TIER 01 · SNACK · CAD $1,500"
              title="the quick widget"
              oneLiner="single-feature tool, one user flow, ships in a week."
              bullets={[
                'one specific tool',
                'one user flow',
                'light branding (your colors, your logo)',
                '1-week turnaround from kickoff',
                '30-day support window',
              ]}
              example="a branded intake form with conditional logic."
              cta={{ href: BOOK_A_CALL_URL, label: 'book a call →' }}
              sprite={<SparkSprite size={20} />}
            />
            <ShippingLabel
              size="lg"
              tier="02"
              labelHeader="TIER 02 · MEAL · CAD $3,500"
              title="the full feature"
              oneLiner="multi-step tool, 2-3 features, ships in two weeks."
              bullets={[
                '2-3 features in one tool',
                'multiple user flows or states',
                'full branding (your design system, your domain)',
                '2-week turnaround from kickoff',
                '30-day support window',
              ]}
              example="a client-facing assessment tool with results dashboard."
              cta={{ href: BOOK_A_CALL_URL, label: 'book a call →' }}
              sprite={<BuildSprite size={20} />}
              pill={{ label: 'MOST POPULAR' }}
            />
            <ShippingLabel
              size="lg"
              tier="03"
              labelHeader="TIER 03 · FEAST · CAD $7,500+"
              title="the whole production"
              oneLiner="multi-flow custom build, 4-week turnaround."
              bullets={[
                'multi-flow custom build',
                'full feature set we scope together',
                'full branding + deployment to your domain',
                '4-week turnaround from kickoff',
                '30-day support window plus 60 days of bug fixes',
              ]}
              example="a lightweight CRM dashboard with custom reporting."
              cta={{ href: BOOK_A_CALL_URL, label: 'book a call →' }}
              sprite={<ShipSprite size={20} />}
            />
          </div>

          <p className="mt-10 text-center font-sans italic text-[13px] text-jet/60">
            all prices in CAD. all builds white-labeled. all code yours when we ship. all
            tiers exploratory, we&apos;ll lock final pricing after the first cohort of
            clients.
          </p>
        </div>
      </section>

      {/* SECTION 6 — EXAMPLE TOOLS */}
      <section className="py-16 lg:py-24 bg-offwhite border-t border-jet/8">
        <div className="max-w-[1080px] mx-auto px-6">
          <p className="font-pixel text-[11px] uppercase text-orange tracking-[0.18em]">
            WHAT WE BUILD
          </p>
          <h2 className="mt-4 font-display font-normal text-jet text-[32px] sm:text-[36px] leading-[1.15] max-w-[820px]">
            the kind of tools your clients keep asking for.
          </h2>
          <p className="mt-6 font-sans text-[17px] text-jet/70 leading-relaxed max-w-[600px]">
            not an exhaustive list. if your tool problem isn&apos;t here, it probably still
            fits. book a call.
          </p>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {exampleTools.map((tool) => (
              <div
                key={tool.title}
                className="bg-offwhite border border-jet/10 rounded-[12px] p-[14px] min-h-[160px] flex flex-col gap-2 hover:border-purple/40 transition-colors"
              >
                <div className="flex-shrink-0">
                  <ToolSprite name={tool.sprite} />
                </div>
                <h3 className="font-display text-[18px] text-jet leading-tight mt-1">
                  {tool.title}
                </h3>
                <p className="font-sans text-[13px] text-jet/70 leading-relaxed">
                  {tool.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7 — WHAT THIS IS NOT */}
      <section className="py-16 lg:py-24 border-t border-jet/8">
        <div className="max-w-[1080px] mx-auto px-6">
          <p className="font-pixel text-[11px] uppercase text-purple tracking-[0.18em]">
            BEFORE YOU BOOK
          </p>
          <h2 className="mt-4 font-display font-normal text-jet text-[28px] sm:text-[32px] leading-[1.15] max-w-[820px]">
            we should agree on what shipit.build isn&apos;t.
          </h2>

          <ul className="mt-10 space-y-5 font-sans text-[17px] text-jet/80 leading-relaxed max-w-[820px]">
            <li className="flex items-start gap-3">
              <span aria-hidden="true" className="text-orange font-semibold flex-shrink-0 mt-[2px]">
                ×
              </span>
              <span>
                <strong className="text-jet font-semibold">not a no-code platform.</strong>{' '}
                we use code. real code. you get the code when we ship.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span aria-hidden="true" className="text-orange font-semibold flex-shrink-0 mt-[2px]">
                ×
              </span>
              <span>
                <strong className="text-jet font-semibold">not a SaaS product.</strong> we
                don&apos;t sell subscriptions. we build the tool and you own it.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span aria-hidden="true" className="text-orange font-semibold flex-shrink-0 mt-[2px]">
                ×
              </span>
              <span>
                <strong className="text-jet font-semibold">not a marketplace.</strong>{' '}
                there&apos;s no other builders here. it&apos;s me. you talk to me. i build it.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span aria-hidden="true" className="text-orange font-semibold flex-shrink-0 mt-[2px]">
                ×
              </span>
              <span>
                <strong className="text-jet font-semibold">not a freelance gig.</strong>{' '}
                fixed scope, fixed price, fixed timeline. no per-hour billing, no scope
                creep, no &ldquo;depends.&rdquo;
              </span>
            </li>
          </ul>

          <p className="mt-10 font-sans italic text-[17px] text-jet leading-relaxed max-w-[820px]">
            it&apos;s a productized service. that&apos;s the whole thing.
          </p>
        </div>
      </section>

      {/* SECTION 8 — ABOUT */}
      <section id="about" className="py-16 lg:py-24 bg-offwhite border-t border-jet/8">
        <div className="max-w-[1080px] mx-auto px-6">
          <p className="font-pixel text-[11px] uppercase text-orange tracking-[0.18em]">
            WHO BUILDS THIS
          </p>
          <h2 className="mt-4 font-display font-normal text-jet text-[28px] sm:text-[32px] leading-[1.15] max-w-[820px]">
            built by irene.
          </h2>

          <div className="mt-10 space-y-5 font-sans text-[17px] text-jet/85 leading-relaxed max-w-[620px]">
            <p>
              hi. i&apos;m irene. i&apos;m based in halifax, nova scotia, and i&apos;ve spent
              the last decade-plus in sales operations and CRM strategy. somewhere along the
              way, vibe coding became a thing, and suddenly the gap between &ldquo;my client
              needs a tool&rdquo; and &ldquo;there&apos;s a tool&rdquo; got really small.
            </p>
            <p>
              shipit.build is the productized version of that gap-closing. you tell me what
              your clients keep asking for. i build it. you white-label it and ship it to
              them. everyone wins, nobody hires a developer.
            </p>
            <p>
              i also run shipit.fun, the community side of this whole thing. that&apos;s where
              i build weird things for fun. shipit.build is where i build serious things for
              revenue. they share a brand family but operate independently.
            </p>
            <p>
              if any of this sounds like what you need, book a call. or fill the form below.
              either way, i read everything and reply within 24 hours.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 9 — INTAKE FORM */}
      <section id="intake" className="py-16 lg:py-24 border-t border-jet/8">
        <div className="max-w-[1080px] mx-auto px-6">
          <p className="font-pixel text-[11px] uppercase text-purple tracking-[0.18em]">
            OR JUST TELL ME
          </p>
          <h2 className="mt-4 font-display font-normal text-jet text-[28px] sm:text-[32px] leading-[1.15] max-w-[820px]">
            what&apos;s the tool your clients keep asking for?
          </h2>
          <p className="mt-6 font-sans text-[17px] text-jet/70 leading-relaxed max-w-[560px]">
            take 90 seconds. tell me as much or as little as you want. i&apos;ll reply within
            24 hours with next steps.
          </p>

          <div className="mt-12">
            <IntakeForm />
          </div>
        </div>
      </section>

      {/* SECTION 10 — FOOTER */}
      <footer className="bg-jet text-cream">
        <div className="max-w-[1080px] mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2.5">
              <ShipSprite size={32} />
              <span className="font-sans font-semibold text-cream text-[18px]">
                shipit.build
              </span>
            </div>
            <p className="mt-4 font-sans text-[13px] text-cream/50">© 2026 ShipIt!</p>
          </div>

          <div>
            <p className="font-pixel text-[9px] uppercase text-orange tracking-[0.18em]">
              family
            </p>
            <ul className="mt-4 space-y-2">
              <li>
                <a
                  href="https://shipit.fun"
                  className="font-sans text-[14px] text-cream hover:text-bubblegum transition-colors"
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
                  className="font-sans text-[14px] text-cream hover:text-bubblegum transition-colors"
                >
                  linkedin →
                </a>
              </li>
              <li>
                {/* TODO: confirm real contact email for footer */}
                <a
                  href="mailto:irene@digitalflowconsulting.ca"
                  className="font-sans text-[14px] text-cream hover:text-bubblegum transition-colors"
                >
                  email →
                </a>
              </li>
              <li>
                <a
                  href={BOOK_A_CALL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-sans text-[14px] text-cream hover:text-bubblegum transition-colors"
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
