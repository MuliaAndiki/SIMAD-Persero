'use client';

import { Button } from '@/components/atoms/button';
import { Card } from '@/components/atoms/card';
import { Input } from '@/components/atoms/input';
import { TableLoader } from '@/components/atoms/loading';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select';
import { OverrideAttendanceModal } from '@/components/organisms/attendance/OverrideAttendanceModal';
import { DataTableCard } from '@/components/organisms/table/DataTableCard';
import { RowActionsMenu } from '@/components/organisms/table/RowActionsMenu';
import { StatusBadge } from '@/components/organisms/table/StatusBadge';
import type { AttendanceSupervisorRow } from '@/types/api/attendance.types';
import { formatDate, formatDateTime } from '@/utils/string.format';
import {
  AlertCircle,
  Calendar,
  CalendarCheck2,
  Edit3,
  Loader2,
  RefreshCw,
  RotateCcw,
  Search,
  Users,
} from 'lucide-react';
import { useState } from 'react';

export type DateFilterMode = 'today' | 'yesterday' | 'custom';

export interface SupervisorAttendanceSectionState {
  isPending: boolean;
  isFetching?: boolean;
  isOverridePending?: boolean;
  isError: boolean;
  errorMessage?: string;
  rows: AttendanceSupervisorRow[];
  allRowsCount: number;
  searchQuery: string;
  dateFilterMode: DateFilterMode;
  customDate: string;
  activeDate: string;
}

export interface SupervisorAttendanceSectionActions {
  onSearch: (value: string) => void;
  onDateFilterModeChange: (mode: DateFilterMode) => void;
  onCustomDateChange: (date: string) => void;
  onResetFilters: () => void;
  onRefresh?: () => void;
  onOverrideSubmit: (
    attendanceId: string,
    data: { type: 'CHECK_IN' | 'CHECK_OUT' | 'INVALID'; time?: string; reason: string },
  ) => Promise<void>;
}

export interface SupervisorAttendanceSectionProps {
  state: SupervisorAttendanceSectionState;
  actions: SupervisorAttendanceSectionActions;
}

