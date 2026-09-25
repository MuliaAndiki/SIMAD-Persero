import {
  useCreateQuota,
  useDeleteQuota,
  useUpdateQuota,
} from './state/mutate';
import {
  useQuotaAvailability,
  useQuotaDetail,
  useQuotaList,
} from './state/query';

export const useQuota = () => {
  return {
    query: {
      list: useQuotaList,
      availability: useQuotaAvailability,
      detail: useQuotaDetail,
    },
    mutate: {
      create: useCreateQuota,
      update: useUpdateQuota,
      delete: useDeleteQuota,
    },
  };
};
