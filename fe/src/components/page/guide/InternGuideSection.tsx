'use client';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { PhantomSkeleton } from '@/components/atoms/PhantomSkeleton';
import { GuideCard } from '@/components/organisms/guide/GuideCard';
import { GuideDetailModal } from '@/components/organisms/guide/GuideDetailModal';
import type { GuideItem } from '@/types/api/guide.types';
import {
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  FileCheck,
  GraduationCap,
  HelpCircle,
  PlayCircle,
  Search,
  Sparkles,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

export interface InternGuideSectionProps {
  guides: GuideItem[];
  isLoading?: boolean;
}

const CATEGORIES = [
  { key: 'ALL', label: 'Semua Kategori', icon: BookOpen },
  { key: 'ONBOARDING', label: 'Onboarding', icon: GraduationCap },
  { key: 'ATTENDANCE', label: 'Presensi', icon: CalendarCheck },
  { key: 'LOGBOOK', label: 'Logbook', icon: FileCheck },
  { key: 'FINAL_REPORT', label: 'Laporan Akhir', icon: CheckCircle2 },
  { key: 'CERTIFICATE', label: 'Sertifikat', icon: Sparkles },
  { key: 'GENERAL', label: 'Umum', icon: HelpCircle },
];

export function InternGuideSection({ guides = [], isLoading }: InternGuideSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGuide, setSelectedGuide] = useState<GuideItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  const filteredGuides = useMemo(() => {
    return guides
      .filter((g) => g.isPublished !== false)
      .filter((g) => {
        if (selectedCategory !== 'ALL' && g.category !== selectedCategory) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = g.title.toLowerCase().includes(q);
          const matchDesc = g.description?.toLowerCase().includes(q) ?? false;
          const matchContent = g.content.toLowerCase().includes(q);
          return matchTitle || matchDesc || matchContent;
        }
        return true;
      })
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }, [guides, selectedCategory, searchQuery]);

  const handleOpenDetail = (guide: GuideItem) => {
    setSelectedGuide(guide);
    setIsDetailOpen(true);
  };

  return (
    <section className="flex flex-col gap-6">
      {/* Banner / Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border p-6 md:p-8">
        <div className="flex flex-col gap-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="px-2.5 py-0.5 text-xs font-semibold">
              <BookOpen className="mr-1.5 size-3.5 text-primary" /> Pusat Panduan & Video
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Panduan & Tutorial Magang PLN Persero
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Temukan panduan lengkap mulai dari orientasi onboarding, tata cara presensi berbasis
            lokasi, pengisian logbook harian, hingga penerbitan sertifikat akhir magang.
          </p>
        </div>

        {/* Search Input inside banner */}
        <div className="relative mt-4 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Cari topik atau kata kunci panduan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background/90 backdrop-blur"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.key;
          return (
            <Button
              key={cat.key}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.key)}
              className="flex items-center gap-1.5 shrink-0 rounded-full text-xs"
            >
              <Icon className="size-3.5" />
              {cat.label}
            </Button>
          );
        })}
      </div>

      {/* Guides Grid */}
      {isLoading ? (
        <PhantomSkeleton loading>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-44 rounded-xl bg-muted" />
            ))}
          </div>
        </PhantomSkeleton>
      ) : filteredGuides.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center">
          <BookOpen className="size-12 text-muted-foreground/40 mb-3" />
          <h3 className="text-base font-semibold">Tidak Ada Panduan Ditemukan</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            {searchQuery
              ? `Tidak ditemukan materi panduan yang cocok dengan kata kunci "${searchQuery}".`
              : 'Belum ada materi panduan yang dipublikasikan pada kategori ini.'}
          </p>
          {(searchQuery || selectedCategory !== 'ALL') && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setSelectedCategory('ALL');
                setSearchQuery('');
              }}
            >
              Reset Filter
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGuides.map((guide) => (
            <GuideCard key={guide.id} guide={guide} onSelect={handleOpenDetail} />
          ))}
        </div>
      )}

      {/* Modal Detail Panduan */}
      <GuideDetailModal
        guide={selectedGuide}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </section>
  );
}
