import { ExperimentCard } from './ExperimentCard';
import type { Experiment } from '@/data/experiments';

type Props = {
  experiments: Experiment[];
  asymmetric?: boolean;
};

export function ExperimentsGrid({ experiments, asymmetric = true }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
      {experiments.map((experiment, i) => {
        const size = asymmetric && i === 0 ? 'wide' : 'default';
        return (
          <ExperimentCard
            key={experiment.slug}
            experiment={experiment}
            index={i}
            size={size}
          />
        );
      })}
    </div>
  );
}
