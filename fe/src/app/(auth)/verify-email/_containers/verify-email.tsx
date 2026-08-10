'use client';

import { VerifyEmailSection } from '@/components/page/auth/verify-email/VerifyEmailSection';
import { useApi } from '@/hooks/useService/useApi';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

type VerifyEmailStatus = 'verifying' | 'success' | 'error';

export default function VerifyEmailContainer() {
  const api = useApi();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Token dikirim lewat URL email: /auth/verify-email?token=... (lihat email.service).
  const token = searchParams?.get('token') || '';
  const verifyEmail = api.auth.mutate.verifyEmail();

  const [status, setStatus] = useState<VerifyEmailStatus>(token ? 'verifying' : 'error');
  const [message, setMessage] = useState(
    token
      ? 'Memverifikasi email Anda, mohon tunggu sebentar...'
      : 'Token verifikasi tidak ditemukan.',
  );
  const hasRunRef = useRef(false);

  const runVerify = useCallback(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token verifikasi tidak ditemukan. Gunakan tautan yang dikirim ke email Anda.');
      return;
    }

    setStatus('verifying');
    setMessage('Memverifikasi email Anda, mohon tunggu sebentar...');

    verifyEmail.mutate(
      { token },
      {
        onSuccess: (res) => {
          setStatus('success');
          setMessage(
            res.message || 'Email berhasil diverifikasi. Silakan masuk menggunakan akun Anda.',
          );
        },
        onError: (err) => {
          setStatus('error');
          setMessage(
            err.message || 'Verifikasi gagal. Token mungkin tidak valid atau kedaluwarsa.',
          );
        },
      },
    );
  }, [token, verifyEmail]);

  // Auto-verifikasi sekali saat halaman terbuka (ref guard anti double-run StrictMode).
  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;
    runVerify();
  }, [runVerify]);

  const handleRetry = () => {
    runVerify();
  };

  const handleGoToLogin = () => {
    router.push('/login');
  };

  return (
    <VerifyEmailSection
      state={{ status, message }}
      service={{ onRetry: handleRetry, onGoToLogin: handleGoToLogin }}
    />
  );
}
