'use client';

import { GuideDetailSection } from '@/components/page/guide/GuideDetailSection';
import { useAppNameSpace } from '@/hooks/useAppNameSpace';
import { useApi } from '@/hooks/useService/useApi';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function HRGuideDetailContainer() {
  const params = useParams<{ slug: string }>();
  const slug = String(params.slug);
  const router = useRouter();
  const api = useApi();
  const ns = useAppNameSpace();

  const detailQuery = api.guide.query.detail(slug);
  const deleteMutation = api.guide.mutate.delete();

  const handleDelete = async () => {
    if (!detailQuery.data) return;

    const confirmed = await ns.alert.confirm({
      title: 'Hapus Panduan?',
      deskripsi: `Panduan "${detailQuery.data.title}" akan dihapus permanen dan tidak tampil lagi ke peserta magang.`,
      confirmButtonText: 'Ya, Hapus',
      icon: 'warning',
    });
    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(detailQuery.data.id);
      toast.success('Panduan berhasil dihapus');
      router.push('/hr_admin/guides');
    } catch (err: any) {
      toast.error(err?.message || 'Gagal menghapus panduan');
    }
  };

  if (detailQuery.isPending) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Memuat detail panduan...</p>
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

  return (
    <GuideDetailSection
      guide={detailQuery.data}
      backHref="/hr_admin/guides"
      onEdit={() => router.push(`/hr_admin/guides/${slug}/edit`)}
      onDelete={handleDelete}
      isDeleting={deleteMutation.isPending}
    />
  );
}
