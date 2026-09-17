'use client';

import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card';
import { useApi } from '@/hooks/useService/useApi';
import AttendanceService from '@/services/api/attendance.service';
import { formatDate } from '@/utils/string.format';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CalendarDays,
  Download,
  GraduationCap,
  Loader2,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

function DetailField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-sm text-foreground">{value ?? '-'}</span>
    </div>
  );
}

/**
 * Halaman detail intern untuk supervisor — GET /internships/:id.
 * Menampilkan profil, periode magang, departemen, supervisor, dan tautan ekspor.
 */
export default function SupervisorInternDetailContainer() {
  const params = useParams<{ internshipId: string }>();
  const internshipId = params.internshipId;

  const api = useApi();
  const [isExportPending, setIsExportPending] = useState(false);

  const internship = api.internship.query.detail(
    { id: internshipId },
    { enabled: Boolean(internshipId) },
  );

  const handleExport = async () => {
    if (!internshipId) return;
    try {
      setIsExportPending(true);
      toast.loading('Mengekspor laporan absensi...', { id: 'export-intern-detail' });
      await AttendanceService.DownloadExcel({ internshipId });
      toast.success('Laporan absensi berhasil diunduh', { id: 'export-intern-detail' });
    } catch (error) {
      console.error('Failed to export:', error);
      toast.error('Gagal mengekspor laporan absensi', { id: 'export-intern-detail' });
    } finally {
      setIsExportPending(false);
    }
  };

  const data = internship.data;
  const profile = data?.internProfile;
  const institution = profile?.institution;
  const major = profile?.major;

  return (
    <section className="flex flex-col gap-6">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
            <Link href="/supervisor/interns">
              <ArrowLeft className="size-4" />
              Kembali ke Peserta Bimbingan
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Detail Peserta Magang</h1>
          <p className="text-sm text-muted-foreground">
            Profil lengkap dan informasi magang peserta bimbingan Anda.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/supervisor/attendance`}>
              <CalendarDays className="mr-1.5 size-4" />
              Lihat Absensi
            </Link>
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleExport}
            disabled={isExportPending || internship.isPending}
          >
            {isExportPending ? (
              <Loader2 className="mr-1.5 size-4 animate-spin" />
            ) : (
              <Download className="mr-1.5 size-4" />
            )}
            Ekspor Excel
          </Button>
        </div>
      </header>

      {/* Loading state */}
      {internship.isPending ? (
        <Card className="h-64" />
      ) : internship.isError || !data ? (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div className="flex flex-col gap-1 text-destructive">
            <p className="font-semibold">Gagal memuat data peserta</p>
            <p className="opacity-90">{internship.error?.message ?? 'Data tidak ditemukan'}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-fit"
              onClick={() => internship.refetch()}
            >
              Coba Lagi
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Identitas Peserta */}
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center gap-2">
                <User className="size-4 text-muted-foreground" />
                <CardTitle>Identitas Peserta</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-5 pt-6 sm:grid-cols-2 lg:grid-cols-3">
              <DetailField label="Nama Lengkap" value={profile?.user?.fullName} />
              <DetailField label="Email" value={profile?.user?.email} />
              <DetailField label="Nomor Mahasiswa" value={profile?.studentNumber} />
            </CardContent>
          </Card>

          {/* Info Institusi */}
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center gap-2">
                <GraduationCap className="size-4 text-muted-foreground" />
                <CardTitle>Institusi & Program Studi</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-5 pt-6 sm:grid-cols-2 lg:grid-cols-3">
              <DetailField label="Institusi" value={institution?.name} />
              <DetailField label="Kode / Singkatan" value={institution?.shortName} />
              <DetailField label="Kota" value={institution?.city} />
              <DetailField label="Provinsi" value={institution?.province} />
              <DetailField label="Program Studi" value={major?.name} />
            </CardContent>
          </Card>

          {/* Info Magang */}
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center gap-2">
                <Building2 className="size-4 text-muted-foreground" />
                <CardTitle>Informasi Magang</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-5 pt-6 sm:grid-cols-2 lg:grid-cols-3">
              <DetailField label="Departemen" value={data.department?.name} />
              <DetailField label="Lokasi Kantor" value={data.officeLocation?.name} />
              <DetailField label="Status" value={data.status} />
              <DetailField label="Tanggal Mulai" value={formatDate(data.actualStartDate ?? null)} />
              <DetailField label="Tanggal Selesai" value={formatDate(data.actualEndDate ?? null)} />
            </CardContent>
          </Card>
        </>
      )}
    </section>
  );
}
