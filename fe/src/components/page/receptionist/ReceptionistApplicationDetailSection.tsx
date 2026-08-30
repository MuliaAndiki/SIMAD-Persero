'use client';

import { Button } from '@/components/atoms/button';
import { Card } from '@/components/atoms/card';
import { ApplicationDetailField } from '@/components/organisms/application/ApplicationDetailField';
import { ApplicationStatusBadge } from '@/components/organisms/application/ApplicationStatusBadge';
import type { ApplicationResponse } from '@/types/api/application.types';
import { AlertCircle, ArrowLeft, FileText, Loader2 } from 'lucide-react';
import Link from 'next/link';

export interface ReceptionistApplicationDetailSectionProps {
  application?: ApplicationResponse;
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
}

export function ReceptionistApplicationDetailSection({
  application,
  isPending,
  isError,
  errorMessage,
}: ReceptionistApplicationDetailSectionProps) {
  if (isPending) {
    return (
      <section className="flex flex-col gap-6">
        <Card className="flex items-center justify-center gap-2 p-8">
          <Loader2 className="size-6 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Memuat detail pengajuan...</span>
        </Card>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="flex flex-col gap-6">
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <div className="flex flex-col gap-1">
            <p className="font-semibold">Gagal memuat detail pengajuan</p>
            <p className="opacity-90">{errorMessage}</p>
          </div>
        </div>
        <Link href="/receptionist/applications">
          <Button variant="outline">
            <ArrowLeft className="mr-2 size-4" />
            Kembali
          </Button>
        </Link>
      </section>
    );
  }

  if (!application) {
    return (
      <section className="flex flex-col gap-6">
        <Card className="flex flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground">
          <FileText className="size-8 opacity-40" />
          <p className="text-sm font-medium">Data pengajuan tidak ditemukan.</p>
        </Card>
        <Link href="/receptionist/applications">
          <Button variant="outline">
            <ArrowLeft className="mr-2 size-4" />
            Kembali
          </Button>
        </Link>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      {/* Header */}
      <header className="flex flex-col gap-3">
        <Link href="/receptionist/applications">
          <Button variant="ghost" size="sm" className="w-fit">
            <ArrowLeft className="mr-2 size-4" />
            Kembali ke Daftar
          </Button>
        </Link>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-foreground">Detail Pengajuan Magang</h1>
            {application.applicationNumber && (
              <p className="text-sm text-muted-foreground">
                Nomor: {application.applicationNumber}
              </p>
            )}
          </div>
          <ApplicationStatusBadge status={application.status} />
        </div>
      </header>

      {/* Personal Information */}
      <Card className="flex flex-col gap-4 p-6">
        <h2 className="text-lg font-semibold text-foreground">Informasi Peserta</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ApplicationDetailField 
            label="Nama Lengkap" 
            value={application.internProfile?.user?.fullName} 
          />
          <ApplicationDetailField 
            label="Email" 
            value={application.internProfile?.user?.email} 
          />
          <ApplicationDetailField 
            label="Nomor Telepon" 
            value={application.internProfile?.phone} 
          />
          <ApplicationDetailField 
            label="NIM/NPM" 
            value={application.internProfile?.studentNumber} 
          />
          <ApplicationDetailField 
            label="Institusi" 
            value={application.internProfile?.institution?.name} 
          />
          <ApplicationDetailField 
            label="Jurusan/Prodi" 
            value={application.internProfile?.major?.name} 
          />
        </div>
      </Card>

      {/* Internship Details */}
      <Card className="flex flex-col gap-4 p-6">
        <h2 className="text-lg font-semibold text-foreground">Detail Magang</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ApplicationDetailField
            label="Tanggal Mulai"
            value={
              application.requestedStartDate
                ? new Date(application.requestedStartDate).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : undefined
            }
          />
          <ApplicationDetailField
            label="Tanggal Selesai"
            value={
              application.requestedEndDate
                ? new Date(application.requestedEndDate).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : undefined
            }
          />
        </div>
        {application.motivation && (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground">Motivasi</span>
            <p className="rounded-lg bg-muted/50 p-3 text-sm text-foreground">
              {application.motivation}
            </p>
          </div>
        )}
      </Card>

      {/* Documents */}
      {application.introductionLetterFile?.url && (
        <Card className="flex flex-col gap-4 p-6">
          <h2 className="text-lg font-semibold text-foreground">Dokumen</h2>
          <div className="flex items-center gap-3">
            <FileText className="size-5 text-muted-foreground" />
            <div className="flex flex-1 flex-col gap-1">
              <span className="text-sm font-medium text-foreground">Surat Pengantar</span>
              <Link
                href={application.introductionLetterFile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Lihat Dokumen
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Review Information (if reviewed) */}
      {application.reviewedAt && (
        <Card className="flex flex-col gap-4 p-6">
          <h2 className="text-lg font-semibold text-foreground">Informasi Review</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ApplicationDetailField 
              label="Direview Oleh" 
              value={application.reviewedBy?.fullName} 
            />
            <ApplicationDetailField
              label="Tanggal Review"
              value={
                application.reviewedAt
                  ? new Date(application.reviewedAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : undefined
              }
            />
          </div>
          {application.rejectionReason && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-foreground">Alasan Penolakan</span>
              <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {application.rejectionReason}
              </p>
            </div>
          )}
        </Card>
      )}
    </section>
  );
}
