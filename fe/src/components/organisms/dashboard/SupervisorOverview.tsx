import { StatCard } from '@/components/organisms/dashboard/StatCard';
import type { SupervisorDashboardData } from '@/types/api/dashboard.types';
import { AlertTriangle, CheckCircle2, Clock, Users } from 'lucide-react';

/**
 * SupervisorOverview — ringkasan dashboard supervisor (GET /dashboard/supervisor).
 * Presentasi murni; data disuplai oleh section/container.
 */
export function SupervisorOverview({
  data,
}: {
  data: SupervisorDashboardData;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={Users}
        label="Peserta Departemen"
        value={data.departmentParticipants}
        description="Peserta magang"
      />
      <StatCard
        icon={CheckCircle2}
        label="Hadir"
        value={data.present}
        description="Sudah check-in"
        tone="muted"
      />
      <StatCard
        icon={Clock}
        label="Belum Check-in"
        value={data.notCheckedIn}
        description="Belum hadir"
        tone="muted"
      />
      <StatCard
        icon={AlertTriangle}
        label="Absensi Tidak Valid"
        value={data.invalidAttendance}
        description="Perlu ditinjau"
        tone="muted"
      />
    </div>
  );
}
