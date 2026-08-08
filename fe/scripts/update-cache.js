const fs = require('fs');
const path = require('path');

// Correct query key references for cache utilities
const fixes = {
  'attendance.cache.ts': 'queryKey.attendance.history()',
  'auth.cache.ts': 'queryKey.auth.me()',
  'certificate.cache.ts': 'queryKey.certificate.my()',
  'department.cache.ts': 'queryKey.department.list()',
  'file.cache.ts': 'queryKey.fileRoot()',
  'internship.cache.ts': 'queryKey.internship.my()',
  'notification.cache.ts': 'queryKey.notification.list()',
  'office.cache.ts': 'queryKey.office.list()',
  'supervisor.cache.ts': 'queryKey.supervisor.list()',
  'user.cache.ts': 'queryKey.user.profile()',
};

for (const [file, key] of Object.entries(fixes)) {
  const filePath = path.join(__dirname, '../src/utils/cache', file);
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/queryKey\.[a-zA-Z]+\.[a-zA-Z]+\(\)/g, key);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed ${file}`);
}
