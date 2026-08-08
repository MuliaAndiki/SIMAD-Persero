import { useCreateDepartment, useDeleteDepartment, useUpdateDepartment } from './state/mutate';
import { useDepartmentDetail, useDepartmentList } from './state/query';

export const useDepartment = () => {
  return {
    query: {
      list: useDepartmentList,
      detail: useDepartmentDetail,
    },
    mutate: {
      create: useCreateDepartment,
      update: useUpdateDepartment,
      delete: useDeleteDepartment,
    },
  };
};
