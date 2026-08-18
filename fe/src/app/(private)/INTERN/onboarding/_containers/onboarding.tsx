'use client';

import { OnboardingSection } from '@/components/page/intern/OnboardingSection';
import { useAppNameSpace } from '@/hooks/useAppNameSpace';
import { useApi } from '@/hooks/useService/useApi';
import type { InternshipResponse } from '@/types/api/internship.types';

/**
 * Container halaman onboarding intern (GET /internships/me;
 * PATCH /internships/:id/onboarding).
 *
 * Logika, state, & API ada di sini; OnboardingSection hanya presentasi.
 */
export default function OnboardingContainer() {
  const api = useApi();
  const ns = useAppNameSpace();

  const my = api.internship.query.my();
  const completeOnboarding = api.internship.mutate.completeOnboarding();

  // Backend GET /internships/me mengembalikan array; tipe FE masih tunggal.
  const internship: InternshipResponse | null = Array.isArray(my.data)
    ? ((my.data as InternshipResponse[])[0] ?? null)
    : (my.data ?? null);

  const handleSubmit = async () => {
    if (!internship) return;
    const confirmed = await ns.alert.confirm({
      title: 'Konfirmasi Penyelesaian Onboarding',
      icon: 'question',
      deskripsi: 'Pastikan Anda telah membaca dan menyetujui seluruh ketentuan tata tertib magang.',
      confirmButtonText: 'Ya, Saya Menyetujui',
    });
    if (!confirmed) return;
    completeOnboarding.mutate({ id: internship.id });
  };

  return (
    <OnboardingSection
      state={{
        isPending: my.isPending,
        isError: my.isError,
        errorMessage: my.error?.message,
        internship,
        isSubmitting: completeOnboarding.isPending,
      }}
      service={{ onSubmit: handleSubmit }}
    />
  );
}
