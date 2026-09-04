import { PhantomSkeleton } from '@/components/atoms/PhantomSkeleton';
import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import { Input } from '@/components/atoms/input';
import { ApplicationStatusBadge } from '@/components/organisms/application/ApplicationStatusBadge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select';
import type {
  ApplicationResponse,
  CreateApplicationBody,
  UpdateApplicationBody,
} from '@/types/api/application.types';
import { cn } from '@/utils/classname';
import { formatDate } from '@/utils/string.format';
import {
  AlertCircle,
  CalendarCheck,
  CalendarClock,
  Edit,
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
  onDeleteDraft: (id: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
  onUploadFile: (file: File) => Promise<{ fileId: string; fileUrl?: string } | null>;
  onPreviewFile?: (fileUrl: string) => void;
}

export interface ApplicationSectionProps {
  state: ApplicationSectionState;
  service: ApplicationSectionService;
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
  const [isEditing, setIsEditing] = useState(false);
  const isDraft = app.status === 'DRAFT';
  const isTerminal = app.status === 'APPROVED' || app.status === 'REJECTED';

  // Jika sedang edit dan status adalah DRAFT, tampilkan form edit
  if (isDraft && isEditing) {
    return (
      <EditDraftForm
        app={app}
        service={service}
        isSubmitting={isSubmitting}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

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
            <Button
              variant="outline"
              size="sm"
              onClick={() => service.onPreviewFile?.(app.introductionLetterFile!.url)}
            >
              Lihat PDF
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
                onClick={() => setIsEditing(true)}
                disabled={isSubmitting}
              >
                <Edit className="size-4" />
                Edit Draft
              </Button>
              <Button
                variant="destructive"
                onClick={() => service.onDeleteDraft(app.id)}
                disabled={isSubmitting}
              >
                <Trash2 className="size-4" />
                Hapus Draf
              </Button>
            </>
          )}
          {!isDraft && !isTerminal && (
            <Button
              variant="outline"
              onClick={() => service.onCancel(app.id)}
              disabled={isSubmitting}
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
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

const DURATION_OPTIONS = [
  { value: '2', label: '2 Bulan' },
  { value: '3', label: '3 Bulan' },
  { value: '4', label: '4 Bulan' },
  { value: '5', label: '5 Bulan' },
  { value: '6', label: '6 Bulan' },
  { value: '7', label: '7 Bulan' },
  { value: '8', label: '8 Bulan' },
  { value: '9', label: '9 Bulan' },
  { value: '10', label: '10 Bulan' },
  { value: '11', label: '11 Bulan' },
  { value: '12', label: '12 Bulan' },
];

function calculateEndDate(startIsoDate: string, monthsStr: string): string {
  if (!startIsoDate) return '';
  const d = new Date(startIsoDate);
  if (Number.isNaN(d.getTime())) return '';
  const months = parseInt(monthsStr, 10) || 2;
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
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
  const [durationMonths, setDurationMonths] = useState('2');
  const [endDate, setEndDate] = useState('');
  const [motivation, setMotivation] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    if (val) {
      setEndDate(calculateEndDate(val, durationMonths));
    } else {
      setEndDate('');
    }
  };

  const handleDurationChange = (val: string) => {
    setDurationMonths(val);
    if (startDate) {
      setEndDate(calculateEndDate(startDate, val));
    }
  };

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
      setLocalError('Tanggal mulai dan durasi magang harus diisi.');
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
            <div className="flex flex-col gap-2 min-w-0 w-full max-w-full overflow-hidden">
              <label htmlFor="startDate" className="text-sm font-medium">
                Tanggal Mulai *
              </label>
              <Input
                id="startDate"
                type="date"
                required
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full min-w-0 max-w-full overflow-hidden"
              />
            </div>
            <div className="flex flex-col gap-2 min-w-0 w-full max-w-full">
              <label htmlFor="duration" className="text-sm font-medium">
                Durasi Magang (Minimal 2 Bulan) *
              </label>
              <Select value={durationMonths} onValueChange={handleDurationChange}>
                <SelectTrigger id="duration" className="w-full border-input border rounded-md">
                  <SelectValue placeholder="Pilih durasi magang" />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {endDate && (
                <span className="text-xs text-muted-foreground">
                  Estimasi Selesai: <strong className="text-foreground">{formatDate(endDate)}</strong>
                </span>
              )}
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
            <span className="text-sm font-medium">Surat Pengantar (PDF, maks 5MB) *</span>
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
                  : 'Simpan Draft Pengajuan'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Form untuk edit draft yang sudah ada
function EditDraftForm({
  app,
  service,
  isSubmitting,
  onCancel,
}: {
  app: ApplicationResponse;
  service: ApplicationSectionService;
  isSubmitting: boolean;
  onCancel: () => void;
}) {
  // Initialize dengan data dari app yang ada
  const [file, setFile] = useState<File | null>(null);
  const [startDate, setStartDate] = useState(
    app.requestedStartDate ? new Date(app.requestedStartDate).toISOString().split('T')[0] : ''
  );
  const [endDate, setEndDate] = useState(
    app.requestedEndDate ? new Date(app.requestedEndDate).toISOString().split('T')[0] : ''
  );
  const [motivation, setMotivation] = useState(app.motivation ?? '');
  const [localError, setLocalError] = useState<string | null>(null);
  const [willChangeFile, setWillChangeFile] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    if (selected && selected.size > 5 * 1024 * 1024) {
      setLocalError('Ukuran file maksimal 5MB.');
      setFile(null);
      e.target.value = '';
      return;
    }
    setFile(selected);
    setWillChangeFile(!!selected);
    setLocalError(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);

    if (!startDate || !endDate) {
      setLocalError('Tanggal mulai dan selesai harus diisi.');
      return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
      setLocalError('Tanggal mulai harus sebelum tanggal selesai.');
      return;
    }

    const updateData: UpdateApplicationBody = {
      requestedStartDate: new Date(startDate).toISOString(),
      requestedEndDate: new Date(endDate).toISOString(),
      motivation: motivation.trim() || undefined,
    };

    // Jika ada file baru, upload dulu
    if (file) {
      const upload = await service.onUploadFile(file);
      if (!upload) {
        setLocalError('Gagal mengunggah file baru');
        return;
      }
      updateData.coverLetterFileId = upload.fileId;
    }

    await service.onUpdateDraft(app.id, updateData);
    onCancel(); // Kembali ke view mode
  };

  const fieldClass =
    'border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Draft Pengajuan</CardTitle>
        <CardDescription>
          Perbarui informasi pengajuan magang Anda sebelum mengirimkan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="edit-startDate" className="text-sm font-medium">
                Tanggal Mulai *
              </label>
              <Input
                id="edit-startDate"
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="edit-endDate" className="text-sm font-medium">
                Tanggal Selesai *
              </label>
              <Input
                id="edit-endDate"
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="edit-motivation" className="text-sm font-medium">
              Motivasi <span className="text-muted-foreground">(opsional)</span>
            </label>
            <textarea
              id="edit-motivation"
              rows={4}
              placeholder="Ceritakan alasan dan tujuan Anda mengikuti magang…"
              className={cn(fieldClass, 'h-auto py-2')}
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
            />
          </div>

          {/* File yang sudah ada */}
          {app.introductionLetterFile && !willChangeFile && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Surat Pengantar Saat Ini</span>
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <FileText className="size-4 shrink-0 text-primary" />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-sm font-medium">
                    {app.introductionLetterFile.originalName}
                  </span>
                  <span className="text-xs text-muted-foreground">File saat ini</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => service.onPreviewFile?.(app.introductionLetterFile!.url)}
                >
                  Lihat
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setWillChangeFile(true)}
                className="self-start"
              >
                Ganti File
              </Button>
            </div>
          )}

          {/* Upload file baru */}
          {willChangeFile && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Unggah Surat Pengantar Baru (PDF, maks 5MB)</span>
              <label
                htmlFor="edit-coverLetter"
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors hover:border-primary/50 hover:bg-muted/40"
              >
                <UploadCloud className="size-8 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {file ? file.name : 'Klik untuk memilih file baru'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {file ? 'File baru siap diunggah' : 'Unggah surat pengantar baru dalam format PDF'}
                </span>
                <input
                  id="edit-coverLetter"
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setWillChangeFile(false);
                  setFile(null);
                }}
                className="self-start"
              >
                Batal Ganti File
              </Button>
            </div>
          )}

          {localError && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              {localError}
            </div>
          )}

          <div className="flex gap-3 justify-end border-t pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan…' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
