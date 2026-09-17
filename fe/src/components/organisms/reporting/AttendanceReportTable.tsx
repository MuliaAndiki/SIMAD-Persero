'use client';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select';
import { ReportError } from '@/components/organisms/reporting/ReportError';
import Api from '@/services/props.service';
import type { InternshipResponse } from '@/types/api/internship.types';
import type { OfficeResponse } from '@/types/api/office.types';
import type { AttendanceReportRow } from '@/types/api/reporting.types';
import { formatDate } from '@/utils/string.format';
import {
  ArrowRight,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Download,
  GraduationCap,
  RotateCcw,
  User,
  UserCheck,
} from 'lucide-react';
import { useMemo, useState } from 'react';

const MONTH_OPTIONS = [
  { value: '1', label: 'Januari' },
  { value: '2', label: 'Februari' },
  { value: '3', label: 'Maret' },
  { value: '4', label: 'April' },
  { value: '5', label: 'Mei' },
  { value: '6', label: 'Juni' },
  { value: '7', label: 'Juli' },
  { value: '8', label: 'Agustus' },
  { value: '9', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR - 2, CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];

export interface AttendanceReportTableProps {
  rows: AttendanceReportRow[];
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry: () => void;
  offices: OfficeResponse[];
  allInternships: InternshipResponse[];
  selectedOfficeId: string;
  selectedDepartmentId: string;
  selectedInternshipId: string;
  selectedMonth?: number;
  selectedYear?: number;
  onSelectOffice: (id: string) => void;
  onSelectDepartment: (id: string) => void;
  onSelectInternship: (id: string) => void;
  onSelectMonth: (month?: number) => void;
  onSelectYear: (year?: number) => void;
  onResetFilter: () => void;
}

export function AttendanceReportTable({
  rows,
  isPending,
  isError,
  errorMessage,
  onRetry,
  offices,
  allInternships,
  selectedOfficeId,
  selectedDepartmentId,
  selectedInternshipId,
  selectedMonth,
  selectedYear,
  onSelectOffice,
  onSelectDepartment,
  onSelectInternship,
  onSelectMonth,
  onSelectYear,
  onResetFilter,
}: AttendanceReportTableProps) {
  const [isExporting, setIsExporting] = useState(false);

  // Departemen yang tersedia di kantor yang dipilih
  const availableDepartments = useMemo(() => {
    if (!selectedOfficeId) return [];
    const office = offices.find((o) => o.id === selectedOfficeId);
    return office?.departments ?? [];
  }, [offices, selectedOfficeId]);

  // Peserta magang yang berada di kantor & departemen yang dipilih
  const availableInternships = useMemo(() => {
    if (!selectedDepartmentId) return [];
    return allInternships.filter((internship) => {
      const matchOffice = selectedOfficeId
        ? internship.officeLocation?.id === selectedOfficeId
        : true;
      const matchDept = internship.department?.id === selectedDepartmentId;
      return matchOffice && matchDept;
    });
  }, [allInternships, selectedOfficeId, selectedDepartmentId]);

  // Detail intern yang sedang dipilih
  const selectedInternship = useMemo(() => {
    if (!selectedInternshipId) return null;
    return allInternships.find((i) => i.id === selectedInternshipId) ?? null;
  }, [allInternships, selectedInternshipId]);

  const selectedOffice = useMemo(() => {
    return offices.find((o) => o.id === selectedOfficeId) ?? null;
  }, [offices, selectedOfficeId]);

  const selectedDept = useMemo(() => {
    return availableDepartments.find((d) => d.id === selectedDepartmentId) ?? null;
  }, [availableDepartments, selectedDepartmentId]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await Api.Attendance.DownloadExcel({
        internshipId: selectedInternshipId || undefined,
        departmentId: selectedDepartmentId || undefined,
        officeLocationId: selectedOfficeId || undefined,
        month: selectedMonth,
        year: selectedYear,
      });
    } catch (error) {
      console.error('Gagal mengekspor data absensi:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const totalPresent = rows.filter((r) => r.status === 'PRESENT').length;
  const totalWorkMinutes = rows.reduce((acc, r) => acc + (r.totalWorkMinutes || 0), 0);

  return (
    <div className="flex flex-col gap-6">
      {/* ─── Filter Bertahap (Cascading Stepper & Dropdowns) ─── */}
      <Card className="border shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Filter Bertahap Laporan Absensi
              </CardTitle>
              <CardDescription className="text-xs">
                Pilih Kantor, Departemen, dan Peserta Magang secara berurutan untuk menampilkan data
                absensi.
              </CardDescription>
            </div>
            {(selectedOfficeId || selectedDepartmentId || selectedInternshipId) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onResetFilter}
                className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="size-3.5" />
                Reset Filter
              </Button>
            )}
          </div>

          {/* Stepper Visual Status Indicator */}
          <div className="mt-3 grid grid-cols-1 gap-2 pt-2 border-t sm:grid-cols-3">
            {/* Step 1: Kantor */}
            <div
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors ${
                selectedOfficeId
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                  : 'border-primary/40 bg-primary/10 text-primary font-medium'
              }`}
            >
              {selectedOfficeId ? (
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  1
                </span>
              )}
              <div className="flex flex-col overflow-hidden">
                <span className="font-semibold truncate">Tahap 1: Kantor</span>
                <span className="text-[11px] truncate opacity-90">
                  {selectedOffice ? selectedOffice.name : 'Pilih Kantor'}
                </span>
              </div>
            </div>

            {/* Step 2: Departemen */}
            <div
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors ${
                !selectedOfficeId
                  ? 'opacity-50 border-border bg-muted/30 text-muted-foreground'
                  : selectedDepartmentId
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : 'border-primary/40 bg-primary/10 text-primary font-medium'
              }`}
            >
              {selectedDepartmentId ? (
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <span
                  className={`flex size-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    selectedOfficeId
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted-foreground/30 text-muted-foreground'
                  }`}
                >
                  2
                </span>
              )}
              <div className="flex flex-col overflow-hidden">
                <span className="font-semibold truncate">Tahap 2: Departemen</span>
                <span className="text-[11px] truncate opacity-90">
                  {selectedDept ? selectedDept.name : 'Pilih Departemen'}
                </span>
              </div>
            </div>

            {/* Step 3: Peserta Magang */}
            <div
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors ${
                !selectedDepartmentId
                  ? 'opacity-50 border-border bg-muted/30 text-muted-foreground'
                  : selectedInternshipId
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : 'border-primary/40 bg-primary/10 text-primary font-medium'
              }`}
            >
              {selectedInternshipId ? (
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <span
                  className={`flex size-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    selectedDepartmentId
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted-foreground/30 text-muted-foreground'
                  }`}
                >
                  3
                </span>
              )}
              <div className="flex flex-col overflow-hidden">
                <span className="font-semibold truncate">Tahap 3: Peserta Magang</span>
                <span className="text-[11px] truncate opacity-90">
                  {selectedInternship
                    ? selectedInternship.internProfile?.user?.fullName
                    : 'Pilih Peserta'}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {/* 1. Dropdown Kantor */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Building2 className="size-3.5 text-primary" />
                1. Kantor
              </span>
              <Select
                value={selectedOfficeId || '__empty__'}
                onValueChange={(val) => onSelectOffice(val === '__empty__' ? '' : val)}
              >
                <SelectTrigger className="w-full h-9">
                  <SelectValue placeholder="Pilih Kantor..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__empty__">Pilih Kantor...</SelectItem>
                  {offices.map((office) => (
                    <SelectItem key={office.id} value={office.id}>
                      {office.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 2. Dropdown Departemen */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Briefcase className="size-3.5 text-primary" />
                2. Departemen
              </span>
              <Select
                value={selectedDepartmentId || '__empty__'}
                onValueChange={(val) => onSelectDepartment(val === '__empty__' ? '' : val)}
                disabled={!selectedOfficeId}
              >
                <SelectTrigger className="w-full h-9">
                  <SelectValue
                    placeholder={!selectedOfficeId ? 'Pilih Kantor dahulu' : 'Pilih Departemen...'}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__empty__">Pilih Departemen...</SelectItem>
                  {availableDepartments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 3. Dropdown Peserta Magang */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <User className="size-3.5 text-primary" />
                3. Peserta Magang
              </span>
              <Select
                value={selectedInternshipId || '__empty__'}
                onValueChange={(val) => onSelectInternship(val === '__empty__' ? '' : val)}
                disabled={!selectedDepartmentId}
              >
                <SelectTrigger className="w-full h-9">
                  <SelectValue
                    placeholder={
                      !selectedDepartmentId ? 'Pilih Departemen dahulu' : 'Pilih Peserta...'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__empty__">Pilih Peserta Magang...</SelectItem>
                  {availableInternships.length === 0 ? (
                    <SelectItem value="__none__" disabled>
                      Tidak ada peserta magang di departemen ini
                    </SelectItem>
                  ) : (
                    availableInternships.map((intern) => (
                      <SelectItem key={intern.id} value={intern.id}>
                        {intern.internProfile?.user?.fullName ?? 'Intern'}{' '}
                        {intern.internProfile?.studentNumber
                          ? `(${intern.internProfile.studentNumber})`
                          : ''}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* 4. Dropdown Bulan */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Calendar className="size-3.5 text-primary" />
                Bulan (Opsional)
              </span>
              <Select
                value={selectedMonth ? String(selectedMonth) : '__all__'}
                onValueChange={(val) => onSelectMonth(val === '__all__' ? undefined : Number(val))}
              >
                <SelectTrigger className="w-full h-9">
                  <SelectValue placeholder="Semua Bulan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Semua Bulan</SelectItem>
                  {MONTH_OPTIONS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 5. Dropdown Tahun */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Calendar className="size-3.5 text-primary" />
                Tahun (Opsional)
              </span>
              <Select
                value={selectedYear ? String(selectedYear) : '__all__'}
                onValueChange={(val) => onSelectYear(val === '__all__' ? undefined : Number(val))}
              >
                <SelectTrigger className="w-full h-9">
                  <SelectValue placeholder="Semua Tahun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Semua Tahun</SelectItem>
                  {YEAR_OPTIONS.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── State: Belum Memilih Intern (Staged Guide) ─── */}
      {!selectedInternshipId ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-14 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <UserCheck className="size-7" />
            </div>
            <div className="max-w-md space-y-1.5">
              <h3 className="text-base font-semibold text-foreground">
                {!selectedOfficeId
                  ? 'Langkah 1: Silakan Pilih Kantor Terlebih Dahulu'
                  : !selectedDepartmentId
                    ? 'Langkah 2: Silakan Pilih Departemen Terlebih Dahulu'
                    : 'Langkah 3: Silakan Pilih Peserta Magang'}
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Untuk menjaga kejelasan data, absensi tidak ditampilkan sekaligus. Ikuti tahap di
                atas dengan memilih Kantor &rarr; Departemen &rarr; Peserta Magang yang ingin Anda
                pantau riwayat absensinya.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
              <span
                className={`rounded-full px-2.5 py-1 ${
                  selectedOfficeId ? 'bg-emerald-500/15 text-emerald-600 font-medium' : 'bg-muted'
                }`}
              >
                1. Kantor {selectedOffice ? `(${selectedOffice.name})` : ''}
              </span>
              <ArrowRight className="size-3.5 text-muted-foreground/60" />
              <span
                className={`rounded-full px-2.5 py-1 ${
                  selectedDepartmentId
                    ? 'bg-emerald-500/15 text-emerald-600 font-medium'
                    : 'bg-muted'
                }`}
              >
                2. Departemen {selectedDept ? `(${selectedDept.name})` : ''}
              </span>
              <ArrowRight className="size-3.5 text-muted-foreground/60" />
              <span className="rounded-full px-2.5 py-1 bg-muted">3. Peserta Magang</span>
            </div>
          </CardContent>
        </Card>
      ) : isPending ? (
        <Card className="h-64 animate-pulse bg-muted/40" />
      ) : isError ? (
        <ReportError message={errorMessage} onRetry={onRetry} />
      ) : (
        /* ─── State: Intern Terpilih (Tampilkan Data & Tabel) ─── */
        <div className="flex flex-col gap-6">
          {/* Header Info Peserta Terpilih & Statistik Ringkas */}
          {selectedInternship && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <Card className="col-span-1 lg:col-span-2">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <User className="size-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-foreground">
                          {selectedInternship.internProfile?.user?.fullName}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          {selectedInternship.internProfile?.studentNumber
                            ? `NIM: ${selectedInternship.internProfile.studentNumber} • `
                            : ''}
                          {selectedInternship.internProfile?.user?.email}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize text-xs">
                      {selectedInternship.status?.toLowerCase() ?? 'intern'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="size-3.5 text-primary" />
                    <span>{selectedInternship.internProfile?.institution?.name ?? 'Instansi'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Building2 className="size-3.5 text-primary" />
                    <span>{selectedInternship.officeLocation?.name ?? 'Kantor'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="size-3.5 text-primary" />
                    <span>{selectedInternship.department?.name ?? 'Departemen'}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Ringkasan Kehadiran */}
              <Card className="col-span-1">
                <CardContent className="p-4 flex h-full flex-col justify-between">
                  <div className="text-xs font-medium text-muted-foreground">
                    Ringkasan Kehadiran Peserta
                  </div>
                  <div className="grid grid-cols-2 gap-2 my-2">
                    <div className="rounded-lg bg-muted/40 p-2.5">
                      <div className="text-lg font-bold text-foreground">{rows.length}</div>
                      <div className="text-[11px] text-muted-foreground">Total Rekap</div>
                    </div>
                    <div className="rounded-lg bg-emerald-500/10 p-2.5">
                      <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        {totalPresent}
                      </div>
                      <div className="text-[11px] text-muted-foreground">Hadir (Present)</div>
                    </div>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Total Kerja:{' '}
                    <span className="font-semibold text-foreground">
                      {Math.round(totalWorkMinutes / 60)} Jam ({totalWorkMinutes} Menit)
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tabel Absensi */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b space-y-0 py-3.5">
              <div>
                <CardTitle className="text-base font-semibold">Catatan Riwayat Absensi</CardTitle>
                <CardDescription className="text-xs">
                  Menampilkan {rows.length} catatan absensi untuk peserta ini
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={isExporting || rows.length === 0}
                className="h-8 gap-1.5 text-xs"
              >
                <Download className="size-3.5" />
                {isExporting ? 'Mengekspor...' : 'Export Excel'}
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {rows.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
                  <Calendar className="size-8 text-muted-foreground/50" />
                  <p className="text-sm font-medium text-foreground">
                    Belum ada data absensi untuk peserta ini.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Coba sesuaikan filter bulan atau tahun bila periode yang dipilih belum memiliki
                    catatan kehadiran.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs uppercase text-muted-foreground bg-muted/20">
                        <th className="px-6 py-3 font-medium">Tanggal</th>
                        <th className="px-6 py-3 font-medium">Status</th>
                        <th className="px-6 py-3 font-medium">Jam Masuk</th>
                        <th className="px-6 py-3 font-medium">Jam Keluar</th>
                        <th className="px-6 py-3 font-medium">Durasi Kerja</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, index) => (
                        <tr
                          key={`${row.date}-${index}`}
                          className="border-b last:border-0 hover:bg-muted/40 transition-colors"
                        >
                          <td className="px-6 py-3.5 font-medium">{formatDate(row.date)}</td>
                          <td className="px-6 py-3.5">
                            <Badge
                              variant={
                                row.status === 'PRESENT'
                                  ? 'default'
                                  : row.status === 'LATE'
                                    ? 'secondary'
                                    : 'outline'
                              }
                            >
                              {row.status ?? '-'}
                            </Badge>
                          </td>
                          <td className="px-6 py-3.5">{row.checkInAt ?? '-'}</td>
                          <td className="px-6 py-3.5">{row.checkOutAt ?? '-'}</td>
                          <td className="px-6 py-3.5 text-muted-foreground">
                            {row.totalWorkMinutes != null ? `${row.totalWorkMinutes} mnt` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
