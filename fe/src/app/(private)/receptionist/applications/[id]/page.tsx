import type { Metadata } from "next";
import { ReceptionistApplicationDetailContainer } from "./_containers/ReceptionistApplicationDetailContainer";

export const metadata: Metadata = {
  title: "Detail Pengajuan - Resepsionis - SIMAD",
  description: "Detail pengajuan magang peserta.",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ReceptionistApplicationDetailPage({
  params,
}: PageProps) {
  const { id } = await params;
  return <ReceptionistApplicationDetailContainer applicationId={id} />;
}
