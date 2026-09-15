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
  const downloadMineMutation = api.certificate.mutate.downloadMine();

  const internshipData: InternshipResponse | null = Array.isArray(internship.data)
    ? ((internship.data as InternshipResponse[])[0] ?? null)
    : (internship.data ?? null);

  const certList = myCertificates.data
    ? Array.isArray(myCertificates.data)
      ? myCertificates.data
      : [myCertificates.data as any]
    : [];

  const handleDownload = async (certificateId?: string, certificateNumber?: string) => {
    try {
      toast.loading('Sedang menyiapkan sertifikat untuk diunduh...', { id: 'download-cert' });

      let response: Response;
      let filename = certificateNumber
        ? `Sertifikat-Magang-${certificateNumber.replace(/[/\\:*?"<>|]/g, '-')}.pdf`
        : 'Sertifikat-Magang.pdf';

      if (certificateId) {
        response = await downloadMutation.mutateAsync({ certificateId });
      } else {
        response = await downloadMineMutation.mutateAsync();
      }

      // Try reading filename from Content-Disposition header
      const disposition = response.headers.get('content-disposition');
      if (disposition?.includes('filename=')) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match?.[1]) {
          filename = match[1];
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);

      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Refresh queries so preview and actions reflect generated state
      await myCertificates.refetch();
      await internship.refetch();

      toast.success('Sertifikat berhasil diunduh! Periksa folder Download Anda.', {
        id: 'download-cert',
        duration: 4000,
      });
    } catch (error) {
      console.error('Failed to download certificate:', error);
      toast.error('Gagal mengunduh sertifikat. Silakan coba lagi.', {
        id: 'download-cert',
        duration: 4000,
      });
    }
  };

  return (
    <CertificateSection
      state={{
        isPending: myCertificates.isPending || internship.isPending,
        isError: myCertificates.isError || internship.isError,
        errorMessage: myCertificates.error?.message ?? internship.error?.message,
        certificates: certList,
        internshipStatus: internshipData?.status,
        isDownloading: downloadMutation.isPending || downloadMineMutation.isPending,
      }}
      service={{
        onDownload: handleDownload,
      }}
    />
  );
}
