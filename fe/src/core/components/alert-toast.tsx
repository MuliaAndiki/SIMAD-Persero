import type { ToastProps } from '@/types/ui';
import { showStyledToast } from './styled-toaster';

/** Bridge API toast lama ke host styled-components (signature tidak berubah). */
export const showAlertToast = (payload: ToastProps) => {
  showStyledToast(payload);
};
