import React from 'react';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  Lightbulb,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import {
  MachineCodingChallenge,
  TestExecutionResult,
  ChallengeSessionConfig,
} from '../../../types/machineCodingChallenge';

export interface ChallengeCompletionModalProps {
  isOpen: boolean;
  challenge: MachineCodingChallenge;
  testResults: TestExecutionResult | null;
  elapsedSeconds: number;
  hintsRevealed: number;
  config: ChallengeSessionConfig;
  hasNextQuestion: boolean;
  onClose: () => void;
  onNextQuestion: () => void;
  onTryAgain: () => void;
  onReviewSolution: () => void;
}

export const ChallengeCompletionModal: React.FC<ChallengeCompletionModalProps> = ({
  isOpen,
  challenge,
  testResults,
  elapsedSeconds,
  hintsRevealed,
  config,
  hasNextQuestion,
  onClose,
  onNextQuestion,
  onTryAgain,
  onReviewSolution,
}) => {
  if (!testResults) return null;

  const passedAll = testResults.passed === testResults.total && testResults.total > 0;

  // Format time
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  // Performance evaluation
  let performanceEvaluation = 'Good';
  if (passedAll) {
    if (elapsedSeconds < 900 && hintsRevealed === 0) performanceEvaluation = 'Exceptional';
    else if (elapsedSeconds < 1500) performanceEvaluation = 'Strong';
    else performanceEvaluation = 'Satisfactory';
  } else {
    performanceEvaluation = 'Needs Improvement';
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={passedAll ? 'Challenge Passed 🎉' : 'Challenge Evaluation'}
      maxWidth="540px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Hero Result Banner */}
        <div
          style={{
            padding: 20,
            borderRadius: 'var(--radius-lg)',
            backgroundColor: passedAll ? 'var(--accent-success-subtle)' : 'var(--accent-danger-subtle)',
            border: `1px solid ${passedAll ? 'var(--accent-success)' : 'var(--accent-danger)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: passedAll ? 'var(--accent-success)' : 'var(--accent-danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              flexShrink: 0,
            }}
          >
            {passedAll ? <Trophy size={24} /> : <XCircle size={24} />}
          </div>

          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: 'var(--text-lg)', fontWeight: 800 }}>
              {passedAll ? 'Successfully Completed!' : 'Test Cases Incomplete'}
            </h3>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              {passedAll
                ? `You passed all ${testResults.total} test cases for "${challenge.title}".`
                : `${testResults.passed} of ${testResults.total} test cases passed. Review failures and try again.`}
            </p>
          </div>
        </div>

        {/* Score & Metrics Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
            padding: 14,
            backgroundColor: 'var(--bg-surface-elevated)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Score</div>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: passedAll ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
              {testResults.passed} / {testResults.total}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Time Taken</div>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--text-primary)' }}>
              {formatTime(elapsedSeconds)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Performance</div>
            <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--accent-primary)', marginTop: 2 }}>
              {performanceEvaluation}
            </div>
          </div>
        </div>

        {/* Concepts Practiced */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
            Core Concepts Practiced
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {challenge.tags.map((tag) => (
              <Badge key={tag} variant="default" size="sm">
                • {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          <Button size="sm" variant="ghost" icon={<BookOpen size={14} />} onClick={onReviewSolution}>
            Review Solution
          </Button>

          <div style={{ display: 'flex', gap: 8 }}>
            <Button size="sm" variant="outline" icon={<RotateCcw size={14} />} onClick={onTryAgain}>
              Try Again
            </Button>
            {hasNextQuestion ? (
              <Button size="sm" variant="primary" iconRight={<ArrowRight size={14} />} onClick={onNextQuestion}>
                Next Challenge
              </Button>
            ) : (
              <Button size="sm" variant="primary" onClick={onClose}>
                Finish Session
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
