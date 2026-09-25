'use client';

import { AvailabilitySection } from '@/components/page/receptionist/AvailabilitySection';
import { useApi } from '@/hooks/useService/useApi';
import type { QuotaAvailabilityQuery, QuotaAvailabilityResult } from '@/types/api/quota.types';
import { useCallback, useEffect, useState } from 'react';

export default function ReceptionistAvailabilityContainer() {
  const api = useApi();

  const [availabilityResult, setAvailabilityResult] = useState<QuotaAvailabilityResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const me = api.auth.query.me();
  const offices = api.office.query.list();
  const allDepartments = api.department.query.list();
  const quotas = api.quota.query.list({ limit: 100 });

  // Ambil kantor penempatan resepsionis dari profil auth pengguna atau fallback ke kantor pertama
  const assignedOfficeId = me.data?.officeId || offices.data?.[0]?.id || '';
  const assignedOffice = offices.data?.find((o) => o.id === assignedOfficeId) || null;
  const assignedOfficeName =
    me.data?.officeLocation?.name ||
    assignedOffice?.name ||
    '';

  // Kuota khusus kantor resepsionis
  const officeQuota = quotas.data?.find((q) => q.officeLocationId === assignedOfficeId) || null;

  // Query daftar anak magang di kantor unit ini
  const internships = api.internship.query.list({
    officeLocationId: assignedOfficeId || undefined,
    limit: 100,
  });

  // Departemen yang terhubung dengan kantor resepsionis
  const officeDepartments =
    assignedOffice?.departments && assignedOffice.departments.length > 0
      ? assignedOffice.departments
      : (allDepartments.data ?? []);

  const handleCheckAvailability = useCallback(
    async (query: QuotaAvailabilityQuery) => {
      setIsChecking(true);
      try {
        const res = await (await import('@/services/props.service')).default.Quota.CheckAvailability(query);
        setAvailabilityResult(res.data);
      } catch (err) {
        console.error('Failed to check quota availability:', err);
      } finally {
        setIsChecking(false);
      }
    },
    [],
  );

  // Otomatis muat status ketersediaan khusus kantor penempatan resepsionis saat halaman pertama kali dibuka
  useEffect(() => {
    if (assignedOfficeId) {
      handleCheckAvailability({ officeLocationId: assignedOfficeId });
    }
  }, [assignedOfficeId, handleCheckAvailability]);

  return (
    <AvailabilitySection
      assignedOffice={assignedOffice}
      assignedOfficeId={assignedOfficeId}
      assignedOfficeName={assignedOfficeName}
      departments={officeDepartments}
      officeQuota={officeQuota}
      internships={internships.data?.data ?? []}
      isInternshipsPending={internships.isPending}
      availabilityResult={availabilityResult}
      isChecking={isChecking}
      onCheckAvailability={handleCheckAvailability}
    />
  );
}
