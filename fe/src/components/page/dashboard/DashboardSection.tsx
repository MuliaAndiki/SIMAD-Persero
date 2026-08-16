import { PhantomSkeleton } from '@/components/atoms/PhantomSkeleton';
import { Card, CardContent, CardHeader } from '@/components/atoms/card';
import { HrChartsSection } from '@/components/organisms/dashboard/HrChartsSection';
import { HrOverview } from '@/components/organisms/dashboard/HrOverview';
import { InternOverview } from '@/components/organisms/dashboard/InternOverview';
import { RecentActivityList } from '@/components/organisms/dashboard/RecentActivityList';
import { StatCard } from '@/components/organisms/dashboard/StatCard';
import { StatisticsGrid } from '@/components/organisms/dashboard/StatisticsGrid';
import { SupervisorAttendanceChart } from '@/components/organisms/dashboard/SupervisorAttendanceChart';
import { SupervisorOverview } from '@/components/organisms/dashboard/SupervisorOverview';
import { DASHBOARD_ROLE_LABELS } from '@/configs/app.config';
import type {
  ChartsResponse,
  DashboardStatistics,
  HrDashboardResponse,
  InternDashboardResponse,
  RecentActivityResponse,
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

/** State per blok data dashboard HR — tiap blok punya status loading/error sendiri. */
export interface DashboardBlockState<T> {
  data: T | null;
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
}

export interface HrDashboardSectionState {
  userName?: string;
  hr: DashboardBlockState<HrDashboardResponse>;
  statistics: DashboardBlockState<DashboardStatistics>;
  charts: DashboardBlockState<ChartsResponse>;
  recentActivities: DashboardBlockState<RecentActivityResponse[]>;
}

export interface HrDashboardSectionProps {
  state: HrDashboardSectionState;
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

/**
 * DashboardBlock — wadah presentasi per blok data dashboard HR.
 * Menangani status pending (fallback skeleton), error, dan kosong secara
 * konsisten sehingga tiap blok data independen satu sama lain.
 */
function DashboardBlock<T>({
  block,
  emptyText = 'Belum ada data untuk ditampilkan.',
  fallback,
  children,
}: {
  block: DashboardBlockState<T>;
  emptyText?: string;
  fallback: ReactNode;
  children: (data: T) => ReactNode;
}) {
  if (block.isPending) return <>{fallback}</>;
  if (block.isError) return <DashboardError message={block.errorMessage} />;
  if (!block.data) {
    return <p className="text-sm text-muted-foreground">{emptyText}</p>;
  }
  return <>{children(block.data)}</>;
}

/** Skeleton grid statistik (4 kartu) berbasis phantom-ui. */
function StatisticsSkeleton() {
  return (
    <PhantomSkeleton loading>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {PLACEHOLDER_CARDS.slice(0, 4).map((card) => (
          <Card key={`stats-${card.id}`} className="h-56">
            <CardHeader className="space-y-0.5">
              <div className="h-4 w-1/3 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {PLACEHOLDER_CARDS.slice(0, 2).map((item) => (
                <div
                  key={`stats-item-${item.id}`}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <div className="size-9 rounded-lg bg-muted" />
                  <div className="flex flex-col gap-1.5">
                    <div className="h-3 w-16 rounded bg-muted" />
                    <div className="h-4 w-10 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </PhantomSkeleton>
  );
}

/** Skeleton komposisi grafik dashboard HR berbasis phantom-ui. */
function ChartsSkeleton() {
  return (
    <PhantomSkeleton loading>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="h-64 lg:col-span-2" />
        <Card className="h-64" />
        <Card className="h-72 lg:col-span-3" />
      </div>
    </PhantomSkeleton>
  );
}

/** Skeleton daftar aktivitas terbaru berbasis phantom-ui. */
function RecentActivitySkeleton() {
  return (
    <PhantomSkeleton loading>
      <Card>
        <CardHeader className="space-y-0.5">
          <div className="h-5 w-44 rounded bg-muted" />
          <div className="h-3 w-72 rounded bg-muted" />
        </CardHeader>
        <CardContent className="flex flex-col">
          {PLACEHOLDER_CARDS.slice(0, 5).map((item) => (
            <div
              key={`activity-${item.id}`}
              className="flex items-start gap-3 border-b border-border/60 py-3 last:border-b-0 last:pb-0"
            >
              <div className="mt-0.5 size-9 rounded-full bg-muted" />
              <div className="flex flex-1 flex-col gap-1.5">
                <div className="h-3 w-1/3 rounded bg-muted" />
                <div className="h-3 w-2/3 rounded bg-muted" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </PhantomSkeleton>
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
 *
 * Dashboard disusun dari 4 blok independen — ringkasan cepat, statistik, grafik,
 * dan aktivitas terbaru. Tiap blok menangani pending/error/kosong sendiri lewat
 * DashboardBlock sehingga satu kegagalan tidak mengganggu blok lain.
 */
export function HrDashboardSection({ state, service }: HrDashboardSectionProps) {
  // service disiapkan untuk aksi masa depan (mis. buka daftar pengajuan).
  void service;

  return (
    <section className="flex flex-col gap-6">
      <DashboardHeader
        title={state.userName ? `Halo, ${state.userName}` : 'Dashboard'}
        subtitle={`Ringkasan aktivitas Anda sebagai ${DASHBOARD_ROLE_LABELS.HR_ADMIN.toLowerCase()} di SIMAD.`}
      />

      <DashboardBlock
        block={state.hr}
        fallback={
          <DashboardLoading count={5} columns="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5" />
        }
      >
        {(data) => <HrOverview data={data} />}
      </DashboardBlock>

      <DashboardBlock block={state.statistics} fallback={<StatisticsSkeleton />}>
        {(data) => <StatisticsGrid data={data} />}
      </DashboardBlock>

      <DashboardBlock block={state.charts} fallback={<ChartsSkeleton />}>
        {(data) => <HrChartsSection charts={data} />}
      </DashboardBlock>

      <DashboardBlock block={state.recentActivities} fallback={<RecentActivitySkeleton />}>
        {(data) => <RecentActivityList items={data} />}
      </DashboardBlock>
    </section>
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
      {state.data ? (
        <>
          <SupervisorOverview data={state.data} />
          <SupervisorAttendanceChart data={state.data} />
        </>
      ) : null}
    </DashboardFrame>
  );
}
