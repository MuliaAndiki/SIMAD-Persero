'use client';

import type { RegisterFormErrors } from '@/components/organisms/RegisterForm';
import { RegisterSection } from '@/components/page/auth/register/RegisterSection';
import { useAppNameSpace } from '@/hooks/useAppNameSpace';
import { useApi } from '@/hooks/useService/useApi';
import type { RegisterBody } from '@/types/api/auth.types';
import { validatePasswordPolicy } from '@/utils/password-validation';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RegisterContainer() {
  const api = useApi();
  const router = useRouter();
  const ns = useAppNameSpace();

  const [formRegister, setFormRegister] = useState<RegisterBody>({
    fullName: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  const register = api.auth.mutate.register();
  const googleLogin = api.auth.mutate.googleLogin();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const newErrors: RegisterFormErrors = {};

    if (!formRegister.fullName?.trim()) {
      newErrors.fullName = 'Nama lengkap wajib diisi';
    }

    if (!formRegister.email?.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formRegister.email.trim())) {
      newErrors.email = 'Format email tidak valid';
    }

    const passwordError = validatePasswordPolicy(formRegister.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (newErrors.password) {
        ns.alert.toast({
          title: 'Format Password Belum Sesuai',
          message: newErrors.password,
          icon: 'error',
        });
      } else {
        ns.alert.toast({
          title: 'Formulir Belum Lengkap',
          message: newErrors.email || newErrors.fullName || 'Silakan lengkapi data formulir',
          icon: 'error',
        });
      }
      return;
    }

    setErrors({});

    register.mutate(formRegister, {
      onSuccess: () => {
        router.push('/login');
      },
      onError: (err) => {
        const msg = err.message || '';
        if (msg.toLowerCase().includes('password')) {
          setErrors((prev) => ({ ...prev, password: msg }));
        } else if (msg.toLowerCase().includes('email')) {
          setErrors((prev) => ({ ...prev, email: msg }));
        }
      },
    });
  };

  const handleGoogleLogin = (credential: string) => {
    googleLogin.mutate({ credential });
  };

  const handleGoogleError = () => {
    ns.alert.toast({
      title: 'Gagal login dengan Google',
      message: 'Tidak dapat menyelesaikan login dengan Google. Silakan coba lagi.',
      icon: 'error',
    });
  };

  const handleFormChange = (newForm: Partial<RegisterBody>) => {
    setFormRegister((prev) => ({ ...prev, ...newForm }));

    if (newForm.password !== undefined) {
      if (errors.password) {
        const pwdErr = validatePasswordPolicy(newForm.password);
        setErrors((prev) => ({ ...prev, password: pwdErr || undefined }));
      }
    }
    if (newForm.email !== undefined && errors.email) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
    if (newForm.fullName !== undefined && errors.fullName) {
      setErrors((prev) => ({ ...prev, fullName: undefined }));
    }
  };

  return (
    <RegisterSection
      state={{
        formRegister,
        showPassword,
        isPending: register.isPending,
        errors,
      }}
      service={{
        handleSubmit,
        onFormChange: handleFormChange,
        setShowPassword,
        handleGoogleLogin,
        handleGoogleError,
      }}
    />
  );
}
