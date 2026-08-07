/**
 * Katalog Error Code (API spec §32).
 *
 * Kode dipakai pada field `code` di response error agar klien dapat
 * menangani error secara terprogram tanpa parsing pesan.
 */
export const ErrorCodes = {
  AUTH_001: 'AUTH_001', // Invalid Credential
  AUTH_002: 'AUTH_002', // Token Expired
  AUTH_003: 'AUTH_003', // Email Not Verified
  USER_001: 'USER_001', // User Not Found
  APP_001: 'APP_001', // Application Already Exists
  APP_002: 'APP_002', // Application Already Approved
  ATT_001: 'ATT_001', // Check In Window Closed
  ATT_002: 'ATT_002', // Outside Office Radius
  ATT_003: 'ATT_003', // Already Checked In
  ATT_004: 'ATT_004', // Already Checked Out
  CERT_001: 'CERT_001', // Certificate Not Available
  FILE_001: 'FILE_001', // Invalid File Type
  FILE_002: 'FILE_002', // File Too Large
  RATE_LIMIT_001: 'RATE_LIMIT_001', // Too Many Requests
  IDEM_001: 'IDEM_001', // Idempotency Key Conflict
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
