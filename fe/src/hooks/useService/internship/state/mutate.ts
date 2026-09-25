import { queryKey } from '@/configs/query-key';
import { useAppMutation } from '@/hooks/useService/_shared/useAppMutation';
import Api from '@/services/props.service';
import type {
  AddSkillBody,
  AddSkillResponse,
  AssignSupervisorBody,
  ChangeDepartmentBody,
  CreateInternProfileResponse,
  CreateSkillBody,
  ExtendInternshipBody,
  InternshipParams,
  InternshipResponse,
  PickMergeInternship,
  RemoveSkillParams,
  RemoveSkillResponse,
  SkillResponse,
  UpdateSkillBody,
} from '@/types/api/internship.types';
import {
  type InternshipCacheContext,
  readInternshipSnapshot,
} from '@/utils/cache/internship.cache';

export function useStartInternship() {
  return useAppMutation<InternshipResponse, Pick<InternshipParams, 'id'>, InternshipCacheContext>({
    mutationFn: (params) => Api.Internship.Start(params),
    invalidateKeys: [queryKey.internshipRoot()],
    optimistic: (ns) => ({ previousData: readInternshipSnapshot(ns) }),
  });
}

export function useFinishInternship() {
  return useAppMutation<InternshipResponse, Pick<InternshipParams, 'id'>, InternshipCacheContext>({
    mutationFn: (params) => Api.Internship.Finish(params),
    invalidateKeys: [queryKey.internshipRoot()],
    optimistic: (ns) => ({ previousData: readInternshipSnapshot(ns) }),
  });
}

export function useExtendInternship() {
  return useAppMutation<
    InternshipResponse,
    {
      params: Pick<InternshipParams, 'id'>;
      body: Pick<ExtendInternshipBody, 'newEndDate' | 'reason'>;
    },
    InternshipCacheContext
  >({
    mutationFn: ({ params, body }) => Api.Internship.Extend(params, body),
    invalidateKeys: [
      queryKey.internshipRoot(),
      queryKey.attendanceRoot(),
      queryKey.certificateRoot(),
      queryKey.reportingRoot(),
    ],
    optimistic: (ns) => ({ previousData: readInternshipSnapshot(ns) }),
  });
}

export function useAssignSupervisorInternship() {
  return useAppMutation<
    InternshipResponse,
    {
      params: Pick<InternshipParams, 'id'>;
      body: Pick<AssignSupervisorBody, 'supervisorId'>;
    },
    InternshipCacheContext
  >({
    mutationFn: ({ params, body }) => Api.Internship.AssignSupervisor(params, body),
    invalidateKeys: [queryKey.internshipRoot()],
    optimistic: (ns) => ({ previousData: readInternshipSnapshot(ns) }),
  });
}

export function useChangeDepartmentInternship() {
  return useAppMutation<
    InternshipResponse,
    {
      params: Pick<InternshipParams, 'id'>;
      body: Pick<ChangeDepartmentBody, 'departmentId' | 'officeLocationId'>;
    },
    InternshipCacheContext
  >({
    mutationFn: ({ params, body }) => Api.Internship.ChangeDepartment(params, body),
    invalidateKeys: [queryKey.internshipRoot()],
    optimistic: (ns) => ({ previousData: readInternshipSnapshot(ns) }),
  });
}

export function useArchiveInternship() {
  return useAppMutation<InternshipResponse, Pick<InternshipParams, 'id'>, InternshipCacheContext>({
    mutationFn: (params) => Api.Internship.Archive(params),
    invalidateKeys: [queryKey.internshipRoot()],
    optimistic: (ns) => ({ previousData: readInternshipSnapshot(ns) }),
  });
}

export function useCreateInternProfile() {
  return useAppMutation<CreateInternProfileResponse, PickMergeInternship>({
    mutationFn: (payload) => Api.Internship.CreateProfile(payload),
    invalidateKeys: [queryKey.internshipRoot()],
    showSuccessToast: false,
    onSuccess: (res, _, __, ns) => {
      ns.alert.toast({
        title: res.title,
        message: res.message,
        icon: 'success',
        onVoid: () => {
          ns.router.replace('/intern/profile');
        },
      });
    },
  });
}

export function useAddSkillToIntern() {
  return useAppMutation<AddSkillResponse, AddSkillBody>({
    mutationFn: (body) => Api.Internship.AddSkill(body),
    invalidateKeys: [queryKey.internshipRoot(), queryKey.internship.profile()],
  });
}

export function useCreateSkill() {
  return useAppMutation<SkillResponse, CreateSkillBody>({
    mutationFn: (body) => Api.Internship.CreateSkill(body),
    invalidateKeys: [queryKey.internship.skills({})],
  });
}

export function useUpdateSkill() {
  return useAppMutation<SkillResponse, { params: { id: string }; body: UpdateSkillBody }>({
    mutationFn: ({ params, body }) => Api.Internship.UpdateSkill(params, body),
    invalidateKeys: [queryKey.internship.skills({})],
  });
}

export function useDeleteSkill() {
  return useAppMutation<null, { id: string }>({
    mutationFn: ({ id }) => Api.Internship.DeleteSkill({ id }),
    invalidateKeys: [queryKey.internship.skills({})],
  });
}

export function useRemoveSkillFromIntern() {
  return useAppMutation<RemoveSkillResponse, RemoveSkillParams>({
    mutationFn: (params) => Api.Internship.RemoveSkill(params),
    invalidateKeys: [queryKey.internshipRoot(), queryKey.internship.profile()],
  });
}
