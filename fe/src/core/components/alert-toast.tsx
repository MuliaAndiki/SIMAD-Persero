import { gooeyToast } from '@/components/atoms/GoeyToaster';
import type { ToastProps } from '@/types/ui';

const iconMap: Record<string, string> = {
  success: '',
  error: '',
  warning: '',
  info: '',
  question: '',
};

/** Pemetaan tipe toast SIMAD ke tipe goey-toast (question tidak tersedia → info). */
const toastTypeMap: Record<string, 'success' | 'error' | 'warning' | 'info'> = {
  success: 'success',
  error: 'error',
  warning: 'warning',
  info: 'info',
  question: 'info',
};

export const showAlertToast = ({ title, message, icon = 'info', onVoid }: ToastProps) => {
  const type = toastTypeMap[icon];

  gooeyToast[type](title, {
    description: message,
    icon: iconMap[icon],
    ...(onVoid ? { onAutoClose: () => onVoid() } : {}),
  });
};
