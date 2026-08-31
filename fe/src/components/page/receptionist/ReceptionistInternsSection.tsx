'use client';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Card } from '@/components/atoms/card';
import { Input } from '@/components/atoms/input';
import type { InternshipResponse } from '@/types/api/internship.types';
import {
  AlertCircle,
  Building2,
  Loader2,
  MapPin,
  RefreshCw,
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
  onSearch: (query: string) => void;
  onRefresh?: () => void;
}

export function ReceptionistInternsSection({
  interns,
  isPending,
  isFetching,
  isError,
  errorMessage,
  searchQuery,
  onSearch,
  onRefresh,
}: ReceptionistInternsSectionProps) {
  const isInitialLoading = isPending && interns.length === 0;

  return (
    <section className="flex flex-col gap-6">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground">Intern Aktif</h1>
          <p className="text-sm text-muted-foreground">
            Daftar peserta magang yang sedang aktif dan informasi penempatannya.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="w-fit">
            {interns.length} Intern Aktif
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

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Cari nama, email, NIM, departemen, atau kantor…"
          className="pl-9 pr-9"
        />
        {isFetching && (
          <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-primary" />
        )}
      </div>

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
            <p className="font-semibold">Gagal memuat data intern aktif</p>
            <p className="opacity-90">{errorMessage}</p>
          </div>
        </div>
      ) : interns.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground">
          <Users className="size-8 opacity-40" />
          <p className="text-sm font-medium">
            {searchQuery
              ? 'Tidak ada intern yang sesuai dengan pencarian.'
              : 'Tidak ada intern aktif saat ini.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {interns.map((intern) => (
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
                        <span className="text-muted-foreground">{intern.officeLocation.name}</span>
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

              {/* Period Info */}
              {(intern.actualStartDate || intern.actualEndDate) && (
                <div className="mt-4 border-t pt-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Periode Magang:</span>
                    {intern.actualStartDate && (
                      <span>{new Date(intern.actualStartDate).toLocaleDateString('id-ID')}</span>
                    )}
                    {intern.actualStartDate && intern.actualEndDate && <span>-</span>}
                    {intern.actualEndDate && (
                      <span>{new Date(intern.actualEndDate).toLocaleDateString('id-ID')}</span>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
