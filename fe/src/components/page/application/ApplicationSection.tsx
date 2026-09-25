import { PhantomSkeleton } from '@/components/atoms/PhantomSkeleton';
import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import { Input } from '@/components/atoms/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select';
import ApplicationStatusCard from '@/components/organisms/application/ApplicationActive';
import type {
  ApplicationResponse,
  CreateApplicationBody,
  UpdateApplicationBody,
} from '@/types/api/application.types';
import type { OfficeResponse } from '@/types/api/office.types';
import { cn } from '@/utils/classname';
import { formatDate } from '@/utils/string.format';
import { AlertCircle, Building2, UploadCloud } from 'lucide-react';
import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
export interface ApplicationSectionState {
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  applications: ApplicationResponse[];
  offices: OfficeResponse[];
  isOfficesPending: boolean;
  isSubmitting: boolean;
  isUploading: boolean;
}

export interface ApplicationSectionService {
  onCreate: (
    data: Pick<
      CreateApplicationBody,
      | 'requestedStartDate'
      | 'requestedEndDate'
      | 'motivation'
      | 'coverLetterFileId'
      | 'officeLocationId'
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
          offices={state.offices}
          isOfficesPending={state.isOfficesPending}
          isSubmitting={state.isSubmitting}
        />
      ) : (
        <NewApplicationForm
          service={service}
          offices={state.offices}
          isOfficesPending={state.isOfficesPending}
          isSubmitting={state.isSubmitting}
          isUploading={state.isUploading}
        />
      )}
    </section>
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
  const months = Number.parseInt(monthsStr, 10) || 2;
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
}

function NewApplicationForm({
  service,
  offices,
  isOfficesPending,
  isSubmitting,
  isUploading,
}: {
  service: ApplicationSectionService;
  offices: OfficeResponse[];
  isOfficesPending: boolean;
  isSubmitting: boolean;
  isUploading: boolean;
}) {
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [facultyFile, setFacultyFile] = useState<File | null>(null);
  const [startDate, setStartDate] = useState('');
  const [durationMonths, setDurationMonths] = useState('2');
  const [endDate, setEndDate] = useState('');
  const [officeId, setOfficeId] = useState('');
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

  const handleCvChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    if (selected && selected.size > 5 * 1024 * 1024) {
      setLocalError('Ukuran CV maksimal 5MB.');
      setCvFile(null);
      e.target.value = '';
      return;
    }
    setCvFile(selected);
    setLocalError(null);
  };

  const handleFacultyFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    if (selected && selected.size > 5 * 1024 * 1024) {
      setLocalError('Ukuran Surat Permohonan Fakultas maksimal 5MB.');
      setFacultyFile(null);
      e.target.value = '';
      return;
    }
    setFacultyFile(selected);
    setLocalError(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);

    if (!cvFile && !facultyFile) {
      setLocalError('Curriculum Vitae (CV) dan Surat Permohonan Fakultas wajib diunggah.');
      return;
    }
    if (!officeId) {
      setLocalError('Lokasi kantor tujuan wajib dipilih.');
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

    const primaryFile = facultyFile || cvFile;
    if (!primaryFile) return;

    const upload = await service.onUploadFile(primaryFile);
    if (!upload) return;

    await service.onCreate({
      requestedStartDate: new Date(startDate).toISOString(),
      requestedEndDate: new Date(endDate).toISOString(),
      motivation: motivation.trim() || undefined,
      coverLetterFileId: upload.fileId,
      officeLocationId: officeId,
    });
  };

  const fieldClass =
    'border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buat Pengajuan Baru</CardTitle>
        <CardDescription>
          Lengkapi detail magang dan unggah dokumen wajib (CV & Surat Permohonan Fakultas/Kampus).
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
                  Estimasi Selesai:{' '}
                  <strong className="text-foreground">{formatDate(endDate)}</strong>
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="office" className="text-sm font-medium">
              Lokasi Kantor Tujuan *
            </label>
            <Select value={officeId} onValueChange={setOfficeId} disabled={isOfficesPending}>
              <SelectTrigger id="office" className="w-full border-input border rounded-md">
                <SelectValue
                  placeholder={
                    isOfficesPending ? 'Memuat daftar kantor…' : 'Pilih kantor tujuan magang'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {offices.map((office) => (
                  <SelectItem key={office.id} value={office.id}>
                    {office.name ?? 'Kantor'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Building2 className="size-3.5" />
              Anda dapat absen di kantor cabang mana pun yang berada dalam radius geofence.
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="motivation" className="text-sm font-medium">
              Motivasi <span className="text-muted-foreground">(opsional)</span>
            </label>
            <textarea
              id="motivation"
              rows={3}
              placeholder="Ceritakan alasan dan tujuan Anda mengikuti magang…"
              className={cn(fieldClass, 'h-auto py-2')}
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
            />
          </div>

          {/* Upload CV & Surat Fakultas Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">1. Curriculum Vitae (CV) *</span>
              <label
                htmlFor="cvUpload"
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors hover:border-primary/50 hover:bg-muted/40"
              >
                <UploadCloud className="size-6 text-primary" />
                <span className="text-xs font-semibold">
                  {cvFile ? cvFile.name : 'Pilih File CV (PDF)'}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {cvFile ? 'CV siap diunggah' : 'Format PDF, maks. 5MB'}
                </span>
                <input
                  id="cvUpload"
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={handleCvChange}
                />
              </label>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">2. Surat Permohonan Fakultas *</span>
              <label
                htmlFor="facultyUpload"
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors hover:border-primary/50 hover:bg-muted/40"
              >
                <UploadCloud className="size-6 text-primary" />
                <span className="text-xs font-semibold">
                  {facultyFile ? facultyFile.name : 'Pilih Surat Fakultas (PDF)'}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {facultyFile ? 'Surat siap diunggah' : 'Format PDF, maks. 5MB'}
                </span>
                <input
                  id="facultyUpload"
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={handleFacultyFileChange}
                />
              </label>
            </div>
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
              disabled={isSubmitting || isUploading || (!cvFile && !facultyFile) || !officeId || !startDate || !endDate}
            >
              {isUploading
                ? 'Mengunggah Dokumen…'
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

