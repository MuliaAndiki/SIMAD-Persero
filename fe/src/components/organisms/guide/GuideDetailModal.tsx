'use client';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { GuideVideoPlayer } from '@/components/organisms/guide/GuideVideoPlayer';
import type { GuideItem } from '@/types/api/guide.types';
import { BookOpen, Calendar, Clock, Sparkles } from 'lucide-react';
import React from 'react';

interface GuideDetailModalProps {
  guide: GuideItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GuideDetailModal({ guide, open, onOpenChange }: GuideDetailModalProps) {
  if (!guide) return null;

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'ONBOARDING':
        return 'Orientasi / Onboarding';
      case 'ATTENDANCE':
        return 'Presensi & Lokasi';
      case 'LOGBOOK':
        return 'Pengisian Logbook';
      case 'FINAL_REPORT':
        return 'Laporan Akhir';
      case 'CERTIFICATE':
        return 'Sertifikat & Penilaian';
      default:
        return category;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="font-medium">
              <Sparkles className="mr-1 size-3 text-primary" />
              {getCategoryLabel(guide.category)}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="size-3" />
              Diperbarui: {new Date(guide.updatedAt).toLocaleDateString('id-ID')}
            </span>
          </div>

          <DialogTitle className="text-xl leading-snug">{guide.title}</DialogTitle>

          {guide.description && (
            <DialogDescription className="text-sm">{guide.description}</DialogDescription>
          )}
        </DialogHeader>

        <div className="flex flex-col gap-5 py-2">
          {guide.videoUrl && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Video Tutorial
              </span>
              <GuideVideoPlayer url={guide.videoUrl} title={guide.title} />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Petunjuk Langkah & Penjelasan
            </span>
            <div className="prose prose-sm dark:prose-invert max-w-none rounded-xl border bg-muted/20 p-4 text-sm leading-relaxed whitespace-pre-wrap">
              {guide.content}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
