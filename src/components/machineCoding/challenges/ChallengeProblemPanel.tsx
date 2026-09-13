import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ShieldAlert,
  FileText,
  ChevronDown,
  ChevronRight,
  Info,
  Sparkles,
  PanelLeftClose,
} from 'lucide-react';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { MachineCodingChallenge } from '../../../types/machineCodingChallenge';

export interface ChallengeProblemPanelProps {
  challenge: MachineCodingChallenge;
  hintsRevealed: number;
  onRevealHint: () => void;
  isInterviewMode?: boolean;
  onCollapse?: () => void;
}

export const ChallengeProblemPanel: React.FC<ChallengeProblemPanelProps> = ({
  challenge,
  hintsRevealed,
  onRevealHint,
  isInterviewMode = false,
  onCollapse,
}) => {
  const [showEdgeCases, setShowEdgeCases] = useState(true);
  const [showConstraints, setShowConstraints] = useState(true);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        height: '100%',
        overflowY: 'auto',
        padding: '16px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        boxSizing: 'border-box',
      }}
      className="challenge-problem-panel"
    >
      {/* Title & Tags */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {challenge.tags.map((tag) => (
              <Badge key={tag} variant="default" size="sm">
                {tag}
              </Badge>
            ))}
          </div>
          {onCollapse && (
            <button
              onClick={onCollapse}
              title="Collapse Problem Panel (⌘B)"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: 'var(--radius-xs)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PanelLeftClose size={15} />
            </button>
          )}
        </div>
        <h2
          style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 800,
            color: 'var(--text-primary)',
            margin: '0 0 8px 0',
            letterSpacing: '-0.015em',
          }}
        >
          {challenge.title}
        </h2>
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {challenge.description}
        </p>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: 0 }} />

      {/* Functional Requirements */}
      <div>
        <h3
          style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--accent-primary)',
            margin: '0 0 8px 0',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <CheckCircle2 size={13} />
          <span>Functional Requirements</span>
        </h3>
        <ul
          style={{
            margin: 0,
            paddingLeft: 18,
            fontSize: 'var(--text-xs)',
            color: 'var(--text-secondary)',
            lineHeight: 1.65,
          }}
        >
          {challenge.functionalRequirements.map((req, i) => (
            <li key={i}>{req}</li>
          ))}
        </ul>
      </div>

      {/* UI & Interaction Requirements */}
      {challenge.UIRequirements && challenge.UIRequirements.length > 0 && (
        <div>
          <h3
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--accent-success)',
              margin: '0 0 8px 0',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <FileText size={13} />
            <span>UI & Test Contract</span>
          </h3>
          <ul
            style={{
              margin: 0,
              paddingLeft: 18,
              fontSize: 'var(--text-xs)',
              color: 'var(--text-secondary)',
              lineHeight: 1.65,
            }}
          >
            {challenge.UIRequirements.map((req, i) => (
              <li key={i}>{req}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Collapsible Constraints */}
      <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        <button
          onClick={() => setShowConstraints((c) => !c)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            background: 'var(--bg-surface-elevated)',
            border: 'none',
            color: 'var(--text-primary)',
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldAlert size={13} style={{ color: 'var(--accent-warning)' }} />
            <span>Constraints</span>
          </span>
          {showConstraints ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {showConstraints && (
          <ul
            style={{
              margin: 0,
              padding: '10px 16px 10px 30px',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              backgroundColor: 'var(--bg-surface)',
            }}
          >
            {challenge.constraints.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Collapsible Edge Cases */}
      <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        <button
          onClick={() => setShowEdgeCases((e) => !e)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            background: 'var(--bg-surface-elevated)',
            border: 'none',
            color: 'var(--text-primary)',
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertTriangle size={13} style={{ color: 'var(--accent-warning)' }} />
            <span>Important Edge Cases</span>
          </span>
          {showEdgeCases ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {showEdgeCases && (
          <ul
            style={{
              margin: 0,
              padding: '10px 16px 10px 30px',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              backgroundColor: 'var(--bg-surface)',
            }}
          >
            {challenge.edgeCases.map((ec, i) => (
              <li key={i}>{ec}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Progressive Hints Section */}
      <div
        style={{
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '12px',
          backgroundColor: 'var(--bg-surface-elevated)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--accent-warning)' }}>
            <Lightbulb size={14} />
            <span>Progressive Hints ({hintsRevealed} / {challenge.hints.length})</span>
          </div>

          {hintsRevealed < challenge.hints.length && (
            <Button size="xs" variant="outline" onClick={onRevealHint}>
              Unlock Hint {hintsRevealed + 1}
            </Button>
          )}
        </div>

        {hintsRevealed === 0 ? (
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Hints are collapsed. {isInterviewMode ? 'Revealing hints reduces score by 5% in interview mode.' : 'Click unlock whenever you get stuck.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
            {challenge.hints.slice(0, hintsRevealed).map((h, i) => (
              <div
                key={i}
                style={{
                  padding: '8px 10px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-primary)',
                  lineHeight: 1.5,
                }}
              >
                <strong style={{ color: 'var(--accent-primary)' }}>Hint {i + 1}:</strong> {h}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
