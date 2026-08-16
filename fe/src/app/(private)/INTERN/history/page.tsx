import type { Metadata } from "next";
import { Suspense } from "react";

import { InternAccessGate } from "@/components/page/intern/InternAccessGate";

import InternHistoryContainer from "./_containers/history";

export const metadata: Metadata = {
  title: "Riwayat Absensi - SIMAD",
  description: "Riwayat absensi peserta magang PLN Persero",
};

export default function InternHistoryPage() {
  return (
    <InternAccessGate>
      <Suspense fallback={null}>
        <InternHistoryContainer />
      </Suspense>
    </InternAccessGate>
  );
}
