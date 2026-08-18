"use client";

import { useMemo, useState } from "react";

import { InternshipsSection } from "@/components/page/hr/InternshipsSection";
import { useApi } from "@/hooks/useService/useApi";

/**
 * Container halaman Magang (HR Admin) — orchestration layer.
 *
 * Mengelola daftar seluruh magang (GET /internships) sebagai view monitoring.
 * Transisi ONBOARDING_COMPLETED → ACTIVE tidak memerlukan aksi manual: sebuah
 * scheduled job (be/src/cron/internship.cron.ts) otomatis mengaktifkan magang
 * ketika tanggal mulai yang ditentukan (actualStartDate) tiba
 * (docs/05-state-machine.md §9). Pencarian & filter status dilakukan
 * client-side terhadap hasil query.
 */
export default function HrInternshipsContainer() {
  const api = useApi();

  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const list = api.internship.query.list();

  const filteredInternships = useMemo(() => {
    const keywordLower = keyword.trim().toLowerCase();
    return (list.data ?? []).filter((internship) => {
      if (statusFilter && internship.status !== statusFilter) return false;
      if (!keywordLower) return true;

      const name = internship.internProfile?.user.fullName?.toLowerCase() ?? "";
      const email = internship.internProfile?.user.email?.toLowerCase() ?? "";
      const nim = internship.internProfile?.studentNumber?.toLowerCase() ?? "";
      return (
        name.includes(keywordLower) ||
        email.includes(keywordLower) ||
        nim.includes(keywordLower)
      );
    });
  }, [list.data, keyword, statusFilter]);

  return (
    <InternshipsSection
      state={{
        isPending: list.isPending,
        isError: list.isError,
        errorMessage: list.error?.message,
        internships: filteredInternships,
        statusFilter,
        keyword,
      }}
      actions={{
        onStatusChange: setStatusFilter,
        onKeywordChange: setKeyword,
        onSearch: () => {},
      }}
    />
  );
}
