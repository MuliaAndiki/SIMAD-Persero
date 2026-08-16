import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import type { DepartmentDistributionPoint } from '@/types/api/dashboard.types';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

/** Palet donut memakai token chart dari tema (globals.css). */
const DONUT_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

/** Gaya tooltip agar selaras dengan tema aplikasi. */
const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: '1px solid var(--border)',
  background: 'var(--card)',
  color: 'var(--foreground)',
  fontSize: 12,
} as const;

/**
 * DepartmentDistributionChart — distribusi peserta magang per bidang
 * (GET /dashboard/charts). Dibangun dengan recharts (donut); data disuplai
 * oleh section/container.
 */
export function DepartmentDistributionChart({
  data,
}: {
  data: DepartmentDistributionPoint[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribusi Bidang</CardTitle>
        <CardDescription>Peserta magang per bidang</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada data distribusi.</p>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="internCount"
                  nameKey="department"
                  innerRadius="55%"
                  outerRadius="80%"
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {data.map((point, index) => (
                    <Cell key={point.department} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
