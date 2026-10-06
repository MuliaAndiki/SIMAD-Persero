'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/card';
import { ReportError } from '@/components/organisms/reporting/ReportError';
import { StatCard } from '@/components/organisms/dashboard/StatCard';
import type { DashboardReportData } from '@/types/api/reporting.types';
import {
  Award,
  Building2,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  FileCheck2,
  FileClock,
  GraduationCap,
  MapPin,
  ShieldCheck,
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
 * DashboardReportGrid — High-Density Categorized KPI Matrix (tab Ringkasan Laporan).
 */
export function DashboardReportGrid({
  data,
  isPending,
  isError,
  errorMessage,
  onRetry,
}: DashboardReportGridProps) {
  if (isPending) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="h-44 animate-pulse bg-muted/40" />
        <Card className="h-44 animate-pulse bg-muted/40" />
        <Card className="h-44 animate-pulse bg-muted/40" />
        <Card className="h-44 animate-pulse bg-muted/40" />
      </div>
    );
  }
  if (isError) return <ReportError message={errorMessage} onRetry={onRetry} />;

  if (!data) return null;

  return (
    <div className="flex flex-col gap-5">
      {/* 1. Organisasi & Entitas */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="size-4 text-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Struktur Organisasi & Entitas
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard
            icon={Building2}
            label="Bidang / Departemen"
            value={data.totalDepartments}
            description="Divisi aktif"
            tone="muted"
          />
          <StatCard
            icon={MapPin}
            label="Lokasi Kantor Unit"
            value={data.totalOffices}
            description="Unit cabang PLN"
            tone="muted"
          />
          <StatCard
            icon={Users}
            label="Total Peserta Terdaftar"
            value={data.totalInterns}
            description="Akun magang"
            tone="primary"
          />
        </div>
      </Card>

      {/* 2. Pengajuan & Seleksi Berkas */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileClock className="size-4 text-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Alur Pengajuan & Seleksi
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard
            icon={FileClock}
            label="Total Pengajuan"
            value={data.totalApplications}
            description="Seluruh periode"
            tone="muted"
          />
          <StatCard
            icon={CalendarClock}
            label="Pengajuan Menunggu"
            value={data.pendingApplications}
            description="Perlu tindakan HR"
            tone={data.pendingApplications > 0 ? 'warning' : 'muted'}
          />
          <StatCard
            icon={CheckCircle2}
            label="Pengajuan Disetujui"
            value={data.approvedApplications}
            description="Lolos seleksi berkas"
            tone="success"
          />
        </div>
      </Card>

      {/* 3. Program Magang & Mentor */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap className="size-4 text-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Pelaksanaan Magang & Pembimbing
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard
            icon={Timer}
            label="Magang Aktif"
            value={data.activeInternships}
            description="Dalam masa aktif"
            tone="primary"
          />
          <StatCard
            icon={FileCheck2}
            label="Magang Selesai"
            value={data.completedInternships}
            description="Telah lulus program"
            tone="success"
          />
          <StatCard
            icon={UserCheck}
            label="Total Pembimbing"
            value={data.totalSupervisors}
            description="Mentor pembimbing"
            tone="muted"
          />
        </div>
      </Card>

      {/* 4. Operasional Presensi & Sertifikasi */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="size-4 text-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Operasional Presensi & Sertifikat
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard
            icon={CalendarCheck}
            label="Total Log Presensi"
            value={data.totalAttendance}
            description="Akumulasi log presensi"
            tone="info"
          />
          <StatCard
            icon={CalendarClock}
            label="Presensi Hari Ini"
            value={data.attendanceToday}
            description="Masuk hari ini"
            tone="success"
          />
          <StatCard
            icon={Award}
            label="Sertifikat Diterbitkan"
            value={data.certificatesGenerated}
            description="Resmi bertanda digital"
            tone="info"
          />
        </div>
      </Card>
    </div>
  );
}
