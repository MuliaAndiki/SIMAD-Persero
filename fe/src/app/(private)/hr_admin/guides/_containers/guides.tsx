'use client';

import { GuidesManagementSection } from '@/components/page/hr/GuidesManagementSection';
import { useApi } from '@/hooks/useService/useApi';
import type { GuideItem } from '@/types/api/guide.types';
import { toast } from 'sonner';

export default function HRGuidesContainer() {
  const api = useApi();
  const guidesQuery = api.guide.query.list();
  const deleteMutation = api.guide.mutate.delete();

  const guides: GuideItem[] = Array.isArray(guidesQuery.data)
    ? guidesQuery.data
    : ((guidesQuery.data as any)?.data ?? []);

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Panduan berhasil dihapus');
      guidesQuery.refetch();
    } catch (err: any) {
      toast.error(err?.message || 'Gagal menghapus panduan');
    }
  };

  return (
    <GuidesManagementSection
      guides={guides}
      isLoading={guidesQuery.isPending}
      onDelete={handleDelete}
      onRefresh={() => guidesQuery.refetch()}
    />
  );
}
