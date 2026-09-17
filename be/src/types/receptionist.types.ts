import type { IDepartment, IUser } from './models.types';

export type ReceptionistQuery = Partial<{
  page: number;
  limit: number;
  officeId: string;
  keyword: string;
}>;

export type ReceptionistResponse = Pick<
  IUser,
  | 'id'
  | 'fullName'
  | 'email'
  | 'isActive'
  | 'avatarFileId'
  | 'createdAt'
  | 'officeId'
  | 'departmentId'
> & {
  department?: Pick<IDepartment, 'id' | 'name' | 'code'> | null;
  officeLocation?: { id: string; name: string } | null;
};

export type CreateReceptionistBody = Pick<IUser, 'fullName' | 'email' | 'officeId'> & {
  password?: string;
  departmentId?: string | null;
};

export type UpdateReceptionistBody = Partial<CreateReceptionistBody> & {
  isActive?: boolean;
};
