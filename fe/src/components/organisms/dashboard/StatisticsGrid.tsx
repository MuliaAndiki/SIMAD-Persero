import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import type { DashboardStatistics } from '@/types/api/dashboard.types';
import {
  Award,
  BadgeCheck,
  Briefcase,
  Building2,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FileClock,
  GraduationCap,
  MapPin,
  UserCog,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

function StatItem({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" />
      </div>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-lg font-bold leading-tight text-foreground">
          {value.toLocaleString('id-ID')}
        </span>
      </div>
    </div>
  );
}

function StatGroup({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="space-y-0.5">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">{items}</CardContent>
    </Card>
  );
}

/**
 * StatisticsGrid — statistik sistem HR (GET /dashboard/statistics).
 * Presentasi murni; data disuplai oleh section/container.
 */
export function StatisticsGrid({ data }: { data: DashboardStatistics }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <StatGroup
        title="Pengguna & Organisasi"
        description="Jumlah pengguna dan struktur organisasi"
        items={
          <>
            <StatItem icon={Users} label="Total Pengguna" value={data.totalUsers} />
            <StatItem icon={GraduationCap} label="Peserta Magang" value={data.totalInterns} />
            <StatItem icon={Building2} label="Bidang" value={data.totalDepartments} />
            <StatItem icon={MapPin} label="Lokasi Kantor" value={data.totalOffices} />
          </>
        }
      />
      <StatGroup
        title="Pengajuan Magang"
        description="Siklus pengajuan yang tercatat"
        items={
          <>
            <StatItem icon={ClipboardList} label="Total Pengajuan" value={data.totalApplications} />
            <StatItem icon={FileClock} label="Menunggu Review" value={data.pendingApplications} />
            <StatItem icon={CheckCircle2} label="Disetujui" value={data.approvedApplications} />
          </>
        }
      />
      <StatGroup
        title="Magang"
        description="Status program magang"
        items={
          <>
            <StatItem icon={Briefcase} label="Magang Aktif" value={data.activeInternships} />
            <StatItem icon={Award} label="Magang Selesai" value={data.completedInternships} />
          </>
        }
      />
      <StatGroup
        title="Operasional"
        description="Supervisor, absensi, dan sertifikat"
        items={
          <>
            <StatItem icon={UserCog} label="Total Supervisor" value={data.totalSupervisors} />
            <StatItem icon={CalendarCheck} label="Total Absensi" value={data.totalAttendance} />
            <StatItem icon={CalendarClock} label="Absensi Hari Ini" value={data.attendanceToday} />
            <StatItem
              icon={BadgeCheck}
              label="Sertifikat Dibuat"
              value={data.certificatesGenerated}
            />
          </>
        }
      />
    </div>
  );
}
