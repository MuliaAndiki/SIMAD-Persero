"use client";

import { PhantomSkeleton } from "@/components/atoms/PhantomSkeleton";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { ApplicationStatusBadge } from "@/components/organisms/application/ApplicationStatusBadge";
import type { ApplicationResponse } from "@/types/api/application.types";
import { formatDate } from "@/utils/string.format";
import {
  AlertCircle,
  ArrowLeft,
  CalendarClock,
  FileText,
  User,
} from "lucide-react";
import Link from "next/link";

export interface ApplicationDetailSectionState {
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  application?: ApplicationResponse;
}

export interface ApplicationDetailSectionProps {
  state: ApplicationDetailSectionState;
}

/**
 * Detail pengajuan magang — halaman dynamic route `[id]`.
 * Presentasional murni: data berasal dari container (orchestration layer).
 */
export function ApplicationDetailSection({
  state,
}: ApplicationDetailSectionProps) {
  if (state.isPending) {
    return (
      <PhantomSkeleton loading>
        <div className="flex flex-col gap-6">
          <Card className="h-12 w-48" />
          <Card className="h-72" />
        </div>
      </PhantomSkeleton>
    );
  }

  if (state.isError || !state.application) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
        <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
        <div className="flex flex-col gap-1 text-destructive">
          <p className="font-semibold">Gagal memuat detail pengajuan</p>
          <p className="opacity-90">
            {state.errorMessage ?? "Pengajuan tidak ditemukan."}
          </p>
        </div>
      </div>
    );
  }

  const app = state.application;
  const intern = app.internProfile;

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="w-fit gap-1.5 px-0 text-muted-foreground"
        >
          <Link href="/INTERN/application">
            <ArrowLeft className="size-4" />
            Kembali ke Pengajuan
          </Link>
        </Button>
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">
              {app.applicationNumber ?? "Draft"}
            </h1>
            <ApplicationStatusBadge status={app.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            Detail pengajuan magang Anda di PLN Persero.
          </p>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Pengajuan</CardTitle>
          <CardDescription>
            Detail permohonan magang yang diajukan.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <CalendarClock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">
                  Periode Magang
                </span>
                <span className="text-sm font-medium">
                  {formatDate(app.requestedStartDate)} —{" "}
                  {formatDate(app.requestedEndDate)}
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">
                  Surat Pengantar
                </span>
                <span className="text-sm font-medium">
                  {app.introductionLetterFile?.originalName ?? "Belum diunggah"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-muted-foreground">Motivasi</span>
            <p className="text-sm leading-relaxed text-foreground">
              {app.motivation || "—"}
            </p>
          </div>

          {intern && (
            <>
              <hr className="border-border/60" />
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-muted-foreground">
                  Data Pemohon
                </span>
                <div className="grid gap-3 text-sm md:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <User className="size-4 text-muted-foreground" />
                    <span className="font-medium">{intern.user.fullName}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {intern.studentNumber}
                  </span>
                  <span className="text-muted-foreground">
                    {intern.institution?.name ?? "—"}
                  </span>
                  <span className="text-muted-foreground">
                    {intern.major?.name ?? "—"}
                  </span>
                </div>
              </div>
            </>
          )}

          {app.reviewedBy && (
            <>
              <hr className="border-border/60" />
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-muted-foreground">
                  Direview Oleh
                </span>
                <span className="text-sm font-medium">
                  {app.reviewedBy.fullName}
                </span>
              </div>
            </>
          )}

          {app.rejectionReason && (
            <>
              <hr className="border-border/60" />
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-muted-foreground">
                  Alasan Penolakan
                </span>
                <p className="text-sm text-destructive">
                  {app.rejectionReason}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
