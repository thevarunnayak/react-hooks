import React, { useState } from 'react';
import { Copy, Check, BookOpen, Lightbulb, CheckCircle2, AlertCircle } from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { MachineCodingChallenge } from '../../../types/machineCodingChallenge';

export interface ChallengeSolutionModalProps {
  isOpen: boolean;
  challenge: MachineCodingChallenge;
  onClose: () => void;
}

export const ChallengeSolutionModal: React.FC<ChallengeSolutionModalProps> = ({
  isOpen,
  challenge,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(challenge.solutionCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Reference Solution: ${challenge.title}`}
      maxWidth="760px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '70vh', overflowY: 'auto' }}>
        {/* Solution Code Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
              Production React 19 Implementation
            </span>
            <Badge variant="cyan" size="sm">
              {challenge.solutionCode.split('\n').length} lines
            </Badge>
          </div>

          <Button
            size="xs"
            variant="outline"
            icon={copied ? <Check size={12} /> : <Copy size={12} />}
            onClick={handleCopy}
          >
            {copied ? 'Copied' : 'Copy Solution'}
          </Button>
        </div>

        {/* Code Block */}
        <pre
          style={{
            margin: 0,
            padding: 16,
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-code)',
            border: '1px solid var(--border-subtle)',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            lineHeight: 1.55,
            overflowX: 'auto',
            color: 'var(--text-code, #e2e8f0)',
          }}
        >
          <code>{challenge.solutionCode}</code>
        </pre>

        {/* Interview Notes & Discussion Points */}
        {challenge.interviewNotes && (
          <div
            style={{
              padding: 14,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 'var(--text-xs)', color: 'var(--accent-primary)', marginBottom: 6 }}>
              <Lightbulb size={14} />
              <span>Interview Discussion Points</span>
            </div>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {challenge.interviewNotes}
            </p>
          </div>
        )}

        {/* Evaluation Rules */}
        {challenge.evaluationRules && challenge.evaluationRules.length > 0 && (
          <div>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--accent-success)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={13} />
              <span>Key Evaluation Criteria</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {challenge.evaluationRules.map((rule, i) => (
                <li key={i}>{rule}</li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <Button size="sm" variant="primary" onClick={onClose}>
            Close Solution
          </Button>
        </div>
      </div>
    </Modal>
  );
};
