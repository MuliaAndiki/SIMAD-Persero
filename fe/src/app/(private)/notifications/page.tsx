import type { Metadata } from 'next';
import NotificationsContainer from './_containers/notifications';

export const metadata: Metadata = {
  title: 'Pusat Notifikasi - SIMAD',
  description: 'Pusat pemberitahuan, pengumuman siaran, dan aktivitas akun SIMAD PLN Persero',
};

export default function NotificationsPage() {
  return <NotificationsContainer />;
}
