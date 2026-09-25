'use client';

import { cn } from '@/utils/classname';
import type { ReactNode } from 'react';

export interface DetailFieldProps {
  label: string;
  value?: ReactNode;
  fallback?: ReactNode;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
}

/**
 * DetailField — atom component untuk menampilkan field detail (label + nilai).
 * Menggantikan duplikasi ApplicationDetailField & AttendanceDetailField.
 */
export function DetailField({
  label,
  value,
  fallback = '-',
  className,
  labelClassName,
  valueClassName,
}: DetailFieldProps) {
  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      <span className={cn('text-xs text-muted-foreground', labelClassName)}>{label}</span>
      <span className={cn('font-medium', valueClassName)}>
        {value !== undefined && value !== null && value !== '' ? value : fallback}
      </span>
    </div>
  );
}
