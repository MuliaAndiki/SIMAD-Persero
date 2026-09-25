'use client';

import { OfficeDetailSection } from '@/components/page/hr/OfficeDetailSection';
import { useAppNameSpace } from '@/hooks/useAppNameSpace';
import { useApi } from '@/hooks/useService/useApi';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { toast } from 'sonner';

export default function OfficeDetailContainer() {
  const router = useRouter();
  const params = useParams();
  const officeId = String(params.id);
  const api = useApi();
  const ns = useAppNameSpace();

  const officeQuery = api.office.query.detail({ officeId });
  const deleteMutation = api.office.mutate.delete();

  const handleDelete = useCallback(async () => {
    if (!officeQuery.data) return;

    const confirmed = await ns.alert.confirm({
      title: 'Hapus Lokasi Kantor?',
      deskripsi: `Apakah Anda yakin ingin menghapus kantor "${officeQuery.data.name}"? Aksi ini tidak dapat dibatalkan.`,
      confirmButtonText: 'Ya, Hapus Kantor',
      icon: 'warning',
    });

    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync({ officeId });
      toast.success(`Kantor ${officeQuery.data.name} berhasil dihapus.`);
      router.push('/hr_admin/offices');
    } catch (err: any) {
      toast.error(err?.message || 'Gagal menghapus kantor');
    }
  }, [deleteMutation, ns.alert, officeId, officeQuery.data, router]);

  if (officeQuery.isPending) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Memuat detail kantor & jadwal absensi...</p>
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
    <OfficeDetailSection
      office={officeQuery.data}
      isDeleting={deleteMutation.isPending}
      onDelete={handleDelete}
    />
  );
}
