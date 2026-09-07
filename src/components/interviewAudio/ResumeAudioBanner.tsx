import React from 'react';
import { Headphones, Play, X } from 'lucide-react';
import { SavedAudioProgress } from '../../hooks/useInterviewAudio';
import { Button } from '../ui/Button';

export interface ResumeAudioBannerProps {
  progress: SavedAudioProgress;
  onResume: () => void;
  onDismiss: () => void;
}

export const ResumeAudioBanner: React.FC<ResumeAudioBannerProps> = ({
  progress,
  onResume,
  onDismiss,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '10px 16px',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--accent-purple-subtle)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        boxShadow: '0 2px 8px rgba(139, 92, 246, 0.1)',
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
        <div
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-purple)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Headphones size={15} />
        </div>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-purple-text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Resume Audio Session
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-primary)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '580px' }}>
            Question #{progress.questionNumber}: {progress.questionTitle}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Button size="xs" variant="primary" icon={<Play size={12} />} onClick={onResume}>
          Resume Listening
        </Button>
        <button
          onClick={onDismiss}
          title="Dismiss resume prompt"
          style={{
            width: '26px',
            height: '26px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            backgroundColor: 'transparent',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
