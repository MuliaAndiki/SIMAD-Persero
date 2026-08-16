import {
  AlertTriangle,
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  Clock,
  LogIn,
  LogOut,
  MapPin,
  XCircle,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { PhantomSkeleton } from "@/components/atoms/PhantomSkeleton";
import type { AttendanceDetailResponse } from "@/types/api/attendance.types";

/** State yang disuplai container — section murni presentasi. */
export interface AttendanceDetailSectionState {
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  detail: AttendanceDetailResponse | null;
}

export interface AttendanceDetailSectionProps {
  state: AttendanceDetailSectionState;
}

function formatDate(value: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatTime(value: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMinutes(value: number | null): string {
  if (value == null) return "-";
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  if (hours <= 0) return `${minutes} menit`;
  return `${hours} jam ${minutes} menit`;
}

function attendanceStatusLabel(status: string | null): string {
  switch (status) {
    case "PRESENT":
      return "Hadir";
    case "LATE":
      return "Terlambat";
    case "COMPLETED":
      return "Selesai";
    case "PENDING_REVIEW":
      return "Menunggu Review";
    case "INVALID":
      return "Tidak Valid";
    case "ABSENT":
      return "Tidak Hadir";
    default:
      return status ?? "-";
  }
}

function attendanceStatusVariant(
  status: string | null,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "PRESENT":
    case "COMPLETED":
      return "default";
    case "LATE":
    case "PENDING_REVIEW":
      return "secondary";
    case "INVALID":
    case "ABSENT":
      return "destructive";
    default:
      return "outline";
  }
}

function formatDistance(value: number | null): string {
  if (value == null) return "-";
  return `${value.toFixed(0)} m`;
}

/** Fallback skeleton untuk Suspense di halaman detail. */
export function AttendanceDetailFallback() {
  return (
    <PhantomSkeleton loading>
      <Card>
        <CardContent className="flex flex-col gap-4 p-6">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={`detail-skeleton-${i}`}
              className="h-4 rounded bg-muted"
            />
          ))}
        </CardContent>
      </Card>
    </PhantomSkeleton>
  );
}

function DetailError({ message }: { message?: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
      <div className="flex flex-col gap-1">
        <p className="font-medium text-destructive">
          Gagal memuat detail absensi
        </p>
        <p className="text-muted-foreground">
          {message ?? "Silakan muat ulang halaman untuk mencoba lagi."}
        </p>
      </div>
    </div>
  );
}

