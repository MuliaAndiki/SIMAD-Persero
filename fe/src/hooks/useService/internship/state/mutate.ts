import type { TResponse } from '@/api/types/response.types';
import { queryKey } from '@/configs/query-key';
import { useAppNameSpace } from '@/hooks/useAppNameSpace';
import Api from '@/services/props.service';
import {
  type InternshipCacheContext,
  readInternshipSnapshot,
} from '@/utils/cache/internship.cache';

import type {
  AddSkillBody,
  AddSkillResponse,
  AssignSupervisorBody,
  ChangeDepartmentBody,
  CreateInternProfileResponse,
  ExtendInternshipBody,
  InternshipParams,
  InternshipResponse,
  PickMergeInternship,
  RemoveSkillParams,
  RemoveSkillResponse,
} from '@/types/api/internship.types';
import { useMutation } from '@tanstack/react-query';

export function useStartInternship() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<InternshipResponse>,
    Error,
    Pick<InternshipParams, 'id'>,
    InternshipCacheContext
  >({
    mutationFn: (params: Pick<InternshipParams, 'id'>) => Api.Internship.Start(params),
    onSettled: async () => {
      await ns.queryClient.invalidateQueries({
        queryKey: queryKey.internshipRoot(),
      });
    },
    onMutate: async () => {
      await ns.queryClient.cancelQueries({
        queryKey: queryKey.internshipRoot(),
      });
      const previousData = readInternshipSnapshot(ns);
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

export function useFinishInternship() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<InternshipResponse>,
    Error,
    Pick<InternshipParams, 'id'>,
    InternshipCacheContext
  >({
    mutationFn: (params: Pick<InternshipParams, 'id'>) => Api.Internship.Finish(params),
    onSettled: async () => {
      await ns.queryClient.invalidateQueries({
        queryKey: queryKey.internshipRoot(),
      });
    },
    onMutate: async () => {
      await ns.queryClient.cancelQueries({
        queryKey: queryKey.internshipRoot(),
      });
      const previousData = readInternshipSnapshot(ns);
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

export function useExtendInternship() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<InternshipResponse>,
    Error,
    {
      params: Pick<InternshipParams, 'id'>;
      body: Pick<ExtendInternshipBody, 'newEndDate' | 'reason'>;
    },
    InternshipCacheContext
  >({
    mutationFn: ({
      params,
      body,
    }: {
      params: Pick<InternshipParams, 'id'>;
      body: Pick<ExtendInternshipBody, 'newEndDate' | 'reason'>;
    }) => Api.Internship.Extend(params, body),
    onSettled: async () => {
      await ns.queryClient.invalidateQueries({
        queryKey: queryKey.internshipRoot(),
      });
    },
    onMutate: async () => {
      await ns.queryClient.cancelQueries({
        queryKey: queryKey.internshipRoot(),
      });
      const previousData = readInternshipSnapshot(ns);
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

export function useAssignSupervisorInternship() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<InternshipResponse>,
    Error,
    {
      params: Pick<InternshipParams, 'id'>;
      body: Pick<AssignSupervisorBody, 'supervisorId'>;
    },
    InternshipCacheContext
  >({
    mutationFn: ({
      params,
      body,
    }: {
      params: Pick<InternshipParams, 'id'>;
      body: Pick<AssignSupervisorBody, 'supervisorId'>;
    }) => Api.Internship.AssignSupervisor(params, body),
    onSettled: async () => {
      await ns.queryClient.invalidateQueries({
        queryKey: queryKey.internshipRoot(),
      });
    },
    onMutate: async () => {
      await ns.queryClient.cancelQueries({
        queryKey: queryKey.internshipRoot(),
      });
      const previousData = readInternshipSnapshot(ns);
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

export function useChangeDepartmentInternship() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<InternshipResponse>,
    Error,
    {
      params: Pick<InternshipParams, 'id'>;
      body: Pick<ChangeDepartmentBody, 'departmentId' | 'officeLocationId'>;
    },
    InternshipCacheContext
  >({
    mutationFn: ({
      params,
      body,
    }: {
      params: Pick<InternshipParams, 'id'>;
      body: Pick<ChangeDepartmentBody, 'departmentId' | 'officeLocationId'>;
    }) => Api.Internship.ChangeDepartment(params, body),
    onSettled: async () => {
      await ns.queryClient.invalidateQueries({
        queryKey: queryKey.internshipRoot(),
      });
    },
    onMutate: async () => {
      await ns.queryClient.cancelQueries({
        queryKey: queryKey.internshipRoot(),
      });
      const previousData = readInternshipSnapshot(ns);
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

export function useArchiveInternship() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<InternshipResponse>,
    Error,
    Pick<InternshipParams, 'id'>,
    InternshipCacheContext
  >({
    mutationFn: (params: Pick<InternshipParams, 'id'>) => Api.Internship.Archive(params),
    onSettled: async () => {
      await ns.queryClient.invalidateQueries({
        queryKey: queryKey.internshipRoot(),
      });
    },
    onMutate: async () => {
      await ns.queryClient.cancelQueries({
        queryKey: queryKey.internshipRoot(),
      });
      const previousData = readInternshipSnapshot(ns);
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

export function useCreateInternProfile() {
  const ns = useAppNameSpace();
  return useMutation<TResponse<CreateInternProfileResponse>, Error, PickMergeInternship>({
    mutationFn: (payload) => Api.Internship.CreateProfile(payload),
    onSettled: async () => {
      await ns.queryClient.invalidateQueries({
        queryKey: queryKey.internshipRoot(),
      });
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

export function useAddSkillToIntern() {
  const ns = useAppNameSpace();
  return useMutation<TResponse<AddSkillResponse>, Error, AddSkillBody>({
    mutationFn: (body: AddSkillBody) => Api.Internship.AddSkill(body),
    onSettled: async () => {
      await ns.queryClient.invalidateQueries({
        queryKey: queryKey.internshipRoot(),
      });
      await ns.queryClient.invalidateQueries({
        queryKey: queryKey.internship.profile(),
      });
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

export function useRemoveSkillFromIntern() {
  const ns = useAppNameSpace();
  return useMutation<TResponse<RemoveSkillResponse>, Error, RemoveSkillParams>({
    mutationFn: (params: RemoveSkillParams) => Api.Internship.RemoveSkill(params),
    onSettled: async () => {
      await ns.queryClient.invalidateQueries({
        queryKey: queryKey.internshipRoot(),
      });
      await ns.queryClient.invalidateQueries({
        queryKey: queryKey.internship.profile(),
      });
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
