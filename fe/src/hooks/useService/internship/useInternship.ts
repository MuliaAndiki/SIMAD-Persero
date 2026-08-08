import {
  useArchiveInternship,
  useAssignSupervisorInternship,
  useChangeDepartmentInternship,
  useExtendInternship,
  useFinishInternship,
  useStartInternship,
} from './state/mutate';
import { useInternshipDetail, useMyInternship } from './state/query';

export const useInternship = () => {
  return {
    query: {
      my: useMyInternship,
      detail: useInternshipDetail,
    },
    mutate: {
      start: useStartInternship,
      finish: useFinishInternship,
      extend: useExtendInternship,
      assignSupervisor: useAssignSupervisorInternship,
      changeDepartment: useChangeDepartmentInternship,
      archive: useArchiveInternship,
    },
  };
};
