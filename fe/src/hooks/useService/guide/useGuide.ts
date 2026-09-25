import {
  useCreateGuide,
  useDeleteGuide,
  useUpdateGuide,
} from './state/mutate';
import {
  useGuideDetail,
  useGuideList,
} from './state/query';

export const useGuide = () => {
  return {
    query: {
      list: useGuideList,
      detail: useGuideDetail,
    },
    mutate: {
      create: useCreateGuide,
      update: useUpdateGuide,
      delete: useDeleteGuide,
    },
  };
};
