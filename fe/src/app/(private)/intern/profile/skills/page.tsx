import type { Metadata } from 'next';
import ProfileSkillsContainer from './_container/skills';

export const metadata: Metadata = {
  title: 'Kelola Keterampilan - SIMAD',
  description: 'Tambahkan keahlian ke profil magang peserta PLN Persero',
};

export default function ProfileSkillsPage() {
  return <ProfileSkillsContainer />;
}
