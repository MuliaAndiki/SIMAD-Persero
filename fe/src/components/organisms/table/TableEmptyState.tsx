'use client';

import { cn } from '@/utils/classname';
import type { LucideIcon } from 'lucide-react';

export interface TableEmptyStateProps {
  icon: LucideIcon;
  message: string;
  title?: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * TableEmptyState — tampilan kosong standar untuk tabel
 * (ikon + pesan + aksi opsional).
 */
export function TableEmptyState({
  icon: Icon,
  message,
  title,
  action,
  className,
}: TableEmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center gap-2 px-6 py-12 text-center', className)}>
      <Icon className="size-8 text-muted-foreground/50" />
      {title ? <p className="text-sm font-medium text-foreground">{title}</p> : null}
      <p className="text-sm text-muted-foreground">{message}</p>
      {action}
    </div>
  );
}
