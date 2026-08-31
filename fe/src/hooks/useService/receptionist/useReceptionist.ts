import {
  useCreateReceptionist,
  useDeleteReceptionist,
  useUpdateReceptionist,
} from './state/mutate';
import { useReceptionistDetail, useReceptionistList } from './state/query';

export const useReceptionist = () => {
  return {
    query: {
      list: useReceptionistList,
      detail: useReceptionistDetail,
    },
    mutate: {
      create: useCreateReceptionist,
      update: useUpdateReceptionist,
      delete: useDeleteReceptionist,
    },
  };
};
