'use client';

import { Button } from '@/components/atoms/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/atoms/dropdown-menu';
import type { LucideIcon } from 'lucide-react';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

export interface RowActionItem {
  key: string;
  label: React.ReactNode;
  icon?: LucideIcon;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
  /** Item disembunyikan (untuk aksi kondisional per baris). */
  hidden?: boolean;
  /** Jika diisi, item dirender sebagai Link. */
  href?: string;
  onSelect?: () => void;
}

export interface RowActionsMenuProps {
  items: RowActionItem[];
  label?: string;
  contentClassName?: string;
}

/**
 * RowActionsMenu — dropdown titik-tiga standar untuk aksi baris tabel.
 * Dipakai seluruh tabel agar tampilan aksi seragam.
 */
export function RowActionsMenu({
  items,
  label = 'Aksi',
  contentClassName = 'w-44',
}: RowActionsMenuProps) {
  const visibleItems = items.filter((item) => !item.hidden);
  if (visibleItems.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="size-8 p-0" aria-label={label}>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={contentClassName}>
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const content = (
            <>
              {Icon ? <Icon className="size-4" /> : null}
              {item.label}
            </>
          );
          if (item.href) {
            return (
              <DropdownMenuItem key={item.key} asChild disabled={item.disabled}>
                <Link href={item.href}>{content}</Link>
              </DropdownMenuItem>
            );
          }
          return (
            <DropdownMenuItem
              key={item.key}
              variant={item.variant}
              disabled={item.disabled}
              onClick={item.onSelect}
            >
              {content}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
