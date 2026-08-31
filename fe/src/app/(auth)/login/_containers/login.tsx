"use client";

import { LoginSection } from "@/components/page/auth/login/LoginSection";
import { useAppNameSpace } from "@/hooks/useAppNameSpace";
import { useApi } from "@/hooks/useService/useApi";
import type { LoginBody, RememberedAccount } from "@/types/api/auth.types";

import { useEffect, useState } from "react";

const LAST_ACCOUNT_KEY = "simad_remembered_account";
const LAST_EMAIL_KEY = "simad_last_email";

export default function LoginContainer() {
  const api = useApi();
  const ns = useAppNameSpace();

  const [formLogin, setFormLogin] = useState<LoginBody>({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberedAccount, setRememberedAccount] =
    useState<RememberedAccount | null>(null);

  useEffect(() => {
    try {
      const rawAccount = localStorage.getItem(LAST_ACCOUNT_KEY);
      if (rawAccount) {
        const parsed: RememberedAccount = JSON.parse(rawAccount);
        if (parsed?.email) {
          setFormLogin((prev) => ({ ...prev, email: parsed.email }));
          setRememberedAccount(parsed);
          return;
        }
      }

      const savedEmail = localStorage.getItem(LAST_EMAIL_KEY);
      if (savedEmail) {
        setFormLogin((prev) => ({ ...prev, email: savedEmail }));
        setRememberedAccount({ email: savedEmail });
      }
    } catch {}
  }, []);

  const login = api.auth.mutate.login();
  const googleLogin = api.auth.mutate.googleLogin();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (formLogin.email) {
      try {
        const isSameEmail = formLogin.email === rememberedAccount?.email;
        const currentAccount: RememberedAccount = {
          email: formLogin.email,
          fullName: isSameEmail ? rememberedAccount?.fullName : undefined,
          avatarUrl: isSameEmail ? rememberedAccount?.avatarUrl : undefined,
        };
        localStorage.setItem(LAST_ACCOUNT_KEY, JSON.stringify(currentAccount));
        localStorage.setItem(LAST_EMAIL_KEY, formLogin.email);
      } catch {}
    }
    login.mutate(formLogin);
  };

  const handleFormChange = (newForm: Partial<LoginBody>) => {
    setFormLogin((prev) => ({ ...prev, ...newForm }));
  };

  const handleClearSavedEmail = () => {
    try {
      localStorage.removeItem(LAST_ACCOUNT_KEY);
      localStorage.removeItem(LAST_EMAIL_KEY);
    } catch {}
    setFormLogin((prev) => ({ ...prev, email: "", password: "" }));
    setRememberedAccount(null);
  };

  const handleGoogleLogin = (credential: string) => {
    googleLogin.mutate({ credential });
  };

  const handleGoogleError = () => {
    ns.alert.toast({
      title: "Gagal login dengan Google",
      message:
        "Tidak dapat menyelesaikan login dengan Google. Silakan coba lagi.",
      icon: "error",
    });
  };

  return (
    <LoginSection
      state={{
        formLogin,
        showPassword,
        isPending: login.isPending || googleLogin.isPending,
        rememberedAccount,
      }}
      service={{
        handleSubmit,
        onFormChange: handleFormChange,
        onClearSavedEmail: handleClearSavedEmail,
        setShowPassword,
        handleGoogleLogin,
        handleGoogleError,
      }}
    />
  );
}
