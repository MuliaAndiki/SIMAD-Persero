import type { TResponse } from '@/api/types/response.types';
import { queryKey } from '@/configs/query-key';
import { useAppNameSpace } from '@/hooks/useAppNameSpace';
import Api from '@/services/props.service';
import {
  type ApplicationCacheContext,
  readApplicationSnapshot,
} from '@/utils/cache/application.cache';

import type {
  ApplicationParams,
  ApplicationResponse,
  ApproveApplicationBody,
  ApproveApplicationResponse,
  CreateApplicationBody,
  RejectApplicationBody,
  UpdateApplicationBody,
} from '@/types/api/application.types';
import { useMutation } from '@tanstack/react-query';

export function useCreateApplication() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<ApplicationResponse>,
    Error,
    Pick<
      CreateApplicationBody,
      'requestedStartDate' | 'requestedEndDate' | 'motivation' | 'coverLetterFileId'
    >,
    ApplicationCacheContext
  >({
    mutationFn: (
      body: Pick<
        CreateApplicationBody,
        'requestedStartDate' | 'requestedEndDate' | 'motivation' | 'coverLetterFileId'
      >,
    ) => Api.Application.Create(body),
    onSettled: async () => {
      await ns.queryClient.invalidateQueries({
        queryKey: queryKey.applicationRoot(),
      });
    },
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.applicationRoot() });
      const previousData = readApplicationSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.message,
        message: res.message,
        icon: 'success',
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: err.message,
        message: err.message,
        icon: 'error',
      });
    },
  });
}

export function useUpdateApplicationDraft() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<ApplicationResponse>,
    Error,
    { params: Pick<ApplicationParams, 'id'>; body: UpdateApplicationBody },
    ApplicationCacheContext
  >({
    mutationFn: ({
      params,
      body,
    }: {
      params: Pick<ApplicationParams, 'id'>;
      body: UpdateApplicationBody;
    }) => Api.Application.UpdateDraft(params, body),
    onSettled: async () => {
      await ns.queryClient.invalidateQueries({
        queryKey: queryKey.applicationRoot(),
      });
    },
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.applicationRoot() });
      const previousData = readApplicationSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.message,
        message: res.message,
        icon: 'success',
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: err.message,
        message: err.message,
        icon: 'error',
      });
    },
  });
}

export function useSubmitApplication() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<ApplicationResponse>,
    Error,
    Pick<ApplicationParams, 'id'>,
    ApplicationCacheContext
  >({
    mutationFn: (params: Pick<ApplicationParams, 'id'>) => Api.Application.Submit(params),
    onSettled: async () => {
      await ns.queryClient.invalidateQueries({
        queryKey: queryKey.applicationRoot(),
      });
    },
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.applicationRoot() });
      const previousData = readApplicationSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.message,
        message: res.message,
        icon: 'success',
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: err.message,
        message: err.message,
        icon: 'error',
      });
    },
  });
}

export function useCancelApplication() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<ApplicationResponse>,
    Error,
    Pick<ApplicationParams, 'id'>,
    ApplicationCacheContext
  >({
    mutationFn: (params: Pick<ApplicationParams, 'id'>) => Api.Application.Cancel(params),
    onSettled: async () => {
      await ns.queryClient.invalidateQueries({
        queryKey: queryKey.applicationRoot(),
      });
    },
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.applicationRoot() });
      const previousData = readApplicationSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.message,
        message: res.message,
        icon: 'success',
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: err.message,
        message: err.message,
        icon: 'error',
      });
    },
  });
}

export function useDeleteApplicationDraft() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<null>,
    Error,
    Pick<ApplicationParams, 'id'>,
    ApplicationCacheContext
  >({
    mutationFn: (params: Pick<ApplicationParams, 'id'>) => Api.Application.DeleteDraft(params),
    onSettled: async () => {
      await ns.queryClient.invalidateQueries({
        queryKey: queryKey.applicationRoot(),
      });
    },
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.applicationRoot() });
      const previousData = readApplicationSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.message,
        message: res.message,
        icon: 'success',
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: err.message,
        message: err.message,
        icon: 'error',
      });
    },
  });
}

export function useApproveApplication() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<ApproveApplicationResponse>,
    Error,
    {
      params: Pick<ApplicationParams, 'id'>;
      body: Pick<
        ApproveApplicationBody,
        'departmentId' | 'officeLocationId' | 'supervisorId' | 'notes'
      >;
    },
    ApplicationCacheContext
  >({
    mutationFn: ({
      params,
      body,
    }: {
      params: Pick<ApplicationParams, 'id'>;
      body: Pick<
        ApproveApplicationBody,
        'departmentId' | 'officeLocationId' | 'supervisorId' | 'notes'
      >;
    }) => Api.Application.Approve(params, body),
    onSettled: async () => {
      await ns.queryClient.invalidateQueries({
        queryKey: queryKey.applicationRoot(),
      });
      await ns.queryClient.invalidateQueries({
        queryKey: queryKey.internshipRoot(),
      });
    },
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.applicationRoot() });
      const previousData = readApplicationSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.message,
        message: res.message,
        icon: 'success',
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: err.message,
        message: err.message,
        icon: 'error',
      });
    },
  });
}

export function useRejectApplication() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<ApplicationResponse>,
    Error,
    { params: Pick<ApplicationParams, 'id'>; body: Pick<RejectApplicationBody, 'reason'> },
    ApplicationCacheContext
  >({
    mutationFn: ({
      params,
      body,
    }: {
      params: Pick<ApplicationParams, 'id'>;
      body: Pick<RejectApplicationBody, 'reason'>;
    }) => Api.Application.Reject(params, body),
    onSettled: async () => {
      await ns.queryClient.invalidateQueries({
        queryKey: queryKey.applicationRoot(),
      });
    },
    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.applicationRoot() });
      const previousData = readApplicationSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.message,
        message: res.message,
        icon: 'success',
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: err.message,
        message: err.message,
        icon: 'error',
      });
    },
  });
}
