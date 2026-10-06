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
      desc: 'Verifikasi nilai & persetujuan Admin HR',
      icon: ShieldCheck,
      isDone: currentStep > 2,
      isActive: currentStep === 2,
    },
    {
      id: 'step-4',
      stepNumber: 4,
      title: 'Sertifikat Elektronik Terbit',
      desc: 'Sertifikat resmi siap diunduh secara online',
      icon: Award,
      isDone: currentStep === 3,
      isActive: currentStep === 3,
    },
  ];

  return (
    <Card className="overflow-hidden border-border/70 p-4 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Tahapan Penerbitan Sertifikat Elektronik
            </h3>
            <p className="text-xs text-muted-foreground">
              Progres penilaian pembimbing hingga pengesahan sertifikat digital resmi.
            </p>
          </div>
        </div>

        {currentStep === 3 ? (
          <Badge className="bg-emerald-600 text-white hover:bg-emerald-700 w-fit text-xs">
            <CheckCircle2 className="mr-1 size-3" /> Siap Diunduh
          </Badge>
        ) : (
          <Badge variant="secondary" className="w-fit text-xs">
            <Clock className="mr-1 size-3" /> Tahap {currentStep + 1} dari 4
          </Badge>
        )}
      </div>

      <div className="flex flex-col gap-4 pt-3">
        {/* High-Density Stepper Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.id}
                className={`relative flex flex-col gap-1.5 rounded-lg border p-3 transition-colors ${
                  s.isDone
                    ? 'border-emerald-500/40 bg-emerald-500/5'
                    : s.isActive
                      ? 'border-primary/50 bg-primary/5'
                      : 'border-border/60 bg-muted/20 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex size-6 shrink-0 items-center justify-center rounded-md ${
                        s.isDone
                          ? 'bg-emerald-600 text-white'
                          : s.isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {s.isDone ? <CheckCircle2 className="size-3.5" /> : <Icon className="size-3.5" />}
                    </div>
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Langkah {s.stepNumber}
                    </span>
                  </div>

                  {s.isDone ? (
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      Selesai
                    </span>
                  ) : s.isActive ? (
                    <span className="text-[10px] font-semibold text-primary">
                      Sedang Berjalan
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-col gap-0.5 mt-0.5">
                  <h4 className="text-xs font-semibold leading-tight text-foreground">{s.title}</h4>
                  <p className="text-[11px] text-muted-foreground leading-tight">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Certificate Ready Action Callout */}
        {currentStep === 3 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-md bg-emerald-600 text-white shrink-0">
                <Award className="size-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-xs text-emerald-950 dark:text-emerald-100">
                  Nomor Sertifikat: {certificateNumber}
                </span>
                <span className="text-[11px] text-emerald-800 dark:text-emerald-300">
                  Diterbitkan resmi oleh PT PLN (Persero)
                  {generatedAt ? ` pada ${new Date(generatedAt).toLocaleDateString('id-ID')}` : ''}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button asChild size="sm" variant="outline" className="h-8 text-xs">
                <Link href="/intern/certificate">
                  Lihat Pratinjau <ChevronRight className="ml-1 size-3" />
                </Link>
              </Button>
              {onDownload && (
                <Button
                  size="sm"
                  onClick={onDownload}
                  disabled={isDownloading}
                  className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
                >
                  <Download className="size-3.5" />
                  {isDownloading ? 'Mengunduh...' : 'Unduh PDF'}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
