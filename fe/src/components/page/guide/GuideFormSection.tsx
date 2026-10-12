import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
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
import { GuideVideoPlayer } from '@/components/organisms/guide/GuideVideoPlayer';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export interface GuideFormState {
  title: string;
  slug: string;
  category: string;
  description: string;
  videoUrl: string;
  content: string;
  displayOrder: number;
  isPublished: boolean;
}

export type GuideFormField = keyof GuideFormState;

export interface GuideFormSectionProps {
  mode: 'create' | 'edit';
  form: GuideFormState;
  isPending: boolean;
  backHref: string;
  onTitleChange: (value: string) => void;
  onFieldChange: (field: GuideFormField, value: string | boolean | number) => void;
  onSubmit: () => void;
}

export const GUIDE_FORM_DEFAULT: GuideFormState = {
  title: '',
  slug: '',
  category: 'ONBOARDING',
  description: '',
  videoUrl: '',
  content: '',
  displayOrder: 0,
  isPublished: true,
};

export function GuideFormSection({
  mode,
  form,
  isPending,
  backHref,
  onTitleChange,
  onFieldChange,
  onSubmit,
}: GuideFormSectionProps) {
  const isValid = form.title.trim().length > 0 && form.content.trim().length > 0;

  return (
    <section className="mx-auto flex w-full  flex-col gap-6">
      <Button asChild variant="ghost" size="sm" className="h-8 gap-1.5 self-start px-2 text-xs">
        <Link href={backHref}>
          <ArrowLeft className="size-3.5" />
          Kembali ke daftar panduan
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{mode === 'create' ? 'Tambah Panduan Baru' : 'Edit Panduan'}</CardTitle>
          <CardDescription>
            Buat atau perbarui materi panduan modul dan tutorial video untuk peserta magang.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-5"
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="guideTitle">Judul Panduan *</Label>
                <Input
                  id="guideTitle"
                  placeholder="Contoh: Tata Cara Presensi & Batas Lokasi"
                  value={form.title}
                  onChange={(e) => onTitleChange(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="guideCategory">Kategori *</Label>
                <Select value={form.category} onValueChange={(v) => onFieldChange('category', v)}>
                  <SelectTrigger id="guideCategory" className="w-full">
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ONBOARDING">Orientasi</SelectItem>
                    <SelectItem value="ATTENDANCE">Presensi</SelectItem>
                    <SelectItem value="LOGBOOK">Jurnal</SelectItem>
                    <SelectItem value="FINAL_REPORT">Laporan Akhir</SelectItem>
                    <SelectItem value="CERTIFICATE">Sertifikat</SelectItem>
                    <SelectItem value="GENERAL">Umum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="guideSlug">Slug URL (Opsional)</Label>
                <Input
                  id="guideSlug"
                  placeholder="contoh-tata-cara-presensi"
                  value={form.slug}
                  onChange={(e) => onFieldChange('slug', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="guideOrder">Urutan Tampil (Display Order)</Label>
                <Input
                  id="guideOrder"
                  type="number"
                  min="0"
                  value={form.displayOrder}
                  onChange={(e) => onFieldChange('displayOrder', Number(e.target.value))}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="guideDesc">Ringkasan / Deskripsi Singkat</Label>
              <Input
                id="guideDesc"
                placeholder="Deskripsi singkat panduan..."
                value={form.description}
                onChange={(e) => onFieldChange('description', e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="guideVideo">Tautan Video Tutorial (YouTube / MP4)</Label>
              <Input
                id="guideVideo"
                placeholder="https://www.youtube.com/watch?v=..."
                value={form.videoUrl}
                onChange={(e) => onFieldChange('videoUrl', e.target.value)}
              />
              {form.videoUrl.trim() && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Pratinjau Video</span>
                  <GuideVideoPlayer
                    url={form.videoUrl.trim()}
                    title={form.title || 'Pratinjau Video'}
                  />
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="guideContent">Konten Panduan / Petunjuk Lengkap *</Label>
              <Textarea
                id="guideContent"
                placeholder="Tulis langkah-langkah detail atau petunjuk bagi peserta magang..."
                rows={14}
                value={form.content}
                onChange={(e) => onFieldChange('content', e.target.value)}
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="isPublished"
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => onFieldChange('isPublished', e.target.checked)}
                className="size-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="isPublished" className="cursor-pointer text-sm font-normal">
                Publikasikan panduan ini ke peserta magang
              </Label>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <Button type="button" variant="outline" asChild disabled={isPending}>
                <Link href={backHref}>Batal</Link>
              </Button>
              <Button type="submit" disabled={isPending || !isValid}>
                {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                {isPending
                  ? 'Menyimpan...'
                  : mode === 'create'
                    ? 'Buat Panduan'
                    : 'Simpan Perubahan'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
