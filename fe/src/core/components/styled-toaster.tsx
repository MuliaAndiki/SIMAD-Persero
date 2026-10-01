'use client';

import type { ToastProps } from '@/types/ui';
import { CheckCircle2, CircleHelp, Info, TriangleAlert, X, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

type ToastIcon = NonNullable<ToastProps['icon']>;

export interface StyledToastItem {
  id: string;
  title: string;
  message: string;
  icon: ToastIcon;
  onVoid?: () => void;
}

const MAX_VISIBLE_TOASTS = 3;
const TOAST_DURATION_MS = 4500;

const TONE_COLOR: Record<ToastIcon, string> = {
  success: 'var(--success)',
  error: 'var(--destructive)',
  warning: 'var(--warning)',
  info: 'var(--info)',
  question: 'var(--primary)',
};

const DEFAULT_TITLES: Record<ToastIcon, string> = {
  success: 'Berhasil',
  error: 'Terjadi Kesalahan',
  warning: 'Peringatan',
  info: 'Informasi',
  question: 'Konfirmasi',
};

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: TriangleAlert,
  info: Info,
  question: CircleHelp,
} as const;

let toastSeq = 0;
let activeToasts: StyledToastItem[] = [];
const listeners = new Set<(toasts: StyledToastItem[]) => void>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();

function emit() {
  const snapshot = [...activeToasts];
  for (const listener of listeners) listener(snapshot);
}

function takeToast(id: string) {
  activeToasts = activeToasts.filter((toast) => toast.id !== id);
  emit();
}

function clearToastTimer(id: string) {
  const timer = timers.get(id);
  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }
}

/** Tampilkan toast styled; onVoid dipanggil saat auto-dismiss (paritas goey onAutoClose). */
export function showStyledToast({ title, message, icon = 'info', onVoid }: ToastProps): string {
  toastSeq += 1;
  const id = `${Date.now()}-${toastSeq}`;

  activeToasts = [...activeToasts, { id, title, message, icon, onVoid }].slice(-MAX_VISIBLE_TOASTS);
  emit();

  timers.set(
    id,
    setTimeout(() => {
      timers.delete(id);
      takeToast(id);
      onVoid?.();
    }, TOAST_DURATION_MS),
  );

  return id;
}

export function dismissStyledToast(id: string) {
  clearToastTimer(id);
  takeToast(id);
}

const toastIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(12px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
`;

const ToastViewport = styled.output`
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: min(22rem, calc(100vw - 2rem));
  pointer-events: none;

  & > * {
    pointer-events: auto;
  }
`;

const ToastCard = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  width: 100%;
  padding: 0.875rem 1rem;
  background: var(--card);
  color: var(--card-foreground);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px -3px rgb(2 6 23 / 0.12);
  animation: ${toastIn} 0.25s ease-out;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const ToastIconWrap = styled.span<{ $tone: ToastIcon }>`
  margin-top: 0.125rem;
  flex-shrink: 0;
  color: ${({ $tone }) => TONE_COLOR[$tone]};

  & > svg {
    width: 1.25rem;
    height: 1.25rem;
  }
`;

const ToastBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
  flex: 1;
`;

const ToastTitle = styled.p`
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--foreground);
`;

const ToastMessage = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: var(--muted-foreground);
  overflow-wrap: anywhere;
`;

const ToastClose = styled.button`
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  padding: 0;
  border: 0;
  border-radius: 0.375rem;
  background: transparent;
  color: var(--muted-foreground);
  cursor: pointer;

  &:hover {
    color: var(--foreground);
    background: var(--muted);
  }

  &:focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
  }

  & > svg {
    width: 1rem;
    height: 1rem;
  }
`;

export function ToastEffect({
  title,
  message,
  icon = 'info',
  onClose,
}: ToastProps & { onClose?: () => void }) {
  const tone: ToastIcon = ICONS[icon] ? icon : 'info';
  const Icon = ICONS[tone];
  const displayTitle = title !== undefined && title.trim() !== '' ? title : DEFAULT_TITLES[tone];

  return (
    <ToastCard data-tone={tone}>
      <ToastIconWrap $tone={tone} aria-hidden="true">
        <Icon />
      </ToastIconWrap>
      <ToastBody>
        {displayTitle ? <ToastTitle>{displayTitle}</ToastTitle> : null}
        {message ? <ToastMessage>{message}</ToastMessage> : null}
      </ToastBody>
      {onClose ? (
        <ToastClose type="button" onClick={onClose} aria-label="Tutup notifikasi">
          <X />
        </ToastClose>
      ) : null}
    </ToastCard>
  );
}

export function SimadToaster() {
  const [toasts, setToasts] = useState<StyledToastItem[]>(() => [...activeToasts]);

  useEffect(() => {
    const listener = (next: StyledToastItem[]) => setToasts(next);
    listeners.add(listener);
    setToasts([...activeToasts]);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <ToastViewport aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <ToastEffect
          key={toast.id}
          title={toast.title}
          message={toast.message}
          icon={toast.icon}
          onClose={() => dismissStyledToast(toast.id)}
        />
      ))}
    </ToastViewport>
  );
}
