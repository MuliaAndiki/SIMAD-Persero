'use client';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Card } from '@/components/atoms/card';
import { Input } from '@/components/atoms/input';
import type { ReceptionistDashboardData } from '@/types/api/dashboard.types';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  UserCheck,
  Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';

export interface ReceptionistDashboardSectionProps {
  data?: ReceptionistDashboardData | null;
  isPending: boolean;
  isFetching?: boolean;
  isError: boolean;
  errorMessage?: string;
  onRefresh?: () => void;
}

export function ReceptionistDashboardSection({
  data,
  isPending,
  isFetching,
  isError,
  errorMessage,
  onRefresh,
}: ReceptionistDashboardSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAttendances = useMemo(() => {
    const list = data?.recentAttendances ?? [];
    if (!searchQuery.trim()) return list;
    const queryLower = searchQuery.trim().toLowerCase();
    return list.filter(
      (item) =>
        item.internName.toLowerCase().includes(queryLower) ||
        item.internEmail.toLowerCase().includes(queryLower) ||
        (item.departmentName && item.departmentName.toLowerCase().includes(queryLower)) ||
        (item.officeName && item.officeName.toLowerCase().includes(queryLower)),
    );
  }, [data?.recentAttendances, searchQuery]);

  const isInitialLoading = isPending && !data;

  return (
    <section className="flex flex-col gap-6">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground">Dashboard Resepsionis</h1>
          <p className="text-sm text-muted-foreground">
            Pantau kehadiran harian intern & verifikasi kedatangan di lokasi kantor.
          </p>
        </div>
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isFetching}
            className="w-fit"
          >
            <RefreshCw className={`mr-2 size-4 ${isFetching ? 'animate-spin' : ''}`} />
            Perbarui Data
          </Button>
        )}
      </header>

      {/* Metrics Cards */}
      {isInitialLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="h-28 animate-pulse bg-muted/40" />
          <Card className="h-28 animate-pulse bg-muted/40" />
          <Card className="h-28 animate-pulse bg-muted/40" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="flex items-center gap-4 p-5">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="size-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-foreground">
                {data?.activeInternsCount ?? 0}
              </span>
              <span className="text-xs text-muted-foreground">Total Intern Aktif</span>
            </div>
          </Card>

          <Card className="flex items-center gap-4 p-5">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <UserCheck className="size-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-foreground">
                {data?.presentTodayCount ?? 0}
              </span>
              <span className="text-xs text-muted-foreground">Hadir Hari Ini</span>
            </div>
          </Card>

          <Card className="flex items-center gap-4 p-5">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="size-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-foreground">
                {data?.pendingCheckInCount ?? 0}
              </span>
              <span className="text-xs text-muted-foreground">Belum Absen Masuk</span>
            </div>
          </Card>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-col gap-4">
        {/* Search Input */}
        <div className="relative max-w-md">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama intern, email, atau departemen…"
            className="pl-9 pr-9"
          />
          {isFetching && (
            <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-primary" />
          )}
        </div>

        {/* Table / List */}
        {isInitialLoading ? (
          <Card className="h-64 animate-pulse bg-muted/40" />
        ) : isError ? (
          <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <div className="flex flex-col gap-1">
              <p className="font-semibold">Gagal memuat data dashboard resepsionis</p>
              <p className="opacity-90">{errorMessage}</p>
            </div>
          </div>
        ) : filteredAttendances.length === 0 ? (
          <Card className="flex flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground">
            <CheckCircle2 className="size-8 opacity-40" />
            <p className="text-sm font-medium">Belum ada aktivitas absensi hari ini.</p>
          </Card>
        ) : (
          <Card className="overflow-x-auto p-0">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/30 text-xs font-medium text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Peserta Magang</th>
                  <th className="px-4 py-3">Departemen & Kantor</th>
                  <th className="px-4 py-3">Waktu Check-In</th>
                  <th className="px-4 py-3">Status Masuk</th>
                  <th className="px-4 py-3">Status Absensi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAttendances.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{item.internName}</span>
                        <span className="text-xs text-muted-foreground">{item.internEmail}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1 text-xs">
                        {item.departmentName && (
                          <div className="flex items-center gap-1 text-foreground">
                            <Building2 className="size-3 text-muted-foreground" />
                            <span>{item.departmentName}</span>
                          </div>
                        )}
                        {item.officeName && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="size-3" />
                            <span>{item.officeName}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-foreground">
                        {item.checkInAt
                          ? new Date(item.checkInAt).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {item.checkInStatus === 'ON_TIME' ? (
                        <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          Tepat Waktu
                        </Badge>
                      ) : item.checkInStatus === 'LATE' ? (
                        <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          Terlambat
                        </Badge>
                      ) : (
                        <Badge variant="outline">{item.checkInStatus ?? '-'}</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {item.attendanceStatus === 'PRESENT' || item.attendanceStatus === 'COMPLETED' ? (
                        <Badge className="bg-emerald-600 hover:bg-emerald-700">Hadir</Badge>
                      ) : item.attendanceStatus === 'LATE' ? (
                        <Badge className="bg-amber-600 hover:bg-amber-700">Terlambat</Badge>
                      ) : (
                        <Badge variant="secondary">{item.attendanceStatus ?? '-'}</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </section>
  );
}
