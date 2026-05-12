import * as React from 'react';
import { cn } from './cn';

type ButtonVariant = 'primary' | 'ghost' | 'subtle' | 'warm';
type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
};

const base =
  'inline-flex items-center justify-center font-mono uppercase tracking-[0.18em] ' +
  'transition-all duration-200 select-none border arcade-bevel';

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-cream border-accent hover:bg-accent/90 ' +
    'hover:shadow-[0_0_24px_rgba(255,111,181,0.45)]',
  ghost:
    'bg-transparent text-accent border-accent/40 hover:border-accent ' +
    'hover:bg-accent/5 hover:shadow-[0_0_18px_rgba(255,111,181,0.25)]',
  subtle:
    'bg-jet/5 text-jet border-jet/10 hover:bg-jet/10 hover:border-jet/20',
  warm:
    'bg-warm text-cream border-warm hover:bg-warm/90 ' +
    'hover:shadow-[0_0_24px_rgba(255,122,61,0.45)]',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'text-[11px] px-3 py-1.5 h-8',
  md: 'text-xs px-5 py-2.5 h-10',
  lg: 'text-sm px-7 py-3.5 h-12',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(base, variantClasses[variant], sizeClasses[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
