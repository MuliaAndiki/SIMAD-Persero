'use client';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card';
import type { AttendanceSupervisorRow } from '@/types/api/attendance.types';
import { formatDate } from '@/utils/string.format';
import { AlertCircle, CalendarDays, Eye, UsersRound } from 'lucide-react';
import Link from 'next/link';

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

function InternshipStatusBadge({ status }: { status?: string | null }) {
  switch (status) {
    case 'ACTIVE':
      return (
        <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-200 hover:bg-emerald-500/25">
          Aktif
        </Badge>
      );
    case 'COMPLETED':
    case 'CERTIFICATE_GENERATED':
      return (
        <Badge className="bg-blue-500/15 text-blue-600 border-blue-200 hover:bg-blue-500/25">
          Selesai
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-muted-foreground">
          {status ?? '-'}
        </Badge>
      );
  }
}

/**
 * InternsSection — daftar peserta magang yang ditugaskan ke supervisor.
 * Menampilkan info magang (departemen, periode) dengan aksi "Lihat Detail Intern".
 */
export function InternsSection({ state, service }: InternsSectionProps) {
  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Peserta Bimbingan</h1>
        <p className="text-sm text-muted-foreground">
          Daftar peserta magang yang ditugaskan kepada Anda. Klik "Lihat Detail" untuk melihat
          profil dan riwayat absensi lengkap.
        </p>
      </header>

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
            <CardTitle>Daftar Peserta ({state.rows.length})</CardTitle>
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
                      <th className="px-6 py-3 font-medium">Periode Magang</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 text-right font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.rows.map((row) => {
                      const intern = row.internship.intern;
                      const department = row.internship.department;
                      const internshipId = row.internship.id;

                      return (
                        <tr
                          key={internshipId ?? intern?.id ?? 'unknown'}
                          className="border-b transition-colors last:border-0 hover:bg-muted/40"
                        >
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">
                                {intern?.fullName ?? '-'}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {intern?.email ?? '-'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">{department?.name ?? '-'}</td>
                          <td className="px-6 py-4">
                            {row.internship.startDate || row.internship.endDate ? (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <CalendarDays className="size-3.5 shrink-0" />
                                <span>
                                  {row.internship.startDate
                                    ? formatDate(row.internship.startDate)
                                    : '?'}{' '}
                                  &ndash;{' '}
                                  {row.internship.endDate
                                    ? formatDate(row.internship.endDate)
                                    : '?'}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <InternshipStatusBadge status={row.internship.status} />
                          </td>
                          <td className="px-6 py-4 text-right">
                            {internshipId ? (
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/supervisor/interns/${internshipId}`}>
                                  <Eye className="mr-1.5 size-3.5" />
                                  Lihat Detail
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
