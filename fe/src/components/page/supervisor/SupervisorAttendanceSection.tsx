'use client';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import { OverrideAttendanceModal } from '@/components/organisms/attendance/OverrideAttendanceModal';
import type { AttendanceSupervisorRow } from '@/types/api/attendance.types';
import { formatDate } from '@/utils/string.format';
import { AlertCircle, CheckCircle2, Clock, Download, Edit3, Users, XCircle } from 'lucide-react';
import { useState } from 'react';

export interface SupervisorAttendanceSectionState {
  isPending: boolean;
  isOverridePending?: boolean;
  isError: boolean;
  errorMessage?: string;
  rows: AttendanceSupervisorRow[];
}

export interface SupervisorAttendanceSectionActions {
  onExport: () => void;
  onOverrideSubmit: (
    attendanceId: string,
    data: { status: 'PRESENT' | 'INVALID'; reason: string },
  ) => Promise<void>;
}

export interface SupervisorAttendanceSectionProps {
  state: SupervisorAttendanceSectionState;
  actions: SupervisorAttendanceSectionActions;
}

function AttendanceStatusBadge({ status }: { status: string | null }) {
  switch (status) {
    case 'PRESENT':
      return (
        <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-emerald-200">
          <CheckCircle2 className="mr-1 size-3" /> Hadir
        </Badge>
      );
    case 'LATE':
      return (
        <Badge className="bg-amber-500/15 text-amber-600 hover:bg-amber-500/25 border-amber-200">
          <Clock className="mr-1 size-3" /> Terlambat
        </Badge>
      );
    case 'INVALID':
    case 'ABSENT':
      return (
        <Badge className="bg-rose-500/15 text-rose-600 hover:bg-rose-500/25 border-rose-200">
          <XCircle className="mr-1 size-3" /> Tidak Hadir / Invalid
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-muted-foreground">
          Belum Absen
        </Badge>
      );
  }
}

export function SupervisorAttendanceSection({ state, actions }: SupervisorAttendanceSectionProps) {
  const [selectedAttendanceId, setSelectedAttendanceId] = useState<string | null>(null);
  const [selectedInternName, setSelectedInternName] = useState<string | undefined>();

  const handleOpenOverride = (attendanceId: string, internName?: string) => {
    setSelectedAttendanceId(attendanceId);
    setSelectedInternName(internName);
  };

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground">Absensi Peserta Bimbingan</h1>
          <p className="text-sm text-muted-foreground">
            Pantau status absensi harian seluruh peserta magang bimbingan Anda dan ekspor laporan.
          </p>
        </div>
        <Button onClick={actions.onExport} className="shrink-0">
          <Download className="mr-1.5 size-4" />
          Ekspor Laporan Excel
        </Button>
      </header>

      {state.isPending ? (
        <Card className="h-64" />
      ) : state.isError ? (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-semibold">Gagal memuat rekap absensi</p>
            <p className="opacity-90">{state.errorMessage}</p>
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Rekap Hari Ini</CardTitle>
            <CardDescription>{state.rows.length} anak bimbingan terdaftar</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {state.rows.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
                <Users className="size-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Belum ada peserta magang bimbingan yang terdaftar.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                      <th className="px-6 py-3 font-medium">Peserta Magang</th>
                      <th className="px-6 py-3 font-medium">Departemen</th>
                      <th className="px-6 py-3 font-medium">Check-In</th>
                      <th className="px-6 py-3 font-medium">Check-Out</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 text-right font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.rows.map((row) => {
                      const internName = row.internship.intern?.fullName ?? 'Peserta';
                      const att = row.todayAttendance;

                      return (
                        <tr
                          key={row.internship.id ?? internName}
                          className="border-b transition-colors last:border-0 hover:bg-muted/40"
                        >
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">{internName}</span>
                              <span className="text-xs text-muted-foreground">
                                {row.internship.intern?.email}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">{row.internship.department?.name ?? '-'}</td>
                          <td className="px-6 py-4">
                            {att?.checkInTime ? formatDate(att.checkInTime) : '-'}
                          </td>
                          <td className="px-6 py-4">
                            {att?.checkOutTime ? formatDate(att.checkOutTime) : '-'}
                          </td>
                          <td className="px-6 py-4">
                            <AttendanceStatusBadge status={att?.attendanceStatus ?? null} />
                          </td>
                          <td className="px-6 py-4 text-right">
                            {att?.id && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenOverride(att.id, internName)}
                              >
                                <Edit3 className="mr-1.5 size-3.5" />
                                Override
                              </Button>
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

      {/* Modal Override */}
      <OverrideAttendanceModal
        open={Boolean(selectedAttendanceId)}
        isPending={Boolean(state.isOverridePending)}
        attendanceId={selectedAttendanceId}
        internName={selectedInternName}
        onClose={() => setSelectedAttendanceId(null)}
        onSubmit={actions.onOverrideSubmit}
      />
    </section>
  );
}
