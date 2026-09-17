import type { IUser } from './model.type';

export interface ReceptionistQuery {
  page?: number;
  limit?: number;
  keyword?: string;
  officeId?: string;
}

export interface ReceptionistResponse
  extends Pick<
    IUser,
    | 'id'
    | 'fullName'
    | 'email'
    | 'isActive'
    | 'avatarFileId'
    | 'createdAt'
    | 'officeId'
    | 'departmentId'
  > {
  department?: { id: string; name: string; code?: string } | null;
  officeLocation?: { id: string; name: string } | null;
}

export interface CreateReceptionistBody {
  fullName: string;
  email: string;
  officeId: string;
  departmentId?: string;
  password?: string;
}

export type UpdateReceptionistBody = Partial<CreateReceptionistBody> & {
  isActive?: boolean;
};

export interface ReceptionistParams {
  receptionistId: string;
}
