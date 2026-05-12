'use client';

import type { ElementType } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Badge } from '@shipit-fun/ui';
import type { Experiment } from '@/data/experiments';
import { getContributor } from '@/data/contributors';

type Props = {
  experiment: Experiment;
  index?: number;
  size?: 'default' | 'wide' | 'tall';
};

export function ExperimentCard({ experiment, index = 0, size = 'default' }: Props) {
  const contributor = getContributor(experiment.contributor);
  const initial = (contributor?.name ?? experiment.contributor).slice(0, 1).toUpperCase();

  // Alternate accent direction so the grid feels arcade-marquee mixed
  const useWarm = index % 3 === 1;
  const accent = useWarm ? '#ff7a3d' : (contributor?.avatarColor ?? '#ff6fb5');
  const accentClass = useWarm ? 'text-warm group-hover:text-warm' : 'group-hover:text-accent';
  const hudClass = useWarm ? 'hud-corners hud-corners-warm' : 'hud-corners';
  const borderHover = useWarm ? 'hover:border-warm/50' : 'hover:border-accent/50';

  const sizeClasses =
    size === 'wide'
      ? 'sm:col-span-2'
      : size === 'tall'
      ? 'sm:row-span-2 min-h-[480px]'
      : '';

  const statusTone = experiment.status === 'live' ? 'live' : experiment.status === 'wip' ? 'wip' : 'archived';

  const cardClassName = `block h-full bg-bg-elevated border border-jet/8 ${borderHover} transition-all duration-300 overflow-hidden relative ${hudClass}`;
  const isExternal = !!experiment.externalUrl;
  const Wrapper: ElementType = isExternal ? 'a' : Link;
  const wrapperProps: Record<string, unknown> = isExternal
    ? { href: experiment.externalUrl, target: '_blank', rel: 'noreferrer' }
    : { href: `/experiments/${experiment.slug}` };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className={`group relative ${sizeClasses}`}
    >
      <Wrapper {...wrapperProps} className={cardClassName}>
        <div
          aria-hidden
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 30% 20%, ${accent}26, transparent 60%)`,
          }}
        />

        <div className="relative aspect-[16/9] overflow-hidden border-b border-jet/5 bg-bg-deep">
          {experiment.thumbnail ? (
            // SVG thumbnail. Wrapped in img for native lazy-loading + scaling.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={experiment.thumbnail}
              alt=""
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <>
              <div
                className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${accent}26 0%, #faf7f0 60%, ${accent}14 100%)`,
                }}
              />
              <div className="absolute inset-0 border-grid opacity-30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="font-mono text-[120px] font-bold opacity-25 group-hover:opacity-35 transition-opacity"
                  style={{ color: accent }}
                >
                  {experiment.slug.slice(0, 2).toUpperCase()}
                </div>
              </div>
            </>
          )}
          {/* Hover sheen */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 30% 20%, ${accent}26, transparent 60%)`,
              mixBlendMode: 'screen',
            }}
          />
          <div className="absolute top-3 right-3 z-10">
            <Badge tone={statusTone}>{experiment.status}</Badge>
          </div>
        </div>

        <div className="p-6 relative">
          <div className="flex items-start justify-between gap-4">
            <h3 className={`font-mono font-bold text-xl text-jet transition-colors ${accentClass}`}>
              {experiment.title}
            </h3>
          </div>
          <p className="mt-3 text-jet/60 text-sm leading-relaxed line-clamp-2">
            {experiment.description}
          </p>

          <div className="mt-5 flex flex-wrap gap-1.5">
            {experiment.tags.map((tag) => (
              <Badge key={tag} tone="tag">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-jet/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 flex items-center justify-center font-mono text-[11px] font-bold text-jet"
                style={{ background: accent }}
              >
                {initial}
              </div>
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-jet/55 group-hover:text-jet/85 transition-colors">
                @{experiment.contributor}
              </span>
            </div>
            <span
              className="font-mono text-[11px] transition-colors"
              style={{ color: useWarm ? '#ff7a3d' : '#ff6fb5', opacity: 0.7 }}
            >
              ▶
            </span>
          </div>
        </div>
      </Wrapper>
    </motion.div>
  );
}
