import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import { useId } from 'react';
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

/** Seri absensi 2 label: Hadir & Tidak Hadir (warna token chart dari tema). */
const ATTENDANCE_SERIES = [
  { key: 'hadir', name: 'Hadir', color: 'var(--chart-3)' },
  { key: 'tidakHadir', name: 'Tidak Hadir', color: 'var(--chart-5)' },
] as const;

/** Titik data yang diterima komponen — `label` sudah diformat oleh pemanggil. */
export interface AttendanceTrendDatum {
  label: string;
  hadir: number;
  tidakHadir: number;
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
 * AttendanceTrendChart — tren absensi (stacked area) dengan 2 label
 * Hadir / Tidak Hadir. Dipakai bersama oleh dashboard HR (bulanan) dan
 * supervisor (7/30 hari); data `label` disuplai sudah terformat.
 */
export function AttendanceTrendChart({
  data,
  title = 'Tren Absensi',
  description,
}: {
  data: AttendanceTrendDatum[];
  title?: string;
  description?: string;
}) {
  const uid = useId().replace(/[:]/g, '');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <defs>
                {ATTENDANCE_SERIES.map((series) => (
                  <linearGradient
                    key={series.key}
                    id={`attendance-${series.key}-${uid}`}
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
                  fill={`url(#attendance-${series.key}-${uid})`}
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
