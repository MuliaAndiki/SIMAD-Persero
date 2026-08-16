import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import type { SupervisorDashboardData } from '@/types/api/dashboard.types';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

/** Segmen status absensi (token chart dari tema). */
const ATTENDANCE_ITEMS = [
  { key: 'Hadir', valueKey: 'present', color: 'var(--chart-3)' },
  {
    key: 'Belum Check-in',
    valueKey: 'notCheckedIn',
    color: 'var(--chart-2)',
  },
  {
    key: 'Tidak Valid',
    valueKey: 'invalidAttendance',
    color: 'var(--chart-5)',
  },
] as const;

/** Gaya tooltip agar selaras dengan tema aplikasi. */
const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: '1px solid var(--border)',
  background: 'var(--card)',
  color: 'var(--foreground)',
  fontSize: 12,
} as const;

/**
 * SupervisorAttendanceChart — distribusi status absensi peserta bimbingan
 * hari ini (GET /dashboard/supervisor). Dibangun dengan recharts (donut);
 * data disuplai oleh section/container.
 */
export function SupervisorAttendanceChart({
  data,
}: {
  data: SupervisorDashboardData;
}) {
  const items = ATTENDANCE_ITEMS.map((item) => ({
    key: item.key,
    value: data[item.valueKey],
    color: item.color,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Absensi Hari Ini</CardTitle>
        <CardDescription>Distribusi kehadiran peserta bimbingan</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={items}
                dataKey="value"
                nameKey="key"
                innerRadius="60%"
                outerRadius="82%"
                paddingAngle={3}
                strokeWidth={0}
              >
                {items.map((item) => (
                  <Cell key={item.key} fill={item.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-foreground">
              {data.departmentParticipants.toLocaleString('id-ID')}
            </span>
            <span className="text-xs text-muted-foreground">Peserta</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
