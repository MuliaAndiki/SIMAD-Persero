'use client';

import { Badge } from '@/components/atoms/badge';
import { Card } from '@/components/atoms/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/atoms/table';
import type { EvaluationItem } from '@/types/api/evaluation.types';
import { formatDate } from '@/utils/string.format';
import { Award, CheckCircle2, ClipboardCheck, Loader2, User } from 'lucide-react';

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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-4 bg-primary/5 border-primary/20">
          <div className="p-3 rounded-lg bg-primary/10 text-primary">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total Evaluasi Masuk</p>
            <h3 className="text-2xl font-bold text-foreground">{evaluations.length} Peserta</h3>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-emerald-500/5 border-emerald-500/20">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-600">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Rata-Rata Nilai Akhir</p>
            <h3 className="text-2xl font-bold text-foreground">{avgFinalScore} / 100</h3>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-blue-500/5 border-blue-500/20">
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Predikat Grade A</p>
            <h3 className="text-2xl font-bold text-foreground">{gradeCountA} Peserta</h3>
          </div>
        </Card>
      </div>

      {isPending ? (
        <Card className="p-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Memuat data rekap penilaian...</p>
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
                <TableHead className="font-semibold">Supervisor</TableHead>
                <TableHead className="font-semibold text-center">Skor Akhir</TableHead>
                <TableHead className="font-semibold text-center">Grade</TableHead>
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
