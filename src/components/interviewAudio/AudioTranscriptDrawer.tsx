import React, { useEffect, useRef } from 'react';
import { X, FileText, Play, Volume2, Sparkles } from 'lucide-react';
import { AudioSegment } from '../../types/interviewAudio';
import { InterviewQuestionItem } from '../../types/challenge';
import { Badge } from '../ui/Badge';

export interface AudioTranscriptDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  question: InterviewQuestionItem | null;
  segments: AudioSegment[];
  currentSegmentId: string | null;
  isPlaying: boolean;
  onJumpToSegment: (segmentId: string) => void;
}

export const AudioTranscriptDrawer: React.FC<AudioTranscriptDrawerProps> = ({
  isOpen,
  onClose,
  question,
  segments,
  currentSegmentId,
  isPlaying,
  onJumpToSegment,
}) => {
  const activeItemRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active segment into view in the drawer
  useEffect(() => {
    if (isOpen && activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentSegmentId, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="complementary"
      aria-label="Interview Audio Narration Transcript"
      style={{
        position: 'fixed',
        top: '64px',
        right: '16px',
        bottom: '90px',
        width: 'min(420px, calc(100vw - 32px))',
        zIndex: 900,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-xl)',
        backdropFilter: 'blur(12px)',
        overflow: 'hidden',
        animation: 'slideLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Drawer Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface-elevated)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={16} style={{ color: 'var(--accent-purple)' }} />
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
            Narration Transcript
          </span>
          {question && (
            <Badge variant="purple" size="sm">
              #{question.id.replace('int-', '')}
            </Badge>
          )}
        </div>
        <button
          onClick={onClose}
          aria-label="Close transcript drawer"
          style={{
            width: '28px',
            height: '28px',
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
          <X size={15} />
        </button>
      </div>

      {/* Drawer Question Title */}
      {question && (
        <div
          style={{
            padding: '12px 18px',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-subtle)',
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            color: 'var(--text-primary)',
            lineHeight: 1.4,
          }}
        >
          {question.question}
        </div>
      )}

      {/* Segments Transcript Stream */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {segments.map((seg) => {
          const isActive = seg.id === currentSegmentId;

          return (
            <div
              key={seg.id}
              ref={isActive ? activeItemRef : undefined}
              onClick={() => onJumpToSegment(seg.id)}
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid',
                borderColor: isActive ? 'var(--accent-purple)' : 'var(--border-subtle)',
                backgroundColor: isActive
                  ? 'var(--accent-purple-subtle)'
                  : 'var(--bg-surface-elevated)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                boxShadow: isActive ? '0 0 12px rgba(139, 92, 246, 0.2)' : 'none',
              }}
            >
              {/* Segment Label Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isActive ? (
                    <Volume2
                      size={13}
                      style={{
                        color: 'var(--accent-purple)',
                        animation: isPlaying ? 'pulse 1.2s infinite' : 'none',
                      }}
                    />
                  ) : (
                    <Play size={11} style={{ color: 'var(--text-muted)' }} />
                  )}
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: isActive ? 'var(--accent-purple-text)' : 'var(--text-secondary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {seg.label}
                  </span>
                </div>
                {isActive && (
                  <Badge variant="purple" size="sm">
                    {isPlaying ? 'Speaking' : 'Active'}
                  </Badge>
                )}
              </div>

              {/* Segment Text */}
              <div
                style={{
                  fontSize: 'var(--text-xs)',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-line',
                }}
              >
                {seg.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Drawer Footer */}
      <div
        style={{
          padding: '10px 16px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface-elevated)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: 'var(--text-muted)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Sparkles size={12} style={{ color: 'var(--accent-primary)' }} />
          Click any section to jump audio
        </span>
        <span>{segments.length} sections</span>
      </div>
    </div>
  );
};
