"use client";

import { LoginSection } from "@/components/page/auth/login/LoginSection";
import { useApi } from "@/hooks/useService/useApi";
import type { LoginBody } from "@/types/api/auth.types";
import { useState } from "react";

export default function LoginContainer() {
  const api = useApi();

  const [formLogin, setFormLogin] = useState<LoginBody>({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const login = api.auth.mutate.login();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    // Redirect setelah login ditangani di hook `useLogin` (berdasarkan role akun)
    // sehingga pengecekan role terpusat di satu tempat.
    login.mutate(formLogin);
  };

  const handleFormChange = (newForm: Partial<LoginBody>) => {
    setFormLogin((prev) => ({ ...prev, ...newForm }));
  };

  return (
    <LoginSection
      state={{
        formLogin,
        showPassword,
        isPending: login.isPending,
      }}
      service={{
        handleSubmit,
        onFormChange: handleFormChange,
        setShowPassword,
      }}
    />
  );
}
