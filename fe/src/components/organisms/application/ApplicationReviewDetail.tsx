'use client';

import { Button } from '@/components/atoms/button';
import { ApplicationDetailField } from '@/components/organisms/application/ApplicationDetailField';
import { ApplicationStatusBadge } from '@/components/organisms/application/ApplicationStatusBadge';
import type { ApplicationResponse, ApplicationStatusValue } from '@/types/api/application.types';
import { formatDate } from '@/utils/string.format';
import { CalendarCheck, CalendarClock, CheckCircle2, FileText, XCircle } from 'lucide-react';

// Hanya SUBMITTED / UNDER_REVIEW yang bisa diapprove/direject —
// diselaraskan dengan gate backend (application.service.ts approve/reject).
export const REVIEWABLE_STATUSES: ApplicationStatusValue[] = ['SUBMITTED', 'UNDER_REVIEW'];

export interface ApplicationReviewDetailProps {
  app: ApplicationResponse | null;
  onApprove: () => void;
  onReject: () => void;
}

/**
 * ApplicationReviewDetail — organism isi dialog review pengajuan.
 * Presentasi murni; status yang bisa direview didefinisikan di sini.
 */
export function ApplicationReviewDetail({
  app,
  onApprove,
  onReject,
}: ApplicationReviewDetailProps) {
  if (!app) return null;

  const reviewable = REVIEWABLE_STATUSES.includes(app.status as ApplicationStatusValue);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center sm:text-left">
        <h2 className="text-lg leading-none font-semibold flex items-center gap-2">
          <FileText className="size-5" />
          {app.applicationNumber ?? 'Pengajuan'}
        </h2>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <ApplicationStatusBadge status={app.status} />
          {app.internProfile?.user.fullName}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-4">
          <CalendarCheck className="mt-0.5 size-4 shrink-0 text-primary" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Tanggal Mulai</span>
            <span className="text-sm font-medium">{formatDate(app.requestedStartDate)}</span>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-4">
          <CalendarClock className="mt-0.5 size-4 shrink-0 text-primary" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Tanggal Selesai</span>
            <span className="text-sm font-medium">{formatDate(app.requestedEndDate)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-lg border p-4">
        <span className="text-xs font-medium text-muted-foreground">Data Peserta</span>
        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <ApplicationDetailField label="Nama" value={app.internProfile?.user.fullName} />
          <ApplicationDetailField label="Email" value={app.internProfile?.user.email} />
          <ApplicationDetailField label="NIM" value={app.internProfile?.studentNumber} />
          <ApplicationDetailField label="Institusi" value={app.internProfile?.institution?.name} />
          <ApplicationDetailField label="Jurusan" value={app.internProfile?.major?.name} />
          <ApplicationDetailField label="No. HP" value={app.internProfile?.phone} />
        </div>
      </div>

      {app.internProfile?.profileSkills && app.internProfile.profileSkills.length > 0 && (
        <div className="flex flex-col gap-2 rounded-lg border p-4">
          <span className="text-xs font-medium text-muted-foreground">Keterampilan</span>
          <div className="flex flex-wrap gap-2">
            {app.internProfile.profileSkills.map(({ skill }) => (
              <span
                key={skill.id}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {app.motivation && (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">Motivasi:</span>
          <p className="rounded-lg border bg-muted/30 p-3 text-sm">{app.motivation}</p>
        </div>
      )}

      {app.introductionLetterFile && (
        <div className="flex items-center gap-3 rounded-lg border p-3">
          <FileText className="size-4 shrink-0 text-primary" />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-sm font-medium">
              {app.introductionLetterFile.originalName}
            </span>
            <span className="text-xs text-muted-foreground">Surat pengantar</span>
          </div>
          <Button asChild variant="outline" size="sm">
            <a href={app.introductionLetterFile.url} target="_blank" rel="noreferrer">
              Lihat
            </a>
          </Button>
        </div>
      )}

      {app.status === 'REJECTED' && app.rejectionReason && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-destructive">Alasan Penolakan</span>
            <p className="text-sm text-destructive/90">{app.rejectionReason}</p>
          </div>
        </div>
      )}

      {app.reviewedBy && (
        <p className="text-xs text-muted-foreground">
          Direview oleh {app.reviewedBy.fullName}
          {app.reviewedAt ? ` pada ${formatDate(app.reviewedAt)}` : ''}
        </p>
      )}

      {reviewable && (
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <Button variant="destructive" onClick={onReject}>
            <XCircle className="size-4" />
            Tolak
          </Button>
          <Button onClick={onApprove}>
            <CheckCircle2 className="size-4" />
            Setujui & Tugaskan
          </Button>
        </div>
      )}
    </div>
  );
}
