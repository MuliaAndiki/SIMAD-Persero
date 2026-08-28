'use client';

import { CertificateSection } from '@/components/page/intern/CertificateSection';
import { useApi } from '@/hooks/useService/useApi';
import type { InternshipResponse } from '@/types/api/internship.types';
import { toast } from 'sonner';

export default function InternCertificateContainer() {
  const api = useApi();

  const myCertificates = api.certificate.query.my();
  const internship = api.internship.query.my();
  const downloadMutation = api.certificate.mutate.download();

  const internshipData: InternshipResponse | null = Array.isArray(internship.data)
    ? ((internship.data as InternshipResponse[])[0] ?? null)
    : (internship.data ?? null);

  const handleDownload = async (certificateId: string, certificateNumber: string) => {
    try {
      toast.loading('Sedang mengunduh sertifikat...', { id: 'download-cert' });
      const response = await downloadMutation.mutateAsync({ certificateId });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Sertifikat-${certificateNumber.replace(/\//g, '-')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Sertifikat berhasil diunduh', { id: 'download-cert' });
    } catch (error) {
      console.error('Failed to download certificate:', error);
      toast.error('Gagal mengunduh sertifikat', { id: 'download-cert' });
    }
  };

  return (
    <CertificateSection
      state={{
        isPending: myCertificates.isPending || internship.isPending,
        isError: myCertificates.isError || internship.isError,
        errorMessage: myCertificates.error?.message ?? internship.error?.message,
        certificates: myCertificates.data ?? [],
        internshipStatus: internshipData?.status,
      }}
      service={{
        onDownload: handleDownload,
      }}
    />
  );
}
