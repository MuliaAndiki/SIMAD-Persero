import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import type { InternshipTrendPoint } from '@/types/api/dashboard.types';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

/** Seri tren magang yang digambar sebagai garis (token chart dari tema). */
const INTERNSHIP_SERIES = [
  { key: 'started', name: 'Mulai', color: 'var(--chart-2)' },
  { key: 'completed', name: 'Selesai', color: 'var(--chart-3)' },
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
 * InternshipTrendChart — tren magang (mulai vs selesai) 6 bulan terakhir
 * (GET /dashboard/charts). Dibangun dengan recharts (line); data disuplai
 * oleh section/container.
 */
export function InternshipTrendChart({
  data,
}: {
  data: InternshipTrendPoint[];
}) {
  const chartData = data.map((point) => ({
    ...point,
    label: monthLabel(point.month),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tren Magang</CardTitle>
        <CardDescription>Mulai vs selesai per bulan (6 bulan terakhir)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
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
              {INTERNSHIP_SERIES.map((series) => (
                <Line
                  key={series.key}
                  type="monotone"
                  dataKey={series.key}
                  name={series.name}
                  stroke={series.color}
                  strokeWidth={2}
                  dot={{ r: 3, strokeWidth: 0, fill: series.color }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
