import type { ChartsResponse } from '@/types/api/dashboard.types';
import { AttendanceTrendChart, type AttendanceTrendDatum } from './AttendanceTrendChart';
import { DepartmentDistributionChart } from './DepartmentDistributionChart';
import { InternshipTrendChart } from './InternshipTrendChart';

function monthLabel(month: string): string {
  const [year, monthNum] = month.split('-').map(Number);
  if (!year || !monthNum) return month;
  return new Date(year, monthNum - 1, 1).toLocaleDateString('id-ID', {
    month: 'short',
  });
}

/** Petakan tren absensi HR (present/late/invalid) ke 2 label Hadir / Tidak Hadir. */
function toAttendanceDatum(points: ChartsResponse['attendanceTrend']): AttendanceTrendDatum[] {
  return points.map((point) => ({
    label: monthLabel(point.month),
    hadir: point.present + point.late,
    tidakHadir: point.invalid,
  }));
}

/**
 * HrChartsSection — komposisi grafik dashboard HR (GET /dashboard/charts).
 * Presentasi murni; data disuplai oleh section/container.
 */
export function HrChartsSection({ charts }: { charts: ChartsResponse }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <AttendanceTrendChart
          data={toAttendanceDatum(charts.attendanceTrend)}
          description="6 bulan terakhir"
        />
      </div>
      <DepartmentDistributionChart data={charts.departmentDistribution} />
      <div className="lg:col-span-3">
        <InternshipTrendChart data={charts.internshipTrend} />
      </div>
    </div>
  );
}
