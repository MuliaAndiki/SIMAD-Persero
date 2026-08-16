import type { TResponse } from "@/api/types/response.types";
import { queryKey } from "@/configs/query-key";
import { useAppNameSpace } from "@/hooks/useAppNameSpace";
import Api from "@/services/props.service";
import {
  type SupervisorCacheContext,
  readSupervisorSnapshot,
} from "@/utils/cache/supervisor.cache";

import type {
  AssignInternBody,
  CreateSupervisorBody,
  SupervisorAssignmentParams,
  SupervisorAssignmentResponse,
  SupervisorParams,
  UpdateSupervisorBody,
} from "@/types/api/supervisor.types";
import type { IUser } from "@/types/api/model.type";
import { useMutation } from "@tanstack/react-query";

export function useAssignIntern() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<SupervisorAssignmentResponse>,
    Error,
    {
      params: Pick<SupervisorParams, "supervisorId">;
      body: Pick<AssignInternBody, "internshipId">;
    },
    SupervisorCacheContext
  >({
    mutationFn: ({
      params,
      body,
    }: {
      params: Pick<SupervisorParams, "supervisorId">;
      body: Pick<AssignInternBody, "internshipId">;
    }) => Api.Supervisor.Assign(params, body),
    onSettled: async () => {
      await ns.queryClient.invalidateQueries({
        queryKey: queryKey.supervisorRoot(),
      });
      await ns.queryClient.invalidateQueries({
        queryKey: queryKey.internshipRoot(),
      });
    },
    onMutate: async () => {
      await ns.queryClient.cancelQueries({
        queryKey: queryKey.supervisorRoot(),
      });
      const previousData = readSupervisorSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.message,
        message: res.message,
        icon: "success",
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: err.message,
        message: err.message,
        icon: "error",
      });
    },
  });
}

export function useCreateSupervisor() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<IUser>,
    Error,
    CreateSupervisorBody,
    SupervisorCacheContext
  >({
    mutationFn: (body: CreateSupervisorBody) => Api.Supervisor.Create(body),
    onSettled: async () => {
      await ns.queryClient.invalidateQueries({
        queryKey: queryKey.supervisorRoot(),
      });
    },
    onMutate: async () => {
      await ns.queryClient.cancelQueries({
        queryKey: queryKey.supervisorRoot(),
      });
      const previousData = readSupervisorSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: "Berhasil",
        message: res.message,
        icon: "success",
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: "Gagal",
        message: err.message,
        icon: "error",
      });
    },
  });
}

export function useUpdateSupervisor() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<IUser>,
    Error,
    {
      params: Pick<SupervisorParams, "supervisorId">;
      body: UpdateSupervisorBody;
    },
    SupervisorCacheContext
  >({
    mutationFn: ({ params, body }) => Api.Supervisor.Update(params, body),
    onSettled: async () => {
      await ns.queryClient.invalidateQueries({
        queryKey: queryKey.supervisorRoot(),
      });
    },
    onMutate: async () => {
      await ns.queryClient.cancelQueries({
        queryKey: queryKey.supervisorRoot(),
      });
      const previousData = readSupervisorSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: "Berhasil",
        message: res.message,
        icon: "success",
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: "Gagal",
        message: err.message,
        icon: "error",
      });
    },
  });
}

export function useDeleteSupervisor() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<null>,
    Error,
    Pick<SupervisorParams, "supervisorId">,
    SupervisorCacheContext
  >({
    mutationFn: (params: Pick<SupervisorParams, "supervisorId">) =>
      Api.Supervisor.Delete(params),
    onSettled: async () => {
      await ns.queryClient.invalidateQueries({
        queryKey: queryKey.supervisorRoot(),
      });
    },
    onMutate: async () => {
      await ns.queryClient.cancelQueries({
        queryKey: queryKey.supervisorRoot(),
      });
      const previousData = readSupervisorSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: "Berhasil",
        message: res.message,
        icon: "success",
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: "Gagal",
        message: err.message,
        icon: "error",
      });
    },
  });
}

export function useRemoveAssignment() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<null>,
    Error,
    Pick<SupervisorAssignmentParams, "supervisorId" | "assignmentId">,
    SupervisorCacheContext
  >({
    mutationFn: (
      params: Pick<SupervisorAssignmentParams, "supervisorId" | "assignmentId">,
    ) => Api.Supervisor.RemoveAssignment(params),
    onSettled: async () => {
      await ns.queryClient.invalidateQueries({
        queryKey: queryKey.supervisorRoot(),
      });
      await ns.queryClient.invalidateQueries({
        queryKey: queryKey.internshipRoot(),
      });
    },
    onMutate: async () => {
      await ns.queryClient.cancelQueries({
        queryKey: queryKey.supervisorRoot(),
      });
      const previousData = readSupervisorSnapshot(ns);
      return { previousData };
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: res.message,
        message: res.message,
        icon: "success",
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: err.message,
        message: err.message,
        icon: "error",
      });
    },
  });
}
