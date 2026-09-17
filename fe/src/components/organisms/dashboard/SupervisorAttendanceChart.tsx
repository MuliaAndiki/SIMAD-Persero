import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import type { SupervisorDashboardData } from '@/types/api/dashboard.types';
import { useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Sector, Tooltip } from 'recharts';

/** Segmen status absensi (menggunakan warna hex untuk recharts DropShadow). */
const ATTENDANCE_ITEMS = [
  { key: 'Hadir', valueKey: 'present', color: '#10b981' },
  { key: 'Belum Check-in', valueKey: 'notCheckedIn', color: '#f59e0b' },
  { key: 'Tidak Valid', valueKey: 'invalidAttendance', color: '#f43f5e' },
] as const;

/** Shape interaktif saat kursor berada di atas pie chart. */
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: `drop-shadow(0px 0px 8px ${fill}60)` }}
        className="transition-all duration-300"
      />
    </g>
  );
};

export function SupervisorAttendanceChart({
  data,
}: {
  data: SupervisorDashboardData;
}) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>();

  const items = ATTENDANCE_ITEMS.map((item) => ({
    key: item.key,
    value: data[item.valueKey],
    color: item.color,
  }));

  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader>
        <CardTitle>Status Absensi Hari Ini</CardTitle>
        <CardDescription>Distribusi kehadiran peserta bimbingan</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-8 pb-8 md:flex-row">
        <div className="relative h-56 w-56 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={items}
                dataKey="value"
                nameKey="key"
                innerRadius="65%"
                outerRadius="85%"
                paddingAngle={5}
                strokeWidth={0}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(undefined)}
              >
                {items.map((item) => (
                  <Cell
                    key={item.key}
                    fill={item.color}
                    className="cursor-pointer transition-all duration-300 hover:opacity-80"
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid var(--border)',
                  background: 'var(--card)',
                  color: 'var(--foreground)',
                  fontSize: 12,
                }}
                itemStyle={{ color: 'var(--foreground)', fontWeight: 500 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-foreground">
              {data.departmentParticipants.toLocaleString('id-ID')}
            </span>
            <span className="text-xs text-muted-foreground">Peserta</span>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 md:w-auto md:min-w-[200px]">
          {items.map((item, i) => (
            <div
              key={item.key}
              className="group flex cursor-pointer items-center justify-between gap-6 rounded-lg border border-transparent bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/80"
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(undefined)}
            >
              <div className="flex items-center gap-3">
                <div
                  className="size-3.5 rounded-full shadow-sm transition-transform group-hover:scale-125"
                  style={{
                    backgroundColor: item.color,
                    boxShadow: `0 0 10px ${item.color}80`,
                  }}
                />
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {item.key}
                </span>
              </div>
              <span className="text-lg font-bold text-foreground">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
