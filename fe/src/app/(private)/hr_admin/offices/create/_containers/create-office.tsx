'use client';

import { OfficeFormCard, type OfficeFormValues } from '@/components/organisms/office/OfficeFormCard';
import { useApi } from '@/hooks/useService/useApi';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { toast } from 'sonner';

export default function CreateOfficeContainer() {
  const router = useRouter();
  const api = useApi();

  const departments = api.department.query.list({ limit: 100 });
  const createMutation = api.office.mutate.create();

  const handleSave = useCallback(
    async (values: OfficeFormValues) => {
      try {
        const payload = {
          name: values.name.trim(),
          address: values.address.trim() || undefined,
          latitude: Number(values.latitude),
          longitude: Number(values.longitude),
          radiusMeter: Number(values.radiusMeter),
          departmentIds: values.departmentIds,
          attendanceSetting: {
            checkInStart: values.attendanceSetting.checkInStart,
            checkInEnd: values.attendanceSetting.checkInEnd,
            checkOutStart: values.attendanceSetting.checkOutStart,
            checkOutEnd: values.attendanceSetting.checkOutEnd,
            lateAfter: values.attendanceSetting.lateAfter,
            allowWeekend: values.attendanceSetting.allowWeekend,
          },
        };

        const res = await createMutation.mutateAsync(payload as any);
        const createdOffice = (res as any)?.data || res;
        toast.success(`Kantor ${createdOffice?.name || values.name} berhasil dibuat dengan pengaturan absensi.`);
        router.push(createdOffice?.id ? `/hr_admin/offices/${createdOffice.id}` : '/hr_admin/offices');
      } catch (err: any) {
        toast.error(err?.message || 'Gagal membuat lokasi kantor');
      }
    },
    [createMutation, router],
  );

  return (
    <OfficeFormCard
      departments={departments.data ?? []}
      isSaving={createMutation.isPending}
      onSave={handleSave}
    />
  );
}
