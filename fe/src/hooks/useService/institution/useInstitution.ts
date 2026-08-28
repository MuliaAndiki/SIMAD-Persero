import {
  useCreateInstitution,
  useDeleteInstitution,
  useUpdateInstitution,
} from './state/mutation';
import { useEducationLevelList, useInstitutionDetail, useInstitutionList } from './state/query';

/**
 * Facade modul Institution — grouping layer.
 *
 * Component mengakses endpoint institution melalui:
 *   const api = useApi();
 *   api.institution.query.list();
 *   api.institution.query.educationLevels();
 *   api.institution.mutate.create();
 */
export const useInstitution = () => {
  return {
    query: {
      list: useInstitutionList,
      educationLevels: useEducationLevelList,
      detail: useInstitutionDetail,
    },
    mutate: {
      create: useCreateInstitution,
      update: useUpdateInstitution,
      delete: useDeleteInstitution,
    },
  };
};
