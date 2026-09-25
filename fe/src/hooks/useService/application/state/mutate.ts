import { queryKey } from '@/configs/query-key';
import { useAppMutation } from '@/hooks/useService/_shared/useAppMutation';
import Api from '@/services/props.service';
import {
  type ApplicationCacheContext,
  readApplicationSnapshot,
} from '@/utils/cache/application.cache';
import { ResponseTitles } from '@/utils/response-titles';

import type {
  ApplicationParams,
  ApplicationResponse,
  ApproveApplicationBody,
  ApproveApplicationResponse,
  CreateApplicationBody,
  RejectApplicationBody,
  UpdateApplicationBody,
} from '@/types/api/application.types';

export function useCreateApplication() {
  return useAppMutation<
    ApplicationResponse,
    Pick<
      CreateApplicationBody,
      | 'requestedStartDate'
      | 'requestedEndDate'
      | 'motivation'
      | 'coverLetterFileId'
      | 'officeLocationId'
    >,
    ApplicationCacheContext
  >({
    mutationFn: (body) => Api.Application.Create(body),
    invalidateKeys: [queryKey.applicationRoot()],
    errorTitle: ResponseTitles.application.createFailed,
    optimistic: (ns) => ({ previousData: readApplicationSnapshot(ns) }),
  });
}

export function useUpdateApplicationDraft() {
  return useAppMutation<
    ApplicationResponse,
    { params: Pick<ApplicationParams, 'id'>; body: UpdateApplicationBody },
    ApplicationCacheContext
  >({
    mutationFn: ({ params, body }) => Api.Application.UpdateDraft(params, body),
    invalidateKeys: [queryKey.applicationRoot()],
    errorTitle: ResponseTitles.application.updateFailed,
    optimistic: (ns) => ({ previousData: readApplicationSnapshot(ns) }),
  });
}

export function useSubmitApplication() {
  return useAppMutation<
    ApplicationResponse,
    Pick<ApplicationParams, 'id'>,
    ApplicationCacheContext
  >({
    mutationFn: (params) => Api.Application.Submit(params),
    invalidateKeys: [queryKey.applicationRoot()],
    errorTitle: ResponseTitles.application.submitFailed,
    optimistic: (ns) => ({ previousData: readApplicationSnapshot(ns) }),
  });
}

export function useCancelApplication() {
  return useAppMutation<
    ApplicationResponse,
    Pick<ApplicationParams, 'id'>,
    ApplicationCacheContext
  >({
    mutationFn: (params) => Api.Application.Cancel(params),
    invalidateKeys: [queryKey.applicationRoot()],
    errorTitle: ResponseTitles.application.cancelFailed,
    optimistic: (ns) => ({ previousData: readApplicationSnapshot(ns) }),
  });
}

export function useDeleteApplicationDraft() {
  return useAppMutation<null, Pick<ApplicationParams, 'id'>, ApplicationCacheContext>({
    mutationFn: (params) => Api.Application.DeleteDraft(params),
    invalidateKeys: [queryKey.applicationRoot()],
    errorTitle: ResponseTitles.application.deleteFailed,
    optimistic: (ns) => ({ previousData: readApplicationSnapshot(ns) }),
  });
}

export function useApproveApplication() {
  return useAppMutation<
    ApproveApplicationResponse,
    {
      params: Pick<ApplicationParams, 'id'>;
      body: ApproveApplicationBody;
    },
    ApplicationCacheContext
  >({
    mutationFn: ({ params, body }) => Api.Application.Approve(params, body),
    invalidateKeys: [queryKey.applicationRoot(), queryKey.internshipRoot()],
    errorTitle: ResponseTitles.application.approveFailed,
    optimistic: (ns) => ({ previousData: readApplicationSnapshot(ns) }),
  });
}

export function useRejectApplication() {
  return useAppMutation<
    ApplicationResponse,
    { params: Pick<ApplicationParams, 'id'>; body: Pick<RejectApplicationBody, 'reason'> },
    ApplicationCacheContext
  >({
    mutationFn: ({ params, body }) => Api.Application.Reject(params, body),
    invalidateKeys: [queryKey.applicationRoot()],
    errorTitle: ResponseTitles.application.rejectFailed,
    optimistic: (ns) => ({ previousData: readApplicationSnapshot(ns) }),
  });
}
