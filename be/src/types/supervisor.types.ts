/**
 * Types modul Supervisor.
 * Diturunkan dari base model (models.types.ts) memakai Utility Types.
 */
import type {
  IDepartment,
  IInternProfile,
  IInternship,
  ISupervisorAssignment,
  IUser,
} from './models.types';

export type SupervisorQuery = Partial<{
  page: number;
  limit: number;
}>;

export type AssignInternBody = {
  internshipId: IInternship['id'];
};

export type SupervisorResponse = Pick<
  IUser,
  'id' | 'fullName' | 'email' | 'isActive' | 'avatarFileId' | 'createdAt'
> & {
  activeAssignmentsCount: number;
};

export type SupervisorAssignmentResponse = {
  id: ISupervisorAssignment['id'];
  internshipId: ISupervisorAssignment['internshipId'];
  supervisorId: ISupervisorAssignment['supervisorId'];
  assignedById: ISupervisorAssignment['assignedById'];
  assignedAt: ISupervisorAssignment['assignedAt'];
  endedAt: ISupervisorAssignment['endedAt'];
  isActive: ISupervisorAssignment['isActive'];
  internship: {
    id: IInternship['id'];
    status: IInternship['status'];
    actualStartDate: IInternship['actualStartDate'];
    actualEndDate: IInternship['actualEndDate'];
    intern: {
      id: IUser['id'];
      fullName: IUser['fullName'];
      email: IUser['email'];
      studentNumber: IInternProfile['studentNumber'] | null;
    } | null;
    department: Pick<IDepartment, 'id' | 'name'> | null;
  } | null;
};

export type SupervisorDetailResponse = SupervisorResponse & {
  assignments: SupervisorAssignmentResponse[];
};

export type SupervisorDashboardResponse = {
  totalAssignments: number;
  activeAssignments: number;
  activeInternships: number;
  todayAttendance: number;
  totalInterns: number;
  recentAssignments: SupervisorAssignmentResponse[];
};
