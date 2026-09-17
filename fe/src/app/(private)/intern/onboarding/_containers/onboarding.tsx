'use client';

import { OnboardingSection } from '@/components/page/intern/OnboardingSection';

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

  const my = api.internship.query.my();

  // Backend GET /internships/me mengembalikan array; tipe FE masih tunggal.
  const internship: InternshipResponse | null = Array.isArray(my.data)
    ? ((my.data as InternshipResponse[])[0] ?? null)
    : (my.data ?? null);
  return (
    <OnboardingSection
      state={{
        isPending: my.isPending,
        isError: my.isError,
        errorMessage: my.error?.message,
        internship,
        isSubmitting: false,
      }}
    />
  );
}
