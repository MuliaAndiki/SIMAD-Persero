'use client';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/atoms/table';
import type { DepartmentResponse } from '@/types/api/department.types';
import type { InternshipResponse } from '@/types/api/internship.types';
import type { OfficeResponse } from '@/types/api/office.types';
import type { QuotaAvailabilityQuery, QuotaAvailabilityResult, QuotaItem } from '@/types/api/quota.types';
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Filter,
  GraduationCap,
  Info,
  Loader2,
  Lock,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  User,
  Users,
  XCircle,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

export interface AvailabilitySectionProps {
  assignedOffice: OfficeResponse | null;
  assignedOfficeName: string;
  assignedOfficeId: string;
  departments: { id: string; name: string | null; code?: string | null }[];
  officeQuota: QuotaItem | null;
  internships: InternshipResponse[];
  isInternshipsPending?: boolean;
  availabilityResult: QuotaAvailabilityResult | null;
  isChecking: boolean;
  onCheckAvailability: (query: QuotaAvailabilityQuery) => void;
}

function formatDisplayDate(dateStr?: string | null): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getInternshipStatusBadge(status?: string | null) {
  switch (status) {
    case 'ACTIVE':
      return (
        <Badge variant="default" className="bg-emerald-600 text-xs py-0">
          Aktif
        </Badge>
      );
    case 'PENDING':
      return (
        <Badge variant="secondary" className="bg-amber-500/15 text-amber-700 border-amber-300 text-xs py-0">
          Menunggu
        </Badge>
      );
    case 'COMPLETED':
      return (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-300 text-xs py-0">
          Selesai
        </Badge>
      );
    case 'ARCHIVED':
      return (
        <Badge variant="outline" className="text-muted-foreground text-xs py-0">
          Diarsipkan
        </Badge>
      );
    default:
      return <Badge variant="outline" className="text-xs py-0">{status || '-'}</Badge>;
  }
}

