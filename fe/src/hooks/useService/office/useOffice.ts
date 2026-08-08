import { useCreateOffice, useDeleteOffice, useUpdateOffice } from './state/mutate';
import { useOfficeDetail, useOfficeList } from './state/query';

export const useOffice = () => {
  return {
    query: {
      list: useOfficeList,
      detail: useOfficeDetail,
    },
    mutate: {
      create: useCreateOffice,
      update: useUpdateOffice,
      delete: useDeleteOffice,
    },
  };
};
