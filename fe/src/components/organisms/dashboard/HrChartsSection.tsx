import type { ChartsResponse } from '@/types/api/dashboard.types';
import { AttendanceTrendChart } from './AttendanceTrendChart';
import { DepartmentDistributionChart } from './DepartmentDistributionChart';
import { InternshipTrendChart } from './InternshipTrendChart';

/**
 * HrChartsSection — komposisi grafik dashboard HR (GET /dashboard/charts).
 * Presentasi murni; data disuplai oleh section/container.
 */
export function HrChartsSection({ charts }: { charts: ChartsResponse }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <AttendanceTrendChart data={charts.attendanceTrend} />
      </div>
      <DepartmentDistributionChart data={charts.departmentDistribution} />
      <div className="lg:col-span-3">
        <InternshipTrendChart data={charts.internshipTrend} />
      </div>
    </div>
  );
}
