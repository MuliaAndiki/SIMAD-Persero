import type { Metadata } from 'next';
import HrAuditLogsContainer from './_containers/audit-logs';

export const metadata: Metadata = {
  title: 'Audit Log - SIMAD',
  description: 'Jejak aktivitas pengguna di seluruh modul sistem',
};

export default function HrAuditLogsPage() {
  return <HrAuditLogsContainer />;
}
