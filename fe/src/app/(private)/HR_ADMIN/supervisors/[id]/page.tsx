import type { Metadata } from "next";
import { Suspense } from "react";
import SupervisorDetailContainer from "./_containers/supervisor-detail";

export const metadata: Metadata = {
  title: "Detail Supervisor - SIMAD",
  description: "Detail bimbingan supervisor magang",
};

type HrSupervisorDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function HrSupervisorDetailPage({
  params,
}: HrSupervisorDetailPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<div className="p-8">Memuat detail supervisor...</div>}>
      <SupervisorDetailContainer supervisorId={id} />
    </Suspense>
  );
}
