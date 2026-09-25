'use client';

import { CertificateApprovalSection } from '@/components/page/hr/CertificateApprovalSection';
import { useAppNameSpace } from '@/hooks/useAppNameSpace';
import { useApi } from '@/hooks/useService/useApi';
import { useCallback } from 'react';

export default function HrCertificateApprovalContainer() {
  const api = useApi();
  const ns = useAppNameSpace();

  const pendingQuery = api.certificate.query.pendingApprovals();
  const approveMutation = api.certificate.mutate.approve();
  const rejectMutation = api.certificate.mutate.reject();

  const handleApprove = useCallback(
    async (id: string) => {
      const confirmed = await ns.alert.confirm({
        title: 'Setujui & Terbitkan Sertifikat?',
        deskripsi: 'Sertifikat resmi dengan tanda tangan digital kantor bersangkutan akan langsung diterbitkan dan dapat diunduh oleh peserta magang.',
        confirmButtonText: 'Ya, Terbitkan',
        icon: 'question',
      });
      if (!confirmed) return;

      await approveMutation.mutateAsync(id);
    },
    [approveMutation, ns.alert],
  );

  const handleReject = useCallback(
    async (id: string, reason: string) => {
      await rejectMutation.mutateAsync({ id, reason });
    },
    [rejectMutation],
  );

  return (
    <CertificateApprovalSection
      state={{
        isPending: pendingQuery.isPending,
        isError: pendingQuery.isError,
        errorMessage: pendingQuery.error?.message,
        certificates: pendingQuery.data ?? [],
        isApproving: approveMutation.isPending,
        isRejecting: rejectMutation.isPending,
      }}
      actions={{
        onApprove: handleApprove,
        onReject: handleReject,
      }}
    />
  );
}
