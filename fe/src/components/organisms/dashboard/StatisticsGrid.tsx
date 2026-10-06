'use client';

import { Card } from '@/components/atoms/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/atoms/tabs';
import { StatCard } from '@/components/organisms/dashboard/StatCard';
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
            <StatCard
              icon={Users}
              label="Total Pengguna"
              value={data.totalUsers.toLocaleString('id-ID')}
              description="Akun terdaftar"
              tone="primary"
            />
            <StatCard
              icon={GraduationCap}
              label="Peserta Magang"
              value={data.totalInterns.toLocaleString('id-ID')}
              description="Mahasiswa/Siswa"
              tone="info"
            />
            <StatCard
              icon={Building2}
              label="Bidang / Dept"
              value={data.totalDepartments.toLocaleString('id-ID')}
              description="Divisi aktif"
              tone="muted"
            />
            <StatCard
              icon={MapPin}
              label="Lokasi Kantor"
              value={data.totalOffices.toLocaleString('id-ID')}
              description="Unit PLN terhubung"
              tone="muted"
            />
          </div>
        </TabsContent>

        <TabsContent value="pengajuan" className="mt-2.5 sm:mt-3">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            <StatCard
              icon={ClipboardList}
              label="Total Pengajuan"
              value={data.totalApplications.toLocaleString('id-ID')}
              description="Semua periode"
              tone="muted"
            />
            <StatCard
              icon={FileClock}
              label="Menunggu Review"
              value={data.pendingApplications.toLocaleString('id-ID')}
              description="Perlu tindakan HR"
              tone={data.pendingApplications > 0 ? 'warning' : 'muted'}
            />
            <StatCard
              icon={CheckCircle2}
              label="Disetujui"
              value={data.approvedApplications.toLocaleString('id-ID')}
              description="Lolos seleksi berkas"
              tone="success"
            />
          </div>
        </TabsContent>

        <TabsContent value="magang" className="mt-2.5 sm:mt-3">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2">
            <StatCard
              icon={Briefcase}
              label="Magang Aktif"
              value={data.activeInternships.toLocaleString('id-ID')}
              description="Sedang dalam penempatan"
              tone="primary"
            />
            <StatCard
              icon={Award}
              label="Magang Selesai"
              value={data.completedInternships.toLocaleString('id-ID')}
              description="Telah menyelesaikan program"
              tone="success"
            />
          </div>
        </TabsContent>

        <TabsContent value="operasional" className="mt-2.5 sm:mt-3">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={UserCog}
              label="Total Mentor"
              value={data.totalSupervisors.toLocaleString('id-ID')}
              description="Pembimbing aktif"
              tone="muted"
            />
            <StatCard
              icon={CalendarCheck}
              label="Total Absensi"
              value={data.totalAttendance.toLocaleString('id-ID')}
              description="Log terakumulasi"
              tone="info"
            />
            <StatCard
              icon={CalendarClock}
              label="Absensi Hari Ini"
              value={data.attendanceToday.toLocaleString('id-ID')}
              description="Presensi masuk hari ini"
              tone="success"
            />
            <StatCard
              icon={BadgeCheck}
              label="Sertifikat Dibuat"
              value={data.certificatesGenerated.toLocaleString('id-ID')}
              description="Terbit secara resmi"
              tone="info"
            />
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
