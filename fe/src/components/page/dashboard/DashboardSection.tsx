import { PhantomSkeleton } from '@/components/atoms/PhantomSkeleton';
import { HrOverview } from '@/components/organisms/dashboard/HrOverview';
import { InternOverview } from '@/components/organisms/dashboard/InternOverview';
import { StatCard } from '@/components/organisms/dashboard/StatCard';
import { SupervisorOverview } from '@/components/organisms/dashboard/SupervisorOverview';
import { DASHBOARD_ROLE_LABELS } from '@/configs/app.config';
import type {
  HrDashboardResponse,
  InternDashboardResponse,
  SupervisorDashboardData,
} from '@/types/api/dashboard.types';
import { AlertTriangle, FileClock } from 'lucide-react';
import type { ReactNode } from 'react';

/** State yang dibagi seluruh section dashboard per role (presentation-only). */
export interface DashboardBaseState {
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  userName?: string;
}

/** Service yang dibagi seluruh section dashboard per role (placeholder aksi masa depan). */
export type DashboardService = Record<string, never>;

export interface InternDashboardSectionProps {
  state: DashboardBaseState & { data: InternDashboardResponse | null };
  service: DashboardService;
}

export interface HrDashboardSectionProps {
  state: DashboardBaseState & { data: HrDashboardResponse | null };
  service: DashboardService;
}

export interface SupervisorDashboardSectionProps {
  state: DashboardBaseState & { data: SupervisorDashboardData | null };
  service: DashboardService;
}

/** Kartu placeholder skeleton — kunci statis agar tidak memakai indeks array. */
const PLACEHOLDER_CARDS = Array.from({ length: 6 }, (_, i) => ({
  id: `skeleton-${i}`,
}));

/**
 * Skeleton loading berbasis phantom-ui — menggambar kartu placeholder yang sama
 * dengan kartu dashboard asli (icon, label, nilai, deskripsi), lalu shimmer
 * block menimpa pada koordinat hasil pengukuran DOM.
 */
function DashboardLoading({
  count = 4,
  columns = 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
}: {
  count?: number;
  columns?: string;
}) {
  return (
    <PhantomSkeleton loading>
      <div className={`grid grid-cols-1 gap-4 ${columns}`}>
        {PLACEHOLDER_CARDS.slice(0, count).map((card) => (
          <StatCard
            key={card.id}
            icon={FileClock}
            label="Memuat data…"
            value="0"
            description="Menunggu respons server"
          />
        ))}
      </div>
    </PhantomSkeleton>
  );
}

/** Pesan error sederhana (presentation-only). */
function DashboardError({ message }: { message?: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
      <div className="flex flex-col gap-0.5">
        <span className="font-medium text-foreground">Gagal memuat dashboard</span>
        <span className="text-muted-foreground">
          {message || 'Terjadi kesalahan saat mengambil data. Silakan coba lagi.'}
        </span>
      </div>
    </div>
  );
}

/** Header halaman dashboard (presentation-only). */
function DashboardHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <header className="flex flex-col gap-1">
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </header>
  );
}

/**
 * Kerangka section dashboard per role (presentation-only).
 *
 * Loading/error/empty state & header disusun di sini sehingga setiap section
 * role cukup menyuplai data via props `state` (dan aksi via `service`).
 * `subtitle` disuplai section karena label role spesifik per halaman.
 * `skeletonCount`/`skeletonColumns` menyesuaikan bentuk skeleton dengan grid
 * kartu dashboard role masing-masing.
 */
function DashboardFrame({
  userName,
  subtitle,
  isPending,
  isError,
  errorMessage,
  hasData,
  skeletonCount,
  skeletonColumns,
  children,
}: {
  userName?: string;
  subtitle: string;
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  hasData: boolean;
  skeletonCount?: number;
  skeletonColumns?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-6">
      <DashboardHeader title={userName ? `Halo, ${userName}` : 'Dashboard'} subtitle={subtitle} />

      {isPending ? <DashboardLoading count={skeletonCount} columns={skeletonColumns} /> : null}
      {!isPending && isError ? <DashboardError message={errorMessage} /> : null}
      {!isPending && !isError && hasData ? children : null}
      {!isPending && !isError && !hasData ? (
        <p className="text-sm text-muted-foreground">Belum ada data untuk ditampilkan.</p>
      ) : null}
    </section>
  );
}

/**
 * InternDashboardSection — tampilan dashboard peserta magang.
 * Presentasi murni; state & service disuplai container (folder /INTERN/dashboard).
 */
export function InternDashboardSection({ state, service }: InternDashboardSectionProps) {
  // service disiapkan untuk aksi masa depan (mis. buka detail notifikasi).
  void service;

  return (
    <DashboardFrame
      userName={state.userName}
      subtitle={`Ringkasan aktivitas Anda sebagai ${DASHBOARD_ROLE_LABELS.INTERN.toLowerCase()} di SIMAD.`}
      isPending={state.isPending}
      isError={state.isError}
      errorMessage={state.errorMessage}
      hasData={state.data !== null}
      skeletonCount={4}
      skeletonColumns="lg:grid-cols-2"
    >
      {state.data ? <InternOverview data={state.data} /> : null}
    </DashboardFrame>
  );
}

/**
 * HrDashboardSection — tampilan dashboard HR Admin.
 * Presentasi murni; state & service disuplai container (folder /HR_ADMIN/dashboard).
 */
export function HrDashboardSection({ state, service }: HrDashboardSectionProps) {
  // service disiapkan untuk aksi masa depan (mis. buka daftar pengajuan).
  void service;

  return (
    <DashboardFrame
      userName={state.userName}
      subtitle={`Ringkasan aktivitas Anda sebagai ${DASHBOARD_ROLE_LABELS.HR_ADMIN.toLowerCase()} di SIMAD.`}
      isPending={state.isPending}
      isError={state.isError}
      errorMessage={state.errorMessage}
      hasData={state.data !== null}
      skeletonCount={5}
      skeletonColumns="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
    >
      {state.data ? <HrOverview data={state.data} /> : null}
    </DashboardFrame>
  );
}

/**
 * SupervisorDashboardSection — tampilan dashboard supervisor.
 * Presentasi murni; state & service disuplai container (folder /SUPERVISOR/dashboard).
 */
export function SupervisorDashboardSection({ state, service }: SupervisorDashboardSectionProps) {
  // service disiapkan untuk aksi masa depan (mis. buka daftar absensi peserta).
  void service;

  return (
    <DashboardFrame
      userName={state.userName}
      subtitle={`Ringkasan aktivitas Anda sebagai ${DASHBOARD_ROLE_LABELS.SUPERVISOR.toLowerCase()} di SIMAD.`}
      isPending={state.isPending}
      isError={state.isError}
      errorMessage={state.errorMessage}
      hasData={state.data !== null}
      skeletonCount={4}
      skeletonColumns="sm:grid-cols-2 lg:grid-cols-4"
    >
      {state.data ? <SupervisorOverview data={state.data} /> : null}
    </DashboardFrame>
  );
}
