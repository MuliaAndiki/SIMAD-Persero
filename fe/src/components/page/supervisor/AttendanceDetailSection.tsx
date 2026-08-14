'use client';

import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card';
import { AttendanceDetailField } from '@/components/organisms/attendance/AttendanceDetailField';
import { AttendanceLogsTable } from '@/components/organisms/attendance/AttendanceLogsTable';
import { AttendanceOverridesList } from '@/components/organisms/attendance/AttendanceOverridesList';
import { AttendanceStatusBadge } from '@/components/organisms/attendance/AttendanceStatusBadge';
import { AttendanceViolationsList } from '@/components/organisms/attendance/AttendanceViolationsList';
import {
  OverrideAttendanceDialog,
  type OverrideAttendanceFormField,
  type OverrideAttendanceFormState,
} from '@/components/organisms/attendance/OverrideAttendanceDialog';
import { formatDateTime, formatMinutes } from '@/components/organisms/attendance/attendance-format';
import type { AttendanceDetailResponse } from '@/types/api/attendance.types';
import { AlertCircle, ArrowLeft, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';

export interface AttendanceDetailSectionState {
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  detail: AttendanceDetailResponse | null;
  overrideOpen: boolean;
  overrideForm: OverrideAttendanceFormState;
  isOverridePending: boolean;
}

export interface AttendanceDetailSectionActions {
  onRetry?: () => void;
  onOpenOverride: () => void;
  onCloseOverride: () => void;
  onOverrideFieldChange: (field: OverrideAttendanceFormField, value: string) => void;
  onSubmitOverride: () => void | Promise<void>;
}

export interface AttendanceDetailSectionProps {
  state: AttendanceDetailSectionState;
  actions: AttendanceDetailSectionActions;
}

/**
 * AttendanceDetailSection — komposisi detail absensi peserta (supervisor).
 * Murni presentasi: tanpa fetch API, tanpa state fitur, tanpa komponen besar.
 * Kartu info disusun dari organism detail field; log/override/violation
 * di-extract ke organism masing-masing.
 */
export function AttendanceDetailSection({ state, actions }: AttendanceDetailSectionProps) {
  const detail = state.detail;

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Button asChild variant="ghost" size="sm" className="w-fit -ml-2">
          <Link href="/SUPERVISOR/dashboard/interns">
            <ArrowLeft className="size-4" />
            Kembali ke Peserta Bimbingan
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Detail Absensi</h1>
        <p className="text-sm text-muted-foreground">
          Review absensi peserta dan lakukan override bila diperlukan.
        </p>
      </header>

      {state.isPending ? (
        <Card className="h-64" />
      ) : state.isError || !detail ? (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div className="flex flex-col gap-1 text-destructive">
            <p className="font-semibold">Gagal memuat detail absensi</p>
            <p className="opacity-90">{state.errorMessage}</p>
            {actions.onRetry ? (
              <Button variant="outline" size="sm" className="mt-2 w-fit" onClick={actions.onRetry}>
                Coba Lagi
              </Button>
            ) : null}
          </div>
        </div>
      ) : (
        <>
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 border-b">
              <div className="flex flex-col gap-1">
                <CardTitle>{detail.intern?.fullName ?? 'Peserta tidak ditemukan'}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {detail.intern?.email ?? '-'} · {detail.department?.name ?? '-'}
                </p>
              </div>
              <AttendanceStatusBadge status={detail.attendanceStatus} />
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-3">
              <AttendanceDetailField
                label="Tanggal Absensi"
                value={formatDateTime(detail.attendanceDate)}
              />
              <AttendanceDetailField
                label="Status Check-in"
                value={
                  detail.checkInStatus ? (
                    <AttendanceStatusBadge status={detail.checkInStatus} />
                  ) : (
                    '-'
                  )
                }
              />
              <AttendanceDetailField
                label="Status Check-out"
                value={
                  detail.checkOutStatus ? (
                    <AttendanceStatusBadge status={detail.checkOutStatus} />
                  ) : (
                    '-'
                  )
                }
              />
              <AttendanceDetailField label="Check-in" value={formatDateTime(detail.checkInAt)} />
              <AttendanceDetailField label="Check-out" value={formatDateTime(detail.checkOutAt)} />
              <AttendanceDetailField
                label="Durasi Kerja"
                value={formatMinutes(detail.totalWorkMinutes)}
              />
            </CardContent>
            {detail.notes ? (
              <CardContent>
                <AttendanceDetailField label="Catatan" value={detail.notes} />
              </CardContent>
            ) : null}
            <CardContent className="border-t pt-6">
              <Button onClick={actions.onOpenOverride}>
                <SlidersHorizontal className="size-4" />
                Override Status
              </Button>
            </CardContent>
          </Card>

          {(detail.logs?.length ?? 0) > 0 ? <AttendanceLogsTable logs={detail.logs ?? []} /> : null}

          {(detail.overrides?.length ?? 0) > 0 ? (
            <AttendanceOverridesList overrides={detail.overrides ?? []} />
          ) : null}

          {(detail.violations?.length ?? 0) > 0 ? (
            <AttendanceViolationsList violations={detail.violations ?? []} />
          ) : null}
        </>
      )}

      <OverrideAttendanceDialog
        open={state.overrideOpen}
        form={state.overrideForm}
        isSubmitting={state.isOverridePending}
        onFieldChange={actions.onOverrideFieldChange}
        onClose={actions.onCloseOverride}
        onSubmit={actions.onSubmitOverride}
      />
    </section>
  );
}
