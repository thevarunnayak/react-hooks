import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ChallengeItem } from '../../types/challenge';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge, BadgeProps } from '../ui/Badge';
import { usePopupAlert } from '../../hooks/usePopupAlert';
import { CustomPopupAlert } from '../ui/CustomPopupAlert';
import {
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  Award,
  Zap,
  Check,
  Flame,
  HelpCircle,
} from 'lucide-react';

interface ChallengeSessionViewProps {
  challenges: ChallengeItem[];
  timeLimitMinutes: number;
  onExit: () => void;
  onRetake: () => void;
}

const DIFFICULTY_BADGE_VARIANTS: Record<string, BadgeProps['variant']> = {
  Beginner: 'default',
  Intermediate: 'cyan',
  Advanced: 'purple',
  Expert: 'danger',
};

export const ChallengeSessionView: React.FC<ChallengeSessionViewProps> = ({
  challenges,
  timeLimitMinutes,
  onExit,
  onRetake,
}) => {
  const { popupState, showConfirm, closePopup } = usePopupAlert();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(timeLimitMinutes * 60);
  const [totalSecondsSpent, setTotalSecondsSpent] = useState(0);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (isSubmitted) return;

    const interval = setInterval(() => {
      setTotalSecondsSpent((prev) => prev + 1);

      if (timeLimitMinutes > 0) {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsSubmitted(true);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLimitMinutes, isSubmitted]);

  const activeChallenge = challenges[currentIndex];
  const autoAdvanceTimerRef = useRef<number | null>(null);

  // Clear any pending auto-advance timer on unmount or question jump
  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) {
        window.clearTimeout(autoAdvanceTimerRef.current);
      }
    };
  }, [currentIndex]);

  const handleManualJump = (idx: number) => {
    if (autoAdvanceTimerRef.current) {
      window.clearTimeout(autoAdvanceTimerRef.current);
    }
    setCurrentIndex(idx);
  };

  const handleSelectOption = (optionIndex: number) => {
    if (isSubmitted) return;
    setAnswers((prev) => ({
      ...prev,
      [activeChallenge.id]: optionIndex,
    }));

    // Auto-advance to the next question with a smooth 320ms tactile delay
    // If user wants to change their answer, they can easily come back via Question Jumper Tiles or Previous button
    if (autoAdvanceTimerRef.current) {
      window.clearTimeout(autoAdvanceTimerRef.current);
    }
    if (currentIndex < challenges.length - 1) {
      autoAdvanceTimerRef.current = window.setTimeout(() => {
        setCurrentIndex((prev) => Math.min(challenges.length - 1, prev + 1));
      }, 320);
    }
  };

  const handleConfirmSubmit = () => {
    const unansweredCount = challenges.filter((c) => answers[c.id] === undefined).length;
    if (unansweredCount > 0) {
      showConfirm({
        title: 'Unanswered Questions',
        message: `You have ${unansweredCount} unanswered question${unansweredCount > 1 ? 's' : ''}. Are you sure you want to finish and submit your challenge?`,
        type: 'warning',
        confirmText: 'Submit Anyway',
        cancelText: 'Keep Answering',
        onConfirm: () => {
          setIsSubmitted(true);
        },
      });
      return;
    }
    setIsSubmitted(true);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Score computation
  const scoreResults = useMemo(() => {
    let correct = 0;
    challenges.forEach((ch) => {
      if (answers[ch.id] !== undefined && answers[ch.id] === ch.correctOptionIndex) {
        correct++;
      }
    });
    const total = challenges.length;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    const answeredCount = Object.keys(answers).length;

    let badgeText = 'React Explorer';
    let badgeColor = 'var(--text-muted)';
    if (percentage >= 90) {
      badgeText = '🏆 Senior React Architect';
      badgeColor = 'var(--accent-purple)';
    } else if (percentage >= 75) {
      badgeText = '🌟 Advanced React Engineer';
      badgeColor = 'var(--accent-primary)';
    } else if (percentage >= 50) {
      badgeText = '⚡ Competent React Developer';
      badgeColor = 'var(--accent-cyan)';
    } else {
      badgeText = '🌱 React Learner';
      badgeColor = 'var(--accent-warning)';
    }

    return {
      correct,
      total,
      percentage,
      answeredCount,
      badgeText,
      badgeColor,
    };
  }, [challenges, answers]);

  // If test is submitted, render Result Feedback Screen
  if (isSubmitted) {
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
        {/* Top Summary Card */}
        <Card
          variant="elevated"
          padding="lg"
          style={{
            textAlign: 'center',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-xl)',
            padding: isMobile ? 'var(--space-6) var(--space-4)' : 'var(--space-8) var(--space-6)',
          }}
        >
          <div
            style={{
              width: isMobile ? '48px' : '56px',
              height: isMobile ? '48px' : '56px',
              borderRadius: '50%',
              backgroundColor: scoreResults.percentage >= 70 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(234, 179, 8, 0.15)',
              color: scoreResults.percentage >= 70 ? 'var(--accent-success)' : 'var(--accent-warning)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px auto',
            }}
          >
            {scoreResults.percentage >= 70 ? <Award size={isMobile ? 26 : 32} /> : <Flame size={isMobile ? 26 : 32} />}
          </div>

          <span
            style={{
              display: 'inline-block',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-subtle)',
              color: scoreResults.badgeColor,
              marginBottom: '10px',
            }}
          >
            {scoreResults.badgeText}
          </span>

          <h2 style={{ fontSize: 'clamp(var(--text-xl), 4vw, var(--text-2xl))', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
            Challenge Completed!
          </h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: '0 0 20px 0' }}>
            You scored {scoreResults.correct} out of {scoreResults.total} ({scoreResults.percentage}%)
          </p>

          {/* Quick Metrics Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: isMobile ? '6px' : '12px',
              maxWidth: '650px',
              margin: '0 auto 20px auto',
              width: '100%',
            }}
          >
            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: isMobile ? '8px 4px' : '12px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: isMobile ? '10px' : '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Score</div>
              <div style={{ fontSize: isMobile ? 'var(--text-base)' : 'var(--text-xl)', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '4px' }}>
                {scoreResults.percentage}%
              </div>
            </div>
            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: isMobile ? '8px 4px' : '12px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: isMobile ? '10px' : '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Accuracy</div>
              <div style={{ fontSize: isMobile ? 'var(--text-base)' : 'var(--text-xl)', fontWeight: 800, color: 'var(--accent-success)', marginTop: '4px' }}>
                {scoreResults.correct} / {scoreResults.total}
              </div>
            </div>
            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: isMobile ? '8px 4px' : '12px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: isMobile ? '10px' : '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Time Spent</div>
              <div style={{ fontSize: isMobile ? 'var(--text-base)' : 'var(--text-xl)', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                {formatTime(totalSecondsSpent)}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', width: '100%' }}>
            <Button
              variant="secondary"
              icon={<RotateCcw size={14} />}
              onClick={onRetake}
              style={{ flex: isMobile ? '1 1 100%' : 'initial' }}
            >
              Retake Challenge
            </Button>
            <Button
              variant="primary"
              icon={<ArrowLeft size={14} />}
              onClick={onExit}
              style={{ flex: isMobile ? '1 1 100%' : 'initial' }}
            >
              Back to Challenges Library
            </Button>
          </div>
        </Card>

        {/* Detailed Question-by-Question Review with Explanations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: 'clamp(var(--text-base), 3.5vw, var(--text-lg))', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HelpCircle size={18} style={{ color: 'var(--accent-purple)', flexShrink: 0 }} />
            <span>Detailed Question Review & Explanations</span>
          </h3>

          {challenges.map((ch, idx) => {
            const userPick = answers[ch.id];
            const isCorrect = userPick !== undefined && userPick === ch.correctOptionIndex;
            const wasAnswered = userPick !== undefined;

            return (
              <Card
                key={ch.id}
                variant="glass"
                padding="md"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  borderLeft: `4px solid ${isCorrect ? 'var(--accent-success)' : 'var(--accent-danger)'}`,
                  padding: isMobile ? 'var(--space-3)' : 'var(--space-4)',
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: isCorrect ? 'var(--accent-success-subtle)' : 'var(--accent-danger-subtle)',
                        color: isCorrect ? 'var(--accent-success-text)' : 'var(--accent-danger-text)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {isCorrect ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      Question {idx + 1} {isCorrect ? '(Correct)' : wasAnswered ? '(Incorrect)' : '(Skipped)'}
                    </span>
                    <Badge variant={DIFFICULTY_BADGE_VARIANTS[ch.difficulty] || 'default'} size="sm">
                      {ch.difficulty}
                    </Badge>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{ch.category}</span>
                  </div>
                </div>

                {/* Question */}
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {ch.question}
                </div>

                {/* Code block if present */}
                {ch.codeSnippet && (
                  <pre
                    style={{
                      margin: 0,
                      padding: isMobile ? '10px 12px' : '12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-code)',
                      border: '1px solid var(--border-subtle)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      lineHeight: 1.5,
                      overflowX: 'auto',
                      WebkitOverflowScrolling: 'touch',
                      maxWidth: '100%',
                      color: 'var(--text-code)',
                    }}
                  >
                    <code>{ch.codeSnippet}</code>
                  </pre>
                )}

                {/* Options Review */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {(ch.options || []).map((opt, optIdx) => {
                    const isUserChoice = userPick === optIdx;
                    const isRightAnswer = ch.correctOptionIndex === optIdx;

                    let bg = 'var(--bg-subtle)';
                    let borderColor = 'var(--border-subtle)';
                    let color = 'var(--text-secondary)';

                    if (isRightAnswer) {
                      bg = 'rgba(16, 185, 129, 0.12)';
                      borderColor = 'rgba(16, 185, 129, 0.4)';
                      color = 'var(--text-primary)';
                    } else if (isUserChoice && !isRightAnswer) {
                      bg = 'rgba(244, 63, 94, 0.12)';
                      borderColor = 'rgba(244, 63, 94, 0.4)';
                      color = 'var(--text-primary)';
                    }

                    return (
                      <div
                        key={optIdx}
                        style={{
                          padding: isMobile ? '8px 10px' : '8px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: `1px solid ${borderColor}`,
                          backgroundColor: bg,
                          color: color,
                          fontSize: 'var(--text-xs)',
                          display: 'flex',
                          flexDirection: isMobile ? 'column' : 'row',
                          alignItems: isMobile ? 'flex-start' : 'center',
                          justifyContent: 'space-between',
                          gap: isMobile ? '6px' : '8px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              backgroundColor: isRightAnswer
                                ? 'var(--accent-success)'
                                : isUserChoice
                                ? 'var(--accent-danger)'
                                : 'var(--border-subtle)',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '10px',
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span style={{ lineHeight: 1.45, wordBreak: 'break-word' }}>{opt}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, alignSelf: isMobile ? 'flex-end' : 'center' }}>
                          {isRightAnswer && (
                            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent-success)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <Check size={11} /> Correct Answer
                            </span>
                          )}
                          {isUserChoice && !isRightAnswer && (
                            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent-danger)' }}>
                              Your Answer
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Box */}
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '11px',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.55,
                  }}
                >
                  <strong style={{ color: 'var(--accent-purple)' }}>Explanation: </strong>
                  <span>{ch.explanation}</span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Active Exam Phase
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
      {/* Top Test Control Bar */}
      <Card
        variant="elevated"
        padding="md"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: isMobile ? '10px 12px' : 'var(--space-4)',
        }}
      >
        {/* Left: Question counter & Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(234, 179, 8, 0.15)',
              color: '#eab308',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Zap size={15} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
              Q {currentIndex + 1} of {challenges.length}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              {Object.keys(answers).length} answered
            </div>
          </div>
        </div>

        {/* Center: Countdown Timer (if timed) */}
        {timeLimitMinutes > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: isMobile ? '4px 10px' : '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: secondsRemaining < 60 ? 'rgba(244, 63, 94, 0.15)' : 'var(--bg-subtle)',
              border: `1px solid ${secondsRemaining < 60 ? 'rgba(244, 63, 94, 0.4)' : 'var(--border-subtle)'}`,
              color: secondsRemaining < 60 ? 'var(--accent-danger)' : 'var(--text-primary)',
              fontWeight: 700,
              fontSize: isMobile ? 'var(--text-xs)' : 'var(--text-sm)',
              letterSpacing: '0.04em',
              flexShrink: 0,
            }}
          >
            <Clock size={14} style={{ animation: secondsRemaining < 60 ? 'pulse 1s infinite' : 'none' }} />
            <span>{formatTime(secondsRemaining)}</span>
          </div>
        )}

        {/* Right: Submit or Exit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <Button
            size="xs"
            variant="ghost"
            onClick={() => {
              showConfirm({
                title: 'Exit Challenge Test',
                message: 'Are you sure you want to exit? Your challenge test progress will not be saved.',
                type: 'danger',
                confirmText: 'Exit Test',
                cancelText: 'Continue Test',
                onConfirm: () => {
                  onExit();
                },
              });
            }}
          >
            {isMobile ? 'Exit' : 'Exit Test'}
          </Button>
          <Button size="xs" variant="primary" onClick={handleConfirmSubmit}>
            {isMobile ? 'Finish' : 'Finish & Submit'}
          </Button>
        </div>
      </Card>

      {/* Question Jumper Bar */}
      <div
        className="no-scrollbar"
        style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: '4px 2px',
          width: '100%',
        }}
      >
        {challenges.map((c, idx) => {
          const isAnswered = answers[c.id] !== undefined;
          const isCurrent = idx === currentIndex;

          return (
            <button
              key={c.id}
              type="button"
              onClick={() => handleManualJump(idx)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '11px',
                fontWeight: isCurrent ? 800 : 600,
                border: isCurrent ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                backgroundColor: isAnswered
                  ? isCurrent
                    ? 'var(--accent-primary)'
                    : 'var(--accent-purple-subtle)'
                  : isCurrent
                  ? 'var(--bg-surface-elevated)'
                  : 'var(--bg-subtle)',
                color: isAnswered && isCurrent ? '#fff' : isAnswered ? 'var(--accent-purple-text)' : 'var(--text-muted)',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all var(--transition-fast)',
              }}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Active Question Card */}
      <Card
        variant="elevated"
        padding="lg"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: isMobile ? 'var(--space-4)' : 'var(--space-6)',
        }}
      >
        {/* Meta badges */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                color: 'var(--accent-primary)',
                backgroundColor: 'var(--accent-primary-subtle)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              Question {currentIndex + 1}
            </span>
            <Badge variant={DIFFICULTY_BADGE_VARIANTS[activeChallenge.difficulty] || 'default'} size="sm">
              {activeChallenge.difficulty}
            </Badge>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
            {activeChallenge.category}
          </span>
        </div>

        {/* Question Statement */}
        <div style={{ fontSize: isMobile ? 'var(--text-sm)' : 'var(--text-md)', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.55 }}>
          {activeChallenge.question}
        </div>

        {/* Code Snippet */}
        {activeChallenge.codeSnippet && (
          <pre
            style={{
              margin: 0,
              padding: isMobile ? '10px 12px' : '14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-code)',
              border: '1px solid var(--border-subtle)',
              fontFamily: 'var(--font-mono)',
              fontSize: isMobile ? '11px' : '12px',
              lineHeight: 1.55,
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              maxWidth: '100%',
              color: 'var(--text-code)',
            }}
          >
            <code>{activeChallenge.codeSnippet}</code>
          </pre>
        )}

        {/* Options Selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Select your answer:
          </div>
          {(activeChallenge.options || []).map((option, optIdx) => {
            const isSelected = answers[activeChallenge.id] === optIdx;

            return (
              <button
                key={optIdx}
                type="button"
                onClick={() => handleSelectOption(optIdx)}
                style={{
                  padding: isMobile ? '10px 12px' : '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                  backgroundColor: isSelected ? 'var(--accent-primary-subtle)' : 'var(--bg-subtle)',
                  color: isSelected ? 'var(--accent-primary-text)' : 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '10px' : '12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: isMobile ? 'var(--text-xs)' : 'var(--text-sm)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div
                  style={{
                    width: isMobile ? '20px' : '22px',
                    height: isMobile ? '20px' : '22px',
                    borderRadius: '50%',
                    border: `2px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                    backgroundColor: isSelected ? 'var(--accent-primary)' : 'transparent',
                    color: isSelected ? '#fff' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isMobile ? '10px' : '11px',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {String.fromCharCode(65 + optIdx)}
                </div>
                <span style={{ lineHeight: 1.45, wordBreak: 'break-word' }}>{option}</span>
              </button>
            );
          })}
        </div>

        {/* Navigation Controls */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '14px',
            borderTop: '1px solid var(--border-subtle)',
            marginTop: '6px',
            gap: '8px',
          }}
        >
          <Button
            size="sm"
            variant="secondary"
            disabled={currentIndex === 0}
            icon={<ArrowLeft size={14} />}
            onClick={() => handleManualJump(Math.max(0, currentIndex - 1))}
          >
            {isMobile ? 'Prev' : 'Previous'}
          </Button>

          {currentIndex < challenges.length - 1 ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleManualJump(Math.min(challenges.length - 1, currentIndex + 1))}
            >
              <span>Next</span>
              <ArrowRight size={14} style={{ marginLeft: '4px' }} />
            </Button>
          ) : (
            <Button size="sm" variant="primary" onClick={handleConfirmSubmit}>
              {isMobile ? 'Submit' : 'Submit Challenge'}
            </Button>
          )}
        </div>
      </Card>

      {/* Custom Popup Alert / Confirmation Dialog */}
      <CustomPopupAlert {...popupState} onClose={closePopup} />
    </div>
  );
};
