import { useApplication } from './application/useApplication';
import { useAttendance } from './attendance/useAttendance';
import { useAuditLog } from './auditLog/useAuditLog';
import { useAuth } from './auth/useAuth';
import { useDashboard } from './dashboard/useDashboard';
import { useDepartment } from './department/useDepartment';
import { useFile } from './file/useFile';
import { useInstitution } from './institution/useInstitution';
import { useInternship } from './internship/useInternship';
import { useOffice } from './office/useOffice';
import { useReporting } from './reporting/useReporting';
import { useSupervisor } from './supervisor/useSupervisor';
import { useUser } from './user/useUser';

/**
 * Single entry point seluruh endpoint frontend.
 *
 * Component hanya berinteraksi dengan `useApi()`:
 *   const api = useApi();
 *
 *   const { data } = api.auth.query.me();
 *   const login = api.auth.mutate.login();
 *   const { data } = api.dashboard.query.intern();
 *   const today = api.attendance.query.today();
 *   const checkIn = api.attendance.mutate.checkIn();
 *
 * Modul khusus role (Department/Office/Supervisor/Reporting/AuditLog)
 * dipakai oleh halaman HR_ADMIN & SUPERVISOR.
 */
export function useApi() {
  return {
    auth: useAuth(),
    dashboard: useDashboard(),
    attendance: useAttendance(),
    application: useApplication(),
    department: useDepartment(),
    office: useOffice(),
    supervisor: useSupervisor(),
    reporting: useReporting(),
    auditLog: useAuditLog(),
    file: useFile(),
    institution: useInstitution(),
    internship: useInternship(),
    user: useUser(),
  };
}
