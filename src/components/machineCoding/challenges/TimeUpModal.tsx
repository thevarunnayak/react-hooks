import React from 'react';
import { Clock, Send, Play, RotateCcw, AlertCircle } from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';

export interface TimeUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onContinue: () => void;
  onRestart: () => void;
}

export const TimeUpModal: React.FC<TimeUpModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onContinue,
  onRestart,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={18} style={{ color: 'var(--accent-warning)' }} />
          <span>Time's Up!</span>
        </div>
      }
      maxWidth="460px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div
          style={{
            padding: 16,
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--accent-warning-subtle, rgba(245, 158, 11, 0.1))',
            border: '1px solid var(--accent-warning)',
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
          }}
        >
          <AlertCircle size={20} style={{ color: 'var(--accent-warning)', flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
            <strong>The scheduled interview time limit has elapsed.</strong>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>
              Your solution code is safely preserved. You can submit your work now for final evaluation, continue practicing in untimed mode, or restart from the beginning.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }}>
          <Button
            size="md"
            variant="primary"
            icon={<Send size={14} />}
            onClick={() => {
              onClose();
              onSubmit();
            }}
          >
            Submit Solution Now
          </Button>

          <Button
            size="md"
            variant="outline"
            icon={<Play size={14} />}
            onClick={() => {
              onClose();
              onContinue();
            }}
          >
            Continue Practicing (Untimed)
          </Button>

          <Button
            size="sm"
            variant="ghost"
            icon={<RotateCcw size={13} />}
            onClick={() => {
              onClose();
              onRestart();
            }}
            style={{ color: 'var(--text-muted)' }}
          >
            Restart Challenge
          </Button>
        </div>
      </div>
    </Modal>
  );
};
