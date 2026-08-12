import { PhantomSkeleton } from '@/components/atoms/PhantomSkeleton';
import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import { StatCard } from '@/components/organisms/dashboard/StatCard';
import type { AttendanceResponse, AttendanceSummaryResponse } from '@/types/api/attendance.types';
import {
  AlertTriangle,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  Clock,
  History,
  LogIn,
  LogOut,
  MapPin,
  XCircle,
} from 'lucide-react';

/** State yang disuplai container — section murni presentasi. */
export interface AttendanceSectionState {
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  userName?: string;
  today: AttendanceResponse | null;
  summary: AttendanceSummaryResponse | null;
  history: AttendanceResponse[];
  isCheckInPending: boolean;
  isCheckOutPending: boolean;
}

/** Aksi dari container (geolokasi + mutation) — section hanya memanggil. */
export interface AttendanceSectionService {
  onCheckIn: () => void;
  onCheckOut: () => void;
}

/** Kartu placeholder skeleton — kunci statis agar tidak memakai indeks array. */
const PLACEHOLDER_STATS = Array.from({ length: 6 }, (_, i) => ({
  id: `stat-skeleton-${i}`,
}));

function attendanceStatusLabel(status: string | null): string {
  switch (status) {
    case 'PRESENT':
      return 'Hadir';
    case 'LATE':
      return 'Terlambat';
    case 'COMPLETED':
      return 'Selesai';
    case 'PENDING_REVIEW':
      return 'Menunggu Review';
    case 'INVALID':
      return 'Tidak Valid';
    case 'ABSENT':
      return 'Tidak Hadir';
    default:
      return status ?? '-';
  }
}

function attendanceStatusVariant(
  status: string | null,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'PRESENT':
    case 'COMPLETED':
      return 'default';
    case 'LATE':
    case 'PENDING_REVIEW':
      return 'secondary';
    case 'INVALID':
    case 'ABSENT':
      return 'destructive';
    default:
      return 'outline';
  }
}

function formatTime(value: string | null): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(value: string | null): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** Skeleton loading — PhantomSkeleton menimpa kartu statistik dengan shimmer. */
function AttendanceLoading() {
  return (
    <PhantomSkeleton loading>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {PLACEHOLDER_STATS.map((card) => (
          <StatCard key={card.id} icon={Clock} label="Memuat data…" value="0" tone="muted" />
        ))}
      </div>
    </PhantomSkeleton>
  );
}

/** Pesan error — tampil jika salah satu query absensi gagal. */
function AttendanceError({ message }: { message?: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
      <div className="flex flex-col gap-0.5">
        <span className="font-medium text-foreground">Gagal memuat data absensi</span>
        <span className="text-muted-foreground">
          {message || 'Terjadi kesalahan saat mengambil data. Silakan coba lagi.'}
        </span>
      </div>
    </div>
  );
}

/** Header halaman absensi. */
function AttendanceHeader({ userName }: { userName?: string }) {
  return (
    <header className="flex flex-col gap-1">
      <h1 className="text-2xl font-bold text-foreground">
        {userName ? `Halo, ${userName}` : 'Absensi'}
      </h1>
      <p className="text-sm text-muted-foreground">
        Kelola kehadiran harian Anda — check-in & check-out berbasis lokasi kantor.
      </p>
    </header>
  );
}

