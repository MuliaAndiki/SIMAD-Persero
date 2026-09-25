'use client';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import {
  Award,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  FileCheck,
  GraduationCap,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export interface CertificateStatusTrackerProps {
  internshipStatus?: string | null;
  certificateNumber?: string | null;
  generatedAt?: string | null;
  hasEvaluation?: boolean;
  hasCertificate?: boolean;
  certificateId?: string | null;
  onDownload?: () => void;
  isDownloading?: boolean;
}

export function CertificateStatusTracker({
  internshipStatus,
  certificateNumber,
  generatedAt,
  hasEvaluation,
  hasCertificate,
  certificateId,
  onDownload,
  isDownloading,
}: CertificateStatusTrackerProps) {
  // Determine current step index (0 to 3)
  let currentStep = 0;
  if (hasCertificate || certificateNumber) {
    currentStep = 3;
  } else if (internshipStatus === 'COMPLETED' || internshipStatus === 'EVALUATED') {
    currentStep = 2;
  } else if (hasEvaluation) {
    currentStep = 2;
  } else if (internshipStatus === 'ACTIVE') {
    currentStep = 0;
  } else {
    currentStep = 0;
  }

  const steps = [
    {
      id: 'step-1',
      stepNumber: 1,
      title: 'Pelaksanaan Magang',
      desc: 'Peserta aktif presensi dan kegiatan magang',
      icon: GraduationCap,
      isDone: currentStep > 0,
      isActive: currentStep === 0,
    },
    {
      id: 'step-2',
      stepNumber: 2,
      title: 'Penilaian Pembimbing',
      desc: 'Pengisian evaluasi 6 aspek oleh supervisor',
      icon: FileCheck,
      isDone: currentStep > 1,
      isActive: currentStep === 1,
    },
    {
      id: 'step-3',
      stepNumber: 3,
      title: 'Validasi & Persetujuan HR',
      desc: 'Verifikasi nilai & approval HR Admin',
      icon: ShieldCheck,
      isDone: currentStep > 2,
      isActive: currentStep === 2,
    },
    {
      id: 'step-4',
      stepNumber: 4,
      title: 'E-Sertifikat Terbit',
      desc: 'Sertifikat resmi siap diunduh secara online',
      icon: Award,
      isDone: currentStep === 3,
      isActive: currentStep === 3,
    },
  ];

  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-card via-card to-primary/[0.03]">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="size-5 text-primary" />
              Status Penerbitan E-Sertifikat
            </CardTitle>
            <CardDescription>
              Pantau progres kelulusan dan tahapan verifikasi sertifikat digital Anda.
            </CardDescription>
          </div>

          {currentStep === 3 ? (
            <Badge className="bg-emerald-600 text-white hover:bg-emerald-700 w-fit">
              <CheckCircle2 className="mr-1 size-3.5" /> Siap Diunduh
            </Badge>
          ) : (
            <Badge variant="secondary" className="w-fit">
              <Clock className="mr-1 size-3.5" /> Tahap {currentStep + 1} dari 4
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        {/* Stepper Grid / Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative">
          {steps.map((s, index) => {
            const Icon = s.icon;
            return (
              <div
                key={s.id}
                className={`relative flex flex-col gap-2 rounded-xl border p-4 transition-all ${
                  s.isDone
                    ? 'border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-950/20'
                    : s.isActive
                      ? 'border-primary bg-primary/5 shadow-sm dark:bg-primary/10'
                      : 'border-border/60 bg-muted/20 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div
                    className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                      s.isDone
                        ? 'bg-emerald-600 text-white'
                        : s.isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {s.isDone ? <CheckCircle2 className="size-4" /> : <Icon className="size-4" />}
                  </div>
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Langkah {s.stepNumber}
                  </span>
                </div>

                <div className="flex flex-col gap-0.5 mt-1">
                  <h4 className="text-sm font-semibold leading-tight">{s.title}</h4>
                  <p className="text-xs text-muted-foreground leading-snug">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Certificate Ready Action Callout */}
        {currentStep === 3 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-emerald-600 text-white shrink-0">
                <Award className="size-5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-sm text-emerald-900 dark:text-emerald-200">
                  Nomor Sertifikat: {certificateNumber}
                </span>
                <span className="text-xs text-emerald-700 dark:text-emerald-400">
                  Diterbitkan resmi oleh PT PLN (Persero)
                  {generatedAt ? ` pada ${new Date(generatedAt).toLocaleDateString('id-ID')}` : ''}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button asChild size="sm" variant="outline" className="text-xs">
                <Link href="/intern/certificate">
                  Lihat Pratinjau <ChevronRight className="ml-1 size-3.5" />
                </Link>
              </Button>
              {onDownload && (
                <Button
                  size="sm"
                  onClick={onDownload}
                  disabled={isDownloading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
                >
                  <Download className="size-3.5" />
                  {isDownloading ? 'Mengunduh...' : 'Unduh PDF'}
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
