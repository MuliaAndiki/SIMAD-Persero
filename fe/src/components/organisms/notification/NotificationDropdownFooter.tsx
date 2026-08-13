'use client';

import { Button } from '@/components/atoms/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export interface NotificationDropdownFooterProps {
  href: string;
  label?: string;
  description?: string;
}

/**
 * Footer panel notifikasi — tautan "Lihat Semua" menuju halaman sesuai role.
 */
export function NotificationDropdownFooter({
  href,
  label = 'Lihat Semua',
  description,
}: NotificationDropdownFooterProps) {
  return (
    <div className="p-1">
      <Button
        asChild
        variant="ghost"
        className="flex h-auto w-full items-center justify-between gap-2 px-2 py-2"
      >
        <Link href={href}>
          <span className="flex flex-col items-start gap-0.5">
            <span className="text-xs font-medium">{label}</span>
            {description && (
              <span className="text-[11px] font-normal text-muted-foreground">{description}</span>
            )}
          </span>
          <ArrowRight className="size-3.5" />
        </Link>
      </Button>
    </div>
  );
}
