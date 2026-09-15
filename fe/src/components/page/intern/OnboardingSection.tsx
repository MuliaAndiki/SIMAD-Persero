import {
  AlertTriangle,
  BookOpen,
  BookOpenCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  GraduationCap,
  Loader2,
  Mail,
  MapPin,
  Shirt,
  User,
  UserCheck,
} from 'lucide-react';
import { useState } from 'react';

import { PhantomSkeleton } from '@/components/atoms/PhantomSkeleton';
import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import type { InternshipResponse } from '@/types/api/internship.types';

/** State yang disuplai container — section murni presentasi. */
export interface OnboardingSectionState {
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  internship: InternshipResponse | null;
  isSubmitting: boolean;
}

/** Aksi dari container (konfirmasi + mutation). */
export interface OnboardingSectionService {
  onSubmit: () => void;
}

export interface OnboardingSectionProps {
  state: OnboardingSectionState;
  service: OnboardingSectionService;
}

/** Baris placeholder skeleton — key statis agar tidak memakai indeks array. */
const PLACEHOLDER_ROWS = Array.from({ length: 5 }, (_, i) => ({
  id: `onboarding-skeleton-${i}`,
}));

/** Ketentuan tata tertib yang wajib disetujui peserta magang. */
const TATA_TERTIB = [
  'Wajib hadir tepat waktu sesuai jadwal yang ditetapkan.',
  'Menggunakan pakaian rapi dan sopan selama kegiatan magang.',
  'Menjaga nama baik perusahaan dan kerahasiaan data perusahaan.',
  'Mengisi absensi harian melalui aplikasi pada saat masuk dan pulang.',
  'Melaporkan kendala atau ketidakhadiran kepada supervisor.',
  'Mematuhi seluruh aturan dan ketentuan yang berlaku di lingkungan kerja.',
];

/** Jam kerja harian selama magang (Senin – Jumat). */
const JAM_KERJA = [
  { hari: 'Senin – Kamis', jam: '08.00 – 17.00' },
  { hari: 'Jumat', jam: '07.30 – 17.00' },
  { hari: 'Istirahat', jam: '12.30 – 13.30' },
];

/** Tata cara pakaian harian selama magang (Senin – Jumat). */
const PAKAIAN = [
  { hari: 'Senin', aturan: 'Hitam putih, jilbab hitam.' },
  { hari: 'Selasa', aturan: 'PDH Kampus.' },
  {
    hari: 'Rabu – Kamis',
    aturan: 'Menyesuaikan, yang penting rapi dan sopan.',
  },
  {
    hari: 'Jumat',
    aturan:
      'Ada 2 opsi: jika ada pengajian pakai batik; jika senam/olahraga pakai training pagi, siang Jumat ganti batik.',
  },
];

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

function internshipStatusLabel(status: string | null): string {
  switch (status) {
    case 'ONBOARDING_PENDING':
      return 'Menunggu Onboarding';
    case 'ONBOARDING_COMPLETED':
      return 'Onboarding Selesai';
    case 'ACTIVE':
      return 'Aktif';
    case 'COMPLETED':
      return 'Selesai';
    case 'CERTIFICATE_GENERATED':
      return 'Sertifikat Dibuat';
    case 'ARCHIVED':
      return 'Diarsipkan';
    default:
      return status ?? '-';
  }
}

/** Skeleton loading halaman onboarding. */
function OnboardingLoading() {
  return (
    <PhantomSkeleton loading>
      <Card>
        <CardContent className="flex flex-col gap-4 p-6">
          {PLACEHOLDER_ROWS.map((row) => (
            <div key={row.id} className="h-4 rounded bg-muted" />
          ))}
        </CardContent>
      </Card>
    </PhantomSkeleton>
  );
}

/** Pesan error — tampil jika query internship gagal. */
function OnboardingError({ message }: { message?: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
      <div className="flex flex-col gap-1">
        <p className="font-medium text-destructive">Gagal memuat data onboarding</p>
        <p className="text-muted-foreground">
          {message ?? 'Silakan muat ulang halaman untuk mencoba lagi.'}
        </p>
      </div>
    </div>
  );
}

