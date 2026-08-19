'use client';

import { LoginSection } from '@/components/page/auth/login/LoginSection';
import { useAppNameSpace } from '@/hooks/useAppNameSpace';
import { useApi } from '@/hooks/useService/useApi';
import type { LoginBody } from '@/types/api/auth.types';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useState } from 'react';

export default function LoginContainer() {
  const api = useApi();
  const ns = useAppNameSpace();

  const [formLogin, setFormLogin] = useState<LoginBody>({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  const login = api.auth.mutate.login();
  const googleLogin = api.auth.mutate.googleLogin();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    login.mutate(formLogin);
  };

  const handleFormChange = (newForm: Partial<LoginBody>) => {
    setFormLogin((prev) => ({ ...prev, ...newForm }));
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

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ''}>
      <LoginSection
        state={{
          formLogin,
          showPassword,
          isPending: login.isPending || googleLogin.isPending,
        }}
        service={{
          handleSubmit,
          onFormChange: handleFormChange,
          setShowPassword,
          handleGoogleLogin,
          handleGoogleError,
        }}
      />
    </GoogleOAuthProvider>
  );
}
