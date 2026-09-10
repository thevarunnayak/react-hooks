import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Maximize2, X, Check, AlertCircle, ShieldAlert, Sparkles, Key } from 'lucide-react';

export const ModalDialogLab: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [allowBackdropClose, setAllowBackdropClose] = useState(true);
  const [confirmCount, setConfirmCount] = useState(0);

  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Body scroll lock
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus trap implementation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Initial focus on first interactive input
    setTimeout(() => {
      const firstInput = modalRef.current?.querySelector<HTMLElement>('input, button');
      firstInput?.focus();
    }, 50);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      previousActiveElement.current?.focus();
    };
  }, [isOpen]);

  const handleConfirm = () => {
    setConfirmCount((c) => c + 1);
    setIsOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 640, margin: '0 auto' }}>
      {/* Trigger & Settings Card */}
      <Card variant="glass" padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'center' }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
          <Maximize2 size={22} />
        </div>

        <div>
          <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
            Accessible Modal with Portals & Focus Trap
          </h3>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: 0 }}>
            Renders into document body, locks page scroll, traps Tab key navigation, and supports Escape closure.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
          <Button variant="primary" icon={<Sparkles size={14} />} onClick={() => setIsOpen(true)}>
            Open Demo Modal
          </Button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 8, paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
          <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={allowBackdropClose}
              onChange={(e) => setAllowBackdropClose(e.target.checked)}
            />
            Allow Backdrop Click Dismiss
          </label>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>•</span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Confirmed count: <strong>{confirmCount}</strong></span>
        </div>
      </Card>

      {/* Feature Verification Matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 170px), 1fr))', gap: 8 }}>
        <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-subtle)', fontSize: '11px', color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--accent-primary)', display: 'block' }}>1. React Portal</strong>
          Mounted directly onto `document.body` to avoid clipping.
        </div>
        <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-subtle)', fontSize: '11px', color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--accent-purple)', display: 'block' }}>2. Focus Trap</strong>
          Pressing Tab loops inside modal; cannot escape to page.
        </div>
        <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-subtle)', fontSize: '11px', color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--accent-success)', display: 'block' }}>3. Scroll Lock</strong>
          Locks body scroll and restores on modal close.
        </div>
      </div>

      {/* Portal Modal Component */}
      {isOpen &&
        createPortal(
          <div
            onClick={(e) => {
              if (allowBackdropClose && e.target === e.currentTarget) {
                setIsOpen(false);
              }
            }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: 16,
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              style={{
                width: '100%',
                maxWidth: 480,
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                animation: 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 id="modal-title" style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Confirm Production Deployment
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                You are about to promote build <strong>v2.8.4</strong> to the main production edge cluster. This action triggers cache invalidation across 42 global POPs.
              </div>

              {/* Form Input to test Focus Trap */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Deployment Note:
                </label>
                <input
                  type="text"
                  placeholder="Optional release note..."
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-default)',
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: 'var(--text-sm)',
                  }}
                />
              </div>

              {/* Actions Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  Cancel (Esc)
                </Button>
                <Button variant="primary" size="sm" icon={<Check size={14} />} onClick={handleConfirm}>
                  Confirm Deploy
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
