'use client';

import { Button } from '@/components/atoms/button';
import { Card } from '@/components/atoms/card';
import { DataTableCard } from '@/components/organisms/table/DataTableCard';
import { RowActionsMenu } from '@/components/organisms/table/RowActionsMenu';
import { StatusBadge } from '@/components/organisms/table/StatusBadge';
import type { AttendanceSupervisorRow } from '@/types/api/attendance.types';
import { formatDate } from '@/utils/string.format';
import { AlertCircle, CalendarDays, Eye, UsersRound } from 'lucide-react';

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
        <DataTableCard
          title={`Daftar Peserta (${state.rows.length})`}
          columns={[
            { label: 'Peserta' },
            { label: 'Departemen' },
            { label: 'Periode Magang' },
            { label: 'Status' },
            { label: 'Aksi', className: 'px-6 py-3 text-right font-medium' },
          ]}
          isEmpty={state.rows.length === 0}
          emptyIcon={UsersRound}
          emptyTitle="Belum ada peserta yang ditugaskan"
          emptyMessage="Hubungi HR_ADMIN untuk menetapkan peserta magang kepada Anda."
        >
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
                    <span className="font-medium text-foreground">{intern?.fullName ?? '-'}</span>
                    <span className="text-xs text-muted-foreground">{intern?.email ?? '-'}</span>
                  </div>
                </td>
                <td className="px-6 py-4">{department?.name ?? '-'}</td>
                <td className="px-6 py-4">
                  {row.internship.startDate || row.internship.endDate ? (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarDays className="size-3.5 shrink-0" />
                      <span>
                        {row.internship.startDate ? formatDate(row.internship.startDate) : '?'}{' '}
                        &ndash; {row.internship.endDate ? formatDate(row.internship.endDate) : '?'}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={row.internship.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  {internshipId ? (
                    <RowActionsMenu
                      items={[
                        {
                          key: 'detail',
                          label: 'Lihat Detail',
                          icon: Eye,
                          href: `/supervisor/interns/${internshipId}`,
                        },
                      ]}
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </td>
              </tr>
            );
          })}
        </DataTableCard>
      )}
    </section>
  );
}
