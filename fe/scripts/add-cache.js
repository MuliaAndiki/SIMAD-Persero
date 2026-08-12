const fs = require('fs');
const path = require('path');

const domains = [
  { name: 'Application', model: 'ApplicationResponse', typeFile: '@/types/api/application.types', array: true, query: 'application.list()' },
  { name: 'Attendance', model: 'AttendanceResponse', typeFile: '@/types/api/attendance.types', array: true, query: 'attendance.history()' },
  { name: 'Auth', model: 'SafeAuthUser', typeFile: '@/types/api/auth.types', array: false, query: 'auth.me()' },
  { name: 'Certificate', model: 'CertificateResponse', typeFile: '@/types/api/certificate.types', array: true, query: 'certificate.my()' },
  { name: 'Department', model: 'DepartmentResponse', typeFile: '@/types/api/department.types', array: true, query: 'department.list()' },
  { name: 'File', model: 'FileResponse', typeFile: '@/types/api/file.types', array: true, query: 'fileRoot()' }, // no list method typically for File
  { name: 'Internship', model: 'InternshipResponse', typeFile: '@/types/api/internship.types', array: true, query: 'internship.my()' },
  { name: 'Notification', model: 'NotificationResponse', typeFile: '@/types/api/notification.types', array: true, query: 'notification.list()' },
  { name: 'Office', model: 'OfficeResponse', typeFile: '@/types/api/office.types', array: true, query: 'office.list()' },
  { name: 'Supervisor', model: 'SupervisorAssignmentResponse', typeFile: '@/types/api/supervisor.types', array: true, query: 'supervisor.list()' },
  { name: 'User', model: 'ProfileResponse', typeFile: '@/types/api/user.types', array: false, query: 'user.profile()' },
];

domains.forEach(domain => {
  const fileName = domain.name.toLowerCase() + '.cache.ts';
  const filePath = path.join(__dirname, '../src/utils/cache', fileName);
  
  const content = `import { queryKey } from '@/configs/query-key';
import type { AppNameSpace } from '@/hooks/useAppNameSpace';
import type { ${domain.model} } from '${domain.typeFile}';

export type ${domain.name}CacheContext = {
  previousData?: ${domain.model}${domain.array ? '[]' : ''};
};

export function read${domain.name}Snapshot(
  ns: AppNameSpace,
): ${domain.model}${domain.array ? '[]' : ''} | undefined {
  return ns.queryClient.getQueryData<${domain.model}${domain.array ? '[]' : ''}>(
    queryKey.${domain.query}
  );
}
`;
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Created ${filePath}`);
});
