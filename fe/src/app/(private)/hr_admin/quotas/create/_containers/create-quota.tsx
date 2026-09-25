'use client';

import { QuotaFormCard, type QuotaFormValues } from '@/components/organisms/quota/QuotaFormCard';
import { useApi } from '@/hooks/useService/useApi';
import { useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';

export default function CreateQuotaContainer() {
  const router = useRouter();
  const api = useApi();

  const officesQuery = api.office.query.list();
  const departmentsQuery = api.department.query.list();
  const createMutation = api.quota.mutate.create();

  const handleSave = async (values: QuotaFormValues) => {
    try {
      await createMutation.mutateAsync({
        officeLocationId: values.officeLocationId,
        totalCapacity: values.totalCapacity,
        notes: values.notes || undefined,
        isActive: values.isActive,
        allocations: values.allocations,
      });

      toast.success('Master kuota kantor & alokasi bidang berhasil dibuat');
      router.push('/hr_admin/quotas');
    } catch (err: any) {
      toast.error(err?.message || 'Gagal membuat kuota kantor');
    }
  };

  return (
    <QuotaFormCard
      offices={officesQuery.data ?? []}
      departments={departmentsQuery.data ?? []}
      isSaving={createMutation.isPending}
      onSave={handleSave}
    />
  );
}
