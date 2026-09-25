import { queryKey } from '@/configs/query-key';
import { useAppMutation } from '@/hooks/useService/_shared/useAppMutation';
import Api from '@/services/props.service';
import type { InstitutionParams, InstitutionResponse } from '@/types/api/institution.types';

export function useCreateInstitution() {
  return useAppMutation<
    InstitutionResponse,
    {
      name: string;
      shortName?: string;
      educationLevelId?: string;
      province?: string;
      city?: string;
      logo?: string;
    }
  >({
    mutationFn: (payload) => Api.Institution.Create(payload),
    invalidateKeys: [queryKey.institutionRoot()],
  });
}

export function useUpdateInstitution() {
  return useAppMutation<
    InstitutionResponse,
    {
      params: Pick<InstitutionParams, 'institutionId'>;
      body: {
        name?: string;
        shortName?: string;
        educationLevelId?: string;
        province?: string;
        city?: string;
        logo?: string;
      };
    }
  >({
    mutationFn: ({ params, body }) => Api.Institution.Update(params, body),
    invalidateKeys: [queryKey.institutionRoot()],
  });
}

export function useDeleteInstitution() {
  return useAppMutation<null, Pick<InstitutionParams, 'institutionId'>>({
    mutationFn: (params) => Api.Institution.Delete(params),
    invalidateKeys: [queryKey.institutionRoot()],
  });
}
