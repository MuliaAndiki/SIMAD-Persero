import { useInstitutionDetail, useInstitutionList } from './state/query';

/**
 * Facade modul Institution — hanya grouping layer, tanpa business logic.
 *
 * Component mengakses endpoint institution melalui:
 *   const api = useApi();
 *   api.institution.query.list();
 */
export const useInstitution = () => {
  return {
    query: {
      list: useInstitutionList,
      detail: useInstitutionDetail,
    },
  };
};
