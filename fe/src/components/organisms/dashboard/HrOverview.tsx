import { Badge } from '@/components/atoms/badge';
import { StatCard } from '@/components/organisms/dashboard/StatCard';
import type { HrDashboardResponse } from '@/types/api/dashboard.types';
import { Award, Briefcase, CalendarCheck, FileClock, Users } from 'lucide-react';

/**
 * HrOverview — ringkasan dashboard HR (GET /dashboard/hr).
 * High-Density Executive KPI Ribbon.
 */
export function HrOverview({ data }: { data: HrDashboardResponse }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <StatCard
        icon={FileClock}
        label="Pengajuan Menunggu"
        value={data.pendingApplications}
        description="Perlu ditinjau"
        tone={data.pendingApplications > 0 ? 'warning' : 'muted'}
        badge={
          data.pendingApplications > 0 ? (
            <Badge
              variant="outline"
              className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] px-1.5 py-0"
            >
              Perlu Review
            </Badge>
          ) : undefined
        }
        className="col-span-2 sm:col-span-1"
      />
      <StatCard
        icon={Briefcase}
        label="Magang Aktif"
        value={data.activeInternships}
        description="Peserta aktif berjalan"
        tone="primary"
      />
      <StatCard
        icon={CalendarCheck}
        label="Absensi Hari Ini"
        value={data.attendanceToday}
        description="Total presensi masuk"
        tone="success"
      />
      <StatCard
        icon={Award}
        label="Sertifikat Terbit"
        value={data.certificatesGenerated}
        description="Telah diverifikasi"
        tone="info"
      />
      <StatCard
        icon={Users}
        label="Total Mentor"
        value={data.totalSupervisors}
        description="Pembimbing terdaftar"
        tone="muted"
      />
    </div>
  );
}
