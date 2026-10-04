import type { Metadata } from 'next';
import HrAuditLogsContainer from './_containers/audit-logs';

export const metadata: Metadata = {
  title: 'Log Audit - SIMAD',
  description: 'Jejak aktivitas pengguna di seluruh modul sistem',
};

export default function HrAuditLogsPage() {
  return <HrAuditLogsContainer />;
}
