import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import type { AttendanceTrendPoint } from '@/types/api/dashboard.types';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

/** Seri absensi yang digambar sebagai area bertumpuk (token chart dari tema). */
const ATTENDANCE_SERIES = [
  { key: 'present', name: 'Hadir', color: 'var(--chart-3)' },
  { key: 'late', name: 'Terlambat', color: 'var(--chart-4)' },
  { key: 'invalid', name: 'Tidak valid', color: 'var(--chart-5)' },
] as const;

function monthLabel(month: string): string {
  const [year, monthNum] = month.split('-').map(Number);
  if (!year || !monthNum) return month;
  return new Date(year, monthNum - 1, 1).toLocaleDateString('id-ID', {
    month: 'short',
  });
}

/** Gaya tooltip agar selaras dengan tema aplikasi. */
const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: '1px solid var(--border)',
  background: 'var(--card)',
  color: 'var(--foreground)',
  fontSize: 12,
} as const;

/**
 * AttendanceTrendChart — tren absensi 6 bulan terakhir (GET /dashboard/charts).
 * Dibangun dengan recharts (stacked area); data disuplai oleh section/container.
 */
export function AttendanceTrendChart({
  data,
}: {
  data: AttendanceTrendPoint[];
}) {
  const chartData = data.map((point) => ({
    ...point,
    label: monthLabel(point.month),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tren Absensi</CardTitle>
        <CardDescription>6 bulan terakhir</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <defs>
                {ATTENDANCE_SERIES.map((series) => (
                  <linearGradient
                    key={series.key}
                    id={`attendance-${series.key}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor={series.color} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={series.color} stopOpacity={0.02} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                allowDecimals={false}
              />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              {ATTENDANCE_SERIES.map((series) => (
                <Area
                  key={series.key}
                  type="monotone"
                  dataKey={series.key}
                  name={series.name}
                  stackId="1"
                  stroke={series.color}
                  fill={`url(#attendance-${series.key})`}
                  strokeWidth={2}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
