'use client';

import { Card, CardContent } from '@/components/atoms/card';
import { ReportError } from '@/components/organisms/reporting/ReportError';
import type { DashboardReportData } from '@/types/api/reporting.types';
import {
  Building2,
  CalendarCheck,
  CalendarClock,
  ClipboardCheck,
  FileCheck2,
  FileClock,
  Landmark,
  MapPin,
  Timer,
  UserCheck,
  Users,
} from 'lucide-react';

export interface DashboardReportGridProps {
  data: DashboardReportData | null;
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry: () => void;
}

/**
 * DashboardReportGrid — organism grid ringkasan statistik sistem (tab Ringkasan).
 */
export function DashboardReportGrid({
  data,
  isPending,
  isError,
  errorMessage,
  onRetry,
}: DashboardReportGridProps) {
  if (isPending) return <Card className="h-64" />;
  if (isError) return <ReportError message={errorMessage} onRetry={onRetry} />;

  if (!data) return null;

  const stats: { label: string; value: number; icon: typeof Users }[] = [
    { label: 'Departemen', value: data.totalDepartments, icon: Building2 },
    { label: 'Kantor', value: data.totalOffices, icon: MapPin },
    { label: 'Total Intern', value: data.totalInterns, icon: Users },
    {
      label: 'Total Pengajuan',
      value: data.totalApplications,
      icon: FileClock,
    },
    {
      label: 'Pengajuan Menunggu',
      value: data.pendingApplications,
      icon: CalendarClock,
    },
    {
      label: 'Pengajuan Disetujui',
      value: data.approvedApplications,
      icon: ClipboardCheck,
    },
    { label: 'Magang Aktif', value: data.activeInternships, icon: Timer },
    {
      label: 'Magang Selesai',
      value: data.completedInternships,
      icon: FileCheck2,
    },
    { label: 'Supervisor', value: data.totalSupervisors, icon: UserCheck },
    {
      label: 'Total Absensi',
      value: data.totalAttendance,
      icon: CalendarCheck,
    },
    {
      label: 'Absensi Hari Ini',
      value: data.attendanceToday,
      icon: CalendarCheck,
    },
    { label: 'Sertifikat', value: data.certificatesGenerated, icon: Landmark },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label}>
            <CardContent className="flex flex-col gap-2 p-4">
              <Icon className="size-5 text-muted-foreground" />
              <span className="text-2xl font-bold">{stat.value}</span>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
