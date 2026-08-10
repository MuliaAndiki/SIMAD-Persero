'use client';

import { MagicLinkSection } from '@/components/page/auth/magic-link/MagicLinkSection';
import { useApi } from '@/hooks/useService/useApi';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

type MagicLinkStatus = 'verifying' | 'success' | 'error';

export default function MagicLinkContainer() {
  const api = useApi();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Token dikirim lewat URL email: /auth/magic-link?token=... (lihat email.service).
  const token = searchParams?.get('token') || '';
  const verifyMagicLink = api.auth.mutate.verifyMagicLink();

  const [status, setStatus] = useState<MagicLinkStatus>(token ? 'verifying' : 'error');
  const [message, setMessage] = useState(
    token ? 'Memverifikasi tautan, mohon tunggu sebentar...' : 'Token tidak ditemukan.',
  );
  const hasRunRef = useRef(false);

  const runVerify = useCallback(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token tidak ditemukan. Gunakan tautan yang dikirim ke email Anda.');
      return;
    }

    setStatus('verifying');
    setMessage('Memverifikasi tautan, mohon tunggu sebentar...');

    // Sukses ditangani hook useVerifyMagicLink: simpan cookie sesi + redirect role
    // dashboard. Di sini hanya menangani error agar tampil di halaman.
    verifyMagicLink.mutate(
      { token },
      {
        onError: (err) => {
          setStatus('error');
          setMessage(err.message || 'Tautan tidak valid atau sudah kedaluwarsa.');
        },
      },
    );
  }, [token, verifyMagicLink]);

  // Auto-verify sekali saat halaman terbuka (ref guard anti double-run StrictMode).
  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;
    runVerify();
  }, [runVerify]);

  const isSuccess = verifyMagicLink.isSuccess;

  const handleRetry = () => {
    runVerify();
  };

  const handleGoToLogin = () => {
    router.push('/login');
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <MagicLinkSection
      state={{
        status: isSuccess ? 'success' : status,
        message: isSuccess
          ? verifyMagicLink.data?.message || 'Login berhasil. Mengarahkan Anda ke dashboard...'
          : message,
      }}
      service={{
        onRetry: handleRetry,
        onGoToLogin: handleGoToLogin,
        onGoToDashboard: handleGoToDashboard,
      }}
    />
  );
}
