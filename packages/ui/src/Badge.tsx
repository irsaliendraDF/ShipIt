import * as React from 'react';
import { cn } from './cn';

type BadgeTone = 'default' | 'live' | 'wip' | 'archived' | 'tag' | 'warm';

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

const toneClasses: Record<BadgeTone, string> = {
  default: 'bg-jet/5 text-jet/70 border-jet/10',
  live: 'bg-lime/10 text-lime border-lime/30',
  wip: 'bg-warm/10 text-warm border-warm/30',
  archived: 'bg-jet/5 text-jet/45 border-jet/10',
  tag: 'bg-transparent text-jet/65 border-jet/15 hover:text-accent hover:border-accent/40',
  warm: 'bg-warm/10 text-warm border-warm/30',
};

export function Badge({ tone = 'default', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-mono text-[10px] uppercase tracking-[0.2em]',
        'px-2 py-0.5 border rounded-sm transition-colors',
        toneClasses[tone],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
