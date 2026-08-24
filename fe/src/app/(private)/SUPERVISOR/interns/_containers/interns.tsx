"use client";

import { InternsSection } from "@/components/page/supervisor/InternsSection";
import { useApi } from "@/hooks/useService/useApi";

/**
 * Container halaman peserta bimbingan supervisor (GET /attendance/supervisor).
 * Seluruh logika, state, & API ada di container; section hanya presentasi.
 */
export default function InternsContainer() {
  const api = useApi();

  const supervisor = api.attendance.query.supervisor();

  return (
    <InternsSection
      state={{
        rows: supervisor.data ?? [],
        isPending: supervisor.isPending,
        isError: supervisor.isError,
        errorMessage: supervisor.error?.message,
      }}
      service={{
        onRetry: () => supervisor.refetch(),
      }}
    />
  );
}
