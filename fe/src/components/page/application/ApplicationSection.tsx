import { PhantomSkeleton } from '@/components/atoms/PhantomSkeleton';
import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import { Input } from '@/components/atoms/input';
import type {
  ApplicationResponse,
  CreateApplicationBody,
  UpdateApplicationBody,
} from '@/types/api/application.types';
import { cn } from '@/utils/classname';
import {
  AlertCircle,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  FileText,
  Send,
  Trash2,
  UploadCloud,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';

export interface ApplicationSectionState {
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  applications: ApplicationResponse[];
  isSubmitting: boolean;
  isUploading: boolean;
}

export interface ApplicationSectionService {
  onCreate: (
    data: Pick<
      CreateApplicationBody,
      'requestedStartDate' | 'requestedEndDate' | 'motivation' | 'coverLetterFileId'
    >,
  ) => Promise<void>;
  onUpdateDraft: (id: string, data: UpdateApplicationBody) => Promise<void>;
  onSubmitDraft: (id: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
  onUploadFile: (file: File) => Promise<{ fileId: string } | null>;
}

export interface ApplicationSectionProps {
  state: ApplicationSectionState;
  service: ApplicationSectionService;
}

/** Label status aplikasi dalam Bahasa Indonesia. */
function applicationStatusLabel(status: string | null): string {
  switch (status) {
    case 'DRAFT':
      return 'Draft';
    case 'SUBMITTED':
      return 'Diajukan';
    case 'UNDER_REVIEW':
      return 'Sedang Direview';
    case 'RESUBMITTED':
      return 'Diajukan Ulang';
    case 'APPROVED':
      return 'Disetujui';
    case 'REJECTED':
      return 'Ditolak';
    default:
      return status ?? '-';
  }
}

function ApplicationStatusBadge({ status }: { status: string | null }) {
  const approved = status === 'APPROVED';
  const rejected = status === 'REJECTED';
  const reviewed = status === 'SUBMITTED' || status === 'UNDER_REVIEW' || status === 'RESUBMITTED';
  const Icon = approved ? CheckCircle2 : rejected ? XCircle : reviewed ? Send : FileText;

  return (
    <Badge
      variant={approved ? 'default' : rejected ? 'destructive' : reviewed ? 'secondary' : 'outline'}
      className={cn(approved && 'bg-green-600 hover:bg-green-700')}
    >
      <Icon className="size-3" />
      {applicationStatusLabel(status)}
    </Badge>
  );
}

function formatDate(value: string | null): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

const ACTIVE_STATUSES = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'RESUBMITTED'];

export function ApplicationSection({ state, service }: ApplicationSectionProps) {
  if (state.isPending) {
    return (
      <PhantomSkeleton loading>
        <div className="flex flex-col gap-6">
          <Card className="h-40" />
          <Card className="h-64" />
        </div>
      </PhantomSkeleton>
    );
  }

  if (state.isError) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
        <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
        <div className="flex flex-col gap-1 text-destructive">
          <p className="font-semibold">Gagal memuat data pengajuan</p>
          <p className="opacity-90">{state.errorMessage}</p>
        </div>
      </div>
    );
  }

  const activeApp = state.applications.find((app) => ACTIVE_STATUSES.includes(app.status ?? ''));

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Pengajuan Magang</h1>
        <p className="text-sm text-muted-foreground">
          Kelola surat pengantar dan permohonan magang Anda di PLN Persero.
        </p>
      </header>

      {activeApp ? (
        <ApplicationStatusCard
          app={activeApp}
          service={service}
          isSubmitting={state.isSubmitting}
        />
      ) : (
        <NewApplicationForm
          service={service}
          isSubmitting={state.isSubmitting}
          isUploading={state.isUploading}
        />
      )}

      {state.applications.length > 0 && (
        <ApplicationHistoryList applications={state.applications} />
      )}
    </section>
  );
}

