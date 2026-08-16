"use client";

import { useCallback, useState } from "react";

import { HistorySection } from "@/components/page/intern/HistorySection";
import { useApi } from "@/hooks/useService/useApi";
import type { AttendanceResponse } from "@/types/api/attendance.types";
import type { InternshipResponse } from "@/types/api/internship.types";

/**
 * Container halaman riwayat absensi intern.
 *
 * Mengambil riwayat absensi bulan berjalan (GET /attendance/me) + periode
 * internship (GET /internships/me) untuk menentukan hari kerja wajib absen,
 * lalu menyerahkan data ke HistorySection (presentasi).
 */
export default function InternHistoryContainer() {
  const api = useApi();

  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  const [year, setYear] = useState(() => new Date().getFullYear());

  const my = api.attendance.query.my({ page: 1, limit: 62, month, year });
  const internship = api.internship.query.my();

  // Backend GET /internships/me mengembalikan array; tipe FE masih tunggal.
  const internshipData: InternshipResponse | null = Array.isArray(
    internship.data,
  )
    ? ((internship.data as InternshipResponse[])[0] ?? null)
    : (internship.data ?? null);

  // GET /attendance/me mengembalikan array pada field `data` envelope
  // (meta terpisah). Guard Array.isArray untuk toleransi bentuk wrapper
  // lama { data, meta } bila cache/SSR masih menyimpan data lama.
  const myRecords: AttendanceResponse[] = Array.isArray(my.data)
    ? my.data
    : ((my.data as { data?: AttendanceResponse[] } | null)?.data ?? []);

  const handlePrevMonth = useCallback(() => {
    setMonth((prev) => {
      if (prev === 1) {
        setYear((y) => y - 1);
        return 12;
      }
      return prev - 1;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setMonth((prev) => {
      if (prev === 12) {
        setYear((y) => y + 1);
        return 1;
      }
      return prev + 1;
    });
  }, []);

  const handleCurrentMonth = useCallback(() => {
    const date = new Date();
    setMonth(date.getMonth() + 1);
    setYear(date.getFullYear());
  }, []);

  return (
    <HistorySection
      state={{
        isPending: my.isPending || internship.isPending,
        isError: my.isError || internship.isError,
        errorMessage: my.error?.message ?? internship.error?.message,
        month,
        year,
        records: myRecords,
        internshipStart: internshipData?.actualStartDate,
        internshipEnd: internshipData?.actualEndDate,
      }}
      service={{
        onPrevMonth: handlePrevMonth,
        onNextMonth: handleNextMonth,
        onCurrentMonth: handleCurrentMonth,
      }}
    />
  );
}
