import React from 'react';
import {
  Clock,
  Play,
  CheckCircle2,
  RotateCcw,
  Send,
  Pause,
  Layers,
  Code2,
  Eye,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Tooltip } from '../../ui/Tooltip';
import {
  MachineCodingChallenge,
  TestExecutionResult,
  ChallengeSessionConfig,
} from '../../../types/machineCodingChallenge';

export interface ChallengeHeaderProps {
  challenge: MachineCodingChallenge;
  sessionChallenges: MachineCodingChallenge[];
  currentIndex: number;
  config: ChallengeSessionConfig;
  timeRemaining: number;
  elapsedSeconds: number;
  isPaused: boolean;
  isTimed: boolean;
  isRunningTests: boolean;
  isSubmitting: boolean;
  activeView: 'code' | 'preview' | 'split';
  testResults: TestExecutionResult | null;
  onRunTests: () => void;
  onSubmit: () => void;
  onResetCode: () => void;
  onTogglePause: () => void;
  onChangeView: (view: 'code' | 'preview' | 'split') => void;
  onSelectQuestion: (index: number) => void;
  onExit: () => void;
}

export const ChallengeHeader: React.FC<ChallengeHeaderProps> = ({
  challenge,
  sessionChallenges,
  currentIndex,
  config,
  timeRemaining,
  elapsedSeconds,
  isPaused,
  isTimed,
  isRunningTests,
  isSubmitting,
  activeView,
  testResults,
  onRunTests,
  onSubmit,
  onResetCode,
  onTogglePause,
  onChangeView,
  onSelectQuestion,
  onExit,
}) => {
  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const isWarning = isTimed && timeRemaining <= 300 && timeRemaining > 60;
  const isCritical = isTimed && timeRemaining <= 60;

  const timerColor = isCritical
    ? 'var(--accent-danger, #ef4444)'
    : isWarning
    ? 'var(--accent-warning, #f59e0b)'
    : 'var(--text-primary)';

  const difficultyVariant =
    challenge.difficulty === 'Easy'
      ? 'success'
      : challenge.difficulty === 'Medium'
      ? 'cyan'
      : 'purple';

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        gap: 12,
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
      className="challenge-header"
    >
      {/* Left: Exit, Title, Difficulty, and Question Tabs if Set/Random */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <button
          onClick={onExit}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: 'var(--text-xs)',
            cursor: 'pointer',
            padding: '4px 6px',
            borderRadius: 'var(--radius-xs)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          ← Exit Challenge
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h1
            style={{
              fontSize: 'var(--text-base)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            {challenge.title}
          </h1>
          <Badge variant={difficultyVariant as any} size="sm">
            {challenge.difficulty}
          </Badge>
          <Badge variant="default" size="sm">
            {challenge.category}
          </Badge>
          {challenge.track && (
            <Badge variant={challenge.track === 'backend' ? 'purple' : 'primary'} size="sm">
              {challenge.track === 'backend' ? 'Backend' : 'Frontend'}
            </Badge>
          )}
        </div>

        {/* Multi-Question Selector Tabs */}
        {sessionChallenges.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 8 }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Question:</span>
            {sessionChallenges.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => onSelectQuestion(idx)}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 'var(--radius-xs)',
                  border:
                    idx === currentIndex
                      ? '1px solid var(--accent-primary)'
                      : '1px solid var(--border-subtle)',
                  background:
                    idx === currentIndex
                      ? 'var(--accent-primary-subtle)'
                      : 'var(--bg-surface-elevated)',
                  color:
                    idx === currentIndex
                      ? 'var(--accent-primary-text)'
                      : 'var(--text-secondary)',
                  fontSize: '11px',
                  fontWeight: idx === currentIndex ? 700 : 500,
                  cursor: 'pointer',
                }}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Center: Timer & Mode indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            backgroundColor: 'var(--bg-surface-elevated)',
            borderRadius: 'var(--radius-full)',
            border: `1px solid ${isCritical ? 'var(--accent-danger)' : 'var(--border-subtle)'}`,
            color: timerColor,
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-sm)',
            fontWeight: 700,
          }}
        >
          <Clock size={14} />
          <span>{formatTime(isTimed ? timeRemaining : elapsedSeconds)}</span>
          {!isTimed && (
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Unlimited
            </span>
          )}
          {isTimed && isWarning && !isCritical && (
            <span style={{ fontSize: '10px', textTransform: 'uppercase' }}>Warning</span>
          )}
          {isTimed && isCritical && (
            <span style={{ fontSize: '10px', textTransform: 'uppercase', animation: 'pulse 1s infinite' }}>
              Final Minute
            </span>
          )}
        </div>

        {/* Pause Button in Practice Mode */}
        {config.mode === 'practice' && config.allowPause && isTimed && (
          <Button
            size="xs"
            variant="ghost"
            icon={isPaused ? <Play size={12} /> : <Pause size={12} />}
            onClick={onTogglePause}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
        )}

        {/* Practice vs Interview Pill */}
        <Badge variant={config.mode === 'interview' ? 'purple' : 'default'} size="sm">
          {config.mode === 'interview' ? 'Strict Interview' : 'Practice Mode'}
        </Badge>
      </div>

      {/* Right: View Toggles & Actions (Run Tests, Submit, Reset) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Editor vs Preview View Toggles */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--bg-surface-elevated)',
            padding: 2,
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <button
            onClick={() => onChangeView('code')}
            title="Code Editor"
            style={{
              padding: '4px 8px',
              border: 'none',
              background: activeView === 'code' ? 'var(--bg-surface)' : 'none',
              color: activeView === 'code' ? 'var(--text-primary)' : 'var(--text-muted)',
              borderRadius: 'var(--radius-xs)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '11px',
              fontWeight: 600,
            }}
          >
            <Code2 size={13} />
            <span>Code</span>
          </button>
          <button
            onClick={() => onChangeView('split')}
            title="Split Editor & Preview"
            style={{
              padding: '4px 8px',
              border: 'none',
              background: activeView === 'split' ? 'var(--bg-surface)' : 'none',
              color: activeView === 'split' ? 'var(--text-primary)' : 'var(--text-muted)',
              borderRadius: 'var(--radius-xs)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '11px',
              fontWeight: 600,
            }}
          >
            <Layers size={13} />
            <span>Split</span>
          </button>
          <button
            onClick={() => onChangeView('preview')}
            title="Live Preview"
            style={{
              padding: '4px 8px',
              border: 'none',
              background: activeView === 'preview' ? 'var(--bg-surface)' : 'none',
              color: activeView === 'preview' ? 'var(--text-primary)' : 'var(--text-muted)',
              borderRadius: 'var(--radius-xs)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '11px',
              fontWeight: 600,
            }}
          >
            <Eye size={13} />
            <span>Preview</span>
          </button>
        </div>

        {/* Reset Code button */}
        <Tooltip content="Reset to starter code" placement="bottom">
          <Button
            size="xs"
            variant="ghost"
            icon={<RotateCcw size={12} />}
            onClick={onResetCode}
          >
            Reset
          </Button>
        </Tooltip>

        {/* Run Tests (Public tests) */}
        <Tooltip content="Run public tests (⌘ + Enter)" placement="bottom">
          <Button
            size="xs"
            variant="outline"
            icon={<Play size={12} />}
            isLoading={isRunningTests}
            onClick={onRunTests}
            style={{ fontWeight: 600 }}
          >
            Run Tests
          </Button>
        </Tooltip>

        {/* Submit Challenge (Runs all public + hidden tests) */}
        <Tooltip content="Submit and evaluate all tests (⌘ + ⇧ + Enter)" placement="bottom">
          <Button
            size="xs"
            variant="primary"
            icon={<Send size={12} />}
            isLoading={isSubmitting}
            onClick={onSubmit}
            style={{ fontWeight: 700 }}
          >
            Submit
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};
