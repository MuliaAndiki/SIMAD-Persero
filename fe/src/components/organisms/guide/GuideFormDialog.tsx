'use client';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select';
import { Textarea } from '@/components/atoms/textarea';
import { useApi } from '@/hooks/useService/useApi';
import type { CreateGuideBody, GuideItem } from '@/types/api/guide.types';
import { Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface GuideFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guide?: GuideItem | null;
  onSuccess?: () => void;
}

export function GuideFormDialog({
  open,
  onOpenChange,
  guide,
  onSuccess,
}: GuideFormDialogProps) {
  const api = useApi();
  const createMutation = api.guide.mutate.create();
  const updateMutation = api.guide.mutate.update();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('ONBOARDING');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [content, setContent] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [isPublished, setIsPublished] = useState<boolean>(true);

  useEffect(() => {
    if (guide) {
      setTitle(guide.title);
      setSlug(guide.slug);
      setCategory(guide.category);
      setDescription(guide.description ?? '');
      setVideoUrl(guide.videoUrl ?? '');
      setContent(guide.content);
      setDisplayOrder(guide.displayOrder ?? 0);
      setIsPublished(guide.isPublished ?? true);
    } else {
      setTitle('');
      setSlug('');
      setCategory('ONBOARDING');
      setDescription('');
      setVideoUrl('');
      setContent('');
      setDisplayOrder(0);
      setIsPublished(true);
    }
  }, [guide, open]);

  // Auto-generate slug from title if empty or creating
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!guide) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-'),
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Judul panduan wajib diisi');
      return;
    }
    if (!content.trim()) {
      toast.error('Konten panduan wajib diisi');
      return;
    }

    const payload: CreateGuideBody = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      category,
      description: description.trim() || undefined,
      videoUrl: videoUrl.trim() || undefined,
      content: content.trim(),
      displayOrder: Number(displayOrder) || 0,
      isPublished,
    };

    try {
      if (guide) {
        await updateMutation.mutateAsync({ id: guide.id, body: payload });
        toast.success('Panduan berhasil diperbarui');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Panduan baru berhasil dibuat');
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.message || 'Gagal menyimpan panduan');
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{guide ? 'Edit Panduan' : 'Tambah Panduan Baru'}</DialogTitle>
            <DialogDescription>
              Buat atau perbarui materi panduan modul dan tutorial video untuk peserta magang.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="guideTitle">Judul Panduan *</Label>
                <Input
                  id="guideTitle"
                  placeholder="Contoh: Tata Cara Presensi & Geofence"
                  value={title}
                  onChange={handleTitleChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="guideCategory">Kategori *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="guideCategory">
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ONBOARDING">Onboarding</SelectItem>
                    <SelectItem value="ATTENDANCE">Presensi</SelectItem>
                    <SelectItem value="LOGBOOK">Logbook</SelectItem>
                    <SelectItem value="FINAL_REPORT">Laporan Akhir</SelectItem>
                    <SelectItem value="CERTIFICATE">Sertifikat</SelectItem>
                    <SelectItem value="GENERAL">Umum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="guideSlug">Slug URL (Opsional)</Label>
                <Input
                  id="guideSlug"
                  placeholder="contoh-tata-cara-presensi"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="guideOrder">Urutan Tampil (Display Order)</Label>
                <Input
                  id="guideOrder"
                  type="number"
                  min="0"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="guideDesc">Ringkasan / Deskripsi Singkat</Label>
              <Input
                id="guideDesc"
                placeholder="Deskripsi singkat panduan..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="guideVideo">Link Video Tutorial (YouTube / MP4)</Label>
              <Input
                id="guideVideo"
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="guideContent">Konten Panduan / Petunjuk Lengkap *</Label>
              <Textarea
                id="guideContent"
                placeholder="Tulis langkah-langkah detail atau petunjuk bagi intern..."
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                id="isPublished"
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="size-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="isPublished" className="text-sm font-normal cursor-pointer">
                Publikasikan panduan ini ke peserta magang (Published)
              </Label>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isPending || !title.trim() || !content.trim()}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Menyimpan...
                </>
              ) : guide ? (
                'Simpan Perubahan'
              ) : (
                'Buat Panduan'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