function CheckPointCard({
  title,
  icon: Icon,
  time,
  status,
  log,
}: {
  title: string;
  icon: typeof LogIn;
  time: string | null;
  status: string | null;
  log?: {
    insideGeofence: boolean | null;
    distanceMeter: number | null;
    accuracyMeter: number | null;
  } | null;
}) {
  const valid = status !== "ABSENT" && status !== "INVALID";

  return (
    <Card>
      <CardHeader className="space-y-0.5">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon
            className={`size-4 ${valid ? "text-emerald-500" : "text-red-500"}`}
          />
          {title}
        </CardTitle>
        <CardDescription>
          {status ? (
            <Badge variant={attendanceStatusVariant(status)}>
              {attendanceStatusLabel(status)}
            </Badge>
          ) : (
            "Belum tercatat"
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 text-sm">
        <div className="flex items-center gap-2">
          <Clock className="size-4 shrink-0 text-muted-foreground" />
          <span className="text-lg font-semibold">{formatTime(time)}</span>
        </div>
        {log ? (
          <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5" />
              {log.insideGeofence
                ? "Di dalam area kantor"
                : "Di luar area kantor"}
            </span>
            <span className="flex items-center gap-1.5">
              Jarak {formatDistance(log.distanceMeter)} · Akurasi{" "}
              {formatDistance(log.accuracyMeter)}
            </span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function AttendanceDetailSection({
  state,
}: AttendanceDetailSectionProps) {
  const { detail } = state;
  const checkInLog = detail?.logs?.find((log) => log.action === "CHECK_IN");
  const checkOutLog = detail?.logs?.find((log) => log.action === "CHECK_OUT");

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            asChild
            aria-label="Kembali ke riwayat"
          >
            <Link href="/INTERN/history">
              <ArrowLeft />
            </Link>
          </Button>
          <div className="flex flex-col gap-0.5">
            <h1 className="text-2xl font-semibold tracking-tight">
              Detail Absensi
            </h1>
            <p className="text-sm text-muted-foreground">
              {detail
                ? formatDate(detail.attendanceDate)
                : "Kembali ke riwayat absensi Anda."}
            </p>
          </div>
        </div>
      </header>

      {state.isPending ? (
        <AttendanceDetailFallback />
      ) : state.isError ? (
        <DetailError message={state.errorMessage} />
      ) : !detail ? (
        <div className="flex items-start gap-3 rounded-xl border p-4 text-sm text-muted-foreground">
          Data absensi tidak ditemukan.
        </div>
      ) : (
        <>
          {/* Ringkasan */}
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <CardTitle className="flex items-center gap-2">
                  <CalendarCheck className="size-4 text-primary" />
                  Ringkasan Kehadiran
                </CardTitle>
                <CardDescription>
                  {formatDate(detail.attendanceDate)}
                </CardDescription>
              </div>
              <Badge variant={attendanceStatusVariant(detail.attendanceStatus)}>
                {attendanceStatusLabel(detail.attendanceStatus)}
              </Badge>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2">
                {detail.attendanceStatus === "ABSENT" ||
                detail.attendanceStatus === "INVALID" ? (
                  <XCircle className="size-4 text-red-500" />
                ) : (
                  <CheckCircle2 className="size-4 text-emerald-500" />
                )}
                <span>
                  Total jam kerja:{" "}
                  <span className="font-medium">
                    {formatMinutes(detail.totalWorkMinutes)}
                  </span>
                </span>
              </div>
              {detail.notes ? (
                <p className="text-xs text-muted-foreground">
                  Catatan: {detail.notes}
                </p>
              ) : null}
            </CardContent>
          </Card>

          {/* Check-in / check-out */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <CheckPointCard
              title="Check-in"
              icon={LogIn}
              time={detail.checkInAt}
              status={detail.checkInStatus}
              log={checkInLog}
            />
            <CheckPointCard
              title="Check-out"
              icon={LogOut}
              time={detail.checkOutAt}
              status={detail.checkOutStatus}
              log={checkOutLog}
            />
          </div>

          {/* Riwayat log */}
          <Card>
            <CardHeader className="space-y-0.5">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="size-4 text-primary" />
                Riwayat Absen
              </CardTitle>
              <CardDescription>
                Waktu dan lokasi tercatatnya aktivitas absen Anda.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {detail.logs && detail.logs.length > 0 ? (
                <ol className="flex flex-col gap-3">
                  {detail.logs.map((log) => (
                    <li
                      key={log.id}
                      className="flex items-start gap-3 rounded-xl border bg-muted/30 p-3 text-sm"
                    >
                      <span
                        className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full ${
                          log.action === "CHECK_IN"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {log.action === "CHECK_IN" ? (
                          <LogIn className="size-3.5" />
                        ) : (
                          <LogOut className="size-3.5" />
                        )}
                      </span>
                      <div className="flex flex-col gap-1">
                        <p className="font-medium">
                          {log.action === "CHECK_IN" ? "Check-in" : "Check-out"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(log.createdAt).toLocaleString("id-ID", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="size-3" />
                            {log.insideGeofence
                              ? "Di dalam area"
                              : "Di luar area"}{" "}
                            · {formatDistance(log.distanceMeter)}
                          </span>
                          <span>
                            Akurasi {formatDistance(log.accuracyMeter)}
                            {log.fakeGpsDetected
                              ? " · Terdeteksi GPS palsu"
                              : ""}
                          </span>
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Belum ada log absen tercatat pada hari ini.
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </section>
  );
}
