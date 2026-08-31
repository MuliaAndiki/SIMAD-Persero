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
    'id' | 'fullName' | 'email' | 'isActive' | 'avatarFileId' | 'createdAt' | 'officeId' | 'departmentId'
  > {}

export interface CreateReceptionistBody {
  fullName: string;
  email: string;
  departmentId: string;
  officeId: string;
  password?: string;
}

export type UpdateReceptionistBody = Partial<CreateReceptionistBody> & {
  isActive?: boolean;
};

export interface ReceptionistParams {
  receptionistId: string;
}
