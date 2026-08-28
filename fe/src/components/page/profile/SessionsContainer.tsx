'use client';

import { SessionsSection } from '@/components/page/profile/SessionsSection';
import { useProfileLogic } from '@/hooks/useProfileLogic';

/**
 * Container client component untuk halaman Perangkat & Sesi Aktif.
 */
export default function SessionsContainer() {
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
      }}
      service={{
        onRevokeSession: actions.handleRevokeSession,
        onLogoutAll: actions.handleLogoutAll,
      }}
    />
  );
}