export function SupervisorAttendanceSection({ state, actions }: SupervisorAttendanceSectionProps) {
  const [selectedAttendanceId, setSelectedAttendanceId] = useState<string | null>(null);
  const [selectedInternName, setSelectedInternName] = useState<string | undefined>();

  const handleOpenOverride = (attendanceId: string, internName?: string) => {
    setSelectedAttendanceId(attendanceId);
    setSelectedInternName(internName);
  };

  const renderTimeBlock = (dateString: string | null | undefined) => {
    if (!dateString) return <span className="text-muted-foreground">-</span>;
    const formatted = formatDateTime(dateString);
    const [datePart, timePart] = formatted.split(', ');
    if (!timePart) return <span>{formatted}</span>;

    return (
      <div className="flex flex-col">
        <span className="font-semibold text-foreground">{timePart}</span>
        <span className="text-xs text-muted-foreground">{datePart}</span>
      </div>
    );
  };

  const hasActiveFilter = Boolean(
    state.searchQuery || state.dateFilterMode !== 'today' || state.customDate,
  );

  return (
    <section className="flex flex-col gap-6">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground">Absensi Peserta Bimbingan</h1>
          <p className="text-sm text-muted-foreground">
            Pantau status absensi harian seluruh peserta magang bimbingan Anda, lakukan pencarian
            berdasarkan hari dan tanggal, serta ekspor laporan.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {actions.onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={actions.onRefresh}
              disabled={state.isFetching}
              className="w-fit"
            >
              <RefreshCw className={`mr-1.5 size-4 ${state.isFetching ? 'animate-spin' : ''}`} />
              Perbarui
            </Button>
          )}
        </div>
      </header>

      {/* Filter & Search Toolbar (sama seperti pola resepsionis) */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={state.searchQuery}
            onChange={(e) => actions.onSearch(e.target.value)}
            placeholder="Cari nama anak bimbingan, email, departemen, status, 'kemarin', 'hari ini'…"
            className="pl-9 pr-9"
          />
          {state.isFetching && (
            <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-primary" />
          )}
        </div>

        {/* Filter Tanggal / Hari */}
        <Select
          value={state.dateFilterMode}
          onValueChange={(value) => actions.onDateFilterModeChange(value as DateFilterMode)}
        >
          <SelectTrigger className="w-full lg:w-44">
            <SelectValue placeholder="Pilih Hari" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Hari Ini</SelectItem>
            <SelectItem value="yesterday">Kemarin</SelectItem>
            <SelectItem value="custom">Pilih Tanggal…</SelectItem>
          </SelectContent>
        </Select>

        {/* Input Tanggal Khusus jika mode custom */}
        {state.dateFilterMode === 'custom' && (
          <Input
            type="date"
            value={state.customDate}
            onChange={(e) => actions.onCustomDateChange(e.target.value)}
            className="w-full lg:w-44 h-9"
          />
        )}

        {/* Reset Filter Button */}
        {hasActiveFilter && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={actions.onResetFilters}
            className="text-xs text-muted-foreground hover:text-foreground h-9"
          >
            <RotateCcw className="mr-1.5 size-3.5" />
            Reset
          </Button>
        )}
      </div>

      {/* Info Banner Tanggal Aktif */}
      {state.activeDate && (
        <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3.5 py-2 text-xs text-primary">
          <Calendar className="size-4 shrink-0" />
          <span>
            Menampilkan absensi anak bimbingan untuk tanggal:{' '}
            <strong className="font-semibold">{formatDate(state.activeDate)}</strong>
            {state.dateFilterMode === 'yesterday' && ' (Kemarin)'}
            {state.dateFilterMode === 'today' && ' (Hari Ini)'}
          </span>
        </div>
      )}

      {state.isPending ? (
        <Card>
          <TableLoader label="Memuat absensi peserta bimbingan..." />
        </Card>
      ) : state.isError ? (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-semibold">Gagal memuat rekap absensi</p>
            <p className="opacity-90">{state.errorMessage}</p>
          </div>
        </div>
      ) : (
        <DataTableCard
          title={`Rekap Absensi: ${state.activeDate ? formatDate(state.activeDate) : 'Hari Ini'}`}
          description={
            hasActiveFilter
              ? `${state.rows.length} dari ${state.allRowsCount} anak bimbingan ditampilkan`
              : `${state.allRowsCount} anak bimbingan terdaftar`
          }
          columns={[
            { label: 'Peserta Magang' },
            { label: 'Departemen' },
            { label: 'Check-In' },
            { label: 'Check-Out' },
            { label: 'Status' },
            { label: 'Aksi', className: 'px-6 py-3 text-right font-medium' },
          ]}
          isEmpty={state.rows.length === 0}
          emptyIcon={Users}
          emptyMessage={
            hasActiveFilter
              ? 'Tidak ada data peserta bimbingan yang sesuai dengan pencarian atau filter tanggal.'
              : 'Belum ada peserta magang bimbingan yang terdaftar.'
          }
          emptyAction={
            hasActiveFilter ? (
              <Button
                variant="outline"
                size="sm"
                onClick={actions.onResetFilters}
                className="mt-2 text-xs"
              >
                <RotateCcw className="mr-1.5 size-3" />
                Reset Pencarian & Filter
              </Button>
            ) : undefined
          }
        >
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
                <td className="px-6 py-4">{renderTimeBlock(att?.checkInAt)}</td>
                <td className="px-6 py-4">{renderTimeBlock(att?.checkOutAt)}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={att?.attendanceStatus ?? null} />
                </td>
                <td className="px-6 py-4 text-right">
                  {att?.id && (
                    <RowActionsMenu
                      items={[
                        {
                          key: 'detail',
                          label: 'Lihat Absen',
                          icon: CalendarCheck2,
                          href: `/supervisor/attendance/${att.id}`,
                        },
                        {
                          key: 'override',
                          label: 'Override',
                          icon: Edit3,
                          onSelect: () => handleOpenOverride(att.id, internName),
                        },
                      ]}
                    />
                  )}
                </td>
              </tr>
            );
          })}
        </DataTableCard>
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
