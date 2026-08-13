'use client';

import type { ReactNode } from 'react';

export interface AttendanceDetailFieldProps {
  label: string;
  value: ReactNode;
}

/**
 * AttendanceDetailField — organism field detail absensi (label + nilai).
 */
export function AttendanceDetailField({ label, value }: AttendanceDetailFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