/** Belum ada magang yang disetujui. */
function NoInternshipCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpenCheck className="size-4 text-primary" />
          Belum Ada Pengajuan Disetujui
        </CardTitle>
        <CardDescription>
          Halaman ini hanya tersedia setelah pengajuan magang Anda disetujui oleh HR.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Setelah pengajuan disetujui, Anda dapat menyelesaikan onboarding di halaman ini agar
          status magang siap diaktifkan.
        </p>
      </CardContent>
    </Card>
  );
}

/** Status sudah melewati ONBOARDING_PENDING. */
function OnboardingDoneCard({
  internship,
}: {
  internship: InternshipResponse;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="size-4 text-emerald-500" />
          Onboarding Selesai
        </CardTitle>
        <CardDescription>Persetujuan onboarding Anda telah tercatat di sistem.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div>
          <Badge>{internshipStatusLabel(internship.status)}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {internship.status === 'ONBOARDING_COMPLETED'
            ? 'Tim HR akan segera mengaktifkan magang Anda. Menu Absensi & Riwayat aktif setelah status magang menjadi Aktif.'
            : 'Magang Anda sudah berjalan. Anda dapat menggunakan menu Absensi & Riwayat.'}
        </p>
      </CardContent>
    </Card>
  );
}

/** Informasi supervisor pembimbing yang bertanggung jawab. */
function SupervisorInfoCard({
  internship,
}: {
  internship: InternshipResponse;
}) {
  const assignment = internship.supervisorAssignments?.[0];
  const supervisor = assignment?.supervisor;

  return (
    <Card>
      <CardHeader className="space-y-0.5">
        <CardTitle className="flex items-center gap-2 text-base">
          <UserCheck className="size-4 text-primary" />
          Supervisor Pembimbing
        </CardTitle>
        <CardDescription>Pembimbing yang bertanggung jawab selama Anda magang.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2.5 text-sm">
        {supervisor ? (
          <>
            <div className="flex items-center gap-2">
              <User className="size-4 shrink-0 text-muted-foreground" />
              <span className="font-medium">{supervisor.fullName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="size-4 shrink-0 text-muted-foreground" />
              <span>{supervisor.email}</span>
            </div>
            {assignment?.assignedAt ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="size-4 shrink-0" />
                <span>Ditugaskan sejak {formatDate(assignment.assignedAt)}</span>
              </div>
            ) : null}
          </>
        ) : (
          <p className="text-muted-foreground">
            Supervisor pembimbing akan ditetapkan oleh HR setelah onboarding selesai.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/** Jam kerja & tata cara pakaian harian selama magang. */
function WorkInfoCard() {
  return (
    <Card>
      <CardHeader className="space-y-0.5">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="size-4 text-primary" />
          Jam Kerja & Tata Cara Pakaian
        </CardTitle>
        <CardDescription>Ketentuan harian selama menjalani magang (Senin – Jumat).</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {/* Jam kerja */}
        <div className="flex flex-col gap-2.5">
          <h3 className="text-sm font-semibold">Jam Kerja</h3>
          <dl className="flex flex-col gap-2 text-sm">
            {JAM_KERJA.map((item) => (
              <div
                key={item.hari}
                className="flex items-center justify-between gap-2 rounded-lg bg-muted/40 px-3 py-2"
              >
                <dt className="text-muted-foreground">{item.hari}</dt>
                <dd className="font-medium">{item.jam}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Tata cara pakaian */}
        <div className="flex flex-col gap-2.5">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold">
            <Shirt className="size-4 text-muted-foreground" />
            Tata Cara Pakaian
          </h3>
          <ol className="flex flex-col gap-2.5 text-sm">
            {PAKAIAN.map((item, index) => (
              <li key={item.hari} className="flex items-start gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {index + 1}
                </span>
                <span>
                  <span className="font-medium">{item.hari}:</span> {item.aturan}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}

interface OnboardingAgreementCardProps {
  internship: InternshipResponse;
  agreed: boolean;
  onAgreedChange: (value: boolean) => void;
  isSubmitting: boolean;
  onSubmit: () => void;
}

function OnboardingAgreementCard({
  internship,
  agreed,
  onAgreedChange,
  isSubmitting,
  onSubmit,
}: OnboardingAgreementCardProps) {
  const rows = [
    {
      icon: User,
      label: 'Nama',
      value: internship.internProfile?.user.fullName ?? '-',
    },
    {
      icon: GraduationCap,
      label: 'Institusi',
      value: internship.internProfile?.institution?.name ?? '-',
    },
    {
      icon: BookOpen,
      label: 'Jurusan',
      value: internship.internProfile?.major?.name ?? '-',
    },
    {
      icon: Building2,
      label: 'Departemen',
      value: internship.department?.name ?? '-',
    },
    {
      icon: MapPin,
      label: 'Penempatan',
      value: internship.officeLocation?.name ?? '-',
    },
    {
      icon: CalendarDays,
      label: 'Periode',
      value: `${formatDate(internship.actualStartDate)} – ${formatDate(internship.actualEndDate)}`,
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <CardTitle className="flex items-center gap-2">
            <BookOpenCheck className="size-4 text-primary" />
            Persetujuan Onboarding
          </CardTitle>
          <CardDescription>
            Periksa data diri dan ketentuan berikut sebelum menyelesaikan onboarding.
          </CardDescription>
        </div>
        <Badge>{internshipStatusLabel(internship.status)}</Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {/* Ringkasan data magang */}
        <dl className="grid grid-cols-1 gap-3 rounded-xl border bg-muted/30 p-4 text-sm sm:grid-cols-2">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center gap-2">
              <row.icon className="size-4 shrink-0 text-muted-foreground" />
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="ml-auto text-right font-medium">{row.value}</dd>
            </div>
          ))}
        </dl>

        {/* Informasi tambahan: supervisor & jam kerja/pakaian */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SupervisorInfoCard internship={internship} />
          <WorkInfoCard />
        </div>

        {/* Tata tertib */}
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold">Tata Tertib Magang</h2>
          <ol className="flex flex-col gap-2.5 text-sm">
            {TATA_TERTIB.map((rule, index) => (
              <li key={rule} className="flex items-start gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {index + 1}
                </span>
                <span>{rule}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Persetujuan */}
        <div className="flex flex-col gap-4 rounded-xl border p-4">
          <label className="flex cursor-pointer items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => onAgreedChange(e.target.checked)}
              className="mt-0.5 size-4 shrink-0 accent-primary"
            />
            <span>
              Saya telah membaca, memahami, dan menyetujui seluruh ketentuan tata tertib magang di
              atas.
            </span>
          </label>
          <Button
            type="button"
            size="sm"
            className="w-fit"
            disabled={!agreed || isSubmitting}
            onClick={onSubmit}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Menyimpan…
              </>
            ) : (
              'Saya Menyetujui & Selesaikan Onboarding'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function OnboardingSection({ state, service }: OnboardingSectionProps) {
  const [agreed, setAgreed] = useState(false);
  const { internship } = state;

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Onboarding</h1>
        <p className="text-sm text-muted-foreground">
          Selesaikan onboarding Anda sebelum memulai magang.
        </p>
      </header>

      {state.isPending ? (
        <OnboardingLoading />
      ) : state.isError ? (
        <OnboardingError message={state.errorMessage} />
      ) : !internship ? (
        <NoInternshipCard />
      ) : internship.status === 'ONBOARDING_PENDING' ? (
        <OnboardingAgreementCard
          internship={internship}
          agreed={agreed}
          onAgreedChange={setAgreed}
          isSubmitting={state.isSubmitting}
          onSubmit={service.onSubmit}
        />
      ) : (
        <OnboardingDoneCard internship={internship} />
      )}
    </section>
  );
}
