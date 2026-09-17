'use client';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Card } from '@/components/atoms/card';
import { Input } from '@/components/atoms/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select';
import type { InternshipResponse } from '@/types/api/internship.types';
import { formatDate } from '@/utils/string.format';
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  RefreshCw,
  RotateCcw,
  Search,
  User,
  Users,
} from 'lucide-react';

export interface ReceptionistInternsSectionProps {
  interns: InternshipResponse[];
  isPending: boolean;
  isFetching?: boolean;
  isError: boolean;
  errorMessage?: string;
  searchQuery: string;
  departmentFilter: string;
  dateFilterMode: 'all' | 'today' | 'yesterday' | 'custom';
  customDate: string;
  activeDate: string;
  departments: { id: string; name: string; code?: string }[];
  onSearch: (query: string) => void;
  onDepartmentChange: (deptId: string) => void;
  onDateFilterModeChange: (mode: 'all' | 'today' | 'yesterday' | 'custom') => void;
  onCustomDateChange: (date: string) => void;
  onResetFilters: () => void;
  onRefresh?: () => void;
}

export function ReceptionistInternsSection({
  interns,
  isPending,
  isFetching,
  isError,
  errorMessage,
  searchQuery,
  departmentFilter,
  dateFilterMode,
  customDate,
  activeDate,
  departments,
  onSearch,
  onDepartmentChange,
  onDateFilterModeChange,
  onCustomDateChange,
  onResetFilters,
  onRefresh,
}: ReceptionistInternsSectionProps) {
  const isInitialLoading = isPending && interns.length === 0;
  const hasActiveFilter = Boolean(
    searchQuery || departmentFilter || dateFilterMode !== 'all' || customDate,
  );

  return (
    <section className="flex flex-col gap-6">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground">Peserta Magang</h1>
          <p className="text-sm text-muted-foreground">
            Daftar peserta magang, penempatan departemen, dan rekap kehadiran di lokasi kantor.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="w-fit">
            {interns.length} Peserta
          </Badge>
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isFetching}
              className="w-fit"
            >
              <RefreshCw className={`mr-2 size-4 ${isFetching ? 'animate-spin' : ''}`} />
              Perbarui
            </Button>
          )}
        </div>
      </header>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Cari nama, NIM, email, departemen, 'kemarin', 'hari ini'…"
            className="pl-9 pr-9"
          />
          {isFetching && (
            <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-primary" />
          )}
        </div>

        {/* Filter Departemen */}
        <Select
          value={departmentFilter || 'all'}
          onValueChange={(value) => onDepartmentChange(value === 'all' ? '' : value)}
        >
          <SelectTrigger className="w-full lg:w-52">
            <SelectValue placeholder="Semua Departemen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Departemen</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filter Tanggal / Hari */}
        <Select
          value={dateFilterMode}
          onValueChange={(value) =>
            onDateFilterModeChange(value as 'all' | 'today' | 'yesterday' | 'custom')
          }
        >
          <SelectTrigger className="w-full lg:w-44">
            <SelectValue placeholder="Pilih Hari" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Hari</SelectItem>
            <SelectItem value="today">Hari Ini</SelectItem>
            <SelectItem value="yesterday">Kemarin</SelectItem>
            <SelectItem value="custom">Pilih Tanggal…</SelectItem>
          </SelectContent>
        </Select>

        {/* Input Tanggal Khusus jika mode custom */}
        {dateFilterMode === 'custom' && (
          <Input
            type="date"
            value={customDate}
            onChange={(e) => onCustomDateChange(e.target.value)}
            className="w-full lg:w-44 h-9"
          />
        )}

        {/* Reset Filter Button */}
        {hasActiveFilter && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="text-xs text-muted-foreground hover:text-foreground h-9"
          >
            <RotateCcw className="mr-1.5 size-3.5" />
            Reset
          </Button>
        )}
      </div>

      {/* Info Banner Filter Aktif */}
      {activeDate && (
        <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3.5 py-2 text-xs text-primary">
          <Calendar className="size-4 shrink-0" />
          <span>
            Menampilkan data peserta magang untuk tanggal:{' '}
            <strong className="font-semibold">{formatDate(activeDate)}</strong>
            {dateFilterMode === 'yesterday' && ' (Kemarin)'}
            {dateFilterMode === 'today' && ' (Hari Ini)'}
          </span>
        </div>
      )}

      {/* Content */}
      {isInitialLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="h-32 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <div className="flex flex-col gap-1">
            <p className="font-semibold">Gagal memuat data peserta magang</p>
            <p className="opacity-90">{errorMessage}</p>
          </div>
        </div>
      ) : interns.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground">
          <Users className="size-8 opacity-40" />
          <p className="text-sm font-medium">
            {hasActiveFilter
              ? 'Tidak ada peserta magang yang cocok dengan filter / pencarian saat ini.'
              : 'Tidak ada peserta magang aktif saat ini.'}
          </p>
          {hasActiveFilter && (
            <Button variant="outline" size="sm" onClick={onResetFilters} className="mt-2 text-xs">
              <RotateCcw className="mr-1.5 size-3.5" />
              Reset Semua Filter
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {interns.map((intern) => {
            // Cari data absensi yang cocok dengan tanggal filter aktif atau gunakan absensi terkini
            const attendance = activeDate
              ? intern.attendances?.find((a) => a.attendanceDate.slice(0, 10) === activeDate)
              : intern.attendances?.[0];

            return (
              <Card key={intern.id} className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  {/* Left: Personal Info */}
                  <div className="flex flex-1 flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <User className="size-4 text-muted-foreground" />
                      <span className="font-semibold text-foreground">
                        {intern.internProfile?.user?.fullName ?? 'Nama tidak tersedia'}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                      <span>{intern.internProfile?.user?.email ?? '-'}</span>
                      {intern.internProfile?.studentNumber && (
                        <span>NIM: {intern.internProfile.studentNumber}</span>
                      )}
                      {intern.internProfile?.institution && (
                        <span>
                          {intern.internProfile.institution.name}
                          {intern.internProfile.major && ` • ${intern.internProfile.major.name}`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Placement Info */}
                  <div className="flex flex-col gap-2 text-sm">
                    {intern.department && (
                      <div className="flex items-center gap-2">
                        <Building2 className="size-4 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">Departemen</span>
                          <span className="text-muted-foreground">{intern.department.name}</span>
                        </div>
                      </div>
                    )}
                    {intern.officeLocation && (
                      <div className="flex items-center gap-2">
                        <MapPin className="size-4 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">Kantor</span>
                          <span className="text-muted-foreground">
                            {intern.officeLocation.name}
                          </span>
                        </div>
                      </div>
                    )}
                    {intern.supervisorAssignments && intern.supervisorAssignments.length > 0 && (
                      <div className="flex items-center gap-2">
                        <User className="size-4 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">Supervisor</span>
                          <span className="text-muted-foreground">
                            {intern.supervisorAssignments[0].supervisor.fullName}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rekap Kehadiran pada Hari yang Dipilih */}
                <div className="mt-4 rounded-lg border bg-muted/30 p-3 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Clock className="size-3.5 text-muted-foreground" />
                      <span className="font-semibold text-foreground">
                        {activeDate
                          ? `Kehadiran (${formatDate(activeDate)}):`
                          : 'Kehadiran Terkini:'}
                      </span>
                      {attendance ? (
                        attendance.attendanceStatus === 'PRESENT' ||
                        attendance.attendanceStatus === 'COMPLETED' ? (
                          <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20 border-emerald-500/30">
                            <CheckCircle2 className="mr-1 size-3" />
                            Hadir
                          </Badge>
                        ) : attendance.attendanceStatus === 'LATE' ? (
                          <Badge className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/20 border-amber-500/30">
                            <Clock className="mr-1 size-3" />
                            Terlambat
                          </Badge>
                        ) : attendance.attendanceStatus === 'INVALID' ? (
                          <Badge className="bg-destructive/15 text-destructive border-destructive/30">
                            <AlertCircle className="mr-1 size-3" />
                            Tidak Valid
                          </Badge>
                        ) : (
                          <Badge variant="outline">{attendance.attendanceStatus}</Badge>
                        )
                      ) : activeDate ? (
                        <Badge variant="secondary" className="text-muted-foreground">
                          Belum / Tidak Absen
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          Belum Ada Data
                        </Badge>
                      )}
                    </div>

                    {attendance && (
                      <div className="flex items-center gap-3 text-muted-foreground">
                        {attendance.checkInAt && (
                          <span>
                            Masuk:{' '}
                            <strong className="text-foreground">
                              {new Date(attendance.checkInAt).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </strong>
                          </span>
                        )}
                        {attendance.checkOutAt && (
                          <span>
                            Pulang:{' '}
                            <strong className="text-foreground">
                              {new Date(attendance.checkOutAt).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </strong>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Period Info */}
                {(intern.actualStartDate || intern.actualEndDate) && (
                  <div className="mt-3 border-t pt-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="size-3.5 text-muted-foreground" />
                      <span className="font-medium text-foreground">Periode Magang:</span>
                      {intern.actualStartDate && <span>{formatDate(intern.actualStartDate)}</span>}
                      {intern.actualStartDate && intern.actualEndDate && <span>s.d.</span>}
                      {intern.actualEndDate && <span>{formatDate(intern.actualEndDate)}</span>}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
