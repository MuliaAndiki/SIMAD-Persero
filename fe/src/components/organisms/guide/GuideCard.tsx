'use client';

import { Badge } from '@/components/atoms/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import type { GuideItem } from '@/types/api/guide.types';
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  FileCheck,
  GraduationCap,
  PlayCircle,
  Video,
} from 'lucide-react';
import React from 'react';

interface GuideCardProps {
  guide: GuideItem;
  onSelect: (guide: GuideItem) => void;
}

export function GuideCard({ guide, onSelect }: GuideCardProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ONBOARDING':
        return <GraduationCap className="size-4 text-emerald-500" />;
      case 'ATTENDANCE':
        return <CalendarCheck className="size-4 text-blue-500" />;
      case 'LOGBOOK':
        return <FileCheck className="size-4 text-amber-500" />;
      case 'FINAL_REPORT':
        return <CheckCircle2 className="size-4 text-indigo-500" />;
      default:
        return <BookOpen className="size-4 text-primary" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'ONBOARDING':
        return 'Onboarding';
      case 'ATTENDANCE':
        return 'Presensi';
      case 'LOGBOOK':
        return 'Logbook';
      case 'FINAL_REPORT':
        return 'Laporan Akhir';
      case 'CERTIFICATE':
        return 'Sertifikat';
      default:
        return category;
    }
  };

  return (
    <Card
      className="group flex flex-col justify-between overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md cursor-pointer"
      onClick={() => onSelect(guide)}
    >
      <CardHeader className="p-5 pb-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            {getCategoryIcon(guide.category)}
            <span className="text-xs font-medium text-muted-foreground">
              {getCategoryLabel(guide.category)}
            </span>
          </div>

          {guide.videoUrl && (
            <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20 text-[11px] gap-1 px-1.5 py-0">
              <PlayCircle className="size-3" /> Video
            </Badge>
          )}
        </div>

        <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors line-clamp-2">
          {guide.title}
        </CardTitle>

        {guide.description && (
          <CardDescription className="text-xs line-clamp-2 mt-1">
            {guide.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="p-5 pt-0">
        <div className="flex items-center justify-between text-xs font-medium text-primary mt-3 pt-3 border-t border-border/50">
          <span>Baca Panduan</span>
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
        </div>
      </CardContent>
    </Card>
  );
}
