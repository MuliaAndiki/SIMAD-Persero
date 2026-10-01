'use client';

import { Button } from '@/components/atoms/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface TablePaginationProps {
  page: number;
  totalPages: number;
  description: React.ReactNode;
  onPageChange: (page: number) => void;
}

/**
 * TablePagination — footer pagination standar tabel
 * (deskripsi + tombol Sebelumnya/Selanjutnya).
 */
export function TablePagination({
  page,
  totalPages,
  description,
  onPageChange,
}: TablePaginationProps) {
  if (totalPages <= 1) return null;

  const current = Number(page);
  const total = Number(totalPages);

  return (
    <div className="flex items-center justify-between border-t px-6 py-4">
      <p className="text-xs text-muted-foreground">{description}</p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={current <= 1}
          onClick={() => onPageChange(current - 1)}
          className="h-8 gap-1 text-xs"
        >
          <ChevronLeft className="size-3.5" />
          Sebelumnya
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={current >= total}
          onClick={() => onPageChange(current + 1)}
          className="h-8 gap-1 text-xs"
        >
          Selanjutnya
          <ChevronRight className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
