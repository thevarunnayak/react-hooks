import React from 'react';
import { INTERVIEW_QUESTIONS_LIST } from '../data/interviews';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Accordion } from '../components/ui/Accordion';
import { HelpCircle, Award, Terminal } from 'lucide-react';

export const InterviewPage: React.FC = () => {
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
      className="interview-page"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award size={20} style={{ color: 'var(--accent-purple)' }} />
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)' }}>
            Senior React Engineer Interview Bank
          </h1>
        </div>
        <p style={{ fontSize: 'var(--text-md)', color: 'var(--text-secondary)' }}>
          In-depth architectural questions testing internal Fiber workings, concurrent transitions, stale closures, and referential memoization.
        </p>
      </div>

      <Accordion
        items={INTERVIEW_QUESTIONS_LIST.map((item) => ({
          id: item.id,
          title: item.question,
          badge: <Badge variant="purple">{item.difficulty}</Badge>,
          subtitle: item.category,
          content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Short Answer: </strong>
                <span>{item.shortAnswer}</span>
              </div>

              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                }}
              >
                <strong style={{ color: 'var(--accent-primary-text)' }}>Deep Dive: </strong>
                <span>{item.deepDive}</span>
              </div>

              {item.commonPitfalls.length > 0 && (
                <div style={{ fontSize: '11px', color: 'var(--accent-danger-text)' }}>
                  <strong>Candidate Pitfall: </strong> {item.commonPitfalls.join(' ')}
                </div>
              )}
            </div>
          ),
        }))}
        allowMultiple
      />
    </div>
  );
};
