import { queryKey } from '@/configs/query-key';
import Api from '@/services/props.service';
import type { InstitutionParams } from '@/types/api/institution.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateInstitution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      name: string;
      shortName?: string;
      educationLevelId?: string;
      province?: string;
      city?: string;
      logo?: string;
    }) => {
      const res = await Api.Institution.Create(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey.institutionRoot() });
    },
  });
}

export function useUpdateInstitution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      params,
      body,
    }: {
      params: Pick<InstitutionParams, 'institutionId'>;
      body: {
        name?: string;
        shortName?: string;
        educationLevelId?: string;
        province?: string;
        city?: string;
        logo?: string;
      };
    }) => {
      const res = await Api.Institution.Update(params, body);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey.institutionRoot() });
    },
  });
}

export function useDeleteInstitution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: Pick<InstitutionParams, 'institutionId'>) => {
      const res = await Api.Institution.Delete(params);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey.institutionRoot() });
    },
  });
}
