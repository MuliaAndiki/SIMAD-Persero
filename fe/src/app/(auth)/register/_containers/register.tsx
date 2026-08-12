'use client';

import { RegisterSection } from '@/components/page/auth/register/RegisterSection';
import { useApi } from '@/hooks/useService/useApi';
import type { RegisterBody } from '@/types/api/auth.types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RegisterContainer() {
  const api = useApi();
  const router = useRouter();

  const [formRegister, setFormRegister] = useState<RegisterBody>({
    fullName: '',
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  const register = api.auth.mutate.register();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    register.mutate(formRegister, {
      onSuccess: () => {
        router.push('/login');
      },
    });
  };

  const handleFormChange = (newForm: Partial<RegisterBody>) => {
    setFormRegister((prev) => ({ ...prev, ...newForm }));
  };

  return (
    <RegisterSection
      state={{
        formRegister,
        showPassword,
        isPending: register.isPending,
      }}
      service={{
        handleSubmit,
        onFormChange: handleFormChange,
        setShowPassword,
      }}
    />
  );
}
