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
} from '@/data/experiments';
import { getContributor } from '@/data/contributors';

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return experiments.filter((e) => !e.externalUrl).map((e) => ({ slug: e.slug }));
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
  const accent = contributor?.avatarColor ?? '#ff6fb5';
  const initial = (contributor?.name ?? exp.contributor).slice(0, 1).toUpperCase();
  const statusTone = exp.status === 'live' ? 'live' : exp.status === 'wip' ? 'wip' : 'archived';

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
            <h1 className="font-mono font-bold text-4xl sm:text-5xl text-jet tracking-tight">
              {exp.title}
            </h1>
            <p className="mt-4 text-jet/60 text-lg max-w-2xl leading-relaxed">
              {exp.description}
            </p>
          </div>
        </div>

        {exp.status === 'live' ? (
          <ExperimentFrame slug={exp.slug} title={exp.title} controls={exp.controls} tags={exp.tags} />
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
