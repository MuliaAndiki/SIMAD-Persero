'use client';

import type { TResponse } from '@/api/types/response.types';
import { type AppNameSpace, useAppNameSpace } from '@/hooks/useAppNameSpace';
import { ResponseTitles } from '@/utils/response-titles';
import {
  type QueryKey,
  type UseMutationOptions,
  type UseMutationResult,
  useMutation,
} from '@tanstack/react-query';

export interface AppMutationConfig<TData, TVariables = void, TContext = unknown> {
  mutationFn: (variables: TVariables) => Promise<TResponse<TData>>;
  invalidateKeys?:
    | QueryKey[]
    | ((
        data: TResponse<TData>,
        variables: TVariables,
        context: TContext | undefined,
      ) => QueryKey[]);
  optimistic?: (ns: AppNameSpace, variables: TVariables) => Promise<TContext> | TContext;
  onSuccess?: (
    data: TResponse<TData>,
    variables: TVariables,
    context: TContext | undefined,
    ns: AppNameSpace,
  ) => Promise<unknown> | unknown;
  onError?: (
    error: Error,
    variables: TVariables,
    context: TContext | undefined,
    ns: AppNameSpace,
  ) => Promise<unknown> | unknown;
  onSettled?: (
    data: TResponse<TData> | undefined,
    error: Error | null,
    variables: TVariables,
    context: TContext | undefined,
    ns: AppNameSpace,
  ) => Promise<unknown> | unknown;
  showSuccessToast?: boolean;
  errorTitle?: string;
  options?: Omit<
    UseMutationOptions<TResponse<TData>, Error, TVariables, TContext>,
    'mutationFn' | 'onMutate' | 'onSuccess' | 'onError' | 'onSettled'
  >;
}

/**
 * useAppMutation — Factory hook untuk standarisasi TanStack Query mutation hooks.
 * Mengeliminasi duplikasi boilerplate (invalidateQueries, cancelQueries, toasts, namespace handling).
 */
export function useAppMutation<TData, TVariables = void, TContext = unknown>(
  config: AppMutationConfig<TData, TVariables, TContext>,
): UseMutationResult<TResponse<TData>, Error, TVariables, TContext> {
  const ns = useAppNameSpace();
  const showSuccessToast = config.showSuccessToast ?? true;

  return useMutation<TResponse<TData>, Error, TVariables, TContext>({
    ...config.options,
    mutationFn: config.mutationFn,
    onMutate: async (variables) => {
      if (config.invalidateKeys) {
        const keys = typeof config.invalidateKeys === 'function' ? [] : config.invalidateKeys;
        for (const key of keys) {
          await ns.queryClient.cancelQueries({ queryKey: key });
        }
      }
      if (config.optimistic) {
        return await config.optimistic(ns, variables);
      }
      return undefined as unknown as TContext;
    },
    onSuccess: async (data, variables, context) => {
      if (showSuccessToast) {
        ns.alert.toast({
          title: data.title,
          message: data.message,
          icon: 'success',
        });
      }
      if (config.onSuccess) {
        await config.onSuccess(data, variables, context, ns);
      }
    },
    onError: async (error, variables, context) => {
      if (config.onError) {
        await config.onError(error, variables, context, ns);
      } else {
        ns.alert.toast({
          title: config.errorTitle ?? ResponseTitles.error,
          message: error.message,
          icon: 'error',
        });
      }
    },
    onSettled: async (data, error, variables, context) => {
      if (config.invalidateKeys) {
        const keys =
          typeof config.invalidateKeys === 'function'
            ? data
              ? config.invalidateKeys(data, variables, context)
              : []
            : config.invalidateKeys;
        for (const key of keys) {
          await ns.queryClient.invalidateQueries({ queryKey: key });
        }
      }
      if (config.onSettled) {
        await config.onSettled(data, error, variables, context, ns);
      }
    },
  });
}
