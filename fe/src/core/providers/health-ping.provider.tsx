'use client';

import { useApi } from '@/hooks/useService/useApi';
import type React from 'react';

/**
 * HealthPingProvider
 *
 * Menjalankan background ping ke backend dan database PostgreSQL (SELECT 1)
 * setiap kali pengguna membuka aplikasi frontend SIMAD.
 *
 * Menghilangkan latency cold-start (mis. serverless / cloud instance seperti Render
 * yang tertidur setelah masa inaktif), sehingga saat pengguna mengklik fitur apa pun
 * (Login, Pendaftaran, Cek Sertifikat, dll), backend dan database sudah siap.
 */
export function HealthPingProvider({ children }: { children: React.ReactNode }) {
  const api = useApi();

  // Menjalankan query ping secara otomatis saat pertama kali dibuka
  // dan terus menjaga kehangatan service secara berkala di latar belakang
  api.health.query.ping();

  return <>{children}</>;
}
