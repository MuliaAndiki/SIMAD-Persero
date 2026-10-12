'use client';

import {
  GUIDE_FORM_DEFAULT,
  type GuideFormField,
  GuideFormSection,
  type GuideFormState,
} from '@/components/page/guide/GuideFormSection';
import { useApi } from '@/hooks/useService/useApi';
import type { CreateGuideBody } from '@/types/api/guide.types';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function EditGuideContainer() {
  const params = useParams<{ slug: string }>();
  const slug = String(params.slug);
  const router = useRouter();
  const api = useApi();

  const detailQuery = api.guide.query.detail(slug);
  const updateMutation = api.guide.mutate.update();

  const [form, setForm] = useState<GuideFormState>(GUIDE_FORM_DEFAULT);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const guide = detailQuery.data;
    if (guide && !isInitialized) {
      setForm({
        title: guide.title,
        slug: guide.slug,
        category: guide.category,
        description: guide.description ?? '',
        videoUrl: guide.videoUrl ?? '',
        content: guide.content,
        displayOrder: guide.displayOrder ?? 0,
        isPublished: guide.isPublished ?? true,
      });
      setIsInitialized(true);
    }
  }, [detailQuery.data, isInitialized]);

  if (detailQuery.isPending || !isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Memuat data panduan...</p>
      </div>
    );
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        <AlertCircle className="size-5 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold">Panduan tidak ditemukan</h4>
          <p className="text-xs opacity-90 mt-0.5">
            {detailQuery.error?.message || 'Data panduan tidak dapat dimuat atau telah dihapus.'}
          </p>
        </div>
      </div>
    );
  }

  const guideId = detailQuery.data.id;

  const handleFieldChange = (field: GuideFormField, value: string | boolean | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleTitleChange = (value: string) => {
    setForm((prev) => ({ ...prev, title: value }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error('Judul panduan wajib diisi');
      return;
    }
    if (!form.content.trim()) {
      toast.error('Konten panduan wajib diisi');
      return;
    }

    const payload: CreateGuideBody = {
      title: form.title.trim(),
      slug: form.slug.trim() || undefined,
      category: form.category,
      description: form.description.trim() || undefined,
      videoUrl: form.videoUrl.trim() || undefined,
      content: form.content.trim(),
      displayOrder: Number(form.displayOrder) || 0,
      isPublished: form.isPublished,
    };

    try {
      const res = await updateMutation.mutateAsync({ id: guideId, body: payload });
      const updatedSlug = (res as any)?.data?.slug ?? form.slug.trim() ?? slug;
      toast.success('Panduan berhasil diperbarui');
      router.push(`/hr_admin/guides/${updatedSlug}`);
    } catch (err: any) {
      toast.error(err?.message || 'Gagal menyimpan panduan');
    }
  };

  return (
    <GuideFormSection
      mode="edit"
      form={form}
      isPending={updateMutation.isPending}
      backHref={`/hr_admin/guides/${slug}`}
      onTitleChange={handleTitleChange}
      onFieldChange={handleFieldChange}
      onSubmit={handleSubmit}
    />
  );
}
