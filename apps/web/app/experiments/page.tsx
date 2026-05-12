import { ExperimentsGrid } from '@/components/ExperimentsGrid';
import { SectionHeader } from '@/components/SectionHeader';
import { experiments, getAllTags } from '@/data/experiments';

export const metadata = {
  title: 'experiments. shipit.fun',
  description: 'browse every experiment shipped to shipit.fun.',
};

export default function ExperimentsPage() {
  const tags = getAllTags();

  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <SectionHeader
          eyebrow={`Index / ${experiments.length.toString().padStart(3, '0')}`}
          title="all experiments."
          description="every browser-native experiment shipped here. filter by tag is coming. for now, scroll."
        />

        <div className="mt-8 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="font-mono text-[10px] uppercase tracking-[0.22em] px-3 py-1.5 border border-jet/10 text-jet/50"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-14">
          <ExperimentsGrid experiments={experiments} asymmetric={false} />
        </div>
      </div>
    </div>
  );
}
