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
import { ApplicationStatusBadge } from '@/components/organisms/application/ApplicationStatusBadge';
import type { ApplicationResponse, ApplicationStatusValue } from '@/types/api/application.types';
import { AlertCircle, FileText, Loader2, RefreshCw, Search, User } from 'lucide-react';
import Link from 'next/link';

export interface ReceptionistApplicationsSectionProps {
  applications: ApplicationResponse[];
  isPending: boolean;
  isFetching?: boolean;
  isError: boolean;
  errorMessage?: string;
  searchQuery: string;
  statusFilter?: ApplicationStatusValue;
  onSearch: (query: string) => void;
  onStatusFilter: (status: ApplicationStatusValue | undefined) => void;
  onRefresh: () => void;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'SUBMITTED', label: 'Diajukan' },
  { value: 'UNDER_REVIEW', label: 'Sedang Ditinjau' },
  { value: 'APPROVED', label: 'Disetujui' },
  { value: 'REJECTED', label: 'Ditolak' },
];

export function ReceptionistApplicationsSection({
  applications,
  isPending,
  isFetching,
  isError,
  errorMessage,
  searchQuery,
  statusFilter,
  onSearch,
  onStatusFilter,
  onRefresh,
}: ReceptionistApplicationsSectionProps) {
  const isInitialLoading = isPending && applications.length === 0;

  return (
    <section className="flex flex-col gap-6">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground">Pengajuan Magang</h1>
          <p className="text-sm text-muted-foreground">
            Cari dan lihat detail pengajuan magang peserta.
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
            Perbarui
          </Button>
        )}
      </header>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Cari berdasarkan nama, email, NIM, nomor pengajuan…"
            className="pl-9 pr-9"
          />
          {isFetching && (
            <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-primary" />
          )}
        </div>
        <Select
          value={statusFilter || 'all'}
          onValueChange={(value) => onStatusFilter(value === 'all' ? undefined : (value as ApplicationStatusValue))}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Pilih Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {isInitialLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-32 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <div className="flex flex-col gap-1">
            <p className="font-semibold">Gagal memuat data pengajuan</p>
            <p className="opacity-90">{errorMessage}</p>
          </div>
        </div>
      ) : applications.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground">
          <FileText className="size-8 opacity-40" />
          <p className="text-sm font-medium">
            {searchQuery || statusFilter
              ? 'Tidak ada pengajuan yang sesuai dengan pencarian.'
              : 'Belum ada pengajuan magang.'}
          </p>
        </Card>
      ) : (
        <>
          {/* Application Cards */}
          <div className="grid grid-cols-1 gap-4">
            {applications.map((application) => (
              <Link
                key={application.id}
                href={`/receptionist/applications/${application.id}`}
                className="block"
              >
                <Card className="p-5 transition-all hover:border-primary/50 hover:shadow-md">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Main Info */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <User className="size-4 text-muted-foreground" />
                        <span className="font-semibold text-foreground">
                          {application.internProfile?.user?.fullName || '-'}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                        <span>{application.internProfile?.user?.email || '-'}</span>
                        <span>
                          {application.internProfile?.studentNumber || '-'} •{' '}
                          {application.internProfile?.institution?.name || '-'}
                        </span>
                        {application.internProfile?.major?.name && (
                          <span>{application.internProfile.major.name}</span>
                        )}
                      </div>
                      {application.applicationNumber && (
                        <Badge variant="outline" className="w-fit">
                          No: {application.applicationNumber}
                        </Badge>
                      )}
                    </div>

                    {/* Status & Date */}
                    <div className="flex flex-col items-start gap-2 sm:items-end">
                      <ApplicationStatusBadge status={application.status} />
                      {application.requestedStartDate && (
                        <span className="text-xs text-muted-foreground">
                          Mulai:{' '}
                          {new Date(application.requestedStartDate).toLocaleDateString('id-ID')}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {/* Note: Backend API doesn't return pagination meta for list endpoint */}
        </>
      )}
    </section>
  );
}
