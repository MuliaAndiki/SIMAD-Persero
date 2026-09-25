import { describe, expect, it } from 'bun:test';

function evaluateAttendanceCheckInStatus(
  checkInTime: string, // "HH:mm:ss"
  lateAfter: string = '08:00:00',
): 'PRESENT' | 'LATE' {
  return checkInTime > lateAfter ? 'LATE' : 'PRESENT';
}

type CorrectionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

function canTransitionCorrectionState(
  from: CorrectionStatus,
  to: CorrectionStatus,
): boolean {
  if (from === 'PENDING') {
    return to === 'APPROVED' || to === 'REJECTED' || to === 'CANCELLED';
  }
  // Once terminal (APPROVED, REJECTED, CANCELLED), state cannot change
  return false;
}

describe('Attendance Rules & Correction State Transitions (TASK-5.1 / TASK-5.2)', () => {
  it('should mark check-in at or before 08:00:00 as PRESENT', () => {
    expect(evaluateAttendanceCheckInStatus('07:30:00')).toBe('PRESENT');
    expect(evaluateAttendanceCheckInStatus('07:59:59')).toBe('PRESENT');
    expect(evaluateAttendanceCheckInStatus('08:00:00')).toBe('PRESENT');
  });

  it('should mark check-in after 08:00:00 as LATE', () => {
    expect(evaluateAttendanceCheckInStatus('08:00:01')).toBe('LATE');
    expect(evaluateAttendanceCheckInStatus('08:15:00')).toBe('LATE');
    expect(evaluateAttendanceCheckInStatus('09:00:00')).toBe('LATE');
  });

  it('should allow valid transitions from PENDING state', () => {
    expect(canTransitionCorrectionState('PENDING', 'APPROVED')).toBe(true);
    expect(canTransitionCorrectionState('PENDING', 'REJECTED')).toBe(true);
    expect(canTransitionCorrectionState('PENDING', 'CANCELLED')).toBe(true);
  });

  it('should disallow transitions once a terminal state is reached', () => {
    expect(canTransitionCorrectionState('APPROVED', 'PENDING')).toBe(false);
    expect(canTransitionCorrectionState('APPROVED', 'REJECTED')).toBe(false);
    expect(canTransitionCorrectionState('REJECTED', 'APPROVED')).toBe(false);
    expect(canTransitionCorrectionState('CANCELLED', 'APPROVED')).toBe(false);
  });
});
