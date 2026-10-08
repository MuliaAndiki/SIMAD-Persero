/** Base path halaman profil sesuai role — dipakai untuk link aksi terkait. */
export function profileBasePath(role?: string | null): string {
  switch (role?.toUpperCase()) {
    case 'HR_ADMIN':
      return '/hr_admin/profile';
    case 'SUPERVISOR':
      return '/supervisor/profile';
    case 'RECEPTIONIST':
      return '/receptionist/profile';
    case 'INTERN':
    default:
      return '/intern/profile';
  }
}
