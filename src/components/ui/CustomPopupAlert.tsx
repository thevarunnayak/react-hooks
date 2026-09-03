import React, { useEffect, useRef } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { Button } from './Button';

export type PopupAlertType = 'info' | 'success' | 'warning' | 'danger';

export interface PopupAlertOptions {
  title: string;
  message: string;
  type?: PopupAlertType;
  confirmText?: string;
  cancelText?: string;
  isConfirm?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export interface CustomPopupAlertProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: PopupAlertType;
  confirmText?: string;
  cancelText?: string;
  isConfirm?: boolean;
  onConfirm?: () => void;
}

export const CustomPopupAlert: React.FC<CustomPopupAlertProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = 'OK',
  cancelText = 'Cancel',
  isConfirm = false,
  onConfirm,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getTypeDetails = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle2 size={22} style={{ color: 'var(--accent-success)' }} />,
          badgeColor: 'rgba(16, 185, 129, 0.15)',
          badgeBorder: 'rgba(16, 185, 129, 0.3)',
          confirmVariant: 'primary' as const,
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={22} style={{ color: 'var(--accent-warning)' }} />,
          badgeColor: 'rgba(245, 158, 11, 0.15)',
          badgeBorder: 'rgba(245, 158, 11, 0.3)',
          confirmVariant: 'outline' as const,
        };
      case 'danger':
        return {
          icon: <AlertCircle size={22} style={{ color: 'var(--accent-danger)' }} />,
          badgeColor: 'rgba(244, 63, 94, 0.15)',
          badgeBorder: 'rgba(244, 63, 94, 0.3)',
          confirmVariant: 'danger' as const,
        };
      case 'info':
      default:
        return {
          icon: <Info size={22} style={{ color: 'var(--accent-primary)' }} />,
          badgeColor: 'rgba(59, 130, 246, 0.15)',
          badgeBorder: 'rgba(59, 130, 246, 0.3)',
          confirmVariant: 'primary' as const,
        };
    }
  };

  const { icon, badgeColor, badgeBorder, confirmVariant } = getTypeDetails();

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        animation: 'fadeIn 120ms ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="popup-alert-title"
        aria-describedby="popup-alert-message"
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'scaleIn 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header with Icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
            padding: '20px 20px 12px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: badgeColor,
              border: `1px solid ${badgeBorder}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {icon}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h3
              id="popup-alert-title"
              style={{
                fontSize: '15px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                margin: '0 0 4px',
                lineHeight: 1.3,
              }}
            >
              {title}
            </h3>
            <p
              id="popup-alert-message"
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--text-secondary)',
                margin: 0,
                lineHeight: 1.5,
                wordBreak: 'break-word',
              }}
            >
              {message}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: 'var(--radius-xs)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color var(--transition-fast)',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Action Buttons Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '8px',
            padding: '12px 20px 18px',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface-elevated)',
          }}
        >
          {isConfirm && (
            <Button size="sm" variant="ghost" onClick={onClose}>
              {cancelText}
            </Button>
          )}
          <Button
            size="sm"
            variant={confirmVariant}
            onClick={handleConfirm}
            autoFocus
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
