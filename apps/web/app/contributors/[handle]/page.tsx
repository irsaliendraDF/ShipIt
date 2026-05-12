import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@shipit-fun/ui';
import { ExperimentsGrid } from '@/components/ExperimentsGrid';
import { SectionHeader } from '@/components/SectionHeader';
import { GradientButton } from '@/components/ui/gradient-button';
import { contributors, getContributor } from '@/data/contributors';
import {
  getExperimentsByContributor,
  type Experiment,
  type ExperimentTag,
} from '@/data/experiments';

type Props = { params: { handle: string } };

export function generateStaticParams() {
  return contributors.map((c) => ({ handle: c.handle }));
}

export function generateMetadata({ params }: Props) {
  const c = getContributor(params.handle);
  if (!c) return { title: 'Not found' };
  return {
    title: `${c.name}. shipit.fun`,
    description: c.bio,
  };
}

function tagFrequencies(works: Experiment[]): Array<{ tag: ExperimentTag; count: number }> {
  const counts = new Map<ExperimentTag, number>();
  for (const w of works) {
    for (const t of w.tags) {
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

function uniqueToolkit(works: Experiment[]): string[] {
  const set = new Set<string>();
  for (const w of works) for (const t of w.tech) set.add(t);
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

function activeSince(works: Experiment[]): string | null {
  const dates = works.map((w) => w.createdAt).filter((d): d is string => Boolean(d));
  if (dates.length === 0) return null;
  const sorted = [...dates].sort();
  const earliest = sorted[0]!;
  return earliest.slice(0, 7).replace('-', '.');
}

export default function ContributorPage({ params }: Props) {
  const contributor = getContributor(params.handle);
  if (!contributor) notFound();

  const works = getExperimentsByContributor(contributor.handle);
  const initial = contributor.name.slice(0, 1).toUpperCase();
  const liveCount = works.filter((w) => w.status === 'live').length;
  const wipCount = works.filter((w) => w.status === 'wip').length;
  const specialties = tagFrequencies(works);
  const toolkit = uniqueToolkit(works);
  const since = activeSince(works);

  return (
    <div className="pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <Link
          href="/contributors"
          className="inline-flex font-mono text-[11px] uppercase tracking-[0.22em] text-jet/50 hover:text-accent transition-colors mb-8"
        >
          ← All crew
        </Link>

        {/* PLAYER PROFILE arcade cabinet */}
        <section className="relative bg-bg-elevated border border-jet/10 hud-corners overflow-hidden">
          <div className="absolute inset-0 border-grid opacity-30 pointer-events-none" />
          <div className="scanlines" aria-hidden="true" />
          <div
            className="absolute inset-0 pointer-events-none opacity-60"
            style={{
              background: `radial-gradient(ellipse at top right, ${contributor.avatarColor}1f, transparent 55%)`,
            }}
          />

          <div className="relative grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-12 p-8 lg:p-12">
            {/* Left: identity */}
            <div className="flex items-start gap-6 flex-wrap">
              <div
                className="w-28 h-28 flex items-center justify-center font-mono text-6xl font-bold text-jet shrink-0"
                style={{ background: contributor.avatarColor }}
              >
                {initial}
              </div>
              <div className="flex-1 min-w-[220px]">
                <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-warm mb-2">
                  // player_profile
                </p>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent mb-2">
                  @{contributor.handle}
                </p>
                <h1 className="font-mono font-bold text-4xl sm:text-5xl text-jet tracking-tight">
                  {contributor.name}
                </h1>
                <p className="mt-4 text-jet/65 text-base max-w-xl leading-relaxed">
                  {contributor.bio}
                </p>

                {contributor.links && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {contributor.links.site && (
                      <a
                        href={contributor.links.site}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-[11px] uppercase tracking-[0.22em] px-3 py-1.5 border border-jet/15 text-jet/70 hover:border-accent hover:text-accent transition-colors"
                      >
                        Website ↗
                      </a>
                    )}
                    {contributor.links.github && (
                      <a
                        href={contributor.links.github}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-[11px] uppercase tracking-[0.22em] px-3 py-1.5 border border-jet/15 text-jet/70 hover:border-warm hover:text-warm transition-colors"
                      >
                        GitHub ↗
                      </a>
                    )}
                    {contributor.links.twitter && (
                      <a
                        href={contributor.links.twitter}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-[11px] uppercase tracking-[0.22em] px-3 py-1.5 border border-jet/15 text-jet/70 hover:border-accent hover:text-accent transition-colors"
                      >
                        Twitter ↗
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right: stats panel */}
            <div className="border border-jet/10 bg-bg-deep/60 p-6 lg:p-7 self-start">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-warm mb-5">
                / / stats
              </p>
              <dl className="space-y-5">
                <div className="flex items-baseline justify-between gap-4 border-b border-jet/8 pb-4">
                  <dt className="font-mono text-[11px] uppercase tracking-[0.22em] text-jet/55">
                    Shipped
                  </dt>
                  <dd className="font-mono font-bold text-3xl text-accent text-glow tabular-nums">
                    {works.length.toString().padStart(2, '0')}
                  </dd>
                </div>
                <div className="grid grid-cols-2 gap-4 border-b border-jet/8 pb-4">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-jet/55">
                      Live
                    </p>
                    <p className="font-mono font-bold text-xl text-lime mt-1 tabular-nums">
                      {liveCount.toString().padStart(2, '0')}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-jet/55">
                      In progress
                    </p>
                    <p className="font-mono font-bold text-xl text-warm mt-1 tabular-nums">
                      {wipCount.toString().padStart(2, '0')}
                    </p>
                  </div>
                </div>
                <div className="flex items-baseline justify-between gap-4 border-b border-jet/8 pb-4">
                  <dt className="font-mono text-[11px] uppercase tracking-[0.22em] text-jet/55">
                    Specialties
                  </dt>
                  <dd className="font-mono font-bold text-xl text-jet tabular-nums">
                    {specialties.length.toString().padStart(2, '0')}
                  </dd>
                </div>
                {since && (
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="font-mono text-[11px] uppercase tracking-[0.22em] text-jet/55">
                      Active since
                    </dt>
                    <dd className="font-mono font-bold text-xl text-jet tabular-nums">
                      {since}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </section>

        {/* Specialties */}
        {specialties.length > 0 && (
          <section className="mt-20">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-warm mb-3">
              // specialties
            </p>
            <h2 className="font-mono font-bold text-2xl sm:text-3xl text-jet tracking-tight mb-6">
              What they work in.
            </h2>
            <div className="flex flex-wrap gap-2">
              {specialties.map(({ tag, count }) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] px-3 py-2 border border-jet/10 bg-bg-elevated text-jet/75 hover:border-accent/40 hover:text-accent transition-colors"
                >
                  <span>{tag}</span>
                  <span className="text-jet/35 font-bold">×{count}</span>
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Toolkit */}
        {toolkit.length > 0 && (
          <section className="mt-16">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-warm mb-3">
              // toolkit
            </p>
            <h2 className="font-mono font-bold text-2xl sm:text-3xl text-jet tracking-tight mb-6">
              On the workbench.
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {toolkit.map((t) => (
                <div
                  key={t}
                  className="font-mono text-xs px-3 py-2.5 bg-bg-elevated border border-jet/8 text-jet/70 hover:border-warm/40 hover:text-warm transition-colors flex items-center gap-2"
                >
                  <span className="text-warm/60">▸</span>
                  <span className="truncate">{t}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Active experiments */}
        <section className="mt-20">
          <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
            <SectionHeader
              eyebrow={`Roster / ${works.length.toString().padStart(2, '0')}`}
              title="Active experiments."
            />
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em]">
              {liveCount > 0 && (
                <Badge tone="live">{liveCount} live</Badge>
              )}
              {wipCount > 0 && <Badge tone="wip">{wipCount} wip</Badge>}
            </div>
          </div>
          {works.length > 0 ? (
            <ExperimentsGrid experiments={works} asymmetric={false} />
          ) : (
            <p className="text-jet/50 font-mono text-sm">No experiments yet. Stay tuned.</p>
          )}
        </section>

        {/* Bottom CTA */}
        <section className="mt-24 pt-12 border-t border-jet/8">
          <div className="bg-bg-elevated border border-jet/10 hud-corners hud-corners-warm relative p-8 lg:p-10 overflow-hidden">
            <div
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 80% 0%, rgba(255,122,61,0.15), transparent 60%)',
              }}
            />
            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-warm mb-2">
                  // open call
                </p>
                <h3 className="font-mono font-bold text-2xl text-jet tracking-tight">
                  ship alongside the crew.
                </h3>
                <p className="text-jet/65 mt-3 max-w-xl leading-relaxed">
                  shipit.fun is open. submit a PR, get credited, fork what others started.
                </p>
              </div>
              <GradientButton
                href="https://github.com/irsaliendraDF/ShipIt/blob/main/CONTRIBUTING.md"
                target="_blank"
                className="self-start lg:self-auto"
              >
                ▶ Contributor Guide
              </GradientButton>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
