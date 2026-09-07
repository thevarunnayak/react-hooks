import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Maximize2,
  Minimize2,
  X,
  Settings,
  FileText,
  Compass,
  Headphones,
  Minus,
  Plus,
} from 'lucide-react';
import { AudioSegment, AudioPlaybackState, AudioPlayerSettings, AudioProgressInfo } from '../../types/interviewAudio';
import { InterviewQuestionItem } from '../../types/challenge';
import { Badge } from '../ui/Badge';
import { getModifierKeyLabel } from '../../utils/platform';

export interface AudioCoachPlayerProps {
  playbackState: AudioPlaybackState;
  currentSegment: AudioSegment | null;
  currentQuestion: InterviewQuestionItem | null;
  progressInfo: AudioProgressInfo;
  settings: AudioPlayerSettings;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onNextQuestion: () => void;
  onPrevQuestion: () => void;
  onSeekRelative: (deltaSeconds: number) => void;
  onSeekToSegment?: (index: number) => void;
  onRateChange: (rate: number) => void;
  onAutoFollowToggle: () => void;
  onToggleMinimize: () => void;
  onToggleTranscript: () => void;
  onOpenSettings: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export const AudioCoachPlayer: React.FC<AudioCoachPlayerProps> = ({
  playbackState,
  currentSegment,
  currentQuestion,
  progressInfo,
  settings,
  onPlay,
  onPause,
  onStop,
  onNextQuestion,
  onPrevQuestion,
  onSeekRelative,
  onSeekToSegment,
  onRateChange,
  onAutoFollowToggle,
  onToggleMinimize,
  onToggleTranscript,
  onOpenSettings,
}) => {
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubIndex, setScrubIndex] = useState<number | null>(null);
  const [isHoveringTrack, setIsHoveringTrack] = useState(false);
  // If player is idle and stopped, don't render anything
  if (playbackState === 'idle') return null;

  const isPlaying = playbackState === 'playing';
  const modKey = getModifierKeyLabel();

  const cycleSpeed = () => {
    const speeds = [0.75, 1.0, 1.25, 1.5, 2.0];
    const currentIndex = speeds.findIndex((s) => Math.abs(s - settings.rate) < 0.1);
    const nextIndex = (currentIndex + 1) % speeds.length;
    onRateChange(speeds[nextIndex]);
  };

  const adjustSpeed = (delta: number) => {
    const next = Math.max(0.5, Math.min(2.5, Math.round((settings.rate + delta) * 100) / 100));
    onRateChange(next);
  };

