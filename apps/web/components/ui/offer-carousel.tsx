'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Offer / card shape. Generic primitive — shipit.fun maps Experiments onto this.
 */
export interface Offer {
  id: string | number;
  imageSrc: string;
  imageAlt: string;
  tag: string;
  title: string;
  description: string;
  brandLogoSrc?: string;
  brandInitial?: string;
  brandColor?: string;
  brandName: string;
  promoCode?: string;
  href: string;
}

interface OfferCardProps {
  offer: Offer;
}

/**
 * Single carousel card. 300x380 with image top-half, content bottom-half.
 * Arcade-tuned: deep elevated bg, teal/warm accents, mono labels, dark text on chip.
 */
const OfferCard = React.forwardRef<HTMLAnchorElement, OfferCardProps>(({ offer }, ref) => {
  const initial = offer.brandInitial ?? offer.brandName.slice(0, 1).toUpperCase();
  const brandColor = offer.brandColor ?? '#ff6fb5';

  return (
    <motion.a
      ref={ref}
      href={offer.href}
      className="relative flex-shrink-0 w-[300px] h-[380px] rounded-2xl overflow-hidden group snap-start bg-bg-elevated border border-jet/8 hover:border-accent/40 transition-colors"
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{ perspective: '1000px' }}
    >
      {/* Top half: thumbnail / image */}
      <div className="absolute inset-x-0 top-0 h-1/2 overflow-hidden bg-bg-deep border-b border-jet/8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={offer.imageSrc}
          alt={offer.imageAlt}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        {/* Subtle bottom-edge fade so the seam between image and card is softer */}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent to-bg-elevated/70 pointer-events-none" />
      </div>

      {/* Bottom half: card content */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 p-5 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Tag */}
          <div className="flex items-center font-mono text-[10px] uppercase tracking-[0.22em] text-jet/55">
            <Tag className="w-3.5 h-3.5 mr-2 text-warm" />
            <span>{offer.tag}</span>
          </div>
          {/* Title */}
          <h3 className="font-mono text-lg font-bold text-jet leading-tight group-hover:text-accent transition-colors">
            {offer.title}
          </h3>
          {/* Description */}
          <p className="text-sm text-jet/60 leading-snug line-clamp-2">{offer.description}</p>
        </div>

        {/* Footer: brand + CTA arrow */}
        <div className="flex items-center justify-between pt-4 border-t border-jet/10">
          <div className="flex items-center gap-3 min-w-0">
            {offer.brandLogoSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={offer.brandLogoSrc}
                alt={`${offer.brandName} logo`}
                className="w-8 h-8 rounded-full bg-jet/5 object-cover"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-mono text-[12px] font-bold text-jet flex-shrink-0"
                style={{ background: brandColor }}
              >
                {initial}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-jet truncate">
                {offer.brandName}
              </p>
              {offer.promoCode && (
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-jet/45 truncate">
                  {offer.promoCode}
                </p>
              )}
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-jet/5 border border-jet/10 flex items-center justify-center text-jet/70 transform transition-all duration-300 group-hover:rotate-[-45deg] group-hover:bg-warm group-hover:text-jet group-hover:border-warm flex-shrink-0">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </motion.a>
  );
});
OfferCard.displayName = 'OfferCard';

export interface OfferCarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  offers: Offer[];
}

/**
 * Horizontal-snap carousel with chevron scroll buttons that fade in on hover.
 * Hides scrollbar via the `.scrollbar-hide` utility (defined in globals.css).
 */
const OfferCarousel = React.forwardRef<HTMLDivElement, OfferCarouselProps>(
  ({ offers, className, ...props }, ref) => {
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
      const el = scrollContainerRef.current;
      if (!el) return;
      const amount = el.clientWidth * 0.8;
      el.scrollBy({
        left: direction === 'left' ? -amount : amount,
        behavior: 'smooth',
      });
    };

    return (
      <div ref={ref} className={cn('relative w-full group', className)} {...props}>
        <button
          type="button"
          onClick={() => scroll('left')}
          className="absolute top-1/2 -translate-y-1/2 left-0 z-10 w-10 h-10 rounded-full bg-bg-elevated/80 backdrop-blur-sm border border-jet/15 flex items-center justify-center text-jet/80 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-bg-elevated hover:border-accent/50 hover:text-accent disabled:opacity-0"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div
          ref={scrollContainerRef}
          className="flex space-x-5 overflow-x-auto pb-6 px-1 scrollbar-hide snap-x snap-mandatory"
        >
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>

        <button
          type="button"
          onClick={() => scroll('right')}
          className="absolute top-1/2 -translate-y-1/2 right-0 z-10 w-10 h-10 rounded-full bg-bg-elevated/80 backdrop-blur-sm border border-jet/15 flex items-center justify-center text-jet/80 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-bg-elevated hover:border-accent/50 hover:text-accent disabled:opacity-0"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  }
);
OfferCarousel.displayName = 'OfferCarousel';

export { OfferCarousel, OfferCard };
