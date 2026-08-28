/**
 * Tipe payload & respons modul Institution.
 *
 * Bentuk data disamakan dengan respons backend
 * (be/src/controllers/InstitutionController.ts).
 */

import type { IInstitution } from './model.type';

// ---------- Payload (query / path params) ----------

export interface InstitutionParams {
  institutionId: string;
}

export interface InstitutionQuery {
  page?: number;
  limit?: number;
  keyword?: string;
  educationLevelId?: string;
}

// ---------- Response (data dari backend) ----------

export interface EducationLevelResponse {
  id: string;
  code: string | null;
  name: string | null;
}

export interface InstitutionResponse
  extends Partial<
      Pick<IInstitution, 'educationLevelId' | 'name' | 'shortName' | 'province' | 'city' | 'logo'>
    >,
    Pick<IInstitution, 'id'> {
  educationLevel?: EducationLevelResponse | null;
}
