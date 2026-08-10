import { useApplication } from './application/useApplication';
import { useAttendance } from './attendance/useAttendance';
import { useAuth } from './auth/useAuth';
import { useDashboard } from './dashboard/useDashboard';
import { useFile } from './file/useFile';

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
 */
export function useApi() {
  return {
    auth: useAuth(),
    dashboard: useDashboard(),
    attendance: useAttendance(),
    application: useApplication(),
    file: useFile(),
  };
}
