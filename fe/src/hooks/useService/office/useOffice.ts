import { useCreateOffice, useDeleteOffice, useUpdateOffice } from './state/mutate';
import { useOfficeDetail, useOfficeList, usePublicOfficeList } from './state/query';

export const useOffice = () => {
  return {
    query: {
      list: useOfficeList,
      publicList: usePublicOfficeList,
      detail: useOfficeDetail,
    },
    mutate: {
      create: useCreateOffice,
      update: useUpdateOffice,
      delete: useDeleteOffice,
    },
  };
};
