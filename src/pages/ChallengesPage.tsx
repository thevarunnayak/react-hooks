import React, { useState } from 'react';
import { CHALLENGES_LIST } from '../data/challenges';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { CheckCircle2, XCircle, HelpCircle, ArrowRight, RotateCcw } from 'lucide-react';

export const ChallengesPage: React.FC = () => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});

  const handleSelectOption = (challengeId: string, optionIdx: number) => {
    if (submitted[challengeId]) return;
    setSelectedAnswers((prev) => ({ ...prev, [challengeId]: optionIdx }));
  };

  const handleSubmitAnswer = (challengeId: string) => {
    setSubmitted((prev) => ({ ...prev, [challengeId]: true }));
  };

  const handleResetChallenge = (challengeId: string) => {
    setSelectedAnswers((prev) => {
      const copy = { ...prev };
      delete copy[challengeId];
      return copy;
    });
    setSubmitted((prev) => {
      const copy = { ...prev };
      delete copy[challengeId];
      return copy;
    });
  };

  return (
    <div
      style={{
        padding: 'var(--space-6) var(--space-8)',
        maxWidth: '920px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
      }}
      className="challenges-page"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={20} style={{ color: 'var(--accent-success)' }} />
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)' }}>
            Interactive React Hooks Challenges
          </h1>
        </div>
        <p style={{ fontSize: 'var(--text-md)', color: 'var(--text-secondary)' }}>
          Test your understanding of render snapshots, closure traps, effect dependencies, and optimization hooks.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {CHALLENGES_LIST.map((challenge, qIdx) => {
          const userAnswer = selectedAnswers[challenge.id];
          const isSubmitted = submitted[challenge.id];
          const isCorrect = isSubmitted && userAnswer === challenge.correctOptionIndex;

          return (
            <Card key={challenge.id} variant="elevated" padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--accent-primary-text)' }}>
                    #{qIdx + 1}
                  </span>
                  <Badge variant="purple">{challenge.type.replace('_', ' ').toUpperCase()}</Badge>
                  <Badge variant="default">{challenge.difficulty}</Badge>
                </div>
                <Badge variant="cyan">{challenge.category}</Badge>
              </div>

              <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text-primary)' }}>
                {challenge.question}
              </h3>

              {challenge.codeSnippet && (
                <pre
                  style={{
                    padding: '12px',
                    backgroundColor: 'var(--bg-code)',
                    borderRadius: 'var(--radius-md)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    lineHeight: 1.5,
                    overflowX: 'auto',
                    color: 'var(--text-primary)',
                  }}
                >
                  <code>{challenge.codeSnippet}</code>
                </pre>
              )}

              {/* Options */}
              {challenge.options && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {challenge.options.map((option, optIdx) => {
                    const isSelected = userAnswer === optIdx;
                    let bgColor = 'var(--bg-surface-elevated)';
                    let borderColor = 'var(--border-default)';

                    if (isSubmitted) {
                      if (optIdx === challenge.correctOptionIndex) {
                        bgColor = 'var(--accent-success-subtle)';
                        borderColor = 'var(--accent-success)';
                      } else if (isSelected && !isCorrect) {
                        bgColor = 'var(--accent-danger-subtle)';
                        borderColor = 'var(--accent-danger)';
                      }
                    } else if (isSelected) {
                      borderColor = 'var(--accent-primary)';
                      bgColor = 'var(--accent-primary-subtle)';
                    }

                    return (
                      <div
                        key={optIdx}
                        onClick={() => handleSelectOption(challenge.id, optIdx)}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: bgColor,
                          border: `1px solid ${borderColor}`,
                          cursor: isSubmitted ? 'default' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--text-primary)',
                          transition: 'all var(--transition-fast)',
                        }}
                      >
                        <span
                          style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            border: `2px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-strong)'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {isSelected && <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)' }} />}
                        </span>
                        <span>{option}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Submit / Reset Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <HelpCircle size={12} style={{ color: 'var(--accent-primary)' }} />
                  <span>Hint: {challenge.hint}</span>
                </span>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {!isSubmitted ? (
                    <Button
                      size="xs"
                      variant="primary"
                      disabled={userAnswer === undefined}
                      onClick={() => handleSubmitAnswer(challenge.id)}
                    >
                      Submit Answer
                    </Button>
                  ) : (
                    <Button
                      size="xs"
                      variant="ghost"
                      icon={<RotateCcw size={12} />}
                      onClick={() => handleResetChallenge(challenge.id)}
                    >
                      Try Again
                    </Button>
                  )}
                </div>
              </div>

              {/* Explanation Output */}
              {isSubmitted && (
                <div
                  style={{
                    padding: 'var(--space-3) var(--space-4)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isCorrect ? 'var(--accent-success-subtle)' : 'var(--accent-danger-subtle)',
                    border: isCorrect ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(244, 63, 94, 0.3)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-primary)',
                    lineHeight: 1.5,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    animation: 'fadeIn 200ms ease-out',
                  }}
                >
                  {isCorrect ? (
                    <CheckCircle2 size={16} style={{ color: 'var(--accent-success)', flexShrink: 0, marginTop: '2px' }} />
                  ) : (
                    <XCircle size={16} style={{ color: 'var(--accent-danger)', flexShrink: 0, marginTop: '2px' }} />
                  )}
                  <div>
                    <strong>{isCorrect ? 'Correct! ' : 'Incorrect. '}</strong>
                    {challenge.explanation}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
