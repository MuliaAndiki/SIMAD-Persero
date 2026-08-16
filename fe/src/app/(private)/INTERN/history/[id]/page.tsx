import type { Metadata } from "next";
import { Suspense } from "react";

import { AttendanceDetailFallback } from "@/components/page/intern/AttendanceDetailSection";
import { InternAccessGate } from "@/components/page/intern/InternAccessGate";

import AttendanceDetailContainer from "./_containers/attendance-detail";

export const metadata: Metadata = {
  title: "Detail Absensi - SIMAD",
  description: "Detail absensi peserta magang PLN Persero",
};

type InternHistoryDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function InternHistoryDetailPage({
  params,
}: InternHistoryDetailPageProps) {
  const { id } = await params;

  return (
    <InternAccessGate>
      <Suspense fallback={<AttendanceDetailFallback />}>
        <AttendanceDetailContainer attendanceId={id} />
      </Suspense>
    </InternAccessGate>
  );
}
