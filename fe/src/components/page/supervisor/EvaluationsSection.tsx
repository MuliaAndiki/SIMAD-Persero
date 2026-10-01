'use client';

import { Badge } from '@/components/atoms/badge';
import { Card } from '@/components/atoms/card';
import { TableLoader } from '@/components/atoms/loading';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/atoms/table';
import { EvaluationFormDialog } from '@/components/organisms/evaluation/EvaluationFormDialog';
import { RowActionsMenu } from '@/components/organisms/table/RowActionsMenu';
import { StatusBadge } from '@/components/organisms/table/StatusBadge';
import { TableEmptyState } from '@/components/organisms/table/TableEmptyState';
import type { EvaluationItem, SaveEvaluationBody } from '@/types/api/evaluation.types';
import type { InternshipResponse } from '@/types/api/internship.types';
import { formatDate } from '@/utils/string.format';
import { Award, CheckCircle2, ClipboardCheck, Edit, Eye, User, Users } from 'lucide-react';
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
        <Card>
          <TableLoader label="Memuat data peserta magang..." />
        </Card>
      ) : internships.length === 0 ? (
        <Card>
          <TableEmptyState
            icon={Users}
            title="Belum Ada Peserta Bimbingan"
            message="Anda belum memiliki peserta magang aktif yang ditugaskan untuk dinilai."
          />
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
                          {formatDate(
                            internship.actualStartDate ||
                              internship.application?.requestedStartDate,
                          )}{' '}
                          s/d{' '}
                          {formatDate(
                            internship.actualEndDate || internship.application?.requestedEndDate,
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusBadge status={internship.status} />
                    </TableCell>
                    <TableCell className="text-center">
                      {evalData?.finalScore ? (
                        <div className="flex items-center justify-center gap-1.5 font-mono font-bold">
                          <span>{evalData.finalScore}</span>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-bold">
                            Grade {evalData.grade}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Belum Dinilai</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {evalData || isFinal ? (
                        <StatusBadge status={isFinal ? 'FINAL' : 'DRAFT'} />
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          Belum Dibuat
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <RowActionsMenu
                        items={[
                          {
                            key: 'evaluate',
                            label: isFinal ? 'Lihat Nilai' : evalData ? 'Edit Draf' : 'Beri Nilai',
                            icon: isFinal ? Eye : Edit,
                            onSelect: () => handleOpenEvaluation(internship),
                          },
                        ]}
                      />
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
