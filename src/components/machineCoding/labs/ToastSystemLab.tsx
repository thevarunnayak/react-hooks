import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { CustomSelect } from '../../ui/CustomSelect';
import { CheckCircle2, AlertTriangle, Info, XCircle, X, Pause, Play, Sparkles } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'top-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center';

const POSITION_OPTIONS = [
  { value: 'top-right', label: 'Top Right' },
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-center', label: 'Top Center' },
  { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-center', label: 'Bottom Center' },
];

const getPositionStyles = (pos: ToastPosition): React.CSSProperties => {
  switch (pos) {
    case 'top-left':
      return { top: 12, left: 12 };
    case 'top-center':
      return { top: 12, left: '50%', transform: 'translateX(-50%)' };
    case 'top-right':
      return { top: 12, right: 12 };
    case 'bottom-left':
      return { bottom: 12, left: 12 };
    case 'bottom-center':
      return { bottom: 12, left: '50%', transform: 'translateX(-50%)' };
    case 'bottom-right':
    default:
      return { bottom: 12, right: 12 };
  }
};

export interface ActiveToast {
  id: string;
  title: string;
  message: string;
  variant: ToastVariant;
  durationMs: number;
  remainingMs: number;
  isPaused: boolean;
}

export const ToastSystemLab: React.FC = () => {
  const [toasts, setToasts] = useState<ActiveToast[]>([]);
  const [position, setPosition] = useState<ToastPosition>('top-right');
  const [customDuration, setCustomDuration] = useState(4000);

  const addToast = (variant: ToastVariant, title: string, message: string) => {
    const id = String(Date.now() + Math.random());
    const newToast: ActiveToast = {
      id,
      title,
      message,
      variant,
      durationMs: customDuration,
      remainingMs: customDuration,
      isPaused: false,
    };

    // Cap at 5 toasts max
    setToasts((prev) => [...prev.slice(-4), newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const setHoverPause = (id: string, isPaused: boolean) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, isPaused } : t)));
  };

  // High-frequency countdown ticker for smooth progress bar
  useEffect(() => {
    const interval = setInterval(() => {
      setToasts((prev) =>
        prev
          .map((t) => {
            if (t.isPaused) return t;
            const updated = t.remainingMs - 100;
            return { ...t, remainingMs: updated };
          })
          .filter((t) => t.remainingMs > 0)
      );
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const getVariantStyles = (variant: ToastVariant) => {
    switch (variant) {
      case 'success':
        return { icon: <CheckCircle2 size={16} />, color: 'var(--accent-success)', border: 'rgba(16, 185, 129, 0.3)' };
      case 'error':
        return { icon: <XCircle size={16} />, color: 'var(--accent-danger)', border: 'rgba(244, 63, 94, 0.3)' };
      case 'warning':
        return { icon: <AlertTriangle size={16} />, color: 'var(--accent-warning)', border: 'rgba(234, 179, 8, 0.3)' };
      case 'info':
      default:
        return { icon: <Info size={16} />, color: 'var(--accent-cyan)', border: 'rgba(6, 182, 212, 0.3)' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 640, margin: '0 auto', position: 'relative' }}>
      {/* Toast Controls */}
      <Card variant="glass" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Trigger Notification Variants:
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => addToast('success', 'Profile Updated', 'Your settings were saved successfully to cloud storage.')}
            style={{ color: 'var(--accent-success)' }}
          >
            Success Toast
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => addToast('error', 'Request Timeout', 'Server took longer than 5000ms to respond. Please retry.')}
            style={{ color: 'var(--accent-danger)' }}
          >
            Error Toast
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => addToast('warning', 'Unsaved Changes', 'You have modified fields that have not yet been synced.')}
            style={{ color: 'var(--accent-warning)' }}
          >
            Warning Toast
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => addToast('info', 'New Version Available', 'A fresh build of ReactLabs is ready to install.')}
            style={{ color: 'var(--accent-cyan)' }}
          >
            Info Toast
          </Button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, paddingTop: 8, borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Duration:</span>
            <input
              type="range"
              min={2000}
              max={8000}
              step={1000}
              value={customDuration}
              onChange={(e) => setCustomDuration(Number(e.target.value))}
              style={{ width: 100, accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
            />
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-primary)' }}>{customDuration / 1000}s</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Position:</span>
            <CustomSelect
              size="sm"
              value={position}
              options={POSITION_OPTIONS}
              onChange={(val) => setPosition(val as ToastPosition)}
            />
          </div>
        </div>
      </Card>

      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
        Hovering over any active notification pauses its countdown progress bar.
      </div>

      {/* Interactive Toast Display Sandbox Container */}
      <div
        style={{
          minHeight: 280,
          border: '1px dashed var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--bg-subtle)',
          position: 'relative',
          overflow: 'hidden',
          padding: 16,
        }}
      >
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginTop: 80 }}>
          Notifications will render inside this preview viewport
        </div>

        {/* Stacked Toasts Container */}
        <div
          style={{
            position: 'absolute',
            ...getPositionStyles(position),
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            width: 280,
            maxWidth: '90%',
            zIndex: 10,
          }}
        >
          {toasts.map((toast) => {
            const style = getVariantStyles(toast.variant);
            const progressPercent = Math.max(0, (toast.remainingMs / toast.durationMs) * 100);

            return (
              <div
                key={toast.id}
                onMouseEnter={() => setHoverPause(toast.id, true)}
                onMouseLeave={() => setHoverPause(toast.id, false)}
                style={{
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: `1px solid ${style.border}`,
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform var(--transition-fast)',
                }}
              >
                <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ color: style.color, flexShrink: 0, marginTop: 1 }}>{style.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {toast.title} {toast.isPaused && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>(Paused)</span>}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.4 }}>
                      {toast.message}
                    </div>
                  </div>
                  <button
                    onClick={() => removeToast(toast.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2 }}
                  >
                    <X size={13} />
                  </button>
                </div>

                {/* Shrinking Countdown Progress Bar */}
                <div style={{ width: '100%', height: 3, backgroundColor: 'rgba(255,255,255,0.08)' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${progressPercent}%`,
                      backgroundColor: style.color,
                      transition: 'width 0.1s linear',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
