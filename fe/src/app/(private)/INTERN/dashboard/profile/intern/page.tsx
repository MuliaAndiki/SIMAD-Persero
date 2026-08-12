import type { Metadata } from "next";
import InternProfileContainer from "./_container/intern-profile";

export const metadata: Metadata = {
  title: "Profil Magang - SIMAD",
  description:
    "Data institusi pendidikan dan profil magang peserta magang PLN Persero",
};

export default function InternProfilePage() {
  return <InternProfileContainer />;
}
