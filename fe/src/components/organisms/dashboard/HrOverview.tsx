import { StatCard } from '@/components/organisms/dashboard/StatCard';
import type { HrDashboardResponse } from '@/types/api/dashboard.types';
import { Award, Briefcase, CalendarCheck, FileClock, Users } from 'lucide-react';

/**
 * HrOverview — ringkasan dashboard HR (GET /dashboard/hr).
 * Presentasi murni; data disuplai oleh section/container.
 */
export function HrOverview({ data }: { data: HrDashboardResponse }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <StatCard
        icon={FileClock}
        label="Pengajuan Menunggu"
        value={data.pendingApplications}
        description="Perlu direview"
      />
      <StatCard
        icon={Briefcase}
        label="Magang Aktif"
        value={data.activeInternships}
        description="Sedang berjalan"
        tone="muted"
      />
      <StatCard
        icon={CalendarCheck}
        label="Absensi Hari Ini"
        value={data.attendanceToday}
        description="Total check-in"
        tone="muted"
      />
      <StatCard
        icon={Award}
        label="Sertifikat Dibuat"
        value={data.certificatesGenerated}
        description="Total terbit"
        tone="muted"
      />
      <StatCard
        icon={Users}
        label="Total Supervisor"
        value={data.totalSupervisors}
        description="Terdaftar"
        tone="muted"
      />
    </div>
  );
}
