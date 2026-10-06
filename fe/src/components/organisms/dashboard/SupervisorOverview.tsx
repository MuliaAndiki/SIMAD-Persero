import { Badge } from '@/components/atoms/badge';
import { StatCard } from '@/components/organisms/dashboard/StatCard';
import type { SupervisorDashboardData } from '@/types/api/dashboard.types';
import { AlertTriangle, CheckCircle2, Clock, Users } from 'lucide-react';

/**
 * SupervisorOverview — ringkasan operasional dashboard supervisor (GET /dashboard/supervisor).
 * High-Density Enterprise UI.
 */
export function SupervisorOverview({
  data,
}: {
  data: SupervisorDashboardData;
}) {
  const presenceRatio =
    data.departmentParticipants > 0
      ? `${Math.round((data.present / data.departmentParticipants) * 100)}%`
      : '0%';

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={Users}
        label="Peserta Departemen"
        value={data.departmentParticipants}
        description="Total anak bimbingan"
        tone="primary"
      />
      <StatCard
        icon={CheckCircle2}
        label="Hadir Hari Ini"
        value={data.present}
        description={`${presenceRatio} dari total peserta`}
        tone="success"
        badge={
          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] px-1.5 py-0"
          >
            {presenceRatio}
          </Badge>
        }
      />
      <StatCard
        icon={Clock}
        label="Belum Check-In"
        value={data.notCheckedIn}
        description="Belum absen masuk"
        tone={data.notCheckedIn > 0 ? 'warning' : 'muted'}
      />
      <StatCard
        icon={AlertTriangle}
        label="Presensi Tidak Valid"
        value={data.invalidAttendance}
        description="Perlu review / override"
        tone={data.invalidAttendance > 0 ? 'destructive' : 'muted'}
        badge={
          data.invalidAttendance > 0 ? (
            <Badge
              variant="outline"
              className="border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] px-1.5 py-0"
            >
              Perlu Ditinjau
            </Badge>
          ) : undefined
        }
      />
    </div>
  );
}
