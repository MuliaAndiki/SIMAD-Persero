'use client';

import { QuotasSection } from '@/components/page/hr/QuotasSection';
import { useAppNameSpace } from '@/hooks/useAppNameSpace';
import { useApi } from '@/hooks/useService/useApi';
import type { QuotaItem } from '@/types/api/quota.types';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

export default function HrQuotasContainer() {
  const api = useApi();
  const ns = useAppNameSpace();

  const [selectedOfficeId, setSelectedOfficeId] = useState<string>('ALL');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('ALL');

  const officesQuery = api.office.query.list();
  const departmentsQuery = api.department.query.list();

  const quotaQuery = api.quota.query.list({
    officeLocationId: selectedOfficeId === 'ALL' ? undefined : selectedOfficeId,
    departmentId: selectedDepartmentId === 'ALL' ? undefined : selectedDepartmentId,
  });

  const deleteMutation = api.quota.mutate.delete();

  const handleDelete = useCallback(
    async (quota: QuotaItem) => {
      const confirmed = await ns.alert.confirm({
        title: 'Hapus Kuota Kantor?',
        deskripsi: `Apakah Anda yakin ingin menghapus kuota magang ${quota.officeLocation?.name ?? 'kantor ini'}?`,
        confirmButtonText: 'Ya, Hapus',
        icon: 'warning',
      });
      if (!confirmed) return;

      try {
        await deleteMutation.mutateAsync(quota.id);
        toast.success('Kuota kantor berhasil dihapus');
        quotaQuery.refetch();
      } catch (err: any) {
        toast.error(err?.message || 'Gagal menghapus kuota');
      }
    },
    [deleteMutation, ns.alert, quotaQuery],
  );

  return (
    <QuotasSection
      state={{
        isPending: quotaQuery.isPending,
        isFetching: quotaQuery.isFetching,
        isError: quotaQuery.isError,
        errorMessage: quotaQuery.error?.message,
        quotas: (quotaQuery.data as any) ?? [],
        offices: officesQuery.data ?? [],
        departments: departmentsQuery.data ?? [],
        selectedOfficeId,
        selectedDepartmentId,
      }}
      actions={{
        onOfficeFilterChange: setSelectedOfficeId,
        onDepartmentFilterChange: setSelectedDepartmentId,
        onDelete: handleDelete,
      }}
    />
  );
}
