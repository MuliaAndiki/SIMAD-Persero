'use client';

import {
  GUIDE_FORM_DEFAULT,
  type GuideFormField,
  GuideFormSection,
} from '@/components/page/guide/GuideFormSection';
import { useApi } from '@/hooks/useService/useApi';
import type { CreateGuideBody } from '@/types/api/guide.types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

export default function CreateGuideContainer() {
  const router = useRouter();
  const api = useApi();
  const createMutation = api.guide.mutate.create();

  const [form, setForm] = useState(GUIDE_FORM_DEFAULT);

  const handleFieldChange = (field: GuideFormField, value: string | boolean | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleTitleChange = (value: string) => {
    setForm((prev) => ({ ...prev, title: value, slug: slugify(value) }));
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
      await createMutation.mutateAsync(payload);
      toast.success('Panduan baru berhasil dibuat');
      router.push('/hr_admin/guides');
    } catch (err: any) {
      toast.error(err?.message || 'Gagal menyimpan panduan');
    }
  };

  return (
    <GuideFormSection
      mode="create"
      form={form}
      isPending={createMutation.isPending}
      backHref="/hr_admin/guides"
      onTitleChange={handleTitleChange}
      onFieldChange={handleFieldChange}
      onSubmit={handleSubmit}
    />
  );
}
