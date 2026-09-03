import { useState, useCallback } from 'react';
import { PopupAlertType, PopupAlertOptions } from '../components/ui/CustomPopupAlert';

export interface PopupAlertState {
  isOpen: boolean;
  title: string;
  message: string;
  type?: PopupAlertType;
  confirmText?: string;
  cancelText?: string;
  isConfirm?: boolean;
  onConfirm?: () => void;
}

export function usePopupAlert() {
  const [popupState, setPopupState] = useState<PopupAlertState>({
    isOpen: false,
    title: '',
    message: '',
  });

  const showAlert = useCallback(
    (title: string, message: string, type: PopupAlertType = 'info', confirmText = 'Got It') => {
      setPopupState({
        isOpen: true,
        title,
        message,
        type,
        confirmText,
        isConfirm: false,
      });
    },
    []
  );

  const showConfirm = useCallback((options: PopupAlertOptions) => {
    setPopupState({
      isOpen: true,
      title: options.title,
      message: options.message,
      type: options.type || 'warning',
      confirmText: options.confirmText || 'Confirm',
      cancelText: options.cancelText || 'Cancel',
      isConfirm: true,
      onConfirm: options.onConfirm,
    });
  }, []);

  const closePopup = useCallback(() => {
    setPopupState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return {
    popupState,
    showAlert,
    showConfirm,
    closePopup,
  };
}
