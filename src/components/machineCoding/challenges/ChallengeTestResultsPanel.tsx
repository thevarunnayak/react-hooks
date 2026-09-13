import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import { Badge } from '../../ui/Badge';
import { TestExecutionResult, SingleTestResult } from '../../../types/machineCodingChallenge';

export interface ChallengeTestResultsPanelProps {
  results: TestExecutionResult | null;
  isRunning: boolean;
  onCollapse?: () => void;
}

export const ChallengeTestResultsPanel: React.FC<ChallengeTestResultsPanelProps> = ({
  results,
  isRunning,
  onCollapse,
}) => {
  const [expandedTestId, setExpandedTestId] = useState<string | null>(null);
  const [showConsole, setShowConsole] = useState(false);

  if (isRunning) {
    return (
      <div
        style={{
          padding: '16px',
          backgroundColor: 'var(--bg-surface)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 'var(--text-xs)',
          color: 'var(--accent-primary)',
          height: '100%',
          boxSizing: 'border-box',
        }}
      >
        <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
        <span style={{ fontWeight: 600 }}>Executing test cases in client-side sandbox...</span>
      </div>
    );
  }

  if (!results) {
    return (
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: 'var(--bg-surface)',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: 'var(--text-xs)',
          color: 'var(--text-muted)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '100%',
          boxSizing: 'border-box',
        }}
      >
        <span>Click "Run Tests" to test public test cases, or "Submit" to run all tests.</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>Shortcuts: ⌘ + Enter</span>
          {onCollapse && (
            <button
              onClick={onCollapse}
              title="Collapse Panel (⌘J)"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '11px',
                padding: '2px 6px',
              }}
            >
              Hide (⌘J)
            </button>
          )}
        </div>
      </div>
    );
  }

  const allPassed = results.passed === results.total && results.total > 0;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-subtle)',
        height: '100%',
        minHeight: 0,
        overflowY: 'auto',
      }}
      className="challenge-test-results-panel"
    >
      {/* Results Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 16px',
          backgroundColor: 'var(--bg-surface-elevated)',
          borderBottom: '1px solid var(--border-subtle)',
          fontSize: 'var(--text-xs)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Test Results</span>
          <Badge variant={allPassed ? 'success' : 'danger'} size="sm">
            {results.passed} / {results.total} Passed
          </Badge>
          <span style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Clock size={11} /> {results.durationMs}ms
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {results.logs.length > 0 && (
            <button
              onClick={() => setShowConsole((c) => !c)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-primary)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Terminal size={12} />
              <span>Console Logs ({results.logs.length})</span>
            </button>
          )}

          {onCollapse && (
            <button
              onClick={onCollapse}
              title="Collapse Panel (⌘J)"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '11px',
                padding: '2px 6px',
              }}
            >
              Hide (⌘J)
            </button>
          )}
        </div>
      </div>

      {/* Compile Error Banner */}
      {results.compileError && (
        <div
          style={{
            padding: '10px 16px',
            backgroundColor: 'var(--accent-danger-subtle)',
            color: 'var(--accent-danger-text)',
            fontSize: 'var(--text-xs)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {results.compileError}
        </div>
      )}

      {/* Test Cases List */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {results.results.map((test) => {
          const isExpanded = expandedTestId === test.testId;
          return (
            <div
              key={test.testId}
              style={{
                borderBottom: '1px solid var(--border-subtle)',
                fontSize: 'var(--text-xs)',
              }}
            >
              <div
                onClick={() => setExpandedTestId(isExpanded ? null : test.testId)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  backgroundColor: isExpanded ? 'var(--bg-surface-elevated)' : 'transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {test.passed ? (
                    <CheckCircle2 size={14} style={{ color: 'var(--accent-success)' }} />
                  ) : (
                    <XCircle size={14} style={{ color: 'var(--accent-danger)' }} />
                  )}
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {test.name}
                  </span>
                  {test.hidden && (
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', backgroundColor: 'var(--bg-surface-elevated)', padding: '1px 5px', borderRadius: 4 }}>
                      Hidden Test
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                    {test.durationMs}ms
                  </span>
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </div>
              </div>

              {/* Expanded Diagnostic Detail */}
              {isExpanded && (
                <div
                  style={{
                    padding: '8px 16px 12px 38px',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <div style={{ color: 'var(--text-secondary)' }}>{test.description}</div>

                  {!test.passed && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                      {test.hidden ? (
                        <div style={{ color: 'var(--accent-warning)', fontStyle: 'italic' }}>
                          Hidden test case failed. Implementation details are kept confidential.
                        </div>
                      ) : (
                        <>
                          {test.expected && (
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-success)' }}>
                              <strong>Expected:</strong> {test.expected}
                            </div>
                          )}
                          {test.received && (
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-danger)' }}>
                              <strong>Received:</strong> {test.received}
                            </div>
                          )}
                          {test.error && (
                            <pre style={{ margin: 0, padding: 8, borderRadius: 4, backgroundColor: 'var(--bg-code)', color: 'var(--accent-danger-text)', fontFamily: 'var(--font-mono)', fontSize: '11px', whiteSpace: 'pre-wrap' }}>
                              {test.error}
                            </pre>
                          )}
                          {test.hint && (
                            <div style={{ fontSize: '11px', color: 'var(--accent-primary)', marginTop: 4 }}>
                              💡 Hint: {test.hint}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Captured Console Drawer */}
      {showConsole && results.logs.length > 0 && (
        <div
          style={{
            backgroundColor: 'var(--bg-code)',
            padding: '10px 16px',
            borderTop: '1px solid var(--border-subtle)',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
          }}
        >
          <div style={{ fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
            Console Output:
          </div>
          {results.logs.map((log, i) => (
            <div
              key={i}
              style={{
                color:
                  log.type === 'error'
                    ? 'var(--accent-danger)'
                    : log.type === 'warn'
                    ? 'var(--accent-warning)'
                    : 'var(--text-secondary)',
                lineHeight: 1.5,
              }}
            >
              [{log.type.toUpperCase()}] {log.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
