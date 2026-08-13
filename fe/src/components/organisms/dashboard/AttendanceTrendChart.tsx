import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import type { AttendanceTrendPoint } from '@/types/api/dashboard.types';

const MAX_BAR_HEIGHT = 120;

function monthLabel(month: string): string {
  const [year, monthNum] = month.split('-').map(Number);
  if (!year || !monthNum) return month;
  return new Date(year, monthNum - 1, 1).toLocaleDateString('id-ID', {
    month: 'short',
  });
}

/**
 * AttendanceTrendChart — tren absensi 6 bulan terakhir (GET /dashboard/charts).
 * Bar chart CSS murni (presentasi); data disuplai oleh section/container.
 */
export function AttendanceTrendChart({
  data,
}: {
  data: AttendanceTrendPoint[];
}) {
  const max = Math.max(1, ...data.flatMap((d) => [d.present, d.late, d.invalid]));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tren Absensi</CardTitle>
        <CardDescription>6 bulan terakhir</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-emerald-500" />
            Hadir
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-amber-500" />
            Terlambat
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-rose-500" />
            Tidak valid
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
                  className="w-2.5 rounded-t bg-emerald-500"
                  style={{
                    height: `${(point.present / max) * MAX_BAR_HEIGHT}px`,
                  }}
                />
                <div
                  className="w-2.5 rounded-t bg-amber-500"
                  style={{ height: `${(point.late / max) * MAX_BAR_HEIGHT}px` }}
                />
                <div
                  className="w-2.5 rounded-t bg-rose-500"
                  style={{
                    height: `${(point.invalid / max) * MAX_BAR_HEIGHT}px`,
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
