'use client';

import { ResetPasswordSection } from '@/components/page/auth/reset-password/ResetPasswordSection';
import { useApi } from '@/hooks/useService/useApi';
import type { ResetPasswordBody } from '@/types/api/auth.types';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function ResetPasswordContainer() {
  const api = useApi();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract token from URL search params (e.g., ?token=xyz123)
  const tokenParams = searchParams?.get('token') || '';

  const [formReset, setFormReset] = useState<ResetPasswordBody>({
    token: tokenParams,
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  const resetPassword = api.auth.mutate.resetPassword();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    resetPassword.mutate(formReset, {
      onSuccess: () => {
        router.push('/login?reset_success=true');
      },
    });
  };

  const handleFormChange = (newForm: Partial<ResetPasswordBody>) => {
    setFormReset((prev) => ({ ...prev, ...newForm }));
  };

  return (
    <ResetPasswordSection
      state={{
        formReset,
        showPassword,
        isPending: resetPassword.isPending,
      }}
      service={{
        handleSubmit,
        onFormChange: handleFormChange,
        setShowPassword,
      }}
    />
  );
}