function ApplicationStatusCard({
  app,
  service,
  isSubmitting,
}: {
  app: ApplicationResponse;
  service: ApplicationSectionService;
  isSubmitting: boolean;
}) {
  const isDraft = app.status === 'DRAFT';
  const isTerminal = app.status === 'APPROVED' || app.status === 'REJECTED';

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="flex flex-col gap-1">
          <CardTitle>Pengajuan Aktif</CardTitle>
          <CardDescription className="flex items-center gap-2">
            <FileText className="size-3.5" />
            {app.applicationNumber ?? 'Belum ada nomor pengajuan'}
          </CardDescription>
        </div>
        <ApplicationStatusBadge status={app.status} />
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
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

        {app.motivation && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Motivasi</span>
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

        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row">
          {isDraft && (
            <>
              <Button onClick={() => service.onSubmitDraft(app.id)} disabled={isSubmitting}>
                <Send className="size-4" />
                {isSubmitting ? 'Mengirim…' : 'Kirim Pengajuan'}
              </Button>
              <Button
                variant="outline"
                onClick={() => service.onCancel(app.id)}
                disabled={isSubmitting}
              >
                <Trash2 className="size-4" />
                Batalkan Draft
              </Button>
            </>
          )}
          {!isDraft && !isTerminal && (
            <Button
              variant="outline"
              onClick={() => service.onCancel(app.id)}
              disabled={isSubmitting}
            >
              <XCircle className="size-4" />
              Batalkan Pengajuan
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function NewApplicationForm({
  service,
  isSubmitting,
  isUploading,
}: {
  service: ApplicationSectionService;
  isSubmitting: boolean;
  isUploading: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [motivation, setMotivation] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    if (selected && selected.size > 5 * 1024 * 1024) {
      setLocalError('Ukuran file maksimal 5MB.');
      setFile(null);
      e.target.value = '';
      return;
    }
    setFile(selected);
    setLocalError(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);

    if (!file) {
      setLocalError('Surat pengantar wajib diunggah.');
      return;
    }
    if (!startDate || !endDate) {
      setLocalError('Tanggal mulai dan tanggal selesai harus diisi.');
      return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
      setLocalError('Tanggal mulai harus sebelum tanggal selesai.');
      return;
    }
    if (new Date(startDate) <= new Date()) {
      setLocalError('Tanggal mulai harus di masa depan.');
      return;
    }

    const upload = await service.onUploadFile(file);
    if (!upload) return;

    await service.onCreate({
      requestedStartDate: new Date(startDate).toISOString(),
      requestedEndDate: new Date(endDate).toISOString(),
      motivation: motivation.trim() || undefined,
      coverLetterFileId: upload.fileId,
    });
  };

  const fieldClass =
    'border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buat Pengajuan Baru</CardTitle>
        <CardDescription>
          Lengkapi detail magang dan unggah surat pengantar dari instansi pendidikan Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="startDate" className="text-sm font-medium">
                Tanggal Mulai
              </label>
              <Input
                id="startDate"
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="endDate" className="text-sm font-medium">
                Tanggal Selesai
              </label>
              <Input
                id="endDate"
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="motivation" className="text-sm font-medium">
              Motivasi <span className="text-muted-foreground">(opsional)</span>
            </label>
            <textarea
              id="motivation"
              rows={4}
              placeholder="Ceritakan alasan dan tujuan Anda mengikuti magang…"
              className={cn(fieldClass, 'h-auto py-2')}
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Surat Pengantar (PDF, maks 5MB)</span>
            <label
              htmlFor="coverLetter"
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors hover:border-primary/50 hover:bg-muted/40"
            >
              <UploadCloud className="size-8 text-muted-foreground" />
              <span className="text-sm font-medium">
                {file ? file.name : 'Klik untuk memilih file'}
              </span>
              <span className="text-xs text-muted-foreground">
                {file ? 'File siap diunggah' : 'Unggah surat pengantar dalam format PDF'}
              </span>
              <input
                id="coverLetter"
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {localError && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              {localError}
            </div>
          )}

          <div className="flex justify-end border-t pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || isUploading || !file || !startDate || !endDate}
            >
              {isUploading
                ? 'Mengunggah File…'
                : isSubmitting
                  ? 'Menyimpan…'
                  : 'Buat Draft Pengajuan'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function ApplicationHistoryList({
  applications,
}: {
  applications: ApplicationResponse[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Riwayat Pengajuan</CardTitle>
        <CardDescription>Daftar seluruh pengajuan yang pernah Anda buat.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col divide-y">
          {applications.map((app) => (
            <div
              key={app.id}
              className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate text-sm font-medium">
                  {app.applicationNumber ?? 'Draft'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(app.requestedStartDate)} — {formatDate(app.requestedEndDate)}
                </span>
              </div>
              <ApplicationStatusBadge status={app.status} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
