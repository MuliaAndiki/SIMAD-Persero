import { queryKey } from '@/configs/query-key';
import { useAppMutation } from '@/hooks/useService/_shared/useAppMutation';
import Api from '@/services/props.service';
import type { IUser } from '@/types/api/model.type';
import type {
  CreateReceptionistBody,
  ReceptionistParams,
  UpdateReceptionistBody,
} from '@/types/api/receptionist.types';

export function useCreateReceptionist() {
  return useAppMutation<IUser, CreateReceptionistBody>({
    mutationFn: (body) => Api.Receptionist.Create(body),
    invalidateKeys: [queryKey.receptionistRoot()],
  });
}

export function useUpdateReceptionist() {
  return useAppMutation<
    IUser,
    { params: Pick<ReceptionistParams, 'receptionistId'>; body: UpdateReceptionistBody }
  >({
    mutationFn: ({ params, body }) => Api.Receptionist.Update(params, body),
    invalidateKeys: [queryKey.receptionistRoot()],
  });
}

export function useDeleteReceptionist() {
  return useAppMutation<null, Pick<ReceptionistParams, 'receptionistId'>>({
    mutationFn: (params) => Api.Receptionist.Delete(params),
    invalidateKeys: [queryKey.receptionistRoot()],
  });
}
