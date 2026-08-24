import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  LogIn,
  LogOut,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/atoms/tooltip";
import Link from "next/link";

import { PhantomSkeleton } from "@/components/atoms/PhantomSkeleton";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import Api from "@/services/props.service";
import type { AttendanceResponse } from "@/types/api/attendance.types";
import { useState } from "react";

/** State yang disuplai container — section murni presentasi. */
export interface HistorySectionState {
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  month: number;
  year: number;
  records: AttendanceResponse[];
  /** Periode magang (untuk menentukan hari kerja yang wajib absen). */
  internshipStart?: string | null;
  internshipEnd?: string | null;
  internshipStatus?: string | null;
}

/** Aksi navigasi bulan dari container. */
export interface HistorySectionService {
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onCurrentMonth: () => void;
}

export interface HistorySectionProps {
  state: HistorySectionState;
  service: HistorySectionService;
}

const DAY_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTH_NAME = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

/** Warna & label kartu hari: hijau masuk / merah tidak masuk / kuning belum absen. */
type DayCardKind = "present" | "absent" | "pending";

function dayCardKind(record: AttendanceResponse | undefined): DayCardKind {
  if (!record) return "pending";
  if (
    record.attendanceStatus === "ABSENT" ||
    record.checkInStatus === "ABSENT"
  ) {
    return "absent";
  }
  return "present";
}

const DAY_CARD_STYLE: Record<
  DayCardKind,
  { card: string; text: string; label: string }
> = {
  present: {
    card: "border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10",
    text: "text-emerald-600",
    label: "Masuk",
  },
  absent: {
    card: "border-red-500/40 bg-red-500/5 hover:bg-red-500/10",
    text: "text-red-600",
    label: "Tidak Masuk",
  },
  pending: {
    card: "border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10",
    text: "text-amber-600",
    label: "Belum Absen",
  },
};

function formatTime(value: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Normalisasi tanggal (ISO / Date) menjadi kunci YYYY-MM-DD. */
function dateKey(value: string | Date): string {
  if (typeof value === "string") {
    return value.slice(0, 10);
  }
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, "0");
  const d = String(value.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Apakah hari Senin–Jumat (hari kerja magang). */
function isWorkday(date: Date): boolean {
  const day = date.getDay();
  return day >= 1 && day <= 5;
}

/** Daftar hari kerja (Senin–Jumat) pada bulan yang ditampilkan. */
function buildWorkdays(
  month: number,
  year: number,
  start?: string | null,
  end?: string | null,
) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const startKey = start ? dateKey(start) : null;
  const endKey = end ? dateKey(end) : null;

  const days: { date: Date; key: string; dayNumber: number }[] = [];
  for (let d = 1; d <= daysInMonth; d += 1) {
    const date = new Date(year, month - 1, d);
    if (!isWorkday(date)) continue;
    const key = dateKey(date);
    if (startKey && key < startKey) continue;
    if (endKey && key > endKey) continue;
    days.push({ date, key, dayNumber: d });
  }
  return days;
}

function HistoryLoading() {
  return (
    <PhantomSkeleton loading>
      <Card>
        <CardContent className="flex flex-col gap-4 p-6">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={`history-skeleton-${i}`}
              className="h-16 rounded bg-muted"
            />
          ))}
        </CardContent>
      </Card>
    </PhantomSkeleton>
  );
}

function HistoryError({ message }: { message?: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
      <div className="flex flex-col gap-1">
        <p className="font-medium text-destructive">
          Gagal memuat riwayat absensi
        </p>
        <p className="text-muted-foreground">
          {message ?? "Silakan muat ulang halaman untuk mencoba lagi."}
        </p>
      </div>
    </div>
  );
}

/** Legenda warna kartu. */
function Legend({ records }: { records: AttendanceResponse[] }) {
  const counts = {
    present: records.filter(
      (r) => r.attendanceStatus !== "ABSENT" && r.checkInStatus !== "ABSENT",
    ).length,
    absent: records.filter(
      (r) => r.attendanceStatus === "ABSENT" || r.checkInStatus === "ABSENT",
    ).length,
  };

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <span className="size-2.5 rounded-full bg-emerald-500" />
        Masuk ({counts.present})
      </span>
      <span className="flex items-center gap-1.5">
        <span className="size-2.5 rounded-full bg-red-500" />
        Tidak Masuk ({counts.absent})
      </span>
      <span className="flex items-center gap-1.5">
        <span className="size-2.5 rounded-full bg-amber-500" />
        Belum Absen
      </span>
    </div>
  );
}

