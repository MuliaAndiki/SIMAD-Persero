'use client';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import { Input } from '@/components/atoms/input';
import { TableLoader } from '@/components/atoms/loading';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select';
import { ReportError } from '@/components/organisms/reporting/ReportError';
import { StatusBadge } from '@/components/organisms/table/StatusBadge';
import { TableEmptyState } from '@/components/organisms/table/TableEmptyState';
import { TablePagination } from '@/components/organisms/table/TablePagination';
import Api from '@/services/props.service';
import type { InternshipResponse } from '@/types/api/internship.types';
import type { OfficeResponse } from '@/types/api/office.types';
import type { AttendanceReportRow } from '@/types/api/reporting.types';
import { formatDate } from '@/utils/string.format';
import {
  Briefcase,
  Building2,
  Calendar,
  Clock,
  Download,
  Filter,
  GraduationCap,
  RotateCcw,
  Search,
  User,
  Users,
  X,
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

const STATUS_TAGS = [
  { value: 'ALL', label: 'Semua Status' },
  { value: 'PRESENT', label: 'Hadir' },
  { value: 'LATE', label: 'Terlambat' },
  { value: 'LEAVE', label: 'Izin' },
  { value: 'SICK', label: 'Sakit' },
  { value: 'ABSENT', label: 'Alpha' },
];

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
  page?: number;
  totalPages?: number;
  totalItems?: number;
  limit?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onSelectOffice: (id: string) => void;
  onSelectDepartment: (id: string) => void;
  onSelectInternship: (id: string) => void;
  onSelectMonth: (month?: number) => void;
  onSelectYear: (year?: number) => void;
  onResetFilter: () => void;
  onQueryAll?: () => void;
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
  page = 1,
  totalPages = 1,
  totalItems,
  limit = 10,
  onPageChange,
  onLimitChange,
  onSelectOffice,
  onSelectDepartment,
  onSelectInternship,
  onSelectMonth,
  onSelectYear,
  onResetFilter,
  onQueryAll,
}: AttendanceReportTableProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [searchTableQuery, setSearchTableQuery] = useState('');
  const [searchInternDropdown, setSearchInternDropdown] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);

  // Departemen yang tersedia di kantor yang dipilih
  const availableDepartments = useMemo(() => {
    if (!selectedOfficeId) return [];
    const office = offices.find((o) => o.id === selectedOfficeId);
    return office?.departments ?? [];
  }, [offices, selectedOfficeId]);

  // Peserta magang yang berada di kantor & departemen yang dipilih (atau semua bila belum difilter)
  const availableInternships = useMemo(() => {
    return allInternships.filter((internship) => {
      const matchOffice = selectedOfficeId
        ? internship.officeLocation?.id === selectedOfficeId
        : true;
      const matchDept = selectedDepartmentId
        ? internship.department?.id === selectedDepartmentId
        : true;
      return matchOffice && matchDept;
    });
  }, [allInternships, selectedOfficeId, selectedDepartmentId]);

  // Peserta magang yang disaring oleh pencarian dropdown
  const filteredDropdownInternships = useMemo(() => {
    if (!searchInternDropdown.trim()) return availableInternships;
    const q = searchInternDropdown.toLowerCase();
    return availableInternships.filter((intern) => {
      const name = intern.internProfile?.user?.fullName?.toLowerCase() ?? '';
      const nim = intern.internProfile?.studentNumber?.toLowerCase() ?? '';
      const email = intern.internProfile?.user?.email?.toLowerCase() ?? '';
      const inst = intern.internProfile?.institution?.name?.toLowerCase() ?? '';
      return name.includes(q) || nim.includes(q) || email.includes(q) || inst.includes(q);
    });
  }, [availableInternships, searchInternDropdown]);

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

  // Filter baris data lokal (status dan pencarian teks)
  const filteredRows = useMemo(() => {
    let result = rows;
    if (statusFilter !== 'ALL') {
      result = result.filter((r) => r.status?.toUpperCase() === statusFilter);
    }
    if (searchTableQuery.trim()) {
      const q = searchTableQuery.toLowerCase();
      result = result.filter((r) => {
        const intern = r.intern?.toLowerCase() ?? '';
        const email = r.email?.toLowerCase() ?? '';
        const nim = r.studentNumber?.toLowerCase() ?? '';
        const dept = r.department?.toLowerCase() ?? '';
        const office = r.office?.toLowerCase() ?? '';
        const inst = r.institution?.toLowerCase() ?? '';
        return (
          intern.includes(q) ||
          email.includes(q) ||
          nim.includes(q) ||
          dept.includes(q) ||
          office.includes(q) ||
          inst.includes(q)
        );
      });
    }
    return result;
  }, [rows, statusFilter, searchTableQuery]);

  const isAllActive =
    !selectedOfficeId &&
    !selectedDepartmentId &&
    !selectedInternshipId &&
    !selectedMonth &&
    !selectedYear;

  const handleQueryAllClick = () => {
    setSearchTableQuery('');
    setStatusFilter('ALL');
    if (onQueryAll) {
      onQueryAll();
    } else {
      onResetFilter();
    }
  };

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

  const totalPresent = filteredRows.filter((r) => r.status === 'PRESENT').length;
  const totalLate = filteredRows.filter((r) => r.status === 'LATE').length;
  const totalWorkMinutes = filteredRows.reduce((acc, r) => acc + (r.totalWorkMinutes || 0), 0);

  return (
    <div className="flex flex-col gap-6">
      {/* ─── Filter Section dengan Tag & Pencarian ─── */}
      <Card className="border shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold">Filter Laporan Absensi</CardTitle>
                <Badge variant={isAllActive ? 'default' : 'secondary'} className="text-[11px]">
                  {isAllActive ? 'Semua Data' : 'Terfilter'}
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Gunakan tombol &ldquo;Semua Data&rdquo; untuk memuat seluruh riwayat absensi atau filter berdasarkan kantor, departemen, dan peserta.
              </CardDescription>
            </div>

            {/* Aksi Cepat: Query All & Reset */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={isAllActive ? 'default' : 'outline'}
                size="sm"
                onClick={handleQueryAllClick}
                className="h-8 gap-1.5 text-xs"
              >
                <Users className="size-3.5" />
                Semua Data 
                </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
                className="h-8 gap-1.5 text-xs"
              >
                <Filter className="size-3.5" />
                {showAdvancedFilter ? 'Tutup Filter' : 'Filter Lanjutan'}
              </Button>

              {!isAllActive && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleQueryAllClick}
                  className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="size-3" />
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* ─── Tag Filter Status & Quick Tags ─── */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2 border-t">
            <span className="text-xs font-medium text-muted-foreground mr-1 flex items-center gap-1">
              Status Tag:
            </span>
            {STATUS_TAGS.map((tag) => {
              const isActive = statusFilter === tag.value;
              return (
                <button
                  type="button"
                  key={tag.value}
                  onClick={() => setStatusFilter(tag.value)}
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {tag.label}
                  {tag.value === 'ALL' && rows.length > 0 && ` (${rows.length})`}
                  {tag.value === 'PRESENT' && totalPresent > 0 && ` (${totalPresent})`}
                  {tag.value === 'LATE' && totalLate > 0 && ` (${totalLate})`}
                </button>
              );
            })}
          </div>

          {/* ─── Tag Filter Aktif (Dismissible Badges) ─── */}
          {!isAllActive && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-muted-foreground">Filter aktif:</span>
              {selectedOffice && (
                <Badge variant="outline" className="gap-1 bg-background text-xs py-0.5">
                  <Building2 className="size-3 text-muted-foreground" />
                  {selectedOffice.name}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectOffice('');
                      onSelectDepartment('');
                      onSelectInternship('');
                    }}
                    className="ml-1 rounded-full hover:bg-muted p-0.5"
                  >
                    <X className="size-2.5" />
                  </button>
                </Badge>
              )}
              {selectedDept && (
                <Badge variant="outline" className="gap-1 bg-background text-xs py-0.5">
                  <Briefcase className="size-3 text-muted-foreground" />
                  {selectedDept.name}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectDepartment('');
                      onSelectInternship('');
                    }}
                    className="ml-1 rounded-full hover:bg-muted p-0.5"
                  >
                    <X className="size-2.5" />
                  </button>
                </Badge>
              )}
              {selectedInternship && (
                <Badge variant="outline" className="gap-1 bg-background text-xs py-0.5">
                  <User className="size-3 text-muted-foreground" />
                  {selectedInternship.internProfile?.user?.fullName}
                  <button
                    type="button"
                    onClick={() => onSelectInternship('')}
                    className="ml-1 rounded-full hover:bg-muted p-0.5"
                  >
                    <X className="size-2.5" />
                  </button>
                </Badge>
              )}
              {selectedMonth && (
                <Badge variant="outline" className="gap-1 bg-background text-xs py-0.5">
                  <Calendar className="size-3 text-muted-foreground" />
                  Bulan {MONTH_OPTIONS.find((m) => m.value === String(selectedMonth))?.label}
                  <button
                    type="button"
                    onClick={() => onSelectMonth(undefined)}
                    className="ml-1 rounded-full hover:bg-muted p-0.5"
                  >
                    <X className="size-2.5" />
                  </button>
                </Badge>
              )}
              {selectedYear && (
                <Badge variant="outline" className="gap-1 bg-background text-xs py-0.5">
                  <Calendar className="size-3 text-muted-foreground" />
                  Tahun {selectedYear}
                  <button
                    type="button"
                    onClick={() => onSelectYear(undefined)}
                    className="ml-1 rounded-full hover:bg-muted p-0.5"
                  >
                    <X className="size-2.5" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </CardHeader>

        {/* ─── Kontrol Filter Dropdown & Pencarian Peserta ─── */}
        <CardContent className={`pt-0 ${showAdvancedFilter || !isAllActive ? 'block' : 'hidden sm:block'}`}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 pt-2 border-t">
            {/* 1. Dropdown Kantor */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Building2 className="size-3.5 text-primary" />
                1. Kantor
              </span>
              <Select
                value={selectedOfficeId || '__all__'}
                onValueChange={(val) => onSelectOffice(val === '__all__' ? '' : val)}
              >
                <SelectTrigger className="w-full h-9 text-xs">
                  <SelectValue placeholder="Semua Kantor (Semua)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Semua Kantor (Semua)</SelectItem>
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
                value={selectedDepartmentId || '__all__'}
                onValueChange={(val) => onSelectDepartment(val === '__all__' ? '' : val)}
                disabled={!selectedOfficeId && offices.length > 0}
              >
                <SelectTrigger className="w-full h-9 text-xs">
                  <SelectValue
                    placeholder={
                      !selectedOfficeId ? 'Pilih Kantor dahulu' : 'Semua Departemen (Semua)'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Semua Departemen (Semua)</SelectItem>
                  {availableDepartments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 3. Dropdown Peserta Magang (dengan Search Filter) */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <User className="size-3.5 text-primary" />
                3. Peserta Magang
              </span>
              <Select
                value={selectedInternshipId || '__all__'}
                onValueChange={(val) => onSelectInternship(val === '__all__' ? '' : val)}
              >
                <SelectTrigger className="w-full h-9 text-xs">
                  <SelectValue placeholder="Semua Peserta (Semua)" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  <div className="p-2 pb-1 sticky top-0 bg-popover z-10">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Cari nama / NIM peserta..."
                        value={searchInternDropdown}
                        onChange={(e) => setSearchInternDropdown(e.target.value)}
                        className="h-8 pl-8 text-xs"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <SelectItem value="__all__">Semua Peserta Magang (Semua)</SelectItem>
                  {filteredDropdownInternships.length === 0 ? (
                    <div className="p-3 text-center text-xs text-muted-foreground">
                      Tidak ditemukan peserta
                    </div>
                  ) : (
                    filteredDropdownInternships.map((intern) => (
                      <SelectItem key={intern.id} value={intern.id} className="text-xs">
                        {intern.internProfile?.user?.fullName ?? 'Magang'}{' '}
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
                4. Bulan
              </span>
              <Select
                value={selectedMonth ? String(selectedMonth) : '__all__'}
                onValueChange={(val) => onSelectMonth(val === '__all__' ? undefined : Number(val))}
              >
                <SelectTrigger className="w-full h-9 text-xs">
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
                5. Tahun
              </span>
              <Select
                value={selectedYear ? String(selectedYear) : '__all__'}
                onValueChange={(val) => onSelectYear(val === '__all__' ? undefined : Number(val))}
              >
                <SelectTrigger className="w-full h-9 text-xs">
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

      {/* ─── State Loading & Error ─── */}
      {isPending ? (
        <Card>
          <TableLoader label="Memuat laporan absensi..." />
        </Card>
      ) : isError ? (
        <ReportError message={errorMessage} onRetry={onRetry} />
      ) : (
        /* ─── Tampilan Konten Laporan Absensi (Semua atau Per Peserta) ─── */
        <div className="flex flex-col gap-6">
          {/* Card Info Peserta (Jika Sedang Memfilter 1 Peserta Spesifik) */}
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
                      {selectedInternship.status?.toLowerCase() ?? 'magang'}
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

              {/* Ringkasan Kehadiran Peserta Terpilih */}
              <Card className="col-span-1 border-border/70 p-3.5 flex flex-col justify-between shadow-2xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Ringkasan Kehadiran
                  </span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {Math.round((totalPresent / Math.max(1, filteredRows.length)) * 100)}% Kehadiran
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 my-2">
                  <div className="rounded-md border bg-muted/30 p-2">
                    <div className="text-lg font-bold font-mono text-foreground">{filteredRows.length}</div>
                    <div className="text-[10px] text-muted-foreground">Total Rekap</div>
                  </div>
                  <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-2">
                    <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      {totalPresent}
                    </div>
                    <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">Hadir Tepat</div>
                  </div>
                </div>
                <div className="text-[11px] text-muted-foreground flex items-center justify-between border-t pt-2">
                  <span>Total Jam Kerja:</span>
                  <span className="font-semibold text-foreground font-mono">
                    {Math.round(totalWorkMinutes / 60)} Jam ({totalWorkMinutes} mnt)
                  </span>
                </div>
              </Card>
            </div>
          )}

          {/* Statistik Global jika melihat semua peserta */}
          {!selectedInternship && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <Card className="p-3 border-border/70 shadow-2xs flex flex-col justify-between">
                <div className="text-xs font-medium text-muted-foreground">Total Rekap</div>
                <div className="text-xl font-bold font-mono text-foreground mt-1">{filteredRows.length}</div>
                <div className="text-[11px] text-muted-foreground">Log kehadiran</div>
              </Card>
              <Card className="p-3 border-border/70 shadow-2xs flex flex-col justify-between">
                <div className="text-xs font-medium text-muted-foreground">Hadir Tepat Waktu</div>
                <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                  {totalPresent}
                </div>
                <div className="text-[11px] text-muted-foreground">Status Present</div>
              </Card>
              <Card className="p-3 border-border/70 shadow-2xs flex flex-col justify-between">
                <div className="text-xs font-medium text-muted-foreground">Terlambat</div>
                <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
                  {totalLate}
                </div>
                <div className="text-[11px] text-muted-foreground">Status Late</div>
              </Card>
              <Card className="p-3 border-border/70 shadow-2xs flex flex-col justify-between">
                <div className="text-xs font-medium text-muted-foreground">Total Jam Kerja</div>
                <div className="text-xl font-bold font-mono text-foreground mt-1">
                  {Math.round(totalWorkMinutes / 60)} Jam
                </div>
                <div className="text-[11px] text-muted-foreground">{totalWorkMinutes} menit kerja</div>
              </Card>
            </div>
          )}

          {/* ─── Tabel Riwayat Absensi ─── */}
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b space-y-0 py-3.5 gap-3">
              <div>
                <CardTitle className="text-base font-semibold">
                  {selectedInternship
                    ? `Catatan Riwayat Absensi: ${selectedInternship.internProfile?.user?.fullName}`
                    : 'Seluruh Catatan Riwayat Absensi'}
                </CardTitle>
                <CardDescription className="text-xs">
                  {totalItems != null ? (
                    <>
                      Menampilkan {filteredRows.length} data di halaman ini dari total {totalItems} catatan absensi
                      {totalPages > 1 && ` (Halaman ${page} dari ${totalPages})`}
                    </>
                  ) : (
                    <>Menampilkan {filteredRows.length} dari total {rows.length} catatan absensi</>
                  )}
                </CardDescription>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                {/* Search Bar untuk Tabel Absensi */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Cari peserta / NIM / kantor..."
                    value={searchTableQuery}
                    onChange={(e) => setSearchTableQuery(e.target.value)}
                    className="h-8 pl-8 text-xs w-full"
                  />
                  {searchTableQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchTableQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  disabled={isExporting || filteredRows.length === 0}
                  className="h-8 gap-1.5 text-xs shrink-0"
                >
                  <Download className="size-3.5" />
                  {isExporting ? 'Mengekspor...' : 'Ekspor Excel'}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {filteredRows.length === 0 ? (
                <TableEmptyState
                  icon={Calendar}
                  title="Belum ada data absensi yang sesuai."
                  message={
                    searchTableQuery || statusFilter !== 'ALL'
                      ? 'Coba sesuaikan kata kunci pencarian atau tag status yang dipilih.'
                      : 'Data absensi untuk kriteria ini belum tersedia. Klik "Semua Data (Query Semua)" untuk melihat seluruh riwayat.'
                  }
                  action={
                    (!isAllActive || statusFilter !== 'ALL' || searchTableQuery) ? (
                      <Button variant="outline" size="sm" onClick={handleQueryAllClick} className="gap-1.5 text-xs">
                        <RotateCcw className="size-3.5" />
                        Tampilkan Semua Data
                      </Button>
                    ) : undefined
                  }
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs uppercase text-muted-foreground bg-muted/20">
                        {!selectedInternship && <th className="px-6 py-3 font-medium">Peserta Magang</th>}
                        {!selectedInternship && <th className="px-6 py-3 font-medium">Penempatan</th>}
                        <th className="px-6 py-3 font-medium">Tanggal</th>
                        <th className="px-6 py-3 font-medium">Status</th>
                        <th className="px-6 py-3 font-medium">Jam Masuk</th>
                        <th className="px-6 py-3 font-medium">Jam Keluar</th>
                        <th className="px-6 py-3 font-medium">Durasi Kerja</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.map((row, index) => (
                        <tr
                          key={`${row.date}-${row.intern}-${index}`}
                          className="border-b last:border-0 hover:bg-muted/40 transition-colors"
                        >
                          {!selectedInternship && (
                            <td className="px-6 py-3.5">
                              <div className="flex flex-col">
                                <span className="font-medium text-foreground">{row.intern}</span>
                                <span className="text-xs text-muted-foreground">
                                  {row.studentNumber !== '-' ? row.studentNumber : row.email}
                                </span>
                              </div>
                            </td>
                          )}

                          {!selectedInternship && (
                            <td className="px-6 py-3.5 text-xs">
                              <div className="flex flex-col gap-0.5">
                                <span className="font-medium text-foreground flex items-center gap-1">
                                  <Building2 className="size-3 text-muted-foreground" />
                                  {row.office}
                                </span>
                                <span className="text-muted-foreground flex items-center gap-1">
                                  <Briefcase className="size-3 text-muted-foreground" />
                                  {row.department}
                                </span>
                              </div>
                            </td>
                          )}

                          <td className="px-6 py-3.5 font-medium whitespace-nowrap">
                            {formatDate(row.date)}
                          </td>
                          <td className="px-6 py-3.5">
                            <StatusBadge status={row.status} />
                          </td>
                          <td className="px-6 py-3.5 whitespace-nowrap">{row.checkInAt ?? '-'}</td>
                          <td className="px-6 py-3.5 whitespace-nowrap">{row.checkOutAt ?? '-'}</td>
                          <td className="px-6 py-3.5 text-muted-foreground whitespace-nowrap">
                            {row.totalWorkMinutes != null ? (
                              <span className="inline-flex items-center gap-1">
                                <Clock className="size-3 text-muted-foreground" />
                                {row.totalWorkMinutes} mnt
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>

            {totalPages > 1 && onPageChange && (
              <TablePagination
                page={page}
                totalPages={totalPages}
                description={
                  <span>
                    Menampilkan baris {((page - 1) * limit) + 1} -{' '}
                    {Math.min(page * limit, totalItems ?? rows.length)} dari{' '}
                    <strong className="font-semibold text-foreground">{totalItems ?? rows.length}</strong> catatan absensi
                  </span>
                }
                onPageChange={onPageChange}
              />
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
