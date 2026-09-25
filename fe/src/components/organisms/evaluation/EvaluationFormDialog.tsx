'use client';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { Textarea } from '@/components/atoms/textarea';
import type { EvaluationItem, SaveEvaluationBody } from '@/types/api/evaluation.types';
import type { InternshipResponse } from '@/types/api/internship.types';
import { Award, CheckCircle2, ClipboardCheck, Info, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export interface EvaluationFormDialogProps {
  open: boolean;
  internship: InternshipResponse | any | null;
  existingEvaluation: EvaluationItem | null;
  isSaving: boolean;
  onClose: () => void;
  onSaveDraft: (internshipId: string, body: SaveEvaluationBody) => Promise<void>;
  onSubmitFinal: (internshipId: string, body: SaveEvaluationBody) => Promise<void>;
}

export function EvaluationFormDialog({
  open,
  internship,
  existingEvaluation,
  isSaving,
  onClose,
  onSaveDraft,
  onSubmitFinal,
}: EvaluationFormDialogProps) {
  const [disciplineScore, setDisciplineScore] = useState(80);
  const [responsibilityScore, setResponsibilityScore] = useState(80);
  const [teamworkScore, setTeamworkScore] = useState(80);
  const [communicationScore, setCommunicationScore] = useState(80);
  const [technicalScore, setTechnicalScore] = useState(80);
  const [initiativeScore, setInitiativeScore] = useState(80);
  const [comments, setComments] = useState('');

  useEffect(() => {
    if (existingEvaluation) {
      setDisciplineScore(existingEvaluation.disciplineScore || 80);
      setResponsibilityScore(existingEvaluation.responsibilityScore || 80);
      setTeamworkScore(existingEvaluation.teamworkScore || 80);
      setCommunicationScore(existingEvaluation.communicationScore || 80);
      setTechnicalScore(existingEvaluation.technicalScore || 80);
      setInitiativeScore(existingEvaluation.initiativeScore || 80);
      setComments(existingEvaluation.comments ?? '');
    } else {
      setDisciplineScore(80);
      setResponsibilityScore(80);
      setTeamworkScore(80);
      setCommunicationScore(80);
      setTechnicalScore(80);
      setInitiativeScore(80);
      setComments('');
    }
  }, [existingEvaluation]);

  const finalScore = Number(
    (
      (disciplineScore +
        responsibilityScore +
        teamworkScore +
        communicationScore +
        technicalScore +
        initiativeScore) /
      6
    ).toFixed(1),
  );

  let grade = 'E';
  if (finalScore >= 85) grade = 'A';
  else if (finalScore >= 75) grade = 'B';
  else if (finalScore >= 65) grade = 'C';
  else if (finalScore >= 50) grade = 'D';

  const isFinal = existingEvaluation?.status === 'FINAL';

  const handleSaveDraft = async () => {
    if (!internship) return;
    await onSaveDraft(internship.id, {
      disciplineScore,
      responsibilityScore,
      teamworkScore,
      communicationScore,
      technicalScore,
      initiativeScore,
      comments: comments || undefined,
    });
    onClose();
  };

  const handleSubmitFinal = async () => {
    if (!internship) return;
    await onSubmitFinal(internship.id, {
      disciplineScore,
      responsibilityScore,
      teamworkScore,
      communicationScore,
      technicalScore,
      initiativeScore,
      comments: comments || undefined,
    });
    onClose();
  };

  const internName =
    internship?.internProfile?.user?.fullName ?? internship?.user?.fullName ?? 'Peserta Magang';

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Penilaian Evaluasi Magang Peserta
          </DialogTitle>
          <DialogDescription>
            Beri penilaian pada 6 aspek kompetensi dan perilaku kerja peserta magang selama program.
          </DialogDescription>
        </DialogHeader>

        {/* Info Peserta */}
        <div className="rounded-lg border bg-muted/30 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <User className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-foreground">{internName}</h4>
              <p className="text-xs text-muted-foreground">
                {internship?.department?.name ?? '-'} • {internship?.officeLocation?.name ?? '-'}
              </p>
            </div>
          </div>
          {isFinal && (
            <Badge variant="default" className="bg-emerald-600">
              Nilai Final
            </Badge>
          )}
        </div>

        {/* Form Aspek Nilai */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="discipline" className="text-xs font-medium flex items-center justify-between">
              <span>1. Kedisiplinan & Kehadiran (0-100)</span>
              <span className="font-mono font-bold text-primary">{disciplineScore}</span>
            </Label>
            <Input
              id="discipline"
              type="number"
              min="0"
              max="100"
              value={disciplineScore}
              onChange={(e) => setDisciplineScore(Number(e.target.value))}
              disabled={isFinal || isSaving}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="responsibility" className="text-xs font-medium flex items-center justify-between">
              <span>2. Tanggung Jawab & Integritas (0-100)</span>
              <span className="font-mono font-bold text-primary">{responsibilityScore}</span>
            </Label>
            <Input
              id="responsibility"
              type="number"
              min="0"
              max="100"
              value={responsibilityScore}
              onChange={(e) => setResponsibilityScore(Number(e.target.value))}
              disabled={isFinal || isSaving}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="teamwork" className="text-xs font-medium flex items-center justify-between">
              <span>3. Kerjasama & Hubungan Tim (0-100)</span>
              <span className="font-mono font-bold text-primary">{teamworkScore}</span>
            </Label>
            <Input
              id="teamwork"
              type="number"
              min="0"
              max="100"
              value={teamworkScore}
              onChange={(e) => setTeamworkScore(Number(e.target.value))}
              disabled={isFinal || isSaving}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="communication" className="text-xs font-medium flex items-center justify-between">
              <span>4. Komunikasi & Etika (0-100)</span>
              <span className="font-mono font-bold text-primary">{communicationScore}</span>
            </Label>
            <Input
              id="communication"
              type="number"
              min="0"
              max="100"
              value={communicationScore}
              onChange={(e) => setCommunicationScore(Number(e.target.value))}
              disabled={isFinal || isSaving}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="technical" className="text-xs font-medium flex items-center justify-between">
              <span>5. Kemampuan Teknis / Skill (0-100)</span>
              <span className="font-mono font-bold text-primary">{technicalScore}</span>
            </Label>
            <Input
              id="technical"
              type="number"
              min="0"
              max="100"
              value={technicalScore}
              onChange={(e) => setTechnicalScore(Number(e.target.value))}
              disabled={isFinal || isSaving}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="initiative" className="text-xs font-medium flex items-center justify-between">
              <span>6. Inisiatif & Keaktifan (0-100)</span>
              <span className="font-mono font-bold text-primary">{initiativeScore}</span>
            </Label>
            <Input
              id="initiative"
              type="number"
              min="0"
              max="100"
              value={initiativeScore}
              onChange={(e) => setInitiativeScore(Number(e.target.value))}
              disabled={isFinal || isSaving}
            />
          </div>
        </div>

        {/* Skor Akhir & Grade Live Preview */}
        <div className="p-3.5 rounded-xl border bg-primary/5 border-primary/20 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-muted-foreground">Rata-Rata Nilai Akhir</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-2xl font-extrabold font-mono text-primary">{finalScore}</span>
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-medium text-muted-foreground">Huruf Mutu</span>
            <div className="mt-0.5">
              <Badge
                variant="default"
                className={`text-sm px-3 py-1 font-bold ${
                  grade === 'A'
                    ? 'bg-emerald-600'
                    : grade === 'B'
                      ? 'bg-blue-600'
                      : grade === 'C'
                        ? 'bg-amber-600'
                        : 'bg-rose-600'
                }`}
              >
                Grade {grade}
              </Badge>
            </div>
          </div>
        </div>

        {/* Catatan Supervisor */}
        <div className="grid gap-1.5">
          <Label htmlFor="comments" className="text-xs font-medium">
            Catatan / Masukan Supervisor untuk Peserta
          </Label>
          <Textarea
            id="comments"
            rows={2}
            placeholder="Tuliskan apresiasi, saran pengembangan kompetensi, atau evaluasi kualitatif..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            disabled={isFinal || isSaving}
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0 mt-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Tutup
          </Button>
          {!isFinal && (
            <>
              <Button variant="secondary" onClick={handleSaveDraft} disabled={isSaving}>
                {isSaving ? 'Menyimpan...' : 'Simpan Draf'}
              </Button>
              <Button onClick={handleSubmitFinal} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <CheckCircle2 className="mr-1.5 h-4 w-4" />
                {isSaving ? 'Memproses...' : 'Finalisasi Nilai'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
