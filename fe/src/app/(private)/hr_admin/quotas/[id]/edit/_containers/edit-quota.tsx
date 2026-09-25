'use client';

import { QuotaFormCard, type QuotaFormValues } from '@/components/organisms/quota/QuotaFormCard';
import { useApi } from '@/hooks/useService/useApi';
import { Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';

export default function EditQuotaContainer() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id || '');
  const api = useApi();

  const quotaQuery = api.quota.query.detail(id);
  const officesQuery = api.office.query.list();
  const departmentsQuery = api.department.query.list();
  const updateMutation = api.quota.mutate.update();

  const handleSave = async (values: QuotaFormValues) => {
    try {
      await updateMutation.mutateAsync({
        id,
        body: {
          totalCapacity: values.totalCapacity,
          notes: values.notes || undefined,
          isActive: values.isActive,
          allocations: values.allocations,
        },
      });

      toast.success('Alokasi kuota kantor & departemen berhasil diperbarui');
      router.push(`/hr_admin/quotas/${id}`);
    } catch (err: any) {
      toast.error(err?.message || 'Gagal memperbarui kuota kantor');
    }
  };

  if (quotaQuery.isPending) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Memuat data kuota kantor...</p>
      </div>
    );
  }

  if (quotaQuery.isError || !quotaQuery.data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <p className="text-sm text-destructive font-semibold">Data kuota kantor tidak ditemukan</p>
      </div>
    );
  }

  return (
    <QuotaFormCard
      initialData={quotaQuery.data}
      offices={officesQuery.data ?? []}
      departments={departmentsQuery.data ?? []}
      isSaving={updateMutation.isPending}
      onSave={handleSave}
    />
  );
}
