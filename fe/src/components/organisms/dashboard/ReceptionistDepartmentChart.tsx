import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import type { ReceptionistDepartmentAttendance } from '@/types/api/dashboard.types';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

/** Gaya tooltip agar selaras dengan tema aplikasi. */
const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: '1px solid var(--border)',
  background: 'var(--card)',
  color: 'var(--foreground)',
  fontSize: 12,
} as const;

/**
 * ReceptionistDepartmentChart — perbandingan hadir/tidak hadir hari ini
 * per departemen (bar horizontal). Memakai token warna yang sama dengan
 * AttendanceTrendChart (Hadir hijau, Tidak Hadir merah).
 */
export function ReceptionistDepartmentChart({
  data,
}: {
  data: ReceptionistDepartmentAttendance[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Kehadiran per Departemen</CardTitle>
        <CardDescription>Perbandingan hadir vs tidak hadir hari ini</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="department"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                width={140}
              />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'var(--muted)' }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="hadir" name="Hadir" fill="var(--chart-3)" radius={[0, 4, 4, 0]} />
              <Bar
                dataKey="tidakHadir"
                name="Tidak Hadir"
                fill="var(--chart-5)"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
