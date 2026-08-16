import type { Metadata } from "next";
import SkillsContainer from "./_containers/skills";

export const metadata: Metadata = {
  title: "Keterampilan - SIMAD",
  description: "Kelola daftar keterampilan dan kategori",
};

export default function HrSkillsPage() {
  return <SkillsContainer />;
}
