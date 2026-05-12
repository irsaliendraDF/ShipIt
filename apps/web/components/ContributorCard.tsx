'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Badge } from '@shipit-fun/ui';
import type { Contributor } from '@/data/contributors';
import { getExperimentsByContributor } from '@/data/experiments';

type Props = {
  contributor: Contributor;
  index?: number;
};

/**
 * Expanding contributor card.
 *
 * Collapsed: avatar + handle + name + short bio + tag chips + ship count.
 * Expanded (in-place, no navigation): full bio, every experiment they've
 * shipped, social links, and a link to their full profile page if they
 * want the dedicated URL.
 */
export function ContributorCard({ contributor, index = 0 }: Props) {
  const [expanded, setExpanded] = useState(false);
  const works = getExperimentsByContributor(contributor.handle);
  const tags = Array.from(new Set(works.flatMap((w) => w.tags))).slice(0, 4);
  const initial = contributor.name.slice(0, 1).toUpperCase();

  const socials = [
    contributor.links?.github && { href: contributor.links.github, label: 'github' },
    contributor.links?.site && { href: contributor.links.site, label: 'site' },
    contributor.links?.linkedin && { href: contributor.links.linkedin, label: 'linkedin' },
    contributor.links?.twitter && { href: contributor.links.twitter, label: 'twitter' },
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <article
        className={[
          'group relative bg-bg-elevated border transition-all p-6 hud-corners',
          expanded ? 'border-accent/40' : 'border-jet/8 hover:border-accent/40',
        ].join(' ')}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 80% 0%, ${contributor.avatarColor}22, transparent 50%)`,
          }}
        />

        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={`crew-${contributor.handle}-detail`}
          onClick={() => setExpanded((e) => !e)}
          className="relative block text-left w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-elevated"
        >
          <div className="flex items-start gap-4">
            {contributor.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={contributor.avatar}
                alt={`${contributor.name} avatar`}
                className="w-14 h-14 object-cover"
                style={{ background: contributor.avatarColor }}
                loading="lazy"
              />
            ) : (
              <div
                aria-hidden
                className="w-14 h-14 flex items-center justify-center font-mono text-2xl font-bold text-jet"
                style={{ background: contributor.avatarColor }}
              >
                {initial}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-jet/50">
                @{contributor.handle}
              </p>
              <h3 className="font-mono font-bold text-lg text-jet group-hover:text-accent transition-colors mt-1 truncate">
                {contributor.name}
              </h3>
            </div>
          </div>

          <p className={`mt-5 text-jet/60 text-sm leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}>
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
            <span className="text-jet/40 group-hover:text-accent transition-colors">
              {expanded ? 'collapse −' : 'expand +'}
            </span>
          </div>
        </button>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              id={`crew-${contributor.handle}-detail`}
              key="detail"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
              className="relative overflow-hidden"
            >
              <div className="pt-5 mt-5 border-t border-jet/10 space-y-5">
                {works.length > 0 && (
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-jet/45 mb-2">
                      ships
                    </p>
                    <ul className="space-y-1">
                      {works.map((w) => (
                        <li key={w.slug}>
                          <Link
                            href={`/experiments/${w.slug}`}
                            className="text-jet/80 hover:text-accent text-sm flex items-center gap-2 transition-colors"
                          >
                            <span className="text-accent">▸</span>
                            <span className="truncate">{w.title}</span>
                            <span className="font-mono text-[10px] text-jet/40 uppercase tracking-[0.18em] ml-auto">
                              {w.status}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {socials.length > 0 && (
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-jet/45 mb-2">
                      links
                    </p>
                    <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
                      {socials.map(({ href, label }) => (
                        <li key={label}>
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-jet/70 hover:text-accent text-sm transition-colors"
                          >
                            {label} ↗
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Link
                    href={`/contributors/${contributor.handle}`}
                    className="font-mono text-[11px] uppercase tracking-[0.18em] text-jet/55 hover:text-accent transition-colors"
                  >
                    full profile →
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </article>
    </motion.div>
  );
}
