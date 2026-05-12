import { ContributorCard } from '@/components/ContributorCard';
import { SectionHeader } from '@/components/SectionHeader';
import { contributors } from '@/data/contributors';
import { experiments } from '@/data/experiments';

export const metadata = {
  title: 'crew. shipit.fun',
  description: 'builders shipping experiments to shipit.fun.',
};

export default function ContributorsPage() {
  const totalShipped = experiments.length;

  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <SectionHeader
            eyebrow={`Crew / ${contributors.length.toString().padStart(2, '0')}`}
            title="the crew."
            description="everyone shipping to shipit.fun. want to be here? open a PR."
          />
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-jet/40 border border-jet/10 px-4 py-2 bg-bg-elevated">
            <span className="text-warm">{totalShipped.toString().padStart(2, '0')}</span>
            <span className="ml-2">experiments shipped</span>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-5">
          {contributors.map((c, i) => (
            <ContributorCard key={c.handle} contributor={c} index={i} />
          ))}
        </div>

        {/* Empty seat marker — visual cue that the crew is open, in a single-card view it fills space too */}
        <div className="mt-5">
          <a
            href="https://github.com/irsaliendraDF/ShipIt/blob/main/CONTRIBUTING.md"
            target="_blank"
            rel="noreferrer"
            className="block bg-transparent border border-dashed border-jet/15 hover:border-warm/50 transition-all p-6 group"
          >
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-warm mb-2">
                  // empty_seat
                </p>
                <p className="font-mono font-bold text-lg text-jet group-hover:text-warm transition-colors">
                  want to ship next?
                </p>
                <p className="text-jet/65 text-sm mt-1">
                  shipit.fun takes PRs from anyone. new contributor profiles populate this grid.
                </p>
              </div>
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-jet/50 group-hover:text-warm transition-colors">
                read the contributor guide ↗
              </span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
