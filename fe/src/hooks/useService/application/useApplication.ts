import {
  useApproveApplication,
  useCancelApplication,
  useCreateApplication,
  useDeleteApplicationDraft,
  useRejectApplication,
  useSubmitApplication,
  useUpdateApplicationDraft,
} from './state/mutate';
import { useApplicationDetail, useApplicationList, useMyApplications } from './state/query';

export const useApplication = () => {
  return {
    query: {
      my: useMyApplications,
      list: useApplicationList,
      detail: useApplicationDetail,
    },
    mutate: {
      create: useCreateApplication,
      updateDraft: useUpdateApplicationDraft,
      submit: useSubmitApplication,
      cancel: useCancelApplication,
      deleteDraft: useDeleteApplicationDraft,
      approve: useApproveApplication,
      reject: useRejectApplication,
    },
  };
};
