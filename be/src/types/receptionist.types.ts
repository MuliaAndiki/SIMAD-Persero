import type { IUser } from './models.types';

export type ReceptionistQuery = Partial<{
  page: number;
  limit: number;
  officeId: string;
  keyword: string;
}>;

export type ReceptionistResponse = Pick<
  IUser,
  'id' | 'fullName' | 'email' | 'isActive' | 'avatarFileId' | 'createdAt' | 'officeId' | 'departmentId'
>;

export type CreateReceptionistBody = Pick<
  IUser,
  'fullName' | 'email' | 'password' | 'departmentId' | 'officeId'
>;

export type UpdateReceptionistBody = Partial<CreateReceptionistBody> & {
  isActive?: boolean;
};
