'use client';

import { GooeyToaster } from '@/components/atoms/GoeyToaster';
import { AlertModal } from '@/core/components/alert-modal';
import { showAlertToast } from '@/core/components/alert-toast';
import type { AlertContexType, ModalProps, ToastProps } from '@/types/ui';
import { createContext, useContext, useState } from 'react';

const AlertContex = createContext<AlertContexType | undefined>(undefined);

export const useAlert = (): AlertContexType => {
  const contex = useContext(AlertContex);
  if (!contex) {
    throw new Error('useAlert must be used within an AlertProvider');
  }

  return contex;
};

export const AlertProvinder = ({ children }: { children: React.ReactNode }) => {
  const [modal, setModal] = useState<ModalProps | null>(null);
  const [resolver, setResolver] = useState<((res: boolean) => void) | null>(null);

  const toastAlert = (payload: ToastProps) => {
    showAlertToast(payload);
  };

  const showModal = (payload: ModalProps) => {
    setResolver(null);
    setModal(payload);
  };

  const confirm = (payload: ModalProps): Promise<boolean> => {
    setModal(payload);

    return new Promise((resolve) => {
      setResolver(() => resolve);
    });
  };

  const closeModal = () => {
    setModal(null);
    setResolver(null);
  };

  const handleConfirm = () => {
    modal?.onConfirm?.();
    resolver?.(true);
    closeModal();
  };

  const handleCancel = () => {
    modal?.onClose?.();
    resolver?.(false);
    closeModal();
  };

  const isConfirmDialog = Boolean(resolver);

  return (
    <AlertContex.Provider value={{ toast: toastAlert, modal: showModal, confirm }}>
      {children}
      <GooeyToaster />
      {modal ? (
        <AlertModal
          open
          setOpen={(open) => {
            if (!open) {
              handleCancel();
            }
          }}
          title={modal.title}
          deskripsi={modal.deskripsi}
          icon={modal.icon}
          confirmButtonText={modal.confirmButtonText || 'OK'}
          confirmButtonColor={modal.confirmButtonColor || 'bg-primary'}
          onConfirm={handleConfirm}
          cancelText={isConfirmDialog ? 'Batal' : undefined}
          onCancel={isConfirmDialog ? handleCancel : undefined}
        />
      ) : null}
    </AlertContex.Provider>
  );
};
