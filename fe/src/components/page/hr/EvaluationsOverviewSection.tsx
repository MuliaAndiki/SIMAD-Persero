'use client';

import { Badge } from '@/components/atoms/badge';
import { Card } from '@/components/atoms/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/atoms/table';
import type { EvaluationItem } from '@/types/api/evaluation.types';
import { TableLoader } from '@/components/atoms/loading';
import { Award, CheckCircle2, ClipboardCheck, User } from 'lucide-react';

export interface EvaluationsOverviewSectionProps {
  evaluations: EvaluationItem[];
  isPending: boolean;
}

export function EvaluationsOverviewSection({ evaluations, isPending }: EvaluationsOverviewSectionProps) {
  const avgFinalScore =
    evaluations.length > 0
      ? (evaluations.reduce((acc, e) => acc + (e.finalScore || 0), 0) / evaluations.length).toFixed(1)
      : '0';

  const gradeCountA = evaluations.filter((e) => e.grade === 'A').length;

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ClipboardCheck className="h-6 w-6 text-primary" />
          Rekapitulasi Penilaian Peserta Magang
        </h1>
        <p className="text-sm text-muted-foreground">
          Pantau seluruh hasil penilaian dan skor evaluasi peserta magang yang diinput oleh supervisor.
        </p>
      </header>

      {/* High-Density Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="flex flex-col justify-between p-3.5 border-border/70 hover:border-border shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground">Total Evaluasi Masuk</span>
            <div className="flex size-6.5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <ClipboardCheck className="size-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
              {evaluations.length}
            </span>
            <span className="text-xs text-muted-foreground">Peserta Terdata</span>
          </div>
        </Card>

        <Card className="flex flex-col justify-between p-3.5 border-border/70 hover:border-border shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground">Rata-Rata Nilai Akhir</span>
            <div className="flex size-6.5 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Award className="size-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
                {avgFinalScore}
              </span>
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
            <Badge
              variant="outline"
              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] px-1.5 py-0"
            >
              Skor Rata-Rata
            </Badge>
          </div>
        </Card>

        <Card className="flex flex-col justify-between p-3.5 border-border/70 hover:border-border shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground">Predikat Grade A</span>
            <div className="flex size-6.5 shrink-0 items-center justify-center rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <CheckCircle2 className="size-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
              {gradeCountA}
            </span>
            <span className="text-xs text-muted-foreground">
              {evaluations.length > 0
                ? `${Math.round((gradeCountA / evaluations.length) * 100)}% dari total`
                : '0%'}
            </span>
          </div>
        </Card>
      </div>

      {isPending ? (
        <Card>
          <TableLoader label="Memuat data rekap penilaian..." />
        </Card>
      ) : evaluations.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          Belum ada data evaluasi magang yang disubmit oleh supervisor.
        </Card>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Nama Peserta</TableHead>
                <TableHead className="font-semibold">Departemen & Kantor</TableHead>
                <TableHead className="font-semibold">Mentor</TableHead>
                <TableHead className="font-semibold text-center">Nilai Akhir</TableHead>
                <TableHead className="font-semibold text-center">Nilai</TableHead>
                <TableHead className="font-semibold text-center">Status</TableHead>
                <TableHead className="font-semibold">Catatan Evaluasi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {evaluations.map((ev) => (
                <TableRow key={ev.id ?? ev.internshipId}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">
                        {ev.internship?.internProfile?.user?.fullName ?? '-'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {ev.internship?.internProfile?.institution?.name ?? ''}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs">
                      <span className="font-medium text-foreground">
                        {ev.internship?.department?.name ?? '-'}
                      </span>
                      <span className="text-muted-foreground">
                        {ev.internship?.officeLocation?.name ?? '-'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{ev.supervisor?.fullName ?? '-'}</TableCell>
                  <TableCell className="text-center font-mono font-bold text-sm">
                    {ev.finalScore}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="default"
                      className={
                        ev.grade === 'A'
                          ? 'bg-emerald-600'
                          : ev.grade === 'B'
                            ? 'bg-blue-600'
                            : 'bg-amber-600'
                      }
                    >
                      Grade {ev.grade}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={ev.status === 'FINAL' ? 'default' : 'secondary'} className="text-xs">
                      {ev.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                    {ev.comments || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}