  // 1. Minimized Mode (Floating Compact Pill)
  if (settings.isMinimized) {
    return (
      <div
        role="region"
        aria-label="Interview Audio Player (Minimized)"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 16px 8px 12px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-xl), 0 0 20px rgba(139, 92, 246, 0.25)',
          backdropFilter: 'blur(16px)',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          maxWidth: 'min(440px, calc(100vw - 32px))',
        }}
      >
        {/* Play / Pause Toggle Button */}
        <button
          onClick={isPlaying ? onPause : onPlay}
          aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-purple)',
            color: '#ffffff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(139, 92, 246, 0.4)',
            transition: 'transform 0.15s ease',
            flexShrink: 0,
          }}
        >
          {isPlaying ? <Pause size={17} /> : <Play size={17} style={{ marginLeft: '2px' }} />}
        </button>

        {/* Title & Active Segment Info */}
        <div
          onClick={onToggleMinimize}
          style={{
            display: 'flex',
            flexDirection: 'column',
            cursor: 'pointer',
            minWidth: '120px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {currentQuestion ? `Q${progressInfo.currentQuestionIndex + 1} · ${currentQuestion.question}` : 'Interview Audio Coach'}
          </div>
          <div
            style={{
              fontSize: '10px',
              color: 'var(--accent-purple-text)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: isPlaying ? 'var(--accent-success)' : 'var(--text-muted)',
              }}
            />
            {currentSegment?.label || (isPlaying ? 'Playing' : 'Paused')}
          </div>
        </div>

        {/* Speed Quick Button */}
        <button
          onClick={cycleSpeed}
          title="Click to cycle speed"
          style={{
            padding: '2px 7px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-subtle)',
            fontSize: '10px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          {settings.rate}×
        </button>

        {/* Expand Button */}
        <button
          onClick={onToggleMinimize}
          title="Expand audio player"
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
          <Maximize2 size={14} />
        </button>

        {/* Close Button */}
        <button
          onClick={onStop}
          title="Stop & close audio player"
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
          <X size={14} />
        </button>
      </div>
    );
  }

  // 2. Expanded Mode (Full Glassmorphic Audio Deck)
  return (
    <div
      role="region"
      aria-label="Interview Audio Learning Player"
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        width: 'min(760px, calc(100vw - 32px))',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-xl), 0 0 35px rgba(139, 92, 246, 0.2)',
        backdropFilter: 'blur(20px)',
        overflow: 'hidden',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Top Header Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface-elevated)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-purple-subtle)',
              color: 'var(--accent-purple)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Headphones size={15} />
          </div>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
            Audio Learning Coach
          </span>
          {currentQuestion && (
            <>
              <Badge variant="purple" size="sm">
                Q#{progressInfo.currentQuestionIndex + 1}
              </Badge>
              <span
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-secondary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {currentQuestion.question}
              </span>
            </>
          )}
        </div>

        {/* Window Controls (Minimize & Close) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          <button
            onClick={onToggleMinimize}
            title="Minimize audio player (M)"
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
            <Minimize2 size={14} />
          </button>
          <button
            onClick={onStop}
            title="Stop & Close Player"
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
      </div>

      {/* Active Section & Live Soundwave Row */}
      <div
        style={{
          padding: '10px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          {/* Animated Soundwave Bars */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              height: '14px',
              flexShrink: 0,
            }}
          >
            {[8, 14, 10, 16, 6].map((h, i) => (
              <span
                key={i}
                style={{
                  width: '3px',
                  height: isPlaying ? `${h}px` : '4px',
                  borderRadius: '2px',
                  backgroundColor: 'var(--accent-purple)',
                  transition: 'height 0.2s ease',
                  animation: isPlaying ? `soundwave 0.8s ease-in-out infinite alternate ${i * 0.15}s` : 'none',
                }}
              />
            ))}
          </div>

          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-purple-text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {currentSegment?.label || 'Listening'}
          </span>

          <span
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--text-muted)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {currentSegment?.text}
          </span>
        </div>

        <div style={{ fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0, fontFamily: 'var(--font-mono)' }}>
          {progressInfo.currentSegmentIndex + 1} / {progressInfo.totalSegments} segments
        </div>
      </div>

      {/* Progress Track & Elapsed Time with Thumb Slider Option */}
      <div style={{ padding: '8px 18px 4px 18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {(() => {
          const totalSegments = progressInfo.totalSegments;
          const maxSegmentIndex = Math.max(0, totalSegments - 1);
          const activeSegmentIndex = isScrubbing && scrubIndex !== null ? scrubIndex : progressInfo.currentSegmentIndex;
          const displayPercent = maxSegmentIndex > 0 ? (activeSegmentIndex / maxSegmentIndex) * 100 : progressInfo.progressPercent;
          const hasThumbOption = settings.showScrubberThumb !== false;

          return (
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '22px',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                userSelect: 'none',
              }}
              onMouseEnter={() => setIsHoveringTrack(true)}
              onMouseLeave={() => setIsHoveringTrack(false)}
            >
              {/* Background Track Rail */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: isScrubbing || isHoveringTrack ? '6px' : '4px',
                  borderRadius: '999px',
                  backgroundColor: 'var(--bg-subtle)',
                  overflow: 'hidden',
                  transition: 'height 0.15s ease',
                }}
              >
                {/* Active Progress Fill */}
                <div
                  style={{
                    width: `${displayPercent}%`,
                    height: '100%',
                    backgroundColor: 'var(--accent-purple)',
                    borderRadius: '999px',
                    transition: isScrubbing ? 'none' : 'width 0.25s ease',
                  }}
                />
              </div>

              {/* Interactive Thumb Slider Knob */}
              {hasThumbOption && (
                <div
                  style={{
                    position: 'absolute',
                    left: `${displayPercent}%`,
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: isScrubbing ? '16px' : isHoveringTrack ? '14px' : '12px',
                    height: isScrubbing ? '16px' : isHoveringTrack ? '14px' : '12px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    border: '2.5px solid var(--accent-purple)',
                    boxShadow: isScrubbing
                      ? '0 0 12px rgba(139, 92, 246, 0.9), 0 2px 6px rgba(0,0,0,0.3)'
                      : isHoveringTrack
                      ? '0 0 8px rgba(139, 92, 246, 0.6), 0 1px 3px rgba(0,0,0,0.2)'
                      : '0 0 4px rgba(139, 92, 246, 0.3)',
                    transition: isScrubbing ? 'none' : 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                    pointerEvents: 'none',
                    zIndex: 3,
                  }}
                />
              )}

              {/* Floating Tooltip during hover/drag */}
              {(isScrubbing || isHoveringTrack) && totalSegments > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    left: `${displayPercent}%`,
                    transform: 'translateX(-50%)',
                    bottom: '22px',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-xs)',
                    boxShadow: 'var(--shadow-md)',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    animation: 'fadeIn 0.15s ease-out',
                  }}
                >
                  <span style={{ color: 'var(--accent-purple)' }}>
                    #{activeSegmentIndex + 1}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>of {totalSegments}</span>
                </div>
              )}

              {/* Invisible native range slider for accessible keyboard, mouse, and touch drag */}
              <input
                type="range"
                min={0}
                max={maxSegmentIndex}
                value={activeSegmentIndex}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setScrubIndex(val);
                }}
                onMouseDown={() => setIsScrubbing(true)}
                onTouchStart={() => setIsScrubbing(true)}
                onMouseUp={(e) => {
                  setIsScrubbing(false);
                  const val = Number((e.target as HTMLInputElement).value);
                  onSeekToSegment?.(val);
                  setScrubIndex(null);
                }}
                onTouchEnd={(e) => {
                  setIsScrubbing(false);
                  const val = Number((e.target as HTMLInputElement).value);
                  onSeekToSegment?.(val);
                  setScrubIndex(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Home' || e.key === 'End') {
                    setIsScrubbing(true);
                  }
                }}
                onKeyUp={(e) => {
                  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Home' || e.key === 'End') {
                    setIsScrubbing(false);
                    const val = Number((e.target as HTMLInputElement).value);
                    onSeekToSegment?.(val);
                    setScrubIndex(null);
                  }
                }}
                aria-label="Audio scrubber slider"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  margin: 0,
                  cursor: 'pointer',
                  zIndex: 4,
                }}
              />
            </div>
          );
        })()}

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          <span>{formatTime(progressInfo.currentTimeSec)}</span>
          <span>~{formatTime(progressInfo.totalDurationSec)}</span>
        </div>
      </div>

      {/* Main Transport Controls & Toolbars */}
      <div
        style={{
          padding: '6px 18px 14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Left Group: Speed Steppers & Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={() => adjustSpeed(-0.1)}
            disabled={settings.rate <= 0.5}
            title="Decrease speed by 0.1x"
            style={{
              width: '26px',
              height: '26px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: settings.rate <= 0.5 ? 'not-allowed' : 'pointer',
              opacity: settings.rate <= 0.5 ? 0.4 : 1,
            }}
          >
            <Minus size={13} />
          </button>

          <button
            onClick={cycleSpeed}
            title="Click to cycle speed presets (0.75x, 1x, 1.25x, 1.5x, 2x)"
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--text-primary)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {settings.rate.toFixed(2).replace(/\.00$/, '')}×
          </button>

          <button
            onClick={() => adjustSpeed(0.1)}
            disabled={settings.rate >= 2.5}
            title="Increase speed by 0.1x"
            style={{
              width: '26px',
              height: '26px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: settings.rate >= 2.5 ? 'not-allowed' : 'pointer',
              opacity: settings.rate >= 2.5 ? 0.4 : 1,
            }}
          >
            <Plus size={13} />
          </button>
        </div>

        {/* Center Group: Primary Audio Transport */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Prev Question */}
          <button
            onClick={onPrevQuestion}
            title={`Previous Question (${modKey}+←)`}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <SkipBack size={15} />
          </button>

          {/* Seek -10s */}
          <button
            onClick={() => onSeekRelative(-10)}
            title="Rewind previous section (-10s)"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={14} />
          </button>

          {/* Play / Pause Main Button */}
          <button
            onClick={isPlaying ? onPause : onPlay}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-purple)',
              color: '#ffffff',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(139, 92, 246, 0.45)',
              transition: 'transform 0.15s ease',
            }}
          >
            {isPlaying ? <Pause size={22} /> : <Play size={22} style={{ marginLeft: '3px' }} />}
          </button>

          {/* Seek +10s */}
          <button
            onClick={() => onSeekRelative(10)}
            title="Fast-forward next section (+10s)"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <RotateCw size={14} />
          </button>

          {/* Next Question */}
          <button
            onClick={onNextQuestion}
            title={`Next Question (${modKey}+→)`}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <SkipForward size={15} />
          </button>
        </div>

        {/* Right Group: Auto-Follow, Transcript, Settings */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Auto-Follow Toggle */}
          <button
            onClick={onAutoFollowToggle}
            title={settings.autoFollow ? 'Auto-scroll is ON' : 'Auto-scroll is OFF'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 10px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid',
              borderColor: settings.autoFollow ? 'var(--accent-primary)' : 'var(--border-subtle)',
              backgroundColor: settings.autoFollow ? 'var(--accent-primary-subtle)' : 'var(--bg-subtle)',
              color: settings.autoFollow ? 'var(--accent-primary-text)' : 'var(--text-muted)',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Compass size={13} />
            <span>Follow</span>
          </button>

          {/* Transcript Drawer Toggle */}
          <button
            onClick={onToggleTranscript}
            title="Toggle Narration Transcript"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 10px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid',
              borderColor: settings.showTranscript ? 'var(--accent-purple)' : 'var(--border-subtle)',
              backgroundColor: settings.showTranscript ? 'var(--accent-purple-subtle)' : 'var(--bg-subtle)',
              color: settings.showTranscript ? 'var(--accent-purple-text)' : 'var(--text-secondary)',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <FileText size={13} />
            <span>Transcript</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            title="Voice & Audio Settings"
            style={{
              width: '30px',
              height: '30px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Settings size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
