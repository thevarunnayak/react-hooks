import React, { useState, useEffect, useMemo, Component, ErrorInfo, ReactNode } from 'react';
import { Eye, RotateCcw, AlertTriangle, Sparkles } from 'lucide-react';
import { compileReactCode } from '../../../services/challengeSandbox/testRunner';

export interface ChallengePreviewPanelProps {
  userCode: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  resetKey: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class PreviewErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Preview Runtime Error:', error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: 20,
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--accent-danger-subtle)',
            border: '1px solid var(--accent-danger)',
            color: 'var(--accent-danger-text)',
            fontSize: 'var(--text-xs)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, marginBottom: 6 }}>
            <AlertTriangle size={15} />
            <span>Runtime Render Error</span>
          </div>
          <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap' }}>
            {this.state.error?.message || 'Unknown runtime error occurred during render.'}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export const ChallengePreviewPanel: React.FC<ChallengePreviewPanelProps> = ({ userCode }) => {
  const [mountKey, setMountKey] = useState(0);

  // Compile user code into Component
  const { Component: CompiledComponent, error: compileError } = useMemo(() => {
    return compileReactCode(userCode);
  }, [userCode]);

  const handleRemount = () => {
    setMountKey((k) => k + 1);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}
      className="challenge-preview-panel"
    >
      {/* Top Toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '6px 12px',
          backgroundColor: 'var(--bg-surface-elevated)',
          borderBottom: '1px solid var(--border-subtle)',
          fontSize: '11px',
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Eye size={13} style={{ color: 'var(--accent-primary)' }} />
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Live Interactive Preview</span>
          <span>•</span>
          <span>Fully Interactive Sandbox</span>
        </div>

        <button
          onClick={handleRemount}
          title="Re-mount component"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '11px',
            cursor: 'pointer',
            padding: '2px 6px',
          }}
        >
          <RotateCcw size={12} />
          <span>Remount</span>
        </button>
      </div>

      {/* Preview Surface */}
      <div
        style={{
          flex: 1,
          padding: 20,
          overflowY: 'auto',
          backgroundColor: 'var(--bg-surface)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {compileError ? (
          <div
            style={{
              padding: 16,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-warning-subtle)',
              border: '1px solid var(--accent-warning)',
              color: 'var(--accent-warning-text)',
              fontSize: 'var(--text-xs)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, marginBottom: 6 }}>
              <AlertTriangle size={15} />
              <span>Compilation Error</span>
            </div>
            <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap' }}>
              {compileError}
            </pre>
          </div>
        ) : CompiledComponent ? (
          <PreviewErrorBoundary resetKey={`${userCode}-${mountKey}`}>
            <CompiledComponent key={mountKey} />
          </PreviewErrorBoundary>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center',
              padding: 24,
              color: 'var(--text-muted)',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                color: 'var(--accent-primary)',
              }}
            >
              <Sparkles size={22} />
            </div>
            <div style={{ fontWeight: 600, fontSize: 'var(--text-base)', color: 'var(--text-primary)', marginBottom: 6 }}>
              In-Memory / Backend Challenge
            </div>
            <p style={{ maxWidth: 360, fontSize: 'var(--text-xs)', lineHeight: 1.6, margin: '0 0 16px 0', color: 'var(--text-secondary)' }}>
              This challenge evaluates in-memory algorithms, data structures, or asynchronous queues directly in the browser sandbox. No DOM UI is rendered.
            </p>
            <div
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                fontSize: '11px',
                color: 'var(--text-muted)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>Press <kbd style={{ padding: '2px 5px', borderRadius: 4, background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>⌘↵</kbd> or click <strong>Run Tests</strong> to test</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
