'use client';

import { ForgotPasswordSection } from '@/components/page/auth/forgot-password/ForgotPasswordSection';
import { useApi } from '@/hooks/useService/useApi';
import type { ForgotPasswordBody } from '@/types/api/auth.types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ForgotPasswordContainer() {
  const api = useApi();
  const _router = useRouter();

  const [formForgot, setFormForgot] = useState<ForgotPasswordBody>({
    email: '',
  });

  const forgotPassword = api.auth.mutate.forgotPassword();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    forgotPassword.mutate(formForgot, {
      onSuccess: () => {
        // Optional: Route behavior or stay to show success message
        // router.push('/login');
      },
    });
  };

  const handleFormChange = (newForm: Partial<ForgotPasswordBody>) => {
    setFormForgot((prev) => ({ ...prev, ...newForm }));
  };

  return (
    <ForgotPasswordSection
      state={{
        formForgot,
        isPending: forgotPassword.isPending,
        isSuccess: forgotPassword.isSuccess,
      }}
      service={{
        handleSubmit,
        onFormChange: handleFormChange,
      }}
    />
  );
}
