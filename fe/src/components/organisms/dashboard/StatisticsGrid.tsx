'use client';

import { Card } from '@/components/atoms/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/atoms/tabs';
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
    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3 shadow-sm transition-all hover:border-primary/30 hover:shadow-md sm:gap-3.5 sm:p-4">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:size-10">
        <Icon className="size-4 sm:size-5" />
      </div>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-[11px] font-medium text-muted-foreground sm:text-xs">
          {label}
        </span>
        <span className="text-base font-bold leading-tight text-foreground sm:text-xl">
          {value.toLocaleString('id-ID')}
        </span>
      </div>
    </div>
  );
}

/**
 * StatisticsGrid — statistik sistem HR dengan Tab Aktif (GET /dashboard/statistics).
 * Sangat responsif & nyaman digunakan pada ukuran layar mobile maupun desktop.
 */
export function StatisticsGrid({ data }: { data: DashboardStatistics }) {
  return (
    <Card className="flex flex-col gap-3.5 p-3.5 sm:gap-4 sm:p-5">
      <div className="flex flex-col gap-0.5">
        <h3 className="text-sm font-bold text-foreground sm:text-base">Statistik Detail Sistem</h3>
        <p className="text-[11px] text-muted-foreground sm:text-xs">
          Geser / pilih tab untuk memantau data statistik spesifik.
        </p>
      </div>

      <Tabs defaultValue="organisasi" className="w-full min-w-0">
        <TabsList className="w-full max-w-full overflow-x-auto whitespace-nowrap scrollbar-none flex-nowrap justify-start">
          <TabsTrigger value="organisasi" className="flex items-center gap-1.5 text-xs">
            <Building2 className="size-3.5" />
            <span>Organisasi</span>
          </TabsTrigger>
          <TabsTrigger value="pengajuan" className="flex items-center gap-1.5 text-xs">
            <ClipboardList className="size-3.5" />
            <span>Pengajuan</span>
          </TabsTrigger>
          <TabsTrigger value="magang" className="flex items-center gap-1.5 text-xs">
            <Briefcase className="size-3.5" />
            <span>Program Magang</span>
          </TabsTrigger>
          <TabsTrigger value="operasional" className="flex items-center gap-1.5 text-xs">
            <UserCog className="size-3.5" />
            <span>Operasional</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organisasi" className="mt-2.5 sm:mt-3">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            <StatItem icon={Users} label="Total Pengguna" value={data.totalUsers} />
            <StatItem icon={GraduationCap} label="Peserta Magang" value={data.totalInterns} />
            <StatItem icon={Building2} label="Bidang / Dept" value={data.totalDepartments} />
            <StatItem icon={MapPin} label="Lokasi Kantor" value={data.totalOffices} />
          </div>
        </TabsContent>

        <TabsContent value="pengajuan" className="mt-2.5 sm:mt-3">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            <StatItem icon={ClipboardList} label="Total Pengajuan" value={data.totalApplications} />
            <StatItem icon={FileClock} label="Menunggu Review" value={data.pendingApplications} />
            <StatItem icon={CheckCircle2} label="Disetujui" value={data.approvedApplications} />
          </div>
        </TabsContent>

        <TabsContent value="magang" className="mt-2.5 sm:mt-3">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2">
            <StatItem icon={Briefcase} label="Magang Aktif" value={data.activeInternships} />
            <StatItem icon={Award} label="Magang Selesai" value={data.completedInternships} />
          </div>
        </TabsContent>

        <TabsContent value="operasional" className="mt-2.5 sm:mt-3">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            <StatItem icon={UserCog} label="Total Supervisor" value={data.totalSupervisors} />
            <StatItem icon={CalendarCheck} label="Total Absensi" value={data.totalAttendance} />
            <StatItem icon={CalendarClock} label="Absensi Hari Ini" value={data.attendanceToday} />
            <StatItem
              icon={BadgeCheck}
              label="Sertifikat Dibuat"
              value={data.certificatesGenerated}
            />
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
