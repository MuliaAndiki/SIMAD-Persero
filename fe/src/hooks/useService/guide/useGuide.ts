import {
  useCreateGuide,
  useDeleteGuide,
  useUpdateGuide,
  useUpdateGuideStatus,
} from './state/mutate';
import { useGuideDetail, useGuideList } from './state/query';

export const useGuide = () => {
  return {
    query: {
      list: useGuideList,
      detail: useGuideDetail,
    },
    mutate: {
      create: useCreateGuide,
      update: useUpdateGuide,
      updateStatus: useUpdateGuideStatus,
      delete: useDeleteGuide,
    },
  };
};
