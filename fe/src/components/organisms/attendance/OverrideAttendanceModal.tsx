'use client';

import {
  OverrideAttendanceDialog,
  type OverrideAttendanceDialogProps,
  type OverrideAttendanceType,
  TIME_RANGES,
} from './OverrideAttendanceDialog';

export { TIME_RANGES };
export type OverrideType = OverrideAttendanceType;
export type OverrideAttendanceModalProps = OverrideAttendanceDialogProps;

/**
 * OverrideAttendanceModal — alias untuk unified `OverrideAttendanceDialog`.
 * @deprecated Gunakan `OverrideAttendanceDialog` dari `./OverrideAttendanceDialog` secara langsung.
 */
export const OverrideAttendanceModal = OverrideAttendanceDialog;
