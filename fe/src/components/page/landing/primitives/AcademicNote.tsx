'use client';

import { cn } from '@/utils/classname';
import type React from 'react';

export interface AcademicNoteProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'sticky' | 'marker' | 'editorial' | 'outline';
  rotate?: 'left' | 'right' | 'none';
  icon?: React.ReactNode;
}

/**
 * Subtle academic annotation badge / marginalia note.
 * Uses semantic tokens (bg-accent/text-accent-foreground) so it looks like warm paper yellow in light mode
 * and deep golden note in dark mode, perfectly adhering to theme.config.ts.
 */
export function AcademicNote({
  children,
  className,
  variant = 'sticky',
  rotate = 'none',
  icon,
}: AcademicNoteProps) {
  const rotateClass =
    rotate === 'left'
      ? '-rotate-2 hover:rotate-0'
      : rotate === 'right'
        ? 'rotate-2 hover:rotate-0'
        : '';

  const variantStyles = {
    sticky:
      'bg-accent text-accent-foreground border border-accent-foreground/20 shadow-xs px-2.5 py-1 rounded-sm text-xs font-medium tracking-tight',
    marker:
      'bg-accent/70 text-accent-foreground px-2 py-0.5 rounded-sm text-xs font-semibold tracking-wide border-b-2 border-accent-foreground/30',
    editorial:
      'bg-secondary text-secondary-foreground border border-border px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider',
    outline:
      'bg-transparent text-foreground border border-border/80 px-2.5 py-0.5 rounded-sm text-xs font-mono tracking-tight',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 transition-transform duration-200 select-none align-middle',
        variantStyles[variant],
        rotateClass,
        className,
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
