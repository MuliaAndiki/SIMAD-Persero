'use client';

import { CheckEmailSection } from '@/components/page/auth/check-email/CheckEmailSection';
import { useApi } from '@/hooks/useService/useApi';
import { useRouter, useSearchParams } from 'next/navigation';

export default function CheckEmailContainer() {
  const api = useApi();
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams?.get('email') || '';
  const sendVerifyEmail = api.auth.mutate.sendVerifyEmail();

  const handleResend = () => {
    if (!email) return;
    sendVerifyEmail.mutate({ email });
  };

  const handleGoToLogin = () => {
    router.push('/login');
  };

  return (
    <CheckEmailSection
      state={{ email, isResending: sendVerifyEmail.isPending }}
      service={{ onResend: handleResend, onGoToLogin: handleGoToLogin }}
    />
  );
}