export function AvailabilitySection({
  assignedOffice,
  assignedOfficeName,
  assignedOfficeId,
  departments,
  officeQuota,
  internships,
  isInternshipsPending = false,
  availabilityResult,
  isChecking,
  onCheckAvailability,
}: AvailabilitySectionProps) {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // State filter departemen untuk tabel daftar peserta magang yang diklik
  const [activeDeptForInterns, setActiveDeptForInterns] = useState<string>('ALL');
  const [internSearchQuery, setInternSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignedOfficeId) return;

    onCheckAvailability({
      officeLocationId: assignedOfficeId,
      departmentId: selectedDepartmentId === 'ALL' ? undefined : selectedDepartmentId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  const handleRowClickDepartment = (deptId: string) => {
    setActiveDeptForInterns(deptId);
    const element = document.getElementById('interns-table-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const officeName = assignedOffice?.name || assignedOfficeName || 'Kantor Unit PLN';
  const officeAddress = assignedOffice?.address || 'Lokasi kantor penempatan tugas resepsionis';
  const totalCapacity = officeQuota?.totalCapacity ?? availabilityResult?.totalCapacity ?? 0;
  const totalOccupied = availabilityResult?.totalOccupied ?? 0;
  const totalAvailable = availabilityResult?.totalAvailable ?? Math.max(0, totalCapacity - totalOccupied);

  // Filter daftar anak magang berdasarkan departemen yang diklik & search query
  const filteredInterns = useMemo(() => {
    return internships.filter((item) => {
      // Filter departemen
      if (activeDeptForInterns !== 'ALL') {
        const itemDeptId = item.department?.id || (item as any).departmentId;
        if (itemDeptId !== activeDeptForInterns) return false;
      }

      // Filter search
      if (internSearchQuery.trim()) {
        const query = internSearchQuery.toLowerCase();
        const internName = item.internProfile?.user?.fullName?.toLowerCase() || '';
        const internEmail = item.internProfile?.user?.email?.toLowerCase() || '';
        const studentNumber = item.internProfile?.studentNumber?.toLowerCase() || '';
        const institutionName = item.internProfile?.institution?.name?.toLowerCase() || '';
        const deptName = item.department?.name?.toLowerCase() || '';

        const matches =
          internName.includes(query) ||
          internEmail.includes(query) ||
          studentNumber.includes(query) ||
          institutionName.includes(query) ||
          deptName.includes(query);

        if (!matches) return false;
      }

      return true;
    });
  }, [internships, activeDeptForInterns, internSearchQuery]);

  const activeSelectedDeptName =
    activeDeptForInterns === 'ALL'
      ? 'Semua Bidang di Kantor Ini'
      : departments.find((d) => d.id === activeDeptForInterns)?.name || 'Bidang Terpilih';

  return (
    <section className="flex flex-col gap-6">
      {/* Header with Assigned Office Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2 mt-0.5">
            <Building2 className="h-6 w-6 text-primary" />
            {officeName}
          </h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="size-3.5 text-muted-foreground shrink-0" />
            {officeAddress}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            onCheckAvailability({
              officeLocationId: assignedOfficeId,
              departmentId: selectedDepartmentId === 'ALL' ? undefined : selectedDepartmentId,
              startDate: startDate || undefined,
              endDate: endDate || undefined,
            })
          }
          disabled={isChecking || !assignedOfficeId}
          className="gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`size-3.5 ${isChecking ? 'animate-spin' : ''}`} />
          Segarkan Data
        </Button>
      </div>

      {/* Summary KPI Cards for Assigned Office */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-4 bg-primary/5 border-primary/20">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total Kuota Kantor Anda</p>
            <h3 className="text-2xl font-bold text-foreground">{totalCapacity} Slot</h3>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-amber-500/5 border-amber-500/20">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Peserta Magang Aktif</p>
            <h3 className="text-2xl font-bold text-foreground">{totalOccupied} Peserta</h3>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-emerald-500/5 border-emerald-500/20">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Sisa Slot Tersedia</p>
            <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {totalAvailable} Slot
            </h3>
          </div>
        </Card>
      </div>

      {/* Filter Checker Card (Locked to Assigned Office) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" />
            Pengecekan Ketersediaan Slot Magang di Unit Anda
          </CardTitle>
          <CardDescription>
            Pilih departemen/bidang dan estimasi rentang tanggal magang untuk memverifikasi ketersediaan kuota bagi calon pendaftar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Locked Office Field */}
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium flex items-center justify-between">
                <span>Unit Kantor Anda</span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <Lock className="size-2.5" /> Terkunci
                </span>
              </Label>
              <div className="flex h-9 items-center gap-2 rounded-md border bg-muted/40 px-3 text-xs font-medium text-foreground cursor-not-allowed">
                <Building2 className="size-3.5 text-primary shrink-0" />
                <span className="truncate">{officeName}</span>
              </div>
            </div>

            {/* Department Selection within this office */}
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium">Departemen / Bidang</Label>
              <Select value={selectedDepartmentId} onValueChange={setSelectedDepartmentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Departemen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Departemen di Kantor Ini</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name} {dept.code ? `(${dept.code})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Target Dates */}
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Target Mulai</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Target Selesai</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" disabled={isChecking || !assignedOfficeId} className="w-full gap-2">
              {isChecking ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memeriksa...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Periksa Slot Unit
                </>
              )}
            </Button>
          </form>

          {/* Availability Result Banner & Breakdown */}
          {availabilityResult && (
            <div className="mt-6 pt-5 border-t flex flex-col gap-5">
              <div
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  availabilityResult.isAvailable
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  {availabilityResult.isAvailable ? (
                    <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="h-7 w-7 text-rose-600 dark:text-rose-400 shrink-0" />
                  )}
                  <div>
                    <h4 className="font-bold text-base">
                      {availabilityResult.isAvailable
                        ? 'Slot Magang di Unit Tersedia'
                        : 'Slot Magang di Unit Sedang Penuh'}
                    </h4>
                    <p className="text-xs opacity-90 mt-0.5">
                      Total Kuota Unit: <strong>{availabilityResult.totalCapacity}</strong> • Sedang Aktif: <strong>{availabilityResult.totalOccupied}</strong> • Sisa Tersedia: <strong>{availabilityResult.totalAvailable}</strong> slot
                      {startDate && endDate && (
                        <span> (Periode: {startDate} s/d {endDate})</span>
                      )}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={availabilityResult.isAvailable ? 'default' : 'destructive'}
                  className="text-sm px-3 py-1 shrink-0 self-start sm:self-auto"
                >
                  {availabilityResult.totalAvailable} Slot Tersedia
                </Badge>
              </div>

              {/* Department Breakdown Table with Interactive Row Click */}
              {availabilityResult.departments && availabilityResult.departments.length > 0 ? (
                <div className="rounded-xl border overflow-hidden">
                  <div className="bg-muted/40 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b flex items-center justify-between">
                    <span>Rincian Alokasi & Okupansi per Bidang ({officeName})</span>
                    <span className="text-[11px] font-normal normal-case text-muted-foreground">
                      💡 Klik pada baris departemen untuk melihat daftar peserta magangnya
                    </span>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/20">
                        <TableHead className="text-xs">Departemen / Bidang</TableHead>
                        <TableHead className="text-xs text-center">Kapasitas Kuota</TableHead>
                        <TableHead className="text-xs text-center">Peserta Sedang Aktif</TableHead>
                        <TableHead className="text-xs text-center">Sisa Slot Tersedia</TableHead>
                        <TableHead className="text-xs text-center">Status</TableHead>
                        <TableHead className="text-xs text-center">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {availabilityResult.departments.map((dept) => {
                        const isSelected = activeDeptForInterns === dept.departmentId;

                        return (
                          <TableRow
                            key={dept.departmentId}
                            onClick={() => handleRowClickDepartment(dept.departmentId)}
                            className={`cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-primary/10 hover:bg-primary/15 font-medium'
                                : 'hover:bg-muted/30'
                            }`}
                          >
                            <TableCell className="font-medium text-sm">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground">{dept.departmentName}</span>
                                {dept.departmentCode && (
                                  <Badge variant="outline" className="text-[10px] py-0 font-mono">
                                    {dept.departmentCode}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-mono font-medium">
                              {dept.allocatedCapacity} Slot
                            </TableCell>
                            <TableCell className="text-center font-mono text-muted-foreground">
                              {dept.occupied} Peserta
                            </TableCell>
                            <TableCell className="text-center font-mono font-bold">
                              <span className={dept.available > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}>
                                {dept.available} Slot
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              {dept.available > 0 ? (
                                <Badge variant="default" className="bg-emerald-600 text-xs py-0">
                                  Tersedia
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="text-xs py-0">
                                  Penuh
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRowClickDepartment(dept.departmentId);
                                }}
                                className="h-7 text-xs text-primary gap-1"
                              >
                                Lihat Peserta ({dept.occupied})
                                <ChevronRight className="size-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="rounded-lg border bg-muted/20 p-4 text-xs text-muted-foreground text-center">
                  Belum ada pembagian alokasi departemen yang dikonfigurasikan pada kuota kantor ini.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interactive Interns Information Table (Replaces static quota card) */}
      <div id="interns-table-section" className="space-y-4 pt-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <GraduationCap className="size-5 text-primary" />
                  Informasi Peserta Magang di {officeName}
                </CardTitle>
                <CardDescription>
                  Filter aktif: <strong className="text-foreground">{activeSelectedDeptName}</strong> ({filteredInterns.length} peserta terdata)
                </CardDescription>
              </div>

            </div>

            {/* Quick search input */}
            <div className="pt-2">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="Cari nama peserta, NIM, instansi..."
                  value={internSearchQuery}
                  onChange={(e) => setInternSearchQuery(e.target.value)}
                  className="pl-9 h-8 text-xs"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {isInternshipsPending ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground text-xs gap-2">
                <Loader2 className="size-4 animate-spin text-primary" />
                Memuat data peserta magang di unit ini...
              </div>
            ) : filteredInterns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center rounded-lg border border-dashed p-6 bg-muted/10">
                <Users className="size-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm font-semibold text-foreground">Tidak Ada Data Peserta Magang</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-md">
                  {internSearchQuery
                    ? `Tidak ditemukan peserta magang yang cocok dengan kata kunci "${internSearchQuery}".`
                    : `Belum ada peserta magang yang terdaftar pada ${activeSelectedDeptName} di unit ini.`}
                </p>
                {activeDeptForInterns !== 'ALL' && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setActiveDeptForInterns('ALL')}
                    className="text-xs text-primary mt-2"
                  >
                    Tampilkan Semua Bidang
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs w-12 text-center">No</TableHead>
                      <TableHead className="text-xs">Nama Peserta Magang</TableHead>
                      <TableHead className="text-xs">Asal Instansi / Kampus</TableHead>
                      <TableHead className="text-xs">Departemen / Bidang</TableHead>
                      <TableHead className="text-xs text-center">Periode Magang</TableHead>
                      <TableHead className="text-xs text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInterns.map((intern, index) => {
                      const userProfile = intern.internProfile?.user;
                      const institution = intern.internProfile?.institution;

                      return (
                        <TableRow key={intern.id} className="hover:bg-muted/30">
                          <TableCell className="text-center font-mono text-xs text-muted-foreground">
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-semibold text-foreground text-sm">
                                {userProfile?.fullName || 'Peserta Magang'}
                              </span>
                              <span className="text-xs text-muted-foreground font-mono">
                                {intern.internProfile?.studentNumber ? `NIM/NISN: ${intern.internProfile.studentNumber}` : userProfile?.email || '-'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 text-xs text-foreground">
                              <GraduationCap className="size-3.5 text-primary shrink-0" />
                              <span>{institution?.name || institution?.shortName || '-'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs font-medium bg-muted/30">
                              {intern.department?.name || 'Departemen'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center font-mono text-xs">
                            <div className="flex flex-col items-center">
                              <span className="font-medium text-foreground">
                                {formatDisplayDate(intern.actualStartDate)}
                              </span>
                              <span className="text-[11px] text-muted-foreground">
                                s/d {formatDisplayDate(intern.actualEndDate)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {getInternshipStatusBadge(intern.status)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
