/**
 * Types modul Institution.
 * Menjaga kontrak data antara controller, service, dan routes.
 * Diturunkan dari base model `IInstitution` (models.types.ts) memakai Utility Types.
 */
import type { IInstitution } from './models.types';

export type InstitutionQuery = Partial<{
  page: number;
  limit: number;
  keyword: string;
}>;

export type InstitutionParams = {
  institutionId: IInstitution['id'];
};
