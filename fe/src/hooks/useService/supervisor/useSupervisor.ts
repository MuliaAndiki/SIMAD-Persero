import {
  useAssignIntern,
  useCreateSupervisor,
  useDeleteSupervisor,
  useRemoveAssignment,
  useUpdateSupervisor,
} from "./state/mutate";
import {
  useSupervisorDashboard,
  useSupervisorDetail,
  useSupervisorList,
} from "./state/query";

export const useSupervisor = () => {
  return {
    query: {
      dashboard: useSupervisorDashboard,
      list: useSupervisorList,
      detail: useSupervisorDetail,
    },
    mutate: {
      assign: useAssignIntern,
      removeAssignment: useRemoveAssignment,
      create: useCreateSupervisor,
      update: useUpdateSupervisor,
      delete: useDeleteSupervisor,
    },
  };
};
