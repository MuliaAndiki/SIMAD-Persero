import { Card, CardContent } from '@/components/atoms/card';
import type { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  description?: string;
  tone?: 'primary' | 'muted';
}

/**
 * StatCard — kartu ringkasan numerik yang dapat dipakai ulang.
 * Presentasi murni; data & label disuplai oleh section/container.
 */
export function StatCard({
  icon: Icon,
  label,
  value,
  description,
  tone = 'primary',
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div
          className={
            tone === 'primary'
              ? 'flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'
              : 'flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground'
          }
        >
          <Icon className="size-5" />
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className="text-2xl font-bold leading-tight text-foreground">{value}</span>
          {description ? (
            <span className="text-xs text-muted-foreground">{description}</span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
