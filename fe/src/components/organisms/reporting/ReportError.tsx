'use client';

import { Button } from '@/components/atoms/button';
import { AlertCircle } from 'lucide-react';

export interface ReportErrorProps {
  message?: string;
  onRetry: () => void;
}

/**
 * ReportError — organism pesan error + tombol retry untuk tab laporan.
 */
export function ReportError({ message, onRetry }: ReportErrorProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
      <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
      <div className="flex flex-col gap-1 text-destructive">
        <p className="font-semibold">Gagal memuat data laporan</p>
        <p className="opacity-90">{message}</p>
        <Button variant="outline" size="sm" className="mt-1 w-fit" onClick={onRetry}>
          Coba Lagi
        </Button>
      </div>
    </div>
  );
}
