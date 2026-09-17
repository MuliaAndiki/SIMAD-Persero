import type { SupervisorAttendanceTrendPoint } from '@/types/api/dashboard.types';
import { AttendanceTrendChart, type AttendanceTrendDatum } from './AttendanceTrendChart';

/** Format "YYYY-MM-DD" menjadi label ringkas untuk sumbu X. */
function dayLabel(date: string, compact: boolean): string {
  const [year, month, day] = date.split('-').map(Number);
  if (!year || !month || !day) return date;
  return new Date(year, month - 1, day).toLocaleDateString('id-ID', {
    ...(compact ? { day: '2-digit', month: 'short' } : { weekday: 'short', day: '2-digit' }),
  });
}

function toDatum(
  points: SupervisorAttendanceTrendPoint[],
  compact: boolean,
): AttendanceTrendDatum[] {
  return points.map((point) => ({
    label: dayLabel(point.date, compact),
    hadir: point.hadir,
    tidakHadir: point.tidakHadir,
  }));
}

/**
 * SupervisorTrendCharts — tren absensi harian 7 & 30 hari peserta bimbingan.
 * Memakai ulang AttendanceTrendChart (2 label: Hadir / Tidak Hadir).
 */
export function SupervisorTrendCharts({
  trend7,
  trend30,
}: {
  trend7: SupervisorAttendanceTrendPoint[];
  trend30: SupervisorAttendanceTrendPoint[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <AttendanceTrendChart
        data={toDatum(trend7, false)}
        title="Tren Absensi 7 Hari"
        description="Hadir vs tidak hadir peserta bimbingan"
      />
      <AttendanceTrendChart
        data={toDatum(trend30, true)}
        title="Tren Absensi 30 Hari"
        description="Hadir vs tidak hadir peserta bimbingan"
      />
    </div>
  );
}
