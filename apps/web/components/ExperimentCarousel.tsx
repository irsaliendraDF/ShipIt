'use client';

import { useMemo } from 'react';
import { OfferCarousel, type Offer } from '@/components/ui/offer-carousel';
import type { Experiment } from '@/data/experiments';
import { getContributor } from '@/data/contributors';

type Props = {
  experiments: Experiment[];
  className?: string;
};

/**
 * Maps shipit.fun experiments onto the generic OfferCarousel primitive.
 * - tag → first experiment tag (badge with icon)
 * - title → experiment title
 * - description → experiment description
 * - brand → contributor (avatar initial + handle)
 * - promoCode → status (LIVE / WIP / ARCHIVED)
 * - href → /experiments/[slug]
 */
export function ExperimentCarousel({ experiments, className }: Props) {
  const offers: Offer[] = useMemo(
    () =>
      experiments.map((e) => {
        const contributor = getContributor(e.contributor);
        return {
          id: e.slug,
          imageSrc: e.thumbnail ?? '',
          imageAlt: `${e.title} thumbnail`,
          tag: e.tags[0] ?? 'experiment',
          title: e.title,
          description: e.description,
          brandName: `@${e.contributor}`,
          brandInitial: (contributor?.name ?? e.contributor).slice(0, 1).toUpperCase(),
          brandColor: contributor?.avatarColor ?? '#ff6fb5',
          promoCode: e.status === 'live' ? '● LIVE' : e.status === 'wip' ? '◐ WIP' : '○ ARCHIVED',
          href: e.externalUrl ?? `/experiments/${e.slug}`,
        };
      }),
    [experiments]
  );

  return <OfferCarousel offers={offers} className={className} />;
}
