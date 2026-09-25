'use client';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Card } from '@/components/atoms/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/atoms/table';
import {
  EvaluationFormDialog,
} from '@/components/organisms/evaluation/EvaluationFormDialog';
import type { EvaluationItem, SaveEvaluationBody } from '@/types/api/evaluation.types';
import type { InternshipResponse } from '@/types/api/internship.types';
import { formatDate } from '@/utils/string.format';
import {
  Award,
  CheckCircle2,
  ClipboardCheck,
  Edit,
  Loader2,
  User,
  Users,
} from 'lucide-react';
import React, { useState } from 'react';

export interface EvaluationsSectionProps {
  internships: any[];
  isPending: boolean;
  onSaveDraft: (internshipId: string, body: SaveEvaluationBody) => Promise<void>;
  onSubmitFinal: (internshipId: string, body: SaveEvaluationBody) => Promise<void>;
}

export function EvaluationsSection({
  internships,
  isPending,
  onSaveDraft,
  onSubmitFinal,
}: EvaluationsSectionProps) {
  const [selectedInternship, setSelectedInternship] = useState<any | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenEvaluation = (internship: any) => {
    setSelectedInternship(internship);
    setFormOpen(true);
  };

  const handleSaveDraft = async (id: string, body: SaveEvaluationBody) => {
    setIsSaving(true);
    try {
      await onSaveDraft(id, body);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitFinal = async (id: string, body: SaveEvaluationBody) => {
    setIsSaving(true);
    try {
      await onSubmitFinal(id, body);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ClipboardCheck className="h-6 w-6 text-primary" />
          Penilaian & Evaluasi Peserta Magang
        </h1>
        <p className="text-sm text-muted-foreground">
          Berikan penilaian akhir kompetensi dan kinerja bagi peserta magang bimbingan Anda.
        </p>
      </header>

      {isPending ? (
        <Card className="p-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Memuat data peserta magang...</p>
        </Card>
      ) : internships.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center">
          <Users className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <h3 className="text-base font-semibold text-foreground">Belum Ada Peserta Bimbingan</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1">
            Anda belum memiliki peserta magang aktif yang ditugaskan untuk dinilai.
          </p>
        </Card>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Nama Peserta</TableHead>
                <TableHead className="font-semibold">Departemen & Periode</TableHead>
                <TableHead className="font-semibold text-center">Status Magang</TableHead>
                <TableHead className="font-semibold text-center">Skor Evaluasi</TableHead>
                <TableHead className="font-semibold text-center">Status Nilai</TableHead>
                <TableHead className="font-semibold text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {internships.map((internship) => {
                const evalData = internship.evaluation;
                const isFinal = evalData?.status === 'FINAL';

                return (
                  <TableRow key={internship.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {internship.internProfile?.user?.fullName?.charAt(0) ?? 'P'}
                        </div>
                        <div>
                          <span className="font-semibold text-sm text-foreground">
                            {internship.internProfile?.user?.fullName ?? '-'}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {internship.internProfile?.institution?.name ?? '-'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <span className="font-medium text-foreground">
                          {internship.department?.name ?? '-'}
                        </span>
                        <span className="text-muted-foreground">
                          {formatDate(internship.actualStartDate || internship.application?.requestedStartDate)} s/d{' '}
                          {formatDate(internship.actualEndDate || internship.application?.requestedEndDate)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-xs">
                        {internship.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {evalData?.finalScore ? (
                        <div className="flex items-center justify-center gap-1.5 font-mono font-bold">
                          <span>{evalData.finalScore}</span>
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 font-bold"
                          >
                            Grade {evalData.grade}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Belum Dinilai</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {isFinal ? (
                        <Badge variant="default" className="bg-emerald-600">
                          Final
                        </Badge>
                      ) : evalData ? (
                        <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 border-amber-300">
                          Draf
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          Belum Dibuat
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant={isFinal ? 'outline' : 'default'}
                        className="text-xs h-8 gap-1.5"
                        onClick={() => handleOpenEvaluation(internship)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                        {isFinal ? 'Lihat Nilai' : evalData ? 'Edit Draf' : 'Beri Nilai'}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Form Dialog */}
      <EvaluationFormDialog
        open={formOpen}
        internship={selectedInternship}
        existingEvaluation={selectedInternship?.evaluation ?? null}
        isSaving={isSaving}
        onClose={() => setFormOpen(false)}
        onSaveDraft={handleSaveDraft}
        onSubmitFinal={handleSubmitFinal}
      />
    </section>
  );
}
