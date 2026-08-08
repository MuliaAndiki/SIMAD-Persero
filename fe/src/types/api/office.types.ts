/**
 * Tipe payload & respons modul Office (Office Location).
 *
 * Nama field payload disamakan dengan DTO backend (be/src/dtos/office.dto.ts).
 * Bentuk data respons disamakan dengan controller backend
 * (be/src/controllers/OfficeController.ts).
 */

// ---------- Payload (request body / query / path params) ----------

export interface OfficeQuery {
  page?: number;
  limit?: number;
  keyword?: string;
  departmentId?: string;
}

export interface CreateOfficeBody {
  departmentId?: string;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  radiusMeter: number;
}

export interface UpdateOfficeBody {
  departmentId?: string;
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  radiusMeter?: number;
}

export interface OfficeParams {
  officeId: string;
}

// ---------- Response (data dari backend) ----------

/** Data satu lokasi kantor (GET /offices, GET /offices/:officeId). */
export interface OfficeResponse {
  id: string;
  departmentId: string | null;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  radiusMeter: number;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}
