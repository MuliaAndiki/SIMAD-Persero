'use client';

import { Card } from '@/components/atoms/card';
import { OfficeFormCard, type OfficeFormValues } from '@/components/organisms/office/OfficeFormCard';
import { useApi } from '@/hooks/useService/useApi';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { toast } from 'sonner';

export default function EditOfficeContainer() {
  const router = useRouter();
  const params = useParams();
  const officeId = String(params.id);
  const api = useApi();

  const officeQuery = api.office.query.detail({ officeId });
  const departmentsQuery = api.department.query.list({ limit: 100 });
  const updateMutation = api.office.mutate.update();

  const handleSave = useCallback(
    async (values: OfficeFormValues) => {
      try {
        const body = {
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

        await updateMutation.mutateAsync({
          params: { officeId },
          body: body as any,
        });
        toast.success(`Perubahan kantor ${values.name} berhasil disimpan.`);
        router.push(`/hr_admin/offices/${officeId}`);
      } catch (err: any) {
        toast.error(err?.message || 'Gagal menyimpan perubahan kantor');
      }
    },
    [api, officeId, router, updateMutation],
  );

  if (officeQuery.isPending) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Memuat data kantor & jadwal absensi...</p>
      </div>
    );
  }

  if (officeQuery.isError || !officeQuery.data) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        <AlertCircle className="size-5 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold">Kantor tidak ditemukan</h4>
          <p className="text-xs opacity-90 mt-0.5">
            {officeQuery.error?.message || 'Data kantor tidak dapat dimuat atau telah dihapus.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <OfficeFormCard
      initialData={officeQuery.data}
      departments={departmentsQuery.data ?? []}
      isSaving={updateMutation.isPending}
      onSave={handleSave}
    />
  );
}
