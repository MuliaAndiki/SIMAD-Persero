import type { Metadata } from "next";
import EditProfileContainer from "./_container/edit-profile";

export const metadata: Metadata = {
  title: "Ubah Profil - SIMAD",
  description: "Perbarui data profil peserta magang PLN Persero",
};

export default function EditProfilePage() {
  return <EditProfileContainer />;
}