/** Kartu satu hari absensi — hijau/merah/kuning sesuai status. */
function DayCard({
  dayNumber,
  date,
  record,
}: {
  dayNumber: number;
  date: Date;
  record?: AttendanceResponse;
}) {
  const kind = dayCardKind(record);
  const style = DAY_CARD_STYLE[kind];
  const dayName = DAY_SHORT[date.getDay()];

  const content = (
    <div
      className={`flex h-full flex-col gap-1 rounded-xl border p-3 transition-colors ${style.card}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-lg font-semibold leading-none">{dayNumber}</span>
        <span className={`text-xs font-medium ${style.text}`}>{dayName}</span>
      </div>

      <Badge
        variant={
          kind === "absent"
            ? "destructive"
            : kind === "present"
              ? "default"
              : "outline"
        }
        className={`mt-1 ${kind === "pending" ? "border-amber-500/40 text-amber-600" : ""}`}
      >
        {style.label}
      </Badge>

      {record ? (
        <div className="mt-auto flex flex-col gap-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <LogIn className="size-3" />
            {formatTime(record.checkInAt)}
          </span>
          <span className="flex items-center gap-1">
            <LogOut className="size-3" />
            {formatTime(record.checkOutAt)}
          </span>
          <span className="mt-1 flex items-center gap-1 font-medium text-foreground/80">
            Lihat detail <ArrowRight className="size-3" />
          </span>
        </div>
      ) : (
        <div className="mt-auto flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="size-3" />
          Belum ada absensi
        </div>
      )}
    </div>
  );

  if (record) {
    return (
      <Link href={`/INTERN/history/${record.id}`} className="block h-full">
        {content}
      </Link>
    );
  }
  return <div className="h-full">{content}</div>;
}

export function HistorySection({ state, service }: HistorySectionProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await Api.Attendance.DownloadExcel({
        month: state.month,
        year: state.year,
      });
    } catch (error) {
      console.error("Failed to export:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const { month, year } = state;
  // Guard: pastikan `records` selalu array meski container mengirim wrapper
  // { data, meta } (mis. sisa cache bentuk lama).
  const records = Array.isArray(state.records) ? state.records : [];

  const recordByKey = new Map<string, AttendanceResponse>();
  for (const record of records) {
    const key = dateKey(record.attendanceDate);
    if (!recordByKey.has(key)) {
      recordByKey.set(key, record);
    }
  }

  const workdays = buildWorkdays(
    month,
    year,
    state.internshipStart,
    state.internshipEnd,
  );
  const isCurrentMonth =
    month === new Date().getMonth() + 1 && year === new Date().getFullYear();

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Riwayat Absensi
          </h1>
          <p className="text-sm text-muted-foreground">
            Rekap kehadiran harian magang Anda. Hijau berarti masuk, merah tidak
            masuk, kuning belum melakukan absen.
          </p>
        </header>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="inline-block">
                <Button
                  variant="outline"
                  onClick={handleExport}
                  disabled={
                    isExporting || state.internshipStatus !== "COMPLETED"
                  }
                >
                  <Download className="mr-2 size-4" />
                  {isExporting ? "Mengekspor..." : "Export Excel"}
                </Button>
              </div>
            </TooltipTrigger>
            {state.internshipStatus !== "COMPLETED" && (
              <TooltipContent>
                <p>
                  Export data hanya bisa dilakukan ketika status magang telah
                  selesai (COMPLETED).
                </p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>

      {state.isPending ? (
        <HistoryLoading />
      ) : state.isError ? (
        <HistoryError message={state.errorMessage} />
      ) : (
        <Card>
          <CardHeader className="flex flex-col gap-3">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="size-4 text-primary" />
              {MONTH_NAME[month - 1]} {year}
            </CardTitle>
            <CardDescription>
              Klik kartu berwarna hijau/merah untuk melihat detail absen harian.
            </CardDescription>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Legend records={records} />
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={service.onPrevMonth}
                  aria-label="Bulan sebelumnya"
                >
                  <ChevronLeft />
                </Button>
                {!isCurrentMonth ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={service.onCurrentMonth}
                  >
                    Bulan Ini
                  </Button>
                ) : null}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={service.onNextMonth}
                  aria-label="Bulan berikutnya"
                >
                  <ChevronRight />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {workdays.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Tidak ada hari kerja pada bulan ini dalam periode magang Anda.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7">
                {workdays.map((day) => (
                  <DayCard
                    key={day.key}
                    dayNumber={day.dayNumber}
                    date={day.date}
                    record={recordByKey.get(day.key)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </section>
  );
}
