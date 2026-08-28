'use client';

import { useApi } from '@/hooks/useService/useApi';

/**
 * useInternAccess — status akses modul yang menuntut magang aktif.
 *
 * Digunakan untuk menyaring menu (Absensi/Riwayat) dan menjaga halaman agar
 * tidak bisa dibuka oleh intern yang belum memiliki pengajuan magang disetujui
 * (`internship` null pada GET /dashboard/intern).
 *
 * - Hanya role INTERN yang dianggap berhak memanggil API dashboard intern.
 * - `hasActiveInternship` bernilai true saat role INTERN dan data
 *   `internship` tidak null.
 */
export function useInternAccess() {
  const api = useApi();

  const me = api.auth.query.me();
  const isIntern = me.data?.role?.toUpperCase() === 'INTERN';
  const intern = api.dashboard.query.intern({ enabled: isIntern });

  const hasActiveInternship = Boolean(isIntern && intern.data?.internship);
  const isChecking = me.isPending || (isIntern && intern.isPending);

  return {
    isIntern,
    hasActiveInternship,
    isChecking,
  };
}
