"use client";

import { AttendanceDetailSection } from "@/components/page/intern/AttendanceDetailSection";
import { useApi } from "@/hooks/useService/useApi";

export interface AttendanceDetailContainerProps {
  attendanceId: string;
}

/**
 * Container halaman detail absensi intern (dynamic route `[id]`).
 * Fetch detail by attendanceId via React Query, lalu render
 * AttendanceDetailSection (presentasi).
 */
export default function AttendanceDetailContainer({
  attendanceId,
}: AttendanceDetailContainerProps) {
  const api = useApi();

  const detail = api.attendance.query.detail(
    { attendanceId },
    { enabled: Boolean(attendanceId) },
  );

  return (
    <AttendanceDetailSection
      state={{
        isPending: detail.isPending,
        isError: detail.isError,
        errorMessage: detail.error?.message,
        detail: detail.data ?? null,
      }}
    />
  );
}
