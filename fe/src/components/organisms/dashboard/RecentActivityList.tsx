import { Avatar, AvatarFallback } from '@/components/atoms/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import type { RecentActivityResponse } from '@/types/api/dashboard.types';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { History } from 'lucide-react';

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function activityLabel(activity: string): string {
  return activity.replace(/[_-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * RecentActivityList — daftar aktivitas terbaru (GET /dashboard/recent-activities).
 * Presentasi murni; data disuplai oleh section/container.
 */
export function RecentActivityList({
  items,
}: {
  items: RecentActivityResponse[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="size-4 text-primary" />
          Aktivitas Terbaru
        </CardTitle>
        <CardDescription>10 aktivitas terakhir yang tercatat di sistem.</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada aktivitas tercatat.</p>
        ) : (
          <ul className="flex flex-col">
            {items.map((item) => {
              const name = item.user?.fullName ?? 'Sistem';
              const timestamp = new Date(item.createdAt);
              const relativeTime = Number.isNaN(timestamp.getTime())
                ? item.createdAt
                : formatDistanceToNow(timestamp, {
                    addSuffix: true,
                    locale: idLocale,
                  });

              return (
                <li
                  key={item.id}
                  className="flex items-start gap-3 border-b border-border/60 py-3 last:border-b-0 last:pb-0"
                >
                  <Avatar className="mt-0.5 size-9">
                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                      {initials(name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="truncate text-sm font-semibold text-foreground">{name}</span>
                      <span className="text-xs text-muted-foreground">{relativeTime}</span>
                    </div>
                    <span className="text-xs font-medium uppercase tracking-wide text-primary">
                      {activityLabel(item.activity)}
                    </span>
                    {item.description ? (
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
