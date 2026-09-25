'use client';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { AvailabilitySection } from '@/components/page/receptionist/AvailabilitySection';
import { useAppNameSpace } from '@/hooks/useAppNameSpace';
import { useApi } from '@/hooks/useService/useApi';
import type { QuotaAvailabilityQuery, QuotaAvailabilityResult } from '@/types/api/quota.types';
import { ArrowLeft, Edit, Loader2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function QuotaDetailContainer() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id || '');
  const api = useApi();
  const ns = useAppNameSpace();

  const quotaQuery = api.quota.query.detail(id);
  const officesQuery = api.office.query.list();
  const allDepartments = api.department.query.list();
  const deleteMutation = api.quota.mutate.delete();

  const quota = quotaQuery.data;
  const officeId = quota?.officeLocationId || '';
  const assignedOffice = officesQuery.data?.find((o) => o.id === officeId) || null;
  const officeName = assignedOffice?.name || quota?.officeLocation?.name || 'Kantor PLN';

  // Query daftar anak magang di kantor ini
  const internshipsQuery = api.internship.query.list({
    officeLocationId: officeId || undefined,
    limit: 100,
  });

  const [availabilityResult, setAvailabilityResult] = useState<QuotaAvailabilityResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // Departemen di kantor ini
  const officeDepartments =
    assignedOffice?.departments && assignedOffice.departments.length > 0
      ? assignedOffice.departments
      : (allDepartments.data ?? []);

  const handleCheckAvailability = useCallback(
    async (query: QuotaAvailabilityQuery) => {
      if (!officeId) return;
      setIsChecking(true);
      try {
        const res = await (await import('@/services/props.service')).default.Quota.CheckAvailability({
          ...query,
          officeLocationId: officeId,
        });
        setAvailabilityResult(res.data);
      } catch (err) {
        console.error('Failed to check quota availability:', err);
      } finally {
        setIsChecking(false);
      }
    },
    [officeId],
  );

  // Otomatis muat status ketersediaan saat data kuota telah selesai di-fetch
  useEffect(() => {
    if (officeId) {
      handleCheckAvailability({ officeLocationId: officeId });
    }
  }, [officeId, handleCheckAvailability]);

  const handleDelete = async () => {
    if (!quota) return;
    const confirmed = await ns.alert.confirm({
      title: 'Hapus Kuota Kantor?',
      deskripsi: `Apakah Anda yakin ingin menghapus alokasi kuota master ${officeName}?`,
      confirmButtonText: 'Ya, Hapus',
      icon: 'warning',
    });
    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(quota.id);
      toast.success('Kuota kantor berhasil dihapus');
      router.push('/hr_admin/quotas');
    } catch (err: any) {
      toast.error(err?.message || 'Gagal menghapus kuota kantor');
    }
  };

  if (quotaQuery.isPending) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Memuat detail kuota kantor...</p>
      </div>
    );
  }

  if (quotaQuery.isError || !quota) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <p className="text-sm text-destructive font-semibold">Data kuota kantor tidak ditemukan</p>
        <Button variant="outline" asChild>
          <Link href="/hr_admin/quotas">Kembali ke Daftar Kuota</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top HR Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/hr_admin/quotas" className="hover:underline flex items-center gap-1 font-medium">
            <ArrowLeft className="size-3.5" />
            Daftar Kuota Kantor
          </Link>
          <span>/</span>
          <span className="text-foreground font-semibold">{officeName}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" asChild>
            <Link href="/hr_admin/quotas">
              <ArrowLeft className="size-3.5 mr-1" />
              Kembali
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="text-destructive hover:bg-destructive/10 border-destructive/30"
          >
            <Trash2 className="size-3.5 mr-1" />
            Hapus Kuota
          </Button>
          <Button size="sm" asChild className="gap-1.5">
            <Link href={`/hr_admin/quotas/${quota.id}/edit`}>
              <Edit className="size-3.5 mr-1" />
              Ubah Alokasi Kuota
            </Link>
          </Button>
        </div>
      </div>

      {/* Reusing Receptionist Availability & Intern Detail Component */}
      <AvailabilitySection
        assignedOffice={assignedOffice}
        assignedOfficeId={officeId}
        assignedOfficeName={officeName}
        departments={officeDepartments}
        officeQuota={quota}
        internships={internshipsQuery.data?.data ?? []}
        isInternshipsPending={internshipsQuery.isPending}
        availabilityResult={availabilityResult}
        isChecking={isChecking}
        onCheckAvailability={handleCheckAvailability}
      />
    </div>
  );
}
