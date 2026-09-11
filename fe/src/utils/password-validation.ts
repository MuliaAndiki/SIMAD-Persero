export interface PasswordCriteria {
  minLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  isValid: boolean;
}

export function checkPasswordCriteria(password?: string): PasswordCriteria {
  const pwd = password || '';
  const minLength = pwd.length >= 8;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /\d/.test(pwd);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?`~]/.test(pwd);

  return {
    minLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
    isValid: minLength && hasUpper && hasLower && hasNumber && hasSpecial,
  };
}

export function validatePasswordPolicy(password?: string): string | null {
  if (!password || typeof password !== 'string') {
    return 'Password wajib diisi';
  }

  const missing: string[] = [];
  if (password.length < 8) {
    missing.push('minimal 8 karakter');
  }
  if (!/[A-Z]/.test(password)) {
    missing.push('huruf besar');
  }
  if (!/[a-z]/.test(password)) {
    missing.push('huruf kecil');
  }
  if (!/\d/.test(password)) {
    missing.push('angka');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?`~]/.test(password)) {
    missing.push('karakter khusus / simbol');
  }

  if (missing.length === 0) {
    return null;
  }

  // Jika hanya 1 kriteria yang belum terpenuhi:
  if (missing.length === 1) {
    if (missing[0] === 'minimal 8 karakter') {
      return 'Password minimal 8 karakter';
    }
    return `Password kurang ${missing[0]}`;
  }

  // Jika beberapa kriteria belum terpenuhi:
  const formattedMissing =
    missing.length === 2
      ? `${missing[0]} dan ${missing[1]}`
      : `${missing.slice(0, -1).join(', ')}, dan ${missing[missing.length - 1]}`;

  return `Password harus terdiri dari ${formattedMissing}`;
}
