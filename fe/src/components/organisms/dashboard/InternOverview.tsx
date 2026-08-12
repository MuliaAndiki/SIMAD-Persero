import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import type { InternDashboardResponse } from '@/types/api/dashboard.types';
import { Award, Bell, Briefcase, CalendarCheck, MapPin } from 'lucide-react';
import Link from 'next/link';

function attendanceStatusLabel(status: string | null): string {
  switch (status) {
    case 'ON_TIME':
      return 'Tepat Waktu';
    case 'LATE':
      return 'Terlambat';
    case 'PRESENT':
      return 'Hadir';
    case 'ABSENT':
      return 'Tidak Hadir';
    case 'INVALID':
      return 'Tidak Valid';
    default:
      return status ?? '-';
  }
}

function internshipStatusLabel(status: string | null): string {
  switch (status) {
    case 'DRAFT':
      return 'Draft';
    case 'PENDING':
      return 'Menunggu';
    case 'APPROVED':
      return 'Disetujui';
    case 'REJECTED':
      return 'Ditolak';
    case 'ACTIVE':
      return 'Aktif';
    case 'COMPLETED':
      return 'Selesai';
    case 'TERMINATED':
      return 'Diakhiri';
    case 'ARCHIVED':
      return 'Diarsipkan';
    default:
      return status ?? '-';
  }
}

function formatTime(value: string | null): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(value: string | null): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * InternOverview — ringkasan dashboard peserta magang (GET /dashboard/intern).
 * Presentasi murni; data disuplai oleh section/container.
 */
export function InternOverview({ data }: { data: InternDashboardResponse }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Magang aktif */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="size-4 text-primary" />
            Magang Aktif
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.internship ? (
            <div className="flex flex-col gap-3">
              <div>
                <Badge>{internshipStatusLabel(data.internship.status)}</Badge>
              </div>
              <div className="flex flex-col gap-1 text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="size-4 shrink-0" />
                  {data.internship.officeLocation?.name ?? 'Belum ada penempatan'}
                </span>
                <span className="text-muted-foreground">
                  Bidang: {data.internship.department?.name ?? '-'}
                </span>
                <span className="text-muted-foreground">
                  Periode: {formatDate(data.internship.actualStartDate)} –{' '}
                  {formatDate(data.internship.actualEndDate)}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <p className="text-sm text-muted-foreground">
                  Anda belum memiliki pengajuan magang yang disetujui. Ikuti tata cara pengajuan
                  magang berikut agar menu Absensi & Riwayat aktif:
                </p>
                <ol className="flex flex-col gap-2.5 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      1
                    </span>
                    <span>
                      Pastikan <strong>profil Anda lengkap</strong> pada menu Profil.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      2
                    </span>
                    <span>
                      Buka menu <strong>Pengajuan</strong> untuk memulai pengajuan magang.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      3
                    </span>
                    <span>Isi tanggal mulai & selesai magang serta motivasi Anda.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      4
                    </span>
                    <span>
                      Unggah surat pengantar <strong>(PDF, maks. 5 MB)</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      5
                    </span>
                    <span>
                      Klik <strong>Kirim Pengajuan</strong> lalu tunggu persetujuan HR.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      6
                    </span>
                    <span>
                      Setelah disetujui, <strong>Absensi</strong> & <strong>Riwayat</strong> akan
                      aktif otomatis.
                    </span>
                  </li>
                </ol>
              </div>
              <Button asChild size="sm" className="w-fit">
                <Link href="/INTERN/dashboard/application">Ajukan Magang Sekarang</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Absensi hari ini */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck className="size-4 text-primary" />
            Absensi Hari Ini
          </CardTitle>
          <CardDescription>
            {formatDate(data.todayAttendance?.attendanceDate ?? null)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.todayAttendance ? (
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Check-in</span>
                <span className="flex items-center gap-2 font-medium text-foreground">
                  {formatTime(data.todayAttendance.checkInAt)}
                  <Badge variant="secondary">
                    {attendanceStatusLabel(data.todayAttendance.checkInStatus)}
                  </Badge>
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Check-out</span>
                <span className="flex items-center gap-2 font-medium text-foreground">
                  {formatTime(data.todayAttendance.checkOutAt)}
                  <Badge variant="secondary">
                    {attendanceStatusLabel(data.todayAttendance.checkOutStatus)}
                  </Badge>
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
                <span className="text-muted-foreground">Status</span>
                <Badge>{attendanceStatusLabel(data.todayAttendance.attendanceStatus)}</Badge>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Belum ada absensi hari ini.</p>
          )}
        </CardContent>
      </Card>

      {/* Notifikasi */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="size-4 text-primary" />
            Notifikasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.notifications.length > 0 ? (
            <ul className="flex flex-col divide-y divide-border">
              {data.notifications.slice(0, 5).map((item) => (
                <li key={item.id} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-foreground">{item.title}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.message}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Tidak ada notifikasi.</p>
          )}
        </CardContent>
      </Card>

      {/* Sertifikat */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="size-4 text-primary" />
            Sertifikat
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.certificate ? (
            <div className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-foreground">
                {data.certificate.certificateNumber}
              </span>
              <span className="text-muted-foreground">
                Diterbitkan {formatDate(data.certificate.generatedAt)}
              </span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Belum ada sertifikat.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
