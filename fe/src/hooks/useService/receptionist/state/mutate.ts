import type { TResponse } from '@/api/types/response.types';
import { queryKey } from '@/configs/query-key';
import { useAppNameSpace } from '@/hooks/useAppNameSpace';
import Api from '@/services/props.service';
import type { IUser } from '@/types/api/model.type';
import type {
  CreateReceptionistBody,
  ReceptionistParams,
  UpdateReceptionistBody,
} from '@/types/api/receptionist.types';
import { useMutation } from '@tanstack/react-query';

export function useCreateReceptionist() {
  const ns = useAppNameSpace();
  return useMutation<TResponse<IUser>, Error, CreateReceptionistBody>({
    mutationFn: (body: CreateReceptionistBody) => Api.Receptionist.Create(body),
    onSettled: async () => {
      await ns.queryClient.invalidateQueries({
        queryKey: queryKey.receptionistRoot(),
      });
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: 'Berhasil',
        message: res.message,
        icon: 'success',
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: 'Gagal',
        message: err.message,
        icon: 'error',
      });
    },
  });
}

export function useUpdateReceptionist() {
  const ns = useAppNameSpace();
  return useMutation<
    TResponse<IUser>,
    Error,
    { params: Pick<ReceptionistParams, 'receptionistId'>; body: UpdateReceptionistBody }
  >({
    mutationFn: ({ params, body }) => Api.Receptionist.Update(params, body),
    onSettled: async () => {
      await ns.queryClient.invalidateQueries({
        queryKey: queryKey.receptionistRoot(),
      });
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: 'Berhasil',
        message: res.message,
        icon: 'success',
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: 'Gagal',
        message: err.message,
        icon: 'error',
      });
    },
  });
}

export function useDeleteReceptionist() {
  const ns = useAppNameSpace();
  return useMutation<TResponse<null>, Error, Pick<ReceptionistParams, 'receptionistId'>>({
    mutationFn: (params) => Api.Receptionist.Delete(params),
    onSettled: async () => {
      await ns.queryClient.invalidateQueries({
        queryKey: queryKey.receptionistRoot(),
      });
    },
    onSuccess: (res) => {
      ns.alert.toast({
        title: 'Berhasil',
        message: res.message,
        icon: 'success',
      });
    },
    onError: (err) => {
      ns.alert.toast({
        title: 'Gagal',
        message: err.message,
        icon: 'error',
      });
    },
  });
}
