import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import type { InternshipTrendPoint } from '@/types/api/dashboard.types';

const MAX_BAR_HEIGHT = 120;

function monthLabel(month: string): string {
  const [year, monthNum] = month.split('-').map(Number);
  if (!year || !monthNum) return month;
  return new Date(year, monthNum - 1, 1).toLocaleDateString('id-ID', {
    month: 'short',
  });
}

/**
 * InternshipTrendChart — tren magang (mulai vs selesai) 6 bulan terakhir
 * (GET /dashboard/charts). Bar chart CSS murni (presentasi).
 */
export function InternshipTrendChart({
  data,
}: {
  data: InternshipTrendPoint[];
}) {
  const max = Math.max(1, ...data.flatMap((d) => [d.started, d.completed]));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tren Magang</CardTitle>
        <CardDescription>Mulai vs selesai per bulan (6 bulan terakhir)</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-sky-500" />
            Mulai
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-emerald-500" />
            Selesai
          </span>
        </div>
        <div className="flex items-end justify-between gap-2">
          {data.map((point) => (
            <div key={point.month} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="flex w-full items-end justify-center gap-1"
                style={{ height: MAX_BAR_HEIGHT }}
              >
                <div
                  className="w-2.5 rounded-t bg-sky-500"
                  style={{
                    height: `${(point.started / max) * MAX_BAR_HEIGHT}px`,
                  }}
                />
                <div
                  className="w-2.5 rounded-t bg-emerald-500"
                  style={{
                    height: `${(point.completed / max) * MAX_BAR_HEIGHT}px`,
                  }}
                />
              </div>
              <span className="text-[11px] text-muted-foreground">{monthLabel(point.month)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
