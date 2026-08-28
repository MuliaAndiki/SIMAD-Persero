import { Card, CardContent } from '@/components/atoms/card';
import { cn } from '@/utils/classname';
import type { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  description?: string;
  tone?: 'primary' | 'muted';
  className?: string;
}

/**
 * StatCard — kartu ringkasan numerik yang dapat dipakai ulang & responsif mobile.
 */
export function StatCard({
  icon: Icon,
  label,
  value,
  description,
  tone = 'primary',
  className,
}: StatCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="flex items-center gap-3 p-3.5 sm:gap-4 sm:p-5">
        <div
          className={
            tone === 'primary'
              ? 'flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:size-11'
              : 'flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground sm:size-11'
          }
        >
          <Icon className="size-4.5 sm:size-5" />
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-xs text-muted-foreground sm:text-sm">{label}</span>
          <span className="text-lg font-bold leading-tight text-foreground sm:text-2xl">
            {value}
          </span>
          {description ? (
            <span className="truncate text-[11px] text-muted-foreground sm:text-xs">
              {description}
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
