'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MenuItem {
  icon: LucideIcon | React.FC;
  label: string;
  href: string;
  /** Per-item glow gradient (radial, see demo for shape). */
  gradient: string;
  /** Tailwind text-color class used for the icon on hover/active. */
  iconColor: string;
}

export interface MenuBarProps extends React.HTMLAttributes<HTMLDivElement> {
  items: MenuItem[];
  activeItem?: string;
  onItemClick?: (label: string, item: MenuItem) => void;
}

const itemVariants = {
  initial: { rotateX: 0, opacity: 1 },
  hover: { rotateX: -90, opacity: 0 },
};

const backVariants = {
  initial: { rotateX: 90, opacity: 0 },
  hover: { rotateX: 0, opacity: 1 },
};

const glowVariants = {
  initial: { opacity: 0, scale: 0.8 },
  hover: {
    opacity: 1,
    scale: 2,
    transition: {
      opacity: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
      scale: { duration: 0.5, type: 'spring', stiffness: 300, damping: 25 },
    },
  },
};

const navGlowVariants = {
  initial: { opacity: 0 },
  hover: {
    opacity: 1,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  },
};

const sharedTransition = {
  type: 'spring',
  stiffness: 100,
  damping: 20,
  duration: 0.5,
};

export const MenuBar = React.forwardRef<HTMLElement, MenuBarProps>(
  ({ className, items, activeItem, onItemClick, ...props }, ref) => {
    return (
      <motion.nav
        ref={ref}
        className={cn(
          'p-1.5 rounded-2xl bg-gradient-to-b from-bg-elevated/95 to-bg/70 backdrop-blur-lg border border-jet/10 shadow-[0_8px_32px_rgba(26,26,26,0.08)] relative overflow-hidden',
          className
        )}
        initial="initial"
        whileHover="hover"
        {...props}
      >
        <motion.div
          className="absolute -inset-2 bg-gradient-radial from-transparent via-accent/15 via-30% via-warm/15 via-60% via-lime/15 via-90% to-transparent rounded-3xl z-0 pointer-events-none"
          variants={navGlowVariants}
          style={{
            background:
              'radial-gradient(circle at 50% 50%, transparent 0%, rgba(255,111,181,0.20) 30%, rgba(255,122,61,0.20) 60%, rgba(139,92,246,0.20) 90%, transparent 100%)',
          }}
        />
        <ul className="flex items-center gap-1 relative z-10">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = item.label === activeItem;

            return (
              <motion.li key={item.label} className="relative">
                <button
                  type="button"
                  onClick={() => onItemClick?.(item.label, item)}
                  className="block w-full"
                  aria-current={isActive ? 'page' : undefined}
                >
                  <motion.div
                    className="block rounded-xl overflow-visible group relative"
                    style={{ perspective: '600px' }}
                    whileHover="hover"
                    initial="initial"
                  >
                    <motion.div
                      className="absolute inset-0 z-0 pointer-events-none"
                      variants={glowVariants}
                      animate={isActive ? 'hover' : 'initial'}
                      style={{
                        background: item.gradient,
                        opacity: isActive ? 1 : 0,
                        borderRadius: '12px',
                      }}
                    />
                    <motion.div
                      className={cn(
                        'flex items-center gap-2 px-3.5 py-2 relative z-10 bg-transparent transition-colors rounded-xl font-mono text-[11px] uppercase tracking-[0.22em]',
                        isActive
                          ? 'text-jet'
                          : 'text-jet/55 group-hover:text-jet'
                      )}
                      variants={itemVariants}
                      transition={sharedTransition}
                      style={{
                        transformStyle: 'preserve-3d',
                        transformOrigin: 'center bottom',
                      }}
                    >
                      <span
                        className={cn(
                          'transition-colors duration-300',
                          isActive ? item.iconColor : 'text-jet/70',
                          `group-hover:${item.iconColor}`
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span>{item.label}</span>
                    </motion.div>
                    <motion.div
                      className={cn(
                        'flex items-center gap-2 px-3.5 py-2 absolute inset-0 z-10 bg-transparent transition-colors rounded-xl font-mono text-[11px] uppercase tracking-[0.22em]',
                        isActive
                          ? 'text-jet'
                          : 'text-jet/55 group-hover:text-jet'
                      )}
                      variants={backVariants}
                      transition={sharedTransition}
                      style={{
                        transformStyle: 'preserve-3d',
                        transformOrigin: 'center top',
                        rotateX: 90,
                      }}
                    >
                      <span
                        className={cn(
                          'transition-colors duration-300',
                          isActive ? item.iconColor : 'text-jet/70',
                          `group-hover:${item.iconColor}`
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span>{item.label}</span>
                    </motion.div>
                  </motion.div>
                </button>
              </motion.li>
            );
          })}
        </ul>
      </motion.nav>
    );
  }
);
MenuBar.displayName = 'MenuBar';
