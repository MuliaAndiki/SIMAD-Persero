'use client';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select';
import { GuideDetailModal } from '@/components/organisms/guide/GuideDetailModal';
import { GuideFormDialog } from '@/components/organisms/guide/GuideFormDialog';
import type { GuideItem } from '@/types/api/guide.types';
import {
  AlertCircle,
  BookOpen,
  Edit2,
  Eye,
  Loader2,
  PlayCircle,
  Plus,
  Trash2,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

export interface GuidesManagementSectionProps {
  guides: GuideItem[];
  isLoading: boolean;
  onDelete: (id: string) => Promise<void>;
  onRefresh?: () => void;
}

export function GuidesManagementSection({
  guides = [],
  isLoading,
  onDelete,
  onRefresh,
}: GuidesManagementSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingGuide, setEditingGuide] = useState<GuideItem | null>(null);
  const [previewGuide, setPreviewGuide] = useState<GuideItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredGuides = useMemo(() => {
    return guides
      .filter((g) => {
        if (selectedCategory !== 'ALL' && g.category !== selectedCategory) {
          return false;
        }
        if (selectedStatus === 'PUBLISHED' && !g.isPublished) {
          return false;
        }
        if (selectedStatus === 'DRAFT' && g.isPublished) {
          return false;
        }
        return true;
      })
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }, [guides, selectedCategory, selectedStatus]);

  const handleOpenCreate = () => {
    setEditingGuide(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (guide: GuideItem) => {
    setEditingGuide(guide);
    setIsFormOpen(true);
  };

  const handleOpenPreview = (guide: GuideItem) => {
    setPreviewGuide(guide);
    setIsPreviewOpen(true);
  };

  const handleDelete = async (guide: GuideItem) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus panduan "${guide.title}"?`)) {
      return;
    }
    try {
      setDeletingId(guide.id);
      await onDelete(guide.id);
    } finally {
      setDeletingId(null);
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'ONBOARDING':
        return <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Onboarding</Badge>;
      case 'ATTENDANCE':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">Presensi</Badge>;
      case 'LOGBOOK':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">Logbook</Badge>;
      case 'FINAL_REPORT':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">Laporan Akhir</Badge>;
      case 'CERTIFICATE':
        return <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">Sertifikat</Badge>;
      default:
        return <Badge variant="outline">{category}</Badge>;
    }
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manajemen Panduan & Video Tutorial</h1>
          <p className="text-sm text-muted-foreground">
            Kelola konten petunjuk operasional, orientasi onboarding, dan video tutorial untuk peserta magang.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="flex items-center gap-1.5 self-start sm:self-auto">
          <Plus className="size-4" />
          Tambah Panduan
        </Button>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Kategori:</span>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px] h-9 text-xs">
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Kategori</SelectItem>
                <SelectItem value="ONBOARDING">Onboarding</SelectItem>
                <SelectItem value="ATTENDANCE">Presensi</SelectItem>
                <SelectItem value="LOGBOOK">Logbook</SelectItem>
                <SelectItem value="FINAL_REPORT">Laporan Akhir</SelectItem>
                <SelectItem value="CERTIFICATE">Sertifikat</SelectItem>
                <SelectItem value="GENERAL">Umum</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Status:</span>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[150px] h-9 text-xs">
                <SelectValue placeholder="Pilih Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Status</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="size-4 text-primary" />
            Daftar Materi Panduan ({filteredGuides.length})
          </CardTitle>
          <CardDescription>
            Urutan tampilan materi disesuaikan dengan nomor urut display order.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-12 text-muted-foreground">
              <Loader2 className="mr-2 size-5 animate-spin text-primary" /> Memuat data panduan...
            </div>
          ) : filteredGuides.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <AlertCircle className="size-8 mb-2 opacity-50" />
              <p className="font-medium">Tidak ada panduan yang ditemukan.</p>
              <p className="text-xs mt-1">Klik tombol Tambah Panduan untuk membuat materi baru.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground border-y">
                  <tr>
                    <th className="px-4 py-3 w-12 text-center">Urutan</th>
                    <th className="px-4 py-3">Judul Panduan</th>
                    <th className="px-4 py-3">Kategori</th>
                    <th className="px-4 py-3 text-center">Video</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3">Diperbarui</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredGuides.map((guide) => (
                    <tr key={guide.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-center font-semibold text-muted-foreground">
                        {guide.displayOrder ?? 0}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{guide.title}</div>
                        {guide.description && (
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {guide.description}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">{getCategoryBadge(guide.category)}</td>
                      <td className="px-4 py-3 text-center">
                        {guide.videoUrl ? (
                          <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20 text-xs gap-1">
                            <PlayCircle className="size-3" /> Ada Video
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {guide.isPublished ? (
                          <Badge variant="default" className="bg-emerald-600 text-xs">
                            Published
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Draft
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(guide.updatedAt).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-foreground"
                            onClick={() => handleOpenPreview(guide)}
                            title="Preview Panduan"
                          >
                            <Eye className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-foreground"
                            onClick={() => handleOpenEdit(guide)}
                            title="Edit Panduan"
                          >
                            <Edit2 className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(guide)}
                            disabled={deletingId === guide.id}
                            title="Hapus Panduan"
                          >
                            {deletingId === guide.id ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <Trash2 className="size-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Form */}
      <GuideFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        guide={editingGuide}
        onSuccess={onRefresh}
      />

      {/* Modal Preview */}
      <GuideDetailModal
        guide={previewGuide}
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
      />
    </section>
  );
}
