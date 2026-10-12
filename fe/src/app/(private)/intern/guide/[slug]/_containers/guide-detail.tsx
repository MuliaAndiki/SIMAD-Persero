'use client';

import { GuideDetailSection } from '@/components/page/guide/GuideDetailSection';
import { useApi } from '@/hooks/useService/useApi';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function InternGuideDetailContainer() {
  const params = useParams<{ slug: string }>();
  const slug = String(params.slug);
  const api = useApi();

  const detailQuery = api.guide.query.detail(slug);

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

  return <GuideDetailSection guide={detailQuery.data} backHref="/intern/guide" />;
}
