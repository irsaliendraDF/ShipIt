'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Badge } from '@shipit-fun/ui';
import type { Contributor } from '@/data/contributors';
import { getExperimentsByContributor } from '@/data/experiments';

type Props = {
  contributor: Contributor;
  index?: number;
};

export function ContributorCard({ contributor, index = 0 }: Props) {
  const works = getExperimentsByContributor(contributor.handle);
  const tags = Array.from(new Set(works.flatMap((w) => w.tags))).slice(0, 4);
  const initial = contributor.name.slice(0, 1).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <Link
        href={`/contributors/${contributor.handle}`}
        className="group block h-full bg-bg-elevated border border-jet/8 hover:border-accent/40 transition-all p-6 relative overflow-hidden hud-corners"
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at 80% 0%, ${contributor.avatarColor}22, transparent 50%)`,
          }}
        />
        <div className="relative">
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 flex items-center justify-center font-mono text-2xl font-bold text-jet"
              style={{ background: contributor.avatarColor }}
            >
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-jet/50">
                @{contributor.handle}
              </p>
              <h3 className="font-mono font-bold text-lg text-jet group-hover:text-accent transition-colors mt-1 truncate">
                {contributor.name}
              </h3>
            </div>
          </div>

          <p className="mt-5 text-jet/55 text-sm leading-relaxed line-clamp-3">
            {contributor.bio}
          </p>

          <div className="mt-5 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Badge key={tag} tone="tag">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-jet/5 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.18em]">
            <span className="text-jet/50">
              {works.length} {works.length === 1 ? 'experiment' : 'experiments'}
            </span>
            <span className="text-jet/30 group-hover:text-accent transition-colors">→</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
