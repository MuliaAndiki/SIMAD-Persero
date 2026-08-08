'use client';

import { useAlert } from '@/hooks/useAlert/costum-alert';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

export type AppNameSpace = {
  queryClient: ReturnType<typeof useQueryClient>;
  alert: ReturnType<typeof useAlert>;
  router: ReturnType<typeof useRouter>;
};

export function useAppNameSpace(): AppNameSpace {
  const queryClient = useQueryClient();
  const alert = useAlert();
  const router = useRouter();

  return { queryClient, alert, router };
}
