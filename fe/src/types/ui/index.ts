type ToastType = 'success' | 'error' | 'warning' | 'info' | 'question';
export interface ModalProps {
  title: string;
  icon: ToastType;
  deskripsi: string;
  confirmButtonText?: string;
  confirmButtonColor?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onClose?: () => void;
}

export interface ToastProps {
  title: string;
  icon?: ToastType;
  message: string;
  onVoid?: () => void;
}

export interface AlertContexType {
  toast: (p: ToastProps) => void;
  modal: (p: ModalProps) => void;
  confirm: (p: ModalProps) => Promise<boolean>;
}

export type GuideCategory =
  | 'REGISTRATION'
  | 'ONBOARDING'
  | 'ATTENDANCE'
  | 'LOGBOOK'
  | 'FINAL_REPORT'
  | 'CERTIFICATE'
  | 'GENERAL';

export type AttendanceStatus =
  | 'PRESENT'
  | 'LATE'
  | 'COMPLETED'
  | 'PENDING_REVIEW'
  | 'INVALID'
  | 'ABSENT'
  | 'ON_TIME';

export type InternshipStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'TERMINATED'
  | 'CERTIFICATE_GENERATED'
  | 'ARCHIVED';

export interface WorkdayItem {
  date: Date;
  key: string;
  isWorkday: boolean;
}

export interface QuotaAllocation {
  departmentId: string;
  allocated: number;
}
