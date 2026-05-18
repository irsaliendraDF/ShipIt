import type { ReactNode } from 'react';

/**
 * Shipping label component — the core recurring motif on shipit.build.
 * Replaces shipit.fun's cassette mockup. Used in section 4 (how it works)
 * and section 5 (pricing manifest).
 *
 * Anatomy: cream card, tier-number badge top-left, sprite top-right,
 * orange label header strip, Fraunces italic title, body, optional
 * bullets / example / CTA, optional dashed bottom divider.
 */
export type ShippingLabelProps = {
  /** "01" / "02" / "03" — shown in jet badge top-left. */
  tier: string;
  /** Full uppercase label header text (e.g. "STEP 01 · INTAKE"). */
  labelHeader: string;
  /** Fraunces italic title. */
  title: string;
  /** Optional one-liner under the title (used on pricing cards). */
  oneLiner?: string;
  /** Long-form body paragraph (used on how-it-works cards). */
  body?: string;
  /** Optional bullet list (used on pricing cards). */
  bullets?: string[];
  /** Optional italic example use case line. */
  example?: string;
  /** Top-right pixel sprite. */
  sprite?: ReactNode;
  /** Optional CTA at bottom (link + label). Triggers the dashed divider. */
  cta?: { href: string; label: string };
  /** Optional pill tag (e.g. MOST POPULAR) shown top-left over the card. */
  pill?: { label: string };
  /** Size: 'sm' for how-it-works, 'lg' for pricing. Affects title size. */
  size?: 'sm' | 'lg';
};

export function ShippingLabel({
  tier,
  labelHeader,
  title,
  oneLiner,
  body,
  bullets,
  example,
  sprite,
  cta,
  pill,
  size = 'sm',
}: ShippingLabelProps) {
  const titleSize = size === 'lg' ? 'text-[28px]' : 'text-[22px]';

  return (
    <article
      className="relative flex flex-col h-full border border-purple/25 rounded-2xl p-6 pt-7"
      style={{
        background:
          'linear-gradient(135deg, #ffffff 0%, rgba(139, 92, 246, 0.08) 100%)',
        boxShadow: '0 2px 0 rgba(139, 92, 246, 0.06)',
      }}
    >
      {pill && (
        <span className="absolute -top-3 left-6 px-2.5 py-1 rounded-sm bg-purple text-cream font-pixel text-[9px] tracking-[0.18em] uppercase">
          {pill.label}
        </span>
      )}

      <div className="flex items-start justify-between mb-4">
        {/* tier number badge */}
        <div className="w-9 h-9 rounded-md bg-white border border-purple text-purple font-pixel text-[10px] flex items-center justify-center">
          {tier}
        </div>
        {/* top-right sprite */}
        {sprite && <div className="flex-shrink-0">{sprite}</div>}
      </div>

      {/* purple label header strip */}
      <div className="bg-purple py-1.5 px-2 rounded-sm mb-4">
        <p className="font-pixel text-[9px] uppercase tracking-[0.1em] text-cream leading-none">
          {labelHeader}
        </p>
      </div>

      {/* title */}
      <h3 className={`font-display italic ${titleSize} font-normal text-jet leading-[1.15]`}>
        {title}
      </h3>

      {oneLiner && (
        <p className="mt-3 font-sans text-[15px] text-jet/80 leading-relaxed">{oneLiner}</p>
      )}

      {body && (
        <p className="mt-3 font-sans text-[15px] text-jet/75 leading-relaxed">{body}</p>
      )}

      {bullets && bullets.length > 0 && (
        <ul className="mt-4 space-y-2 font-sans text-[14px] text-jet/80 leading-snug">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-2">
              <span
                aria-hidden="true"
                className="mt-1.5 inline-block w-1.5 h-1.5 rounded-full bg-purple flex-shrink-0"
              />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}

      {example && (
        <p className="mt-4 font-sans italic text-[14px] text-jet/60 leading-relaxed">
          {example}
        </p>
      )}

      {cta && (
        <div className="mt-auto pt-5">
          <div
            aria-hidden="true"
            className="mb-3"
            style={{ borderTop: '1px dashed rgba(139, 92, 246, 0.5)' }}
          />
          <a
            href={cta.href}
            target={cta.href.startsWith('http') ? '_blank' : undefined}
            rel={cta.href.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="inline-flex items-center gap-1.5 font-sans font-semibold text-[15px] text-jet hover:text-purple transition-colors"
          >
            {cta.label}
          </a>
        </div>
      )}
    </article>
  );
}