/** Kartu status hari ini + aksi check-in/check-out. */
function TodayCard({
  today,
  isCheckInPending,
  isCheckOutPending,
  onCheckIn,
  onCheckOut,
}: {
  today: AttendanceResponse | null;
  isCheckInPending: boolean;
  isCheckOutPending: boolean;
  onCheckIn: () => void;
  onCheckOut: () => void;
}) {
  const canCheckIn = !today || !today.checkInAt;
  const canCheckOut = Boolean(today?.checkInAt) && !today?.checkOutAt;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarCheck className="size-4 text-primary" />
          Absensi Hari Ini
        </CardTitle>
        <CardDescription>{formatDate(today?.attendanceDate ?? null)}</CardDescription>
      </CardHeader>
      <CardContent>
        {today ? (
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Check-in</span>
              <span className="flex items-center gap-2 font-medium text-foreground">
                {formatTime(today.checkInAt)}
                <Badge variant={attendanceStatusVariant(today.checkInStatus)}>
                  {attendanceStatusLabel(today.checkInStatus)}
                </Badge>
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Check-out</span>
              <span className="flex items-center gap-2 font-medium text-foreground">
                {formatTime(today.checkOutAt)}
                <Badge variant={attendanceStatusVariant(today.checkOutStatus)}>
                  {attendanceStatusLabel(today.checkOutStatus)}
                </Badge>
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={attendanceStatusVariant(today.attendanceStatus)}>
                {attendanceStatusLabel(today.attendanceStatus)}
              </Badge>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Belum ada absensi hari ini. Silakan lakukan check-in.
          </p>
        )}

        <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="size-4 shrink-0 text-primary" />
            Pastikan GPS aktif dan Anda berada di area kantor penempatan.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {canCheckIn ? (
              <Button onClick={onCheckIn} disabled={isCheckInPending}>
                <LogIn />
                {isCheckInPending ? 'Memproses…' : 'Check-in'}
              </Button>
            ) : null}
            {canCheckOut ? (
              <Button variant="secondary" onClick={onCheckOut} disabled={isCheckOutPending}>
                <LogOut />
                {isCheckOutPending ? 'Memproses…' : 'Check-out'}
              </Button>
            ) : null}
            {!canCheckIn && !canCheckOut ? (
              <p className="text-sm text-muted-foreground">
                Absensi hari ini telah selesai. Terima kasih!
              </p>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/** Ringkasan bulanan — enam kartu statistik. */
function SummaryGrid({
  summary,
}: {
  summary: AttendanceSummaryResponse | null;
}) {
  if (!summary) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <StatCard icon={CalendarCheck} label="Total Hari" value={summary.total} tone="primary" />
      <StatCard icon={CheckCircle2} label="Hadir" value={summary.present} />
      <StatCard icon={Clock} label="Terlambat" value={summary.late} />
      <StatCard
        icon={CalendarClock}
        label="Menunggu Review"
        value={summary.pendingReview}
        tone="muted"
      />
      <StatCard icon={XCircle} label="Tidak Hadir" value={summary.absent} />
      <StatCard icon={AlertTriangle} label="Tidak Valid" value={summary.invalid} />
    </div>
  );
}

/** Riwayat kehadiran terbaru (GET /attendance/me). */
function HistoryCard({ history }: { history: AttendanceResponse[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="size-4 text-primary" />
          Riwayat Kehadiran
        </CardTitle>
        <CardDescription>10 catatan absensi terbaru Anda.</CardDescription>
      </CardHeader>
      <CardContent>
        {history.length > 0 ? (
          <ul className="flex flex-col divide-y divide-border">
            {history.map((item) => (
              <li key={item.id} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {formatDate(item.attendanceDate)}
                  </span>
                  <Badge variant={attendanceStatusVariant(item.attendanceStatus)}>
                    {attendanceStatusLabel(item.attendanceStatus)}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span>Masuk: {formatTime(item.checkInAt)}</span>
                  <span>Keluar: {formatTime(item.checkOutAt)}</span>
                  {item.totalWorkMinutes != null ? (
                    <span>
                      Durasi: {Math.floor(item.totalWorkMinutes / 60)}j {item.totalWorkMinutes % 60}
                      m
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Belum ada riwayat kehadiran.</p>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * AttendanceSection — halaman absensi peserta magang (GET /attendance/*).
 * Presentasi murni; state & service disuplai container (folder (private)/attendance).
 */
export function AttendanceSection({
  state,
  service,
}: {
  state: AttendanceSectionState;
  service: AttendanceSectionService;
}) {
  const hasData = state.today !== null || state.summary !== null || state.history.length > 0;

  return (
    <section className="flex flex-col gap-6">
      <AttendanceHeader userName={state.userName} />

      {state.isPending ? <AttendanceLoading /> : null}
      {!state.isPending && state.isError ? <AttendanceError message={state.errorMessage} /> : null}
      {!state.isPending && !state.isError && hasData ? (
        <>
          <TodayCard
            today={state.today}
            isCheckInPending={state.isCheckInPending}
            isCheckOutPending={state.isCheckOutPending}
            onCheckIn={service.onCheckIn}
            onCheckOut={service.onCheckOut}
          />
          <SummaryGrid summary={state.summary} />
          <HistoryCard history={state.history} />
        </>
      ) : null}
      {!state.isPending && !state.isError && !hasData ? (
        <p className="text-sm text-muted-foreground">Belum ada data untuk ditampilkan.</p>
      ) : null}
    </section>
  );
}
