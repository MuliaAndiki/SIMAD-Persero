'use client';

import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card';
import { AttendanceStatusBadge } from '@/components/organisms/attendance/AttendanceStatusBadge';
import Api from '@/services/props.service';
import type { AttendanceSupervisorRow } from '@/types/api/attendance.types';
import { AlertCircle, CalendarCheck2, Download, UsersRound } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export interface InternsSectionState {
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  rows: AttendanceSupervisorRow[];
}

export interface InternsSectionService {
  onRetry?: () => void;
}

export interface InternsSectionProps {
  state: InternsSectionState;
  service: InternsSectionService;
}

/**
 * InternsSection — daftar peserta magang yang ditugaskan ke supervisor
 * (GET /attendance/supervisor). Presentasi murni; data disuplai container
 * `/SUPERVISOR/dashboard/interns`.
 */
export function InternsSection({ state, service }: InternsSectionProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await Api.Attendance.DownloadExcel();
    } catch (error) {
      console.error('Failed to export:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground">Peserta Bimbingan</h1>
          <p className="text-sm text-muted-foreground">
            Daftar peserta magang yang ditugaskan kepada Anda beserta status absensi hari ini.
          </p>
        </header>

        <Button variant="outline" onClick={handleExport} disabled={isExporting}>
          <Download className="mr-2 size-4" />
          {isExporting ? 'Mengekspor...' : 'Export Excel'}
        </Button>
      </div>

      {state.isPending ? (
        <Card className="h-64" />
      ) : state.isError ? (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div className="flex flex-col gap-1 text-destructive">
            <p className="font-semibold">Gagal memuat data peserta</p>
            <p className="opacity-90">{state.errorMessage}</p>
            {service.onRetry ? (
              <Button variant="outline" size="sm" className="mt-2 w-fit" onClick={service.onRetry}>
                Coba Lagi
              </Button>
            ) : null}
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Absensi Hari Ini</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {state.rows.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
                <UsersRound className="size-10 text-muted-foreground/40" />
                <p className="text-sm font-medium">Belum ada peserta yang ditugaskan</p>
                <p className="text-sm text-muted-foreground">
                  Hubungi HR_ADMIN untuk menetapkan peserta magang kepada Anda.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                      <th className="px-6 py-3 font-medium">Peserta</th>
                      <th className="px-6 py-3 font-medium">Departemen</th>
                      <th className="px-6 py-3 font-medium">Status Hari Ini</th>
                      <th className="px-6 py-3 text-right font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.rows.map((row) => {
                      const intern = row.internship.intern;
                      const department = row.internship.department;
                      const today = row.todayAttendance;
                      return (
                        <tr
                          key={row.internship.id ?? intern?.id ?? 'unknown'}
                          className="border-b last:border-0"
                        >
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-medium">{intern?.fullName ?? '-'}</span>
                              <span className="text-xs text-muted-foreground">
                                {intern?.email ?? '-'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">{department?.name ?? '-'}</td>
                          <td className="px-6 py-4">
                            {today ? (
                              <AttendanceStatusBadge status={today.attendanceStatus} />
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                Belum absen hari ini
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {today ? (
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/SUPERVISOR/dashboard/attendance/${today.id}`}>
                                  <CalendarCheck2 className="size-4" />
                                  Lihat Absensi
                                </Link>
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </section>
  );
}
