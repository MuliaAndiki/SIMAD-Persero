/**
 * Tipe payload & respons modul Institution.
 *
 * Bentuk data disamakan dengan respons backend
 * (be/src/controllers/InstitutionController.ts).
 */

import type { IInstitution } from "./model.type";

// ---------- Payload (query / path params) ----------

export interface InstitutionParams {
  institutionId: string;
}

export interface InstitutionQuery {
  page?: number;
  limit?: number;
  keyword?: string;
}

// ---------- Response (data dari backend) ----------

export interface InstitutionResponse
  extends
    Partial<
      Pick<
        IInstitution,
        "educationLevelId" | "name" | "shortName" | "province" | "city"
      >
    >,
    Pick<IInstitution, "id"> {}
