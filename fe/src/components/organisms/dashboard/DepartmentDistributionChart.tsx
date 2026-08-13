import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import type { DepartmentDistributionPoint } from '@/types/api/dashboard.types';

/**
 * DepartmentDistributionChart — distribusi peserta magang per bidang
 * (GET /dashboard/charts). Bar horizontal CSS murni (presentasi).
 */
export function DepartmentDistributionChart({
  data,
}: {
  data: DepartmentDistributionPoint[];
}) {
  const max = Math.max(1, ...data.map((d) => d.internCount));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribusi Bidang</CardTitle>
        <CardDescription>Peserta magang per bidang</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3.5">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada data distribusi.</p>
        ) : (
          data.map((point) => (
            <div key={point.department} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate font-medium text-foreground">{point.department}</span>
                <span className="shrink-0 text-muted-foreground">
                  {point.internCount.toLocaleString('id-ID')} peserta
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(point.internCount / max) * 100}%` }}
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
