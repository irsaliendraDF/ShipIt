import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@shipit-fun/ui';
import { ExperimentFrame } from '@/components/ExperimentFrame';
import { ExperimentsGrid } from '@/components/ExperimentsGrid';
import { SectionHeader } from '@/components/SectionHeader';
import { GradientButton } from '@/components/ui/gradient-button';
import {
  experiments,
  getExperiment,
  getRelatedExperiments,
  getRemixesOf,
} from '@/data/experiments';
import { getContributor } from '@/data/contributors';

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return experiments.map((e) => ({ slug: e.slug }));
}

export function generateMetadata({ params }: Props) {
  const exp = getExperiment(params.slug);
  if (!exp) return { title: 'Not found' };
  return {
    title: `${exp.title}. shipit.fun`,
    description: exp.description,
  };
}

export default function ExperimentPage({ params }: Props) {
  const exp = getExperiment(params.slug);
  if (!exp) notFound();

  const contributor = getContributor(exp.contributor);
  const related = getRelatedExperiments(exp.slug);
  const parent = exp.riffedFrom ? getExperiment(exp.riffedFrom) : undefined;
  const parentContributor = parent ? getContributor(parent.contributor) : undefined;
  const remixes = getRemixesOf(exp.slug);
  const accent = contributor?.avatarColor ?? '#ff6fb5';
  const initial = (contributor?.name ?? exp.contributor).slice(0, 1).toUpperCase();
  const statusTone = exp.status === 'live' ? 'live' : exp.status === 'wip' ? 'wip' : 'archived';
  // In-repo experiments live at games/<slug>. Externally-hosted ones don't.
  const sourceUrl = exp.externalUrl
    ? undefined
    : `https://github.com/irsaliendraDF/ShipIt/tree/main/games/${exp.slug}`;

  return (
    <div className="pt-24 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <Link
          href="/experiments"
          className="inline-flex font-mono text-[11px] uppercase tracking-[0.22em] text-jet/50 hover:text-accent transition-colors mb-8"
        >
          ← All experiments
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Badge tone={statusTone}>{exp.status}</Badge>
              {exp.tags.map((t) => (
                <Badge key={t} tone="tag">
                  {t}
                </Badge>
              ))}
            </div>
            {parent && (
              <Link
                href={`/experiments/${parent.slug}`}
                className="group inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full bg-bg-elevated border border-jet/10 hover:border-accent/50 transition-colors"
              >
                <span aria-hidden className="text-accent">🔀</span>
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-jet/70 group-hover:text-jet transition-colors">
                  a remix of{' '}
                  <span className="text-jet font-bold">{parent.title}</span>
                  {parentContributor && (
                    <> by @{parent.contributor}</>
                  )}
                </span>
              </Link>
            )}
            <h1 className="font-mono font-bold text-4xl sm:text-5xl text-jet tracking-tight">
              {exp.title}
            </h1>
            <p className="mt-4 text-jet/60 text-lg max-w-2xl leading-relaxed">
              {exp.description}
            </p>
          </div>
        </div>

        {exp.status === 'live' ? (
          <ExperimentFrame slug={exp.slug} title={exp.title} controls={exp.controls} tags={exp.tags} externalUrl={exp.externalUrl} />
        ) : (
          <div className="aspect-[16/9] w-full bg-bg-elevated border border-jet/10 flex items-center justify-center relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${accent}22, transparent 60%)`,
              }}
            />
            <div className="relative text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent mb-3">
                Status: work in progress
              </p>
              <p className="text-jet/60 text-sm max-w-md">
                This experiment is still cooking. Check back soon, or follow{' '}
                <a
                  href="https://github.com/irsaliendraDF/ShipIt"
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent hover:underline"
                >
                  the repo
                </a>{' '}
                for updates.
              </p>
            </div>
          </div>
        )}

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent mb-3">
                About this experiment
              </p>
              <p className="text-jet/70 leading-relaxed">{exp.description}</p>
              {exp.controls && (
                <p className="mt-4 text-jet/60 leading-relaxed">
                  <span className="font-mono text-xs text-jet/40 uppercase tracking-wider mr-2">
                    Controls:
                  </span>
                  {exp.controls}
                </p>
              )}
            </div>

            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent mb-3">
                Tech
              </p>
              <div className="flex flex-wrap gap-2">
                {exp.tech.map((t) => (
                  <span
                    key={t}
                    className="font-mono text-xs px-3 py-1.5 bg-bg-elevated border border-jet/10 text-jet/70"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {exp.github && (
              <GradientButton size="sm" href={exp.github} target="_blank">
                View source on GitHub ↗
              </GradientButton>
            )}
          </div>

          <aside>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent mb-4">
              Contributor
            </p>
            <Link
              href={`/contributors/${exp.contributor}`}
              className="block bg-bg-elevated border border-jet/10 hover:border-accent/40 p-5 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 flex items-center justify-center font-mono text-xl font-bold text-jet"
                  style={{ background: accent }}
                >
                  {initial}
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-jet/50">
                    @{exp.contributor}
                  </p>
                  <p className="font-mono font-bold text-jet group-hover:text-accent transition-colors">
                    {contributor?.name ?? exp.contributor}
                  </p>
                </div>
              </div>
              {contributor?.bio && (
                <p className="mt-4 text-sm text-jet/55 leading-relaxed line-clamp-3">
                  {contributor.bio}
                </p>
              )}
            </Link>
          </aside>
        </div>

        {/* Fork-this-experiment card: surfaces the "fork mine, i'll fork yours"
            promise and gives a direct entry point into the source code. */}
        {sourceUrl && (
          <div className="mt-20 pt-12 border-t border-jet/5">
            <div className="bg-bg-elevated border border-jet/10 p-7 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent mb-2">
                  🍴 Fork this experiment
                </p>
                <p className="font-mono font-bold text-jet text-lg leading-tight">
                  riff on it. credit it. ship your version.
                </p>
                <p className="mt-2 text-jet/65 text-sm leading-relaxed max-w-xl">
                  open the source on GitHub, copy{' '}
                  <code className="px-1.5 py-0.5 bg-jet/5 text-jet/80 text-[12px]">
                    games/{exp.slug}/
                  </code>{' '}
                  into your own folder, and add{' '}
                  <code className="px-1.5 py-0.5 bg-jet/5 text-jet/80 text-[12px]">
                    riffedFrom: &apos;{exp.slug}&apos;
                  </code>{' '}
                  to your experiment&apos;s entry. lineage will show on both
                  pages once your PR merges.
                </p>
              </div>
              <a
                href={sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-[0.18em] px-5 py-3 bg-jet text-cream rounded-md hover:bg-accent hover:text-jet transition-colors flex-shrink-0"
              >
                open source ↗
              </a>
            </div>
          </div>
        )}

        {remixes.length > 0 && (
          <div className="mt-20 pt-12 border-t border-jet/5">
            <SectionHeader
              eyebrow="🌳 Remixes"
              title="people who riffed on this."
              description="every entry below started from this one and went somewhere new."
            />
            <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {remixes.map((r) => {
                const remixContributor = getContributor(r.contributor);
                const remixAccent = remixContributor?.avatarColor ?? '#ff6fb5';
                const remixInitial = (remixContributor?.name ?? r.contributor)
                  .slice(0, 1)
                  .toUpperCase();
                return (
                  <li key={r.slug}>
                    <Link
                      href={`/experiments/${r.slug}`}
                      className="group block bg-bg-elevated border border-jet/10 hover:border-accent/40 p-5 transition-colors"
                    >
                      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-jet/45 mb-2">
                        🔀 remix
                      </p>
                      <h3 className="font-mono font-bold text-jet group-hover:text-accent transition-colors truncate">
                        {r.title}
                      </h3>
                      <p className="mt-2 text-jet/60 text-sm line-clamp-2 leading-relaxed">
                        {r.description}
                      </p>
                      <div className="mt-4 pt-3 border-t border-jet/5 flex items-center gap-2">
                        <span
                          aria-hidden
                          className="w-5 h-5 rounded-full flex items-center justify-center font-mono text-[9px] font-bold text-jet"
                          style={{ background: remixAccent }}
                        >
                          {remixInitial}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-jet/55">
                          @{r.contributor}
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {related.length > 0 && (
          <div className="mt-24 pt-16 border-t border-jet/5">
            <SectionHeader eyebrow="Related" title="See also." />
            <div className="mt-10">
              <ExperimentsGrid experiments={related} asymmetric={false} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
