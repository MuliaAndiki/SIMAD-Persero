"use client";

import { SessionsSection } from "@/components/page/profile/SessionsSection";
import { useAppNameSpace } from "@/hooks/useAppNameSpace";
import { useProfileLogic } from "@/hooks/useProfileLogic";

/**
 * Container client component untuk halaman Perangkat & Sesi Aktif.
 */
export default function SessionsContainer() {
  const ns = useAppNameSpace();
  const { profile, sessions, isRevokingSession, actions } = useProfileLogic();

  return (
    <SessionsSection
      state={{
        isPending: sessions.isPending || profile.isPending,
        isError: sessions.isError,
        errorMessage: sessions.error?.message,
        sessions: sessions.data ?? [],
        isRevoking: isRevokingSession,
        role: profile.data?.role,
        ns: ns.alert,
      }}
      service={{
        onRevokeSession: actions.handleRevokeSession,
        onLogoutAll: actions.handleLogoutAll,
        onDeleteAccount: actions.handleDeleteAccount,
      }}
    />
  );
}
