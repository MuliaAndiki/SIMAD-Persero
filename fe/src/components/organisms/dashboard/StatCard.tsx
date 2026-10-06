import { Card } from '@/components/atoms/card';
import { cn } from '@/utils/classname';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  description?: string;
  tone?: 'primary' | 'muted' | 'warning' | 'success' | 'destructive' | 'info';
  badge?: ReactNode;
  trend?: {
    value: string | number;
    isPositive?: boolean;
  };
  className?: string;
}

/**
 * StatCard — kartu ringkasan numerik High-Density untuk Enterprise CMS.
 */
export function StatCard({
  icon: Icon,
  label,
  value,
  description,
  tone = 'muted',
  badge,
  trend,
  className,
}: StatCardProps) {
  const toneIconColor = {
    primary: 'text-primary bg-primary/10',
    muted: 'text-muted-foreground bg-muted/80',
    warning: 'text-amber-600 dark:text-amber-400 bg-amber-500/10',
    success: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
    destructive: 'text-rose-600 dark:text-rose-400 bg-rose-500/10',
    info: 'text-sky-600 dark:text-sky-400 bg-sky-500/10',
  }[tone] ?? 'text-muted-foreground bg-muted/80';

  return (
    <Card
      className={cn(
        'relative flex flex-col justify-between overflow-hidden p-3 sm:p-3.5 transition-colors border-border/70 hover:border-border shadow-2xs',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs font-medium text-muted-foreground">{label}</span>
        <div className={cn('flex size-6.5 shrink-0 items-center justify-center rounded-md', toneIconColor)}>
          <Icon className="size-3.5" />
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-0.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-mono">
            {value}
          </span>
          {badge ? <div className="shrink-0">{badge}</div> : null}
        </div>

        {description || trend ? (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            {trend ? (
              <span
                className={cn(
                  'font-medium',
                  trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
                )}
              >
                {trend.value}
              </span>
            ) : null}
            {description ? <span className="truncate">{description}</span> : null}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
